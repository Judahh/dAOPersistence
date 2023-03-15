/* eslint-disable no-unused-vars */
import {
  IInput,
  IInputCreate,
  IInputDelete,
  IInputRead,
  IInputUpdate,
  IOutput,
  ITransaction,
} from 'flexiblepersistence';
import BaseDAODefault from './baseDAODefault';
import IDAOSimple from '../model/iDAOSimple';
import IDAO from '../model/iDAO';
import {
  ICreateQueryOutput,
  IDeleteQueryOutput,
  IReadQueryOutput,
  IUpdateQueryOutput,
} from '../model/iQueryOutput';

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
    useSubElement?: boolean,
    manualFields?: string[],
    manualValues?: string[]
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

    fields.push(...(manualFields || []));

    const insertFields = fields?.join(', ') || this.insert;
    const finalValues = values.map(
      (_value, index) => '$' + (index + startValue)
    );
    finalValues.push(...(manualValues || []));
    let insertValues =
      finalValues && finalValues.length > 0
        ? finalValues.join(', ')
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
    useSubElement?: boolean,
    manualFields?: string[],
    manualValues?: string[]
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
    fields.push(...(manualFields || []));
    await this.generateInsertArrayPostGenerateFields(
      content,
      values,
      tableName,
      fields
    );

    const finalValues = values
      .map((value, index) => {
        const finalValue = value.map(
          (_value2, index2) =>
            '$' + (value.length * index + index2 + startValue)
        );
        finalValue.push(...(manualValues || []));
        return '(' + finalValue.join(', ') + ')';
      })
      .join(', ');

    const insert = `INSERT INTO ${
      tableName ? tableName : this.getName()
    } (${fields.join(', ')}) VALUES ${finalValues}`;
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

  async poolTransaction(
    options?: any,
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    callback?: (transaction?: ITransaction) => Promise<void> // file deepcode ignore no-any: any needed
  ): Promise<ITransaction | undefined> {
    const transaction = await this.pool?.begin(options);
    await callback?.(transaction);
    return transaction;
  }

  async poolQuery(
    script: string,
    values?: unknown[] | undefined
  ): Promise<
    | {
        rows?: unknown[] | undefined;
        rowCount?: number | undefined;
        rowsAffected?: number[] | undefined;
        recordset?: any;
      }
    | undefined
  > {
    return await this.pool?.query(script, values);
  }

  async query(
    content: IDAOSimple | IDAOSimple[],
    query: string,
    values: unknown[],
    isSimple = false
  ): Promise<typeof content extends [] ? IDAO[] : IDAO> {
    // console.log('UPDATE QUERY:', query, values);
    return new Promise(async (resolve, reject) => {
      // console.log('QUERY:', query, values);
      let result = await this.pool?.query(query, values).catch(reject);
      type ResultType = typeof content extends [] ? IDAO[] : IDAO;
      result = this.fixType(result ? result : {});
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

  create(
    input: IInputCreate<IDAOSimple, IDAOSimple>
  ): Promise<IOutput<IDAOSimple, IDAOSimple, IDAO>> {
    return Array.isArray(input.item)
      ? this.makePromise(input as IInput<IDAOSimple, IDAOSimple>, 'createArray')
      : this.makePromise(
          input as IInput<IDAOSimple, IDAOSimple>,
          'createSingle'
        );
  }

  async queryCreateSingle(
    content: IDAOSimple,
    startValue = 1,
    manualFields?: string[],
    manualValues?: string[]
  ): Promise<ICreateQueryOutput> {
    let values = await this.generateValues(content);
    values = await this.addPredefinedValues(content, values);
    const select = await this.generateSelect('created');
    // console.log('createSingle', content);
    const insert = await this.generateInsert(
      content,
      values,
      undefined,
      startValue,
      false,
      true,
      false,
      false,
      manualFields,
      manualValues
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

    return {
      content,
      query,
      simpleQuery: insert,
      values,
      isSimple: this.pool?.simpleUpdate,
    };
  }

  async createSingle(content: IDAOSimple): Promise<IDAO> {
    const queryOutput = await this.queryCreateSingle(content);

    return this.query(
      queryOutput.content,
      queryOutput.query,
      queryOutput.values,
      queryOutput.isSimple
    );
  }

  async queryCreateArray(
    content: IDAOSimple[],
    startValue = 1,
    manualFields?: string[],
    manualValues?: string[]
  ): Promise<ICreateQueryOutput> {
    // console.log('createArray:', content);
    const tempValues: never[][] = (await this.generateVectorValuesFromArray(
      content
    )) as never[][];

    const select = await this.generateSelect('created');
    const insert = await this.generateInsertArray(
      content,
      tempValues,
      undefined,
      startValue,
      false,
      true,
      false,
      false,
      manualFields,
      manualValues
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

    return {
      content,
      query,
      simpleQuery: insert,
      values,
      isSimple: this.pool?.simpleUpdate,
    };
  }

  async createArray(content: IDAOSimple[]): Promise<IDAO[]> {
    const queryOutput = await this.queryCreateArray(content);

    return this.query(
      queryOutput.content,
      queryOutput.query,
      queryOutput.values,
      queryOutput.isSimple
    ) as unknown as Promise<IDAO[]>;
  }

  read(
    input: IInputRead<IDAOSimple, IDAOSimple>
  ): Promise<IOutput<IDAOSimple, IDAOSimple, IDAO>> {
    return this.makePromise(input, 'readByFilter');
  }

  async queryReadByFilter(
    filter,
    isSingle: boolean,
    options,
    useDenseRank?: boolean | string
  ): Promise<IReadQueryOutput> {
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
    const values = await this.generateValues(filter, true);
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
      options.pages = await this.pool?.getPages(
        select,
        values,
        options,
        useDenseRank === true
          ? idName
          : typeof useDenseRank === 'string'
          ? useDenseRank
          : idName
      );
    const query =
      `${await this.pool?.generatePaginationPrefix(options, idName)} ` +
      select +
      `${await this.pool?.generatePaginationSuffix(options)} ${
        this.groupBy
      } ${limitAfter}`;
    return {
      query,
      simpleQuery: select,
      values,
      content: isSingle ? {} : [],
    };
  }
  async readByFilter(
    filter,
    isSingle: boolean,
    options,
    useDenseRank?: boolean | string
  ): Promise<IDAO[]> {
    const queryOutput = await this.queryReadByFilter(
      filter,
      isSingle,
      options,
      useDenseRank
    );
    return this.query(
      queryOutput.content,
      queryOutput.query,
      queryOutput.values
    ) as unknown as Promise<IDAO[]>;
  }

  update(
    input: IInputUpdate<IDAOSimple, IDAOSimple>
  ): Promise<IOutput<IDAOSimple, IDAOSimple, IDAO>> {
    return this.makePromise(
      input as IInput<IDAOSimple, IDAOSimple>,
      'updateByFilter'
    );
  }
  async queryUpdateByFilter(
    filter,
    isSingle: boolean,
    options,
    content: IDAOSimple,
    startValue = 1,
    manualFields?: string[],
    manualValues?: string[]
  ): Promise<IUpdateQueryOutput> {
    const limit = isSingle
      ? (this.pool?.updateLimit ? this.pool?.updateLimit : this.regularLimit) +
        ' 1'
      : '';

    let values = await this.generateValues(content, false);
    const idName = await this.getIdField(false, true, false, false);
    const filterValues = await this.generateValues(filter, true);
    // console.log(
    //   'update content, values, filter, filterValues:',
    //   '\n',
    //   content,
    //   '\n',
    //   values,
    //   '\n',
    //   filter,
    //   '\n',
    //   filterValues
    // );
    const select = await this.generateSelect(
      'updated',
      this.pool?.isUpdateLimitBefore ? limit : undefined
    );
    const update = await this.generateUpdate(
      startValue,
      content,
      false,
      true,
      undefined,
      undefined,
      manualFields,
      manualValues
    );
    const length = Object.keys(content).length + startValue;
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
    return {
      query,
      simpleQuery: `${update} ` + `${where}`,
      values,
      content: newContent,
      isSimple: this.pool?.simpleUpdate,
    };
  }
  async updateByFilter(
    filter,
    isSingle: boolean,
    options,
    content: IDAOSimple
  ): Promise<IDAO | IDAO[]> {
    const queryOutput = await this.queryUpdateByFilter(
      filter,
      isSingle,
      options,
      content
    );
    return this.query(
      queryOutput.content,
      queryOutput.query,
      queryOutput.values,
      queryOutput.isSimple
    );
  }
  delete(
    input: IInputDelete<IDAOSimple, IDAOSimple>
  ): Promise<IOutput<IDAOSimple, IDAOSimple, IDAO>> {
    return this.makePromise(input, 'deleteByFilter');
  }

  async queryDeleteByFilter(
    filter,
    isSingle: boolean,
    options
  ): Promise<IDeleteQueryOutput> {
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
    return {
      defaultOutput: isSingle ? false : 0,
      simpleQuery: `DELETE ${limitBefore} FROM ${this.getName()} ${where} ${limitAfter}`,
      query,
      values,
    };
  }

  async deleteByFilter(
    filter,
    isSingle: boolean,
    options
  ): Promise<boolean | number> {
    const queryOutput = await this.queryDeleteByFilter(
      filter,
      isSingle,
      options
    );
    const queryResult = await this.queryDelete(
      queryOutput.defaultOutput,
      queryOutput.query,
      queryOutput.values
    );
    // console.log('QueryResult: ', queryResult);
    return queryResult;
  }
}
