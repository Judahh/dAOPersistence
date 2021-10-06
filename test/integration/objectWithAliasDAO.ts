import { BaseDAO } from '../../source/index';
/* eslint-disable no-unused-vars */
export default class ObjectWithAliasDAO extends BaseDAO {
  generateName(): void {
    this.setName('ObjectWithAlias');
  }

  protected values = 'subElement.ID, subElement.test, subElement.testNumber';

  protected insert = 'id, test, testNumber';

  protected insertValues = '$1, $2, $3';

  protected updateQuery = '';

  constructor(initDefault?) {
    super(initDefault);
  }
}
