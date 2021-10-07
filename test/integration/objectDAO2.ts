import { BaseDAO } from '../../source/index';
/* eslint-disable no-unused-vars */
export default class ObjectDAO extends BaseDAO {
  generateName(): void {
    this.setName('Objects');
  }

  constructor(initDefault?) {
    super(initDefault);
  }

  aliasFields = {
    id: undefined,
    test: undefined,
    testNumber: undefined,
  };
}
