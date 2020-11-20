import DAOModel from '../../model/dAOModel';

export default interface DAOReadAdapter {
  read(filter): Promise<DAOModel>;
}
