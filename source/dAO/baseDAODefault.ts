/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// file deepcode ignore no-any: any needed
// file deepcode ignore object-literal-shorthand: argh
import BigNumber from 'bignumber.js';
import { IInput, IOutput, IEventOptions } from 'flexiblepersistence';
import BaseDAODefaultInitializer from './iBaseDAODefault';
import IDAOSimple from '../model/iDAOSimple';
import IDAO from '../model/iDAO';
import { Default } from '@flexiblepersistence/default-initializer';
import { IPool } from '../database/iPool';
import { Utils } from '../utils';
import { ObjectUtils } from '../objectUtils';
/* eslint-disable @typescript-eslint/no-explicit-any */
export default abstract class BaseDAODefault extends Default {
  constructor(initDefault?: BaseDAODefaultInitializer) {
    super(initDefault);
  }
  init(initDefault?: BaseDAODefaultInitializer): void {
    // console.log('init:', initDefault);

    super.init(initDefault);
    if (initDefault && initDefault.pool) this.setPool(initDefault.pool);
    if (Utils.empty(this.values)) {
      this.values = this.getValues(true, true, true);
    }
  }

  getPool() {
    return this.pool;
  }

  setPool(pool: IPool) {
    this.pool = pool;
  }

  protected pool?: IPool;
  protected options?: IEventOptions;
  protected aliasFields?: {
    [key: string]: string | undefined;
  };
  protected aliasFieldsTable?: {
    [key: string]: string;
  };
  protected aliasFieldsCompound?: {
    [key: string]: boolean;
  };
  protected groupBy = '';
  protected values = '*';

  protected selectJoin = '';

  // @ts-ignore
  protected updateQuery: string;

  protected stringEquals = 'LIKE';
  protected regularEquals = '=';
  protected notEquals = '<>';
  protected arrayEquals = 'IN';
  protected arrayNotEquals = 'NOT IN';
  protected greaterOrEquals = '>=';
  protected lessOrEquals = '<=';
  protected greater = '>';
  protected less = '<';
  protected regularLimit = 'LIMIT';
  protected nullProperties?: string[];

  protected bigNumberProperties?: string[];

  protected dateProperties?: string[];

  getEquals(element: unknown, found?: string): string {
    if (Array.isArray(element)) {
      if (found === this.notEquals || found === this.arrayNotEquals) {
        return this.arrayNotEquals;
      } else {
        return this.arrayEquals;
      }
    }
    if (found === undefined || found === null || found === '') {
      const date =
        typeof element === 'string' &&
        this.stringEquals !== undefined &&
        this.stringEquals !== null &&
        (new Date(element) as unknown as number);
      if (
        typeof element === 'string' &&
        this.stringEquals !== undefined &&
        this.stringEquals !== null &&
        (element.includes('%') || !(date >= 0))
      ) {
        found = this.stringEquals;
      } else {
        found = this.regularEquals;
      }
    }
    found = found || this.regularEquals;
    return found;
  }

  protected generateValueFromUnknown(element: unknown): unknown | string {
    if (element === undefined || element === null) {
      return 'NULL';
    }

    if (Array.isArray(element)) {
      return (
        '(' +
        element.map((a) => this.generateValueFromUnknown(a)).join(',') +
        ')'
      );
    }

    if (typeof element === 'string' || element instanceof String)
      return "'" + element + "'";

    return element;
  }

  protected async generateUpdate(
    length: number,
    content: IDAOSimple,
    useTable?: boolean,
    useAlias?: boolean,
    useCompound?: boolean,
    useSubElement?: boolean,
    manualFields?: string[],
    manualValues?: string[]
  ): Promise<string> {
    let pos = length;
    let set = this.updateQuery;
    const fields = await this.generateFields(
      content,
      useTable,
      useAlias,
      useCompound,
      useSubElement
    );
    if (content) {
      const sets = fields.map((x) => '"' + x + '" ' + '=' + ' $' + pos++);
      if (
        manualFields &&
        manualValues &&
        manualFields.length == manualValues.length
      ) {
        for (let i = 0; i < manualFields.length; i++) {
          sets.push(`"${manualFields[i]}" = ${manualValues[i]}`);
        }
      }
      set = sets.join(', ');
    }
    const update = `UPDATE ${this.getName()} SET ${set}`;
    return new Promise((resolve) => {
      resolve(update);
    });
  }
  protected async generateSelect(
    alias: string,
    limit?: string,
    useAll?: boolean,
    selection?: string,
    options?: { distinct?: boolean }
  ): Promise<string> {
    const mainSelect =
      'SELECT ' +
      (options?.distinct !== undefined && options?.distinct
        ? 'DISTINCT '
        : '') +
      (limit !== undefined ? limit + ' ' : '') +
      (selection !== undefined ? selection : '*');

    const subSelect =
      (useAll !== undefined && useAll
        ? alias + ' '
        : `(SELECT ${this.values} FROM ${alias} ` +
          `AS subElement ${this.selectJoin}) `) + `as element`;

    const select = mainSelect + ' FROM ' + subSelect;

    // console.log('generateSelect:');

    // console.log('limit:', limit);
    // console.log('alias:', alias);
    // console.log('useAll:', useAll);
    // console.log('selection:', selection);
    // console.log('options:', options);
    // console.log('values:', this.values);
    // console.log('selectJoin:', this.selectJoin);

    // console.log('mainSelect:', mainSelect);
    // console.log('subSelect:', subSelect);
    // console.log('generateSelect:', select);

    return new Promise((resolve) => {
      resolve(select);
    });
  }

  getFieldTable(
    field: string,
    useTable?: boolean,
    useSubElement?: string | boolean
  ): string {
    const aliasFieldsTable = this.aliasFieldsTable;
    const aliasFieldTable = useTable
      ? aliasFieldsTable && aliasFieldsTable[field]
        ? aliasFieldsTable[field] + '.'
        : useSubElement
        ? typeof useSubElement === 'string'
          ? useSubElement
          : 'subElement.'
        : ''
      : '';
    return aliasFieldTable;
  }

  getValues(
    useTable?: boolean,
    useAlias?: boolean,
    useSubElement?: boolean
  ): string {
    const values: string[] = [];
    const aliasFields = this.aliasFields;
    for (const field in aliasFields) {
      if (Object.prototype.hasOwnProperty.call(aliasFields, field)) {
        const defaultName = aliasFields[field] || field;
        const hasFields = useAlias && aliasFields;
        const realName = hasFields ? defaultName : field;
        const aliasFieldTable = this.getFieldTable(
          realName,
          useTable,
          useSubElement
        );
        const name = `${aliasFieldTable}${realName} AS ${field}`;
        values.push(name);
      }
    }
    return values.join(', ');
  }

  protected async generateWhere(
    filter,
    initialPosition = 1,
    withElement?: boolean,
    useTable?: boolean,
    useAlias?: boolean,
    useCompound?: boolean
  ): Promise<string> {
    filter = filter ? filter : {};
    const fields = await this.generateFields(
      filter,
      useTable,
      useAlias,
      useCompound,
      withElement ? 'element.' : false
    );
    // console.log('filter:', filter);
    // const aliasFields = this.aliasFields;
    // console.log('aliasFields:', aliasFields);
    const aliasFields = filter ? Object.keys(filter) : [];
    // console.log('aliasFieldsArray:', aliasFieldsArray);
    const where =
      filter && fields.length > 0
        ? `WHERE ${fields
            .map((x, index: number) => {
              const y = aliasFields[index];
              // console.log('y:', y);
              const value = filter[x] || filter[y];
              let found = y
                ?.match(/\.\$\w*/)?.[0]
                ?.replace('.$gte', this.greaterOrEquals)
                ?.replace('.$lte', this.lessOrEquals)
                ?.replace('.$gt', this.greater)
                ?.replace('.$lt', this.less)
                ?.replace('.$ne', this.notEquals)
                ?.replace('.$nin', this.notEquals)
                ?.trim();
              found = this.getEquals(value, found);
              // console.log('found:', found);
              // console.log('x:', x);
              // console.log('value:', value);
              const toReturn =
                x +
                ' ' +
                found +
                ' ' +
                (initialPosition > -1
                  ? '$' + initialPosition++
                  : this.generateValueFromUnknown(value));
              // console.log('toReturn:', toReturn);

              return toReturn;
            })
            .join(' AND ')}`
        : '';
    return where;
  }

  protected async getIdField(
    useTable?: boolean,
    useAlias?: boolean,
    useCompound?: boolean,
    useSubElement?: boolean | string
  ): Promise<string> {
    const idField = (
      await this.generateFields(
        { id: '' },
        useTable,
        useAlias,
        useCompound,
        useSubElement
      )
    )[0];
    return idField;
  }

  protected basicGenerateFields(
    content?: IDAOSimple,
    useTable?: boolean,
    useAlias?: boolean,
    useCompound?: boolean,
    useSubElement?: string | boolean
  ): string[] {
    const newContent = this.filteredContent(content, useCompound);
    // console.log('newContent:', newContent);
    const fields = newContent
      ? useTable || (useAlias && this.aliasFields)
        ? Object.keys(newContent).map((key) => {
            key = key?.replace('[]', '');
            key = key?.replace(/\.\$\w*/, '');
            const aliasFieldTable = this.getFieldTable(
              key,
              useTable,
              useSubElement
            );
            const newKey =
              aliasFieldTable +
              (useAlias && this.aliasFields
                ? this.aliasFields[key] || key
                : key);
            return newKey;
          })
        : Object.keys(newContent).map((key) =>
            key?.replace('[]', '')?.replace(/\.\$\w*/, '')
          )
      : [];
    // console.log('fields:', fields);
    return fields;
  }

  protected async generateFields(
    content?: IDAOSimple,
    useTable?: boolean,
    useAlias?: boolean,
    useCompound?: boolean,
    useSubElement?: string | boolean
  ): Promise<string[]> {
    return new Promise((resolve) => {
      resolve(
        this.basicGenerateFields(
          content,
          useTable,
          useAlias,
          useCompound,
          useSubElement
        )
      );
    });
  }

  protected filteredContent(content?: IDAOSimple, useCompound?: boolean) {
    return useCompound
      ? content
      : ObjectUtils.filter(content, (key) =>
          this.aliasFieldsCompound ? !this.aliasFieldsCompound[key] : true
        );
  }

  protected basicGenerateValues(
    content?: IDAOSimple,
    useCompound?: boolean
  ): unknown[] {
    const newContent = this.filteredContent(content, useCompound);
    return newContent ? Object.values(newContent) : [];
  }

  protected async generateValues(
    content?: IDAOSimple,
    useCompound?: boolean
  ): Promise<unknown[]> {
    content = content ? content : ({} as IDAOSimple);
    return new Promise((resolve) => {
      resolve(this.basicGenerateValues(content, useCompound));
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
    result.rows = result?.rows ? result?.rows : result?.recordset;
    result.recordset = undefined;
    if (result.rows)
      if (result?.rows[0]) {
        if (result.rows[0].ID) {
          result.rows = this.fixId(result.rows);
        }
        if (this.aliasFields) result.rows = this.fixAlias(result.rows);
        if (this.nullProperties)
          for (const nullProperty of this.nullProperties) {
            if (result.rows[0][nullProperty] === null) {
              result.rows = this.fixUndefined(result.rows, nullProperty);
            }
          }
        if (this.dateProperties)
          for (const dateProperty of this.dateProperties) {
            if (result.rows[0][dateProperty]) {
              result.rows = this.fixDate(result.rows, dateProperty);
            }
          }
        if (this.bigNumberProperties)
          for (const bigNumberProperty of this.bigNumberProperties) {
            if (result.rows[0][bigNumberProperty]) {
              result.rows = this.fixBigNumber(result.rows, bigNumberProperty);
            }
          }
      }
    return result;
  }
  fixId(rows: any): any {
    rows = rows.map((row) => {
      row.id = row.ID ? row.ID : row.id;
      delete row.ID;
      return row;
    });
    return rows;
  }

  fixAlias(rows: any): any {
    for (const key in this.aliasFields) {
      if (Object.prototype.hasOwnProperty.call(this.aliasFields, key)) {
        const alias = this.aliasFields[key];
        if (alias)
          rows = rows.map((row) => {
            const rAlias =
              row[alias] ||
              row[alias.toLowerCase()] ||
              row[alias.toUpperCase()];
            row[key] = rAlias ? rAlias : row[key];
            if (key != alias) delete row[alias];
            if (key != alias.toLowerCase()) delete row[alias.toLowerCase()];
            if (key != alias.toUpperCase()) delete row[alias.toUpperCase()];
            return row;
          });
      }
    }

    return rows;
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

  protected realInput(
    input: IInput<IDAOSimple | IDAOSimple[], IDAOSimple | IDAOSimple[]>
  ): any {
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
    input: IInput<IDAOSimple | IDAOSimple[], IDAOSimple | IDAOSimple[]>,
    method: string
  ): [any, any, any, any] | [any, any?, any?, any?] {
    if (
      method.includes('read') ||
      method.includes('delete') ||
      method.includes('update')
    ) {
      return [
        input.id ? { ...input.selectedItem, id: input.id } : input.selectedItem,
        (input.id && !Array.isArray(input.id)) || input.single,
        input.eventOptions,
        this.realInput(input),
      ];
    }
    return [this.realInput(input)];
  }

  protected IOutput(
    input: IInput<IDAOSimple, IDAOSimple>,
    method: string,
    resolve,
    reject
  ): void {
    this[method](...this.generateContents(input, method))
      .then((output) => {
        const IOutput: IOutput<
          IDAOSimple | IDAOSimple[],
          IDAOSimple | IDAOSimple[],
          IDAO
        > = {
          receivedItem: output,
          result: output,
          selectedItem: input.selectedItem,
          sentItem: input.item, //| input.sentItem,
        };
        // console.log('IOutput:', IOutput);
        resolve(IOutput);
      })
      .catch((error) => {
        reject(error);
      });
  }

  protected makePromise(
    input: IInput<IDAOSimple, IDAOSimple>,
    method: string
  ): Promise<IOutput<IDAOSimple, IDAOSimple, IDAO>> {
    return new Promise((resolve, reject) => {
      this.IOutput(input, method, resolve, reject);
    });
  }

  protected async generateVectorValuesFromArray(
    content: IDAOSimple[],
    useTable?: boolean,
    useAlias?: boolean,
    useCompound?: boolean,
    useSubElement?: boolean
  ): Promise<unknown[][]> {
    const values: unknown[][] = [];
    const first = content[0];
    const fields = await this.generateFields(
      first,
      useTable,
      useAlias,
      useCompound,
      useSubElement
    );

    for (const subContent of content) {
      const value: unknown[] = [];
      for (const field of fields) {
        value.push(subContent[field]);
      }
      values.push(value);
    }

    return new Promise((resolve) => resolve(values));
  }
}
