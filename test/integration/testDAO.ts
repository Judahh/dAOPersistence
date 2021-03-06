import { BaseDAO, BaseDAODefaultInitializer } from '../../source/index';
/* eslint-disable no-unused-vars */
export default class TestDAO extends BaseDAO {
  generateName(): void {
    this.setName('tests');
  }

  protected insert = 'id';

  protected insertValues = '$1';

  protected updateQuery = '';

  constructor(initDefault?: BaseDAODefaultInitializer) {
    super(initDefault);
    // console.log(this);
  }
}
