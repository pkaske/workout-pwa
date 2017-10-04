/* eslint no-console: off */
/* global PouchDB */
/* global PlanHandler */

window.PlanHandler = function() {
  this._planDb = new PouchDB('plans');

  this._planDb.createIndex({
    index: { fields: ['name'] }
  })
    .then(() => this.all())
    .then(result => {
      this._fire('plans-changed', result);
    });

  this._changeFeed();
};

PlanHandler.prototype.create = function(doc) {
  return this._planDb.post(doc);
};

PlanHandler.prototype.edit = function(doc) {
  return this._planDb.put(doc);
};

PlanHandler.prototype.all = function() {
  return this._planDb.find({
    selector: {
      name: { $gte: null }
    },
    sort: [ 'name' ]
  });
};

PlanHandler.prototype.deleteById = function(id) {
  return this._planDb.get(id)
    .then(doc => this._planDb.remove(doc))
    .then(() => this.all()).then(result => {
      this._fire('plans-changed', result);
    });
};

PlanHandler.prototype._changeFeed = function() {
  this._planDb.changes({
    since: 'now',
    live: true
  }).on('change', () => {
    this.all().then(result => {
      this._fire('plans-changed', result);
    });
  });
};

PlanHandler.prototype._fire = function(name, detail) {
  document.dispatchEvent(
    new CustomEvent(name, { detail: detail, bubbles: false, composed: false })
  );
};