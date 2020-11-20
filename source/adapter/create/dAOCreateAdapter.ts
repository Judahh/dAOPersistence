import DAOModel from '../../model/dAOModel';
import DAOSimpleModel from '../../model/dAOSimpleModel';

export default interface DAOCreateAdapter {
  create(content: DAOSimpleModel): Promise<DAOModel>;
}
