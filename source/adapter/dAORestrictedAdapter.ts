import DAOFullReadAdapter from './read/dAOFullReadAdapter';
import DAOFullCreateAdapter from './create/dAOFullCreateAdapter';
import DAOFullUpdateAdapter from './update/dAOFullUpdateAdapter';

export default interface DAORestrictedAdapter
  extends DAOFullReadAdapter,
    DAOFullCreateAdapter,
    DAOFullUpdateAdapter {}
