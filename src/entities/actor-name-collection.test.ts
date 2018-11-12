
import test from 'ava';

import { ActorNameCollection } from './actor-name-collection';


test('empty collection', t => {
    t.is(new ActorNameCollection('en').length, 0);
    t.is(ActorNameCollection.fromArray([], 'en').length, 0);
});

test('ignore invalid items', t => {
    const collection = new ActorNameCollection('en');
    collection.add({ name: '', popularity: 1, type: 'SAME' });
    t.is(collection.length, 0);
    collection.add({ name: 'a', popularity: 1, type: 'SAME' });
    t.is(collection.length, 0);
    collection.add({ name: 'A', popularity: 1, type: 'SAME' });
    t.is(collection.length, 0);
    collection.add({ name: '--1%$', popularity: 1, type: 'SAME' });
    t.is(collection.length, 0, 'ignore name invalid chars');
});

test('sort by popularity', t => {
    const collection = new ActorNameCollection('en');
    collection.add({ name: 'Name 1', popularity: 1, type: 'SAME' });
    collection.add({ name: 'Name 2', popularity: 2, type: 'SAME' });
    collection.add({ name: 'Name 3', popularity: 3, type: 'SAME' });

    t.is(collection.length, 3, 'added 3 items');

    t.deepEqual(collection.nameList(), ['Name 3', 'Name 2', 'Name 1'], 'sort items by popularity');
});

test('unique items', t => {
    const collection = new ActorNameCollection('en');
    collection.add({ name: 'Name 1', popularity: 1, type: 'SAME' });
    collection.add({ name: 'Name 1', popularity: 2, type: 'SAME' });
    collection.add({ name: 'Name 3', popularity: 3, type: 'SAME' });

    t.is(collection.length, 2, 'uniq 2 items');

    t.deepEqual(collection.nameList(), ['Name 3', 'Name 1'], 'unique names');
});

test('most popular unique items', t => {
    const collection = new ActorNameCollection('en');
    collection.add({ name: 'Name 1', popularity: 1, type: 'SAME' });
    collection.add({ name: 'Name 1', popularity: 2, type: 'SAME' });

    t.is(collection.length, 1, 'uniq 1 items');
    const names = collection.list();
    t.is(names[0].popularity, 2, 'popularity 2');

    t.deepEqual(collection.nameList(), ['Name 1'], 'unique names');
});

test('type=WIKI has priority', t => {
    const collection = new ActorNameCollection('en');
    collection.add({ name: 'Name 1', popularity: 1, type: 'SAME' });
    collection.add({ name: 'Name 1', popularity: 2, type: 'WIKI' });

    t.is(collection.length, 1, 'uniq 1 items');
    const names = collection.list();
    t.is(names[0].type, 'WIKI', 'priority WIKI type');
});
