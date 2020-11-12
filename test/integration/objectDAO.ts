import { BaseDAO } from '../../source/index';
import ObjectDAOSimpleModel from './objectDAOSimpleModel';
/* eslint-disable no-unused-vars */
export default class ObjectDAO extends BaseDAO {
  protected table = 'Objects';

  protected values = 'element.ID, element.test, element.testNumber';

  protected insert = 'id, test, testNumber';

  protected insertValues = '$1, $2, $3';

  protected updateQuery = '';

  constructor(initDefault) {
    super(initDefault);
    // console.log(this);
  }

  protected generateVectorValues(
    content: ObjectDAOSimpleModel
  ): Promise<Array<unknown>> {
    let values;
    if (content) values = [content.id, content.test, content.testNumber];
    else values = [];
    return new Promise((resolve) => resolve(values));
  }
}
