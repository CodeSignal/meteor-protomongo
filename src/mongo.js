// @flow strict

const ERROR_CODES = Object.freeze({
  indexOptionsConflict: 85
});

// $FlowFixMe: meteor/mongo doesn't have nice Flow types
function extend(Mongo: Object) {
  if (!Mongo) {
    throw new Error('Mongo should be truthy!');
  }

  if (!Mongo.Collection || typeof Mongo.Collection !== 'function') {
    throw new Error('Mongo.Collection is not a prototypable constructor!');
  }

  Object.assign(Mongo.Collection.prototype, {
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

module.exports = { extend };
