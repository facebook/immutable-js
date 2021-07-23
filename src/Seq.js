import { wrapIndex } from './TrieUtils';
import { Collection } from './Collection';
import { IS_SEQ_SYMBOL, isSeq } from './predicates/isSeq';
import { isImmutable } from './predicates/isImmutable';
import { isCollection } from './predicates/isCollection';
import { isKeyed } from './predicates/isKeyed';
import { isAssociative } from './predicates/isAssociative';
import { isRecord } from './predicates/isRecord';
import { IS_ORDERED_SYMBOL } from './predicates/isOrdered';
import {
  Iterator,
  iteratorValue,
  iteratorDone,
  hasIterator,
  isIterator,
  getIterator,
  isEntriesIterable,
  isKeysIterable,
} from './Iterator';

import hasOwnProperty from './utils/hasOwnProperty';
import isArrayLike from './utils/isArrayLike';

export class Seq extends Collection {
  constructor(value) {
    return value === null || value === undefined
      ? emptySequence()
      : isImmutable(value)
      ? value.toSeq()
      : seqFromValue(value);
  }

  toSeq() {
    return this;
  }

  toString() {
    return this.__toString('Seq {', '}');
  }

  cacheResult() {
    if (!this._cache && this.__iterateUncached) {
      this._cache = this.entrySeq().toArray();
      this.size = this._cache.length;
    }
    return this;
  }

  // abstract __iterateUncached(fn, reverse)

  __iterate(fn, reverse) {
    const cache = this._cache;
    if (cache) {
      const size = cache.length;
      let i = 0;
      while (i !== size) {
        const entry = cache[reverse ? size - ++i : i++];
        if (fn(entry[1], entry[0], this) === false) {
          break;
        }
      }
      return i;
    }
    return this.__iterateUncached(fn, reverse);
  }

  // abstract __iteratorUncached(type, reverse)

  __iterator(type, reverse) {
    const cache = this._cache;
    if (cache) {
      const size = cache.length;
      let i = 0;
      return new Iterator(() => {
        if (i === size) {
          return iteratorDone();
        }
        const entry = cache[reverse ? size - ++i : i++];
        return iteratorValue(type, entry[0], entry[1]);
      });
    }
    return this.__iteratorUncached(type, reverse);
  }
}

export class KeyedSeq extends Seq {
  constructor(value) {
    return value === null || value === undefined
      ? emptySequence().toKeyedSeq()
      : isCollection(value)
      ? isKeyed(value)
        ? value.toSeq()
        : value.fromEntrySeq()
      : isRecord(value)
      ? value.toSeq()
      : keyedSeqFromValue(value);
  }

  toKeyedSeq() {
    return this;
  }
}

export class IndexedSeq extends Seq {
  constructor(value) {
    return value === null || value === undefined
      ? emptySequence()
      : isCollection(value)
      ? isKeyed(value)
        ? value.entrySeq()
        : value.toIndexedSeq()
      : isRecord(value)
      ? value.toSeq().entrySeq()
      : indexedSeqFromValue(value);
  }

  static of(/*...values*/) {
    return IndexedSeq(arguments);
  }

  toIndexedSeq() {
    return this;
  }

  toString() {
    return this.__toString('Seq [', ']');
  }
}

export class SetSeq extends Seq {
  constructor(value) {
    return (
      isCollection(value) && !isAssociative(value) ? value : IndexedSeq(value)
    ).toSetSeq();
  }

  static of(/*...values*/) {
    return SetSeq(arguments);
  }

  toSetSeq() {
    return this;
  }
}

Seq.isSeq = isSeq;
Seq.Keyed = KeyedSeq;
Seq.Set = SetSeq;
Seq.Indexed = IndexedSeq;

Seq.prototype[IS_SEQ_SYMBOL] = true;

// #pragma Root Sequences

export class ArraySeq extends IndexedSeq {
  constructor(array) {
    this._array = array;
    this.size = array.length;
  }

  get(index, notSetValue) {
    return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
  }

  __iterate(fn, reverse) {
    const array = this._array;
    const size = array.length;
    let i = 0;
    while (i !== size) {
      const ii = reverse ? size - ++i : i++;
      if (fn(array[ii], ii, this) === false) {
        break;
      }
    }
    return i;
  }

  __iterator(type, reverse) {
    const array = this._array;
    const size = array.length;
    let i = 0;
    return new Iterator(() => {
      if (i === size) {
        return iteratorDone();
      }
      const ii = reverse ? size - ++i : i++;
      return iteratorValue(type, ii, array[ii]);
    });
  }
}

class ObjectSeq extends KeyedSeq {
  constructor(object) {
    const keys = Object.keys(object);
    this._object = object;
    this._keys = keys;
    this.size = keys.length;
  }

  get(key, notSetValue) {
    if (notSetValue !== undefined && !this.has(key)) {
      return notSetValue;
    }
    return this._object[key];
  }

  has(key) {
    return hasOwnProperty.call(this._object, key);
  }

  __iterate(fn, reverse) {
    const object = this._object;
    const keys = this._keys;
    const size = keys.length;
    let i = 0;
    while (i !== size) {
      const key = keys[reverse ? size - ++i : i++];
      if (fn(object[key], key, this) === false) {
        break;
      }
    }
    return i;
  }

  __iterator(type, reverse) {
    const object = this._object;
    const keys = this._keys;
    const size = keys.length;
    let i = 0;
    return new Iterator(() => {
      if (i === size) {
        return iteratorDone();
      }
      const key = keys[reverse ? size - ++i : i++];
      return iteratorValue(type, key, object[key]);
    });
  }
}
ObjectSeq.prototype[IS_ORDERED_SYMBOL] = true;

class CollectionSeq extends IndexedSeq {
  constructor(collection) {
    this._collection = collection;
    this.size = collection.length || collection.size;
  }

  __iterateUncached(fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    const collection = this._collection;
    const iterator = getIterator(collection);
    let iterations = 0;
    if (isIterator(iterator)) {
      let step;
      while (!(step = iterator.next()).done) {
        if (fn(step.value, iterations++, this) === false) {
          break;
        }
      }
    }
    return iterations;
  }

  __iteratorUncached(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    const collection = this._collection;
    const iterator = getIterator(collection);
    if (!isIterator(iterator)) {
      return new Iterator(iteratorDone);
    }
    let iterations = 0;
    return new Iterator(() => {
      const step = iterator.next();
      return step.done ? step : iteratorValue(type, iterations++, step.value);
    });
  }
}

// # pragma Helper functions

let EMPTY_SEQ;

function emptySequence() {
  return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
}

export function keyedSeqFromValue(value) {
  const seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq.fromEntrySeq();
  }
  if (typeof value === 'object') {
    return new ObjectSeq(value);
  }
  throw new TypeError(
    'Expected Array or collection object of [k, v] entries, or keyed object: ' +
      value
  );
}

export function indexedSeqFromValue(value) {
  const seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq;
  }
  throw new TypeError(
    'Expected Array or collection object of values: ' + value
  );
}

function seqFromValue(value) {
  const seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return isEntriesIterable(value)
      ? seq.fromEntrySeq()
      : isKeysIterable(value)
      ? seq.toSetSeq()
      : seq;
  }
  if (typeof value === 'object') {
    return new ObjectSeq(value);
  }
  throw new TypeError(
    'Expected Array or collection object of values, or keyed object: ' + value
  );
}

function maybeIndexedSeqFromValue(value) {
  return isArrayLike(value)
    ? new ArraySeq(value)
    : hasIterator(value)
    ? new CollectionSeq(value)
    : undefined;
}
