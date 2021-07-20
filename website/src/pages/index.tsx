import fs from 'fs';
import Head from 'next/head';

import { Header } from '../Header';
import { ImmutableConsole } from '../ImmutableConsole';
import { genMarkdownDoc } from '../static/genMarkdownDoc';
import { getVersions } from '../static/getVersions';

type Props = {
  versions: Array<string>;
  readme: string;
};

export async function getStaticProps(): Promise<{ props: Props }> {
  const versions = getVersions();
  const readme = genMarkdownDoc(
    versions[0],
    fs.readFileSync(`../README.md`, 'utf8')
  );
  return { props: { versions, readme } };
}

export default function Home({ versions, readme }: Props) {
  return (
    <div>
      <Head>
        <title>Immutable.js</title>
      </Head>
      <ImmutableConsole version={versions[0]} />
      <Header versions={versions} />
      <div className="pageBody">
        <div className="contents">
          <div dangerouslySetInnerHTML={{ __html: readme }} />
        </div>
      </div>
    </div>
  );
}
