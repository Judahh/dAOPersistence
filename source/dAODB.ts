/* eslint-disable @typescript-eslint/no-explicit-any */
// file deepcode ignore no-any: any needed
import {
  PersistenceAdapter,
  PersistenceInfo,
  PersistencePromise,
  PersistenceInputCreate,
  PersistenceInputUpdate,
  PersistenceInputRead,
  PersistenceInputDelete,
  PersistenceInput,
} from 'flexiblepersistence';
import { Pool } from 'pg';
import BaseDAODefault from './dAO/baseDAODefault';
import BaseDAODefaultInitializer from './dAO/baseDAODefaultInitializer';
import Utils from './utils';
export class DAODB implements PersistenceAdapter {
  private persistenceInfo: PersistenceInfo;
  private pool: Pool;
  private type = 'DAO';

  element: {
    [name: string]: BaseDAODefault;
  } = {
    // mongo: mongoDB
  };

  constructor(
    persistenceInfo: PersistenceInfo,
    element?: {
      [name: string]: BaseDAODefault;
    }
  ) {
    this.persistenceInfo = persistenceInfo;
    this.initPool();
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
  other(input: PersistenceInput<any>): Promise<PersistencePromise<any>> {
    return this.persistenceInfo.journaly.publish(
      input.scheme + this.type + '.' + 'other',
      input
    );
  }
  create(input: PersistenceInputCreate<any>): Promise<PersistencePromise<any>> {
    return this.persistenceInfo.journaly.publish(
      input.scheme + this.type + '.' + 'create',
      input
    );
  }
  existent(
    input: PersistenceInputCreate<any>
  ): Promise<PersistencePromise<any>> {
    return this.create(input);
  }
  nonexistent(input: PersistenceInputDelete): Promise<PersistencePromise<any>> {
    return this.delete(input);
  }
  delete(input: PersistenceInputDelete): Promise<PersistencePromise<any>> {
    return this.persistenceInfo.journaly.publish(
      input.scheme + this.type + '.' + 'delete',
      input
    );
  }
  correct(
    input: PersistenceInputUpdate<any>
  ): Promise<PersistencePromise<any>> {
    return this.update(input);
  }
  update(input: PersistenceInputUpdate<any>): Promise<PersistencePromise<any>> {
    return this.persistenceInfo.journaly.publish(
      input.scheme + this.type + '.' + 'update',
      input
    );
  }
  read(input: PersistenceInputRead): Promise<PersistencePromise<any>> {
    return this.persistenceInfo.journaly.publish(
      input.scheme + this.type + '.' + 'read',
      input
    );
  }

  protected initPool() {
    this.pool = new Pool(this.persistenceInfo);
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
}
