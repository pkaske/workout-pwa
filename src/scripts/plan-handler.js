/* eslint no-console: off */
/* global PouchDB */
/* global PlanHandler */
/* global Utils */

window.PlanHandler = function() {
  this._planDb = new PouchDB('plans');
  this._sessionDb = new PouchDB('sessions');
  this._sessionRecordDb = new PouchDB('sessions_records');

  this._planDb.createIndex({
    index: { fields: [ 'name' ] }
  })
    .then(() => this.all())
    .then(result => {
      this._fire('plans-changed', result);
    });

  this._sessionDb.createIndex({
    index: { fields: [ 'order', 'plan' ] }
  })
    .then(() => this.allSessions())
    .then(result => {
      this._fire('sessions-changed', result);
    });

  this._sessionRecordDb.createIndex({
    index: { fields: [ 'started', 'session' ] }
  });

  this._changeFeed();
};

PlanHandler.prototype.create = function(doc) {
  doc.created = new Date().toISOString();
  const sessions = doc.sessions;
  delete doc.sessions;
  return this._planDb.post(doc)
    .then(response => {
      return Promise.all(sessions.map(session => {
        session.plan = response.id;
        return this._sessionDb.post(session);
      }));
    });
};

PlanHandler.prototype.edit = function(plan) {
  delete plan.sessions;
  return this._planDb.get(plan._id)
    .then(doc => {
      if (Utils._equals(doc, plan)) {
        return Promise.resolve();
      } else {
        return this._planDb.put(plan);
      }
    })
};

PlanHandler.prototype.startSession = function(session, record) {
  return this._sessionDb.get(session._id)
    .then(doc => {
      doc.running = true;
      doc.currentRecord = record;
      return this._sessionDb.put(doc);
    });
};

/**
 * Find the current and previous session record.
 * They're used to load the last exercises records of the previous session
 * and to create new exercise records for the current session.
 */
PlanHandler.prototype.getSessionRecords = function(session) {
  return this._sessionRecordDb.find({
    selector: {
      session: session._id,
      started: { $gte: null }
    },
    sort: [ 'started' ],
    limit: 2
  })
  .then(result => {
    const allRecords = result.docs;
    return { current: allRecords[0], previous: allRecords[1] };
  })
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

/**
 * Creates a new session record that is be associated with the
 * workout plan, the selected session and the exercise records.
 */
PlanHandler.prototype.startSessionRecord = function(session, plan) {
  const record = {
    plan: plan._id,
    session: session._id,
    started: new Date().toISOString(),
    ended: false
  };

  return this._sessionRecordDb.post(record);
};

PlanHandler.prototype.allSessions = function() {
  return this._sessionDb.find({
    selector: {
      order: { $gte: null }
    },
    sort: [ 'order' ]
  });
};

PlanHandler.prototype.getSessions = function(plan) {
  return this._sessionDb.find({
    selector: {
      plan: Array.isArray(plan) ? { $in: plan } : plan._id,
      order: { $gt: null }
    },
    sort: [ 'order' ]
  })
  .then(result => {
    return result.docs;
  });
};

PlanHandler.prototype.createSession = function(session) {
  return this._sessionDb.post(session);
};

PlanHandler.prototype.editSession = function(session) {
  return this._sessionDb.get(session._id)
    .then(doc => {
      if (Utils._equals(doc, session)) {
        return Promise.resolve();
      } else {
        return this._sessionDb.post(session);
      }
    });
};

PlanHandler.prototype.deleteSessionById = function(id) {
  return this._sessionDb.get(id)
    .then(doc => this._sessionDb.remove(doc))
    .then(() => this.allSessions()).then(result => {
      this._fire('sessions-changed', result);
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

  this._sessionDb.changes({
    since: 'now',
    live: true
  }).on('change', () => {
    this.allSessions().then(result => {
      this._fire('sessions-changed', result);
    });
  });
};

PlanHandler.prototype._fire = function(name, detail) {
  document.dispatchEvent(
    new CustomEvent(name, { detail: detail, bubbles: false, composed: false })
  );
};
