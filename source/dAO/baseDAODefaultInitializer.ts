import { DefaultInitializer } from '@flexiblepersistence/default-initializer';
import { PoolAdapter } from '../database/poolAdapter';

export default interface BaseDAODefaultInitializer extends DefaultInitializer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pool: PoolAdapter;
}
