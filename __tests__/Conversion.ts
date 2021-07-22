import {
  fromJS,
  is,
  List,
  Map,
  OrderedMap,
  Record as ImmutableRecord,
} from 'immutable';

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

// Symbols
declare function Symbol(name: string): any;

describe('Conversion', () => {
  // Note: order of keys based on Map's hashing order
  const js = {
    deepList: [
      {
        position: 'first',
      },
      {
        position: 'second',
      },
      {
        position: 'third',
      },
    ],
    deepMap: {
      a: 'A',
      b: 'B',
    },
    emptyMap: Object.create(null),
    point: { x: 10, y: 20 },
    string: 'Hello',
    list: [1, 2, 3],
  };

  const Point = ImmutableRecord({ x: 0, y: 0 }, 'Point');

  const immutableData = Map({
    deepList: List.of(
      Map({
        position: 'first',
      }),
      Map({
        position: 'second',
      }),
      Map({
        position: 'third',
      })
    ),
    deepMap: Map({
      a: 'A',
      b: 'B',
    }),
    emptyMap: Map(),
    point: Map({ x: 10, y: 20 }),
    string: 'Hello',
    list: List.of(1, 2, 3),
  });

  const immutableOrderedData = OrderedMap({
    deepList: List.of(
      OrderedMap({
        position: 'first',
      }),
      OrderedMap({
        position: 'second',
      }),
      OrderedMap({
        position: 'third',
      })
    ),
    deepMap: OrderedMap({
      a: 'A',
      b: 'B',
    }),
    emptyMap: OrderedMap(),
    point: new Point({ x: 10, y: 20 }),
    string: 'Hello',
    list: List.of(1, 2, 3),
  });

  const immutableOrderedDataString =
    'OrderedMap { ' +
    '"deepList": List [ ' +
    'OrderedMap { ' +
    '"position": "first"' +
    ' }, ' +
    'OrderedMap { ' +
    '"position": "second"' +
    ' }, ' +
    'OrderedMap { ' +
    '"position": "third"' +
    ' }' +
    ' ], ' +
    '"deepMap": OrderedMap { ' +
    '"a": "A", ' +
    '"b": "B"' +
    ' }, ' +
    '"emptyMap": OrderedMap {}, ' +
    '"point": Point { x: 10, y: 20 }, ' +
    '"string": "Hello", ' +
    '"list": List [ 1, 2, 3 ]' +
    ' }';

  const nonStringKeyMap = OrderedMap().set(1, true).set(false, 'foo');
  const nonStringKeyMapString = 'OrderedMap { 1: true, false: "foo" }';

  it('Converts deep JS to deep immutable sequences', () => {
    expect(fromJS(js)).toEqual(immutableData);
  });

  it('Throws when provided circular reference', () => {
    const o = { a: { b: { c: null as any } } };
    o.a.b.c = o;
    expect(() => fromJS(o)).toThrow(
      'Cannot convert circular structure to Immutable'
    );
  });

  it('Throws when calling toJS with a circular reference', () => {
    const obj: Record<string, any> = {
      foo: 1,
      bar: null,
    };
    // Create circular reference
    obj.bar = obj;

    const simplerTest = List().push(obj);

    expect(() => simplerTest.toJS()).toThrow(
      'Cannot convert circular structure to JS'
    );
  });

  it('does not throw when using empty objects', () => {
    expect(() => fromJS([{}, {}]).toJS()).not.toThrow();
    expect(() => fromJS([['', '']]).toJS()).not.toThrow();
    expect(() => fromJS([[null, null]]).toJS()).not.toThrow();
  });

  it('Converts deep JSON with custom conversion', () => {
    const seq = fromJS(js, function (key, sequence) {
      if (key === 'point') {
        return new Point(sequence as any);
      }
      return Array.isArray(this[key])
        ? sequence.toList()
        : sequence.toOrderedMap();
    });
    expect(seq).toEqual(immutableOrderedData);
    expect(seq.toString()).toEqual(immutableOrderedDataString);
  });

  it('Converts deep JSON with custom conversion including keypath if requested', () => {
    const paths: Array<any> = [];
    const seq1 = fromJS(js, function (key, sequence, keypath) {
      expect(arguments.length).toBe(3);
      paths.push(keypath);
      return Array.isArray(this[key])
        ? sequence.toList()
        : sequence.toOrderedMap();
    });
    expect(paths).toEqual([
      [],
      ['deepList'],
      ['deepList', 0],
      ['deepList', 1],
      ['deepList', 2],
      ['deepMap'],
      ['emptyMap'],
      ['point'],
      ['list'],
    ]);
    const seq2 = fromJS(js, function (key, sequence) {
      expect(arguments[2]).toBe(undefined);
    });
  });

  it('Prints keys as JS values', () => {
    expect(nonStringKeyMap.toString()).toEqual(nonStringKeyMapString);
  });

  it('Converts deep sequences to JS', () => {
    const js2 = immutableData.toJS();
    expect(is(js2, js)).toBe(false); // raw JS is not immutable.
    expect(js2).toEqual(js); // but should be deep equal.
  });

  it('Converts shallowly to JS', () => {
    const js2 = immutableData.toJSON();
    expect(js2).not.toEqual(js);
    expect(js2.deepList).toBe(immutableData.get('deepList'));
  });

  it('JSON.stringify() works equivalently on immutable sequences', () => {
    expect(JSON.stringify(js)).toBe(JSON.stringify(immutableData));
  });

  it('JSON.stringify() respects toJSON methods on values', () => {
    const Model = ImmutableRecord({});
    Model.prototype.toJSON = function () {
      return 'model';
    };
    expect(Map({ a: new Model() }).toJS()).toEqual({ a: {} });
    expect(JSON.stringify(Map({ a: new Model() }))).toEqual('{"a":"model"}');
  });

  it('is conservative with array-likes, only accepting true Arrays.', () => {
    expect(fromJS({ 1: 2, length: 3 })).toEqual(
      Map().set('1', 2).set('length', 3)
    );
    expect(fromJS('string')).toEqual('string');
  });

  check.it('toJS isomorphic value', { maxSize: 30 }, [gen.JSONValue], v => {
    const imm = fromJS(v);
    expect(imm && imm.toJS ? imm.toJS() : imm).toEqual(v);
  });

  it('Explicitly convert values to string using String constructor', () => {
    expect(() => fromJS({ foo: Symbol('bar') }) + '').not.toThrow();
    expect(() => Map().set('foo', Symbol('bar')) + '').not.toThrow();
    expect(() => Map().set(Symbol('bar'), 'foo') + '').not.toThrow();
  });

  it('Converts an immutable value of an entry correctly', () => {
    const arr = [{ key: 'a' }];
    const result = fromJS(arr).entrySeq().toJS();
    expect(result).toEqual([[0, { key: 'a' }]]);
  });
});
