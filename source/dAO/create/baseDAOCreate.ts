/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOModel from '../../model/dAOModel';
import DAOSimpleModel from '../../model/dAOSimpleModel';
import DAOCreateAdapter from '../../adapter/create/dAOCreateAdapter';
import BaseDAORestrictedDefault from '../baseDAORestrictedDefault';
// @ts-ignore
export default class BaseDAOCreate
  extends BaseDAORestrictedDefault
  implements DAOCreateAdapter {
  // @ts-ignore
  protected abstract insert: string;
  // @ts-ignore
  protected abstract insertValues: string;
  protected beforeInsert = '';

  protected async generateInsert(
    content: DAOSimpleModel,
    values?
  ): Promise<string> {
    if (!values) values = await this.generateVectorValues(content);

    const insert = `INSERT INTO ${this.table} (${(
      await this.generateFields(content)
    ).join(', ')}) VALUES (${values
      .map((value, index) => '$' + (index + 1))
      .join(', ')})`;
    return new Promise((resolve) => {
      resolve(insert);
    });
  }

  async create(content: DAOSimpleModel): Promise<DAOModel> {
    const values = await this.generateVectorValues(content);
    const select = await this.generateSelect('created');
    const insert = await this.generateInsert(content, values);
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
          console.log('error:', error);

          reject(error);
          return;
        }
        result = this.fixType(result);
        // console.log('result.rows[0]:', result.rows[0]);
        resolve(result.rows[0]);
      });
    });
  }
}
