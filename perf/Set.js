/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

describe('Set', () => {
  describe('maps with changes', () => {
    const array2 = [];
    for (let i = 0; i < 2; i++) {
      array2[i] = i;
    }
    const set2 = Immutable.Set(array2);
    it('of 2', () => {
      set2.map((value) => value + 1);
    });

    const array8 = [];
    for (let i = 0; i < 8; i++) {
      array8[i] = i;
    }
    const set8 = Immutable.Set(array8);
    it('of 8', () => {
      set8.map((value) => value + 1);
    });

    const array32 = [];
    for (let i = 0; i < 32; i++) {
      array32[i] = i;
    }
    const set32 = Immutable.Set(array32);
    it('of 32', () => {
      set32.map((value) => value + 1);
    });

    const array1024 = [];
    for (let i = 0; i < 1024; i++) {
      array1024[i] = i;
    }
    const set1024 = Immutable.Set(array1024);
    it('of 1024', () => {
      set1024.map((value) => value + 1);
    });
  });

  describe('maps without changes', () => {
    const array2 = [];
    for (let i = 0; i < 2; i++) {
      array2[i] = i;
    }
    const set2 = Immutable.Set(array2);
    it('of 2', () => {
      set2.map((value) => value);
    });

    const array8 = [];
    for (let i = 0; i < 8; i++) {
      array8[i] = i;
    }
    const set8 = Immutable.Set(array8);
    it('of 8', () => {
      set8.map((value) => value);
    });

    const array32 = [];
    for (let i = 0; i < 32; i++) {
      array32[i] = i;
    }
    const set32 = Immutable.Set(array32);
    it('of 32', () => {
      set32.map((value) => value);
    });

    const array1024 = [];
    for (let i = 0; i < 1024; i++) {
      array1024[i] = i;
    }
    const set1024 = Immutable.Set(array1024);
    it('of 1024', () => {
      set1024.map((value) => value);
    });
  });
});
