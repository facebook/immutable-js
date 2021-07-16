export function withMutations(fn) {
  const mutable = this.asMutable();
  fn(mutable);
  return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
}

export function withRecordMutations(fn) {
  const mutable = this.asMutable();
  Object.preventExtensions(mutable);
  fn(mutable);
  return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
}
