/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// file deepcode ignore no-any: any needed
// file deepcode ignore object-literal-shorthand: argh
import BigNumber from 'bignumber.js';
import { settings } from 'ts-mixer';
import { IInput, IOutput } from 'flexiblepersistence';
import BaseDAODefaultInitializer from './iBaseDAODefault';
import IDAOSimple from '../model/iDAOSimple';
import IDAO from '../model/iDAO';
import { Default } from '@flexiblepersistence/default-initializer';
import { IPool } from '../database/iPool';
import Utils from '../utils';
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
    if (Utils.empty(this.values)) {
      this.values = this.getValues();
    }
  }

  getPool() {
    return this.pool;
  }

  setPool(pool: IPool) {
    this.pool = pool;
  }

  protected pool?: IPool;
  protected options?: {
    page?: number;
    pageSize?: number;
    numberOfPages?: number;
  };
  protected aliasFields?: {
    [key: string]: string;
  };
  protected groupBy = '';
  protected values = '*';

  protected selectJoin = '';

  // @ts-ignore
  protected abstract updateQuery: string;

  protected stringEquals?: string;
  protected regularEquals = '=';
  protected regularLimit = 'LIMIT';
  protected nullProperties = ['conclusion_date'];

  protected bigNumberProperties = [
    'quantity',
    'quantity_payed',
    'value_quantity',
    'product_quantity',
  ];

  protected dateProperties = ['timestamp', 'conclusion_date'];

  getEquals(element: unknown): string {
    return this.stringEquals && typeof element === 'string'
      ? this.stringEquals
      : this.regularEquals;
  }

  protected generateValueFromUnknown(element: unknown): unknown | string {
    if (typeof element === 'string' || element instanceof String)
      return "'" + element + "'";

    return element;
  }

  protected async generateUpdate(
    length: number,
    content: IDAOSimple
  ): Promise<string> {
    let pos = length;
    let set = this.updateQuery;
    const fields = await this.generateFields(content);
    if (content)
      set = fields.map((x) => '"' + x + '" ' + '=' + ' $' + pos++).join(', ');
    const update = `UPDATE ${this.getName()} SET ${set}`;
    return new Promise((resolve) => {
      resolve(update);
    });
  }
  protected async generateSelect(
    alias: string,
    limit?: string
  ): Promise<string> {
    const select = `SELECT ${limit ? limit : ''} * FROM (SELECT ${
      this.values
    } FROM ${alias} AS subElement ${this.selectJoin}) as element`;
    return new Promise((resolve) => {
      resolve(select);
    });
  }
  getValues(): string {
    const values: string[] = [];
    for (const field in this.aliasFields) {
      if (Object.prototype.hasOwnProperty.call(this.aliasFields, field)) {
        const defaultName = this.aliasFields[field];
        const name = `subElement.${
          this.aliasFields && this.aliasFields[defaultName]
            ? this.aliasFields[defaultName]
            : defaultName
        } AS ${field}`;
        values.push(name);
      }
    }
    return values.join(', ');
  }

  protected async generateWhere(
    filter,
    initialPosition = 1,
    withElement?: boolean
  ): Promise<string> {
    const fields = await this.generateFields(filter);
    const where =
      filter && fields.length > 0
        ? `WHERE ${fields
            .map(
              (x) =>
                (withElement ? 'element.' : '') +
                '"' +
                x +
                '" ' +
                this.getEquals(filter[x]) +
                ' ' +
                (initialPosition > -1
                  ? '$' + initialPosition++
                  : this.generateValueFromUnknown(filter[x]))
            )
            .join(' AND ')}`
        : '';
    return where;
  }

  protected basicGenerateFields(content?: IDAOSimple): string[] {
    const fields = content
      ? this.aliasFields
        ? Object.keys(content).map((value) => {
            return this.aliasFields ? this.aliasFields[value] || value : value;
          })
        : Object.keys(content)
      : [];

    return fields;
  }

  protected async generateFields(content?: IDAOSimple): Promise<string[]> {
    return new Promise((resolve) => {
      resolve(this.basicGenerateFields(content));
    });
  }

  protected basicGenerateValues(content?: IDAOSimple): unknown[] {
    return content ? Object.values(content) : [];
  }

  protected async generateValues(content?: IDAOSimple): Promise<unknown[]> {
    return new Promise((resolve) => {
      resolve(this.basicGenerateValues(content));
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
  protected fixType(result): any {
    result.rows = result.rows ? result.rows : result.recordset;
    result.recordset = undefined;
    if (result.rows)
      if (result?.rows[0]) {
        for (const nullProperty of this.nullProperties) {
          if (result.rows[0][nullProperty] === null) {
            result.rows = this.fixUndefined(result.rows, nullProperty);
          }
        }
        for (const dateProperty of this.dateProperties) {
          if (result.rows[0][dateProperty]) {
            result.rows = this.fixDate(result.rows, dateProperty);
          }
        }
        for (const bigNumberProperty of this.bigNumberProperties) {
          if (result.rows[0][bigNumberProperty]) {
            result.rows = this.fixBigNumber(result.rows, bigNumberProperty);
          }
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

  protected realInput(input: IInput<IDAOSimple | IDAOSimple[]>): any {
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
    input: IInput<IDAOSimple | IDAOSimple[]>,
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

  protected IOutput(
    input: IInput<IDAOSimple | IDAOSimple[]>,
    method: string,
    resolve,
    reject
  ): void {
    this[method](...this.generateContents(input, method))
      .then((output) => {
        const IOutput: IOutput<IDAOSimple | IDAOSimple[], IDAO> = {
          receivedItem: output,
          result: output,
          selectedItem: input.selectedItem,
          sentItem: input.item, //| input.sentItem,
        };
        // console.log(IOutput);
        resolve(IOutput);
      })
      .catch((error) => {
        reject(error);
      });
  }

  protected makePromise(
    input: IInput<IDAOSimple>,
    method: string
  ): Promise<IOutput<IDAOSimple, IDAO>> {
    return new Promise((resolve, reject) => {
      this.IOutput(input, method, resolve, reject);
    });
  }
}
