'use client';

import React from 'react';

export const MemberCardPrintButton: React.FC = () => {
  return (
    <button 
      onClick={() => window.print()}
      className="themed-button" // Using a generic themed button class if available, or just a simple style
      style={{
        padding: '0.5rem 1.5rem',
        backgroundColor: 'var(--club-accent, #000)',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      Print
    </button>
  );
};
