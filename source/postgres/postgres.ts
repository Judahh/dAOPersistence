import { PoolAdapter } from '../database/poolAdapter';
import { Pool } from 'pg';
import { PersistenceInfo } from 'flexiblepersistence';

export class Postgres implements PoolAdapter {
  protected pool: Pool;
  protected persistenceInfo: PersistenceInfo;
  constructor(persistenceInfo: PersistenceInfo) {
    this.persistenceInfo = persistenceInfo;
    this.pool = new Pool(this.persistenceInfo);
  }
  public getPersistenceInfo(): PersistenceInfo {
    return this.persistenceInfo;
  }
  public connect(callback: unknown): Promise<unknown> {
    return this.pool.connect(callback);
  }
  public query(script: string): Promise<unknown> {
    return this.pool.query(script);
  }
  public end(callback?: () => unknown): Promise<any> {
    return this.pool.end(callback);
  }
}
