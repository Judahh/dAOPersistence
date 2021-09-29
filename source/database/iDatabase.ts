import { Handler } from 'flexiblepersistence';

export default interface IDatabase {
  eventHandler?: Handler;
  readPool?;
  hasMemory?: boolean;
}
