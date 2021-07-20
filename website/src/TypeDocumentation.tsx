import { Fragment, useReducer } from 'react';

import { InterfaceDef, CallSigDef } from './Defs';
import { SideBar, SidebarLinks } from './Sidebar';
import { MemberDoc } from './MemberDoc';
import { MarkdownContent } from './MarkdownContent';
import { collectMemberGroups } from './collectMemberGroups';
import type { TypeDefinition, MemberDefinition } from './TypeDefs';
import { DocSearch } from './DocSearch';

const typeDefURL =
  'https://github.com/immutable-js/immutable-js/blob/main/type-definitions/immutable.d.ts';
const issuesURL = 'https://github.com/immutable-js/immutable-js/issues';

function Disclaimer() {
  return (
    <section className="disclaimer">
      This documentation is generated from{' '}
      <a href={typeDefURL} target="_blank" rel="noopener">
        immutable.d.ts
      </a>
      . Pull requests and{' '}
      <a href={issuesURL} target="_blank" rel="noopener">
        Issues
      </a>{' '}
      welcome.
    </section>
  );
}

function toggle(value: boolean) {
  return !value;
}

export function TypeDocumentation({
  def,
  sidebarLinks,
}: {
  def: TypeDefinition;
  sidebarLinks: SidebarLinks;
}) {
  const [showInherited, toggleShowInherited] = useReducer(toggle, true);
  const [showInGroups, toggleShowInGroups] = useReducer(toggle, true);

  return (
    <>
      <SideBar
        links={sidebarLinks}
        focus={def}
        toggleShowInherited={toggleShowInherited}
        toggleShowInGroups={toggleShowInGroups}
        showInGroups={showInGroups}
        showInherited={showInherited}
      />

      <div key={def.qualifiedName} className="docContents">
        <DocSearch />

        {!def.interface && !def.functions && def.call ? (
          <FunctionDoc def={def.call} />
        ) : (
          <TypeDoc
            def={def}
            showInGroups={showInGroups}
            showInherited={showInherited}
          />
        )}
      </div>
    </>
  );
}

function FunctionDoc({ def }: { def: MemberDefinition }) {
  return (
    <div>
      <h1 className="typeHeader">{def.label}</h1>
      {def.doc && (
        <MarkdownContent className="docSynopsis" contents={def.doc.synopsis} />
      )}
      <code className="codeBlock memberSignature">
        {def.signatures!.map((callSig, i) => (
          <Fragment key={i}>
            <CallSigDef name={def.name} callSig={callSig} />
            {'\n'}
          </Fragment>
        ))}
      </code>
      {def.doc?.notes.map((note, i) => (
        <section key={i}>
          <h4 className="infoHeader">{note.name}</h4>
          {note.name === 'alias' ? <CallSigDef name={note.body} /> : note.body}
        </section>
      ))}
      {def.doc?.description && (
        <section>
          <h4 className="infoHeader">
            {def.doc.description.substr(0, 5) === '<code'
              ? 'Example'
              : 'Discussion'}
          </h4>
          <MarkdownContent
            className="discussion"
            contents={def.doc.description}
          />
        </section>
      )}
      <Disclaimer />
    </div>
  );
}

function TypeDoc({
  def,
  showInGroups,
  showInherited,
}: {
  def: TypeDefinition;
  showInGroups: boolean;
  showInherited: boolean;
}) {
  const memberGroups = collectMemberGroups(
    def?.interface,
    showInGroups,
    showInherited
  );

  return (
    <div>
      <h1 className="typeHeader">{def.qualifiedName}</h1>
      {def.doc && (
        <MarkdownContent className="docSynopsis" contents={def.doc.synopsis} />
      )}

      {def.interface && (
        <code className="codeBlock memberSignature">
          <InterfaceDef name={def.qualifiedName} def={def.interface} />
        </code>
      )}

      {def.doc?.notes.map((note, i) => (
        <section key={i}>
          <h4 className="infoHeader">{note.name}</h4>
          {note.name === 'alias' ? <CallSigDef name={note.body} /> : note.body}
        </section>
      ))}

      {def.doc?.description && (
        <section>
          <h4 className="infoHeader">
            {def.doc.description.substr(0, 5) === '<code'
              ? 'Example'
              : 'Discussion'}
          </h4>
          <MarkdownContent
            className="discussion"
            contents={def.doc.description}
          />
        </section>
      )}

      {def.call && (
        <section>
          <h3 className="groupTitle">Construction</h3>
          <MemberDoc member={def.call} />
        </section>
      )}

      {def.functions && (
        <section>
          <h3 className="groupTitle">Static methods</h3>
          {Object.values(def.functions).map(t => (
            <MemberDoc key={t.id} member={t} />
          ))}
        </section>
      )}

      <section>
        {memberGroups.flatMap(([title, members]) =>
          members.length === 0
            ? null
            : [
                <h3 key={title || 'Members'} className="groupTitle">
                  {title || 'Members'}
                </h3>,
                members.map(member => (
                  <MemberDoc key={member.id} member={member} />
                )),
              ]
        )}
      </section>

      <Disclaimer />
    </div>
  );
}
