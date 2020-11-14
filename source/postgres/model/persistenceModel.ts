/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
// file deepcode ignore no-any: any needed
import { BasicModel } from './basicModel';
import { VolatileModel } from './volatileModel';

export abstract class PersistenceModel extends BasicModel {
  private static volatileModel: VolatileModel;

  static setVolatileModel(volatileModel: VolatileModel): void {
    this.volatileModel = volatileModel;
  }

  static generateVolatile(object: any): any {
    const objectDB = new (this.volatileModel as any)();
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
