/* eslint no-console: off */
/* global PouchDB */

class ExerciseHandler {
  constructor() {
    this._exercisedDb = new PouchDB('exercises');

    this._exercisedDb.createIndex({
      index: { fields: ['name'] }
    })
      .then(() => this.all())
      .then(result => {
        if (result.docs.length === 0) {
          this._setupDefaultExercises();
        } else {
          this._fire('exercises-changed', result);
        }
      });

    this._changeFeed();
  }

  _setupDefaultExercises() {
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
  }

  create(doc) {
    const exercise = doc;
    return this._exercisedDb.post(exercise);
  }

  edit(doc) {
    return this._exercisedDb.put(doc);
  }

  all() {
    return this._exercisedDb.find({
      selector: {
        name: { $gte: null }
      },
      sort: [ 'name' ]
    });
  }

  deleteById(id) {
    return this._exercisedDb.get(id)
      .then(doc => this._exercisedDb.remove(doc))
      .then(() => this.all()).then(result => {
        this._fire('exercises-changed', result);
      });
  }

  _changeFeed() {
    this._exercisedDb.changes({
      since: 'now',
      live: true
    }).on('change', () => {
      this.all().then(result => {
        this._fire('exercises-changed', result);
      });
    });
  }

  _fire(name, detail) {
    document.dispatchEvent(
      new CustomEvent(name, { detail: detail, bubbles: false, composed: false })
    );
  }
}