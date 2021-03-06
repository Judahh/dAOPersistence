/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
// file deepcode ignore no-any: any needed
import { BasicModel } from './basicModel';
import { PersistenceModel } from './persistenceModel';

export abstract class VolatileModel extends BasicModel {
  private static persistenceModel: PersistenceModel;

  static setPersistenceModel(persistenceModel: PersistenceModel): void {
    this.persistenceModel = persistenceModel;
  }
  static generatePersistence(object: any): any {
    const objectDB = new (this.persistenceModel as any)();
    for (let i = 0; i < Object.keys(object).length; i++) {
      const key = Object.keys(object)[i];
      const value = object[key];
      if (objectDB.hasOwnProperty(key)) {
        objectDB[key] = value;
      } else {
      }
    }
    return objectDB;
  }
}
