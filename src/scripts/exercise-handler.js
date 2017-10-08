/* eslint no-console: off */
/* global PouchDB */
/* global ExerciseHandler */
/* global Utils */

window.ExerciseHandler = function() {
  this._exercisedDb = new PouchDB('exercises');
  this._exercisedSessionDb = new PouchDB('exercises_records');

  this._exercisedDb.createIndex({
    index: { fields: [ 'name' ] }
  })
    .then(() => this.all())
    .then(result => {
      if (result.docs.length === 0) {
        this._setupDefaultExercises();
        this._changeFeed();
      } else {
        this._fire('exercises-changed', result);
        this._changeFeed();
      }
    });

  this._exercisedDb.createIndex({
    index: { fields: [ 'sessionRecord' ] }
  })
};

ExerciseHandler.prototype._setupDefaultExercises = function() {
  fetch('src/default-exercises.json')
    .then(response => {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      throw Error('Exercises file invalid');
    })
    .then(list => {
      return Promise.all(list.map(ex => this.create(ex)));
    })
    .then(() => {
      console.info('Default exercises created');
    })
    .catch(err => {
      console.warn(err.message);
    });
};

// ExerciseHandler.prototype.initRecord = function(ex, plan) {
//   return this._exercisedDb.get(ex.id)
//     .then(doc => {
//       doc.records = doc.records || [];
//       doc.records.push({
//         date: new Date(),
//         plan: plan._id,
//         sets: [ ]
//       });
//       return this.edit(doc);
//     });
// };

// ExerciseHandler.prototype.saveSet = function(ex, index, set) {
//   return this._exercisedDb.get(ex.id)
//     .then(exDoc => {
//       exDoc.records = exDoc.records || [];

//     });
// };

ExerciseHandler.prototype.create = function(doc) {
  return this._exercisedDb.post(doc);
};

ExerciseHandler.prototype.edit = function(ex) {
  return this._exercisedDb.get(ex._id)
    .then(doc => {
      if (Utils._equals(ex, doc)) {
        return Promise.resolve();
      } else {
        return this._exercisedDb.put(ex);
      }
    })
};

ExerciseHandler.prototype.all = function() {
  return this._exercisedDb.find({
    selector: {
      name: { $gte: null }
    },
    fields: [ '_id', 'name', '_rev' ],
    sort: [ 'name' ]
  });
};

ExerciseHandler.prototype.getRecordsForSession = function(currentSession, previousSession) {
  return Promise.all([
    this._exercisedSessionDb.find({
      selector: {
        sessionRecord: currentSession._id
      }
    }),
    !previousSession ? Promise.resolve({ docs: [] }) : 
    this._exercisedSessionDb.find({
      selector: {
        sessionRecord: previousSession._id
      }
    })
  ])
  .then(result => {
    return { current: result[0].docs, previous: result[1].docs };
  });
};

ExerciseHandler.prototype.saveRecord = function(record) {
  return this._exercisedSessionDb.post(record);
};

ExerciseHandler.prototype.getDataForSession = function(session) {
  const exIds = session.exercises.map(ex => ex.id);
  return this._exercisedDb.find({
    selector: {
      _id: { $in: exIds }
    }
  })
  .then(result => {
    return result.docs;
  });
};

ExerciseHandler.prototype.deleteById = function(id) {
  return this._exercisedDb.get(id)
    .then(doc => this._exercisedDb.remove(doc))
    .then(() => this.all()).then(result => {
      this._fire('exercises-changed', result);
    });
};

ExerciseHandler.prototype._changeFeed = function() {
  this._exercisedDb.changes({
    since: 'now',
    live: true
  }).on('change', () => {
    this.all().then(result => {
      this._fire('exercises-changed', result);
    });
  });
};

ExerciseHandler.prototype._fire = function(name, detail) {
  document.dispatchEvent(
    new CustomEvent(name, { detail: detail, bubbles: false, composed: false })
  );
};