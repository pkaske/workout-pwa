# WORKOUT-PWA

**Build using the Polymer App Toolbox - Starter Kit**

A on the point workout app that is build as a PWA and aims to bring only the features that are really needed to plan workouts and track progress.

### Incomplete TO-DO List:

* [x] Manage exercise catalog (will be changed and extended in the future).
* [x] Manage workout plans.
* [ ] Workout "Player"
* [ ] Create notes to each workout / exercise while working out.
* [ ] Timer that assists with rest times between sets.
* [ ] Track progress for each exercise.
* [x] Offline first thanks to Service Worker.

### Data Models

All data is stored on the device with pouchdb.  
Currently no sync to any server happens.

**Exercises**

The weight is always saved in kg.

```json
{
  "_id": "ID",
  "name": "Exercise name",
  "records": [
    {
      "date": "2017-10-02T16:32:35.907Z",
      "plan": "UUID",
      "sets": [
        { "weight": 22.5, "reps": 4 },
        { "weight": 25, "reps": 5 }
      ],
      "notes": "Some notes to the performance on that exercise on this particular training day"
    }
  ]
}
```

**Workout Plan**

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
```

**Structure of the current workout session in the "workout player"**

```json
{
  "name": "Leg day",
  "days": [ 1, 4 ],
  "exercises": [
    { "id": "UUID1", "name": "Exercise 1" "sets": 3, "records": ["..."] },
    { "id": "UUID2", "name": "Exercise 2" "sets": 3, "records": ["..."] }
  ],
  "plan": "[object of the workout plan this session belongs to]"
}
```