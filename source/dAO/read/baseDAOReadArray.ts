/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import DAOModel from '../../model/dAOModel';
import BaseDAODefault from '../baseDAODefault';
import DAOReadArrayAdapter from '../../adapter/read/dAOReadArrayAdapter';
export default class BaseDAOReadArray
  extends BaseDAODefault
  implements DAOReadArrayAdapter {
  // @ts-ignore
  protected abstract updateQuery: string;
  async readArray(filter): Promise<DAOModel[]> {
    const select = await this.generateSelect(this.table);
    let query = `${select} ${this.groupBy}`;

    if (!filter) {
      filter = {};
    }

    // console.log('filter=', filter);

    if (Object.keys(filter).length !== 0) {
      query = `${select} WHERE ${Object.keys(filter)
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
