/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PersistenceAdapter,
  DatabaseInfo,
  PersistencePromise,
  // RelationValuePostgresDB,
  // SelectedItemValue,
  PersistenceInputCreate,
  PersistenceInputUpdate,
  PersistenceInputRead,
  PersistenceInputDelete,
} from 'flexiblepersistence';
import { Journaly } from 'journaly';
import { Pool } from 'pg';
export class PostgresDB implements PersistenceAdapter {
  private databaseInfo: DatabaseInfo;
  private pool: Pool;

  constructor(databaseInfo: DatabaseInfo) {
    this.databaseInfo = databaseInfo;
    this.pool = new Pool(this.databaseInfo);
  }

  public async correct(
    input: PersistenceInputUpdate
  ): Promise<PersistencePromise> {
    //! Envia o input para o service determinado pelo esquema e lá ele faz as
    //! operações necessárias usando o journaly para acessar outros Services ou
    //! DAOs.
    //! Sempre deve-se receber informações do tipo input e o output deve ser
    //! compatível com o input para pemitir retro-alimentação.
    //! Atualizar o input para que utilize o melhor dos dois
    //! (input e parametros usados no SimpleAPI).
    //return (await this.service('selectById', id))[0];
    return (await this.journaly.publish(input.scheme + '.selectAll', input))[0];
  }

  public nonexistent(
    input: PersistenceInputDelete
  ): Promise<PersistencePromise> {}

  public create(input: PersistenceInputCreate): Promise<PersistencePromise> {}
  public update(input: PersistenceInputUpdate): Promise<PersistencePromise> {}
  public read(input: PersistenceInputRead): Promise<PersistencePromise> {}
  public delete(input: PersistenceInputDelete): Promise<PersistencePromise> {}

  public getDatabaseInfo(): DatabaseInfo {
    return this.databaseInfo;
  }

  public getPool(): Pool {
    // TODO: remove
    return this.pool;
  }

  public close(): Promise<unknown> {
    return new Promise<unknown>((resolve) => {
      this.end(resolve);
    });
  }

  private end(resolve): void {
    this.pool.end(() => {
      resolve();
    });
  }
}
