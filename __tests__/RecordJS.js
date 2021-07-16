// eslint-disable-next-line import/no-unresolved -- immutable is resolve by jest resolver
import { Record } from 'immutable';

describe('Record', () => {
  it('defines a record factory', () => {
    const MyType = Record({ a: 1, b: 2, c: 3 });

    const t = MyType();
    const t2 = t.set('a', 10);

    expect(t.a).toBe(1);
    expect(t2.a).toBe(10);
  });

  it('can have mutations apply', () => {
    const MyType = Record({ a: 1, b: 2, c: 3 });

    const t = MyType();

    expect(() => {
      t.a = 10;
    }).toThrow();

    const t2 = t.withMutations(mt => {
      mt.a = 10;
      mt.b = 20;
      mt.c = 30;
    });

    expect(t.a).toBe(1);
    expect(t2.a).toBe(10);
  });

  it('mutations only add defined values', () => {
    const Rec = new Record({ a: 1 });
    const rec = new Rec();

    const r2 = rec.withMutations(m => {
      m.a = 2;
      m.invalid = '?';
    });

    expect(r2.a).toBe(2);
    expect(r2.invalid).toBeUndefined();
  });

  it('can be subclassed', () => {
    class Alphabet extends Record({ a: 1, b: 2, c: 3 }) {
      soup() {
        return this.a + this.b + this.c;
      }
    }

    // Note: `new` is only used because of `class`
    const t = new Alphabet();
    const t2 = t.set('b', 200);

    expect(t instanceof Record);
    expect(t instanceof Alphabet);
    expect(t.soup()).toBe(6);
    expect(t2.soup()).toBe(204);

    // Uses class name as descriptive name
    expect(Record.getDescriptiveName(t)).toBe('Alphabet');

    // Uses display name over class name
    class NotADisplayName extends Record({ x: 1 }, 'DisplayName') {}
    const t3 = new NotADisplayName();
    expect(Record.getDescriptiveName(t3)).toBe('DisplayName');
  });

  it('can be cleared', () => {
    const MyType = Record({ a: 1, b: 2, c: 3 });
    let t = MyType({ c: 'cats' });

    expect(t.c).toBe('cats');
    t = t.clear();
    expect(t.c).toBe(3);

    const MyType2 = Record({ d: 4, e: 5, f: 6 });
    let t2 = MyType2({ d: 'dogs' });

    expect(t2.d).toBe('dogs');
    t2 = t2.clear();
    expect(t2.d).toBe(4);
  });
});
