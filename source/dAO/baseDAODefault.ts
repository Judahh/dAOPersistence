/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// file deepcode ignore no-any: any needed
// file deepcode ignore object-literal-shorthand: argh
import BigNumber from 'bignumber.js';
import { settings } from 'ts-mixer';
import { PersistenceInput, PersistencePromise } from 'flexiblepersistence';
import BaseDAODefaultInitializer from './baseDAODefaultInitializer';
import DAOSimpleModel from '../model/dAOSimpleModel';
import { Pool } from 'pg';
import DAOModel from '../model/dAOModel';
import { Default } from '@flexiblepersistence/default-initializer';
settings.initFunction = 'init';
/* eslint-disable @typescript-eslint/no-explicit-any */
export default class BaseDAODefault extends Default {
  protected constructor(initDefault?: BaseDAODefaultInitializer) {
    super(initDefault);
  }
  init(initDefault?: BaseDAODefaultInitializer): void {
    // console.log('init:', initDefault);

    super.init(initDefault);
    if (initDefault && initDefault.pool) this.setPool(initDefault.pool);
  }

  getPool() {
    return this.pool;
  }

  setPool(pool) {
    this.pool = pool;
  }

  protected pool: Pool;

  protected groupBy = '';
  protected values = '*';

  protected selectJoin = '';

  // @ts-ignore
  protected abstract updateQuery: string;

  protected generateValueFromUnknown(element: unknown): unknown | string {
    if (typeof element === 'string' || element instanceof String)
      return "'" + element + "'";

    return element;
  }

  protected async generateUpdate(
    length: number,
    content: DAOSimpleModel
  ): Promise<string> {
    let pos = length;
    let set = this.updateQuery;
    if (content)
      set = Object.keys(content)
        .map((x) => x + ' = $' + pos++)
        .join(', ');
    const update = `UPDATE ${this.getName()} SET ${set}`;
    return new Promise((resolve) => {
      resolve(update);
    });
  }
  protected async generateSelect(alias: string): Promise<string> {
    const select = `SELECT * FROM (SELECT ${this.values} FROM ${alias} AS subElement ${this.selectJoin}) as element`;
    return new Promise((resolve) => {
      resolve(select);
    });
  }
  protected fixDate(rows: any[], field: string): any {
    rows = rows.map((row) => {
      row[field] = new Date(row[field]).toISOString();
      return row;
    });
    return rows;
  }

  protected fixBigNumber(rows: any[], field: string): any {
    rows = rows.map((row) => {
      row[field] = new BigNumber(row[field]).toString();
      return row;
    });
    return rows;
  }

  protected fixUndefined(rows: any[], field: string): any {
    rows = rows.map((row) => {
      row[field] = !row[field] ? undefined : row[field];
      return row;
    });
    return rows;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  protected fixType(result: any): any {
    result.rows = result.rows ? result.rows : result.recordset;
    result.recordset = undefined;

    if (result.rows[0]) {
      if (result.rows[0].timestamp) {
        result.rows = this.fixDate(result.rows, 'timestamp');
      }
      if (result.rows[0].conclusion_date === null) {
        result.rows = this.fixUndefined(result.rows, 'conclusion_date');
      }
      if (result.rows[0].conclusion_date) {
        result.rows = this.fixDate(result.rows, 'conclusion_date');
      }
      if (result.rows[0].quantity) {
        result.rows = this.fixBigNumber(result.rows, 'quantity');
      }
      if (result.rows[0].quantity_payed) {
        result.rows = this.fixBigNumber(result.rows, 'quantity_payed');
      }
      if (result.rows[0].value_quantity) {
        result.rows = this.fixBigNumber(result.rows, 'value_quantity');
      }
      if (result.rows[0].product_quantity) {
        result.rows = this.fixBigNumber(result.rows, 'product_quantity');
      }
    }
    return result;
  }

  protected aggregateFromReceivedArray(realInput: any[]): any[] {
    return realInput.map((value) => this.aggregateFromReceived(value));
  }

  protected aggregateFromReceived(value): any {
    if (value.id)
      return {
        ...value,
        id: value.id.toString(),
      };
    return value;
  }

  protected realInput(input: PersistenceInput<DAOSimpleModel>): any {
    // console.log(input);

    let realInput = input.item ? input.item : {};
    if (realInput)
      if (Array.isArray(realInput))
        realInput = this.aggregateFromReceivedArray(realInput);
      else realInput = this.aggregateFromReceived(realInput);

    // console.log(realInput);
    return realInput;
  }

  protected generateContents(
    input: PersistenceInput<DAOSimpleModel>,
    method: string
  ): [any, any] {
    const input1 = !method.includes('create')
      ? method.includes('ById')
        ? input.id
        : input.selectedItem
      : this.realInput(input);
    const input2 = this.realInput(input);
    return [input1, input2];
  }

  protected persistencePromise(
    input: PersistenceInput<DAOSimpleModel>,
    method: string,
    resolve,
    reject
  ): void {
    this[method](...this.generateContents(input, method))
      .then((output) => {
        const persistencePromise: PersistencePromise<DAOSimpleModel> = {
          receivedItem: output,
          result: output,
          selectedItem: input.selectedItem,
          sentItem: input.item, //| input.sentItem,
        };
        // console.log(persistencePromise);
        resolve(persistencePromise);
      })
      .catch((error) => {
        reject(error);
      });
  }

  protected makePromise(
    input: PersistenceInput<DAOSimpleModel>,
    method: string
  ): Promise<PersistencePromise<DAOModel>> {
    return new Promise((resolve, reject) => {
      this.persistencePromise(input, method, resolve, reject);
    });
  }
}
