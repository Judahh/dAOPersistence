/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PersistenceAdapter,
  PersistenceInfo,
  PersistencePromise,
  // RelationValueDAODB,
  // SelectedItemValue,
  PersistenceInputCreate,
  PersistenceInputUpdate,
  PersistenceInputRead,
  PersistenceInputDelete,
} from 'flexiblepersistence';
import { Pool } from 'pg';
export class DAODB implements PersistenceAdapter {
  private persistenceInfo: PersistenceInfo;
  private pool: Pool;

  constructor(persistenceInfo: PersistenceInfo) {
    this.persistenceInfo = persistenceInfo;
    this.pool = new Pool(this.persistenceInfo);
  }

  public async correct(
    input: PersistenceInputUpdate
  ): Promise<PersistencePromise> {
    //! Envia o input para o service determinado pelo esquema e lá ele faz as
    //! operações necessárias usando o journaly para acessar outros DAOs ou
    //! DAOs.
    //! Sempre deve-se receber informações do tipo input e o output deve ser
    //! compatível com o input para pemitir retro-alimentação.
    //! Atualizar o input para que utilize o melhor dos dois
    //! (input e parametros usados no SimpleAPI).
    //return (await this.service('selectById', id))[0];
    return this.persistenceInfo.journaly.publish(
      input.scheme + 'DAO.correct',
      input
    )[0];
  }

  public async nonexistent(
    input: PersistenceInputDelete
  ): Promise<PersistencePromise> {
    return this.persistenceInfo.journaly.publish(
      input.scheme + 'DAO.nonexistent',
      input
    )[0];
  }

  public async existent(
    input: PersistenceInputCreate
  ): Promise<PersistencePromise> {
    return this.persistenceInfo.journaly.publish(
      input.scheme + 'DAO.existent',
      input
    )[0];
  }

  public async create(
    input: PersistenceInputCreate
  ): Promise<PersistencePromise> {
    console.log('CREATE:', input);
    // console.log('Journaly:');
    return new Promise(async (resolve) => {
      resolve(
        (
          await this.persistenceInfo.journaly.publish(
            input.scheme + 'DAO.store',
            input
          )
        )[0]
      );
    });
  }
  public async update(
    input: PersistenceInputUpdate
  ): Promise<PersistencePromise> {
    return this.persistenceInfo.journaly.publish(
      input.scheme + 'DAO.update',
      input
    )[0];
  }
  public async read(input: PersistenceInputRead): Promise<PersistencePromise> {
    return this.persistenceInfo.journaly.publish(
      input.scheme + 'DAO.read',
      input
    )[0];
  }
  public async delete(
    input: PersistenceInputDelete
  ): Promise<PersistencePromise> {
    console.log('DELETE');

    return this.persistenceInfo.journaly.publish(
      input.scheme + 'DAO.delete',
      input
    )[0];
  }

  public getPersistenceInfo(): PersistenceInfo {
    return this.persistenceInfo;
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
