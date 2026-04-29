import React from 'react';

export interface ThemedCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({ children, className = '', style }) => {
  return (
    <article className={`card ${className}`} style={style}>
      {children}
    </article>
  );
};

export const ThemedSectionCard: React.FC<ThemedCardProps> = ({ children, className = '', style }) => {
  return (
    <article className={`card section-card ${className}`} style={style}>
      {children}
    </article>
  );
};

export interface ThemedPageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

export const ThemedPageHeader: React.FC<ThemedPageHeaderProps> = ({ title, subtitle, eyebrow }) => {
  return (
    <header className="themed-page-header" style={{ marginBottom: '2.5rem' }}>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: '0.75rem' }}>{eyebrow}</div>}
      <h1 className="themed-h1">{title}</h1>
      {subtitle && <p className="hero-copy" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.25rem)', opacity: 0.9 }}>{subtitle}</p>}
    </header>
  );
};
