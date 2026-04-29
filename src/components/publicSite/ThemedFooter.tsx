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
          </>
        ) : (
          <>
            <p className="small" style={{ marginTop: '10px' }}>Ny forside mockup med mere visuel struktur og tydeligere indgange til de vigtigste områder: aktivitet, forum, galleri, flyveskole og klubinformation.</p>
            <div className="sponsors">
              <span className="sponsor">Ellehammerfonden</span>
              <span className="sponsor">Friluftsrådet</span>
              <span className="sponsor">Dane-RC</span>
            </div>
          </>
        )}
      </div>
      <div>
        <h3>Kontakt</h3>
        {footerData?.footer ? (
          <>
            <p className="small" style={{ marginTop: '10px' }}>
              {footerData.footer.addressLine1}{footerData.footer.addressLine1 && footerData.footer.addressLine2 && ', '}
              {footerData.footer.addressLine2}
            </p>
            <p className="small" style={{ marginTop: '10px' }}>
              {footerData.footer.email}<br />
              {footerData.footer.phone && <>{footerData.footer.phone}<br /></>}
              {footerData.footer.cvr && <>CVR {footerData.footer.cvr}</>}
            </p>
          </>
        ) : (
          <>
            <p className="small" style={{ marginTop: '10px' }}>{clubName}, Flyvestation Værløse, Shelter 331, 3500 Værløse</p>
            <p className="small" style={{ marginTop: '10px' }}>kontakt@efk87.dk<br />CVR 12345678</p>
          </>
        )}
      </div>
      <div>
        <h3>Links</h3>
        <p className="small" style={{ marginTop: '10px' }}>Forum<br />Galleri<br />Flyveskole<br />Om {clubName}</p>
      </div>
    </footer>
  );
};
