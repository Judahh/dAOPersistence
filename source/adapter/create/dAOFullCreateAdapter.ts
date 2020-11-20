import DAOCreateArrayAdapter from './dAOCreateArrayAdapter';
import DAOCreateAdapter from './dAOCreateAdapter';

export default interface DAOFullCreateAdapter
  extends DAOCreateAdapter,
    DAOCreateArrayAdapter {}
