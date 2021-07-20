import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { getVersions } from '../../static/getVersions';
import { DocHeader } from '../../DocHeader';

type Props = {
  versions: Array<string>;
};

export async function getStaticProps(): Promise<{ props: Props }> {
  const versions = getVersions();
  return { props: { versions } };
}

export default function RedirectExistingDocs({ versions }: Props) {
  const router = useRouter();
  useEffect(() => {
    const [, type, member] = global.window.location.hash?.split('/') || [];
    let route = `/docs/${versions[0]}`;
    if (type) {
      route += `/${type}`;
    }
    if (member) {
      route += `#${member}`;
    }
    router.replace(route);
  }, [versions, router]);

  return (
    <div>
      <Head>
        <title>Documentation — Immutable.js</title>
      </Head>
      <DocHeader versions={versions} />
      <div className="pageBody">
        <div className="contents">Redirecting...</div>
      </div>
    </div>
  );
}
