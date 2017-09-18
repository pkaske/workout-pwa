class ExerciseHandler {
  constructor() {
    this._exercisedDb = new PouchDB('exercises');

    this._exercisedDb.createIndex({
      index: { fields: ['name'] }
    }).then(() => {
      this.all().then(docs => {
        this._fire('exercises-changed', docs);
      })
    });

    this._changeFeed();
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
      .then(() => this.all()).then(docs => {
        this._fire('exercises-changed', docs);
      });
  }

  _changeFeed() {
    this._exercisedDb.changes({
      since: 'now',
      live: true
    }).on('change', () => {
      this.all().then(docs => {
        this._fire('exercises-changed', docs);
      });
    });
  }

  _fire(name, detail) {
    document.dispatchEvent(
      new CustomEvent(name, { detail: detail, bubbles: false, composed: false })
    );
  }
}