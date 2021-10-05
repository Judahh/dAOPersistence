/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import IDAO from '../../model/iDAO';
import IDAOSimple from '../../model/iDAOSimple';
import BaseDAORestrictedDefault from '../baseDAORestrictedDefault';
import { IAlter, IInput, IInputUpdate, IOutput } from 'flexiblepersistence';

// @ts-ignore
export default class BaseDAOUpdate
  extends BaseDAORestrictedDefault
  implements IAlter<IDAOSimple, IDAO>
{
  // @ts-ignore
  protected abstract updateQuery: string;
  correct(input: IInputUpdate<IDAOSimple>): Promise<IOutput<IDAOSimple, IDAO>> {
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

  update(input: IInputUpdate<IDAOSimple>): Promise<IOutput<IDAOSimple, IDAO>> {
    this.options = input.eventOptions;
    return input.id
      ? this.makePromise(input as IInput<IDAOSimple>, 'updateById')
      : input.single
      ? this.makePromise(input as IInput<IDAOSimple>, 'updateSingle')
      : this.makePromise(input as IInput<IDAOSimple>, 'updateArray');
  }
  async updateById(id: string, content: IDAOSimple): Promise<IDAO> {
    const limit =
      (this.pool?.updateLimit ? this.pool?.updateLimit : this.regularLimit) +
      ' 1';

    const idName = await this.getIdField(false, true, false, false);
    const values = await this.generateValues(content, false);
    const select = await this.generateSelect(
      'updated',
      this.pool?.isUpdateLimitBefore ? limit : undefined
    );
    const update = await this.generateUpdate(1, content, false, true);
    const length = Object.keys(content).length + 1;
    // console.log('len:', length);

    const query = this.pool?.simpleUpdate
      ? `${update} ` +
        `${await this.generateWhere(
          {
            id: this.generateValueFromUnknown(id),
          },
          length,
          false,
          true,
          true,
          true
        )}`
      : `WITH updated AS (${update} WHERE ${idName} IN (SELECT ${idName} FROM ${this.getName()} ` +
        `${await this.generateWhere(
          {
            id: this.generateValueFromUnknown(id),
          },
          length,
          false,
          true,
          true,
          true
        )} ORDER BY ${idName} ${
          this.pool?.isUpdateLimitBefore ? '' : limit
        }) ` +
        `RETURNING *` +
        `) ${select} ${this.groupBy}`;

    // console.log('id:', id);
    // console.log('content:', content);
    // console.log('UPDATE BY ID QUERY:', query);
    // console.log('values:', values);
    return new Promise((resolve, reject) => {
      // console.log('updateById Promise');
      this.pool?.query(
        query,
        [...values, id],
        async (
          error,
          result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }
        ) => {
          // console.log('updateById Promise result');
          if (error) {
            // console.error('error:', error);
            reject(error);
            return;
          }
          result = this.fixType(result);
          // console.error('result:', result);
          // console.error('result.rows:', result.rows);
          resolve(result.rows ? result.rows[0] : ({} as IDAO));
        }
      );
    });
  }
  async updateSingle(filter, content: IDAOSimple): Promise<IDAO> {
    const limit =
      (this.pool?.updateLimit ? this.pool?.updateLimit : this.regularLimit) +
      ' 1';

    const idName = await this.getIdField(false, true, false, false);
    const values = await this.generateValues(content, false);
    filter = filter ? filter : {};
    const filterValues = await this.generateValues(filter, true);
    const select = await this.generateSelect(
      'updated',
      this.pool?.isUpdateLimitBefore ? limit : undefined
    );
    const update = await this.generateUpdate(
      filterValues.length,
      content,
      false,
      true
    );
    const query = this.pool?.simpleUpdate
      ? `${update}`
      : `WITH updated AS (${update} WHERE ${idName} IN (SELECT ${idName} FROM ${this.getName()} ` +
        `${await this.generateWhere(
          filter,
          -1,
          false,
          true,
          true,
          true
        )} ORDER BY ${idName} ${limit}) ` +
        `RETURNING *` +
        `) ${select} ${this.groupBy}`;

    // console.log('content:', content);
    // console.log('UPDATE SINGLE QUERY:', query);
    // console.log('values:', values);

    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        values,
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows ? result.rows[0] : ({} as IDAO));
        }
      );
    });
  }

  async updateArray(filter, content: IDAOSimple): Promise<IDAO[]> {
    const values = await this.generateValues(content, false);
    const idName = await this.getIdField(false, true, false, false);
    const filterValues = await this.generateValues(filter, true);
    const select = await this.generateSelect('updated');
    filter = filter ? filter : {};
    const update = await this.generateUpdate(
      filterValues.length,
      content,
      false,
      true
    );
    const query = this.pool?.simpleUpdate
      ? `${update}`
      : `WITH updated AS (${update} WHERE ${idName} IN (SELECT ${idName} FROM ${this.getName()} ` +
        `${await this.generateWhere(
          filter,
          -1,
          false,
          true,
          true,
          true
        )} ORDER BY ${idName}) ` +
        `RETURNING *` +
        `) ${select} ${this.groupBy}`;

    // console.log('filter:', filter);
    // console.log('content:', content);
    // console.log('UPDATE QUERY:', query);
    // console.log('values:', values);

    return new Promise((resolve, reject) => {
      this.pool?.query(
        query,
        values,
        (error, result: { rows?: (IDAO | PromiseLike<IDAO>)[]; rowCount? }) => {
          if (error) {
            reject(error);
            return;
          }
          result = this.fixType(result);
          resolve(result.rows as IDAO[]);
        }
      );
    });
  }
}
