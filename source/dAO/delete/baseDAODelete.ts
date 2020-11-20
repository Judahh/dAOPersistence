import DAODeleteAdapter from '../../adapter/delete/dAODeleteAdapter';
import BaseDAODefault from '../baseDAODefault';

export default class BaseDAODelete
  extends BaseDAODefault
  implements DAODeleteAdapter {
  delete(filter): Promise<boolean> {
    const limit = 'LIMIT 1';
    let query = `DELETE FROM ${this.table} WHERE id IN (SELECT id FROM ${this.table} ORDER BY ID ${limit})`;

    if (!filter) {
      filter = {};
    }

    // console.log('filter=', filter);

    if (Object.keys(filter).length !== 0) {
      let pos = 1;
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
            resolve(true);
            return;
          }
          resolve(true);
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
