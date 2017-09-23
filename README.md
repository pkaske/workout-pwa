# WORKOUT-PWA

**Build using the Polymer App Toolbox - Starter Kit**

A on the point workout app that is build as a PWA and aims to bring only the features that are really needed to plan workouts and track progress.

### Incomplete TO-DO List:

* [x] Manage exercise catalog.
* [ ] Manage workout plans.
* [ ] Create notes to each workout / exercise while working out.
* [ ] Timer that assists with rest times between sets.
* [ ] Track progress for each exercise.
* [ ] Work completely offline.

### Data Models

All data is stored on the device with pouchdb.  
Currently no sync to any server happens.

**exercises**

```json
{
  "_id": "ID",
  "name": "Exercise name"
}
```

**workout plan**

```json
{
  "_id": "PouchDB Doc ID",
  "_rev": "PouchDB Rev",
  "name": "Workout plan name",
  "active": true,
  "sessions": [{
    "name": "Leg day",
    "days": [ 1, 4 ],
    "exercises": [ { "id": "UUID1", "sets": 3 }, { "id": "UUID2", "sets": 3 } ]
  }]
}