import { Seq } from './Seq';
import { isCollection } from './predicates/isCollection';
import { isKeyed } from './predicates/isKeyed';
import isDataStructure from './utils/isDataStructure';
import isPlainObject from './utils/isPlainObj';

export function toJS(value) {
  const circularStack =
    typeof WeakSet === 'undefined' ? new Set() : new WeakSet(); // WeakSet is not available in IE11.

  return toJSWithCircularCheck(circularStack, value);
}

function checkCircular(circularStack, value) {
  if (!isPlainObject(value)) {
    return;
  }

  if (circularStack.has(value)) {
    throw new TypeError('Cannot convert circular structure to JS');
  }

  circularStack.add(value);
}

function toJSWithCircularCheck(circularStack, value) {
  checkCircular(circularStack, value);

  if (!value || typeof value !== 'object') {
    return value;
  }
  if (!isCollection(value)) {
    if (!isDataStructure(value)) {
      return value;
    }
    value = Seq(value);
  }
  if (isKeyed(value)) {
    const result = {};
    value.__iterate((v, k) => {
      result[k] = toJSWithCircularCheck(circularStack, v);
    });
    return result;
  }
  const result = [];
  value.__iterate(v => {
    result.push(toJSWithCircularCheck(circularStack, v));
  });
  circularStack.delete(value);

  return result;
}
