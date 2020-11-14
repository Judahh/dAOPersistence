/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOSimpleModel from '../model/dAOSimpleModel';
import BaseDAODefault from './baseDAODefault';
// @ts-ignore
export default class BaseDAORestrictedDefault extends BaseDAODefault {
  // @ts-ignore
  protected abstract async generateVectorValues(
    content: DAOSimpleModel
  ): Promise<unknown[]>;
}
