@codesignal/meteor-protomongo<br>[![](http://img.shields.io/npm/dm/@codesignal/meteor-protomongo.svg?style=flat)](https://www.npmjs.com/package/@codesignal/meteor-protomongo) [![npm version](https://badge.fury.io/js/%40codesignal%2Fmeteor-protomongo.svg)](https://www.npmjs.com/package/@codesignal/meteor-protomongo)
=

**Monkey-patches to `meteor/mongo`.**

*Helpful for working with indexes and transitioning away from Fibers.*

**Update, April 2022:**

This proposed update to the core `meteor/mongo` package will add `*Async` versions of some of these methods by default, although the PR is currently pending and needs a new owner:
https://github.com/meteor/meteor/pull/11605

Until then, the `*Async` methods in this repo should have the same API as the proposed methods in `meteor/mongo`, so they might be helpful in getting a head start on the transition away from Fibers even before those change are released, or if you are on an earlier version of Meteor.

After those changes are finalized and released, we plan to release a new version of this package that removes our own monkey-patched `*Async` methods in favor of the official ones. However, other helpers like `getIndexes`, `ensureIndex`, and `ensureNoIndex` will still be provided.

## Description

This package extends the `Collection` and `Cursor` prototypes from `meteor/mongo` with a few handy asynchronous methods, as well as some index-related helpers we just couldn't live without. It's intended for use only with projects built with [Meteor](https://www.meteor.com/).

### API

#### Collection Prototype

```js
Collection.findOneAsync(selector, ?options);
```

Returns a Promise that is resolved with the found document, or null.


```js
Collection.updateAsync(selector, modifier, ?options);
```

Returns a Promise that is resolved with the number of updated documents if the update is successful, or rejects with an error if there is one.

```js
Collection.updateManyAsync(selector, modifier, ?options);
```

Same as `Collection.updateAsync`; passes `{ multi: true }` in addition to the passed `options`.

```js
Collection.insertAsync(document);
```

Returns a Promise that is resolved with document ID if insert was successful, and rejects with the insert error otherwise.

```js
Collection.upsertAsync(query, modifier);
```

Returns a Promise that is resolved with the number of affected documents if upsert was successful, and rejects with the upsert error otherwise.

```js
Collection.removeAsync(selector);
```

Returns a Promise that is resolved with the number of deleted documents if action was successful, and rejects with the remove error otherwise.

```js
Collection.getIndexes();
```

Returns a Promise that is resolved with an array of indexes for this collection. For example, you might see this for a users collection with only an index on ID:
```js
[{ v: 2, key: { _id: 1 }, name: '_id_', ns: 'meteor.users' }]
```

```js
Collection.ensureIndex(selector, options);
```

Ensures an index exists. Similar to the built-in `createIndex`, but handles the case where the index already exists with different options by removing and re-adding the index with the new options. To ensure your database has the same indexes across different environments, you might want to add `ensureIndex` calls to `Meteor.startup`.

```js
Collection.ensureNoIndex(selector);
```

The reverse of `ensureIndex`. You might want to call this in `Meteor.startup` to make sure an index has been removed in all of your deployed environments.

```js
Collection.aggregate(pipeline, ?options);
```

Exposes the [aggregate method](https://www.mongodb.com/docs/manual/reference/method/db.collection.aggregate/). This removes the need to use `rawCollection()` every time you want to aggregate.

#### Cursor Prototype

```js
Cursor.forEachAsync(callback, ?thisArg);
```

Returns a Promise that is resolved after the callback has been applied to each document.

```js
Cursor.mapAsync(callback, ?thisArg);
```

Returns a Promise that is resolved with an array of the transformed documents.

```js
Cursor.fetchAsync();
```

Returns a Promise that is resolved with an array of the found documents.

```js
Cursor.countAsync();
```

Returns a Promise that is resolved with the number of matching documents.

## Install

```bash
npm install @codesignal/meteor-protomongo
```

After the package is installed, add the following few lines in a file that's going to be loaded on startup:
```js
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import ProtoMongo from '@codesignal/meteor-protomongo';

ProtoMongo.extendCollection(Mongo);
ProtoMongo.extendCursor(Meteor.users.find()); // any cursor works here
```

To extend the Cursor prototype, we ask the consuming application to pass in any cursor instance (it does not matter the collection or the query, as long as it's from a Meteor Mongo collection driver), which can be found by calling `db.someCollection.find()`. A safe choice might be `Meteor.users.find()` (as shown in the example), since this is likely to exist in any app using `accounts-base`.

This is unfortunately necessary because `meteor/mongo` does not export the `Cursor` type used on the server. So, the only reliable way to find the `Cursor` prototype is to get it from a cursor instance.

## Building Locally

After checking out this repo, run...

```sh
npm install
npm run build
```

To do local checks:
```sh
npm run eslint
npm run flow
```

## Contributing

If you'd like to make a contribution, please open a pull request in [package repository](https://github.com/CodeSignal/meteor-protomongo).

If you're so cool that you want (and have enough rights) to publish a new version, please follow the instructions below:
* Make sure you have [NPM](https://www.npmjs.com/) account and are a member of [codesignal](https://www.npmjs.com/org/codesignal) organization;
* Follow instructions from [npm docs](https://docs.npmjs.com/getting-started/publishing-npm-packages) to set up NPM user in your local environment;
* Update package version, and push changes to git with `npm version <new_version>`, `git push origin master`, `git push --tags`;
* Update package version, and publish the package with `npm publish --access public`.

## License

MIT
