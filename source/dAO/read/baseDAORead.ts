/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  PersistenceInputRead,
  PersistencePromise,
  ReadAdapter,
} from 'flexiblepersistence';
import DAOModel from '../../model/dAOModel';
import BaseDAODefault from '../baseDAODefault';
export default class BaseDAORead
  extends BaseDAODefault
  implements ReadAdapter<DAOModel> {
  read(input: PersistenceInputRead): Promise<PersistencePromise<DAOModel>> {
    return input.id
      ? this.makePromise(input, 'readById')
      : input.single
      ? this.makePromise(input, 'readSingle')
      : this.makePromise(input, 'readArray');
  }
  // @ts-ignore
  protected abstract updateQuery: string;
  async readById(id: string): Promise<DAOModel> {
    const select = await this.generateSelect(this.getName());
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
  async readSingle(filter): Promise<DAOModel> {
    const limit = 'LIMIT 1';
    const select = await this.generateSelect(this.getName());
    let query = `${select} ${this.groupBy} ${limit}`;

    if (!filter) {
      filter = {};
    }

    // console.log('filter=', filter);

    if (Object.keys(filter).length !== 0) {
      query = `${select} WHERE ${Object.keys(filter)
        .map((x, index) => 'element.' + x + ' = $' + (index + 1))
        .join(', ')} ${this.groupBy} ${limit}`;
    }

    // console.log(query);
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
  async readArray(filter): Promise<DAOModel[]> {
    const select = await this.generateSelect(this.getName());
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
