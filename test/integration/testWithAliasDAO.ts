import { BaseDAO, IBaseDAODefault } from '../../source/index';
/* eslint-disable no-unused-vars */
export default class TestWithAliasDAO extends BaseDAO {
  generateName(): void {
    this.setName('testWithAlias');
  }

  aliasFields = {
    id: 'dumbid',
  };

  constructor(initDefault?: IBaseDAODefault) {
    super(initDefault);
  }
}
