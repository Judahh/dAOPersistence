import DAOUpdateByIdAdapter from './dAOUpdateByIdAdapter';
import DAOUpdateArrayAdapter from './dAOUpdateArrayAdapter';
import DAOUpdateAdapter from './dAOUpdateAdapter';

export default interface DAOFullUpdateAdapter
  extends DAOUpdateByIdAdapter,
    DAOUpdateAdapter,
    DAOUpdateArrayAdapter {}
