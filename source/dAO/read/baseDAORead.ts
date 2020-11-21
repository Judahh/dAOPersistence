/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOModel from '../../model/dAOModel';
import DAOReadAdapter from '../../adapter/read/dAOReadAdapter';
import BaseDAODefault from '../baseDAODefault';
export default class BaseDAORead
  extends BaseDAODefault
  implements DAOReadAdapter {
  // @ts-ignore
  protected abstract updateQuery: string;
  async read(filter): Promise<DAOModel> {
    const limit = 'LIMIT 1';
    const select = await this.generateSelect(this.table);
    let query = `${select} ${this.groupBy} ${limit}`;

    if (!filter) {
      filter = {};
    }

    // console.log('filter=', filter);

    if (Object.keys(filter).length !== 0) {
      query = `${select} WHERE ${Object.keys(filter)
        .map((x, index) => 'element.' + x + ' = $' + (index + 1))
        .join(', ')} ${this.groupBy} ${limit}`;
    }

    // console.log(query);
    return new Promise((resolve, reject) => {
      this.pool.query(query, Object.values(filter), (error, result) => {
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
