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
  title?: string;
  subtitle?: React.ReactNode;
  eyebrow?: string;
}

export const ThemedPageHeader: React.FC<ThemedPageHeaderProps> = ({ title, subtitle, eyebrow }) => {
  return (
    <header className="themed-page-header mb-6 sm:mb-10">
      {eyebrow && <div className="eyebrow mb-2 sm:mb-3">{eyebrow}</div>}
      {title && <h1 className="themed-h1 text-3xl sm:text-4xl lg:text-5xl">{title}</h1>}
      {subtitle && <p className="hero-copy mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl opacity-90 leading-relaxed">{subtitle}</p>}
    </header>
  );
};
