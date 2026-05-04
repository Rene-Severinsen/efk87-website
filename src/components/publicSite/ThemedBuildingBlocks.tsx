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

export const ThemedPageHeader: React.FC<ThemedPageHeaderProps> = ({
                                                                    title,
                                                                    subtitle,
                                                                    eyebrow,
                                                                  }) => {
  return (
      <header className="themed-page-header mb-6 sm:mb-10">
        {eyebrow && (
            <div className="eyebrow">
              {eyebrow}
            </div>
        )}

        {title && (
            <h1 className="themed-h1">
              {title}
            </h1>
        )}

        {subtitle && (
            <p className="hero-copy">
              {subtitle}
            </p>
        )}
      </header>
  );
};
