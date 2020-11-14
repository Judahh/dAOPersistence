import DAODeleteAdapter from '../adapter/dAODeleteAdapter';
import BaseDAODefault from './baseDAODefault';

export default class BaseDAODelete
  extends BaseDAODefault
  implements DAODeleteAdapter {
  delete(filter, single: boolean): Promise<number> {
    const limit = single ? 'LIMIT 1' : '';
    let query = `DELETE FROM ${this.table} WHERE id IN (SELECT id FROM ${this.table} ORDER BY ID ${limit})`;

    if (filter) {
      let pos = 0;
      query = `DELETE FROM ${this.table} WHERE ${Object.getOwnPropertyNames(
        filter
      )
        .map((x) => x + ' = $' + pos++)
        .join(', ')} AND id IN (SELECT id FROM ${
        this.table
      } ORDER BY ID ${limit})`;
    }

    return new Promise((resolve, reject) => {
      this.pool.query(
        query,
        filter ? Object.values(filter) : [],
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (result.rowCount) {
            resolve(result.rowCount);
            return;
          }
          resolve(0);
          // console.log(result);

          // error = new Error();
          // error.name = 'RemoveError';
          // error.message = 'Unable to remove a non existent element.';
          // reject(error);
        }
      );
    });
  }
}
