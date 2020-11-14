/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import DAOModel from '../model/dAOModel';
import BaseDAODefault from './baseDAODefault';
import DAOSelectAllAdapter from '../adapter/dAOSelectAllAdapter';
export default class BaseDAOSelectAll
  extends BaseDAODefault
  implements DAOSelectAllAdapter {
  async selectAll(): Promise<DAOModel[]> {
    const select = await this.generateSelect(this.table);
    return new Promise((resolve, reject) => {
      this.pool.query(`${select} ${this.groupBy}`, (error, result) => {
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
