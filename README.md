# WORKOUT-PWA

**Build using the Polymer App Toolbox - Starter Kit**

A on the point workout app that is build as a PWA and aims to bring only the features that are really needed to plan workouts and track progress.

**This is WIP** but feel free to try out what's there jet.  
Suggestions, PRs and everything else are very welcome.

### Run this or develop on it locally:

* Install polymer-cli and bower with `npm i -g polymer-cli bower`
* Clone this repo
* Cd into the repo
* Run `npm i`
* Run `bower i`
* Run `polymer serve`
* Open http://localhost:8081 in Chrome

You can additionally use `npm run watch` to develop with browser-sync.

I currently only optimize this PWA for mobile use on Chrome for Android. So it could be completely broken on other Browsers.

### Incomplete TO-DO List:

* [x] Manage exercise catalog (will be changed and extended in the future).
* [x] Manage workout plans.
* [ ] **Current WIP:** Workout "Player"
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
  "allTimePr": 22.5
}
```

**Workout Plan**

```json
{
  "_id": "UUID",
  "_rev": "PouchDB Rev",
  "name": "Workout plan name",
  "active": true,
  "created": "2017-10-02T16:32:35.907Z"
}
```

**Session**

```json
{
  "_id": "UUID",
  "plan": "UUID",
  "order": 1,
  "name": "Leg day",
  "days": [ 1, 4 ],
  "running": true,
  "currentRecord": "UUID",
  "exercises": [ { "id": "UUID1", "sets": 3 }, { "id": "UUID2", "sets": 3 } ]
}
```

**Session Record**

```json
{
  "_id": "UUID",
  "plan": "UUID",
  "session": "UUID",
  "started": "2017-10-02T16:32:35.907Z",
  "ended": "2017-10-02T17:56:45.907Z"
}
```

**Exercise Record**

```json
{
  "_id": "UUID",
  "exercise": "UUID",
  "sessionRecord": "UUID",
  "plan": "UUID",
  "sets": [
    { "weight": 22.5, "reps": 4, "done": "2017-10-02T16:35:22.907Z", "rest": 90 },
    { "weight": 25, "reps": 5, "done": "2017-10-02T16:39:22.907Z", "rest": 95 }
  ],
  "notes": "Some notes about the performance on that exercise on this particular training day"
}
```

**Structure of the current workout session in the "workout player". This structure is NOT saved in Pouchdb! It is composed when a session is started.**

```json
{
  "_id": "Session UUID",
  "name": "Leg day",
  "days": [ 1, 4 ],
  "running": true,
  "currentRecord": "UUID",
  "order": 0,
  "exercises": [
    {
      "id": "UUID1",
      "name": "Exercise 1",
      "sets": 3,
      "previousRecord": "[exercise record object]",
      "currentRecord": "[exercise record object]"
    },
    {
      "id": "UUID2",
      "name": "Exercise 2",
      "sets": 3,
      "previousRecord": "[exercise record object]",
      "currentRecord": "[exercise record object]"
    }
  ],
  "plan": "[object of the workout plan this session belongs to]"
}
```