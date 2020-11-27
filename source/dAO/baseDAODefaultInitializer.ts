import { DefaultInitializer } from 'flexiblepersistence';
import { Pool } from 'pg';

export default interface BaseDAODefaultInitializer extends DefaultInitializer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pool: Pool;
}
