/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAORestrictedAdapter from '../adapter/dAORestrictedAdapter';
import BaseDAOSimple from './baseDAOSimple';
import BaseDAOStore from './baseDAOStore';
import BaseDAOUpdate from './baseDAOUpdate';
import { Mixin } from 'ts-mixer';
// @ts-ignore
export default class BaseDAORestricted
  // @ts-ignore
  extends Mixin(BaseDAOSimple, BaseDAOStore, BaseDAOUpdate)
  implements DAORestrictedAdapter {}
