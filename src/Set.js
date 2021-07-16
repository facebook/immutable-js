import { Collection, SetCollection, KeyedCollection } from './Collection';
import { isOrdered } from './predicates/isOrdered';
import { IS_SET_SYMBOL, isSet } from './predicates/isSet';
import { emptyMap } from './Map';
import { DELETE } from './TrieUtils';
import { sortFactory } from './Operations';
import assertNotInfinite from './utils/assertNotInfinite';
import { asImmutable } from './methods/asImmutable';
import { asMutable } from './methods/asMutable';
import { withMutations } from './methods/withMutations';

import { OrderedSet } from './OrderedSet';

export class Set extends SetCollection {
  // @pragma Construction

  constructor(value) {
    return value === null || value === undefined
      ? emptySet()
      : isSet(value) && !isOrdered(value)
      ? value
      : emptySet().withMutations(set => {
          const iter = SetCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(v => set.add(v));
        });
  }

  static of(/*...values*/) {
    return this(arguments);
  }

  static fromKeys(value) {
    return this(KeyedCollection(value).keySeq());
  }

  static intersect(sets) {
    sets = Collection(sets).toArray();
    return sets.length
      ? SetPrototype.intersect.apply(Set(sets.pop()), sets)
      : emptySet();
  }

  static union(sets) {
    sets = Collection(sets).toArray();
    return sets.length
      ? SetPrototype.union.apply(Set(sets.pop()), sets)
      : emptySet();
  }

  toString() {
    return this.__toString('Set {', '}');
  }

  // @pragma Access

  has(value) {
    return this._map.has(value);
  }

  // @pragma Modification

  add(value) {
    return updateSet(this, this._map.set(value, value));
  }

  remove(value) {
    return updateSet(this, this._map.remove(value));
  }

  toggle(value) {
    return this.has(value) ? this.remove(value) : this.add(value);
  }

  clear() {
    return updateSet(this, this._map.clear());
  }

  // @pragma Composition

  map(mapper, context) {
    // keep track if the set is altered by the map function
    let didChanges = false;

    const newMap = updateSet(
      this,
      this._map.mapEntries(([, v]) => {
        const mapped = mapper.call(context, v, v, this);

        if (mapped !== v) {
          didChanges = true;
        }

        return [mapped, mapped];
      }, context)
    );

    return didChanges ? newMap : this;
  }

  union(...iters) {
    iters = iters.filter(x => x.size !== 0);
    if (iters.length === 0) {
      return this;
    }
    if (this.size === 0 && !this.__ownerID && iters.length === 1) {
      return this.constructor(iters[0]);
    }
    return this.withMutations(set => {
      for (let ii = 0; ii < iters.length; ii++) {
        SetCollection(iters[ii]).forEach(value => set.add(value));
      }
    });
  }

  intersect(...iters) {
    if (iters.length === 0) {
      return this;
    }
    iters = iters.map(iter => SetCollection(iter));
    const toRemove = [];
    this.forEach(value => {
      if (!iters.every(iter => iter.includes(value))) {
        toRemove.push(value);
      }
    });
    return this.withMutations(set => {
      toRemove.forEach(value => {
        set.remove(value);
      });
    });
  }

  subtract(...iters) {
    if (iters.length === 0) {
      return this;
    }
    iters = iters.map(iter => SetCollection(iter));
    const toRemove = [];
    this.forEach(value => {
      if (iters.some(iter => iter.includes(value))) {
        toRemove.push(value);
      }
    });
    return this.withMutations(set => {
      toRemove.forEach(value => {
        set.remove(value);
      });
    });
  }

  sort(comparator) {
    // Late binding
    return OrderedSet(sortFactory(this, comparator));
  }

  sortBy(mapper, comparator) {
    // Late binding
    return OrderedSet(sortFactory(this, comparator, mapper));
  }

  wasAltered() {
    return this._map.wasAltered();
  }

  __iterate(fn, reverse) {
    return this._map.__iterate(k => fn(k, k, this), reverse);
  }

  __iterator(type, reverse) {
    return this._map.__iterator(type, reverse);
  }

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    const newMap = this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      if (this.size === 0) {
        return this.__empty();
      }
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return this.__make(newMap, ownerID);
  }
}

Set.isSet = isSet;

const SetPrototype = Set.prototype;
SetPrototype[IS_SET_SYMBOL] = true;
SetPrototype[DELETE] = SetPrototype.remove;
SetPrototype.merge = SetPrototype.concat = SetPrototype.union;
SetPrototype.withMutations = withMutations;
SetPrototype.asImmutable = asImmutable;
SetPrototype['@@transducer/init'] = SetPrototype.asMutable = asMutable;
SetPrototype['@@transducer/step'] = function (result, arr) {
  return result.add(arr);
};
SetPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};

SetPrototype.__empty = emptySet;
SetPrototype.__make = makeSet;

function updateSet(set, newMap) {
  if (set.__ownerID) {
    set.size = newMap.size;
    set._map = newMap;
    return set;
  }
  return newMap === set._map
    ? set
    : newMap.size === 0
    ? set.__empty()
    : set.__make(newMap);
}

function makeSet(map, ownerID) {
  const set = Object.create(SetPrototype);
  set.size = map ? map.size : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}

let EMPTY_SET;
function emptySet() {
  return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
}
