// CompanyUpgrades.jsx
import { Building } from 'lucide-react';
import { formatNumber } from '@utils/calculators';

export default function CompanyUpgrades({ 
  companies, 
  buyCompany, 
  money 
}) {
  if (!companies || companies.length === 0) return <p>Keine Unternehmen verfügbar.</p>;

  return (
    <div className="upgrade-section">
      <h2 className="section-title">Unternehmen</h2>
      <div className="upgrade-buttons">
        {companies.map((company, index) => (
          <button
            key={index}
            onClick={() => buyCompany(index)}
            disabled={money < company.cost}
            className={`upgrade-button ${company.colorClass} ${money < company.cost ? 'disabled' : ''}`}
          >
            <div className="upgrade-content">
              <Building className="icon" />
              <span>{company.name}</span>
              <span>{formatNumber(company.cost)} €</span>
              <span>+{formatNumber(company.income)} €/s</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
