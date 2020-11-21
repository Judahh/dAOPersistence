/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOModel from '../../model/dAOModel';
import DAOReadByIdAdapter from '../../adapter/read/dAOReadByIdAdapter';
import BaseDAODefault from '../baseDAODefault';
export default class BaseDAOReadById
  extends BaseDAODefault
  implements DAOReadByIdAdapter {
  // @ts-ignore
  protected abstract updateQuery: string;
  async readById(id: string): Promise<DAOModel> {
    const select = await this.generateSelect(this.table);
    return new Promise((resolve, reject) => {
      this.pool.query(
        `${select} WHERE element.id = $1 ${this.groupBy}`,
        [id],
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows[0]);
        }
      );
    });
  }
}
