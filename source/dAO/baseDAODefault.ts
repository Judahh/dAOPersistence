/* eslint-disable @typescript-eslint/ban-ts-comment */
import BigNumber from 'bignumber.js';
import { settings } from 'ts-mixer';
import { Default } from 'flexiblepersistence';
import BaseDAODefaultInitializer from './baseDAODefaultInitializer';
import DAOSimpleModel from '../model/dAOSimpleModel';
import { Pool } from 'pg';
settings.initFunction = 'init';
/* eslint-disable @typescript-eslint/no-explicit-any */
export default class BaseDAODefault extends Default {
  // @ts-ignore
  protected table: string;

  protected baseClass = 'BaseDAO';

  protected constructor(initDefault?: BaseDAODefaultInitializer) {
    super(initDefault);
  }
  init(initDefault?: BaseDAODefaultInitializer): void {
    // console.log('init:', initDefault);

    super.init(initDefault);
    if (initDefault && initDefault.pool) this.setPool(initDefault.pool);

    // console.log(
    //   'Table:',
    //   this.table,
    //   ' and NOT Base:',
    //   !this.constructor.name.includes(this.baseClass)
    // );
    if (!this.table) {
      this.table = this.constructor.name; //TODO: modify to DB structure
      // console.log('Table changed:', this.table);
    }
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
    const update = `UPDATE ${this.table} SET ${set}`;
    return new Promise((resolve) => {
      resolve(update);
    });
  }
  protected async generateSelect(alias: string): Promise<string> {
    const select = `SELECT ${this.values} FROM ${alias} AS element ${this.selectJoin}`;
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
}
