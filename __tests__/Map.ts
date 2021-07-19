import { is, List, Map, Range, Record, Seq } from 'immutable';

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

describe('Map', () => {
  it('converts from object', () => {
    const m = Map({ a: 'A', b: 'B', c: 'C' });
    expect(m.size).toBe(3);
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });

  it('constructor provides initial values', () => {
    const m = Map({ a: 'A', b: 'B', c: 'C' });
    expect(m.size).toBe(3);
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });

  it('constructor provides initial values as array of entries', () => {
    const m = Map([
      ['a', 'A'],
      ['b', 'B'],
      ['c', 'C'],
    ]);
    expect(m.size).toBe(3);
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });

  it('constructor provides initial values as sequence', () => {
    const s = Seq({ a: 'A', b: 'B', c: 'C' });
    const m = Map(s);
    expect(m.size).toBe(3);
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });

  it('constructor provides initial values as list of lists', () => {
    const l = List([List(['a', 'A']), List(['b', 'B']), List(['c', 'C'])]);
    const m = Map(l);
    expect(m.size).toBe(3);
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });

  it('constructor is identity when provided map', () => {
    const m1 = Map({ a: 'A', b: 'B', c: 'C' });
    const m2 = Map(m1);
    expect(m2).toBe(m1);
  });

  it('does not accept a scalar', () => {
    expect(() => {
      // TODO: should expect error
      Map(3);
    }).toThrow(
      'Expected Array or collection object of [k, v] entries, or keyed object: 3'
    );
  });

  it('does not accept strings (collection, but scalar)', () => {
    expect(() => {
      // @ts-expect-error
      Map('abc');
    }).toThrow();
  });

  it('does not accept non-entries array', () => {
    expect(() => {
      // @ts-expect-error
      Map([1, 2, 3]);
    }).toThrow('Expected [K, V] tuple: 1');
  });

  it('accepts non-collection array-like objects as keyed collections', () => {
    const m = Map({ length: 3, 1: 'one' });
    expect(m.get('length')).toBe(3);
    // @ts-expect-error -- type error, but the API is tolerante
    expect(m.get('1')).toBe('one');
    expect(m.toJS()).toEqual({ length: 3, 1: 'one' });
  });

  it('accepts flattened pairs via of()', () => {
    const m: Map<any, any> = Map.of(1, 'a', 2, 'b', 3, 'c');
    expect(m.size).toBe(3);
    expect(m.get(1)).toBe('a');
    expect(m.get(2)).toBe('b');
    expect(m.get(3)).toBe('c');
  });

  it('does not accept mismatched flattened pairs via of()', () => {
    expect(() => {
      Map.of(1, 2, 3);
    }).toThrow('Missing value for key: 3');
  });

  it('converts back to JS object', () => {
    const m = Map({ a: 'A', b: 'B', c: 'C' });
    expect(m.toObject()).toEqual({ a: 'A', b: 'B', c: 'C' });
  });

  it('iterates values', () => {
    const m = Map({ a: 'A', b: 'B', c: 'C' });
    const iterator = jest.fn();
    m.forEach(iterator);
    expect(iterator.mock.calls).toEqual([
      ['A', 'a', m],
      ['B', 'b', m],
      ['C', 'c', m],
    ]);
  });

  it('merges two maps', () => {
    const m1 = Map({ a: 'A', b: 'B', c: 'C' });
    const m2 = Map({ wow: 'OO', d: 'DD', b: 'BB' });
    expect(m2.toObject()).toEqual({ wow: 'OO', d: 'DD', b: 'BB' });
    const m3 = m1.merge(m2);
    expect(m3.toObject()).toEqual({
      a: 'A',
      b: 'BB',
      c: 'C',
      wow: 'OO',
      d: 'DD',
    });
  });

  it('concatenates two maps (alias for merge)', () => {
    const m1 = Map({ a: 'A', b: 'B', c: 'C' });
    const m2 = Map({ wow: 'OO', d: 'DD', b: 'BB' });
    expect(m2.toObject()).toEqual({ wow: 'OO', d: 'DD', b: 'BB' });
    const m3 = m1.concat(m2);
    expect(m3.toObject()).toEqual({
      a: 'A',
      b: 'BB',
      c: 'C',
      wow: 'OO',
      d: 'DD',
    });
  });

  it('accepts null as a key', () => {
    const m1 = Map<any, any>();
    const m2 = m1.set(null, 'null');
    const m3 = m2.remove(null);
    expect(m1.size).toBe(0);
    expect(m2.size).toBe(1);
    expect(m3.size).toBe(0);
    expect(m2.get(null)).toBe('null');
  });

  it('is persistent to sets', () => {
    const m1 = Map();
    const m2 = m1.set('a', 'Aardvark');
    const m3 = m2.set('b', 'Baboon');
    const m4 = m3.set('c', 'Canary');
    const m5 = m4.set('b', 'Bonobo');
    expect(m1.size).toBe(0);
    expect(m2.size).toBe(1);
    expect(m3.size).toBe(2);
    expect(m4.size).toBe(3);
    expect(m5.size).toBe(3);
    expect(m3.get('b')).toBe('Baboon');
    expect(m5.get('b')).toBe('Bonobo');
  });

  it('is persistent to deletes', () => {
    const m1 = Map();
    const m2 = m1.set('a', 'Aardvark');
    const m3 = m2.set('b', 'Baboon');
    const m4 = m3.set('c', 'Canary');
    const m5 = m4.remove('b');
    expect(m1.size).toBe(0);
    expect(m2.size).toBe(1);
    expect(m3.size).toBe(2);
    expect(m4.size).toBe(3);
    expect(m5.size).toBe(2);
    expect(m3.has('b')).toBe(true);
    expect(m3.get('b')).toBe('Baboon');
    expect(m5.has('b')).toBe(false);
    expect(m5.get('b')).toBe(undefined);
    expect(m5.get('c')).toBe('Canary');
  });

  check.it('deletes down to empty map', [gen.posInt], size => {
    let m = Range(0, size).toMap();
    expect(m.size).toBe(size);
    for (let ii = size - 1; ii >= 0; ii--) {
      m = m.remove(ii);
      expect(m.size).toBe(ii);
    }
    expect(m).toBe(Map());
  });

  it('can map many items', () => {
    let m = Map();
    for (let ii = 0; ii < 2000; ii++) {
      m = m.set('thing:' + ii, ii);
    }
    expect(m.size).toBe(2000);
    expect(m.get('thing:1234')).toBe(1234);
  });

  it('can use weird keys', () => {
    const symbol = Symbol('A');
    const m: Map<any, any> = Map()
      .set(NaN, 1)
      .set(Infinity, 2)
      .set(symbol, 'A')
      .set(-Infinity, 3);

    expect(m.get(symbol)).toBe('A');
    expect(m.get(NaN)).toBe(1);
    expect(m.get(Infinity)).toBe(2);
    expect(m.get(-Infinity)).toBe(3);
  });

  it('can map items known to hash collide', () => {
    // make a big map, so it hashmaps
    let m: Map<any, any> = Range(0, 32).toMap();
    m = m.set('AAA', 'letters').set(64545, 'numbers');
    expect(m.size).toBe(34);
    expect(m.get('AAA')).toEqual('letters');
    expect(m.get(64545)).toEqual('numbers');
  });

  it('can progressively add items known to collide', () => {
    // make a big map, so it hashmaps
    let map: Map<any, any> = Range(0, 32).toMap();
    map = map.set('@', '@');
    map = map.set(64, 64);
    map = map.set(96, 96);
    expect(map.size).toBe(35);
    expect(map.get('@')).toBe('@');
    expect(map.get(64)).toBe(64);
    expect(map.get(96)).toBe(96);
  });

  it('maps values', () => {
    const m = Map({ a: 'a', b: 'b', c: 'c' });
    const r = m.map(value => value.toUpperCase());
    expect(r.toObject()).toEqual({ a: 'A', b: 'B', c: 'C' });
  });

  it('maps keys', () => {
    const m = Map({ a: 'a', b: 'b', c: 'c' });
    const r = m.mapKeys(key => key.toUpperCase());
    expect(r.toObject()).toEqual({ A: 'a', B: 'b', C: 'c' });
  });

  it('maps no-ops return the same reference', () => {
    const m = Map({ a: 'a', b: 'b', c: 'c' });
    const r = m.map(value => value);
    expect(r).toBe(m);
  });

  it('provides unmodified original collection as 3rd iter argument', () => {
    const m = Map({ a: 1, b: 1 });
    const r = m.map((value, key, iter) => {
      expect(iter).toEqual(m);
      return 2 * (iter.get(key) as number);
    });
    expect(r.toObject()).toEqual({ a: 2, b: 2 });
  });

  it('filters values', () => {
    const m = Map({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
    const r = m.filter(value => value % 2 === 1);
    expect(r.toObject()).toEqual({ a: 1, c: 3, e: 5 });
  });

  it('filterNots values', () => {
    const m = Map({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
    const r = m.filterNot(value => value % 2 === 1);
    expect(r.toObject()).toEqual({ b: 2, d: 4, f: 6 });
  });

  it('derives keys', () => {
    const v = Map({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
    expect(v.keySeq().toArray()).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('flips keys and values', () => {
    const v = Map({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
    expect(v.flip().toObject()).toEqual({
      1: 'a',
      2: 'b',
      3: 'c',
      4: 'd',
      5: 'e',
      6: 'f',
    });
  });

  it('can convert to a list', () => {
    const m = Map({ a: 1, b: 2, c: 3 });
    const v = m.toList();
    const k = m.keySeq().toList();
    expect(v.size).toBe(3);
    expect(k.size).toBe(3);
    // Note: Map has undefined ordering, this List may not be the same
    // order as the order you set into the Map.
    expect(v.get(1)).toBe(2);
    expect(k.get(1)).toBe('b');
  });

  check.it(
    'works like an object',
    { maxSize: 50 },
    [gen.object(gen.JSONPrimitive)],
    obj => {
      let map = Map(obj);
      Object.keys(obj).forEach(key => {
        expect(map.get(key)).toBe(obj[key]);
        expect(map.has(key)).toBe(true);
      });
      Object.keys(obj).forEach(key => {
        expect(map.get(key)).toBe(obj[key]);
        expect(map.has(key)).toBe(true);
        map = map.remove(key);
        expect(map.get(key)).toBe(undefined);
        expect(map.has(key)).toBe(false);
      });
    }
  );

  check.it('sets', { maxSize: 5000 }, [gen.posInt], len => {
    let map = Map();
    for (let ii = 0; ii < len; ii++) {
      expect(map.size).toBe(ii);
      map = map.set('' + ii, ii);
    }
    expect(map.size).toBe(len);
    expect(is(map.toSet(), Range(0, len).toSet())).toBe(true);
  });

  check.it('has and get', { maxSize: 5000 }, [gen.posInt], len => {
    const map = Range(0, len)
      .toKeyedSeq()
      .mapKeys(x => '' + x)
      .toMap();
    for (let ii = 0; ii < len; ii++) {
      expect(map.get('' + ii)).toBe(ii);
      expect(map.has('' + ii)).toBe(true);
    }
  });

  check.it('deletes', { maxSize: 5000 }, [gen.posInt], len => {
    let map = Range(0, len).toMap();
    for (let ii = 0; ii < len; ii++) {
      expect(map.size).toBe(len - ii);
      map = map.remove(ii);
    }
    expect(map.size).toBe(0);
    expect(map.toObject()).toEqual({});
  });

  check.it('deletes from transient', { maxSize: 5000 }, [gen.posInt], len => {
    const map = Range(0, len).toMap().asMutable();
    for (let ii = 0; ii < len; ii++) {
      expect(map.size).toBe(len - ii);
      map.remove(ii);
    }
    expect(map.size).toBe(0);
    expect(map.toObject()).toEqual({});
  });

  check.it('iterates through all entries', [gen.posInt], len => {
    const v = Range(0, len).toMap();
    const a = v.toArray();
    const iter = v.entries();
    for (let ii = 0; ii < len; ii++) {
      delete a[iter.next().value[0]];
    }
    expect(a).toEqual(new Array(len));
  });

  it('allows chained mutations', () => {
    const m1 = Map();
    const m2 = m1.set('a', 1);
    const m3 = m2.withMutations(m => m.set('b', 2).set('c', 3));
    const m4 = m3.set('d', 4);

    expect(m1.toObject()).toEqual({});
    expect(m2.toObject()).toEqual({ a: 1 });
    expect(m3.toObject()).toEqual({ a: 1, b: 2, c: 3 });
    expect(m4.toObject()).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });

  it('chained mutations does not result in new empty map instance', () => {
    const v1 = Map({ x: 1 });
    const v2 = v1.withMutations(v => v.set('y', 2).delete('x').delete('y'));
    expect(v2).toBe(Map());
  });

  it('expresses value equality with unordered sequences', () => {
    const m1 = Map({ A: 1, B: 2, C: 3 });
    const m2 = Map({ C: 3, B: 2, A: 1 });
    expect(is(m1, m2)).toBe(true);
  });

  it('deletes all the provided keys', () => {
    const NOT_SET = undefined;
    const m1 = Map({ A: 1, B: 2, C: 3 });
    const m2 = m1.deleteAll(['A', 'B']);
    expect(m2.get('A')).toBe(NOT_SET);
    expect(m2.get('B')).toBe(NOT_SET);
    expect(m2.get('C')).toBe(3);
    expect(m2.size).toBe(1);
  });

  it('remains unchanged when no keys are provided', () => {
    const m1 = Map({ A: 1, B: 2, C: 3 });
    const m2 = m1.deleteAll([]);
    expect(m1).toBe(m2);
  });

  it('uses toString on keys and values', () => {
    class A extends Record({ x: null as number | null }) {
      toString() {
        return this.x;
      }
    }

    const r = new A({ x: 2 });
    const map = Map([[r, r]]);
    expect(map.toString()).toEqual('Map { 2: 2 }');
  });

  it('supports Symbols as tuple keys', () => {
    const a = Symbol('a');
    const b = Symbol('b');
    const c = Symbol('c');
    const m = Map([
      [a, 'a'],
      [b, 'b'],
      [c, 'c'],
    ]);
    expect(m.size).toBe(3);
    expect(m.get(a)).toBe('a');
    expect(m.get(b)).toBe('b');
    expect(m.get(c)).toBe('c');
  });

  it('Symbol keys are unique', () => {
    const a = Symbol('FooBar');
    const b = Symbol('FooBar');
    const m = Map([
      [a, 'FizBuz'],
      [b, 'FooBar'],
    ]);
    expect(m.size).toBe(2);
    expect(m.get(a)).toBe('FizBuz');
    expect(m.get(b)).toBe('FooBar');
  });

  it('mergeDeep with tuple Symbol keys', () => {
    const a = Symbol('a');
    const b = Symbol('b');
    const c = Symbol('c');
    const d = Symbol('d');
    const e = Symbol('e');
    const f = Symbol('f');
    const g = Symbol('g');

    // Note the use of nested Map constructors, Map() does not do a
    // deep conversion!
    const m1 = Map([
      [
        a,
        Map([
          [
            b,
            Map([
              [c, 1],
              [d, 2],
            ]),
          ],
        ]),
      ],
    ]);
    const m2 = Map([
      [
        a,
        Map([
          [
            b,
            Map([
              [c, 10],
              [e, 20],
              [f, 30],
              [g, 40],
            ]),
          ],
        ]),
      ],
    ]);
    const merged = m1.mergeDeep(m2);

    expect(merged).toEqual(
      Map([
        [
          a,
          Map([
            [
              b,
              Map([
                [c, 10],
                [d, 2],
                [e, 20],
                [f, 30],
                [g, 40],
              ]),
            ],
          ]),
        ],
      ])
    );
  });
});
