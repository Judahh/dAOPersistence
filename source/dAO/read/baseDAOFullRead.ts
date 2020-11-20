/* eslint-disable @typescript-eslint/ban-ts-comment */
import DAOFullReadAdapter from '../../adapter/read/dAOFullReadAdapter';
import BaseDAOReadArray from './baseDAOReadArray';
import BaseDAOReadById from './baseDAOReadById';
import BaseDAORead from './baseDAORead';
import { Mixin } from 'ts-mixer';
// @ts-ignore
export default class BaseDAOFullRead
  // @ts-ignore
  extends Mixin(BaseDAOReadArray, BaseDAOReadById, BaseDAORead)
  implements DAOFullReadAdapter {}
