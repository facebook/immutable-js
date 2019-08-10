/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Seq } from '../../';

{ // #constructor

  // $ExpectType Indexed<number>
  Seq([ 1, 2, 3 ]);

  // $ExpectType Indexed<[number, string]>
  Seq<[number, string]>([[1, 'number']]);
}

{ // #size

  // $ExpectType number | undefined
  Seq().size;

  // $ExpectError
  Seq().size = 10;
}
