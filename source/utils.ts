/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { promises } from 'fs';
import { IPool } from './database/iPool';

class Utils {
  static async init(pool: IPool): Promise<void> {
    await Utils.dropTables(pool);
    let script = await promises.readFile(
      './database/createExtension.sql',
      'utf8'
    );
    await pool.query(script);
    script = await promises.readFile('./database/createTables.sql', 'utf8');
    await pool.query(script);
  }

  static async dropTables(pool: IPool): Promise<void> {
    const dropTables = await promises.readFile(
      './database/dropTables.sql',
      'utf8'
    );
    await pool.query(dropTables);
  }

  static async deleteTables(pool: IPool): Promise<void> {
    const dropTables = await promises.readFile(
      './database/deleteTables.sql',
      'utf8'
    );
    await pool.query(dropTables);
  }

  static async end(pool: IPool): Promise<void> {
    await Utils.dropTables(pool);
    // await Utils.deleteTables(pool);
    await Utils.disconnect(pool);
  }

  static async disconnect(pool: IPool): Promise<void> {
    await pool.end();
  }

  static empty(string?: string): boolean {
    return string === '' || string === undefined || string === null;
  }
}

declare global {
  interface Object {
    // eslint-disable-next-line no-unused-vars
    filter(object, predicate);
  }
}

// eslint-disable-next-line no-unused-vars
declare interface Object {
  // eslint-disable-next-line no-unused-vars
  filter(object, predicate);
}
Object.prototype.filter = (object?, predicate?) => {
  const result = {};
  if (object)
    for (const key in object) {
      if (predicate && predicate(key, object[key])) {
        result[key] = object[key];
      }
    }
  return result;
};

export { Utils, Object };
