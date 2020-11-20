import DAOModel from '../../model/dAOModel';
import DAOSimpleModel from '../../model/dAOSimpleModel';

export default interface DAOUpdateByIdAdapter {
  updateById(id: string, content: DAOSimpleModel): Promise<DAOModel>;
}
