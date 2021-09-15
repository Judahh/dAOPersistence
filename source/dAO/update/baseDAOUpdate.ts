/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOModel from '../../model/dAOModel';
import DAOSimpleModel from '../../model/dAOSimpleModel';
import BaseDAORestrictedDefault from '../baseDAORestrictedDefault';
import {
  AlterAdapter,
  PersistenceInputUpdate,
  PersistencePromise,
} from 'flexiblepersistence';

// @ts-ignore
export default class BaseDAOUpdate
  extends BaseDAORestrictedDefault
  implements AlterAdapter<DAOSimpleModel, DAOModel>
{
  // @ts-ignore
  protected abstract updateQuery: string;
  correct(
    input: PersistenceInputUpdate<DAOSimpleModel>
  ): Promise<PersistencePromise<DAOModel>> {
    this.options = input.eventOptions;
    //! Envia o input para o service determinado pelo esquema e lá ele faz as
    //! operações necessárias usando o journaly para acessar outros DAOs ou
    //! DAOs.
    //! Sempre deve-se receber informações do tipo input e o output deve ser
    //! compatível com o input para pemitir retro-alimentação.
    //! Atualizar o input para que utilize o melhor dos dois
    //! (input e parametros usados no SimpleAPI).
    return this.update(input);
  }

  update(
    input: PersistenceInputUpdate<DAOSimpleModel>
  ): Promise<PersistencePromise<DAOModel>> {
    this.options = input.eventOptions;
    return input.id
      ? this.makePromise(input, 'updateById')
      : input.single
      ? this.makePromise(input, 'updateSingle')
      : this.makePromise(input, 'updateArray');
  }
  async updateById(id: string, content: DAOSimpleModel): Promise<DAOModel> {
    const limit =
      (this.pool?.updateLimit ? this.pool?.updateLimit : this.regularLimit) +
      '1';

    const values = Object.values(content);
    const select = await this.generateSelect(
      'updated',
      this.pool?.isUpdateLimitBefore ? limit : undefined
    );
    const update = await this.generateUpdate(1, content);
    const query = this.pool?.simpleUpdate
      ? `${update}`
      : `WITH updated AS (${update} WHERE id IN (SELECT id FROM ${this.getName()} ` +
        `WHERE id = ${this.generateValueFromUnknown(id)} ORDER BY ID ${
          this.pool?.isUpdateLimitBefore ? '' : limit
        }) ` +
        `RETURNING *` +
        `) ${select} ${this.groupBy}`;

    // console.log('id:', id);
    // console.log('content:', content);
    // console.log('STORE:', query);
    // console.log('values:', values);
    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        values,
        async (
          error,
          result: { rows?: (DAOModel | PromiseLike<DAOModel>)[]; rowCount? }
        ) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows ? result.rows[0] : ({} as DAOModel));
        }
      );
    });
  }
  async updateSingle(filter, content: DAOSimpleModel): Promise<DAOModel> {
    const limit =
      (this.pool?.updateLimit ? this.pool?.updateLimit : this.regularLimit) +
      '1';

    const values = Object.values(content);
    const select = await this.generateSelect(
      'updated',
      this.pool?.isUpdateLimitBefore ? limit : undefined
    );
    const update = await this.generateUpdate(
      Object.values(filter).length,
      content
    );
    let query = this.pool?.simpleUpdate
      ? `${update}`
      : `WITH updated AS (${update} WHERE id IN ` +
        `(SELECT id FROM ${this.getName()} ORDER BY ID ${
          this.pool?.isUpdateLimitBefore ? '' : limit
        }) ` +
        `RETURNING *` +
        `) ${select} ${this.groupBy}`;
    if (!filter) {
      filter = {};
    }

    // console.log('filter=', filter);

    if (Object.keys(filter).length !== 0) {
      query = this.pool?.simpleUpdate
        ? `${update}`
        : `WITH updated AS (${update} WHERE id IN (SELECT id FROM ${this.getName()} ` +
          `${await this.generateWhere(filter, -1)} ORDER BY ID ${limit}) ` +
          `RETURNING *` +
          `) ${select} ${this.groupBy}`;
    }

    // console.log('content:', content);
    // console.log('STORE:', query);
    // console.log('values:', values);

    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        values,
        (
          error,
          result: { rows?: (DAOModel | PromiseLike<DAOModel>)[]; rowCount? }
        ) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows ? result.rows[0] : ({} as DAOModel));
        }
      );
    });
  }

  async updateArray(filter, content: DAOSimpleModel): Promise<DAOModel[]> {
    const values = Object.values(content);
    const select = await this.generateSelect('updated');
    const update = await this.generateUpdate(
      Object.values(filter).length,
      content
    );
    let query = this.pool?.simpleUpdate
      ? `${update}`
      : `WITH updated AS (${update} ` +
        `RETURNING *` +
        `) ${select} ${this.groupBy}`;
    if (!filter) {
      filter = {};
    }

    // console.log('filter=', filter);

    if (Object.keys(filter).length !== 0) {
      query = this.pool?.simpleUpdate
        ? `${update}`
        : `WITH updated AS (${update} WHERE id IN (SELECT id FROM ${this.getName()} ` +
          `${await this.generateWhere(filter, -1)} ORDER BY ID) ` +
          `RETURNING *` +
          `) ${select} ${this.groupBy}`;
    }

    // console.log('filter:', filter);
    // console.log('content:', content);
    // console.log('STORE:', query);
    // console.log('values:', values);

    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        values,
        (
          error,
          result: { rows?: (DAOModel | PromiseLike<DAOModel>)[]; rowCount? }
        ) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows as DAOModel[]);
        }
      );
    });
  }
}
