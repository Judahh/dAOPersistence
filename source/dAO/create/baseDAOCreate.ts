/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IInput, IInputCreate, IOutput, IStore } from 'flexiblepersistence';
import IDAO from '../../model/iDAO';
import IDAOSimple from '../../model/iDAOSimple';
import BaseDAORestrictedDefault from '../baseDAORestrictedDefault';
// @ts-ignore
export default class BaseDAOCreate
  extends BaseDAORestrictedDefault
  implements IStore<IDAOSimple, IDAO>
{
  // @ts-ignore
  protected abstract insert: string;
  // @ts-ignore
  protected abstract insertValues: string;
  protected beforeInsert = '';
  // @ts-ignore
  protected abstract updateQuery: string;

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

    const insert = `INSERT INTO ${
      tableName ? tableName : this.getName()
    } (${fields.join(', ')}) VALUES (${values
      .map((_value, index) => '$' + (index + startValue))
      .join(', ')})`;
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
          resolve(result.rows ? result.rows[0] : ({} as IDAO));
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
          // console.log('result.rows[0]:', result.rows[0]);
          resolve(result.rows as IDAO[]);
        }
      );
    });
  }
}
