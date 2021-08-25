import { PersistenceInfo } from 'flexiblepersistence';

/* eslint-disable no-unused-vars */
export interface PoolAdapter {
  simpleInsert: boolean;
  simpleUpdate: boolean;
  simpleDelete: boolean;
  connect(
    callback?: (error?: Error, client?: unknown, release?: unknown) => void
  ): Promise<unknown>;
  query(
    script: string,
    values?: Array<unknown>,
    callback?: () => unknown
  ): Promise<unknown>;
  end(callback?: () => unknown): Promise<unknown>;
  getPersistenceInfo(): PersistenceInfo;
}
