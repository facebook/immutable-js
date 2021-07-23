import { isCollection, isIndexed, isKeyed, Seq } from 'immutable';

describe('Seq', () => {
  it('returns undefined if empty and first is called without default argument', () => {
    expect(Seq().first()).toBeUndefined();
  });

  it('returns undefined if empty and last is called without default argument', () => {
    expect(Seq().last()).toBeUndefined();
  });

  it('returns default value if empty and first is called with default argument', () => {
    expect(Seq().first({})).toEqual({});
  });

  it('returns default value if empty and last is called with default argument', () => {
    expect(Seq().last({})).toEqual({});
  });

  it('can be empty', () => {
    expect(Seq().size).toBe(0);
  });

  it('accepts an array', () => {
    expect(Seq([1, 2, 3]).size).toBe(3);
  });

  it('accepts an object', () => {
    expect(Seq({ a: 1, b: 2, c: 3 }).size).toBe(3);
  });

  it('accepts an object with a next property', () => {
    expect(Seq({ a: 1, b: 2, next: _ => _ }).size).toBe(3);
  });

  it('accepts a collection string', () => {
    expect(Seq('foo').size).toBe(3);
  });

  it('accepts arbitrary objects', () => {
    function Foo() {
      this.bar = 'bar';
      this.baz = 'baz';
    }
    expect(Seq(new Foo()).size).toBe(2);
  });

  it('accepts another sequence', () => {
    const seq = Seq([1, 2, 3]);
    expect(Seq(seq).size).toBe(3);
  });

  it('accepts a string', () => {
    const seq = Seq('abc');
    expect(seq.size).toBe(3);
    expect(seq.get(1)).toBe('b');
    expect(seq.join('')).toBe('abc');
  });

  it('accepts an array-like', () => {
    const seq = Seq({ length: 2, 0: 'a', 1: 'b' });
    expect(isIndexed(seq)).toBe(true);
    expect(seq.size).toBe(2);
    expect(seq.get(1)).toBe('b');

    const map = Seq({ length: 1, foo: 'bar' });
    expect(isIndexed(map)).toBe(false);
    expect(map.size).toBe(2);
    expect(map.get('foo')).toBe('bar');

    const empty = Seq({ length: 0 });
    expect(isIndexed(empty)).toBe(true);
    expect(empty.size).toEqual(0);
  });

  it('accepts a JS (global) Map', () => {
    const seq = Seq(
      new global.Map([
        ['a', 'A'],
        ['b', 'B'],
        ['c', 'C'],
      ])
    );
    expect(isKeyed(seq)).toBe(true);
    expect(seq.size).toBe(3);
  });

  it('accepts a JS (global) Set', () => {
    const seq = Seq(new global.Set(['a', 'b', 'c']));
    expect(isIndexed(seq)).toBe(false);
    expect(isKeyed(seq)).toBe(false);
    expect(seq.size).toBe(3);
  });

  it('does not accept a scalar', () => {
    expect(() => {
      // @ts-expect-error
      Seq(3);
    }).toThrow(
      'Expected Array or collection object of values, or keyed object: 3'
    );
  });

  it('detects sequences', () => {
    const seq = Seq([1, 2, 3]);
    expect(Seq.isSeq(seq)).toBe(true);
    expect(isCollection(seq)).toBe(true);
  });

  it('Does not infinite loop when sliced with NaN', () => {
    const list = Seq([1, 2, 3, 4, 5]);
    expect(list.slice(0, NaN).toJS()).toEqual([]);
    expect(list.slice(NaN).toJS()).toEqual([1, 2, 3, 4, 5]);
  });

  it('Does not infinite loop when spliced with negative number #559', () => {
    const dog = Seq(['d', 'o', 'g']);
    const dg = dog.filter(c => c !== 'o');
    const dig = dg.splice(-1, 0, 'i');
    expect(dig.toJS()).toEqual(['d', 'i', 'g']);
  });

  it('Does not infinite loop when an undefined number is passed to take', () => {
    const list = Seq([1, 2, 3, 4, 5]);
    expect(list.take(NaN).toJS()).toEqual([]);
  });

  it('Converts deeply toJS after converting to entries', () => {
    const list = Seq([Seq([1, 2]), Seq({ a: 'z' })]);
    expect(list.entrySeq().toJS()).toEqual([
      [0, [1, 2]],
      [1, { a: 'z' }],
    ]);

    const map = Seq({ x: Seq([1, 2]), y: Seq({ a: 'z' }) });
    expect(map.entrySeq().toJS()).toEqual([
      ['x', [1, 2]],
      ['y', { a: 'z' }],
    ]);
  });
});
