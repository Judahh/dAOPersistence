import DAORestrictedAdapter from './dAORestrictedAdapter';
import DAOFullDeleteAdapter from './delete/dAOFullDeleteAdapter';

export default interface DAOAdapter
  extends DAORestrictedAdapter,
    DAOFullDeleteAdapter {}
