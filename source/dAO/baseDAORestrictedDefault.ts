/* eslint-disable @typescript-eslint/ban-ts-comment */
import IDAOSimple from '../model/iDAOSimple';
import BaseDAODefault from './baseDAODefault';
// @ts-ignore
export default class BaseDAORestrictedDefault extends BaseDAODefault {
  protected async generateVectorValuesFromArray(
    content: IDAOSimple[],
    useTable?: boolean,
    useAlias?: boolean,
    useCompound?: boolean,
    useSubElement?: boolean
  ): Promise<unknown[][]> {
    const values: unknown[][] = [];
    const first = content[0];
    const fields = await this.generateFields(
      first,
      useTable,
      useAlias,
      useCompound,
      useSubElement
    );

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
