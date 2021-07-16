import {
  DELETE,
  SHIFT,
  SIZE,
  MASK,
  OwnerID,
  MakeRef,
  SetRef,
  wrapIndex,
  wholeSlice,
  resolveBegin,
  resolveEnd,
} from './TrieUtils';
import { IS_LIST_SYMBOL, isList } from './predicates/isList';
import { IndexedCollection } from './Collection';
import { hasIterator, Iterator, iteratorValue, iteratorDone } from './Iterator';
import { setIn } from './methods/setIn';
import { deleteIn } from './methods/deleteIn';
import { update } from './methods/update';
import { updateIn } from './methods/updateIn';
import { mergeIn } from './methods/mergeIn';
import { mergeDeepIn } from './methods/mergeDeepIn';
import { withMutations } from './methods/withMutations';
import { asMutable } from './methods/asMutable';
import { asImmutable } from './methods/asImmutable';
import { wasAltered } from './methods/wasAltered';
import assertNotInfinite from './utils/assertNotInfinite';

export class List extends IndexedCollection {
  // @pragma Construction

  constructor(value) {
    const empty = emptyList();
    if (value === null || value === undefined) {
      return empty;
    }
    if (isList(value)) {
      return value;
    }
    const iter = IndexedCollection(value);
    const size = iter.size;
    if (size === 0) {
      return empty;
    }
    assertNotInfinite(size);
    if (size > 0 && size < SIZE) {
      return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));
    }
    return empty.withMutations(list => {
      list.setSize(size);
      iter.forEach((v, i) => list.set(i, v));
    });
  }

  static of(/*...values*/) {
    return this(arguments);
  }

  toString() {
    return this.__toString('List [', ']');
  }

  // @pragma Access

  get(index, notSetValue) {
    index = wrapIndex(this, index);
    if (index >= 0 && index < this.size) {
      index += this._origin;
      const node = listNodeFor(this, index);
      return node && node.array[index & MASK];
    }
    return notSetValue;
  }

  // @pragma Modification

  set(index, value) {
    return updateList(this, index, value);
  }

  remove(index) {
    return !this.has(index)
      ? this
      : index === 0
      ? this.shift()
      : index === this.size - 1
      ? this.pop()
      : this.splice(index, 1);
  }

  insert(index, value) {
    return this.splice(index, 0, value);
  }

  clear() {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = this._origin = this._capacity = 0;
      this._level = SHIFT;
      this._root = this._tail = this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return emptyList();
  }

  push(/*...values*/) {
    const values = arguments;
    const oldSize = this.size;
    return this.withMutations(list => {
      setListBounds(list, 0, oldSize + values.length);
      for (let ii = 0; ii < values.length; ii++) {
        list.set(oldSize + ii, values[ii]);
      }
    });
  }

  pop() {
    return setListBounds(this, 0, -1);
  }

  unshift(/*...values*/) {
    const values = arguments;
    return this.withMutations(list => {
      setListBounds(list, -values.length);
      for (let ii = 0; ii < values.length; ii++) {
        list.set(ii, values[ii]);
      }
    });
  }

  shift() {
    return setListBounds(this, 1);
  }

  // @pragma Composition

  concat(/*...collections*/) {
    const seqs = [];
    for (let i = 0; i < arguments.length; i++) {
      const argument = arguments[i];
      const seq = IndexedCollection(
        typeof argument !== 'string' && hasIterator(argument)
          ? argument
          : [argument]
      );
      if (seq.size !== 0) {
        seqs.push(seq);
      }
    }
    if (seqs.length === 0) {
      return this;
    }
    if (this.size === 0 && !this.__ownerID && seqs.length === 1) {
      return this.constructor(seqs[0]);
    }
    return this.withMutations(list => {
      seqs.forEach(seq => seq.forEach(value => list.push(value)));
    });
  }

  setSize(size) {
    return setListBounds(this, 0, size);
  }

  map(mapper, context) {
    return this.withMutations(list => {
      for (let i = 0; i < this.size; i++) {
        list.set(i, mapper.call(context, list.get(i), i, this));
      }
    });
  }

  // @pragma Iteration

  slice(begin, end) {
    const size = this.size;
    if (wholeSlice(begin, end, size)) {
      return this;
    }
    return setListBounds(
      this,
      resolveBegin(begin, size),
      resolveEnd(end, size)
    );
  }

  __iterator(type, reverse) {
    let index = reverse ? this.size : 0;
    const values = iterateList(this, reverse);
    return new Iterator(() => {
      const value = values();
      return value === DONE
        ? iteratorDone()
        : iteratorValue(type, reverse ? --index : index++, value);
    });
  }

  __iterate(fn, reverse) {
    let index = reverse ? this.size : 0;
    const values = iterateList(this, reverse);
    let value;
    while ((value = values()) !== DONE) {
      if (fn(value, reverse ? --index : index++, this) === false) {
        break;
      }
    }
    return index;
  }

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      if (this.size === 0) {
        return emptyList();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeList(
      this._origin,
      this._capacity,
      this._level,
      this._root,
      this._tail,
      ownerID,
      this.__hash
    );
  }
}

List.isList = isList;

export const ListPrototype = List.prototype;
ListPrototype[IS_LIST_SYMBOL] = true;
ListPrototype[DELETE] = ListPrototype.remove;
ListPrototype.merge = ListPrototype.concat;
ListPrototype.setIn = setIn;
ListPrototype.deleteIn = ListPrototype.removeIn = deleteIn;
ListPrototype.update = update;
ListPrototype.updateIn = updateIn;
ListPrototype.mergeIn = mergeIn;
ListPrototype.mergeDeepIn = mergeDeepIn;
ListPrototype.withMutations = withMutations;
ListPrototype.wasAltered = wasAltered;
ListPrototype.asImmutable = asImmutable;
ListPrototype['@@transducer/init'] = ListPrototype.asMutable = asMutable;
ListPrototype['@@transducer/step'] = function (result, arr) {
  return result.push(arr);
};
ListPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};

class VNode {
  constructor(array, ownerID) {
    this.array = array;
    this.ownerID = ownerID;
  }

  removeNodes(ownerID, level, index, isRemoveBefore = true) {
    if (index === (level ? 1 << level : 0) || this.array.length === 0) {
      return this;
    }
    const levelIndex = (index >>> level) & MASK,
      removeFirst = levelIndex === 0,
      removeLast = levelIndex === this.array.length - 1;

    if (levelIndex >= this.array.length) {
      return isRemoveBefore ? new VNode([], ownerID) : this;
    }

    let newChild;
    if (level > 0) {
      const oldChild = this.array[levelIndex];
      newChild =
        oldChild &&
        oldChild.removeNodes(ownerID, level - SHIFT, index, isRemoveBefore);
      if (
        newChild === oldChild &&
        ((isRemoveBefore && removeFirst) || (!isRemoveBefore && removeLast))
      ) {
        return this;
      }
    }

    if (
      ((isRemoveBefore && removeFirst) || (!isRemoveBefore && removeLast)) &&
      !newChild
    ) {
      return this;
    }

    const editable = editableNode(this, ownerID);
    if (isRemoveBefore) {
      for (let ii = 0; ii < levelIndex; ii++) {
        editable.array[ii] = void 0;
      }
    } else {
      editable.array.splice(levelIndex + 1);
    }

    if (newChild) {
      editable.array[levelIndex] = newChild;
    }

    return editable;
  }

  removeBefore(ownerID, level, index) {
    return this.removeNodes(ownerID, level, index);
  }

  removeAfter(ownerID, level, index) {
    return this.removeNodes(ownerID, level, index, false);
  }
}

const DONE = {};

function iterateList(list, reverse) {
  const left = list._origin;
  const right = list._capacity;
  const tailPos = getTailOffset(right);
  const tail = list._tail;

  return iterateNodeOrLeaf(list._root, list._level, 0);

  function iterateNodeOrLeaf(node, level, offset) {
    return level === 0
      ? iterateLeaf(node, offset)
      : iterateNode(node, level, offset);
  }

  function iterateLeaf(node, offset) {
    const array = offset === tailPos ? tail && tail.array : node && node.array;
    let from = offset > left ? 0 : left - offset;
    let to = right - offset;
    if (to > SIZE) {
      to = SIZE;
    }
    return () => {
      if (from === to) {
        return DONE;
      }
      const idx = reverse ? --to : from++;
      return array && array[idx];
    };
  }

  function iterateNode(node, level, offset) {
    let values;
    const array = node && node.array;
    let from = offset > left ? 0 : (left - offset) >> level;
    let to = ((right - offset) >> level) + 1;
    if (to > SIZE) {
      to = SIZE;
    }
    return () => {
      while (true) {
        if (values) {
          const value = values();
          if (value !== DONE) {
            return value;
          }
          values = null;
        }
        if (from === to) {
          return DONE;
        }
        const idx = reverse ? --to : from++;
        values = iterateNodeOrLeaf(
          array && array[idx],
          level - SHIFT,
          offset + (idx << level)
        );
      }
    };
  }
}

function makeList(origin, capacity, level, root, tail, ownerID, hash) {
  const list = Object.create(ListPrototype);
  list.size = capacity - origin;
  list._origin = origin;
  list._capacity = capacity;
  list._level = level;
  list._root = root;
  list._tail = tail;
  list.__ownerID = ownerID;
  list.__hash = hash;
  list.__altered = false;
  return list;
}

let EMPTY_LIST;
export function emptyList() {
  return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
}

function updateList(list, index, value) {
  index = wrapIndex(list, index);

  if (index !== index) {
    return list;
  }

  if (index >= list.size || index < 0) {
    return list.withMutations(list => {
      index < 0
        ? setListBounds(list, index).set(0, value)
        : setListBounds(list, 0, index + 1).set(index, value);
    });
  }

  index += list._origin;

  let newTail = list._tail;
  let newRoot = list._root;
  const didAlter = MakeRef();
  if (index >= getTailOffset(list._capacity)) {
    newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
  } else {
    newRoot = updateVNode(
      newRoot,
      list.__ownerID,
      list._level,
      index,
      value,
      didAlter
    );
  }

  if (!didAlter.value) {
    return list;
  }

  if (list.__ownerID) {
    list._root = newRoot;
    list._tail = newTail;
    list.__hash = undefined;
    list.__altered = true;
    return list;
  }
  return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
}

function updateVNode(node, ownerID, level, index, value, didAlter) {
  const idx = (index >>> level) & MASK;
  const nodeHas = node && idx < node.array.length;
  if (!nodeHas && value === undefined) {
    return node;
  }

  let newNode;

  if (level > 0) {
    const lowerNode = node && node.array[idx];
    const newLowerNode = updateVNode(
      lowerNode,
      ownerID,
      level - SHIFT,
      index,
      value,
      didAlter
    );
    if (newLowerNode === lowerNode) {
      return node;
    }
    newNode = editableVNode(node, ownerID);
    newNode.array[idx] = newLowerNode;
    return newNode;
  }

  if (nodeHas && node.array[idx] === value) {
    return node;
  }

  if (didAlter) {
    SetRef(didAlter);
  }

  newNode = editableVNode(node, ownerID);
  if (value === undefined && idx === newNode.array.length - 1) {
    newNode.array.pop();
  } else {
    newNode.array[idx] = value;
  }
  return newNode;
}

function editableVNode(node, ownerID) {
  if (ownerID && node && ownerID === node.ownerID) {
    return node;
  }
  return new VNode(node ? node.array.slice() : [], ownerID);
}

function listNodeFor(list, rawIndex) {
  if (rawIndex >= getTailOffset(list._capacity)) {
    return list._tail;
  }
  if (rawIndex < 1 << (list._level + SHIFT)) {
    let node = list._root;
    let level = list._level;
    while (node && level > 0) {
      node = node.array[(rawIndex >>> level) & MASK];
      level -= SHIFT;
    }
    return node;
  }
}

function setListBounds(list, begin, end) {
  // Sanitize begin & end using this shorthand for ToInt32(argument)
  // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
  if (begin !== undefined) {
    begin |= 0;
  }
  if (end !== undefined) {
    end |= 0;
  }
  const owner = list.__ownerID || new OwnerID();
  let oldOrigin = list._origin;
  let oldCapacity = list._capacity;
  let newOrigin = oldOrigin + begin;
  let newCapacity =
    end === undefined
      ? oldCapacity
      : end < 0
      ? oldCapacity + end
      : oldOrigin + end;
  if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
    return list;
  }

  // If it's going to end after it starts, it's empty.
  if (newOrigin >= newCapacity) {
    return list.clear();
  }

  let newLevel = list._level;
  let newRoot = list._root;

  // New origin might need creating a higher root.
  let offsetShift = 0;
  while (newOrigin + offsetShift < 0) {
    newRoot = new VNode(
      newRoot && newRoot.array.length ? [undefined, newRoot] : [],
      owner
    );
    newLevel += SHIFT;
    offsetShift += 1 << newLevel;
  }
  if (offsetShift) {
    newOrigin += offsetShift;
    oldOrigin += offsetShift;
    newCapacity += offsetShift;
    oldCapacity += offsetShift;
  }

  const oldTailOffset = getTailOffset(oldCapacity);
  const newTailOffset = getTailOffset(newCapacity);

  // New size might need creating a higher root.
  while (newTailOffset >= 1 << (newLevel + SHIFT)) {
    newRoot = new VNode(
      newRoot && newRoot.array.length ? [newRoot] : [],
      owner
    );
    newLevel += SHIFT;
  }

  // Locate or create the new tail.
  const oldTail = list._tail;
  let newTail =
    newTailOffset < oldTailOffset
      ? listNodeFor(list, newCapacity - 1)
      : newTailOffset > oldTailOffset
      ? new VNode([], owner)
      : oldTail;

  // Merge Tail into tree.
  if (
    oldTail &&
    newTailOffset > oldTailOffset &&
    newOrigin < oldCapacity &&
    oldTail.array.length
  ) {
    newRoot = editableVNode(newRoot, owner);
    let node = newRoot;
    for (let level = newLevel; level > SHIFT; level -= SHIFT) {
      const idx = (oldTailOffset >>> level) & MASK;
      node = node.array[idx] = editableVNode(node.array[idx], owner);
    }
    node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
  }

  // If the size has been reduced, there's a chance the tail needs to be trimmed.
  if (newCapacity < oldCapacity) {
    newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
  }

  // If the new origin is within the tail, then we do not need a root.
  if (newOrigin >= newTailOffset) {
    newOrigin -= newTailOffset;
    newCapacity -= newTailOffset;
    newLevel = SHIFT;
    newRoot = null;
    newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);

    // Otherwise, if the root has been trimmed, garbage collect.
  } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
    offsetShift = 0;

    // Identify the new top root node of the subtree of the old root.
    while (newRoot) {
      const beginIndex = (newOrigin >>> newLevel) & MASK;
      if ((beginIndex !== newTailOffset >>> newLevel) & MASK) {
        break;
      }
      if (beginIndex) {
        offsetShift += (1 << newLevel) * beginIndex;
      }
      newLevel -= SHIFT;
      newRoot = newRoot.array[beginIndex];
    }

    // Trim the new sides of the new root.
    if (newRoot && newOrigin > oldOrigin) {
      newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
    }
    if (newRoot && newTailOffset < oldTailOffset) {
      newRoot = newRoot.removeAfter(
        owner,
        newLevel,
        newTailOffset - offsetShift
      );
    }
    if (offsetShift) {
      newOrigin -= offsetShift;
      newCapacity -= offsetShift;
    }
  }

  if (list.__ownerID) {
    list.size = newCapacity - newOrigin;
    list._origin = newOrigin;
    list._capacity = newCapacity;
    list._level = newLevel;
    list._root = newRoot;
    list._tail = newTail;
    list.__hash = undefined;
    list.__altered = true;
    return list;
  }
  return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
}

function getTailOffset(size) {
  return size < SIZE ? 0 : ((size - 1) >>> SHIFT) << SHIFT;
}
