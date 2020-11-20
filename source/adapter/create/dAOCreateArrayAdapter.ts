import DAOModel from '../../model/dAOModel';
import DAOSimpleModel from '../../model/dAOSimpleModel';

export default interface DAOCreateArrayAdapter {
  createArray(content: DAOSimpleModel[]): Promise<DAOModel[]>;
}
