/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Iterable"
import "Map"
import "invariant"
import "TrieUtils"
/* global Iterable, KeyedCollection, Map, MapPrototype, emptyMap, invariant, DELETE */
/* exported Record */


class Record extends KeyedCollection {

  constructor(defaultValues, name) {
    var RecordType = function(values) {
      if (!(this instanceof RecordType)) {
        return new RecordType(values);
      }
      this._map = arguments.length === 0 ? Map() : Map(values);
    };

    var keys = Object.keys(defaultValues);

    var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
    RecordTypePrototype.constructor = RecordType;
    name && (RecordTypePrototype._name = name);
    RecordTypePrototype._defaultValues = arguments.length === 0 ? Map() : Map(defaultValues);
    RecordTypePrototype._keys = keys;
    RecordTypePrototype.size = keys.length;

    try {
      Iterable(defaultValues).forEach((_, key) => {
        Object.defineProperty(RecordType.prototype, key, {
          get: function() {
            return this.get(key);
          },
          set: function(value) {
            invariant(this.__ownerID, 'Cannot set on an immutable record.');
            this.set(key, value);
          }
        });
      });
    } catch (error) {
      // Object.defineProperty failed. Probably IE8.
    }

    return RecordType;
  }

  toString() {
    return this.__toString(this._name + ' {', '}');
  }

  // @pragma Access

  has(k) {
    return this._defaultValues.has(k);
  }

  get(k, notSetValue) {
    if (notSetValue !== undefined && !this.has(k)) {
      return notSetValue;
    }
    return this._map.get(k, this._defaultValues.get(k));
  }

  // @pragma Modification

  clear() {
    if (this.__ownerID) {
      this._map.clear();
      return this;
    }
    var SuperRecord = Object.getPrototypeOf(this).constructor;
    return SuperRecord._empty || (SuperRecord._empty = makeRecord(this, emptyMap()));
  }

  set(k, v) {
    if (!this.has(k)) {
      throw new Error('Cannot set unknown key "' + k + '" on ' + this._name);
    }
    var newMap = this._map.set(k, v);
    if (this.__ownerID || newMap === this._map) {
      return this;
    }
    return makeRecord(this, newMap);
  }

  remove(k) {
    if (!this.has(k)) {
      return this;
    }
    var newMap = this._map.remove(k);
    if (this.__ownerID || newMap === this._map) {
      return this;
    }
    return makeRecord(this, newMap);
  }

  keys() {
    return this._defaultValues.keys();
  }

  values() {
    return this._defaultValues.merge(this._map).values();
  }

  entries() {
    return this._defaultValues.merge(this._map).entries();
  }

  wasAltered() {
    return this._map.wasAltered();
  }

  __iterator(type, reverse) {
    return this._defaultValues.merge(this._map).__iterator(type, reverse);
  }

  __iterate(fn, reverse) {
    return Iterable(this._defaultValues).map((_, k) => this.get(k)).__iterate(fn, reverse);
  }

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map && this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return makeRecord(this, newMap, ownerID);
  }
}

var RecordPrototype = Record.prototype;
RecordPrototype._name = 'Record';
RecordPrototype[DELETE] = RecordPrototype.remove;
RecordPrototype.merge = MapPrototype.merge;
RecordPrototype.mergeWith = MapPrototype.mergeWith;
RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
RecordPrototype.update = MapPrototype.update;
RecordPrototype.updateIn = MapPrototype.updateIn;
RecordPrototype.withMutations = MapPrototype.withMutations;
RecordPrototype.asMutable = MapPrototype.asMutable;
RecordPrototype.asImmutable = MapPrototype.asImmutable;


function makeRecord(likeRecord, map, ownerID) {
  var record = Object.create(Object.getPrototypeOf(likeRecord));
  record._map = map;
  record.__ownerID = ownerID;
  return record;
}
