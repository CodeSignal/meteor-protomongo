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
      return this.updateAsync(selector, modifier, {
        ...options,
        multi: true
      });
    },

    insertAsync(document) {
      return new Promise((resolve, reject) => {
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
        this.rawCollection().indexes((error, indexes) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(indexes);
        });
      });
    },

    ensureNoIndex(selector) {
      try {
        this._dropIndex(selector);
      } catch (error) {
        if (error.codeName !== 'IndexNotFound') {
          console.error(error, 'Error when calling ensureNoIndex');
        }
      }
    }
  });
}

module.exports = { extend };
