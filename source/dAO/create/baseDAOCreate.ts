/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  PersistenceInputCreate,
  PersistencePromise,
  StoreAdapter,
} from 'flexiblepersistence';
import DAOModel from '../../model/dAOModel';
import DAOSimpleModel from '../../model/dAOSimpleModel';
import BaseDAORestrictedDefault from '../baseDAORestrictedDefault';
// @ts-ignore
export default class BaseDAOCreate
  extends BaseDAORestrictedDefault
  implements StoreAdapter<DAOSimpleModel, DAOModel>
{
  // @ts-ignore
  protected abstract insert: string;
  // @ts-ignore
  protected abstract insertValues: string;
  protected beforeInsert = '';
  // @ts-ignore
  protected abstract updateQuery: string;

  existent(
    input: PersistenceInputCreate<DAOSimpleModel>
  ): Promise<PersistencePromise<DAOModel>> {
    return this.create(input);
  }
  create(
    input: PersistenceInputCreate<DAOSimpleModel>
  ): Promise<PersistencePromise<DAOModel>> {
    return Array.isArray(input.item)
      ? this.makePromise(input, 'createArray')
      : this.makePromise(input, 'createSingle');
  }

  protected async generateInsert(
    content: DAOSimpleModel,
    values?
  ): Promise<string> {
    if (!values) values = await this.generateVectorValues(content);

    const insert = `INSERT INTO ${this.getName()} (${(
      await this.generateFields(content)
    ).join(', ')}) VALUES (${values
      .map((value, index) => '$' + (index + 1))
      .join(', ')})`;
    return new Promise((resolve) => {
      resolve(insert);
    });
  }

  protected async generateInsertArray(
    content: DAOSimpleModel[],
    values?
  ): Promise<string> {
    if (!values) values = await this.generateVectorValuesFromArray(content);
    const insert = `INSERT INTO ${this.getName()} (${(
      await this.generateFields(content[0])
    ).join(', ')}) VALUES ${values
      .map(
        (value, index) =>
          '(' +
          value
            .map((value2, index2) => '$' + (value.length * index + index2 + 1))
            .join(', ') +
          ')'
      )
      .join(', ')}`;
    return new Promise((resolve) => {
      resolve(insert);
    });
  }

  async createSingle(content: DAOSimpleModel): Promise<DAOModel> {
    const values = await this.generateVectorValues(content);
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
      this.pool?.query(query, values, (error, result) => {
        if (error) {
          // console.log('error:', error);
          reject(error);
          return;
        }
        result = this.fixType(result);
        // console.log('result.rows[0]:', result.rows[0]);
        resolve(result.rows[0]);
      });
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
      this.pool?.query(query, values, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        result = this.fixType(result);
        // console.log('result.rows[0]:', result.rows[0]);
        resolve(result.rows);
      });
    });
  }
}
