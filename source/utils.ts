/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { promises } from 'fs';
import { IPool } from './database/iPool';

class Utils {
  static async query(pool: IPool, file: string): Promise<void> {
    const script = await promises.readFile(file, 'utf8');
    // console.log('Query:', script);
    // console.log('pool:', pool);
    // console.log('Query:', pool.query);
    await pool?.query(script);
  }

  static async create(pool: IPool): Promise<void> {
    // console.log('create:', pool);
    await Utils.query(pool, './database/createDB.sql');
  }

  static async init(pool: IPool, isMSSQL?: boolean): Promise<void> {
    await Utils.dropTables(pool);
    await Utils.query(pool, './database/createExtension.sql');
    await Utils.query(
      pool,
      './database/createTables.' + (isMSSQL ? 'ms' : '') + 'sql'
    );
  }

  static async dropTables(pool: IPool): Promise<void> {
    await Utils.query(pool, './database/dropTables.sql');
  }

  static async deleteTables(pool: IPool): Promise<void> {
    await Utils.query(pool, './database/deleteTables.sql');
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

export { Utils };
