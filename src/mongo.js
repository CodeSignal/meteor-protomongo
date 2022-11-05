const ERROR_CODES = Object.freeze({
  indexOptionsConflict: 85
});

function extendCollection(Mongo) {
  if (!Mongo) {
    throw new Error('Mongo object must exist');
  }

  if (!Mongo.Collection || typeof Mongo.Collection !== 'function') {
    throw new Error('Mongo.Collection must be a function/class');
  }

  Object.assign(Mongo.Collection.prototype, {
    updateManyAsync(selector, modifier, options) {
      return this.updateAsync(selector, modifier, {
        ...options,
        multi: true
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

    ensureIndex(selector, options) {
      try {
        this.createIndex(selector, options);
      } catch (error) {
        if (error?.code === ERROR_CODES.indexOptionsConflict) {
          /**
           * If index already exists with different options, remove old version and re-create:
           * https://docs.mongodb.com/manual/reference/command/createIndexes/#considerations
           */
          this.ensureNoIndex(selector);
          this.createIndex(selector, options);
          return;
        }

        throw error;
      }
    },

    ensureNoIndex(selector) {
      try {
        this._dropIndex(selector);
      } catch (error) {
        if (error.codeName !== 'IndexNotFound') {
          console.error(error, 'Error when calling ensureNoIndex');
        }
      }
    },

    aggregate(pipeline, options) {
      return this.rawCollection().aggregate(pipeline, options);
    }
  });
}

module.exports = {
  extendCollection
};
