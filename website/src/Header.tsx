import { useState, useEffect } from 'react';
import Link from 'next/link';

import { SVGSet } from './SVGSet';
import { Logo } from './Logo';
import { StarBtn } from './StarBtn';
import { isMobile } from './isMobile';

export function Header({
  versions,
  currentVersion,
}: {
  versions: Array<string>;
  currentVersion?: string;
}) {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    let _pending = false;
    function handleScroll() {
      if (!_pending) {
        const headerHeight = Math.min(
          800,
          Math.max(260, document.documentElement.clientHeight * 0.7)
        );
        if (window.scrollY < headerHeight) {
          _pending = true;
          window.requestAnimationFrame(() => {
            _pending = false;
            setScroll(window.scrollY);
          });
        }
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const neg = scroll < 0;
  const s = neg ? 0 : scroll;
  const sp = isMobile() ? 35 : 70;

  return (
    <div className="header">
      <div className="miniHeader">
        <div className="miniHeaderContents">
          <HeaderLogoLink />
          <HeaderLinks versions={versions} currentVersion={currentVersion} />
        </div>
      </div>
      <div className="coverContainer">
        <div className="cover">
          <div className="coverFixed">
            <div className="filler">
              <div className="miniHeaderContents">
                <HeaderLinks
                  versions={versions}
                  currentVersion={currentVersion}
                />
              </div>
            </div>
            <div className="synopsis">
              <div className="logo">
                {[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((_, i) => (
                  <SVGSet key={i} style={t(ty(s, i * sp), tz(s, i * sp))}>
                    <Logo color="#c1c6c8" />
                    <Logo color="#6dbcdb" opacity={o(s, i * sp)} />
                  </SVGSet>
                ))}
                <SVGSet style={t(s * -0.55, 1)}>
                  <Logo color="#FC4349" />
                  <Logo color="#2C3E50" inline />
                </SVGSet>
              </div>
            </div>
            <div className="buttons">
              <StarBtn />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeaderLogoLink() {
  return (
    <Link href="/">
      <a className="miniLogo">
        <SVGSet>
          <Logo color="#FC4349" />
          <Logo color="#2C3E50" inline />
        </SVGSet>
      </a>
    </Link>
  );
}

export function HeaderLinks({
  versions,
  currentVersion,
}: {
  versions: Array<string>;
  currentVersion?: string;
}) {
  return (
    <div className="links">
      <DocsDropdown versions={versions} currentVersion={currentVersion} />
      <a
        href="https://stackoverflow.com/questions/tagged/immutable.js?sort=votes"
        target="_blank"
        rel="noopener"
      >
        Questions
      </a>
      <a
        href="https://github.com/immutable-js/immutable-js/"
        target="_blank"
        rel="noopener"
      >
        GitHub
      </a>
    </div>
  );
}

function DocsDropdown({
  versions,
  currentVersion,
}: {
  versions: Array<string>;
  currentVersion?: string;
}) {
  return (
    <div className="docsDropdown">
      <style jsx>{`
        .docsDropdown {
          display: inline-block;
          position: relative;
        }

        .docsDropdown > ul {
          position: absolute;
          visibility: hidden;
          width: max-content;
          top: 100%;
          right: -0.75rem;
          background: var(--header-bg-color);
          margin: 0;
          padding: 0.25rem 0 0.5rem;
          box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.25);
        }

        .docsDropdown:hover > ul {
          visibility: visible;
        }

        .docsDropdown:hover > ul > li {
          display: block;
          padding: 0.25rem 1rem;
          text-align: left;
        }
      `}</style>
      <div>
        <Link href={`/docs/${currentVersion || versions[0]}`}>
          <a>Docs{currentVersion && ` (${currentVersion})`}</a>
        </Link>
      </div>
      <ul>
        {versions.map(v => (
          <li key={v}>
            <Link href={`/docs/${v}`}>{v}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ty(s: number, p: number) {
  return (p < s ? p : s) * -0.55;
}

function o(s: number, p: number) {
  return Math.max(0, s > p ? 1 - (s - p) / 350 : 1);
}

function tz(s: number, p: number) {
  return Math.max(0, s > p ? 1 - (s - p) / 20000 : 1);
}

function t(y: number, z: number) {
  return { transform: 'translate3d(0, ' + y + 'px, 0) scale(' + z + ')' };
}
