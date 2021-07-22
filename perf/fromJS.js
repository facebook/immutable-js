/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

describe('fromJS', () => {
  const list = Immutable.List();
  it('List', () => {
    Immutable.fromJS(list);
  });

  const object = { foo: 'bar' };
  it('object', () => {
    Immutable.fromJS(object);
  });

  describe('array of Lists', () => {
    const array2 = [];
    for (let i = 0; i < 2; i++) {
      array2[i] = Immutable.List();
    }
    it('of 2', () => {
      Immutable.fromJS(array2);
    });

    const array8 = [];
    for (let i = 0; i < 8; i++) {
      array8[i] = Immutable.List();
    }
    it('of 8', () => {
      Immutable.fromJS(array8);
    });

    const array32 = [];
    for (let i = 0; i < 32; i++) {
      array32[i] = Immutable.List();
    }
    it('of 32', () => {
      Immutable.fromJS(array32);
    });

    const array1024 = [];
    for (let i = 0; i < 1024; i++) {
      array1024[i] = i;
    }
    it('of 1024', () => {
      Immutable.fromJS(array1024);
    });
  });
});
