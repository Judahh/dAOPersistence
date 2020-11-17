import { MongoDB, PersistenceInfo } from 'flexiblepersistence';
import { Journaly } from 'journaly';

import { eventInfo, readInfo } from './databaseInfos';

const journaly = Journaly.newJournaly();

const eventDatabase = new MongoDB(new PersistenceInfo(eventInfo, journaly));

const database = new PersistenceInfo(readInfo, journaly);

export { eventDatabase, database, journaly };
