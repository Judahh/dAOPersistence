/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOFullUpdateAdapter from '../../adapter/update/dAOFullUpdateAdapter';
import BaseDAOUpdateArray from './baseDAOUpdateArray';
import BaseDAOUpdateById from './baseDAOUpdateById';
import BaseDAOUpdate from './baseDAOUpdate';
import { Mixin } from 'ts-mixer';
// @ts-ignore
export default class BaseDAOFullUpdate
  // @ts-ignore
  extends Mixin(BaseDAOUpdateArray, BaseDAOUpdateById, BaseDAOUpdate)
  implements DAOFullUpdateAdapter {}
