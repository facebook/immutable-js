import Link from 'next/link';

import type { TypeDefinition, TypeDefs } from './TypeDefs';
import { collectMemberGroups } from './collectMemberGroups';

export type SidebarLinks = Array<{ label: string; url: string }>;

// Only used statically
export function getSidebarLinks(defs: TypeDefs): SidebarLinks {
  return Object.values(defs.types).map(({ label, url }) => ({ label, url }));
}

function Links({
  links,
  focus,
}: {
  links: SidebarLinks;
  focus?: TypeDefinition;
}) {
  return (
    <div>
      <h2>Immutable.js</h2>
      {links.map(link => (
        <div
          className={`SideBar__Link ${
            focus?.label === link.label ? 'SideBar__Link--active' : ''
          }`}
          key={link.url}
        >
          <Link href={link.url}>{link.label}</Link>
        </div>
      ))}
    </div>
  );
}

function Focus({
  focus,
  showInGroups,
  showInherited,
}: {
  focus?: TypeDefinition;
  showInGroups?: boolean;
  showInherited?: boolean;
}) {
  if (!focus || (!focus.interface && !focus.functions)) {
    return null;
  }

  return (
    <>
      <h2>{focus.label}</h2>
      <div className="members">
        {focus.call && (
          <section>
            <h4 className="groupTitle">Construction</h4>
            <div>
              <Link href={focus.call.url}>{focus.call.label}</Link>
            </div>
          </section>
        )}

        {focus.functions && (
          <section>
            <h4 className="groupTitle">Static Methods</h4>
            {Object.values(focus.functions).map(fn => (
              <div key={fn.id}>
                <Link href={fn.url}>{fn.label}</Link>
              </div>
            ))}
          </section>
        )}

        <section>
          {collectMemberGroups(
            focus.interface,
            showInGroups,
            showInherited
          ).flatMap(([title, groupMembers]) =>
            groupMembers.length === 0
              ? null
              : [
                  <h4 key={title || 'Members'} className="groupTitle">
                    {title || 'Members'}
                  </h4>,
                  groupMembers.map(member => (
                    <div key={member.id}>
                      <Link href={member.url}>{member.label}</Link>
                    </div>
                  )),
                ]
          )}
        </section>
      </div>
    </>
  );
}

export function SideBar({
  links,
  focus,
  toggleShowInherited,
  toggleShowInGroups,
  showInherited,
  showInGroups,
}: {
  links: SidebarLinks;
  focus?: TypeDefinition;
  toggleShowInherited?: () => void;
  toggleShowInGroups?: () => void;
  showInherited?: boolean;
  showInGroups?: boolean;
}) {
  return (
    <div className="sideBar">
      {toggleShowInherited && toggleShowInGroups && (
        <div className="toolBar">
          <div onClick={toggleShowInGroups} onKeyPress={toggleShowInGroups}>
            <span className={showInGroups ? 'selected' : undefined}>
              Grouped
            </span>
            {' • '}
            <span className={!showInGroups ? 'selected' : undefined}>
              Alphabetized
            </span>
          </div>
          <div onClick={toggleShowInherited} onKeyPress={toggleShowInherited}>
            <span className={showInherited ? 'selected' : undefined}>
              Inherited
            </span>
            {' • '}
            <span className={!showInherited ? 'selected' : undefined}>
              Defined
            </span>
          </div>
        </div>
      )}
      <div className="scrollContent">
        <Focus
          focus={focus}
          showInherited={showInherited}
          showInGroups={showInGroups}
        />

        <Links links={links} focus={focus} />
      </div>
    </div>
  );
}
