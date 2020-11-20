/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOAdapter from '../adapter/dAOAdapter';
import BaseDAORestricted from './baseDAORestricted';
import BaseDAOFullDelete from './delete/baseDAOFullDelete';
import { Mixin } from 'ts-mixer';

// @ts-ignore
export default abstract class BaseDAO
  // @ts-ignore
  extends Mixin(BaseDAORestricted, BaseDAOFullDelete)
  implements DAOAdapter {}
