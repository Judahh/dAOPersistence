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
  implements ReadAdapter<DAOModel>
{
  read(input: PersistenceInputRead): Promise<PersistencePromise<DAOModel>> {
    this.options = input.eventOptions;
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
      this.pool?.query(
        `${select} WHERE element.id ` +
          this.getEquals(id) +
          ` $1 ${this.groupBy}`,
        [id],
        (
          error,
          result: { rows?: (DAOModel | PromiseLike<DAOModel>)[]; rowCount? }
        ) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows ? result.rows[0] : ({} as DAOModel));
        }
      );
    });
  }
  async readSingle(filter): Promise<DAOModel> {
    const limit =
      (this.pool?.readLimit ? this.pool?.readLimit : this.regularLimit) + ' 1';

    const select = await this.generateSelect(
      this.getName(),
      this.pool?.isReadLimitBefore ? limit : undefined
    );
    let query = `${select} ${this.groupBy} ${
      this.pool?.isReadLimitBefore ? '' : limit
    }`;

    if (!filter) {
      filter = {};
    }

    // console.log('filter=', filter);

    if (Object.keys(filter).length !== 0) {
      query = `${select} ${await this.generateWhere(filter, 1, true)} ${
        this.groupBy
      } ${this.pool?.isReadLimitBefore ? '' : limit}`;
    }

    // console.log(query);
    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        Object.values(filter),
        (
          error,
          result: { rows?: (DAOModel | PromiseLike<DAOModel>)[]; rowCount? }
        ) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows ? result.rows[0] : ({} as DAOModel));
        }
      );
    });
  }
  async readArray(filter): Promise<DAOModel[]> {
    const select = await this.generateSelect(this.getName());
    await this.pool?.getNumberOfPages(select, this.options);
    let query =
      `${await this.pool?.generatePaginationPrefix(this.options)} ` +
      `${select} ${await this.pool?.generatePaginationSuffix(this.options)} ` +
      `${this.groupBy}`;

    if (!filter) {
      filter = {};
    }

    if (Object.keys(filter).length !== 0) {
      query =
        `${await this.pool?.generatePaginationPrefix(this.options)} ` +
        `${select} ${await this.generateWhere(filter, 1, true)} ` +
        `${await this.pool?.generatePaginationSuffix(this.options)} ${
          this.groupBy
        }`;
    }
    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        Object.values(filter),
        (
          error,
          result: { rows?: (DAOModel | PromiseLike<DAOModel>)[]; rowCount? }
        ) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows as DAOModel[]);
        }
      );
    });
  }
}
