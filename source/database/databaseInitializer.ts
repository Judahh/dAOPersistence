import { Handler } from '../../../../service/node_modules/flexiblepersistence';

export default interface DatabaseInitializer {
  eventHandler?: Handler;
  readPool?;
  hasMemory?: boolean;
}
