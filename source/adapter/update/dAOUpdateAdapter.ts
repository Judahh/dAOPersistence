import DAOModel from '../../model/dAOModel';
import DAOSimpleModel from '../../model/dAOSimpleModel';

export default interface DAOUpdateAdapter {
  update(filter, content: DAOSimpleModel): Promise<DAOModel>;
}
