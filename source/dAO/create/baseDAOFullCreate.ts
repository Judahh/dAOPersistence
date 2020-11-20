/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOFullCreateAdapter from '../../adapter/create/dAOFullCreateAdapter';
import BaseDAOCreateArray from './baseDAOCreateArray';
import BaseDAOCreate from './baseDAOCreate';
import { Mixin } from 'ts-mixer';
// @ts-ignore
export default class BaseDAOFullCreate
  // @ts-ignore
  extends Mixin(BaseDAOCreateArray, BaseDAOCreate)
  implements DAOFullCreateAdapter {}
