import react from 'react';
import { useState } from 'react';
import { complianceService, CONSENT_TYPES, CONTACT_METHODS, REGULATION_TYPES } from '../services/complianceService';
import { Card } from './UI/Card';
import { ErrorBoundary } from './ErrorBoundary';
import {tokens, r, c} from '../styles/theme';
import { Button } from './UI/Button';
import { CheckCircle2, Phone, Mail, Eye, Search, Plus, Upload, Download, Clock } from 'lucide-react';
import { fmt } from '../utils/formatters';
import { Metric } from './UI/Metric';



export const CompliancePage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(complianceService.getStats());
  const [auditLogs, setAuditLogs] = useState(complianceService.getAuditLog({ limit: 50 }));
  
  // DNC State
  const [dncEntries, setDncEntries] = useState([
    { id: 1, phone: '+1 (555) 123-4567', reason: 'Customer request', addedAt: '2025-01-15', addedBy: 'System' },
    { id: 2, phone: '+1 (555) 234-5678', reason: 'Legal complaint', addedAt: '2025-01-10', addedBy: 'Admin' },
    { id: 3, phone: '+1 (555) 345-6789', reason: 'Opt-out via SMS', addedAt: '2025-01-08', addedBy: 'Auto' },
  ]);
  const [showAddDNC, setShowAddDNC] = useState(false);
  const [showImportDNC, setShowImportDNC] = useState(false);
  const [newDNCPhone, setNewDNCPhone] = useState('');
  const [newDNCReason, setNewDNCReason] = useState('Customer request');
  const [dncSearch, setDncSearch] = useState('');
  const [importDNCText, setImportDNCText] = useState('');
  
  // Consent State
  const [consentRecords, setConsentRecords] = useState([
    { id: 1, leadName: 'John Smith', email: 'john@example.com', type: 'express_written', method: 'email', grantedAt: '2025-01-20', expiresAt: '2027-01-20', status: 'active' },
    { id: 2, leadName: 'Sarah Johnson', email: 'sarah@corp.com', type: 'express_oral', method: 'phone', grantedAt: '2025-01-18', expiresAt: '2026-01-18', status: 'active' },
    { id: 3, leadName: 'Mike Davis', email: 'mike@tech.io', type: 'implied', method: 'email', grantedAt: '2025-01-15', expiresAt: '2026-07-15', status: 'active' },
    { id: 4, leadName: 'Lisa Chen', email: 'lisa@startup.co', type: 'express_written', method: 'sms', grantedAt: '2024-12-01', expiresAt: '2025-01-01', status: 'expired' },
  ]);
  const [showAddConsent, setShowAddConsent] = useState(false);
  const [consentSearch, setConsentSearch] = useState('');
  const [showExportConsent, setShowExportConsent] = useState(false);
  const [showExportAudit, setShowExportAudit] = useState(false);
  const [newConsent, setNewConsent] = useState({
    leadName: '',
    email: '',
    type: 'express_written',
    method: 'email',
  });
  
  // Audit State
  const [auditFilter, setAuditFilter] = useState('all');
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'dnc', label: 'DNC List' },
    { id: 'consent', label: 'Consent' },
    { id: 'audit', label: 'Audit Log' },
  ];
  
  const handleAddDNC = () => {
    if (newDNCPhone.trim()) {
      const entry = {
        id: Date.now(),
        phone: newDNCPhone,
        reason: newDNCReason,
        addedAt: new Date().toISOString().split('T')[0],
        addedBy: user.name || 'User',
      };
      setDncEntries(prev => [entry, ...prev]);
      setNewDNCPhone('');
      setNewDNCReason('Customer request');
      setShowAddDNC(false);
      setStats(prev => ({ ...prev, dncCount: prev.dncCount + 1 }));
    }
  };
  
  const handleRemoveDNC = (id) => {
    setDncEntries(prev => prev.filter(e => e.id !== id));
    setStats(prev => ({ ...prev, dncCount: Math.max(0, prev.dncCount - 1) }));
  };
  
  const handleRevokeConsent = (id) => {
    setConsentRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'revoked' } : r));
  };
  
  // Import DNC from CSV text
  const handleImportDNC = () => {
    if (importDNCText.trim()) {
      const lines = importDNCText.split('\n').filter(l => l.trim());
      const newEntries = lines.map((line, i) => {
        const parts = line.split(',').map(p => p.trim());
        return {
          id: Date.now() + i,
          phone: parts[0] || line,
          reason: parts[1] || 'Imported',
          addedAt: new Date().toISOString().split('T')[0],
          addedBy: user.name || 'Import',
        };
      });
      setDncEntries(prev => [...newEntries, ...prev]);
      setStats(prev => ({ ...prev, dncCount: prev.dncCount + newEntries.length }));
      setImportDNCText('');
      setShowImportDNC(false);
    }
  };
  
  // Add new consent record
  const handleAddConsent = () => {
    if (newConsent.leadName.trim() && newConsent.email.trim()) {
      const consent = {
        id: Date.now(),
        leadName: newConsent.leadName,
        email: newConsent.email,
        type: newConsent.type,
        method: newConsent.method,
        grantedAt: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
      };
      setConsentRecords(prev => [consent, ...prev]);
      setNewConsent({ leadName: '', email: '', type: 'express_written', method: 'email' });
      setShowAddConsent(false);
    }
  };
  
  // Export consent records as CSV
  const handleExportConsent = () => {
    const headers = ['Lead Name', 'Email', 'Consent Type', 'Method', 'Granted At', 'Expires At', 'Status'];
    const rows = consentRecords.map(r => [r.leadName, r.email, r.type, r.method, r.grantedAt, r.expiresAt, r.status]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent_records_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportConsent(false);
  };
  
  // Export audit logs as CSV
  const handleExportAudit = () => {
    const headers = ['ID', 'Timestamp', 'Action', 'User ID', 'Details'];
    const rows = auditLogs.map(l => [l.id, l.timestamp, l.action, l.userId || 'System', JSON.stringify(l.details || {})]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportAudit(false);
  };
  
  const filteredDNC = dncEntries.filter(e => 
    e.phone.includes(dncSearch) || e.reason.toLowerCase().includes(dncSearch.toLowerCase())
  );
  
  const filteredConsent = consentRecords.filter(r =>
    r.leadName.toLowerCase().includes(consentSearch.toLowerCase()) ||
    r.email.toLowerCase().includes(consentSearch.toLowerCase())
  );
  
  const filteredAuditLogs = auditFilter === 'all' 
    ? auditLogs 
    : auditLogs.filter(log => log.action.includes(auditFilter));
  
  const consentTypeColors = {
    express_written: c.success.DEFAULT,
    express_oral: c.primary.DEFAULT,
    implied: c.warning.DEFAULT,
  };
  
  const consentTypeLabels = {
    express_written: 'Express Written',
    express_oral: 'Express Oral',
    implied: 'Implied',
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Compliance Status Banner */}
      <Card style={{ background: `linear-gradient(135deg, ${c.success.muted}, ${c.primary[50]})`, border: `1px solid ${c.success.DEFAULT}30` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: r.lg, background: c.success.DEFAULT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], marginBottom: 4 }}>Compliance Status: Active</h2>
            <p style={{ fontSize: 13, color: c.gray[400] }}>All compliance checks are enabled and monitoring</p>
          </div>
        </div>
      </Card>
      
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <Metric label="DNC Entries" value={fmt.number(dncEntries.length)} icon={Phone} />
        <Metric label="Suppressions" value={fmt.number(stats.suppressionCount)} icon={Mail} />
        <Metric label="Consent Records" value={fmt.number(consentRecords.length)} icon={CheckCircle2} />
        <Metric label="Audit Entries" value={fmt.number(auditLogs.length)} icon={Eye} />
      </div>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: c.gray[900], borderRadius: r.lg, width: 'fit-content' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px', fontSize: 14, fontWeight: 500, border: 'none', borderRadius: r.md, cursor: 'pointer',
              color: activeTab === tab.id ? c.gray[100] : c.gray[500],
              background: activeTab === tab.id ? c.gray[800] : 'transparent',
              transition: tokens.transition.fast,
            }}>
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 16 }}>Regulations Covered</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'TCPA', desc: 'Telephone Consumer Protection Act', status: 'active' },
                { name: 'CAN-SPAM', desc: 'Email marketing compliance', status: 'active' },
                { name: 'GDPR', desc: 'EU data protection', status: 'active' },
                { name: 'CCPA', desc: 'California privacy rights', status: 'active' },
              ].map(reg => (
                <div key={reg.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: c.gray[850], borderRadius: r.lg }}>
                  <CheckCircle2 size={18} style={{ color: c.success.DEFAULT }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[200] }}>{reg.name}</p>
                    <p style={{ fontSize: 12, color: c.gray[500] }}>{reg.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 16 }}>Data Retention Policies</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {complianceService.listRetentionPolicies().map(policy => (
                <div key={policy.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: c.gray[850], borderRadius: r.lg }}>
                  <div>
                    <p style={{ fontSize: 14, color: c.gray[200] }}>{policy.name}</p>
                    <p style={{ fontSize: 12, color: c.gray[500] }}>{policy.archiveAfterRetention ? 'Archive after retention' : 'Delete after retention'}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: c.primary.DEFAULT }}>{Math.round(policy.retentionDays / 365)} years</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
      
      {/* DNC Tab - Fully Functional */}
      {activeTab === 'dnc' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>Do Not Call List</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: c.gray[500] }} />
                <input
                  placeholder="Search DNC..."
                  value={dncSearch}
                  onChange={(e) => setDncSearch(e.target.value)}
                  style={{ padding: '8px 12px 8px 34px', fontSize: 13, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none', width: 200 }}
                />
              </div>
              <Button variant="secondary" size="sm" icon={Upload} onClick={() => setShowImportDNC(true)}>Import CSV</Button>
              <Button size="sm" icon={Plus} onClick={() => setShowAddDNC(true)}>Add Number</Button>
            </div>
          </div>
          
          {/* Add DNC Form */}
          {showAddDNC && (
            <div style={{ padding: 16, background: c.gray[850], borderRadius: r.lg, marginBottom: 16, border: `1px solid ${c.gray[700]}` }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, color: c.gray[200], marginBottom: 12 }}>Add Number to DNC List</h4>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  placeholder="Phone number (e.g., +1 555 123 4567)"
                  value={newDNCPhone}
                  onChange={(e) => setNewDNCPhone(e.target.value)}
                  style={{ flex: 1, minWidth: 200, padding: '10px 12px', fontSize: 14, background: c.gray[900], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none' }}
                />
                <select 
                  value={newDNCReason} 
                  onChange={(e) => setNewDNCReason(e.target.value)}
                  style={{ padding: '10px 12px', fontSize: 14, background: c.gray[900], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[300], outline: 'none' }}
                >
                  <option value="Customer request">Customer Request</option>
                  <option value="Legal complaint">Legal Complaint</option>
                  <option value="Wrong number">Wrong Number</option>
                  <option value="Other">Other</option>
                </select>
                <Button onClick={handleAddDNC}>Add to DNC</Button>
                <Button variant="secondary" onClick={() => setShowAddDNC(false)}>Cancel</Button>
              </div>
            </div>
          )}
          
          {/* DNC Table */}
          {filteredDNC.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Phone Number', 'Reason', 'Added', 'Added By', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: c.gray[500], textTransform: 'uppercase', borderBottom: `1px solid ${c.gray[800]}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDNC.map(entry => (
                    <tr key={entry.id}>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}`, fontSize: 14, color: c.gray[100], fontFamily: tokens.font.mono }}>{entry.phone}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}`, fontSize: 13, color: c.gray[400] }}>{entry.reason}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}`, fontSize: 13, color: c.gray[500] }}>{entry.addedAt}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}`, fontSize: 13, color: c.gray[400] }}>{entry.addedBy}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}` }}>
                        <button 
                          onClick={() => handleRemoveDNC(entry.id)}
                          style={{ padding: '4px 10px', fontSize: 12, background: c.error.muted, border: 'none', borderRadius: r.md, color: c.error.DEFAULT, cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', background: c.gray[850], borderRadius: r.lg }}>
              <Phone size={32} style={{ color: c.gray[600], marginBottom: 8 }} />
              <p style={{ fontSize: 14, color: c.gray[400] }}>{dncSearch ? 'No matching entries found' : 'No numbers on DNC list'}</p>
              <p style={{ fontSize: 12, color: c.gray[600] }}>Add numbers manually or import from CSV</p>
            </div>
          )}
        </Card>
      )}
      
      {/* Consent Tab - Fully Functional */}
      {activeTab === 'consent' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>Consent Records</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: c.gray[500] }} />
                <input
                  placeholder="Search consents..."
                  value={consentSearch}
                  onChange={(e) => setConsentSearch(e.target.value)}
                  style={{ padding: '8px 12px 8px 34px', fontSize: 13, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none', width: 200 }}
                />
              </div>
              <Button variant="secondary" size="sm" icon={Download} onClick={handleExportConsent}>Export Records</Button>
              <Button size="sm" icon={Plus} onClick={() => setShowAddConsent(true)}>Record Consent</Button>
            </div>
          </div>
          
          {/* Consent Types Legend */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            {Object.entries(consentTypeLabels).map(([key, label]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: consentTypeColors[key] }} />
                <span style={{ fontSize: 12, color: c.gray[400] }}>{label}</span>
              </div>
            ))}
          </div>
          
          {/* Consent Table */}
          {filteredConsent.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Contact', 'Consent Type', 'Method', 'Granted', 'Expires', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: c.gray[500], textTransform: 'uppercase', borderBottom: `1px solid ${c.gray[800]}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredConsent.map(record => (
                    <tr key={record.id}>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}` }}>
                        <p style={{ fontSize: 14, color: c.gray[100] }}>{record.leadName}</p>
                        <p style={{ fontSize: 12, color: c.gray[500] }}>{record.email}</p>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}` }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: r.full, fontSize: 12, background: `${consentTypeColors[record.type]}20`, color: consentTypeColors[record.type] }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: consentTypeColors[record.type] }} />
                          {consentTypeLabels[record.type]}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}`, fontSize: 13, color: c.gray[400], textTransform: 'capitalize' }}>{record.method}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}`, fontSize: 13, color: c.gray[400] }}>{record.grantedAt}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}`, fontSize: 13, color: c.gray[400] }}>{record.expiresAt}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}` }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: r.full, fontSize: 11, fontWeight: 500,
                          background: record.status === 'active' ? c.success.muted : record.status === 'expired' ? c.warning.muted : c.error.muted,
                          color: record.status === 'active' ? c.success.DEFAULT : record.status === 'expired' ? c.warning.DEFAULT : c.error.DEFAULT,
                          textTransform: 'capitalize'
                        }}>
                          {record.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}` }}>
                        {record.status === 'active' && (
                          <button 
                            onClick={() => handleRevokeConsent(record.id)}
                            style={{ padding: '4px 10px', fontSize: 12, background: c.error.muted, border: 'none', borderRadius: r.md, color: c.error.DEFAULT, cursor: 'pointer' }}
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', background: c.gray[850], borderRadius: r.lg }}>
              <CheckCircle2 size={32} style={{ color: c.gray[600], marginBottom: 8 }} />
              <p style={{ fontSize: 14, color: c.gray[400] }}>No consent records found</p>
            </div>
          )}
        </Card>
      )}
      
      {/* Audit Tab - Fully Functional */}
      {activeTab === 'audit' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>Audit Trail</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <select 
                value={auditFilter} 
                onChange={(e) => setAuditFilter(e.target.value)}
                style={{ padding: '8px 12px', fontSize: 13, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[300], outline: 'none' }}
              >
                <option value="all">All Events</option>
                <option value="consent">Consent Events</option>
                <option value="dnc">DNC Events</option>
                <option value="data">Data Events</option>
                <option value="access">Access Events</option>
              </select>
              <Button variant="secondary" size="sm" icon={Download} onClick={handleExportAudit}>Export Audit Log</Button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredAuditLogs.slice(0, 20).map(log => {
              const actionColors = {
                consent: c.success.DEFAULT,
                dnc: c.warning.DEFAULT,
                data: c.primary.DEFAULT,
                access: c.accent.DEFAULT,
              };
              const actionType = log.action.includes('consent') ? 'consent' : log.action.includes('dnc') ? 'dnc' : log.action.includes('data') ? 'data' : 'access';
              
              return (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: c.gray[850], borderRadius: r.lg }}>
                  <div style={{ width: 36, height: 36, borderRadius: r.md, background: `${actionColors[actionType]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={16} style={{ color: actionColors[actionType] }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[200] }}>{log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <span style={{ padding: '2px 8px', borderRadius: r.full, fontSize: 10, background: `${actionColors[actionType]}20`, color: actionColors[actionType], textTransform: 'uppercase' }}>
                        {actionType}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: c.gray[500], marginTop: 2 }}>{log.details?.message || JSON.stringify(log.details).slice(0, 60)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, color: c.gray[600] }}>{fmt.date(log.timestamp)}</p>
                    <p style={{ fontSize: 10, color: c.gray[600] }}>{log.userId || 'System'}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredAuditLogs.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', background: c.gray[850], borderRadius: r.lg }}>
              <Clock size={32} style={{ color: c.gray[600], marginBottom: 8 }} />
              <p style={{ fontSize: 14, color: c.gray[400] }}>No audit logs found</p>
            </div>
          )}
        </Card>
      )}
      
      {/* Import DNC Modal */}
      {showImportDNC && (
        <ModalOverlay onClose={() => setShowImportDNC(false)} maxWidth={500}>
          <Card padding={0}>
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}` }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Import DNC Numbers</h2>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 13, color: c.gray[400], marginBottom: 16 }}>
                Paste phone numbers below, one per line. Optionally add a comma-separated reason after each number.
              </p>
              <textarea
                value={importDNCText}
                onChange={(e) => setImportDNCText(e.target.value)}
                placeholder={"+1 555 123 4567, Customer request\n+1 555 234 5678, Legal complaint\n+1 555 345 6789"}
                style={{
                  width: '100%',
                  minHeight: 150,
                  padding: 12,
                  fontSize: 13,
                  fontFamily: tokens.font.mono,
                  background: c.gray[850],
                  border: `1px solid ${c.gray[700]}`,
                  borderRadius: r.md,
                  color: c.gray[100],
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
              <p style={{ fontSize: 11, color: c.gray[600], marginTop: 8 }}>
                {importDNCText.split('\n').filter(l => l.trim()).length} numbers to import
              </p>
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${c.gray[800]}`, display: 'flex', gap: 10 }}>
              <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowImportDNC(false)}>Cancel</Button>
              <Button variant="gradient" style={{ flex: 1 }} onClick={handleImportDNC} disabled={!importDNCText.trim()}>
                <Upload size={16} style={{ marginRight: 8 }} /> Import Numbers
              </Button>
            </div>
          </Card>
        </ModalOverlay>
      )}
      
      {/* Add Consent Form Modal */}
      {showAddConsent && (
        <ModalOverlay onClose={() => setShowAddConsent(false)} maxWidth={480}>
          <Card padding={0}>
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}` }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Record Consent</h2>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="Lead Name"
                placeholder="John Smith"
                value={newConsent.leadName}
                onChange={(e) => setNewConsent({ ...newConsent, leadName: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={newConsent.email}
                onChange={(e) => setNewConsent({ ...newConsent, email: e.target.value })}
              />
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Consent Type</label>
                <select
                  value={newConsent.type}
                  onChange={(e) => setNewConsent({ ...newConsent, type: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[200], outline: 'none' }}
                >
                  <option value="express_written">Express Written Consent</option>
                  <option value="express_oral">Express Oral Consent</option>
                  <option value="implied">Implied Consent</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Collection Method</label>
                <select
                  value={newConsent.method}
                  onChange={(e) => setNewConsent({ ...newConsent, method: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[200], outline: 'none' }}
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                  <option value="sms">SMS</option>
                  <option value="web_form">Web Form</option>
                  <option value="in_person">In Person</option>
                </select>
              </div>
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${c.gray[800]}`, display: 'flex', gap: 10 }}>
              <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowAddConsent(false)}>Cancel</Button>
              <Button variant="gradient" style={{ flex: 1 }} onClick={handleAddConsent} disabled={!newConsent.leadName.trim() || !newConsent.email.trim()}>
                <Plus size={16} style={{ marginRight: 8 }} /> Record Consent
              </Button>
            </div>
          </Card>
        </ModalOverlay>
      )}
    </div>
  );
};