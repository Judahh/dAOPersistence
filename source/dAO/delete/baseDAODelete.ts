/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IInputDelete, IOutput, IRemove } from 'flexiblepersistence';
import { IDAOSimple } from '../..';
import IDAO from '../../model/iDAO';
import BaseDAODefault from '../baseDAODefault';

export default class BaseDAODelete
  extends BaseDAODefault
  implements IRemove<IDAOSimple, IDAO>
{
  // @ts-ignore
  protected abstract updateQuery: string;

  nonexistent(input: IInputDelete): Promise<IOutput<IDAOSimple, IDAO>> {
    this.options = input.eventOptions;
    return this.delete(input);
  }
  delete(input: IInputDelete): Promise<IOutput<IDAOSimple, IDAO>> {
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
    return new Promise(async (resolve, reject) => {
      this.pool?.query(
        `DELETE FROM ${this.getName()} ${await this.generateWhere(
          { id: id },
          1,
          false,
          true,
          true,
          true
        )}`,
        [id],
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
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
    const limit =
      (this.pool?.deleteLimit ? this.pool?.deleteLimit : this.regularLimit) +
      ' 1';
    const idName = await this.getIdField(false, true, false, false);
    const query = this.pool?.simpleDelete
      ? `DELETE ${
          this.pool?.isDeleteLimitBefore ? limit : ''
        } FROM ${this.getName()} ${await this.generateWhere(
          filter,
          1,
          false,
          true,
          true,
          true
        )} ${this.pool?.isDeleteLimitBefore ? '' : limit}`
      : `DELETE ${
          this.pool?.isDeleteLimitBefore ? limit : ''
        } FROM ${this.getName()} WHERE ${idName} IN (SELECT ${idName} FROM ${this.getName()} ` +
        `${await this.generateWhere(
          filter,
          1,
          false,
          true,
          true,
          true
        )} ORDER BY ${idName} ${this.pool?.isDeleteLimitBefore ? '' : limit}) `;

    return new Promise(async (resolve, reject) => {
      this.pool?.query(
        query,
        await this.generateValues(filter, true),
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
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
    // console.log('filter=', filter);
    filter = filter ? filter : {};
    const idName = await this.getIdField(false, true, false, false);
    const query = this.pool?.simpleDelete
      ? `DELETE FROM ${this.getName()} ${await this.generateWhere(
          filter,
          1,
          false,
          true,
          true,
          true
        )} `
      : `DELETE FROM ${this.getName()} WHERE ${idName} IN (SELECT ${idName} FROM ${this.getName()} ` +
        `${await this.generateWhere(
          filter,
          1,
          false,
          true,
          true,
          true
        )} ORDER BY ${idName}) `;

    return new Promise(async (resolve, reject) => {
      this.pool?.query(
        query,
        await this.generateValues(filter, true),
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
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
