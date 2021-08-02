import { PersistenceInfo } from 'flexiblepersistence';

/* eslint-disable no-unused-vars */
export interface PoolAdapter {
  connect(
    callback?: (error?: Error, client?: unknown, release?: unknown) => void
  ): Promise<unknown>;
  query(script: string): Promise<unknown>;
  end(callback?: () => unknown): Promise<unknown>;
  getPersistenceInfo(): PersistenceInfo;
}
