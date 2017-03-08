/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { Seq } from './Seq'
import { Collection } from './Collection'
import { OrderedMap } from './OrderedMap'
import { List } from './List'
import { Map } from './Map'
import { Stack } from './Stack'
import { OrderedSet } from './OrderedSet'
import { Set } from './Set'
import { Record } from './Record'
import { Range } from './Range'
import { Repeat } from './Repeat'
import { is } from './is'
import { fromJS } from './fromJS'
import { isImmutable, isIterable, isKeyed, isIndexed, isAssociative, isOrdered, isValueObject } from './Predicates'
import { Iterable } from './IterableImpl'
import { hash } from './Hash'

export default {
  Iterable: Iterable,

  Seq: Seq,
  Collection: Collection,
  Map: Map,
  OrderedMap: OrderedMap,
  List: List,
  Stack: Stack,
  Set: Set,
  OrderedSet: OrderedSet,

  Record: Record,
  Range: Range,
  Repeat: Repeat,

  is: is,
  fromJS: fromJS,
  hash: hash,

  isImmutable: isImmutable,
  isIterable: isIterable,
  isKeyed: isKeyed,
  isIndexed: isIndexed,
  isAssociative: isAssociative,
  isOrdered: isOrdered,
  isValueObject: isValueObject,
};

export {
  Iterable,

  Seq,
  Collection,
  Map,
  OrderedMap,
  List,
  Stack,
  Set,
  OrderedSet,

  Record,
  Range,
  Repeat,

  is,
  fromJS,
  hash,

  isImmutable,
  isIterable,
  isKeyed,
  isIndexed,
  isAssociative,
  isOrdered,
  isValueObject,
}
