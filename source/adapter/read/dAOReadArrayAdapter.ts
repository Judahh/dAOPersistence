import DAOModel from '../../model/dAOModel';

export default interface DAOReadArrayAdapter {
  readArray(filter): Promise<DAOModel[]>;
}
