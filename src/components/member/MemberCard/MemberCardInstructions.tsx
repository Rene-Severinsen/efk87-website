import React from 'react';
import { MemberCardPrintButton } from './MemberCardPrintButton';

export const MemberCardInstructions: React.FC = () => {
  return (
    <div className="member-card-instructions">
      <h2>Beskrivelse</h2>
      <ol>
        <li>Kontroller at dit kort har den rigtige status, i forhold til de viste kort i bunden af denne side.</li>
        <li>
          Print denne side ud.
          <div className="print-button-container no-print">
            <MemberCardPrintButton />
          </div>
        </li>
        <li>Klip langs ydersiden af den sorte ramme.</li>
        <li>Kortholder findes i klubhuset. Indsæt Modelflyvning Danmark kortet i kortholderen. (Gælder ikke passive medlemmer)</li>
        <li>Indsæt medlemskortet i bunden, foran Modelflyvning Danmark kortet. Kortet skal placeres så Modelflyvning Danmarks logo og gyldigheds år er synligt.</li>
        <li>Kortet skal bæres synligt, når man befinder sig på pladsen.</li>
      </ol>
    </div>
  );
};
