import DAOReadByIdAdapter from './dAOReadByIdAdapter';
import DAOReadArrayAdapter from './dAOReadArrayAdapter';
import DAOReadAdapter from './dAOReadAdapter';

export default interface DAOFullReadAdapter
  extends DAOReadByIdAdapter,
    DAOReadAdapter,
    DAOReadArrayAdapter {}
