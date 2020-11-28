/* eslint-disable @typescript-eslint/ban-ts-comment */
import BaseDAORead from './read/baseDAORead';
import BaseDAOCreate from './create/baseDAOCreate';
import BaseDAOUpdate from './update/baseDAOUpdate';
import { Mixin } from 'ts-mixer';
// @ts-ignore
export default class BaseDAORestricted
  // @ts-ignore∂`
  extends Mixin(BaseDAORead, BaseDAOCreate, BaseDAOUpdate) {}
