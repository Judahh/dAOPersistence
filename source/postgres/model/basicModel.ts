import { ObjectId } from 'mongodb';

export abstract class BasicModel {
  private id?: string | RegExp | ObjectId;

  constructor(id: string | RegExp | ObjectId) {
    this.id = id;
  }
}
