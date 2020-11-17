import { Handler, Operation, Event } from 'flexiblepersistence';
import TestDAO from './testDAO';
import ObjectDAO from './objectDAO';
import { eventDatabase, database, journaly } from './databases';
import { DAODB, Utils } from '../../source';
let read;
let write;
test('add and read array and find object', async (done) => {
  write = eventDatabase;
  read = new DAODB(database);
  const pool = read.getPool();
  await Utils.init(pool);
  new TestDAO({
    pool,
    journaly,
  });
  new ObjectDAO({
    pool,
    journaly,
  });
  const handler = new Handler(write, read);
  await handler.getWrite().clear('events');
  const obj = {};
  obj['test'] = 'test';
  try {
    // console.log('TEST00');
    const persistencePromise = await handler.addEvent(
      new Event({ operation: Operation.create, name: 'Object', content: obj })
    );

    // console.log('TEST00:', persistencePromise);

    expect(persistencePromise.receivedItem).toStrictEqual({
      id: persistencePromise.receivedItem.id,
      test: 'test',
      testnumber: null,
    });

    // console.log('TEST02');

    const persistencePromise1 = await handler.readArray('Object', {});
    // console.log('TEST02', persistencePromise1);
    expect(persistencePromise1.receivedItem).toStrictEqual([
      {
        id: persistencePromise1.receivedItem[0].id,
        test: 'test',
        testnumber: null,
      },
    ]);
    expect(persistencePromise1.selectedItem).toStrictEqual({});
    expect(persistencePromise1.sentItem).toStrictEqual(undefined);

    // console.log('TEST03');

    const persistencePromise2 = await handler.readItem('Object', {});

    // console.log('TEST03:', persistencePromise2);
    expect(persistencePromise2.receivedItem).toStrictEqual({
      id: persistencePromise2.receivedItem.id,
      test: 'test',
      testnumber: null,
    });
    expect(persistencePromise2.selectedItem).toStrictEqual({});
    expect(persistencePromise2.sentItem).toStrictEqual(undefined);

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
    expect(persistencePromise3.receivedItem).toStrictEqual({
      id: persistencePromise2.receivedItem.id,
      test: 'bob',
      testnumber: null,
    });
    expect(persistencePromise3.selectedItem).toStrictEqual({
      test: 'test',
    });
    expect(persistencePromise3.sentItem).toStrictEqual({
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

    expect(persistencePromise4.receivedItem).toStrictEqual(1);
    expect(persistencePromise4.selectedItem).toStrictEqual({ test: 'bob' });
    expect(persistencePromise4.sentItem).toStrictEqual(undefined);

    // console.log('TEST06');
    const persistencePromise5 = await handler.readArray('Object', {});

    expect(persistencePromise5.receivedItem.length).toBe(0);
    expect(persistencePromise5.receivedItem).toStrictEqual([]);
    expect(persistencePromise5.selectedItem).toStrictEqual({});
    expect(persistencePromise5.sentItem).toStrictEqual(undefined);

    // console.log('TEST07');
    const persistencePromise6 = await handler.addEvent(
      new Event({
        operation: Operation.delete,
        name: 'Object',
        single: false,
      })
    );
    expect(persistencePromise6.receivedItem).toStrictEqual(0);
    expect(persistencePromise6.selectedItem).toStrictEqual(undefined);
    expect(persistencePromise6.sentItem).toStrictEqual(undefined);
  } catch (error) {
    await handler.addEvent(
      new Event({
        operation: Operation.delete,
        name: 'Object',
        single: false,
      })
    );
    // const persistencePromise7 = await handler.readArray('Object', {});
    // expect(persistencePromise7.result.rowCount).toBe(0);
    await handler.getWrite().clear('events');
    await Utils.end(pool);
    await write.close();
    console.error(error);
    expect(error).toBe(null);
    done();
  }
  await handler.addEvent(
    new Event({ operation: Operation.delete, name: 'Object' })
  );
  await handler.getWrite().clear('events');
  await Utils.end(pool);
  await write.close();
  done();
});
