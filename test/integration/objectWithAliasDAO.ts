import { BaseDAO } from '../../source/index';
/* eslint-disable no-unused-vars */
export default class ObjectWithAliasDAO extends BaseDAO {
  generateName(): void {
    this.setName('ObjectWithAlias');
  }

  aliasFields = {
    id: 'dumbid',
    test: 'dumbtest',
    testNumber: 'dumbtestNumber',
  };
  constructor(initDefault?) {
    super(initDefault);
  }
}
