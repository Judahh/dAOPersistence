/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOSimpleModel from '../model/dAOSimpleModel';
import BaseDAODefault from './baseDAODefault';
// @ts-ignore
export default class BaseDAORestrictedDefault extends BaseDAODefault {
  // @ts-ignore
  protected async generateVectorValues(
    content: DAOSimpleModel
  ): Promise<unknown[]> {
    let values: unknown[] = [];
    if (content) values = Object.values(content);
    // console.log('values', values);

    return new Promise((resolve) => resolve(values));
  }

  protected async generateVectorValuesFromArray(
    content: DAOSimpleModel[]
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

  protected basicGenerateFields(content: DAOSimpleModel): string[] {
    const fields = Object.keys(content).map((value) => {
      return this.aliasFields[value] || value;
    });

    return fields;
  }

  protected async generateFields(content: DAOSimpleModel): Promise<string[]> {
    return new Promise((resolve) => {
      resolve(this.basicGenerateFields(content));
    });
  }
}
