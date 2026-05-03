import React from 'react';
import { PublicClubFooter, PublicSponsor } from "../../generated/prisma";

export interface ThemedFooterProps {
  clubName: string;
  footerData?: {
    footer: PublicClubFooter | null;
    sponsors: PublicSponsor[];
  };
}

export const ThemedFooter: React.FC<ThemedFooterProps> = ({
  clubName,
  footerData
}) => {
  return (
    <footer className="card footer">
      <div>
        <h3>{clubName}</h3>
        {footerData?.footer ? (
          <>
            {footerData.footer.description && <p className="small" style={{ marginTop: '10px' }}>{footerData.footer.description}</p>}
            {footerData.sponsors.length > 0 && (
              <div className="sponsors">
                {footerData.sponsors.map(sponsor => (
                  <span key={sponsor.id} className="sponsor">
                    {sponsor.href ? (
                      <a href={sponsor.href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {sponsor.name}
                      </a>
                    ) : (
                      sponsor.name
                    )}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
      <div>
        <h3>Kontakt</h3>
        {footerData?.footer ? (
          <>
            {(footerData.footer.addressLine1 || footerData.footer.addressLine2) && (
              <p className="small" style={{ marginTop: '10px' }}>
                {footerData.footer.addressLine1}{footerData.footer.addressLine1 && footerData.footer.addressLine2 && ', '}
                {footerData.footer.addressLine2}
              </p>
            )}
            <p className="small" style={{ marginTop: '10px' }}>
              {footerData.footer.email && <>{footerData.footer.email}<br /></>}
              {footerData.footer.phone && <>{footerData.footer.phone}<br /></>}
              {footerData.footer.cvr && <>CVR {footerData.footer.cvr}</>}
            </p>
          </>
        ) : (
          <p className="small" style={{ marginTop: '10px' }}>{clubName}</p>
        )}
      </div>
      <div>
        <h3>Links</h3>
        <p className="small" style={{ marginTop: '10px' }}>
          Flyveskole<br />
          Om {clubName}
        </p>
      </div>
    </footer>
  );
};
