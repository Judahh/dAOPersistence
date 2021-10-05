/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IInputRead, IOutput, IRead } from 'flexiblepersistence';
import { IDAOSimple } from '../..';
import IDAO from '../../model/iDAO';
import BaseDAODefault from '../baseDAODefault';
export default class BaseDAORead
  extends BaseDAODefault
  implements IRead<IDAOSimple, IDAO>
{
  read(input: IInputRead): Promise<IOutput<IDAOSimple, IDAO>> {
    this.options = input.eventOptions;
    return input.id
      ? this.makePromise(input, 'readById')
      : input.single
      ? this.makePromise(input, 'readSingle')
      : this.makePromise(input, 'readArray');
  }
  // @ts-ignore
  protected abstract updateQuery: string;
  async readById(id: string): Promise<IDAO> {
    const select = await this.generateSelect(this.getName());
    const idName = await this.getIdField(false, true, false, 'element.');
    console.log('ID NAME:', idName);

    return new Promise((resolve, reject) => {
      this.pool?.query(
        `${select} WHERE ${idName} ` +
          this.getEquals(id) +
          ` $1 ${this.groupBy}`,
        [id],
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows ? result.rows[0] : ({} as IDAO));
        }
      );
    });
  }
  async readSingle(filter): Promise<IDAO> {
    const limit =
      (this.pool?.readLimit ? this.pool?.readLimit : this.regularLimit) + ' 1';

    const select = await this.generateSelect(
      this.getName(),
      this.pool?.isReadLimitBefore ? limit : undefined
    );
    filter = filter ? filter : {};

    const query = `${select} ${await this.generateWhere(
      filter,
      1,
      true,
      true,
      true,
      true
    )} ${this.groupBy} ${this.pool?.isReadLimitBefore ? '' : limit}`;

    // console.log(query);
    return new Promise(async (resolve, reject) => {
      this.pool?.query(
        query,
        await this.generateValues(filter, true),
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows ? result.rows[0] : ({} as IDAO));
        }
      );
    });
  }
  async readArray(filter): Promise<IDAO[]> {
    const select = await this.generateSelect(this.getName());
    await this.pool?.getNumberOfPages(select, this.options);
    filter = filter ? filter : {};
    const query =
      `${await this.pool?.generatePaginationPrefix(this.options)} ` +
      `${select} ${await this.generateWhere(
        filter,
        1,
        true,
        true,
        true,
        true
      )} ` +
      `${await this.pool?.generatePaginationSuffix(this.options)} ${
        this.groupBy
      }`;

    return new Promise(async (resolve, reject) => {
      this.pool?.query(
        query,
        await this.generateValues(filter, true),
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows as IDAO[]);
        }
      );
    });
  }
}
