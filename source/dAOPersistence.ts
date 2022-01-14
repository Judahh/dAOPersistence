/* eslint-disable @typescript-eslint/no-explicit-any */
// file deepcode ignore no-any: any needed
import {
  IPersistence,
  PersistenceInfo,
  IOutput,
  IInputCreate,
  IInputUpdate,
  IInputRead,
  IInputDelete,
  IInput,
} from 'flexiblepersistence';
import BaseDAODefault from './dAO/baseDAODefault';
import BaseDAODefaultInitializer from './dAO/iBaseDAODefault';
import { IPool } from './database/iPool';
import { Utils } from './utils';
export class DAOPersistence implements IPersistence {
  private persistenceInfo: PersistenceInfo;
  private pool: IPool;
  private type = 'DAO';

  element: {
    [name: string]: BaseDAODefault;
  } = {
    // mongo: mongoDB
  };

  constructor(
    pool: IPool,
    element?: {
      [name: string]: BaseDAODefault;
    }
  ) {
    this.pool = pool;
    this.persistenceInfo = pool.getPersistenceInfo();
    if (element) this.setElement(element);
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
  other(input: IInput<any>): Promise<IOutput<unknown, unknown>> {
    return this.persistenceInfo.journaly.publish(
      input.scheme + this.type + '.' + 'other',
      input
    );
  }
  create(input: IInputCreate<any>): Promise<IOutput<unknown, unknown>> {
    return this.persistenceInfo.journaly.publish(
      input.scheme + this.type + '.' + 'create',
      input
    );
  }
  read(input: IInputRead): Promise<IOutput<unknown, unknown>> {
    return this.persistenceInfo.journaly.publish(
      input.scheme + this.type + '.' + 'read',
      input
    );
  }
  update(input: IInputUpdate<any>): Promise<IOutput<unknown, unknown>> {
    return this.persistenceInfo.journaly.publish(
      input.scheme + this.type + '.' + 'update',
      input
    );
  }
  delete(input: IInputDelete): Promise<IOutput<unknown, unknown>> {
    return this.persistenceInfo.journaly.publish(
      input.scheme + this.type + '.' + 'delete',
      input
    );
  }
  protected initElement() {
    const initDefault: BaseDAODefaultInitializer = {
      pool: this.pool,
      journaly: this.persistenceInfo.journaly,
    };
    for (const key in this.element) {
      if (Object.prototype.hasOwnProperty.call(this.element, key)) {
        const element = this.element[key];
        element.init(initDefault);
      }
    }
  }

  setElement(element: { [name: string]: BaseDAODefault }) {
    this.element = element;
    this.initElement();
  }

  getPersistenceInfo(): PersistenceInfo {
    return this.persistenceInfo;
  }

  getPool(): IPool {
    // TODO: remove
    return this.pool;
  }

  close(): Promise<boolean> {
    return this.pool.end();
  }
}
