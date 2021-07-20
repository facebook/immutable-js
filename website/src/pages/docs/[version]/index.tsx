import Head from 'next/head';
import { getVersions } from '../../../static/getVersions';
import { getTypeDefs } from '../../../static/getTypeDefs';
import { DocHeader } from '../../../DocHeader';
import {
  DocOverview,
  getOverviewData,
  OverviewData,
} from '../../../DocOverview';
import { DocSearch } from '../../../DocSearch';
import { ImmutableConsole } from '../../../ImmutableConsole';
import { SideBar, getSidebarLinks, SidebarLinks } from '../../../Sidebar';

type Params = {
  version: string;
};

type Props = {
  versions: Array<string>;
  version: string;
  overviewData: OverviewData;
  sidebarLinks: SidebarLinks;
};

export async function getStaticProps(context: {
  params: Params;
}): Promise<{ props: Props }> {
  const versions = getVersions();
  const { version } = context.params;
  const defs = getTypeDefs(version);
  const overviewData = getOverviewData(defs);
  const sidebarLinks = getSidebarLinks(defs);

  return {
    props: {
      versions,
      version,
      overviewData,
      sidebarLinks,
    },
  };
}

export function getStaticPaths(): {
  paths: Array<{ params: Params }>;
  fallback: boolean;
} {
  return {
    paths: [...getVersions().map(version => ({ params: { version } }))],
    fallback: false,
  };
}

export default function OverviewDocPage({
  versions,
  version,
  overviewData,
  sidebarLinks,
}: Props) {
  return (
    <div>
      <Head>
        <title>Documentation {version} — Immutable.js</title>
      </Head>
      <ImmutableConsole version={version} />
      <DocHeader versions={versions} currentVersion={version} />
      <div className="pageBody">
        <div className="contents">
          <SideBar links={sidebarLinks} />
          <div key="Overview" className="docContents">
            <DocSearch />
            <h1>Immutable.js ({version})</h1>
            <DocOverview data={overviewData} />
          </div>
        </div>
      </div>
    </div>
  );
}
