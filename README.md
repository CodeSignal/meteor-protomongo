@codesignal/meteor-protomongo<br>[![](http://img.shields.io/npm/dm/@codesignal/meteor-protomongo.svg?style=flat)](https://www.npmjs.com/package/@codesignal/meteor-protomongo) [![npm version](https://badge.fury.io/js/%40codesignal%2Fmeteor-protomongo.svg)](https://www.npmjs.com/package/@codesignal/meteor-protomongo)
=

**Adds asynchronous methods to `meteor/mongo`.**

*When you don't want to deal with fibers.*

## Description

This package extends `meteor/mongo` prototype with a few handy asynchronous method, and one more method you just couldn't live without. It means that it will only do something useful if your project is build with [Meteor](https://www.meteor.com/). Sorry about that!

### API

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

## Install

```bash
npm install @codesignal/meteor-protomongo
```

After the package is installed, add the following few lines in a file that's going to be loaded on startup:
```js
import { Mongo } from 'meteor/mongo';
import ProtoMongo from '@codesignal/meteor-protomongo';

ProtoMongo.extend(Mongo);
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
