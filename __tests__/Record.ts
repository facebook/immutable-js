///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import Immutable = require('immutable');
import Record = Immutable.Record;

describe('Record', () => {

  it('defines a constructor', () => {
    var MyType = Record({a:1, b:2, c:3});

    var t1 = new MyType();
    var t2 = t1.set('a', 10);
    var t3 = t2.clear();

    expect(t1 instanceof Record);
    expect(t1 instanceof MyType);

    expect(t3 instanceof Record);
    expect(t3 instanceof MyType);

    expect(t1.get('a')).toBe(1);
    expect(t2.get('a')).toBe(10);

    expect(t1.length).toBe(3);
    expect(t2.length).toBe(3);
  })

  it('only allows setting what it knows about', () => {
    var MyType = Record({a:1, b:2, c:3});

    var t1 = new MyType({a: 10, b:20});
    expect(() => {
      t1.set('d', 4);
    }).toThrow('Cannot set unknown key "d" on Record');
  });

  it('has a fixed length and falls back to default values', () => {
    var MyType = Record({a:1, b:2, c:3});

    var t1 = new MyType({a: 10, b:20});
    var t3 = t1.remove('a');
    var t4 = t3.clear();

    expect(t1.length).toBe(3);
    expect(t3.length).toBe(3);
    expect(t4.length).toBe(3);

    expect(t1.get('a')).toBe(10);
    expect(t3.get('a')).toBe(1);
    expect(t4.get('b')).toBe(2);
  })

  it('converts sequences to records', () => {
    var MyType = Record({a:1, b:2, c:3});
    var seq = Immutable.Sequence({a: 10, b:20});
    var t = new MyType(seq);
    expect(t.toObject()).toEqual({a:10, b:20, c:3})
  })

  it('can pick keys', () => {
    var MyType = Record({a:1, b:2, c:3});
    var t1 = new MyType({a:11, b:22, c:33});
    var t2 = t1.pick(['a', 'b']);
    var t3 = t2.pick(['a']);

    expect(t1.toObject()).toEqual({a:11, b:22, c:33});
    expect(t2.toObject()).toEqual({a:11, b:22, c:3});
    expect(t3.toObject()).toEqual({a:11, b:2, c:3});
  });

  it('can omit keys', () => {
    var MyType = Record({a:1, b:2, c:3});
    var t1 = new MyType({a:11, b:22, c:33});
    var t2 = t1.omit(['a']);
    var t3 = t2.omit(['b', 'c']);

    expect(t1.toObject()).toEqual({a:11, b:22, c:33});
    expect(t2.toObject()).toEqual({a:1, b:22, c:33});
    expect(t3.toObject()).toEqual({a:1, b:2, c:3});
  });

  it('allows for functional construction', () => {
    var MyType = Record({a:1, b:2, c:3});
    var seq = Immutable.Sequence({a: 10, b:20});
    var t = MyType(seq);
    expect(t.toObject()).toEqual({a:10, b:20, c:3})
  })

});
