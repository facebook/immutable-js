import { List, Map, OrderedMap, OrderedSet, Set, Stack } from 'immutable';

class A {
  x: number;
  constructor() {
    this.x = 1;
  }
}
class B extends A {
  y: string;
  constructor() {
    super();
    this.y = 'B';
  }
}
class C {
  z: string;
  constructor() {
    this.z = 'C';
  }
}

// List covariance
let listOfB: List<B> = List<B>();
let listOfA: List<A> = listOfB;

// $ExpectType List<B>
listOfA = List([new B()]);

// $ExpectError
let listOfC: List<C> = listOfB;

// Map covariance
declare var mapOfB: Map<string, B>;
let mapOfA: Map<string, A> = mapOfB;

// $ExpectType ObjectLikeMap<{ b: B; }>
mapOfA = Map({ b: new B() });

// $ExpectError
let mapOfC: Map<string, C> = mapOfB;

// Set covariance
declare var setOfB: Set<B>;
let setOfA: Set<A> = setOfB;

// $ExpectType Set<B>
setOfA = Set([new B()]);
// $ExpectError
let setOfC: Set<C> = setOfB;

// Stack covariance
declare var stackOfB: Stack<B>;
let stackOfA: Stack<A> = stackOfB;
// $ExpectType Stack<B>
stackOfA = Stack([new B()]);
// $ExpectError
let stackOfC: Stack<C> = stackOfB;

// OrderedMap covariance
declare var orderedMapOfB: OrderedMap<string, B>;
let orderedMapOfA: OrderedMap<string, A> = orderedMapOfB;
// $ExpectType OrderedMap<string, B>
orderedMapOfA = OrderedMap({ b: new B() });
// $ExpectError
let orderedMapOfC: OrderedMap<string, C> = orderedMapOfB;

// OrderedSet covariance
declare var orderedSetOfB: OrderedSet<B>;
let orderedSetOfA: OrderedSet<A> = orderedSetOfB;
// $ExpectType OrderedSet<B>
orderedSetOfA = OrderedSet([new B()]);
// $ExpectError
let orderedSetOfC: OrderedSet<C> = orderedSetOfB;
