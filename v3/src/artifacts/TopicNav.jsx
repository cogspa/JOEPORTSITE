import { Link } from 'react-router-dom';
import LegalDisclaimer from '../LegalDisclaimer.jsx';

/**
 * TopicNav — prev/next navigation for topic detail subpages.
 * Props:
 *   topicList  — array of { key, label } in display order
 *   topicKey   — current topic key string
 *   weekNum    — two-digit week string, e.g. '01'
 */
export default function TopicNav({ topicList, topicKey, weekNum }) {
  const idx = topicList.findIndex((t) => t.key === topicKey);
  if (idx === -1) return null;

  const prev = idx > 0 ? topicList[idx - 1] : null;
  const next = idx < topicList.length - 1 ? topicList[idx + 1] : null;

  return (
    <>
      <nav style={navStyle}>
        {prev ? (
          <Link to={`/week/${weekNum}/${prev.key}`} style={linkStyle}>
            <span style={arrowStyle}>←</span>
            <span style={labelStyle}>{prev.label}</span>
          </Link>
        ) : (
          <span />
        )}

        <Link to={`/week/${weekNum}`} style={backLinkStyle}>
          All Topics
        </Link>

        {next ? (
          <Link to={`/week/${weekNum}/${next.key}`} style={{ ...linkStyle, textAlign: 'right' }}>
            <span style={labelStyle}>{next.label}</span>
            <span style={arrowStyle}>→</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
      <LegalDisclaimer style={{ borderTop: 'none', paddingTop: 0, marginTop: '24px' }} />
    </>
  );
}

const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '16px',
  marginTop: '48px',
  paddingTop: '24px',
  borderTop: '1px solid #d4c9a8',
};

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  textDecoration: 'none',
  color: '#8b3a2f',
  fontFamily: 'Menlo, monospace',
  fontSize: '11px',
  letterSpacing: '0.08em',
  maxWidth: '40%',
  lineHeight: 1.4,
};

const arrowStyle = {
  fontSize: '16px',
  flexShrink: 0,
};

const labelStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
};

const backLinkStyle = {
  fontFamily: 'Menlo, monospace',
  fontSize: '10px',
  color: '#8b3a2f',
  textDecoration: 'none',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  flexShrink: 0,
  opacity: 0.7,
};
