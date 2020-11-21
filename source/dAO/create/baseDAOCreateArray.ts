/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOModel from '../../model/dAOModel';
import DAOSimpleModel from '../../model/dAOSimpleModel';
import DAOCreateArrayAdapter from '../../adapter/create/dAOCreateArrayAdapter';
import BaseDAORestrictedDefault from '../baseDAORestrictedDefault';
// @ts-ignore
export default class BaseDAOCreateArray
  extends BaseDAORestrictedDefault
  implements DAOCreateArrayAdapter {
  // @ts-ignore
  protected abstract insert: string;
  // @ts-ignore
  protected abstract insertValues: string;
  protected beforeInsert = '';
  // @ts-ignore
  protected abstract updateQuery: string;

  protected async generateInsertArray(
    content: DAOSimpleModel[],
    values?
  ): Promise<string> {
    if (!values) values = await this.generateVectorValuesFromArray(content);
    const insert = `INSERT INTO ${this.table} (${(
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

  async createArray(content: DAOSimpleModel[]): Promise<DAOModel[]> {
    // console.log('createArray:', content);
    const tempValues: never[][] = (await this.generateVectorValuesFromArray(
      content
    )) as never[][];

    const select = await this.generateSelect('created');
    const insert = await this.generateInsertArray(content, tempValues);
    const values: unknown[] = [].concat(...tempValues);

    const query =
      `WITH ${this.beforeInsert ? this.beforeInsert : ''}${
        // eslint-disable-next-line no-nested-ternary
        this.beforeInsert && this.beforeInsert !== '' ? ',' : ''
      } created AS (${insert} ` +
      `RETURNING *` +
      `) ${select} ${this.groupBy}`;

    // console.log('content:', content);
    // console.log('STORE:', query);
    // console.log('values:', values);

    return new Promise((resolve, reject) => {
      this.pool.query(query, values, (error, result) => {
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
