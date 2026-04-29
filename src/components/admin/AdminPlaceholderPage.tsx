import React from "react";
import "./AdminDashboard.css";

interface AdminPlaceholderPageProps {
  title: string;
  description: string;
  futureItems?: string[];
  primaryHint?: string;
}

const AdminPlaceholderPage: React.FC<AdminPlaceholderPageProps> = ({
  title,
  description,
  futureItems,
  primaryHint
}) => {
  return (
    <div className="admin-placeholder-page">
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 className="admin-section-title" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{title}</h1>
            <p style={{ color: '#595959', margin: 0 }}>{description}</p>
          </div>
          <span className="admin-badge" style={{ 
            backgroundColor: '#fff7e6', 
            color: '#d46b08', 
            border: '1px solid #ffd591',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 500
          }}>
            Ikke implementeret endnu
          </span>
        </div>

        {primaryHint && (
          <div style={{ 
            backgroundColor: '#e6f7ff', 
            border: '1px solid #91d5ff', 
            padding: '16px', 
            borderRadius: '4px', 
            marginBottom: '24px',
            fontSize: '0.875rem'
          }}>
            <strong>Info:</strong> {primaryHint}
          </div>
        )}

        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Fremtidigt indhold</h2>
          {futureItems && futureItems.length > 0 ? (
            <ul style={{ paddingLeft: '20px', color: '#595959', lineHeight: '1.8' }}>
              {futureItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#8c8c8c', fontStyle: 'italic' }}>Real funktionalitet vil blive implementeret løbende.</p>
          )}
        </div>
        
        <div style={{ 
          marginTop: '40px', 
          paddingTop: '20px', 
          borderTop: '1px solid #f0f0f0',
          fontSize: '0.85rem',
          color: '#8c8c8c'
        }}>
          Dette er en pladsholder. Det fulde modul vil blive udviklet som en del af den løbende platform-opdatering.
        </div>
      </div>
    </div>
  );
};

export default AdminPlaceholderPage;
