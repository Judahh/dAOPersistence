import { BaseDAO } from '../../source/index';
/* eslint-disable no-unused-vars */
export default class ObjectDAO extends BaseDAO {
  generateName(): void {
    this.setName('Objects');
  }

  protected values = 'subElement.ID, subElement.test, subElement.testNumber';

  protected insert = 'id, test, testNumber';

  protected insertValues = '$1, $2, $3';

  protected updateQuery = '';

  constructor(initDefault?) {
    super(initDefault);
  }
}
