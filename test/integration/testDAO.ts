import { BaseDAO, DAOSimpleModel } from '../../source/index';
/* eslint-disable no-unused-vars */
export default class TestDAO extends BaseDAO {
  protected table = 'tests';

  protected insert = 'id';

  protected insertValues = '$1';

  protected updateQuery = '';

  constructor(initDefault) {
    super(initDefault);
    // console.log(this);
  }

  protected generateVectorValues(
    content: DAOSimpleModel
  ): Promise<Array<unknown>> {
    let values;
    if (content && content.id) values = [content.id];
    else values = [];
    return new Promise((resolve) => resolve(values));
  }
}