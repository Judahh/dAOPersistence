import DAODeleteByIdAdapter from './dAODeleteByIdAdapter';
import DAODeleteAdapter from './dAODeleteAdapter';
import DAODeleteArrayAdapter from './dAODeleteArrayAdapter';

export default interface DAOFullDeleteAdapter
  extends DAODeleteByIdAdapter,
    DAODeleteAdapter,
    DAODeleteArrayAdapter {}
