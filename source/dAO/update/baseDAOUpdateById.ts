/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOModel from '../../model/dAOModel';
import DAOSimpleModel from '../../model/dAOSimpleModel';
import DAOUpdateByIdAdapter from '../../adapter/update/dAOUpdateByIdAdapter';
import BaseDAORestrictedDefault from '../baseDAORestrictedDefault';

// @ts-ignore
export default class BaseDAOUpdateById
  extends BaseDAORestrictedDefault
  implements DAOUpdateByIdAdapter {
  // @ts-ignore
  protected abstract updateQuery: string;
  async updateById(id: string, content: DAOSimpleModel): Promise<DAOModel> {
    const limit = 'LIMIT 1';

    const values = Object.values(content);
    const select = await this.generateSelect('updated');
    const update = await this.generateUpdate(1, content);
    const query =
      `WITH updated AS (${update} WHERE id IN (SELECT id FROM ${this.table} ` +
      `WHERE id = ${this.generateValueFromUnknown(id)} ORDER BY ID ${limit}) ` +
      `RETURNING *` +
      `) ${select} ${this.groupBy}`;

    // console.log('id:', id);
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
        resolve(result.rows[0]);
      });
    });
  }
}
