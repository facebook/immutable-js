describe('toJS', () => {
  const array32 = [];
  for (let ii = 0; ii < 32; ii++) {
    array32[ii] = ii;
  }
  const list = Immutable.List(array32);

  it('List of 32', () => {
    list.toJS(list);
  });

  const obj32 = {};
  for (let ii = 0; ii < 32; ii++) {
    obj32[ii] = ii;
  }
  const map = Immutable.Map(obj32);

  it('Map of 32', () => {
    map.toJS(map);
  });
});
