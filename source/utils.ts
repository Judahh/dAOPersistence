/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { promises } from 'fs';
import { PoolAdapter } from './database/poolAdapter';

export default class Utils {
  static async init(pool: PoolAdapter): Promise<void> {
    await Utils.dropTables(pool);
    let script = await promises.readFile(
      './database/createExtension.sql',
      'utf8'
    );
    await pool.query(script);
    script = await promises.readFile('./database/createTables.sql', 'utf8');
    await pool.query(script);
  }

  static async dropTables(pool: PoolAdapter): Promise<void> {
    const dropTables = await promises.readFile(
      './database/dropTables.sql',
      'utf8'
    );
    await pool.query(dropTables);
  }

  static async deleteTables(pool: PoolAdapter): Promise<void> {
    const dropTables = await promises.readFile(
      './database/deleteTables.sql',
      'utf8'
    );
    await pool.query(dropTables);
  }

  static async end(pool: PoolAdapter): Promise<void> {
    await Utils.dropTables(pool);
    // await Utils.deleteTables(pool);
    await Utils.disconnect(pool);
  }

  static async disconnect(pool: PoolAdapter): Promise<void> {
    await pool.end();
  }
}
