import { KeyedSeq, IndexedSeq } from './Seq';
import { Set as ImmutableSet } from './Set';
import { isKeyed } from './predicates/isKeyed';
import isPlainObj from './utils/isPlainObj';

export function fromJS(value, converter) {
  return fromJSWith(
    [],
    converter || defaultConverter,
    value,
    '',
    converter && converter.length > 2 ? [] : undefined,
    { '': value }
  );
}

function getToSeq(value) {
  if (Array.isArray(value)) {
    return IndexedSeq;
  }

  if (value instanceof Set) {
    return ImmutableSet;
  }

  if (value instanceof Map || isPlainObj(value)) {
    return KeyedSeq;
  }

  return null;
}

function fromJSWith(stack, converter, value, key, keyPath, parentValue) {
  const toSeq = getToSeq(value);

  if (toSeq) {
    if (~stack.indexOf(value)) {
      throw new TypeError('Cannot convert circular structure to Immutable');
    }
    stack.push(value);
    keyPath && key !== '' && keyPath.push(key);
    const converted = converter.call(
      parentValue,
      key,
      toSeq(value).map((v, k) =>
        fromJSWith(stack, converter, v, k, keyPath, value)
      ),
      keyPath && keyPath.slice()
    );
    stack.pop();
    keyPath && keyPath.pop();
    return converted;
  }
  return value;
}

function defaultConverter(k, v) {
  if (ImmutableSet.isSet(v)) {
    return v;
  }

  return isKeyed(v) ? v.toMap() : v.toList();
}
