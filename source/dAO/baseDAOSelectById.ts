import DAOModel from '../model/dAOModel';
import DAOSelectByIdAdapter from '../adapter/dAOSelectByIdAdapter';
import BaseDAODefault from './baseDAODefault';
export default class BaseDAOSelectById
  extends BaseDAODefault
  implements DAOSelectByIdAdapter {
  async selectById(id: string): Promise<DAOModel> {
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
