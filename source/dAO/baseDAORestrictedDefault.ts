/* eslint-disable @typescript-eslint/ban-ts-comment */
import IDAOSimple from '../model/iDAOSimple';
import BaseDAODefault from './baseDAODefault';
// @ts-ignore
export default class BaseDAORestrictedDefault extends BaseDAODefault {
  // @ts-ignore
  protected async generateVectorValues(
    content: IDAOSimple
  ): Promise<unknown[]> {
    let values: unknown[] = [];
    if (content) values = Object.values(content);
    // console.log('values', values);

    return new Promise((resolve) => resolve(values));
  }

  protected async generateVectorValuesFromArray(
    content: IDAOSimple[]
  ): Promise<unknown[][]> {
    const values: unknown[][] = [];
    const first = content[0];
    const keys = Object.keys(first);

    for (const subContent of content) {
      const value: unknown[] = [];
      for (const key of keys) {
        value.push(subContent[key]);
      }
      values.push(value);
    }

    return new Promise((resolve) => resolve(values));
  }

  protected basicGenerateFields(content: IDAOSimple): string[] {
    const fields = this.aliasFields
      ? Object.keys(content).map((value) => {
          return this.aliasFields ? this.aliasFields[value] || value : value;
        })
      : Object.keys(content);

    return fields;
  }

  protected async generateFields(content: IDAOSimple): Promise<string[]> {
    return new Promise((resolve) => {
      resolve(this.basicGenerateFields(content));
    });
  }
}
