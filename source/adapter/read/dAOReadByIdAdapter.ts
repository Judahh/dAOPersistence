import DAOModel from '../../model/dAOModel';

export default interface DAOReadByIdAdapter {
  readById(id: string): Promise<DAOModel>;
}
