import DAOModel from '../../model/dAOModel';
import DAOSimpleModel from '../../model/dAOSimpleModel';

export default interface DAOUpdateAdapter {
  updateArray(filter, content: DAOSimpleModel): Promise<DAOModel[]>;
}
