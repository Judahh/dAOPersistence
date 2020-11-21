/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOModel from '../../model/dAOModel';
import DAOSimpleModel from '../../model/dAOSimpleModel';
import DAOUpdateArrayAdapter from '../../adapter/update/dAOUpdateArrayAdapter';
import BaseDAORestrictedDefault from '../baseDAORestrictedDefault';

// @ts-ignore
export default class BaseDAOUpdateArray
  extends BaseDAORestrictedDefault
  implements DAOUpdateArrayAdapter {
  // @ts-ignore
  protected abstract updateQuery: string;

  async updateArray(filter, content: DAOSimpleModel): Promise<DAOModel[]> {
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
    }

    // console.log('filter=', filter);

    if (Object.keys(filter).length !== 0) {
      query =
        `WITH updated AS (${update} WHERE ${Object.keys(filter)
          .map((x) => x + ' = ' + this.generateValueFromUnknown(filter[x]))
          .join(', ')} ${this.groupBy} ` +
        `RETURNING *` +
        `) ${select} ${this.groupBy}`;
    }

    // console.log('filter:', filter);
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
