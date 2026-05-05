import React from "react";
import "./PublicShell.css";
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
  footerData,
}) => {
  const footer = footerData?.footer ?? null;
  const sponsors = footerData?.sponsors ?? [];

  const hasContact =
    Boolean(footer?.addressLine1) ||
    Boolean(footer?.addressLine2) ||
    Boolean(footer?.email) ||
    Boolean(footer?.phone) ||
    Boolean(footer?.cvr);

  return (
    <footer className="efk-public-footer">
      <div className="efk-public-footer__grid">
        <section className="efk-public-footer__section efk-public-footer__identity">
          <p className="efk-public-footer__eyebrow">Klubsite</p>
          <h3>{clubName}</h3>
          {footer?.description ? (
            <p>{footer.description}</p>
          ) : (
            <p>Klubinformation, aktiviteter og fællesskab samlet ét sted.</p>
          )}
        </section>

        <section className="efk-public-footer__section">
          <p className="efk-public-footer__eyebrow">Kontakt</p>
          <h3>Find os</h3>

          {hasContact ? (
            <div className="efk-public-footer__text">
              {(footer?.addressLine1 || footer?.addressLine2) ? (
                <p>
                  {footer.addressLine1}
                  {footer.addressLine1 && footer.addressLine2 ? ", " : ""}
                  {footer.addressLine2}
                </p>
              ) : null}

              {(footer?.email || footer?.phone || footer?.cvr) ? (
                <p>
                  {footer.email ? (
                    <>
                      <a href={`mailto:${footer.email}`}>{footer.email}</a>
                      <br />
                    </>
                  ) : null}
                  {footer.phone ? (
                    <>
                      <a href={`tel:${footer.phone}`}>{footer.phone}</a>
                      <br />
                    </>
                  ) : null}
                  {footer.cvr ? <>CVR {footer.cvr}</> : null}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="efk-public-footer__text">{clubName}</p>
          )}
        </section>

        {sponsors.length > 0 ? (
          <section className="efk-public-footer__section efk-public-footer__sponsor-section">
            <p className="efk-public-footer__eyebrow">Partnere</p>
            <h3>Sponsorer & samarbejdspartnere</h3>

            <div className="efk-public-footer__sponsors" aria-label="Sponsorer og samarbejdspartnere">
              {sponsors.map((sponsor) => (
                <span key={sponsor.id} className="efk-public-footer__sponsor">
                  {sponsor.href ? (
                    <a href={sponsor.href} target="_blank" rel="noopener noreferrer">
                      {sponsor.name}
                    </a>
                  ) : (
                    sponsor.name
                  )}
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </footer>
  );
};
