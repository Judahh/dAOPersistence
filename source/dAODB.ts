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

  private persistencePromise(input, method, resolve, reject) {
    this.persistenceInfo.journaly
      .publish(
        input.scheme + 'DAO.' + method,
        method.includes('update')
          ? method.includes('ById')
            ? input.id
            : input.selectedItem
          : this.realInput(input),
        this.realInput(input)
      )
      .then((output) => {
        const persistencePromise: PersistencePromise = {
          receivedItem: output,
          result: output,
          selectedItem: input.selectedItem,
          sentItem: input.item, //| input.sentItem,
        };
        // console.log(persistencePromise);
        resolve(persistencePromise);
      })
      .catch((error) => {
        reject(error);
      });
  }

  private makePromise(input, method): Promise<PersistencePromise> {
    return new Promise((resolve, reject) => {
      this.persistencePromise(input, method, resolve, reject);
    });
  }

  correct(input: PersistenceInputUpdate): Promise<PersistencePromise> {
    //! Envia o input para o service determinado pelo esquema e lá ele faz as
    //! operações necessárias usando o journaly para acessar outros DAOs ou
    //! DAOs.
    //! Sempre deve-se receber informações do tipo input e o output deve ser
    //! compatível com o input para pemitir retro-alimentação.
    //! Atualizar o input para que utilize o melhor dos dois
    //! (input e parametros usados no SimpleAPI).
    return this.makePromise(input, 'correct');
  }

  nonexistent(input: PersistenceInputDelete): Promise<PersistencePromise> {
    return this.makePromise(input, 'nonexistent');
  }

  existent(input: PersistenceInputCreate): Promise<PersistencePromise> {
    return this.makePromise(input, 'existent');
  }

  create(input: PersistenceInputCreate): Promise<PersistencePromise> {
    // console.log('CREATE:', input);
    return this.makePromise(input, 'store');
  }
  update(input: PersistenceInputUpdate): Promise<PersistencePromise> {
    return input.id
      ? this.makePromise(input, 'updateById')
      : this.makePromise(input, 'update');
  }
  read(input: PersistenceInputRead): Promise<PersistencePromise> {
    // console.log('read', input);
    return input.single
      ? input.selectedItem
        ? this.makePromise(input, 'select')
        : this.makePromise(input, 'selectById')
      : this.makePromise(input, 'selectAll');
  }
  delete(input: PersistenceInputDelete): Promise<PersistencePromise> {
    return input.id
      ? this.makePromise(input, 'deleteById')
      : this.makePromise(input, 'delete');
  }

  getPersistenceInfo(): PersistenceInfo {
    return this.persistenceInfo;
  }

  getPool(): Pool {
    // TODO: remove
    return this.pool;
  }

  close(): Promise<unknown> {
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
