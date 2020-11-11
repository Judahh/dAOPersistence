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

  private realInput(input) {
    const realInput = input.item;
    if (input['id']) realInput['id'] = input['id'];
    if (input['_id']) realInput['_id'] = input['_id'];
    return realInput;
  }

  private async persistencePromise(input, method) {
    const output = (
      await this.persistenceInfo.journaly.publish(
        input.scheme + 'DAO.' + method,
        this.realInput(input)
      )
    )[0];

    const persistencePromise: PersistencePromise = {
      receivedItem: output,
      result: output,
      selectedItem: input.selectedItem,
      sentItem: input.item,
    };
    return persistencePromise;
  }

  private async makePromise(input, method): Promise<PersistencePromise> {
    return new Promise(async (resolve) => {
      resolve(this.persistencePromise(input, method));
    });
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
    return this.makePromise(input, 'correct');
  }

  public async nonexistent(
    input: PersistenceInputDelete
  ): Promise<PersistencePromise> {
    return this.makePromise(input, 'nonexistent');
  }

  public async existent(
    input: PersistenceInputCreate
  ): Promise<PersistencePromise> {
    return this.makePromise(input, 'existent');
  }

  public async create(
    input: PersistenceInputCreate
  ): Promise<PersistencePromise> {
    // console.log('CREATE:', input);
    return this.makePromise(input, 'store');
  }
  public async update(
    input: PersistenceInputUpdate
  ): Promise<PersistencePromise> {
    return this.makePromise(input, 'update');
  }
  public async read(input: PersistenceInputRead): Promise<PersistencePromise> {
    // console.log('read', input);
    return input.single
      ? input.selectedItem
        ? this.makePromise(input, 'select')
        : this.makePromise(input, 'selectById')
      : this.makePromise(input, 'selectAll');
  }
  public async delete(
    input: PersistenceInputDelete
  ): Promise<PersistencePromise> {
    return this.makePromise(input, 'delete');
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
