/* eslint-disable @typescript-eslint/no-explicit-any */
import DAOModel from '../../model/dAOModel';
import BaseDAODefault from '../baseDAODefault';
import DAOReadArrayAdapter from '../../adapter/read/dAOReadArrayAdapter';
export default class BaseDAOReadArray
  extends BaseDAODefault
  implements DAOReadArrayAdapter {
  async readArray(filter): Promise<DAOModel[]> {
    const select = await this.generateSelect(this.table);
    let query = `${select} ${this.groupBy}`;

    if (!filter) {
      filter = {};
    }

    // console.log('filter=', filter);

    if (Object.keys(filter).length !== 0) {
      query = `${select} WHERE ${Object.values(filter)
        .map((x, index) => 'element.' + x + ' = $' + (index + 1))
        .join(', ')} ${this.groupBy}`;
    }

    // console.log(query);
    return new Promise((resolve, reject) => {
      this.pool.query(query, Object.values(filter), (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        result = this.fixType(result);
        resolve(result.rows);
      });
    });
  }
}
