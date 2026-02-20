import {
  X, Download, Phone, Mail, Calendar, Target, 
  Building2, CheckCircle2, AlertCircle,
   Check,ExternalLink, TrendingUp as TrendUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { c, r, tokens } from '../styles/theme';
import Card  from './UI/Card';
import { Button } from './UI/Button';
import { integrationConfig, INTEGRATIONS, generateEnvTemplate } from '../services/integrationConfig';
//import { integrationService } from './services/integrationClients';


export const IntegrationsPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('crm');
  const [configuredIntegrations, setConfiguredIntegrations] = useState(integrationConfig.getConfiguredIntegrations());
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [formData, setFormData] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [showEnvModal, setShowEnvModal] = useState(false);
  
  // Refresh on config changes
  useEffect(() => {
    const unsubscribe = integrationConfig.subscribe(() => {
      setConfiguredIntegrations(integrationConfig.getConfiguredIntegrations());
    });
    return unsubscribe;
  }, []);
  
  const tabs = [
    { id: 'crm', label: 'CRM', icon: Building2, category: 'crm' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, category: 'calendar' },
    { id: 'enrichment', label: 'Enrichment', icon: Target, category: 'enrichment' },
    { id: 'email', label: 'Email', icon: Mail, category: 'email' },
    { id: 'communication', label: 'SMS/Voice', icon: Phone, category: 'communication' },
    { id: 'verification', label: 'Verification', icon: CheckCircle2, category: 'verification' },
  ];
  
  const getIntegrationsForTab = (category) => {
    return Object.values(INTEGRATIONS).filter(i => i.category === category);
  };
  
  const openSetup = (integration) => {
    const existing = integrationConfig.getConfig(integration.id) || {};
    setFormData(existing);
    setSelectedIntegration(integration);
    setTestResult(null);
  };
  
  const closeSetup = () => {
    setSelectedIntegration(null);
    setFormData({});
    setTestResult(null);
  };
  
  const handleSave = async () => {
    if (!selectedIntegration) return;
    integrationConfig.saveConfig(selectedIntegration.id, formData);
    setTestResult({ success: true, message: 'Configuration saved' });
  };
  
  const handleTest = async () => {
    if (!selectedIntegration) return;
    setTesting(true);
    setTestResult(null);
    
    // Save first
    integrationConfig.saveConfig(selectedIntegration.id, formData);
    
    // Then test
    const result = await integrationConfig.testConnection(selectedIntegration.id);
    setTestResult(result);
    setTesting(false);
  };
  
  const handleDisconnect = () => {
    if (!selectedIntegration) return;
    integrationConfig.removeConfig(selectedIntegration.id);
    closeSetup();
  };
  
  const startOAuth = () => {
    if (!selectedIntegration) return;
    const callbackUrl = `${window.location.origin}/oauth/callback`;
    const url = integrationConfig.getOAuthUrl(selectedIntegration.id, callbackUrl);
    if (url) {
      window.open(url, '_blank', 'width=600,height=700');
    }
  };
  
  // Integration Card Component
  const IntegrationCard = ({ integration }) => {
    const isConfigured = configuredIntegrations.includes(integration.id);
    const isConnected = integrationConfig.isConnected(integration.id);
    
    return (
      <Card hover onClick={() => openSetup(integration)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: r.lg, 
            background: integration.color + '20', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Building2 size={24} style={{ color: integration.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 3 }}>
              {integration.name}
            </p>
            <p style={{ fontSize: 12, color: c.gray[500] }}>{integration.description}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            {isConnected ? (
              <span style={{ 
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: r.full, 
                background: c.success.muted, color: c.success.DEFAULT, 
                fontSize: 12, fontWeight: 500 
              }}>
                <Check size={14} /> Connected
              </span>
            ) : isConfigured ? (
              <span style={{ 
                padding: '4px 10px', borderRadius: r.full, 
                background: c.warning.muted, color: c.warning.DEFAULT, 
                fontSize: 12, fontWeight: 500 
              }}>
                Configured
              </span>
            ) : (
              <span style={{ 
                padding: '4px 10px', borderRadius: r.full, 
                background: c.gray[800], color: c.gray[500], 
                fontSize: 12, fontWeight: 500 
              }}>
                Not set up
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: c.gray[100], marginBottom: 4 }}>Integrations</h1>
          <p style={{ fontSize: 13, color: c.gray[500] }}>
            {configuredIntegrations.length} of {Object.keys(INTEGRATIONS).length} integrations configured
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={Download} onClick={() => setShowEnvModal(true)}>
          Export .env Template
        </Button>
      </div>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: c.gray[900], borderRadius: r.lg, overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              fontSize: 13, fontWeight: 500, border: 'none', borderRadius: r.md, cursor: 'pointer',
              color: activeTab === tab.id ? c.gray[100] : c.gray[500],
              background: activeTab === tab.id ? c.gray[800] : 'transparent',
              transition: tokens.transition.fast, whiteSpace: 'nowrap',
            }}>
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Integration Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        {getIntegrationsForTab(tabs.find(t => t.id === activeTab)?.category).map(integration => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>
      
      {/* Setup Modal */}
      {selectedIntegration && (
        <div onClick={closeSetup} style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', 
          padding: 24, paddingTop: 60, zIndex: 100, overflowY: 'auto'
        }}>
          <Card onClick={(e) => e.stopPropagation()} padding={0} style={{ width: '100%', maxWidth: 560 }}>
            {/* Modal Header */}
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ 
                width: 44, height: 44, borderRadius: r.lg, 
                background: selectedIntegration.color + '20', 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <Building2 size={22} style={{ color: selectedIntegration.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100] }}>
                  {selectedIntegration.name} Setup
                </h2>
                <p style={{ fontSize: 12, color: c.gray[500] }}>{selectedIntegration.authType === 'oauth2' ? 'OAuth 2.0' : 'API Key'} authentication</p>
              </div>
              <button onClick={closeSetup} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
                <X size={20} style={{ color: c.gray[500] }} />
              </button>
            </div>
            
            {/* Setup Steps */}
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}` }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: c.gray[300], marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Setup Instructions
              </h3>
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                {selectedIntegration.setupSteps.map((step, i) => (
                  <li key={i} style={{ fontSize: 13, color: c.gray[400], marginBottom: 8, lineHeight: 1.5 }}>
                    {step.replace('{callback_url}', `${window.location.origin}/oauth/callback`)}
                  </li>
                ))}
              </ol>
              <a href={selectedIntegration.docsUrl} target="_blank" rel="noopener noreferrer" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: c.primary.DEFAULT, marginTop: 12, textDecoration: 'none' }}>
                View full documentation <ExternalLink size={14} />
              </a>
            </div>
            
            {/* Configuration Form */}
            <div style={{ padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: c.gray[300], marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Configuration
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {selectedIntegration.requiredFields.map(field => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px 12px', fontSize: 14,
                        background: c.gray[850], border: `1px solid ${c.gray[700]}`,
                        borderRadius: r.md, color: c.gray[100], outline: 'none',
                      }}
                    />
                  </div>
                ))}
              </div>
              
              {/* OAuth Button */}
              {selectedIntegration.authType === 'oauth2' && (
                <div style={{ marginTop: 16, padding: 14, background: c.gray[850], borderRadius: r.lg }}>
                  <p style={{ fontSize: 13, color: c.gray[400], marginBottom: 10 }}>
                    After entering credentials above, authorize access:
                  </p>
                  <Button variant="secondary" fullWidth onClick={startOAuth} icon={ExternalLink}>
                    Authorize with {selectedIntegration.name}
                  </Button>
                </div>
              )}
              
              {/* Test Result */}
              {testResult && (
                <div style={{ 
                  marginTop: 16, padding: 12, borderRadius: r.lg,
                  background: testResult.success ? c.success.muted : c.error.muted,
                  border: `1px solid ${testResult.success ? c.success.DEFAULT : c.error.DEFAULT}30`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {testResult.success ? (
                      <CheckCircle2 size={18} style={{ color: c.success.DEFAULT }} />
                    ) : (
                      <AlertCircle size={18} style={{ color: c.error.DEFAULT }} />
                    )}
                    <span style={{ fontSize: 13, color: testResult.success ? c.success.DEFAULT : c.error.DEFAULT }}>
                      {testResult.message || testResult.error}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <Button onClick={handleSave} style={{ flex: 1 }}>Save Configuration</Button>
                <Button variant="secondary" onClick={handleTest} disabled={testing}>
                  {testing ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
              
              {integrationConfig.isConfigured(selectedIntegration.id) && (
                <button 
                  onClick={handleDisconnect}
                  style={{ 
                    width: '100%', marginTop: 12, padding: 10, 
                    background: 'transparent', border: `1px solid ${c.error.DEFAULT}30`,
                    borderRadius: r.md, color: c.error.DEFAULT, fontSize: 13,
                    cursor: 'pointer', transition: tokens.transition.fast,
                  }}
                >
                  Disconnect Integration
                </button>
              )}
            </div>
          </Card>
        </div>
      )}
      
      {/* Env Template Modal */}
      {showEnvModal && (
        <div onClick={() => setShowEnvModal(false)} style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          padding: 24, zIndex: 100 
        }}>
          <Card onClick={(e) => e.stopPropagation()} padding={20} style={{ width: '100%', maxWidth: 600, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100] }}>Environment Variables Template</h2>
              <button onClick={() => setShowEnvModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: c.gray[500] }} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: c.gray[500], marginBottom: 16 }}>
              Copy this template to your .env.local file and fill in your credentials:
            </p>
            <pre style={{ 
              flex: 1, overflow: 'auto', padding: 16, background: c.gray[900], 
              borderRadius: r.lg, fontSize: 12, color: c.gray[300], 
              fontFamily: tokens.font.mono, lineHeight: 1.6,
              whiteSpace: 'pre-wrap', wordBreak: 'break-all'
            }}>
              {generateEnvTemplate()}
            </pre>
            <Button 
              style={{ marginTop: 16 }} 
              fullWidth 
              onClick={() => {
                navigator.clipboard.writeText(generateEnvTemplate());
                setShowEnvModal(false);
              }}
            >
              Copy to Clipboard
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
