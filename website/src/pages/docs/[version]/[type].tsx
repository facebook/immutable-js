import Head from 'next/head';

import { DocHeader } from '../../../DocHeader';
import { ImmutableConsole } from '../../../ImmutableConsole';
import { getSidebarLinks, SidebarLinks } from '../../../Sidebar';
import { getTypeDefs } from '../../../static/getTypeDefs';
import { getVersions } from '../../../static/getVersions';
import type { TypeDefinition } from '../../../TypeDefs';
import { TypeDocumentation } from '../../../TypeDocumentation';

type Params = {
  version: string;
  type: string;
};

type Props = {
  versions: Array<string>;
  version: string;
  def: TypeDefinition;
  sidebarLinks: SidebarLinks;
};

export async function getStaticProps(context: {
  params: Params;
}): Promise<{ props: Props }> {
  const versions = getVersions();
  const { version, type } = context.params;
  const defs = getTypeDefs(version);
  const def = Object.values(defs.types).find(d => d.label === type);
  if (!def) {
    throw new Error('404');
  }
  return {
    props: { versions, version, def, sidebarLinks: getSidebarLinks(defs) },
  };
}

export function getStaticPaths(): {
  paths: Array<{ params: Params }>;
  fallback: boolean;
} {
  return {
    paths: getVersions()
      .map(version =>
        Object.values(getTypeDefs(version).types).map(def => ({
          params: { version, type: def.label },
        }))
      )
      .flat(),
    fallback: false,
  };
}

export default function TypeDocPage({
  versions,
  version,
  def,
  sidebarLinks,
}: Props) {
  return (
    <div>
      <Head>
        <title>{def.qualifiedName} — Immutable.js</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <ImmutableConsole version={version} />
      <DocHeader versions={versions} currentVersion={version} />
      <div className="pageBody">
        <div className="contents">
          <TypeDocumentation def={def} sidebarLinks={sidebarLinks} />
        </div>
      </div>
    </div>
  );
}
