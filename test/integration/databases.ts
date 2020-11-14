import { MongoDB, PersistenceInfo } from 'flexiblepersistence';
import { Journaly } from 'journaly';

import { eventInfo, readInfo } from './databaseInfos';

const journaly = new Journaly();

const eventDatabase = new MongoDB(new PersistenceInfo(eventInfo, journaly));

const database = new PersistenceInfo(readInfo, journaly);

export { eventDatabase, database, journaly };
