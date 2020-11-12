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

  protected async generateUpdate(
    length: number,
    content: DAOSimpleModel
  ): Promise<string> {
    let pos = length;
    const update = `UPDATE ${this.table} SET ${Object.getOwnPropertyNames(
      content
    )
      .map((x) => x + ' = $' + pos++)
      .join(', ')}${this.updateQuery}`;
    return new Promise((resolve) => {
      resolve(update);
    });
  }

  public async update(filter, content: DAOSimpleModel): Promise<DAOModel> {
    const values = Object.values(content);
    const select = await this.generateSelect('updated');
    const update = await this.generateUpdate(
      Object.values(filter).length,
      content
    );
    let query =
      `WITH updated AS (${update} ` +
      `RETURNING *` +
      `) ${select} ${this.groupBy}`;
    if (!filter) {
      filter = {};
    } else {
      query =
        `WITH updated AS (${update} WHERE ${Object.getOwnPropertyNames(filter)
          .map((x) => x + ' = ' + filter[x])
          .join(', ')} ${this.groupBy} ` +
        `RETURNING *` +
        `) ${select} ${this.groupBy}`;
    }

    return new Promise((resolve, reject) => {
      this.pool.query(query, values, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        result = this.fixType(result);
        resolve(result.rows[0]);
      });
    });
  }
}
