import { runInNewContext } from 'vm';

import {
  isCollection,
  fromJS,
  Set as ImmutableSet,
  Map as ImmutableMap,
} from 'immutable';

describe('fromJS', () => {
  it('is iterable outside of a vm', () => {
    expect(isCollection(fromJS({}))).toBe(true);
  });

  it('is iterable inside of a vm', () => {
    runInNewContext(
      `
    expect(isCollection(fromJS({}))).toBe(true);
  `,
      {
        expect,
        isCollection,
        fromJS,
      },
      {}
    );
  });

  it('convert Set to Immutable.Set', () => {
    const immutableSet = fromJS(new Set([1, 2, 3]));
    expect(ImmutableSet.isSet(immutableSet)).toBe(true);

    expect(immutableSet.has(1)).toBe(true);
    expect(immutableSet.has(2)).toBe(true);
    expect(immutableSet.has(3)).toBe(true);
    expect(immutableSet.has(4)).toBe(false);
  });

  it('convert Map to Immutable.Map', () => {
    const m = new Map();
    m.set('a', 'A');
    m.set('b', 'B');
    m.set('c', 'C');
    const immutableMap = fromJS(m);
    expect(ImmutableMap.isMap(immutableMap)).toBe(true);

    expect(m.size).toBe(3);
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });
});
