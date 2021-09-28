import { IDefault } from '@flexiblepersistence/default-initializer';
import { IPool } from '../database/iPool';

export default interface IBaseDAODefault extends IDefault {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pool: IPool;
}
