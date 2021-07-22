/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

describe('hash', () => {
  const aString = 'test';
  it('a string', () => {
    Immutable.hash(aString);
  });

  const aNumber = 5;
  it('a number', () => {
    Immutable.fromJS(aNumber);
  });

  const aNull = null;
  it('null', () => {
    Immutable.hash(aNull);
  });

  const anUndefined = undefined;
  it('undefined', () => {
    Immutable.hash(anUndefined);
  });

  const aBoolean = true;
  it('a boolean', () => {
    Immutable.hash(aBoolean);
  });

  const anObject = {};
  it('an object', () => {
    Immutable.hash(anObject);
  });

  const anArray = [];
  it('an array', () => {
    Immutable.hash(anArray);
  });

  const aFunction = () => null;
  it('a function', () => {
    Immutable.hash(aFunction);
  });
});
