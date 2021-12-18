/* eslint-disable no-unused-vars */
import {
  IInput,
  IInputCreate,
  IInputDelete,
  IInputRead,
  IInputUpdate,
  IOutput,
} from 'flexiblepersistence';
import BaseDAODefault from './baseDAODefault';
import IDAOSimple from '../model/iDAOSimple';
import IDAO from '../model/iDAO';

export default abstract class BaseDAO extends BaseDAODefault {
  protected insert?: string;
  protected insertValues?: string;
  protected beforeInsert = '';

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

  async queryCreate(
    content: IDAOSimple | IDAOSimple[],
    query: string,
    values: unknown[]
  ): Promise<typeof content extends [] ? IDAO[] : IDAO> {
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
          type ResultType = typeof content extends [] ? IDAO[] : IDAO;
          let finalResult: ResultType = (
            Array.isArray(content)
              ? (result.rows as IDAO[])
              : result.rows
              ? (result.rows[0] as IDAO)
              : ({} as IDAO)
          ) as ResultType;
          const simpleResult: ResultType = (
            Array.isArray(content)
              ? Array.isArray(content)
                ? (content as IDAO[])
                : ([content] as unknown as IDAO[])
              : (content as IDAO)
          ) as ResultType;
          finalResult = this.pool?.simpleUpdate ? simpleResult : finalResult;
          resolve(finalResult);
        }
      );
    });
  }

  async queryRead(
    defaultOutput: object | [],
    query: string,
    values: unknown[]
  ): Promise<typeof defaultOutput extends [] ? IDAO[] : IDAO> {
    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        values,
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
          if (error) {
            reject(error);
            return;
          }
          type ResultType = typeof defaultOutput extends [] ? IDAO[] : IDAO;
          result = this.fixType(result);
          const finalResult: ResultType = (
            Array.isArray(defaultOutput)
              ? (result.rows as IDAO[])
              : result.rows
              ? (result.rows[0] as IDAO)
              : ({} as IDAO)
          ) as ResultType;
          resolve(finalResult);
        }
      );
    });
  }

  async queryUpdate(
    content: IDAOSimple | IDAOSimple[],
    query: string,
    values: unknown[]
  ): Promise<typeof content extends [] ? IDAO[] : IDAO> {
    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        values,
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
          if (error) {
            reject(error);
            return;
          }
          type ResultType = typeof content extends [] ? IDAO[] : IDAO;
          result = this.fixType(result);
          let finalResult: ResultType = (
            Array.isArray(content)
              ? (result.rows as IDAO[])
              : result.rows
              ? result.rows[0]
              : ({} as IDAO)
          ) as ResultType;
          const simpleResult: ResultType = content as ResultType;
          finalResult = this.pool?.simpleUpdate ? simpleResult : finalResult;
          resolve(finalResult);
        }
      );
    });
  }

  async queryDelete(
    defaultOutput: boolean | number,
    query: string,
    values: unknown[]
  ): Promise<typeof defaultOutput> {
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
              typeof defaultOutput === 'boolean'
                ? true
                : result.rowCount ||
                    result.rowsAffected?.reduce((a, b) => a + b)
            );
            return;
          }
          resolve(defaultOutput);
        }
      );
    });
  }

  existent(
    input: IInputCreate<IDAOSimple>
  ): Promise<IOutput<IDAOSimple, IDAO>> {
    return this.create(input);
  }
  create(input: IInputCreate<IDAOSimple>): Promise<IOutput<IDAOSimple, IDAO>> {
    this.options = input.eventOptions;
    return Array.isArray(input.item)
      ? this.makePromise(input as IInput<IDAOSimple>, 'createArray')
      : this.makePromise(input as IInput<IDAOSimple>, 'createSingle');
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

    return this.queryCreate(content, query, values);
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

    return this.queryCreate(content, query, values) as unknown as Promise<
      IDAO[]
    >;
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
    const query =
      `${select} WHERE ${idName} ` + this.getEquals(id) + ` $1 ${this.groupBy}`;
    const values = [id];
    return this.queryRead({}, query, values);
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
    const values = await this.generateValues(filter, true);
    return this.queryRead({}, query, values);
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

    const values = await this.generateValues(filter, true);
    return this.queryRead([], query, values) as unknown as Promise<IDAO[]>;
  }
  correct(input: IInputUpdate<IDAOSimple>): Promise<IOutput<IDAOSimple, IDAO>> {
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
    let values = await this.generateValues(content, false);
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
    values = [...values, id];
    const newContent = { id, ...content } as IDAO;
    return this.queryUpdate(newContent, query, values);
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

    const newContent = { ...filter, ...content } as IDAO;

    return this.queryUpdate(newContent, query, values);
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

    const newContent = Array.isArray(content as unknown)
      ? (content as IDAO[]).map((item) => ({ ...filter, ...item }))
      : [{ ...filter, ...content }];

    return this.queryUpdate(newContent, query, values) as unknown as Promise<
      IDAO[]
    >;
  }
  nonexistent(input: IInputDelete): Promise<IOutput<IDAOSimple, IDAO>> {
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
    const filter = { id: id };
    const query = `DELETE FROM ${this.getName()} ${await this.generateWhere(
      filter,
      1,
      false,
      true,
      true,
      true
    )}`;
    const values = [id];
    return this.queryDelete(false, query, values) as Promise<boolean>;
  }
  async deleteSingle(filter): Promise<boolean> {
    const limit = this.pool?.simpleDelete
      ? this.pool?.deleteLimit
        ? this.pool?.deleteLimit
        : this.regularLimit
      : (this.pool?.readLimit ? this.pool?.readLimit : this.regularLimit) +
        ' 1';
    const limitBefore = this.pool?.isDeleteLimitBefore ? limit : '';
    const limitAfter = this.pool?.isDeleteLimitBefore ? '' : limit;
    const readLimitBefore = this.pool?.isReadLimitBefore ? limit : undefined;
    const readLimitAfter = this.pool?.isReadLimitBefore ? '' : limit;

    const idName = await this.getIdField(false, true, false, false);
    const query = this.pool?.simpleDelete
      ? `DELETE ${limitBefore} FROM ${this.getName()} ${await this.generateWhere(
          filter,
          1,
          false,
          true,
          true,
          true
        )} ${limitAfter}`
      : `DELETE FROM ${this.getName()} WHERE ${idName} IN ` +
        `(${await this.generateSelect(
          this.getName(),
          readLimitBefore,
          true,
          idName
        )} ` +
        `${await this.generateWhere(
          filter,
          1,
          false,
          true,
          true,
          true
        )} ${readLimitAfter}) `;
    const values = await this.generateValues(filter, true);
    return this.queryDelete(false, query, values) as Promise<boolean>;
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
    return this.queryDelete(0, query, values) as Promise<number>;
  }
}
