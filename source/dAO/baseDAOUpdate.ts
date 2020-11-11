/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOModel from '../model/dAOModel';
import DAOSimpleModel from '../model/dAOSimpleModel';
import DAOUpdateAdapter from '../adapter/dAOUpdateAdapter';
import BaseDAORestrictedDefault from './baseDAORestrictedDefault';

// @ts-ignore
export default class BaseDAOUpdate
  extends BaseDAORestrictedDefault
  implements DAOUpdateAdapter {
  // @ts-ignore
  protected abstract updateQuery: string;

  protected async generateUpdate(): Promise<string> {
    const update = `UPDATE ${this.table} SET ${this.updateQuery}`;
    return new Promise((resolve) => {
      resolve(update);
    });
  }

  public async update(filter, content: DAOSimpleModel): Promise<DAOModel> {
    const values = await this.generateVectorValues(content);
    const select = await this.generateSelect('updated');
    const update = await this.generateUpdate();
    let query =
      `WITH updated AS (${update} LIMIT 1 ` +
      `RETURNING *` +
      `) ${select} ${this.groupBy}`;
    if (!filter) {
      filter = {};
    } else {
      query =
        `WITH updated AS (${update} WHERE ${Object.getOwnPropertyNames(filter)
          .map((x) => 'element.' + x + ' = ' + filter[x])
          .join(', ')} ${this.groupBy} LIMIT 1 ` +
        `RETURNING *` +
        `) ${select} ${this.groupBy}`;
    }
    console.log(query);

    return new Promise((resolve, reject) => {
      this.pool.query(
        query,
        [...Object.values(filter), ...values],
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows[0]);
        }
      );
    });
  }
}
