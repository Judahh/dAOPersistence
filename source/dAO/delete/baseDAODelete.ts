/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  PersistenceInputDelete,
  PersistencePromise,
  RemoveAdapter,
} from 'flexiblepersistence';
import DAOModel from '../../model/dAOModel';
import BaseDAODefault from '../baseDAODefault';

export default class BaseDAODelete
  extends BaseDAODefault
  implements RemoveAdapter<DAOModel>
{
  // @ts-ignore
  protected abstract updateQuery: string;

  nonexistent(
    input: PersistenceInputDelete
  ): Promise<PersistencePromise<DAOModel>> {
    this.options = input.eventOptions;
    return this.delete(input);
  }
  delete(input: PersistenceInputDelete): Promise<PersistencePromise<DAOModel>> {
    // console.log('FUCKING DELETE');
    this.options = input.eventOptions;

    return input.id
      ? this.makePromise(input, 'deleteById')
      : input.single
      ? this.makePromise(input, 'deleteSingle')
      : this.makePromise(input, 'deleteArray');
  }
  deleteById(id: string): Promise<boolean> {
    // console.log(this.getName());
    return new Promise((resolve, reject) => {
      this.pool?.query(
        `DELETE FROM ${this.getName()} WHERE id = $1`,
        [id],
        (
          error,
          result: { rows?: (DAOModel | PromiseLike<DAOModel>)[]; rowCount? }
        ) => {
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
  async deleteSingle(filter): Promise<boolean> {
    const limit = 'LIMIT 1';
    let query = `DELETE FROM ${this.getName()} WHERE id IN (SELECT id FROM ${this.getName()} ORDER BY ID ${limit})`;

    if (!filter) {
      filter = {};
    }

    // console.log('filter=', filter);

    if (Object.keys(filter).length !== 0) {
      query =
        `DELETE FROM ${this.getName()} WHERE id IN (SELECT id FROM ${this.getName()} ` +
        `${await this.generateWhere(filter)} ORDER BY ID ${limit}) `;
    }

    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        filter ? Object.values(filter) : [],
        (
          error,
          result: { rows?: (DAOModel | PromiseLike<DAOModel>)[]; rowCount? }
        ) => {
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
  async deleteArray(filter): Promise<number> {
    let query = `DELETE FROM ${this.getName()} WHERE id IN (SELECT id FROM ${this.getName()} ORDER BY ID)`;

    if (!filter) {
      filter = {};
    }

    // console.log('filter=', filter);

    if (Object.keys(filter).length !== 0) {
      query =
        `DELETE FROM ${this.getName()} WHERE id IN (SELECT id FROM ${this.getName()} ` +
        `${await this.generateWhere(filter)} ORDER BY ID) `;
    }

    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        filter ? Object.values(filter) : [],
        (
          error,
          result: { rows?: (DAOModel | PromiseLike<DAOModel>)[]; rowCount? }
        ) => {
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
