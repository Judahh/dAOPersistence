import { BaseDAO, IBaseDAODefault } from '../../source/index';
/* eslint-disable no-unused-vars */
export default class TestDAO extends BaseDAO {
  generateName(): void {
    this.setName('tests');
  }

  aliasFields = {
    id: undefined,
  };

  constructor(initDefault?: IBaseDAODefault) {
    super(initDefault);
  }
}
