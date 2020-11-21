/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAODeleteArrayAdapter from '../../adapter/delete/dAODeleteArrayAdapter';
import BaseDAODefault from '../baseDAODefault';

export default class BaseDAODeleteArray
  extends BaseDAODefault
  implements DAODeleteArrayAdapter {
  // @ts-ignore
  protected abstract updateQuery: string;
  deleteArray(filter): Promise<number> {
    let query = `DELETE FROM ${this.table} WHERE id IN (SELECT id FROM ${this.table} ORDER BY ID)`;
    if (!filter) {
      filter = {};
    }

    // console.log('filter=', filter);

    if (Object.keys(filter).length !== 0) {
      let pos = 1;
      query = `DELETE FROM ${this.table} WHERE ${Object.keys(filter)
        .map((x) => x + ' = $' + pos++)
        .join(', ')} AND id IN (SELECT id FROM ${this.table} ORDER BY ID)`;
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
