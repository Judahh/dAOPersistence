import DAOModel from '../model/dAOModel';
import DAOSelectAdapter from '../adapter/dAOSelectAdapter';
import BaseDAODefault from './baseDAODefault';
export default class BaseDAOSelect
  extends BaseDAODefault
  implements DAOSelectAdapter {
  async select(filter): Promise<DAOModel[]> {
    const select = await this.generateSelect(this.table);
    let query = `${select} ${this.groupBy}`;
    if (!filter) {
      filter = {};
    } else {
      query = `${select} WHERE ${Object.values(filter)
        .map((x) => 'element.' + x)
        .join(', ')} ${this.groupBy}`;
    }

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
