/* eslint-disable @typescript-eslint/no-explicit-any */
// file deepcode ignore no-any: any needed
import {
  Handler,
  Operation,
  Event,
  MongoPersistence,
  PersistenceInfo,
  IOutput,
} from 'flexiblepersistence';

import TestDAO from './testDAO';
import ObjectDAO from './objectDAO';

import { MSSQL } from '@flexiblepersistence/mssql';
import { DAOPersistence, Utils } from '../../source';
import { Journaly, SenderReceiver } from 'journaly';
import { eventInfo, readInfo2 } from './databaseInfos';

import { ObjectId } from 'mongoose';

let read;
let write;
let handler;
let journaly;
describe('1', () => {
  beforeEach(async () => {
    // console.log('beforeEach');
    if (handler !== undefined) {
      await handler?.getRead()?.clear();
      await handler?.getWrite()?.clear();
    }
    if (write !== undefined) {
      await write?.close();
    }
    if (read !== undefined) {
      await read?.close();
    }
    journaly = Journaly.newJournaly() as SenderReceiver<any>;
    const eventDatabase = new MongoPersistence(
      new PersistenceInfo(eventInfo, journaly)
    );
    const database = new PersistenceInfo(readInfo2, journaly);
    write = eventDatabase;
    const mSSQL = new MSSQL(database);
    read = new DAOPersistence(mSSQL, {
      test: new TestDAO(),
      object: new ObjectDAO(),
    });
    handler = new Handler(write, read, { isInSeries: true });
    // await handler?.getRead()?.clear();
    // await handler?.getWrite()?.clear();
  });

  afterEach(async () => {
    // console.log('afterEach');
    if (handler !== undefined) {
      await handler?.getRead()?.clear();
      await handler?.getWrite()?.clear();
    }
    if (read !== undefined) await read?.close();
    if (write !== undefined) await write?.close();
    read = undefined;
    write = undefined;
    handler = undefined;
  });

  afterAll(async () => {
    // console.log('afterAll');
    if (handler !== undefined) {
      await handler?.getRead()?.clear();
      await handler?.getWrite()?.clear();
    }
    if (read !== undefined) await read?.close();
    if (write !== undefined) await write?.close();
  });
  test('add and read array and find object', async () => {
    const pool = read.getPool();
    await Utils.init(pool, true);
    // new TestDAO({
    //   pool,
    //   journaly,
    // });
    // new ObjectDAO({
    //   pool,
    //   journaly,
    // });
    const handler = new Handler(write, read);
    await handler.getWrite()?.clear();
    const obj = {};
    obj['test'] = 'test';
    // console.log('TEST00');
    const persistencePromise = await handler.addEvent(
      new Event({ operation: Operation.create, name: 'Object', content: obj })
    );

    // console.log('TEST00:', persistencePromise);

    const obj0 = {
      ...obj,
      id: obj['id'].toString(),
    };

    expect(persistencePromise?.receivedItem).toStrictEqual(obj0);

    // console.log('TEST02');

    // const persistencePromise1 = await handler.readArray('Object', {});
    const persistencePromise1 = await handler.addEvent(
      new Event({ operation: Operation.read, name: 'Object', single: false })
    );
    // console.log('TEST02', persistencePromise1);
    expect(persistencePromise1?.receivedItem).toStrictEqual([
      { ...obj0, testNumber: null },
    ]);
    expect(persistencePromise1?.selectedItem).toStrictEqual(undefined);
    expect(persistencePromise1?.sentItem).toStrictEqual(undefined);

    const persistencePromise10 = (await handler.addEvent(
      new Event({
        operation: Operation.create,
        name: 'Object',
        content: { ...obj, id: undefined },
      })
    )) as IOutput<
      { id: ObjectId; test: string },
      { id: ObjectId; test: string }
    >;

    // console.log('TEST02:', persistencePromise10);
    const obj1 = {
      id: persistencePromise10?.receivedItem?.id,
      test: 'test',
    };

    expect(persistencePromise10?.receivedItem).toStrictEqual(obj1);

    const receivedObjects = [
      { ...obj0, testNumber: null },
      { ...obj1, testNumber: null },
    ];

    const all2 = {
      receivedItem: receivedObjects,
      result: receivedObjects,
      selectedItem: {},
      sentItem: undefined,
    };

    const persistencePromise101 = (await handler.readArray(
      'Object',
      {}
    )) as IOutput<
      { id: ObjectId; test: string },
      { id: ObjectId; test: string }[]
    >;

    // console.log('TEST03:', persistencePromise101);
    expect(persistencePromise101).toStrictEqual(all2);
    expect(persistencePromise101.selectedItem).toStrictEqual({});
    expect(persistencePromise101.sentItem).toStrictEqual(undefined);

    const persistencePromise11 = (await handler.addEvent(
      new Event({
        operation: Operation.read,
        name: 'Object',
        single: false,
        selection: { test: 'test' },
      })
    )) as IOutput<
      { id: ObjectId; test: string },
      { id: ObjectId; test: string }[]
    >;
    // console.log('TEST04', persistencePromise11);
    expect(persistencePromise11?.receivedItem).toStrictEqual(receivedObjects);
    expect(persistencePromise11?.selectedItem).toStrictEqual({
      test: 'test',
    });
    expect(persistencePromise11?.sentItem).toStrictEqual(undefined);

    // console.log('TEST04');

    const persistencePromise2 = (await handler.readItem(
      'Object',
      {}
    )) as IOutput<
      { id: ObjectId; test: string },
      { id: ObjectId; test: string }
    >;

    // console.log('TEST04:', persistencePromise2);
    expect(persistencePromise2?.receivedItem).toStrictEqual({
      id: persistencePromise2?.receivedItem?.id,
      test: 'test',
      testNumber: null,
    });
    expect(persistencePromise2?.selectedItem).toStrictEqual({});
    expect(persistencePromise2?.sentItem).toStrictEqual(undefined);

    // console.log('TEST033:', { id: persistencePromise2?.receivedItem?.id });

    const persistencePromise20 = await handler.addEvent(
      new Event({
        operation: Operation.delete,
        name: 'Object',
        selection: { id: persistencePromise2?.receivedItem?.id },
      })
    );

    expect(persistencePromise20).toStrictEqual({
      receivedItem: true,
      result: true,
      selectedItem: { id: persistencePromise2?.receivedItem?.id },
      sentItem: undefined,
    });

    const persistencePromise22 = (await handler.readArray(
      'Object',
      {}
    )) as IOutput<
      { id: ObjectId; test: string },
      { id: ObjectId; test: string }[]
    >;

    const receivedItem22 = persistencePromise22?.receivedItem;
    const receivedItem22i0 = receivedItem22 ? receivedItem22[0]?.id : undefined;

    // console.log('TEST03:', persistencePromise22);
    expect(persistencePromise22?.receivedItem).toStrictEqual([
      {
        id: receivedItem22i0,
        test: 'test',
        testNumber: null,
      },
    ]);
    expect(persistencePromise22?.selectedItem).toStrictEqual({});
    expect(persistencePromise22?.sentItem).toStrictEqual(undefined);

    // console.log('TEST04');
    const persistencePromise3 = await handler.addEvent(
      new Event({
        operation: Operation.update,
        name: 'Object',
        selection: { test: 'test' },
        content: { test: 'bob' },
      })
    );
    // console.log('TEST04:', persistencePromise3);
    expect(persistencePromise3?.receivedItem).toStrictEqual({
      test: 'bob',
    });
    expect(persistencePromise3?.selectedItem).toStrictEqual({
      test: 'test',
    });
    expect(persistencePromise3?.sentItem).toStrictEqual({
      test: 'bob',
    });

    // console.log('TEST05');

    // console.log(await read.query('UPDATE object SET test = \'bob\', testNumber = \'10\' WHERE (test = \'test\')', [], {}));

    const persistencePromise4 = await handler.addEvent(
      new Event({
        operation: Operation.delete,
        name: 'Object',
        single: false,
        selection: { test: 'bob' },
      })
    );
    // console.log('TEST05:', persistencePromise4);

    expect(persistencePromise4?.receivedItem).toStrictEqual(1);
    expect(persistencePromise4?.selectedItem).toStrictEqual({ test: 'bob' });
    expect(persistencePromise4?.sentItem).toStrictEqual(undefined);

    // console.log('TEST06');
    const persistencePromise5 = (await handler.readArray(
      'Object',
      {}
    )) as IOutput<
      { id: ObjectId; test: string },
      { id: ObjectId; test: string }[]
    >;

    expect(persistencePromise5?.receivedItem?.length).toBe(0);
    expect(persistencePromise5?.receivedItem).toStrictEqual([]);
    expect(persistencePromise5?.selectedItem).toStrictEqual({});
    expect(persistencePromise5?.sentItem).toStrictEqual(undefined);

    // console.log('TEST07');
    const persistencePromise6 = await handler.addEvent(
      new Event({
        operation: Operation.delete,
        name: 'Object',
        single: false,
      })
    );
    expect(persistencePromise6?.receivedItem).toStrictEqual(0);
    expect(persistencePromise6?.selectedItem).toStrictEqual(undefined);
    expect(persistencePromise6?.sentItem).toStrictEqual(undefined);
  });
});
describe('2', () => {
  beforeEach(async () => {
    // console.log('beforeEach');
    if (handler !== undefined) {
      await handler?.getRead()?.clear();
      await handler?.getWrite()?.clear();
    }
    if (write !== undefined) {
      await write?.close();
    }
    if (read !== undefined) {
      await read?.close();
    }
    journaly = Journaly.newJournaly() as SenderReceiver<any>;
    const eventDatabase = new MongoPersistence(
      new PersistenceInfo(eventInfo, journaly)
    );
    const database = new PersistenceInfo(readInfo2, journaly);
    write = eventDatabase;
    const mSSQL = new MSSQL(database);
    read = new DAOPersistence(mSSQL);
    handler = new Handler(write, read, { isInSeries: true });
    // await handler?.getRead()?.clear();
    // await handler?.getWrite()?.clear();
  });

  afterEach(async () => {
    // console.log('afterEach');
    if (handler !== undefined) {
      await handler?.getRead()?.clear();
      await handler?.getWrite()?.clear();
    }
    if (read !== undefined) await read?.close();
    if (write !== undefined) await write?.close();
    read = undefined;
    write = undefined;
    handler = undefined;
  });

  afterAll(async () => {
    // console.log('afterAll');
    if (handler !== undefined) {
      await handler?.getRead()?.clear();
      await handler?.getWrite()?.clear();
    }
    if (read !== undefined) await read?.close();
    if (write !== undefined) await write?.close();
  });
  test('add array and read elements, update and delete object', async () => {
    const pool = read.getPool();
    await Utils.init(pool, true);
    new TestDAO({
      pool,
      journaly,
    });
    new ObjectDAO({
      pool,
      journaly,
    });
    const handler = new Handler(write, read);
    const obj00 = {};
    obj00['test'] = 'test';
    const obj01 = {};
    obj01['test'] = 'test2';

    // console.log('TEST00');
    const persistencePromise = (await handler.addEvent(
      new Event({
        operation: Operation.create,
        name: 'Object',
        single: false,
        content: [obj00, obj01],
      })
    )) as IOutput<
      { id: ObjectId; test: string; timestamp: string },
      { id: ObjectId; test: string; timestamp: string }
    >;

    // console.log('TEST00:', persistencePromise);
    // console.log('TEST00 Rec:', persistencePromise?.receivedItem);
    const receivedItem = persistencePromise?.receivedItem;
    const receivedItemI0 = receivedItem ? receivedItem[0]?.id : undefined;
    const receivedItemI1 = receivedItem ? receivedItem[1]?.id : undefined;

    const obj0 = {
      ...obj00,
      id: receivedItemI0,
    };
    const obj1 = {
      ...obj01,
      id: receivedItemI1,
    };

    expect(persistencePromise?.receivedItem).toStrictEqual([obj0, obj1]);

    // console.log('TEST07');
    const persistencePromise1 = await handler.addEvent(
      new Event({
        operation: Operation.delete,
        name: 'Object',
        single: true,
        selection: obj00,
      })
    );
    expect(persistencePromise1?.receivedItem).toStrictEqual(true);
    expect(persistencePromise1?.selectedItem).toStrictEqual(obj00);
    expect(persistencePromise1?.sentItem).toStrictEqual(undefined);

    const persistencePromise2 = await handler.addEvent(
      new Event({
        operation: Operation.read,
        name: 'Object',
        single: true,
        selection: obj01,
      })
    );
    expect(persistencePromise2?.receivedItem).toStrictEqual({
      ...obj1,
      testNumber: null,
    });
    expect(persistencePromise2?.selectedItem).toStrictEqual(obj01);
    expect(persistencePromise2?.sentItem).toStrictEqual(undefined);

    const obj02 = { ...obj01, test: 'Object' };
    const persistencePromise3 = await handler.addEvent(
      new Event({
        operation: Operation.update,
        name: 'Object',
        single: false,
        selection: obj01,
        content: { test: obj02.test },
      })
    );
    const obj3 = { ...obj1, test: obj02.test };
    // console.log('TEST03:', persistencePromise3);
    // console.log('TEST03:', persistencePromise3?.receivedItem);
    // console.log('TEST03:', obj3);

    expect(persistencePromise3?.receivedItem).toStrictEqual(obj3);
    expect(persistencePromise3?.selectedItem).toStrictEqual(obj01);
    expect(persistencePromise3?.sentItem).toStrictEqual({ test: obj02.test });

    const persistencePromise4 = await handler.addEvent(
      new Event({
        operation: Operation.update,
        name: 'Object',
        single: true,
        selection: { id: obj3.id },
        content: obj01,
      })
    );

    expect(persistencePromise4?.receivedItem).toStrictEqual(obj1);
    expect(persistencePromise4?.selectedItem).toStrictEqual({ id: obj3.id });
    expect(persistencePromise4?.sentItem).toStrictEqual(obj01);

    const persistencePromise5 = await handler.addEvent(
      new Event({
        operation: Operation.read,
        name: 'Object',
        single: true,
        selection: { id: obj1.id },
      })
    );

    expect(persistencePromise5?.receivedItem).toStrictEqual({
      ...obj1,
      testNumber: null,
    });
    expect(persistencePromise5?.selectedItem).toStrictEqual({ id: obj1.id });
    expect(persistencePromise5?.sentItem).toStrictEqual(undefined);
    await handler.getWrite()?.clear();
    await write.close();
    await Utils.end(pool);
  });
});
