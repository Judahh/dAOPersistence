/* eslint-disable @typescript-eslint/ban-ts-comment */
import BaseDAORestricted from './baseDAORestricted';
import BaseDAODelete from './delete/baseDAODelete';
import { Mixin } from 'ts-mixer';
import { SRARAdapter } from 'flexiblepersistence';
import { DAOSimpleModel, DAOModel } from '..';

// @ts-ignore
export default abstract class BaseDAO
  // @ts-ignore
  extends Mixin(BaseDAORestricted, BaseDAODelete)
  implements SRARAdapter<DAOSimpleModel, DAOModel> {}
