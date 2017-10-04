/* eslint no-console: off */
/* global PouchDB */
/* global SettingsHandler */

window.SettingsHandler = function() {
  this._settingsDb = new PouchDB('settings');

  this._settingsDb.createIndex({
    index: { fields: ['_id'] }
  })
    .then(() => this.loadRaw())
    .then(result => {
      if (result.docs.length === 0) {
        this._setupDefaultSettings();
      } else {
        this._fire('settings-loaded', this.asObject(result.docs));
      }
    });
};

SettingsHandler.prototype.asObject = function(list) {
  const settings = {};
  list.forEach(setting => {
    settings[setting._id] = setting.value;
  });
  return settings;
}

SettingsHandler.prototype.load = function(suppressEvent) {
  return this.loadRaw()
    .then(result => {
      const settings = this.asObject(result.docs);
      if (!suppressEvent) {
        this._fire('settings-loaded', settings);
      }
      return settings;
    });
};

SettingsHandler.prototype.loadRaw = function() {
  return this._settingsDb.find({
    selector: {
      _id: { $gte: null }
    }
  });
};

SettingsHandler.prototype.set = function(name, value) {
  return this._settingsDb.get(name).then(setting => {
    setting.value = value;
    return this._settingsDb.put(setting);
  }).catch(err => {
    if (err.status === 404) {
      return this._settingsDb.put({
        _id: name,
        value: value
      });
    } else {
      throw err;
    }
  });
};

SettingsHandler.prototype._setupDefaultSettings = function() {
  fetch('src/default-settings.json')
    .then(response => {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      throw Error('Settings file invalid');
    })
    .then(settings => {
      return Promise.all(settings.map(setting => this.set(setting.name, setting.value)));
    })
    .then(() => this.loadRaw())
    .then(result => {
      this._fire('settings-loaded', result.docs);
    });
};

SettingsHandler.prototype._fire = function(name, detail) {
  document.dispatchEvent(
    new CustomEvent(name, { detail: detail, bubbles: false, composed: false })
  );
};