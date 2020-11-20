/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAORestrictedAdapter from '../adapter/dAORestrictedAdapter';
import BaseDAOFullRead from './read/baseDAOFullRead';
import BaseDAOFullCreate from './create/baseDAOFullCreate';
import BaseDAOFullUpdate from './update/baseDAOFullUpdate';
import { Mixin } from 'ts-mixer';
// @ts-ignore
export default class BaseDAORestricted
  // @ts-ignore
  extends Mixin(BaseDAOFullRead, BaseDAOFullCreate, BaseDAOFullUpdate)
  implements DAORestrictedAdapter {}
