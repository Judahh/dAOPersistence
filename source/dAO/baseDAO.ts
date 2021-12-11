/* eslint-disable no-unused-vars */
import {
  IInput,
  IInputCreate,
  IInputDelete,
  IInputRead,
  IInputUpdate,
  IOutput,
} from 'flexiblepersistence';
import { IDAOSimple, IDAO, BaseDAODefault } from '..';

export default abstract class BaseDAO extends BaseDAODefault {
  protected insert?: string;
  protected insertValues?: string;
  protected beforeInsert = '';

  existent(
    input: IInputCreate<IDAOSimple>
  ): Promise<IOutput<IDAOSimple, IDAO>> {
    this.options = input.eventOptions;
    return this.create(input);
  }
  create(input: IInputCreate<IDAOSimple>): Promise<IOutput<IDAOSimple, IDAO>> {
    this.options = input.eventOptions;
    return Array.isArray(input.item)
      ? this.makePromise(input as IInput<IDAOSimple>, 'createArray')
      : this.makePromise(input as IInput<IDAOSimple>, 'createSingle');
  }

  protected async generateInsertPreGenerateFields(
    _content?: IDAOSimple,
    _values?,
    _tableName?: string
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<void> {}

  protected async generateInsertPostGenerateFields(
    _content?: IDAOSimple,
    _values?,
    _tableName?: string,
    _fields?: string[]
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<void> {}

  protected async generateInsert(
    content: IDAOSimple,
    values?,
    tableName?: string,
    startValue = 1,
    useTable?: boolean,
    useAlias?: boolean,
    useCompound?: boolean,
    useSubElement?: boolean
  ): Promise<string> {
    if (!values) values = await this.generateValues(content);

    await this.generateInsertPreGenerateFields(content, values, tableName);
    const fields = await this.generateFields(
      content,
      useTable,
      useAlias,
      useCompound,
      useSubElement
    );
    await this.generateInsertPostGenerateFields(
      content,
      values,
      tableName,
      fields
    );

    const insertFields = fields?.join(', ') || this.insert;
    let insertValues =
      values && values.length > 0
        ? values.map((_value, index) => '$' + (index + startValue)).join(', ')
        : undefined;
    insertValues = insertValues || this.insertValues || '';
    tableName = tableName || this.getName();

    const insert =
      `INSERT INTO ${tableName} (${insertFields}) ` +
      `VALUES (${insertValues})`;
    return new Promise((resolve) => {
      resolve(insert);
    });
  }

  protected async generateInsertArrayPreGenerateFields(
    _content?: IDAOSimple[],
    _values?,
    _tableName?: string
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<void> {}

  protected async generateInsertArrayPostGenerateFields(
    _content?: IDAOSimple[],
    _values?,
    _tableName?: string,
    _fields?: string[]
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<void> {}

  protected async generateInsertArray(
    content: IDAOSimple[],
    values?,
    tableName?: string,
    startValue = 1,
    useTable?: boolean,
    useAlias?: boolean,
    useCompound?: boolean,
    useSubElement?: boolean
  ): Promise<string> {
    if (!values) values = await this.generateVectorValuesFromArray(content);

    await this.generateInsertArrayPreGenerateFields(content, values, tableName);
    const fields = await this.generateFields(
      content[0],
      useTable,
      useAlias,
      useCompound,
      useSubElement
    );
    await this.generateInsertArrayPostGenerateFields(
      content,
      values,
      tableName,
      fields
    );

    const insert = `INSERT INTO ${
      tableName ? tableName : this.getName()
    } (${fields.join(', ')}) VALUES ${values
      .map(
        (value, index) =>
          '(' +
          value
            .map(
              (_value2, index2) =>
                '$' + (value.length * index + index2 + startValue)
            )
            .join(', ') +
          ')'
      )
      .join(', ')}`;
    return new Promise((resolve) => {
      resolve(insert);
    });
  }

  async addPredefinedValues(
    _content: IDAOSimple,
    baseValues: unknown[]
  ): Promise<unknown[]> {
    return baseValues;
  }

  async createSingle(content: IDAOSimple): Promise<IDAO> {
    let values = await this.generateValues(content);
    values = await this.addPredefinedValues(content, values);
    const select = await this.generateSelect('created');
    // console.log('createSingle', content);
    const insert = await this.generateInsert(
      content,
      values,
      undefined,
      1,
      false,
      true,
      false,
      false
    );
    const query = this.pool?.simpleCreate
      ? `${insert}`
      : `WITH ${this.beforeInsert ? this.beforeInsert : ''} ${
          this.beforeInsert && this.beforeInsert !== '' ? ',' : ''
        } created AS(${insert} ` +
        `RETURNING * ` +
        `) ${select} ${this.groupBy} `;

    // console.log('content:', content);
    // console.log('STORE:', query);
    // console.log('values:', values);

    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        values,
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[] }) => {
          if (error) {
            // console.log('error:', error);
            reject(error);
            return;
          }
          result = this.fixType(result);
          // console.log('result.rows[0]:', result.rows[0]);
          let finalResult = result.rows ? result.rows[0] : ({} as IDAO);
          finalResult = this.pool?.simpleUpdate
            ? (content as IDAO)
            : finalResult;
          resolve(finalResult);
        }
      );
    });
  }

  async createArray(content: IDAOSimple[]): Promise<IDAO[]> {
    // console.log('createArray:', content);
    const tempValues: never[][] = (await this.generateVectorValuesFromArray(
      content
    )) as never[][];

    const select = await this.generateSelect('created');
    const insert = await this.generateInsertArray(
      content,
      tempValues,
      undefined,
      1,
      false,
      true,
      false,
      false
    );
    const values: unknown[] = [].concat(...tempValues);

    const query = this.pool?.simpleCreate
      ? `${insert}`
      : `WITH ${this.beforeInsert ? this.beforeInsert : ''} ${
          // eslint-disable-next-line no-nested-ternary
          this.beforeInsert && this.beforeInsert !== '' ? ',' : ''
        } created AS(${insert} ` +
        `RETURNING * ` +
        `) ${select} ${this.groupBy} `;

    // console.log('content:', content);
    // console.log('STORE:', query);
    // console.log('values:', values);

    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        values,
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[] }) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          let finalResult = result.rows as IDAO[];
          finalResult = this.pool?.simpleUpdate
            ? Array.isArray(content as unknown)
              ? (content as IDAO[])
              : ([content] as unknown as IDAO[])
            : finalResult;
          resolve(finalResult);
        }
      );
    });
  }

  read(input: IInputRead): Promise<IOutput<IDAOSimple, IDAO>> {
    this.options = input.eventOptions;
    return input.id
      ? this.makePromise(input, 'readById')
      : input.single
      ? this.makePromise(input, 'readSingle')
      : this.makePromise(input, 'readArray');
  }
  async readById(id: string): Promise<IDAO> {
    const select = await this.generateSelect(this.getName());
    const idName = await this.getIdField(false, true, false, 'element.');
    // console.log('ID NAME:', idName);
    return new Promise((resolve, reject) => {
      this.pool?.query(
        `${select} WHERE ${idName} ` +
          this.getEquals(id) +
          ` $1 ${this.groupBy}`,
        [id],
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows ? result.rows[0] : ({} as IDAO));
        }
      );
    });
  }
  async readSingle(filter): Promise<IDAO> {
    const limit =
      (this.pool?.readLimit ? this.pool?.readLimit : this.regularLimit) + ' 1';

    const select = await this.generateSelect(
      this.getName(),
      this.pool?.isReadLimitBefore ? limit : undefined
    );
    filter = filter ? filter : {};

    const query = `${select} ${await this.generateWhere(
      filter,
      1,
      true,
      true,
      true,
      true
    )} ${this.groupBy} ${this.pool?.isReadLimitBefore ? '' : limit}`;

    // console.log(query);
    return new Promise(async (resolve, reject) => {
      this.pool?.query(
        query,
        await this.generateValues(filter, true),
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows ? result.rows[0] : ({} as IDAO));
        }
      );
    });
  }
  async readArray(filter): Promise<IDAO[]> {
    const select = await this.generateSelect(this.getName());
    await this.pool?.getNumberOfPages(select, this.options);
    filter = filter ? filter : {};
    const query =
      `${await this.pool?.generatePaginationPrefix(this.options)} ` +
      `${select} ${await this.generateWhere(
        filter,
        1,
        true,
        true,
        true,
        true
      )} ` +
      `${await this.pool?.generatePaginationSuffix(this.options)} ${
        this.groupBy
      }`;

    return new Promise(async (resolve, reject) => {
      this.pool?.query(
        query,
        await this.generateValues(filter, true),
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows as IDAO[]);
        }
      );
    });
  }
  correct(input: IInputUpdate<IDAOSimple>): Promise<IOutput<IDAOSimple, IDAO>> {
    this.options = input.eventOptions;
    //! Envia o input para o service determinado pelo esquema e lá ele faz as
    //! operações necessárias usando o journaly para acessar outros DAOs ou
    //! DAOs.
    //! Sempre deve-se receber informações do tipo input e o output deve ser
    //! compatível com o input para pemitir retro-alimentação.
    //! Atualizar o input para que utilize o melhor dos dois
    //! (input e parametros usados no SimpleAPI).
    return this.update(input);
  }

  update(input: IInputUpdate<IDAOSimple>): Promise<IOutput<IDAOSimple, IDAO>> {
    this.options = input.eventOptions;
    return input.id
      ? this.makePromise(input as IInput<IDAOSimple>, 'updateById')
      : input.single
      ? this.makePromise(input as IInput<IDAOSimple>, 'updateSingle')
      : this.makePromise(input as IInput<IDAOSimple>, 'updateArray');
  }
  async updateById(id: string, content: IDAOSimple): Promise<IDAO> {
    const limit =
      (this.pool?.updateLimit ? this.pool?.updateLimit : this.regularLimit) +
      ' 1';

    const idName = await this.getIdField(false, true, false, false);
    const values = await this.generateValues(content, false);
    const select = await this.generateSelect(
      'updated',
      this.pool?.isUpdateLimitBefore ? limit : undefined
    );
    const update = await this.generateUpdate(1, content, false, true);
    const length = Object.keys(content).length + 1;
    // console.log('len:', length);

    const query = this.pool?.simpleUpdate
      ? `${update} ` +
        `${await this.generateWhere(
          {
            id: this.generateValueFromUnknown(id),
          },
          length,
          false,
          true,
          true,
          true
        )}`
      : `WITH updated AS (${update} WHERE ${idName} IN (SELECT ${idName} FROM ${this.getName()} ` +
        `${await this.generateWhere(
          {
            id: this.generateValueFromUnknown(id),
          },
          length,
          false,
          true,
          true,
          true
        )} ORDER BY ${idName} ${
          this.pool?.isUpdateLimitBefore ? '' : limit
        }) ` +
        `RETURNING *` +
        `) ${select} ${this.groupBy}`;

    // console.log('id:', id);
    // console.log('content:', content);
    // console.log('UPDATE BY ID QUERY:', query);
    // console.log('values:', values);
    return new Promise((resolve, reject) => {
      // console.log('updateById Promise');
      this.pool?.query(
        query,
        [...values, id],
        async (
          error,
          result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }
        ) => {
          // console.log('updateById Promise result');
          if (error) {
            // console.error('error:', error);
            reject(error);
            return;
          }
          result = this.fixType(result);
          // console.error('result:', result);
          // console.error('result.rows:', result.rows);
          let finalResult = result.rows ? result.rows[0] : ({} as IDAO);
          finalResult = this.pool?.simpleUpdate
            ? ({ id, ...content } as IDAO)
            : finalResult;
          resolve(finalResult);
        }
      );
    });
  }
  async updateSingle(filter, content: IDAOSimple): Promise<IDAO> {
    const limit =
      (this.pool?.updateLimit ? this.pool?.updateLimit : this.regularLimit) +
      ' 1';

    const idName = await this.getIdField(false, true, false, false);
    const values = await this.generateValues(content, false);
    filter = filter ? filter : {};
    const filterValues = await this.generateValues(filter, true);
    const select = await this.generateSelect(
      'updated',
      this.pool?.isUpdateLimitBefore ? limit : undefined
    );
    const update = await this.generateUpdate(
      filterValues.length,
      content,
      false,
      true
    );
    const query = this.pool?.simpleUpdate
      ? `${update}`
      : `WITH updated AS (${update} WHERE ${idName} IN (SELECT ${idName} FROM ${this.getName()} ` +
        `${await this.generateWhere(
          filter,
          -1,
          false,
          true,
          true,
          true
        )} ORDER BY ${idName} ${limit}) ` +
        `RETURNING *` +
        `) ${select} ${this.groupBy}`;

    // console.log('filter:', filter);
    // console.log('content:', content);
    // console.log('UPDATE SINGLE QUERY:', query);
    // console.log('values:', values);

    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        values,
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          let finalResult = result.rows ? result.rows[0] : ({} as IDAO);
          finalResult = this.pool?.simpleUpdate
            ? ({ ...filter, ...content } as IDAO)
            : finalResult;
          resolve(finalResult);
        }
      );
    });
  }

  async updateArray(filter, content: IDAOSimple): Promise<IDAO[]> {
    const values = await this.generateValues(content, false);
    const idName = await this.getIdField(false, true, false, false);
    const filterValues = await this.generateValues(filter, true);
    const select = await this.generateSelect('updated');
    filter = filter ? filter : {};
    const update = await this.generateUpdate(
      filterValues.length,
      content,
      false,
      true
    );
    const query = this.pool?.simpleUpdate
      ? `${update}`
      : `WITH updated AS (${update} WHERE ${idName} IN (SELECT ${idName} FROM ${this.getName()} ` +
        `${await this.generateWhere(
          filter,
          -1,
          false,
          true,
          true,
          true
        )} ORDER BY ${idName}) ` +
        `RETURNING *` +
        `) ${select} ${this.groupBy}`;

    // console.log('filter:', filter);
    // console.log('content:', content);
    // console.log('UPDATE QUERY:', query);
    // console.log('values:', values);

    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        values,
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          let finalResult = result.rows as IDAO[];
          finalResult = this.pool?.simpleUpdate
            ? Array.isArray(content as unknown)
              ? (content as IDAO[]).map((item) => ({ ...filter, ...item }))
              : [{ ...filter, ...content }]
            : finalResult;
          resolve(finalResult);
        }
      );
    });
  }
  nonexistent(input: IInputDelete): Promise<IOutput<IDAOSimple, IDAO>> {
    this.options = input.eventOptions;
    return this.delete(input);
  }
  delete(input: IInputDelete): Promise<IOutput<IDAOSimple, IDAO>> {
    // console.log('FUCKING DELETE');
    this.options = input.eventOptions;

    return input.id
      ? this.makePromise(input, 'deleteById')
      : input.single
      ? this.makePromise(input, 'deleteSingle')
      : this.makePromise(input, 'deleteArray');
  }
  async deleteById(id: string): Promise<boolean> {
    // console.log(this.getName());
    const query = `DELETE FROM ${this.getName()} ${await this.generateWhere(
      { id: id },
      1,
      false,
      true,
      true,
      true
    )}`;
    // console.log('DELETE ID QUERY:', query);
    // console.log('DELETE ID VALUES:', [id]);

    return new Promise(async (resolve, reject) => {
      this.pool?.query(
        query,
        [id],
        (
          error,
          result: {
            rows?: (IDAO | PromiseLike<IDAO>)[];
            rowCount?;
            rowsAffected?;
          }
        ) => {
          if (error) {
            reject(error);
            return;
          }
          if (result.rowCount || result.rowsAffected) {
            resolve(true);
            return;
          }
          // console.log(result);
          resolve(false);
          // console.log(result);

          // error = new Error();
          // error.name = 'RemoveError';
          // error.message = 'Unable to remove a non existent element.';
          // reject(error);
        }
      );
    });
  }
  async deleteSingle(filter): Promise<boolean> {
    const limit = this.pool?.simpleDelete
      ? this.pool?.deleteLimit
        ? this.pool?.deleteLimit
        : this.regularLimit
      : (this.pool?.readLimit ? this.pool?.readLimit : this.regularLimit) +
        ' 1';
    const idName = await this.getIdField(false, true, false, false);
    const query = this.pool?.simpleDelete
      ? `DELETE ${
          this.pool?.isDeleteLimitBefore ? limit : ''
        } FROM ${this.getName()} ${await this.generateWhere(
          filter,
          1,
          false,
          true,
          true,
          true
        )} ${this.pool?.isDeleteLimitBefore ? '' : limit}`
      : `DELETE FROM ${this.getName()} WHERE ${idName} IN ` +
        `(${await this.generateSelect(
          this.getName(),
          this.pool?.isReadLimitBefore ? limit : undefined,
          true,
          idName
        )} ` +
        `${await this.generateWhere(filter, 1, false, true, true, true)} ${
          this.pool?.isReadLimitBefore ? '' : limit
        }) `;

    // console.log('DELETE QUERY:', query);
    // console.log(
    //   'DELETE limit:',
    //   limit,
    //   this.pool?.simpleDelete,
    //   this.pool?.deleteLimit,
    //   this.pool?.readLimit
    // );

    return new Promise(async (resolve, reject) => {
      this.pool?.query(
        query,
        await this.generateValues(filter, true),
        (
          error,
          result: {
            rows?: (IDAO | PromiseLike<IDAO>)[];
            rowCount?;
            rowsAffected?;
          }
        ) => {
          if (error) {
            reject(error);
            return;
          }
          // console.log('DELETE SINGLE: ', result);
          if (result.rowCount || result.rowsAffected) {
            resolve(true);
            return;
          }
          resolve(true);

          // error = new Error();
          // error.name = 'RemoveError';
          // error.message = 'Unable to remove a non existent element.';
          // reject(error);
        }
      );
    });
  }
  async deleteArray(filter): Promise<number> {
    // console.log('filter=', filter);
    filter = filter ? filter : {};
    const idName = await this.getIdField(false, true, false, false);
    const query = this.pool?.simpleDelete
      ? `DELETE FROM ${this.getName()} ${await this.generateWhere(
          filter,
          1,
          false,
          true,
          true,
          true
        )} `
      : `DELETE FROM ${this.getName()} WHERE ${idName} IN (${await this.generateSelect(
          this.getName(),
          undefined,
          true,
          idName
        )} ` +
        `${await this.generateWhere(filter, 1, false, true, true, true)}) `;

    const values = await this.generateValues(filter, true);
    // console.log('DELETE Array QUERY:', query);
    // console.log('DELETE Array Values:', values);

    return new Promise(async (resolve, reject) => {
      this.pool?.query(
        query,
        values,
        (
          error,
          result: {
            rows?: (IDAO | PromiseLike<IDAO>)[];
            rowCount?;
            rowsAffected?: number[];
          }
        ) => {
          if (error) {
            reject(error);
            return;
          }
          if (result.rowCount || result.rowsAffected) {
            resolve(
              result.rowCount || result.rowsAffected?.reduce((a, b) => a + b)
            );
            return;
          }
          resolve(0);
          // console.log(result);

          // error = new Error();
          // error.name = 'RemoveError';
          // error.message = 'Unable to remove a non existent element.';
          // reject(error);
        }
      );
    });
  }
}
