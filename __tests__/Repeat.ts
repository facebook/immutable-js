///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import Immutable = require('../dist/Immutable');
import Repeat = Immutable.Repeat;

describe('Repeat', () => {

  it('fixed repeat', () => {
    var v = Repeat('wtf', 3);
    expect(v.length).toBe(3);
    expect(v.first()).toBe('wtf');
    expect(v.last()).toBe('wtf');
    expect(v.init().toArray()).toEqual(['wtf','wtf']);
    expect(v.tail().toArray()).toEqual(['wtf','wtf']);
    expect(v.toArray()).toEqual(['wtf','wtf','wtf']);
    expect(v.join()).toEqual('wtf,wtf,wtf');
  });

});
