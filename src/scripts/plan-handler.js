/* eslint no-console: off */
/* global PouchDB */

class PlanHandler {
  constructor() {
    this._planDb = new PouchDB('plans');

    this._planDb.createIndex({
      index: { fields: ['name'] }
    })
      .then(() => this.all())
      .then(result => {
        this._fire('plans-changed', result);
      });

    this._changeFeed();
  }

  create(doc) {
    return this._planDb.post(doc);
  }

  edit(doc) {
    return this._planDb.put(doc);
  }

  all() {
    return this._planDb.find({
      selector: {
        name: { $gte: null }
      },
      sort: [ 'name' ]
    });
  }

  deleteById(id) {
    return this._planDb.get(id)
      .then(doc => this._planDb.remove(doc))
      .then(() => this.all()).then(result => {
        this._fire('plans-changed', result);
      });
  }

  _changeFeed() {
    this._planDb.changes({
      since: 'now',
      live: true
    }).on('change', () => {
      this.all().then(result => {
        this._fire('plans-changed', result);
      });
    });
  }

  _fire(name, detail) {
    document.dispatchEvent(
      new CustomEvent(name, { detail: detail, bubbles: false, composed: false })
    );
  }
}