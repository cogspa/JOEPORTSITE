import React from 'react';

export default function LegalDisclaimer({ style }) {
  return (
    <div className="legal-disclaimer" style={{
      fontSize: '11px',
      lineHeight: '1.6',
      color: 'var(--ink-mute, #8b8273)',
      marginTop: '20px',
      paddingTop: '16px',
      borderTop: '1px solid var(--hairline, rgba(0, 0, 0, 0.08))',
      textAlign: 'left',
      maxWidth: '1000px',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      ...style
    }}>
      © 2026 Ryman Arts. All rights reserved. These curriculum materials are proprietary to Ryman Arts and are provided solely for use by current pLAtform participants, mentors, instructors, and authorized program personnel in connection with the pLAtform program. These materials may not be copied, distributed, posted, published, adapted, or used for any other purpose without the prior written permission of Ryman Arts.
    </div>
  );
}
