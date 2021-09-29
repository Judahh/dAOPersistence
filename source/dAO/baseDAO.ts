/* eslint-disable @typescript-eslint/ban-ts-comment */
import BaseDAORestricted from './baseDAORestricted';
import BaseDAODelete from './delete/baseDAODelete';
import { Mixin } from 'ts-mixer';
import { ISRAR } from 'flexiblepersistence';
import { IDAOSimple, IDAO } from '..';

// @ts-ignore
export default abstract class BaseDAO
  // @ts-ignore
  extends Mixin(BaseDAORestricted, BaseDAODelete)
  implements ISRAR<IDAOSimple, IDAO> {}
