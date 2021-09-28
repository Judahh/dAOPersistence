/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// file deepcode ignore no-unknown: unknown needed
// file deepcode ignore object-literal-shorthand: argh
import {
  IOutput,
  PersistenceInfo,
  IInputCreate,
  IInputUpdate,
  IInput,
  IPersistence,
} from 'flexiblepersistence';
import { Pool } from 'pg';
import { RelationValuePostgresPersistence } from './relationValuePostgresPersistence';
import { SelectedItemValue } from './model/selectedItemValue';
import { IInputDelete, IInputRead } from 'flexiblepersistence';
import { Utils } from '..';
import { Default } from '@flexiblepersistence/default-initializer';
import { PersistenceFunction } from './model/persistenceFunction';
export class PostgresPersistence implements IPersistence {
  private persistenceInfo: PersistenceInfo;
  private pool: Pool;

  element: {
    [name: string]: Default;
  } = {};

  private static inspectSelectedItemValue(
    element: number | string | PersistenceFunction | SelectedItemValue
  ): SelectedItemValue {
    if (!(element instanceof SelectedItemValue)) {
      element = new SelectedItemValue(
        element,
        new RelationValuePostgresPersistence()
      );
    }
    return element;
  }

  private static getDBVariable(
    element: number | string | PersistenceFunction | SelectedItemValue
  ): string {
    return '' + element.toString() + '';
  }

  private static getDBSetVariable(
    name,
    element: number | string | PersistenceFunction | SelectedItemValue
  ): string {
    return (
      name +
      ' ' +
      PostgresPersistence.getDBVariable(
        PostgresPersistence.inspectSelectedItemValue(element)
      )
    );
  }

  private static getDBSetVariables(item): string[] {
    const keys = PostgresPersistence.resolveKeys(item);
    return keys.map((element) => {
      return PostgresPersistence.getDBSetVariable(element, item[element]);
    });
  }

  private static getDBVariables(item): string {
    return PostgresPersistence.resolveValues(item)
      .map(
        (
          element: number | string | PersistenceFunction | SelectedItemValue
        ) => {
          return "'" + PostgresPersistence.getDBVariable(element) + "'";
        }
      )
      .join(', ');
  }

  private static querySelectArray(
    scheme: string,
    selectedItem?: unknown,
    selectVar?: string
  ): string {
    if (!selectVar) {
      selectVar = '*';
    }
    return PostgresPersistence.resolveKeys(selectedItem).length === 0
      ? `SELECT ${selectVar} FROM ${scheme} ORDER BY id ASC`
      : `SELECT ${selectVar} FROM ${scheme} WHERE (${PostgresPersistence.getDBSetVariables(
          selectedItem
        ).join(', ')}) ORDER BY id ASC`;
  }

  private static querySelectItem(
    scheme: string,
    selectedItem?: unknown,
    selectVar?: string
  ): string {
    return (
      PostgresPersistence.querySelectArray(scheme, selectedItem, selectVar) +
      ` LIMIT 1`
    );
  }

  private static queryInsertItem(scheme: string, item?: unknown): string {
    return `INSERT INTO ${scheme} (${PostgresPersistence.resolveKeys(item).join(
      ', '
    )}) VALUES (${PostgresPersistence.getDBVariables(item)}) RETURNING *`;
  }

  private static queryUpdate(
    scheme: string,
    selectedItem?: unknown,
    item?: unknown
  ): string {
    return `UPDATE ${scheme} SET ${PostgresPersistence.getDBSetVariables(
      item
    ).join(', ')} WHERE (${PostgresPersistence.getDBSetVariables(
      selectedItem
    ).join(', ')}) RETURNING *`;
  }

  private static queryUpdateArray(
    scheme: string,
    selectedItem?: unknown,
    item?: unknown
  ): string {
    return `${this.queryUpdate(scheme, selectedItem, item)}`;
  }

  private static queryUpdateItem(
    scheme: string,
    selectedItem?: unknown,
    item?: unknown
  ): string {
    return `${this.queryUpdate(scheme, selectedItem, item)}`;
  }

  private static queryDeleteItem(
    scheme: string,
    selectedItem?: unknown
  ): string {
    return `DELETE FROM ${scheme} WHERE id IN (${PostgresPersistence.querySelectItem(
      scheme,
      selectedItem,
      'id'
    )})`;
  }

  private static queryDeleteArray(
    scheme: string,
    selectedItem?: unknown
  ): string {
    return `DELETE FROM ${scheme} WHERE id IN (${PostgresPersistence.querySelectArray(
      scheme,
      selectedItem,
      'id'
    )})`;
  }

  private static resolveKeys(item): string[] {
    return item ? Object.keys(item) : [];
  }

  private static resolveValues(
    item
  ): (number | string | PersistenceFunction | SelectedItemValue)[] {
    return item ? Object.values(item) : [];
  }

  private static queryResults(
    error,
    results,
    resolve,
    reject,
    toPromise: { selectedItem?; sentItem? },
    isItem?: boolean
  ): void {
    if (error) {
      // console.log('FUCKING error');
      // console.log(error);
      reject(new Error(error));
    } else {
      const result = {
        receivedItem: results
          ? isItem
            ? results.rows[0]
            : results.rows
          : results,
        selectedItem: toPromise.selectedItem,
        result: results,
        sentItem: toPromise.sentItem,
      };
      // console.log(result);
      resolve(result);
    }
  }

  constructor(persistenceInfo: PersistenceInfo) {
    this.persistenceInfo = persistenceInfo;
    this.pool = new Pool(this.persistenceInfo);
  }
  clear(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        await Utils.dropTables(this.pool);
        await Utils.init(this.pool);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  other(input: IInput<unknown>): Promise<IOutput<unknown, unknown>> {
    return new Promise<IOutput<unknown, unknown>>((resolve) => {
      resolve({
        receivedItem: input,
      });
    });
  }

  correct(input: IInputUpdate<unknown>): Promise<IOutput<unknown, unknown>> {
    return this.update(input);
  }

  nonexistent(input: IInputDelete): Promise<IOutput<unknown, unknown>> {
    return this.delete(input);
  }

  create(input: IInputCreate<unknown>): Promise<IOutput<unknown, unknown>> {
    if (!input.scheme) throw new Error('No Scheme');
    if (input.item instanceof Array) {
      return this.createArray(input.scheme, input.item);
    } else {
      return this.createItem(input.scheme, input.item);
    }
  }
  existent(input: IInputCreate<unknown>): Promise<IOutput<unknown, unknown>> {
    if (!input.scheme) throw new Error('No Scheme');
    if (input.item instanceof Array) {
      return this.createArray(input.scheme, input.item);
    } else {
      return this.createItem(input.scheme, input.item);
    }
  }
  update(input: IInputUpdate<unknown>): Promise<IOutput<unknown, unknown>> {
    if (!input.scheme) throw new Error('No Scheme');
    if (input.single || input.id) {
      return this.updateItem(input.scheme, input.selectedItem, input.item);
    } else {
      return this.updateArray(input.scheme, input.selectedItem, input.item);
    }
  }
  read(input: IInputRead): Promise<IOutput<unknown, unknown>> {
    if (!input.scheme) throw new Error('No Scheme');
    if (input.single || input.id) {
      if (input.id) return this.readItemById(input.scheme, input.id);
      return this.readItem(input.scheme, input.selectedItem);
    } else {
      return this.readArray(input.scheme, input.selectedItem);
    }
  }
  delete(input: IInputDelete): Promise<IOutput<unknown, unknown>> {
    if (!input.scheme) throw new Error('No Scheme');
    if (input.single || input.id) {
      if (input.id) return this.deleteItem(input.scheme, input.id);
      return this.deleteItem(input.scheme, input.selectedItem);
    } else {
      return this.deleteArray(input.scheme, input.selectedItem);
    }
  }

  async createItem(
    scheme: string,
    item?: unknown
  ): Promise<IOutput<unknown, unknown>> {
    const query = PostgresPersistence.queryInsertItem(scheme, item);
    // console.log('createItem: ', item, scheme);
    return this.query(query, { sentItem: item }, true);
  }

  async createArray(
    scheme: string,
    items?: unknown[]
  ): Promise<IOutput<unknown, unknown>> {
    const received = Array<IOutput<unknown, unknown>>();
    if (items)
      for (const item of items) {
        received.push(await this.createItem(scheme, item));
      }
    return new Promise<IOutput<unknown, unknown>>((resolve) => {
      resolve({
        receivedItem: received.map(({ receivedItem }) => receivedItem),
        result: received.map(({ result }) => result),
        sentItem: received.map(({ sentItem }) => sentItem),
      });
    });
  }

  updateItem(
    scheme: string,
    selectedItem?: unknown,
    item?: unknown
  ): Promise<IOutput<unknown, unknown>> {
    const query = PostgresPersistence.queryUpdateItem(
      scheme,
      selectedItem,
      item
    );
    return this.query(query, { selectedItem, sentItem: item }, true);
  }

  updateArray(
    scheme: string,
    selectedItem?: unknown,
    item?: unknown
  ): Promise<IOutput<unknown, unknown>> {
    const query = PostgresPersistence.queryUpdateArray(
      scheme,
      selectedItem,
      item
    );
    return this.query(query, { selectedItem, sentItem: item }, true);
  }

  readArray(
    scheme: string,
    selectedItem?: unknown
  ): Promise<IOutput<unknown, unknown>> {
    const query = PostgresPersistence.querySelectArray(scheme, selectedItem);
    return this.query(query, { selectedItem });
  }

  readItem(
    scheme: string,
    selectedItem?: unknown
  ): Promise<IOutput<unknown, unknown>> {
    const query = PostgresPersistence.querySelectItem(scheme, selectedItem);
    return this.query(query, { selectedItem }, true);
  }

  readItemById(
    scheme: string,
    id: unknown
  ): Promise<IOutput<unknown, unknown>> {
    const query = PostgresPersistence.querySelectItem(scheme, { id: id });
    return this.query(query, { selectedItem: { id: id } }, true);
  }

  deleteItem(
    scheme: string,
    selectedItem?: unknown
  ): Promise<IOutput<unknown, unknown>> {
    const query = PostgresPersistence.queryDeleteItem(scheme, selectedItem);
    // console.log('DeleteItem :', selectedItem);
    return this.query(query, { selectedItem }, true);
  }

  deleteArray(
    scheme: string,
    selectedItem?: unknown
  ): Promise<IOutput<unknown, unknown>> {
    const query = PostgresPersistence.queryDeleteArray(scheme, selectedItem);
    // console.log('DeleteArray: ', query);
    return this.query(query, { selectedItem });
  }

  getPersistenceInfo(): PersistenceInfo {
    return this.persistenceInfo;
  }

  getPool(): Pool {
    // TODO: remove
    return this.pool;
  }

  close(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.end(resolve);
    });
  }

  private end(resolve): void {
    this.pool.end(() => {
      resolve(true);
    });
  }

  private async query(
    query: string,
    toPromise: { selectedItem?; sentItem? },
    isItem?: boolean
  ): Promise<IOutput<unknown, unknown>> {
    return new Promise<IOutput<unknown, unknown>>((resolve, reject) => {
      // console.log(query);

      this.pool.query(query, (error, results) => {
        PostgresPersistence.queryResults(
          error,
          results,
          resolve,
          reject,
          toPromise,
          isItem
        );
      });
    });
  }
}
