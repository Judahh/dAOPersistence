/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOFullDeleteAdapter from '../../adapter/delete/dAOFullDeleteAdapter';
import BaseDAODeleteArray from './baseDAODeleteArray';
import BaseDAODeleteById from './baseDAODeleteById';
import BaseDAODelete from './baseDAODelete';
import { Mixin } from 'ts-mixer';
// @ts-ignore
export default class BaseDAOFullDelete
  // @ts-ignore
  extends Mixin(BaseDAODeleteArray, BaseDAODeleteById, BaseDAODelete)
  implements DAOFullDeleteAdapter {}
