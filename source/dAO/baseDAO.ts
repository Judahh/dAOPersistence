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

  async query(
    content: IDAOSimple | IDAOSimple[],
    query: string,
    values: unknown[],
    isSimple = false
  ): Promise<typeof content extends [] ? IDAO[] : IDAO> {
    // console.log('UPDATE QUERY:', query, values);
    return new Promise(async (resolve, reject) => {
      let result = await this.pool?.query(query, values).catch(reject);
      type ResultType = typeof content extends [] ? IDAO[] : IDAO;
      result = this.fixType(result);
      let finalResult: ResultType = (
        Array.isArray(content)
          ? (result?.rows as IDAO[])
          : result?.rows
          ? result?.rows[0]
          : ({} as IDAO)
      ) as ResultType;
      const simpleResult: ResultType = content as ResultType;
      finalResult = isSimple ? simpleResult : finalResult;
      resolve(finalResult);
    });
  }

  async queryDelete(
    defaultOutput: boolean | number,
    query: string,
    values: unknown[]
  ): Promise<typeof defaultOutput> {
    return new Promise(async (resolve, reject) => {
      const result = await this.pool?.query(query, values).catch(reject);

      if (result?.rowCount || result?.rowsAffected) {
        const returned =
          typeof defaultOutput === 'boolean' ||
          result.rowCount ||
          result.rowsAffected?.reduce((a, b) => a + b) ||
          0;
        resolve(returned);
        return;
      }
      resolve(defaultOutput);
    });
  }

  create(input: IInputCreate<IDAOSimple>): Promise<IOutput<IDAOSimple, IDAO>> {
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

    return this.query(content, query, values, this.pool?.simpleUpdate);
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

    return this.query(
      content,
      query,
      values,
      this.pool?.simpleUpdate
    ) as unknown as Promise<IDAO[]>;
  }

  read(input: IInputRead): Promise<IOutput<IDAOSimple, IDAO>> {
    return this.makePromise(input, 'readByFilter');
  }
  async readByFilter(filter, isSingle: boolean, options): Promise<IDAO[]> {
    let limit = '';
    let limitBefore = limit;
    let limitAfter = limit;
    if (isSingle) {
      limit =
        (this.pool?.readLimit ? this.pool?.readLimit : this.regularLimit) +
        ' 1';
      limitBefore = this.pool?.isReadLimitBefore ? limit : '';
      limitAfter = this.pool?.isReadLimitBefore ? '' : limit;
    }
    let select = await this.generateSelect(this.getName(), limitBefore);
    filter = filter ? filter : {};
    const idName = await this.getIdField(false, true, false, 'pagingElement.');
    select = `${select} ${await this.generateWhere(
      filter,
      1,
      true,
      true,
      true,
      true
    )} `;
    if (options)
      options.pages = await this.pool?.getPages(select, options, idName);
    const query =
      `${await this.pool?.generatePaginationPrefix(options, idName)} ` +
      select +
      `${await this.pool?.generatePaginationSuffix(options)} ${
        this.groupBy
      } ${limitAfter}`;

    const values = await this.generateValues(filter, true);
    return this.query(isSingle ? {} : [], query, values) as unknown as Promise<
      IDAO[]
    >;
  }

  update(input: IInputUpdate<IDAOSimple>): Promise<IOutput<IDAOSimple, IDAO>> {
    return this.makePromise(input as IInput<IDAOSimple>, 'updateByFilter');
  }
  async updateByFilter(
    filter,
    isSingle: boolean,
    options,
    content: IDAOSimple
  ): Promise<IDAO | IDAO[]> {
    const limit = isSingle
      ? (this.pool?.updateLimit ? this.pool?.updateLimit : this.regularLimit) +
        ' 1'
      : '';

    let values = await this.generateValues(content, false);
    const idName = await this.getIdField(false, true, false, false);
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
    const length = Object.keys(content).length + 1;
    const where = await this.generateWhere(
      filter,
      length,
      false,
      true,
      true,
      true
    );
    const query = this.pool?.simpleUpdate
      ? `${update} ` + `${where}`
      : `WITH updated AS (${update} WHERE ${idName} IN (SELECT ${idName} FROM ${this.getName()} ` +
        `${where} ORDER BY ${idName} ${
          this.pool?.isUpdateLimitBefore ? '' : limit
        }) ` +
        `RETURNING *` +
        `) ${select} ${this.groupBy}`;

    values = [...values, ...filterValues];
    const newContent = isSingle
      ? ({ ...filter, ...content } as IDAO)
      : Array.isArray(content as unknown)
      ? (content as IDAO[]).map((item) => ({ ...filter, ...item }))
      : [{ ...filter, ...content }];
    return this.query(newContent, query, values, this.pool?.simpleUpdate);
  }
  delete(input: IInputDelete): Promise<IOutput<IDAOSimple, IDAO>> {
    return this.makePromise(input, 'deleteByFilter');
  }

  async deleteByFilter(
    filter,
    isSingle: boolean,
    options
  ): Promise<boolean | number> {
    let limit = '';
    let limitBefore = limit;
    let limitAfter = limit;
    let readLimitBefore = limit;
    let readLimitAfter = limit;
    if (isSingle) {
      limit = this.pool?.simpleDelete
        ? this.pool?.deleteLimit
          ? this.pool?.deleteLimit
          : this.regularLimit
        : (this.pool?.readLimit ? this.pool?.readLimit : this.regularLimit) +
          ' 1';
      limitBefore = this.pool?.isDeleteLimitBefore ? limit : '';
      limitAfter = this.pool?.isDeleteLimitBefore ? '' : limit;
      readLimitBefore = this.pool?.isReadLimitBefore ? limit : '';
      readLimitAfter = this.pool?.isReadLimitBefore ? '' : limit;
    }

    const idName = await this.getIdField(false, true, false, false);
    const where = await this.generateWhere(filter, 1, false, true, true, true);
    const query = this.pool?.simpleDelete
      ? `DELETE ${limitBefore} FROM ${this.getName()} ${where} ${limitAfter}`
      : `DELETE FROM ${this.getName()} WHERE ${idName} IN ` +
        `(${await this.generateSelect(
          this.getName(),
          readLimitBefore,
          true,
          idName
        )} ` +
        `${where} ${readLimitAfter}) `;
    const values = await this.generateValues(filter, true);
    // console.log('Query:', query);
    // console.log('values:', values);
    const queryResult = await this.queryDelete(
      isSingle ? false : 0,
      query,
      values
    );
    // console.log('QueryResult: ', queryResult);
    return queryResult;
  }
}
