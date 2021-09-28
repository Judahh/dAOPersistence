/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IInput, IInputCreate, IOutput, IStore } from 'flexiblepersistence';
import IDAO from '../../model/iDAO';
import DAOModel from '../../model/iDAO';
import IDAOSimple from '../../model/iDAOSimple';
import DAOSimpleModel from '../../model/iDAOSimple';
import BaseDAORestrictedDefault from '../baseDAORestrictedDefault';
// @ts-ignore
export default class BaseDAOCreate
  extends BaseDAORestrictedDefault
  implements IStore<DAOSimpleModel, DAOModel>
{
  // @ts-ignore
  protected abstract insert: string;
  // @ts-ignore
  protected abstract insertValues: string;
  protected beforeInsert = '';
  // @ts-ignore
  protected abstract updateQuery: string;

  existent(
    input: IInputCreate<DAOSimpleModel>
  ): Promise<IOutput<IDAOSimple, IDAO>> {
    this.options = input.eventOptions;
    return this.create(input);
  }
  create(
    input: IInputCreate<DAOSimpleModel>
  ): Promise<IOutput<IDAOSimple, IDAO>> {
    this.options = input.eventOptions;
    return Array.isArray(input.item)
      ? this.makePromise(input as IInput<DAOSimpleModel>, 'createArray')
      : this.makePromise(input as IInput<DAOSimpleModel>, 'createSingle');
  }

  protected async generateInsertPreGenerateFields(
    _content?: DAOSimpleModel,
    _values?,
    _tableName?: string
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<void> {}

  protected async generateInsertPostGenerateFields(
    _content?: DAOSimpleModel,
    _values?,
    _tableName?: string,
    _fields?: string[]
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<void> {}

  protected async generateInsert(
    content: DAOSimpleModel,
    values?,
    tableName?: string,
    startValue = 1
  ): Promise<string> {
    if (!values) values = await this.generateVectorValues(content);

    await this.generateInsertPreGenerateFields(content, values, tableName);
    const fields = await this.generateFields(content);
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
    _content?: DAOSimpleModel[],
    _values?,
    _tableName?: string
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<void> {}

  protected async generateInsertArrayPostGenerateFields(
    _content?: DAOSimpleModel[],
    _values?,
    _tableName?: string,
    _fields?: string[]
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<void> {}

  protected async generateInsertArray(
    content: DAOSimpleModel[],
    values?,
    tableName?: string,
    startValue = 1
  ): Promise<string> {
    if (!values) values = await this.generateVectorValuesFromArray(content);

    await this.generateInsertArrayPreGenerateFields(content, values, tableName);
    const fields = await this.generateFields(content[0]);
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
    _content: DAOSimpleModel,
    baseValues: unknown[]
  ): Promise<unknown[]> {
    return baseValues;
  }

  async createSingle(content: DAOSimpleModel): Promise<DAOModel> {
    let values = await this.generateVectorValues(content);
    values = await this.addPredefinedValues(content, values);
    const select = await this.generateSelect('created');
    const insert = await this.generateInsert(content, values);
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
        (error, result: { rows?: (DAOModel | PromiseLike<DAOModel>)[] }) => {
          if (error) {
            // console.log('error:', error);
            reject(error);
            return;
          }
          result = this.fixType(result);
          // console.log('result.rows[0]:', result.rows[0]);
          resolve(result.rows ? result.rows[0] : ({} as DAOModel));
        }
      );
    });
  }

  async createArray(content: DAOSimpleModel[]): Promise<DAOModel[]> {
    // console.log('createArray:', content);
    const tempValues: never[][] = (await this.generateVectorValuesFromArray(
      content
    )) as never[][];

    const select = await this.generateSelect('created');
    const insert = await this.generateInsertArray(content, tempValues);
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
        (error, result: { rows?: (DAOModel | PromiseLike<DAOModel>)[] }) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          // console.log('result.rows[0]:', result.rows[0]);
          resolve(result.rows as DAOModel[]);
        }
      );
    });
  }
}
