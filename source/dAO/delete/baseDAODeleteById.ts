import DAODeleteByIdAdapter from '../../adapter/delete/dAODeleteByIdAdapter';
import BaseDAODefault from '../baseDAODefault';

export default class BaseDAODeleteById
  extends BaseDAODefault
  implements DAODeleteByIdAdapter {
  deleteById(id: string): Promise<boolean> {
    // console.log(this.table);
    return new Promise((resolve, reject) => {
      this.pool.query(
        `DELETE FROM ${this.table} WHERE id = $1`,
        [id],
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (result.rowCount) {
            resolve(true);
            return;
          }
          console.log(result);
          resolve(false);
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
