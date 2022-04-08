// @flow strict

const ERROR_CODES = Object.freeze({
  indexOptionsConflict: 85
});

// $FlowFixMe: meteor/mongo doesn't have nice Flow types
function extendCollection(Mongo: Object) {
  if (!Mongo) {
    throw new Error('Mongo object must exist');
  }

  if (!Mongo.Collection || typeof Mongo.Collection !== 'function') {
    throw new Error('Mongo.Collection must be a function/class');
  }

  Object.assign(Mongo.Collection.prototype, {
    findOneAsync(selector, options) {
      return new Promise((resolve, reject) => {
        try {
          // $FlowExpectedError[object-this-reference]
          resolve(this.findOne(selector, options));
        } catch (error) {
          reject(error);
        }
      });
    },

    updateAsync(selector, modifier, options) {
      return new Promise((resolve, reject) => {
        // $FlowExpectedError[object-this-reference]
        this.update(selector, modifier, options, (error, numUpdated) => {
          if (error) {
            reject(error);
          } else {
            resolve(numUpdated);
          }
        });
      });
    },

    updateManyAsync(selector, modifier, options) {
      // $FlowExpectedError[object-this-reference]
      return this.updateAsync(selector, modifier, {
        ...options,
        multi: true
      });
    },

    insertAsync(document) {
      return new Promise((resolve, reject) => {
        // $FlowExpectedError[object-this-reference]
        this.insert(document, (error, id) => {
          if (error) {
            reject(error);
          } else {
            resolve(id);
          }
        });
      });
    },

    upsertAsync(query, modifier) {
      return new Promise((resolve, reject) => {
        // $FlowExpectedError[object-this-reference]
        this.upsert(query, modifier, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    },

    removeAsync(selector) {
      return new Promise((resolve, reject) => {
        // $FlowExpectedError[object-this-reference]
        this.remove(selector, (error, numRemoved) => {
          if (error) {
            reject(error);
          } else {
            resolve(numRemoved);
          }
        });
      });
    },

    getIndexes() {
      return new Promise((resolve, reject) => {
        // $FlowExpectedError[object-this-reference]
        this.rawCollection().indexes((error, indexes) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(indexes);
        });
      });
    },

    ensureIndex(selector, options) {
      try {
        // $FlowExpectedError[object-this-reference]
        this.createIndex(selector, options);
      } catch (error) {
        if (error?.code === ERROR_CODES.indexOptionsConflict) {
          /**
           * If index already exists with different options, remove old version and re-create:
           * https://docs.mongodb.com/manual/reference/command/createIndexes/#considerations
           */
          // $FlowExpectedError[object-this-reference]
          this.ensureNoIndex(selector);
          // $FlowExpectedError[object-this-reference]
          this.createIndex(selector, options);
          return;
        }

        throw error;
      }
    },

    ensureNoIndex(selector) {
      try {
        // $FlowExpectedError[object-this-reference]
        this._dropIndex(selector);
      } catch (error) {
        if (error.codeName !== 'IndexNotFound') {
          console.error(error, 'Error when calling ensureNoIndex');
        }
      }
    },

    aggregate(pipeline, options) {
      // $FlowExpectedError[object-this-reference]
      return this.rawCollection().aggregate(pipeline, options);
    }
  });
}

// $FlowFixMe: meteor/mongo doesn't have nice Flow types
function extendCursor(Meteor: Object) {
  if (!Meteor) {
    throw new Error('Meteor object must exist');
  }

  const cursorPrototype = Object.getPrototypeOf(Meteor.users.find());

  /*
  On the server, meteor/mongo does not export its Cursor type directly.
  So, the only reliable way to get the prototype is to actually find to create a cursor.
   */
  if (!cursorPrototype) {
    throw new Error('Mongo Cursor must be a function/class');
  }

  Object.assign(cursorPrototype, {
    forEachAsync(callback, thisArg) {
      return new Promise((resolve, reject) => {
        try {
          // $FlowExpectedError[object-this-reference]
          this.forEach(callback, thisArg);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },

    mapAsync(callback, thisArg) {
      return new Promise((resolve, reject) => {
        try {
          // $FlowExpectedError[object-this-reference]
          resolve(this.map(callback, thisArg));
        } catch (error) {
          reject(error);
        }
      });
    },

    fetchAsync() {
      return new Promise((resolve, reject) => {
        try {
          // $FlowExpectedError[object-this-reference]
          resolve(this.fetch());
        } catch (error) {
          reject(error);
        }
      });
    },

    countAsync() {
      return new Promise((resolve, reject) => {
        try {
          // $FlowExpectedError[object-this-reference]
          resolve(this.count());
        } catch (error) {
          reject(error);
        }
      });
    }
  });
}

module.exports = {
  extendCollection,
  extendCursor
};
