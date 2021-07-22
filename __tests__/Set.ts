import {
  fromJS,
  is,
  List,
  Map,
  OrderedSet,
  Seq,
  Set as ImmutableSet,
} from 'immutable';

describe('Set', () => {
  it('accepts array of values', () => {
    const s = ImmutableSet([1, 2, 3]);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('accepts array-like of values', () => {
    const s = ImmutableSet<number | undefined>({ length: 3, 2: 3 });
    expect(s.size).toBe(2);
    expect(s.has(undefined)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(2)).toBe(false);
  });

  it('accepts Set', () => {
    const s = ImmutableSet(new Set([1, 2, 3]));
    expect(ImmutableSet.isSet(s)).toBe(true);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('accepts string, an array-like collection', () => {
    const s = ImmutableSet('abc');
    expect(s.size).toBe(3);
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(true);
    expect(s.has('c')).toBe(true);
    expect(s.has('abc')).toBe(false);
  });

  it('accepts sequence of values', () => {
    const seq = Seq([1, 2, 3]);
    const s = ImmutableSet(seq);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('accepts a keyed Seq as a set of entries', () => {
    const seq = Seq({ a: null, b: null, c: null }).flip();
    const s = ImmutableSet(seq);
    expect(s.toArray()).toEqual([
      [null, 'a'],
      [null, 'b'],
      [null, 'c'],
    ]);
    // Explicitly getting the values sequence
    const s2 = ImmutableSet(seq.valueSeq());
    expect(s2.toArray()).toEqual(['a', 'b', 'c']);
    // toSet() does this for you.
    const v3 = seq.toSet();
    expect(v3.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts object keys', () => {
    const s = ImmutableSet.fromKeys({ a: null, b: null, c: null });
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(true);
    expect(s.has('c')).toBe(true);
    expect(s.has('d')).toBe(false);
  });

  it('accepts sequence keys', () => {
    const seq = Seq({ a: null, b: null, c: null });
    const s = ImmutableSet.fromKeys(seq);
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(true);
    expect(s.has('c')).toBe(true);
    expect(s.has('d')).toBe(false);
  });

  it('accepts explicit values', () => {
    const s = ImmutableSet([1, 2, 3]);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('converts back to JS array', () => {
    const s = ImmutableSet([1, 2, 3]);
    expect(s.toArray()).toEqual([1, 2, 3]);
  });

  it('converts back to JS object', () => {
    const s = ImmutableSet.of('a', 'b', 'c');
    expect(s.toObject()).toEqual({ a: 'a', b: 'b', c: 'c' });
  });

  it('maps no-ops return the same reference', () => {
    const s = ImmutableSet([1, 2, 3]);
    const r = s.map(value => value);
    expect(r).toBe(s);
  });

  it('maps should produce new set if values changed', () => {
    const s = ImmutableSet([1, 2, 3]);
    expect(s.has(4)).toBe(false);
    expect(s.size).toBe(3);

    const m = s.map(v => v + 1);
    expect(m.has(1)).toBe(false);
    expect(m.has(2)).toBe(true);
    expect(m.has(3)).toBe(true);
    expect(m.has(4)).toBe(true);
    expect(m.size).toBe(3);
  });

  it('unions an unknown collection of Sets', () => {
    const abc = ImmutableSet(['a', 'b', 'c']);
    const cat = ImmutableSet(['c', 'a', 't']);
    expect(ImmutableSet.union([abc, cat]).toArray()).toEqual([
      'c',
      'a',
      't',
      'b',
    ]);
    expect(ImmutableSet.union([abc])).toBe(abc);
    expect(ImmutableSet.union([])).toBe(ImmutableSet());
  });

  it('intersects an unknown collection of Sets', () => {
    const abc = ImmutableSet(['a', 'b', 'c']);
    const cat = ImmutableSet(['c', 'a', 't']);
    expect(ImmutableSet.intersect([abc, cat]).toArray()).toEqual(['c', 'a']);
    expect(ImmutableSet.intersect([abc])).toBe(abc);
    expect(ImmutableSet.intersect([])).toBe(ImmutableSet());
  });

  it('iterates values', () => {
    const s = ImmutableSet([1, 2, 3]);
    const iterator = jest.fn();
    s.forEach(iterator);
    expect(iterator.mock.calls).toEqual([
      [1, 1, s],
      [2, 2, s],
      [3, 3, s],
    ]);
  });

  it('unions two sets', () => {
    const s1 = ImmutableSet.of('a', 'b', 'c');
    const s2 = ImmutableSet.of('d', 'b', 'wow');
    const s3 = s1.union(s2);
    expect(s3.toArray()).toEqual(['a', 'b', 'c', 'd', 'wow']);
  });

  it('returns self when union results in no-op', () => {
    const s1 = ImmutableSet.of('a', 'b', 'c');
    const s2 = ImmutableSet.of('c', 'a');
    const s3 = s1.union(s2);
    expect(s3).toBe(s1);
  });

  it('returns arg when union results in no-op', () => {
    const s1 = ImmutableSet();
    const s2 = ImmutableSet.of('a', 'b', 'c');
    const s3 = s1.union(s2);
    expect(s3).toBe(s2);
  });

  it('unions a set and another collection and returns a set', () => {
    const s1 = ImmutableSet([1, 2, 3]);
    const emptySet = ImmutableSet();
    const l = List([1, 2, 3]);
    const s2 = s1.union(l);
    const s3 = emptySet.union(l);
    const o = OrderedSet([1, 2, 3]);
    const s4 = s1.union(o);
    const s5 = emptySet.union(o);
    expect(ImmutableSet.isSet(s2)).toBe(true);
    expect(ImmutableSet.isSet(s3)).toBe(true);
    expect(ImmutableSet.isSet(s4) && !OrderedSet.isOrderedSet(s4)).toBe(true);
    expect(ImmutableSet.isSet(s5) && !OrderedSet.isOrderedSet(s5)).toBe(true);
  });

  it('is persistent to adds', () => {
    const s1 = ImmutableSet();
    const s2 = s1.add('a');
    const s3 = s2.add('b');
    const s4 = s3.add('c');
    const s5 = s4.add('b');
    expect(s1.size).toBe(0);
    expect(s2.size).toBe(1);
    expect(s3.size).toBe(2);
    expect(s4.size).toBe(3);
    expect(s5.size).toBe(3);
  });

  it('is persistent to deletes', () => {
    const s1 = ImmutableSet();
    const s2 = s1.add('a');
    const s3 = s2.add('b');
    const s4 = s3.add('c');
    const s5 = s4.remove('b');
    expect(s1.size).toBe(0);
    expect(s2.size).toBe(1);
    expect(s3.size).toBe(2);
    expect(s4.size).toBe(3);
    expect(s5.size).toBe(2);
    expect(s3.has('b')).toBe(true);
    expect(s5.has('b')).toBe(false);
  });

  it('deletes down to empty set', () => {
    const s = ImmutableSet.of('A').remove('A');
    expect(s).toBe(ImmutableSet());
  });

  it('unions multiple sets', () => {
    const s = ImmutableSet.of('A', 'B', 'C').union(
      ImmutableSet.of('C', 'D', 'E'),
      ImmutableSet.of('D', 'B', 'F')
    );
    expect(s).toEqual(ImmutableSet.of('A', 'B', 'C', 'D', 'E', 'F'));
  });

  it('intersects multiple sets', () => {
    const s = ImmutableSet.of('A', 'B', 'C').intersect(
      ImmutableSet.of('B', 'C', 'D'),
      ImmutableSet.of('A', 'C', 'E')
    );
    expect(s).toEqual(ImmutableSet.of('C'));
  });

  it('diffs multiple sets', () => {
    const s = ImmutableSet.of('A', 'B', 'C').subtract(
      ImmutableSet.of('C', 'D', 'E'),
      ImmutableSet.of('D', 'B', 'F')
    );
    expect(s).toEqual(ImmutableSet.of('A'));
  });

  it('expresses value equality with set sequences', () => {
    const s1 = ImmutableSet.of('A', 'B', 'C');
    expect(s1.equals(null)).toBe(false);

    const s2 = ImmutableSet.of('C', 'B', 'A');
    expect(s1 === s2).toBe(false);
    expect(is(s1, s2)).toBe(true);
    expect(s1.equals(s2)).toBe(true);

    // Map and Set are not the same (keyed vs unkeyed)
    const v1 = Map({ A: 'A', C: 'C', B: 'B' });
    expect(is(s1, v1)).toBe(false);
  });

  it('can use union in a withMutation', () => {
    const js = ImmutableSet()
      .withMutations(set => {
        set.union(['a']);
        set.add('b');
      })
      .toJS();
    expect(js).toEqual(['a', 'b']);
  });

  it('can determine if an array is a subset', () => {
    const s = ImmutableSet.of('A', 'B', 'C');
    expect(s.isSuperset(['B', 'C'])).toBe(true);
    expect(s.isSuperset(['B', 'C', 'D'])).toBe(false);
  });

  describe('accepts Symbol as entry #579', () => {
    it('operates on small number of symbols, preserving set uniqueness', () => {
      const a = Symbol();
      const b = Symbol();
      const c = Symbol();

      const symbolSet = ImmutableSet([a, b, c, a, b, c, a, b, c, a, b, c]);
      expect(symbolSet.size).toBe(3);
      expect(symbolSet.has(b)).toBe(true);
      expect(symbolSet.get(c)).toEqual(c);
    });

    it('operates on a large number of symbols, maintaining obj uniqueness', () => {
      const manySymbols = [
        Symbol('a'),
        Symbol('b'),
        Symbol('c'),
        Symbol('a'),
        Symbol('b'),
        Symbol('c'),
        Symbol('a'),
        Symbol('b'),
        Symbol('c'),
        Symbol('a'),
        Symbol('b'),
        Symbol('c'),
      ];

      const symbolSet = ImmutableSet(manySymbols);
      expect(symbolSet.size).toBe(12);
      expect(symbolSet.has(manySymbols[10])).toBe(true);
      expect(symbolSet.get(manySymbols[10])).toEqual(manySymbols[10]);
    });
  });

  it('can use intersect after add or union in a withMutation', () => {
    const set = ImmutableSet(['a', 'd']).withMutations(s => {
      s.add('b');
      s.union(['c']);
      s.intersect(['b', 'c', 'd']);
    });
    expect(set.toArray()).toEqual(['c', 'd', 'b']);
  });

  it('can count entries that satisfy a predicate', () => {
    const set = ImmutableSet([1, 2, 3, 4, 5]);
    expect(set.size).toEqual(5);
    expect(set.count()).toEqual(5);
    expect(set.count(x => x % 2 === 0)).toEqual(2);
    expect(set.count(() => true)).toEqual(5);
  });

  describe('"size" should correctly reflect the number of elements in a Set', () => {
    describe('deduplicating custom classes that invoke fromJS() as part of equality check', () => {
      class Entity {
        entityId: string;
        entityKey: string;
        constructor(entityId: string, entityKey: string) {
          this.entityId = entityId;
          this.entityKey = entityKey;
        }
        asImmutable() {
          return fromJS({
            entityId: this.entityId,
            entityKey: this.entityKey,
          });
        }
        valueOf() {
          return this.asImmutable().toString();
        }
      }
      it('with mutations', () => {
        const testSet = ImmutableSet().withMutations(mutableSet => {
          mutableSet.add(new Entity('hello', 'world'));
          mutableSet.add(new Entity('testing', 'immutable'));
          mutableSet.add(new Entity('hello', 'world'));
        });
        expect(testSet.size).toEqual(2);
      });
      it('without mutations', () => {
        const testSet0 = ImmutableSet();
        const testSet1 = testSet0.add(new Entity('hello', 'world'));
        const testSet2 = testSet1.add(new Entity('testing', 'immutable'));
        const testSet3 = testSet2.add(new Entity('hello', 'world'));
        expect(testSet0.size).toEqual(0);
        expect(testSet1.size).toEqual(1);
        expect(testSet2.size).toEqual(2);
        expect(testSet3.size).toEqual(2);
      });
    });
  });
});
