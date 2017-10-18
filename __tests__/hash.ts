/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { hash } from '../';

describe('hash', () => {
  it('stable hash of well known values', () => {
    expect(hash(true)).toBe(1);
    expect(hash(false)).toBe(0);
    expect(hash(0)).toBe(0);
    expect(hash(null)).toBe(0);
    expect(hash(undefined)).toBe(0);
    expect(hash('a')).toBe(97);
    expect(hash('immutable-js')).toBe(510203252);
    expect(hash(123)).toBe(123);
  });

  it('generates different hashes for decimal values', () => {
    expect(hash(123.456)).toBe(884763256);
    expect(hash(123.4567)).toBe(887769707);
  });

  const genValue = gen.oneOf([gen.string, gen.int]);

  check.it('generates unsigned 31-bit integers', [genValue], value => {
    const hashVal = hash(value);
    expect(hashVal % 1).toBe(0);
    expect(hashVal).toBeLessThan(Math.pow(2, 31));
  });
});
