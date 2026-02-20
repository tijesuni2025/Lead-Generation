import { useState } from 'react';
import { Card } from '../UI/Card';
import { UserOrgAvatar } from '../UserProfile/Avatar';
import { ClientMetricsModal } from '../../utils/ClientMetricsModal';
import { BarChart3, ChevronRight } from 'lucide-react';
import { c, r, tokens } from '../../styles/theme';
import { MOCK_USERS, MOCK_LEADS_BY_CLIENT } from '../../Data/Mocks';


export const AdminClients = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [showMetrics, setShowMetrics] = useState(false);
  
  const handleClientClick = (client) => {
    setSelectedClient(client);
    setShowMetrics(true);
  };
  
  return (
    <>
      <Card>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: c.gray[100], marginBottom: 16, fontFamily: tokens.font.heading }}>Client Management</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MOCK_USERS.clients.map(client => {
            const clientLeads = MOCK_LEADS_BY_CLIENT[client.id] || [];
            const hotCount = clientLeads.filter(l => l.status === 'Hot').length;
            
            return (
              <div 
                key={client.id} 
                onClick={() => handleClientClick(client)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 14, padding: 14, 
                  background: c.gray[850], borderRadius: r.lg, cursor: 'pointer',
                  border: `1px solid ${c.gray[800]}`, transition: tokens.transition.fast,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.primary.DEFAULT; e.currentTarget.style.background = c.gray[800]; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = c.gray[800]; e.currentTarget.style.background = c.gray[850]; }}
              >
                <UserOrgAvatar userName={client.name} orgName={client.company} userSize={40} />
                <div style={{ flex: 1, marginLeft: 8 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100] }}>{client.name}</p>
                  <p style={{ fontSize: 13, color: c.gray[500] }}>{client.email}</p>
                </div>
                <div style={{ textAlign: 'right', marginRight: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: c.gray[200] }}>{clientLeads.length} leads</p>
                  {hotCount > 0 && <p style={{ fontSize: 12, color: c.hot.text }}>{hotCount} hot</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: c.gray[500] }}>
                  <BarChart3 size={18} />
                  <ChevronRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      
      {/* Client Metrics Modal */}
      <ClientMetricsModal 
        isOpen={showMetrics} 
        onClose={() => setShowMetrics(false)} 
        client={selectedClient}
        leads={selectedClient ? MOCK_LEADS_BY_CLIENT[selectedClient.id] : []}
      />
    </>
  );
};
