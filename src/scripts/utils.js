window.Utils = {
  _equals: function (obj1, obj2) {
    var p;
    for (p in obj1) {
      if (typeof (obj2[p]) === 'undefined') {
        return false;
      }
    }
  
    for (p in obj1) {
      if (obj1[p]) {
        switch (typeof (obj1[p])) {
          case 'object':
            if (!this._equals(obj1[p], obj2[p])) {
              return false;
            }
            break;
          default:
            if (obj1[p] !== obj2[p]) {
              return false;
            }
        }
      } else {
        if (obj2[p])
          return false;
      }
    }
  
    for (p in obj2) {
      if (typeof (obj1[p]) === 'undefined') {
        return false;
      }
    }
  
    return true;
  }
}