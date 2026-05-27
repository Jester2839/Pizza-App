import React from 'react';
import { Link } from 'react-router-dom';

export const ContactPage: React.FC = () => {
  return (
    <main className="contact-page">
      <h1>Kontaktujte nás</h1>
      <p className="contact-subtitle">
        Máte hlad, dotaz nebo nám chcete jen pochválit naši pizzu? Jsme tu pro vás každý den.
      </p>

      <div className="contact-grid">
        {/* Adresa */}
        <div className="contact-card">
          <i className="ph ph-map-pin-line"></i>
          <h3>Kde nás najdete</h3>
          <p>
            Italská 1234/56<br />
            120 00 Praha 2
          </p>
          <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="contact-link">
            Navigovat do restaurace
          </a>
        </div>

        {/* Telefon a Email */}
        <div className="contact-card">
          <i className="ph ph-phone-call"></i>
          <h3>Rezervace & Objednávky</h3>
          <p>
            +420 123 456 789<br />
            info@pizzallettante.cz
          </p>
          <a href="tel:+420123456789" className="contact-link">
            Zavolat hned
          </a>
        </div>

        {/* Otevírací doba */}
        <div className="contact-card">
          <i className="ph ph-clock"></i>
          <h3>Otevírací doba</h3>
          <p>
            Po – Pá: 11:00 – 22:00<br />
            So – Ne: 12:00 – 23:00
          </p>
          <Link to="/" className="contact-link">Dnes máme otevřeno</Link>
        </div>
      </div>

    </main>
  );
};
