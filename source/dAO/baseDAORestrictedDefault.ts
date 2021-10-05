/* eslint-disable @typescript-eslint/ban-ts-comment */
import IDAOSimple from '../model/iDAOSimple';
import BaseDAODefault from './baseDAODefault';
// @ts-ignore
export default class BaseDAORestrictedDefault extends BaseDAODefault {
  // @ts-ignore
  protected async generateVectorValues(
    content: IDAOSimple
  ): Promise<unknown[]> {
    const values = await this.generateValues(content, false);
    // console.log('values', values);
    return new Promise((resolve) => resolve(values));
  }

  protected async generateVectorValuesFromArray(
    content: IDAOSimple[]
  ): Promise<unknown[][]> {
    const values: unknown[][] = [];
    const first = content[0];
    const fields = await this.generateFields(first);

    for (const subContent of content) {
      const value: unknown[] = [];
      for (const field of fields) {
        value.push(subContent[field]);
      }
      values.push(value);
    }

    return new Promise((resolve) => resolve(values));
  }
}
