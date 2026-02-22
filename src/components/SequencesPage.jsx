import { useState, useMemo } from 'react';
import {
  Users, Settings, X, CheckCircle2, AlertCircle, Clock,
  TrendingUp, Plus, Edit2, Trash2, Phone, Mail,
  Zap, Activity, RefreshCw, Building2, ChevronRight, FileText,
  MessageSquare, TrendingUp as TrendUp, Globe, Shield, 
} from 'lucide-react';
import { sequenceEngine, SEQUENCE_TEMPLATES, SEQUENCE_STATUS, EMAIL_TEMPLATES } from '../services/sequenceService';
import { Button, Card, Input, Metric} from '../components';
//import { c, r, fmt, tokens } from '../utils/designSystem';
import { c, r, tokens } from '../styles/theme';
import { fmt } from '../utils/formatters';
import { Avatar } from '../components';
import { ModalOverlay } from './Layout/ModalOverlay';
import { SequenceBuilder } from './Layout/SequenceBuilder';
import { EnrollLeadsModal } from './Layout/EnrollLeadsModal';
// import { Card, Button, Avatar, Input, Metric, Score, ModalOverlay} from '../index';

export const SequencesPage = ({ user }) => {
  const [sequences, setSequences] = useState(sequenceEngine.listSequences());
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingSequence, setEditingSequence] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollSequenceId, setEnrollSequenceId] = useState(null);
  const [activeTab, setActiveTab] = useState('sequences');
  const [emailConnections, setEmailConnections] = useState([
    { id: 'conn_gmail_demo', providerId: 'gmail', email: 'chris@azimontgroup.com', status: 'connected', dailySent: 45, dailyLimit: 500, connectedAt: new Date(Date.now() - 7 * 86400000).toISOString() }
  ]);
  const [showConnectEmail, setShowConnectEmail] = useState(false);
  const [domains, setDomains] = useState([
    { 
      id: 'dom_1', domain: 'azimontgroup.com', status: 'verified', verifiedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      health: { spf: true, dkim: true, dmarc: true, reputation: 92 },
      dnsRecords: {
        spf: { type: 'TXT', host: '@', value: 'v=spf1 include:_spf.bluestarai.com ~all', status: 'verified' },
        dkim: { type: 'CNAME', host: 'bluestar._domainkey', value: 'dkim.bluestarai.com', status: 'verified' },
        dmarc: { type: 'TXT', host: '_dmarc', value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@azimontgroup.com', status: 'verified' },
        tracking: { type: 'CNAME', host: 'track', value: 'track.bluestarai.com', status: 'verified', required: false },
      }
    }
  ]);
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [newDomain, setNewDomain] = useState('');  
  const [warmups, setWarmups] = useState([
    {
      id: 'warmup_1', connectionId: 'conn_gmail_demo', email: 'chris@azimontgroup.com', schedule: 'moderate', status: 'in_progress',
      currentDay: 8, currentVolume: 50, targetVolume: 150, maxVolume: 150,
      stats: { totalSent: 280, totalReceived: 245, bounces: 2, spamReports: 0, reputation: 78 },
      dailyLogs: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, sent: 10 + i * 5, received: 8 + i * 4, volume: 10 + i * 5 }))
    }
  ]);
  
  const [smsConnections, setSmsConnections] = useState([]);
  const [showConnectSMS, setShowConnectSMS] = useState(false);
  const [smsProvider, setSmsProvider] = useState(null); // 'twilio' or 'messagebird'
  const [smsCredentials, setSmsCredentials] = useState({ accountSid: '', authToken: '', phoneNumber: '', apiKey: '', originator: '' });
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [selectedEmailAccount, setSelectedEmailAccount] = useState(null);
  const [showDomainSetup, setShowDomainSetup] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [showWarmupSettings, setShowWarmupSettings] = useState(false);
  const [selectedWarmup, setSelectedWarmup] = useState(null);
  const refreshSequences = () => setSequences(sequenceEngine.listSequences());
  
  const stats = useMemo(() => {
    const totals = sequences.reduce((acc, seq) => ({
      enrolled: acc.enrolled + seq.stats.enrolled,
      active: acc.active + seq.stats.active,
      completed: acc.completed + seq.stats.completed,
      replied: acc.replied + seq.stats.replied,
    }), { enrolled: 0, active: 0, completed: 0, replied: 0 });
    
    return {
      ...totals,
      replyRate: totals.enrolled > 0 ? Math.round((totals.replied / totals.enrolled) * 100) : 0,
    };
  }, [sequences]);
  
  const channelIcons = { email: Mail, linkedin: Building2, sms: MessageSquare, call: Phone, task: CheckCircle2 };
  const channelColors = { email: '#3b82f6', linkedin: '#0077B5', sms: '#22c55e', call: '#f59e0b', task: '#8b5cf6' };
  
  const tabs = [
    { id: 'sequences', label: 'Sequences', icon: Zap },
    { id: 'email', label: 'Email Accounts', icon: Mail },
    { id: 'domains', label: 'Domains', icon: Globe },
    { id: 'warmup', label: 'Warmup', icon: TrendingUp },
    { id: 'sms', label: 'SMS', icon: MessageSquare },
  ];
  
  const handleCreateFromTemplate = (template) => {
    const newSequence = {
      id: `seq-${Date.now()}`,
      name: template.name,
      description: template.description,
      status: SEQUENCE_STATUS.DRAFT,
      steps: template.steps.map((step, i) => ({
        id: `step-${Date.now()}-${i}`,
        order: i,
        channel: step.channel,
        delayDays: step.day,
        delayHours: 0,
        subject: step.subject || '',
        body: EMAIL_TEMPLATES[step.template]?.body || '',
        template: step.template,
      })),
      settings: {
        sendWindow: { start: 9, end: 17 },
        timezone: 'America/New_York',
        skipWeekends: true,
        stopOnReply: true,
        stopOnMeeting: true,
        dailyLimit: 50,
      },
      stats: { enrolled: 0, active: 0, completed: 0, replied: 0, meetings: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    sequenceEngine.sequences.set(newSequence.id, newSequence);
    refreshSequences();
    setShowCreate(false);
    setEditingSequence(newSequence);
  };
  
  const handleCreateBlank = () => {
    const newSequence = {
      id: `seq-${Date.now()}`,
      name: 'New Sequence',
      description: '',
      status: SEQUENCE_STATUS.DRAFT,
      steps: [],
      settings: {
        sendWindow: { start: 9, end: 17 },
        timezone: 'America/New_York',
        skipWeekends: true,
        stopOnReply: true,
        stopOnMeeting: true,
        dailyLimit: 50,
      },
      stats: { enrolled: 0, active: 0, completed: 0, replied: 0, meetings: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    sequenceEngine.sequences.set(newSequence.id, newSequence);
    refreshSequences();
    setShowCreate(false);
    setEditingSequence(newSequence);
  };
  
  const toggleSequenceStatus = (seq) => {
    const newStatus = seq.status === SEQUENCE_STATUS.ACTIVE ? SEQUENCE_STATUS.PAUSED : SEQUENCE_STATUS.ACTIVE;
    seq.status = newStatus;
    seq.updatedAt = new Date().toISOString();
    refreshSequences();
  };
  
  const deleteSequence = (seqId) => {
    if (confirm('Are you sure you want to delete this sequence?')) {
      sequenceEngine.sequences.delete(seqId);
      refreshSequences();
      setSelectedSequence(null);
    }
  };
  
  const openEnrollModal = (seqId) => {
    setEnrollSequenceId(seqId);
    setShowEnrollModal(true);
  };
  
  const handleConnectEmail = (provider) => {
    const mockConnection = {
      id: `conn_${provider}_${Date.now()}`,
      providerId: provider,
      email: `user@${provider === 'gmail' ? 'gmail.com' : 'outlook.com'}`,
      status: 'connected',
      dailySent: 0,
      dailyLimit: provider === 'gmail' ? 500 : 10000,
      connectedAt: new Date().toISOString(),
    };
    setEmailConnections(prev => [...prev, mockConnection]);
    setShowConnectEmail(false);
  };
  
  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    const domain = {
      id: `dom_${Date.now()}`,
      domain: newDomain.toLowerCase().trim(),
      status: 'pending',
      verifiedAt: null,
      health: { spf: false, dkim: false, dmarc: false, reputation: 0 },
      dnsRecords: {
        spf: { type: 'TXT', host: '@', value: 'v=spf1 include:_spf.bluestarai.com ~all', status: 'pending', required: true },
        dkim: { type: 'CNAME', host: `bluestar${Date.now().toString(36)}._domainkey`, value: 'bluestar._domainkey.bluestarai.com', status: 'pending', required: true },
        dmarc: { type: 'TXT', host: '_dmarc', value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@bluestarai.com', status: 'pending', required: true },
      },
    };
    setDomains(prev => [...prev, domain]);
    setNewDomain('');
    setShowAddDomain(false);
  };
  
  const handleVerifyDomain = (domainId) => {
    setDomains(prev => prev.map(d => {
      if (d.id !== domainId) return d;
      const verified = Math.random() > 0.3;
      const updatedDomain = {
        ...d,
        status: verified ? 'verified' : 'pending',
        verifiedAt: verified ? new Date().toISOString() : null,
        health: verified ? { spf: true, dkim: true, dmarc: true, reputation: Math.floor(Math.random() * 20) + 80 } : d.health,
        dnsRecords: {
          spf: { ...d.dnsRecords.spf, status: verified ? 'verified' : 'failed' },
          dkim: { ...d.dnsRecords.dkim, status: verified ? 'verified' : 'failed' },
          dmarc: { ...d.dnsRecords.dmarc, status: verified ? 'verified' : 'failed' },
          tracking: { ...d.dnsRecords.tracking, status: verified ? 'verified' : 'pending' },
        },
      };
      if (selectedDomain && selectedDomain.id === domainId) {
        setSelectedDomain(updatedDomain);
      }
      return updatedDomain;
    }));
  };
  
  const handleStartWarmup = (connectionId, schedule = 'moderate') => {
    const connection = emailConnections.find(c => c.id === connectionId);
    if (!connection) return;
    
    const warmup = {
      id: `warmup_${Date.now()}`,
      connectionId,
      email: connection.email,
      schedule,
      status: 'in_progress',
      currentDay: 1,
      currentVolume: schedule === 'conservative' ? 5 : schedule === 'aggressive' ? 20 : 10,
      targetVolume: schedule === 'conservative' ? 100 : schedule === 'aggressive' ? 200 : 150,
      maxVolume: schedule === 'conservative' ? 100 : schedule === 'aggressive' ? 200 : 150,
      stats: { totalSent: 0, totalReceived: 0, bounces: 0, spamReports: 0, reputation: 50 },
      dailyLogs: [],
    };
    setWarmups(prev => [...prev, warmup]);
  };
  
  const handleDisconnectEmail = (connectionId) => {
    if (confirm('Are you sure you want to disconnect this email account? This will stop all active sequences using this account.')) {
      setEmailConnections(prev => prev.filter(c => c.id !== connectionId));
      setWarmups(prev => prev.filter(w => w.connectionId !== connectionId));
    }
  };
  
  const handleUpdateEmailSettings = (connectionId, settings) => {
    setEmailConnections(prev => prev.map(c => 
      c.id === connectionId ? { ...c, ...settings } : c
    ));
    setShowEmailSettings(false);
    setSelectedEmailAccount(null);
  };
  
  const handleToggleWarmup = (warmupId) => {
    setWarmups(prev => prev.map(w => {
      if (w.id !== warmupId) return w;
      return { ...w, status: w.status === 'in_progress' ? 'paused' : 'in_progress' };
    }));
  };
  
  const handleUpdateWarmupSettings = (warmupId, settings) => {
    setWarmups(prev => prev.map(w => {
      if (w.id !== warmupId) return w;
      return { ...w, ...settings };
    }));
    setShowWarmupSettings(false);
    setSelectedWarmup(null);
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };
  
  const handleAddDomainWithSetup = () => {
    if (!newDomain.trim()) return;
    const domainName = newDomain.toLowerCase().trim();
    const domain = {
      id: `dom_${Date.now()}`,
      domain: domainName,
      status: 'pending',
      verifiedAt: null,
      health: { spf: false, dkim: false, dmarc: false, reputation: 0 },
      dnsRecords: {
        spf: { type: 'TXT', host: '@', value: `v=spf1 include:_spf.bluestarai.com ~all`, status: 'pending', required: true },
        dkim: { type: 'CNAME', host: `bluestar._domainkey`, value: 'dkim.bluestarai.com', status: 'pending', required: true },
        dmarc: { type: 'TXT', host: '_dmarc', value: `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@${domainName}`, status: 'pending', required: true },
        tracking: { type: 'CNAME', host: 'track', value: 'track.bluestarai.com', status: 'pending', required: false },
      },
    };
    setDomains(prev => [...prev, domain]);
    setNewDomain('');
    setShowAddDomain(false);
    setSelectedDomain(domain);
    setShowDomainSetup(true);
  };
  
  const handleConnectSMS = (provider) => {
    if (provider === 'twilio') {
      if (!smsCredentials.accountSid || !smsCredentials.authToken || !smsCredentials.phoneNumber) {
        alert('Please fill in all required fields');
        return;
      }
      const connection = {
        id: `sms_twilio_${Date.now()}`,
        providerId: 'Twilio',
        accountSid: smsCredentials.accountSid,
        phoneNumbers: [smsCredentials.phoneNumber],
        status: 'connected',
        connectedAt: new Date().toISOString(),
        messagesSent: 0,
        messagesLimit: 10000,
      };
      setSmsConnections(prev => [...prev, connection]);
    } else if (provider === 'messagebird') {
      if (!smsCredentials.apiKey || !smsCredentials.originator) {
        alert('Please fill in all required fields');
        return;
      }
      const connection = {
        id: `sms_messagebird_${Date.now()}`,
        providerId: 'MessageBird',
        apiKey: smsCredentials.apiKey.slice(-4),
        phoneNumbers: [smsCredentials.originator],
        status: 'connected',
        connectedAt: new Date().toISOString(),
        messagesSent: 0,
        messagesLimit: 50000,
      };
      setSmsConnections(prev => [...prev, connection]);
    }
    setSmsCredentials({ accountSid: '', authToken: '', phoneNumber: '', apiKey: '', originator: '' });
    setSmsProvider(null);
    setShowConnectSMS(false);
  };
  
  const handleDisconnectSMS = (connectionId) => {
    if (confirm('Are you sure you want to disconnect this SMS provider?')) {
      setSmsConnections(prev => prev.filter(c => c.id !== connectionId));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 4, padding: 4, background: c.gray[900], borderRadius: r.lg, width: 'fit-content', border: `1px solid ${c.gray[800]}` }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', fontSize: 14, fontWeight: 500, border: 'none', borderRadius: r.md, cursor: 'pointer',
              color: activeTab === tab.id ? c.gray[100] : c.gray[500],
              background: activeTab === tab.id ? tokens.gradients.brandSubtle : 'transparent',
              borderLeft: activeTab === tab.id ? `2px solid ${c.accent.DEFAULT}` : '2px solid transparent',
              transition: tokens.transition.fast,
            }}>
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>
      
      {activeTab === 'sequences' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <Metric label="Total Enrolled" value={fmt.number(stats.enrolled)} icon={Users} />
            <Metric label="Active" value={fmt.number(stats.active)} icon={Activity} />
            <Metric label="Completed" value={fmt.number(stats.completed)} icon={CheckCircle2} />
            <Metric label="Reply Rate" value={`${stats.replyRate}%`} icon={MessageSquare} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Outreach Sequences</h2>
            <Button icon={Plus} variant="gradient" onClick={() => setShowCreate(true)}>Create Sequence</Button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
            {sequences.map(seq => (
              <Card key={seq.id} hover onClick={() => setSelectedSequence(seq)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 4 }}>{seq.name}</h3>
                    <p style={{ fontSize: 13, color: c.gray[500] }}>{seq.steps.length} steps</p>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: r.full, fontSize: 12, fontWeight: 500,
                    background: seq.status === SEQUENCE_STATUS.ACTIVE ? c.success.muted : seq.status === SEQUENCE_STATUS.PAUSED ? c.warning.muted : c.gray[800],
                    color: seq.status === SEQUENCE_STATUS.ACTIVE ? c.success.DEFAULT : seq.status === SEQUENCE_STATUS.PAUSED ? c.warning.DEFAULT : c.gray[400],
                  }}>
                    {seq.status}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {seq.steps.slice(0, 6).map((step, i) => {
                    const Icon = channelIcons[step.channel] || Mail;
                    return (
                      <div key={i} style={{ width: 28, height: 28, borderRadius: r.md, background: channelColors[step.channel] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={14} style={{ color: channelColors[step.channel] }} />
                      </div>
                    );
                  })}
                  {seq.steps.length > 6 && <span style={{ fontSize: 12, color: c.gray[500], alignSelf: 'center' }}>+{seq.steps.length - 6}</span>}
                </div>
                
                <div style={{ display: 'flex', gap: 16 }}>
                  {[
                    { label: 'Enrolled', value: seq.stats.enrolled },
                    { label: 'Active', value: seq.stats.active },
                    { label: 'Replied', value: seq.stats.replied, color: c.success.DEFAULT },
                  ].map(s => (
                    <div key={s.label}>
                      <p style={{ fontSize: 16, fontWeight: 600, color: s.color || c.gray[200] }}>{s.value}</p>
                      <p style={{ fontSize: 11, color: c.gray[500] }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {activeTab === 'email' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Email Accounts</h2>
              <p style={{ fontSize: 13, color: c.gray[500], marginTop: 4 }}>Connect Gmail or Outlook to send sequences</p>
            </div>
            <Button icon={Plus} variant="gradient" onClick={() => setShowConnectEmail(true)}>Connect Account</Button>
          </div>
          
          <Card style={{ background: `linear-gradient(135deg, rgba(242, 76, 3, 0.1) 0%, rgba(49, 72, 185, 0.05) 100%)`, border: `1px solid ${c.accent.DEFAULT}30` }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: r.lg, background: c.accent.DEFAULT + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={20} style={{ color: c.accent.DEFAULT }} />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[100], marginBottom: 4 }}>Protect Your Email Reputation</h3>
                <p style={{ fontSize: 13, color: c.gray[400], lineHeight: 1.5 }}>
                  To avoid spam filters and protect your domain: verify your domain DNS records, complete email warmup before sending at scale, and stay within daily sending limits.
                </p>
              </div>
            </div>
          </Card>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {emailConnections.map(conn => (
              <Card key={conn.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: r.lg, background: conn.providerId === 'gmail' ? '#EA4335' + '20' : '#0078D4' + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={24} style={{ color: conn.providerId === 'gmail' ? '#EA4335' : '#0078D4' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>{conn.email}</h3>
                      <span style={{ padding: '2px 8px', borderRadius: r.full, fontSize: 11, fontWeight: 500, background: c.success.muted, color: c.success.DEFAULT }}>
                        Connected
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: c.gray[500], marginTop: 2 }}>
                      {conn.providerId === 'gmail' ? 'Google Workspace' : 'Microsoft 365'} • Connected {fmt.date(conn.connectedAt)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: c.gray[200] }}>{conn.dailySent} / {conn.dailyLimit}</p>
                    <p style={{ fontSize: 11, color: c.gray[500] }}>Emails today</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" size="sm" onClick={() => { setSelectedEmailAccount(conn); setShowEmailSettings(true); }}>Settings</Button>
                    <Button variant="ghost" size="sm" style={{ color: c.error.DEFAULT }} onClick={() => handleDisconnectEmail(conn.id)}>Disconnect</Button>
                  </div>
                </div>
                
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: c.gray[500] }}>Daily sending limit</span>
                    <span style={{ fontSize: 12, color: c.gray[400] }}>{Math.round((conn.dailySent / conn.dailyLimit) * 100)}%</span>
                  </div>
                  <div style={{ height: 6, background: c.gray[800], borderRadius: r.full, overflow: 'hidden' }}>
                    <div style={{ width: `${(conn.dailySent / conn.dailyLimit) * 100}%`, height: '100%', background: tokens.gradients.brand, transition: 'width 300ms ease' }} />
                  </div>
                </div>
              </Card>
            ))}
            
            {emailConnections.length === 0 && (
              <Card style={{ textAlign: 'center', padding: 40 }}>
                <Mail size={40} style={{ color: c.gray[600], margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[300], marginBottom: 4 }}>No email accounts connected</h3>
                <p style={{ fontSize: 13, color: c.gray[500], marginBottom: 16 }}>Connect Gmail or Outlook to start sending sequences</p>
                <Button icon={Plus} onClick={() => setShowConnectEmail(true)}>Connect Account</Button>
              </Card>
            )}
          </div>
        </>
      )}
      
      {activeTab === 'domains' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Domain Verification</h2>
              <p style={{ fontSize: 13, color: c.gray[500], marginTop: 4 }}>Set up SPF, DKIM, and DMARC to improve deliverability</p>
            </div>
            <Button icon={Plus} variant="gradient" onClick={() => setShowAddDomain(true)}>Add Domain</Button>
          </div>
          
          <Card style={{ background: c.primary[50] }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[100], marginBottom: 8 }}>Why Domain Verification Matters</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { name: 'SPF', desc: 'Authorizes servers to send on your behalf' },
                { name: 'DKIM', desc: 'Cryptographic signature for authenticity' },
                { name: 'DMARC', desc: 'Policy for handling failed authentication' },
              ].map(record => (
                <div key={record.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckCircle2 size={16} style={{ color: c.primary.DEFAULT, marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[200] }}>{record.name}</p>
                    <p style={{ fontSize: 12, color: c.gray[500] }}>{record.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {domains.map(domain => (
              <Card key={domain.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: r.lg, background: domain.status === 'verified' ? c.success.muted : c.warning.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Globe size={22} style={{ color: domain.status === 'verified' ? c.success.DEFAULT : c.warning.DEFAULT }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>{domain.domain}</h3>
                      <p style={{ fontSize: 12, color: c.gray[500] }}>
                        {domain.status === 'verified' ? `Verified ${fmt.date(domain.verifiedAt)}` : 'Pending verification'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {domain.status === 'verified' && (
                      <span style={{ padding: '4px 10px', borderRadius: r.full, fontSize: 12, fontWeight: 500, background: c.success.muted, color: c.success.DEFAULT }}>
                        <CheckCircle2 size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        Verified
                      </span>
                    )}
                    {domain.status !== 'verified' && (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => { setSelectedDomain(domain); setShowDomainSetup(true); }}>View DNS Setup</Button>
                        <Button size="sm" onClick={() => handleVerifyDomain(domain.id)}>Verify DNS</Button>
                      </>
                    )}
                  </div>
                </div>
                
                {domain.status === 'verified' && (
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    {[
                      { name: 'SPF', verified: domain.health.spf },
                      { name: 'DKIM', verified: domain.health.dkim },
                      { name: 'DMARC', verified: domain.health.dmarc },
                      { name: 'Reputation', value: domain.health.reputation },
                    ].map(item => (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {item.value !== undefined ? (
                          <>
                            <span style={{ fontSize: 14, fontWeight: 600, color: item.value >= 80 ? c.success.DEFAULT : c.warning.DEFAULT }}>{item.value}</span>
                            <span style={{ fontSize: 12, color: c.gray[500] }}>{item.name}</span>
                          </>
                        ) : (
                          <>
                            {item.verified ? <CheckCircle2 size={14} style={{ color: c.success.DEFAULT }} /> : <AlertCircle size={14} style={{ color: c.error.DEFAULT }} />}
                            <span style={{ fontSize: 12, color: item.verified ? c.gray[400] : c.error.DEFAULT }}>{item.name}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ background: c.gray[850], borderRadius: r.lg, padding: 14 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: c.gray[400], marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>DNS Records</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(domain.dnsRecords).map(([key, record]) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: c.gray[900], borderRadius: r.md }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: c.gray[500], width: 50 }}>{record.type}</span>
                        <span style={{ fontSize: 12, color: c.gray[400], width: 140, fontFamily: tokens.font.mono }}>{record.host}</span>
                        <span style={{ fontSize: 11, color: c.gray[500], flex: 1, fontFamily: tokens.font.mono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.value}</span>
                        {record.status === 'verified' ? (
                          <CheckCircle2 size={14} style={{ color: c.success.DEFAULT, flexShrink: 0 }} />
                        ) : (
                          <AlertCircle size={14} style={{ color: c.warning.DEFAULT, flexShrink: 0 }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {activeTab === 'warmup' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Email Warmup</h2>
              <p style={{ fontSize: 13, color: c.gray[500], marginTop: 4 }}>Gradually increase sending volume to build reputation</p>
            </div>
          </div>
          
          <Card gradient>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: r.lg, background: tokens.gradients.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TrendingUp size={24} style={{ color: '#fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 6 }}>How Warmup Works</h3>
                <p style={{ fontSize: 13, color: c.gray[400], lineHeight: 1.5 }}>
                  New email accounts have low sender reputation. Warmup gradually increases sending volume while generating positive engagement signals (opens, replies) to build trust with email providers like Gmail and Outlook.
                </p>
                <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                  {[
                    { label: 'Conservative', desc: '4-6 weeks, safest', volume: '5 → 100/day' },
                    { label: 'Moderate', desc: '2-3 weeks, balanced', volume: '10 → 150/day' },
                    { label: 'Aggressive', desc: '1-2 weeks, faster', volume: '20 → 200/day' },
                  ].map(plan => (
                    <div key={plan.label}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[200] }}>{plan.label}</p>
                      <p style={{ fontSize: 11, color: c.gray[500] }}>{plan.desc}</p>
                      <p style={{ fontSize: 11, color: c.primary.light, marginTop: 2 }}>{plan.volume}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
          
          {warmups.map(warmup => (
            <Card key={warmup.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={warmup.email} size={44} />
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>{warmup.email}</h3>
                    <p style={{ fontSize: 12, color: c.gray[500] }}>Day {warmup.currentDay} of {warmup.schedule === 'conservative' ? 42 : warmup.schedule === 'aggressive' ? 14 : 21}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '4px 10px', borderRadius: r.full, fontSize: 12, fontWeight: 500, background: warmup.status === 'in_progress' ? c.success.muted : c.warning.muted, color: warmup.status === 'in_progress' ? c.success.DEFAULT : c.warning.DEFAULT, textTransform: 'capitalize' }}>
                    {warmup.status.replace('_', ' ')}
                  </span>
                  <Button variant="secondary" size="sm" onClick={() => handleToggleWarmup(warmup.id)}>{warmup.status === 'in_progress' ? 'Pause' : 'Resume'}</Button>
                </div>
              </div>
              
              <div style={{ marginBottom: 16, padding: 14, background: c.gray[850], borderRadius: r.lg }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: c.gray[300] }}>Daily Target Volume</span>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedWarmup(warmup); setShowWarmupSettings(true); }}>
                    <Settings size={14} style={{ marginRight: 4 }} /> Customize
                  </Button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="range"
                      min={5}
                      max={warmup.maxVolume || 200}
                      value={warmup.targetVolume}
                      onChange={(e) => handleUpdateWarmupSettings(warmup.id, { targetVolume: parseInt(e.target.value) })}
                      style={{ width: '100%', accentColor: c.primary.DEFAULT }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: c.gray[600], marginTop: 2 }}>
                      <span>5/day</span>
                      <span>Recommended: {warmup.schedule === 'conservative' ? 100 : warmup.schedule === 'aggressive' ? 200 : 150}/day</span>
                      <span>{warmup.maxVolume || 200}/day</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 70 }}>
                    <p style={{ fontSize: 20, fontWeight: 600, color: c.primary.light }}>{warmup.targetVolume}</p>
                    <p style={{ fontSize: 10, color: c.gray[500] }}>emails/day</p>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: c.gray[400] }}>Volume: {warmup.currentVolume} / {warmup.targetVolume} emails/day</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: c.primary.light }}>{Math.round((warmup.currentVolume / warmup.targetVolume) * 100)}%</span>
                </div>
                <div style={{ height: 8, background: c.gray[800], borderRadius: r.full, overflow: 'hidden' }}>
                  <div style={{ width: `${(warmup.currentVolume / warmup.targetVolume) * 100}%`, height: '100%', background: tokens.gradients.brand, transition: 'width 300ms ease' }} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Sent', value: warmup.stats.totalSent },
                  { label: 'Received', value: warmup.stats.totalReceived },
                  { label: 'Bounces', value: warmup.stats.bounces, color: warmup.stats.bounces > 5 ? c.error.DEFAULT : null },
                  { label: 'Spam', value: warmup.stats.spamReports, color: warmup.stats.spamReports > 0 ? c.error.DEFAULT : null },
                  { label: 'Reputation', value: warmup.stats.reputation, color: warmup.stats.reputation >= 70 ? c.success.DEFAULT : c.warning.DEFAULT },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: 'center', padding: 10, background: c.gray[850], borderRadius: r.md }}>
                    <p style={{ fontSize: 18, fontWeight: 600, color: stat.color || c.gray[200] }}>{stat.value}</p>
                    <p style={{ fontSize: 11, color: c.gray[500] }}>{stat.label}</p>
                  </div>
                ))}
              </div>
              
              <div style={{ background: c.gray[850], borderRadius: r.lg, padding: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: c.gray[400], marginBottom: 10 }}>Daily Activity</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
                  {warmup.dailyLogs.slice(-14).map((log, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ height: `${(log.sent / 60) * 50}px`, background: c.primary.DEFAULT, borderRadius: 2, minHeight: 4 }} title={`Sent: ${log.sent}`} />
                      <div style={{ height: `${(log.received / 60) * 50}px`, background: c.success.DEFAULT, borderRadius: 2, minHeight: 4 }} title={`Received: ${log.received}`} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c.primary.DEFAULT }} />
                    <span style={{ fontSize: 11, color: c.gray[500] }}>Sent</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c.success.DEFAULT }} />
                    <span style={{ fontSize: 11, color: c.gray[500] }}>Received</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {emailConnections.filter(c => !warmups.find(w => w.connectionId === c.id)).length > 0 && (
            <Card style={{ textAlign: 'center', padding: 30 }}>
              <TrendingUp size={32} style={{ color: c.gray[600], margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[300], marginBottom: 4 }}>Start Email Warmup</h3>
              <p style={{ fontSize: 13, color: c.gray[500], marginBottom: 16 }}>Select an account to begin warming up</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {emailConnections.filter(c => !warmups.find(w => w.connectionId === c.id)).map(conn => (
                  <Button key={conn.id} variant="secondary" onClick={() => handleStartWarmup(conn.id)}>
                    {conn.email}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
      
      {activeTab === 'sms' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>SMS Integration</h2>
              <p style={{ fontSize: 13, color: c.gray[500], marginTop: 4 }}>Connect Twilio or MessageBird to send SMS in sequences</p>
            </div>
            <Button icon={Plus} variant="gradient" onClick={() => setShowConnectSMS(true)}>Connect Provider</Button>
          </div>
          
          {smsConnections.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 50 }}>
              <MessageSquare size={44} style={{ color: c.gray[600], margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: c.gray[300], marginBottom: 6 }}>No SMS Provider Connected</h3>
              <p style={{ fontSize: 13, color: c.gray[500], marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
                Connect a SMS provider like Twilio to send text messages as part of your outreach sequences.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Button onClick={() => { setSmsProvider('twilio'); setShowConnectSMS(true); }}>
                  <span style={{ width: 16, height: 16, borderRadius: 3, background: '#F22F46', marginRight: 8, display: 'inline-block' }} />
                  Connect Twilio
                </Button>
                <Button variant="secondary" onClick={() => { setSmsProvider('messagebird'); setShowConnectSMS(true); }}>
                  Connect MessageBird
                </Button>
              </div>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {smsConnections.map(conn => (
                <Card key={conn.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: r.lg, background: conn.providerId === 'Twilio' ? '#F22F46' + '20' : '#2481D7' + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare size={24} style={{ color: conn.providerId === 'Twilio' ? '#F22F46' : '#2481D7' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>{conn.providerId}</h3>
                        <span style={{ padding: '2px 8px', borderRadius: r.full, fontSize: 11, fontWeight: 500, background: c.success.muted, color: c.success.DEFAULT }}>Connected</span>
                      </div>
                      <p style={{ fontSize: 13, color: c.gray[500], marginTop: 2 }}>
                        {conn.phoneNumbers?.length || 0} phone number{conn.phoneNumbers?.length !== 1 ? 's' : ''} • Connected {fmt.date(conn.connectedAt)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: c.gray[200] }}>{conn.messagesSent} / {conn.messagesLimit}</p>
                      <p style={{ fontSize: 11, color: c.gray[500] }}>Messages this month</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="secondary" size="sm">Manage</Button>
                      <Button variant="ghost" size="sm" style={{ color: c.error.DEFAULT }} onClick={() => handleDisconnectSMS(conn.id)}>Disconnect</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      
      {showCreate && (
        <ModalOverlay onClose={() => setShowCreate(false)} maxWidth={520}>
          <Card padding={24}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100], marginBottom: 6, fontFamily: tokens.font.heading }}>Create Sequence</h2>
            <p style={{ fontSize: 13, color: c.gray[500], marginBottom: 20 }}>Choose a template or start from scratch</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {SEQUENCE_TEMPLATES.map(template => (
                <button key={template.id} onClick={() => handleCreateFromTemplate(template)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: c.gray[850], border: `1px solid ${c.gray[800]}`, borderRadius: r.lg, cursor: 'pointer', textAlign: 'left', transition: tokens.transition.fast }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = c.primary.DEFAULT}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = c.gray[800]}>
                  <div style={{ width: 40, height: 40, borderRadius: r.md, background: c.primary[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={20} style={{ color: c.primary.DEFAULT }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100] }}>{template.name}</p>
                    <p style={{ fontSize: 12, color: c.gray[500] }}>{template.description}</p>
                  </div>
                  <span style={{ fontSize: 12, color: c.gray[500] }}>{template.steps.length} steps</span>
                </button>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button variant="gradient" style={{ flex: 1 }} icon={Plus} onClick={handleCreateBlank}>Blank Sequence</Button>
            </div>
          </Card>
        </ModalOverlay>
      )}
      
      {showConnectEmail && (
        <ModalOverlay onClose={() => setShowConnectEmail(false)} maxWidth={480}>
          <Card padding={24}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100], marginBottom: 6, fontFamily: tokens.font.heading }}>Connect Email Account</h2>
            <p style={{ fontSize: 13, color: c.gray[500], marginBottom: 20 }}>Choose your email provider to connect</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { id: 'gmail', name: 'Gmail / Google Workspace', color: '#EA4335', limit: '500 emails/day' },
                { id: 'outlook', name: 'Microsoft Outlook / 365', color: '#0078D4', limit: '10,000 emails/day' },
              ].map(provider => (
                <button key={provider.id} onClick={() => handleConnectEmail(provider.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: c.gray[850], border: `1px solid ${c.gray[800]}`, borderRadius: r.lg, cursor: 'pointer', textAlign: 'left', transition: tokens.transition.fast }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = provider.color}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = c.gray[800]}>
                  <div style={{ width: 44, height: 44, borderRadius: r.lg, background: provider.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={22} style={{ color: provider.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100] }}>{provider.name}</p>
                    <p style={{ fontSize: 12, color: c.gray[500] }}>Limit: {provider.limit}</p>
                  </div>
                  <ChevronRight size={18} style={{ color: c.gray[500] }} />
                </button>
              ))}
            </div>
            
            <div style={{ marginTop: 20, padding: 14, background: c.gray[850], borderRadius: r.lg }}>
              <p style={{ fontSize: 12, color: c.gray[400], lineHeight: 1.5 }}>
                <strong style={{ color: c.gray[300] }}>Note:</strong> We use OAuth for secure authentication. We never store your password and you can revoke access at any time.
              </p>
            </div>
            
            <Button variant="secondary" fullWidth style={{ marginTop: 16 }} onClick={() => setShowConnectEmail(false)}>Cancel</Button>
          </Card>
        </ModalOverlay>
      )}
      
      {showAddDomain && (
        <ModalOverlay onClose={() => setShowAddDomain(false)} maxWidth={480}>
          <Card padding={24}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100], marginBottom: 6, fontFamily: tokens.font.heading }}>Add Domain</h2>
            <p style={{ fontSize: 13, color: c.gray[500], marginBottom: 20 }}>Enter your sending domain to verify DNS records</p>
            
            <Input
              label="Domain"
              placeholder="yourdomain.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
            />
            
            <div style={{ marginTop: 20, padding: 14, background: c.gray[850], borderRadius: r.lg }}>
              <p style={{ fontSize: 12, color: c.gray[400], lineHeight: 1.5 }}>
                After adding, you'll need to add DNS records to your domain registrar (GoDaddy, Cloudflare, Namecheap, etc.) to verify ownership and enable email authentication.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowAddDomain(false)}>Cancel</Button>
              <Button variant="gradient" style={{ flex: 1 }} onClick={handleAddDomainWithSetup} disabled={!newDomain.trim()}>Add Domain</Button>
            </div>
          </Card>
        </ModalOverlay>
      )}
      
      {selectedSequence && !editingSequence && (
        <div onClick={() => setSelectedSequence(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24, paddingTop: 40, zIndex: 100, overflowY: 'auto' }}>
          <Card onClick={(e) => e.stopPropagation()} padding={0} style={{ width: '100%', maxWidth: 700 }}>
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], marginBottom: 4 }}>{selectedSequence.name}</h2>
                <p style={{ fontSize: 13, color: c.gray[500] }}>{selectedSequence.description || 'No description'}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{
                  padding: '6px 12px', borderRadius: r.full, fontSize: 12, fontWeight: 500,
                  background: selectedSequence.status === SEQUENCE_STATUS.ACTIVE ? c.success.muted : selectedSequence.status === SEQUENCE_STATUS.PAUSED ? c.warning.muted : c.gray[800],
                  color: selectedSequence.status === SEQUENCE_STATUS.ACTIVE ? c.success.DEFAULT : selectedSequence.status === SEQUENCE_STATUS.PAUSED ? c.warning.DEFAULT : c.gray[400],
                }}>
                  {selectedSequence.status}
                </span>
                <button onClick={() => setSelectedSequence(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} style={{ color: c.gray[500] }} />
                </button>
              </div>
            </div>
            
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, background: c.gray[800] }}>
              {[
                { label: 'Enrolled', value: selectedSequence.stats.enrolled },
                { label: 'Active', value: selectedSequence.stats.active },
                { label: 'Completed', value: selectedSequence.stats.completed },
                { label: 'Replied', value: selectedSequence.stats.replied },
                { label: 'Meetings', value: selectedSequence.stats.meetings },
              ].map(stat => (
                <div key={stat.label} style={{ padding: 16, background: c.gray[900], textAlign: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 600, color: c.gray[100] }}>{stat.value}</p>
                  <p style={{ fontSize: 11, color: c.gray[500] }}>{stat.label}</p>
                </div>
              ))}
            </div>
            
            {/* Steps */}
            <div style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[300], marginBottom: 16 }}>Sequence Steps</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedSequence.steps.map((step, i) => {
                  const Icon = channelIcons[step.channel] || Mail;
                  return (
                    <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      {/* Timeline */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: channelColors[step.channel] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={18} style={{ color: channelColors[step.channel] }} />
                        </div>
                        {i < selectedSequence.steps.length - 1 && (
                          <div style={{ width: 2, height: 40, background: c.gray[800], marginTop: 8 }} />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div style={{ flex: 1, padding: 14, background: c.gray[850], borderRadius: r.lg, border: `1px solid ${c.gray[800]}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: c.gray[200] }}>
                            Step {i + 1}: {step.channel.charAt(0).toUpperCase() + step.channel.slice(1)}
                          </span>
                          <span style={{ fontSize: 12, color: c.gray[500] }}>
                            {step.delayDays === 0 ? 'Immediately' : `Day ${step.delayDays}`}
                          </span>
                        </div>
                        {step.subject && (
                          <p style={{ fontSize: 13, color: c.gray[400], marginBottom: 4 }}>
                            Subject: {step.subject}
                          </p>
                        )}
                        {step.body && (
                          <p style={{ fontSize: 12, color: c.gray[500], lineHeight: 1.5, maxHeight: 60, overflow: 'hidden' }}>
                            {step.body.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Actions */}
            <div style={{ padding: 20, borderTop: `1px solid ${c.gray[800]}`, display: 'flex', gap: 10 }}>
              <Button 
                variant={selectedSequence.status === SEQUENCE_STATUS.ACTIVE ? 'secondary' : 'primary'}
                style={{ flex: 1 }}
                onClick={() => { toggleSequenceStatus(selectedSequence); setSelectedSequence({...selectedSequence}); }}
              >
                {selectedSequence.status === SEQUENCE_STATUS.ACTIVE ? 'Pause Sequence' : 'Activate Sequence'}
              </Button>
              <Button variant="secondary" icon={Edit2} onClick={() => { setEditingSequence(selectedSequence); setSelectedSequence(null); }}>
                Edit
              </Button>
              <Button variant="secondary" icon={Users} onClick={() => { openEnrollModal(selectedSequence.id); setSelectedSequence(null); }}>
                Enroll
              </Button>
              <Button variant="ghost" onClick={() => { deleteSequence(selectedSequence.id); }}>
                <Trash2 size={18} style={{ color: c.error.DEFAULT }} />
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      {/* Sequence Builder/Editor Modal */}
      {editingSequence && (
        <SequenceBuilder 
          sequence={editingSequence} 
          onSave={(updated) => {
            sequenceEngine.sequences.set(updated.id, updated);
            refreshSequences();
            setEditingSequence(null);
          }}
          onClose={() => setEditingSequence(null)}
          channelIcons={channelIcons}
          channelColors={channelColors}
        />
      )}
      
      {/* Enroll Leads Modal */}
      {showEnrollModal && (
        <EnrollLeadsModal
          sequenceId={enrollSequenceId}
          onClose={() => { setShowEnrollModal(false); setEnrollSequenceId(null); }}
          onEnroll={() => { refreshSequences(); setShowEnrollModal(false); setEnrollSequenceId(null); }}
        />
      )}
      
      {/* Email Account Settings Modal */}
      {showEmailSettings && selectedEmailAccount && (
        <ModalOverlay onClose={() => { setShowEmailSettings(false); setSelectedEmailAccount(null); }} maxWidth={500}>
          <Card padding={0}>
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Email Account Settings</h2>
              <button onClick={() => { setShowEmailSettings(false); setSelectedEmailAccount(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: c.gray[500] }} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 14, background: c.gray[850], borderRadius: r.lg }}>
                <div style={{ width: 44, height: 44, borderRadius: r.lg, background: selectedEmailAccount.providerId === 'gmail' ? '#EA4335' + '20' : '#0078D4' + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={22} style={{ color: selectedEmailAccount.providerId === 'gmail' ? '#EA4335' : '#0078D4' }} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>{selectedEmailAccount.email}</p>
                  <p style={{ fontSize: 12, color: c.gray[500] }}>{selectedEmailAccount.providerId === 'gmail' ? 'Google Workspace' : 'Microsoft 365'}</p>
                </div>
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 8 }}>Daily Sending Limit</label>
                <input
                  type="number"
                  min={10}
                  max={selectedEmailAccount.providerId === 'gmail' ? 500 : 10000}
                  value={selectedEmailAccount.dailyLimit}
                  onChange={(e) => setSelectedEmailAccount({ ...selectedEmailAccount, dailyLimit: parseInt(e.target.value) || 100 })}
                  style={{ width: '100%', padding: '10px 14px', background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], fontSize: 14 }}
                />
                <p style={{ fontSize: 11, color: c.gray[500], marginTop: 6 }}>
                  Maximum: {selectedEmailAccount.providerId === 'gmail' ? '500' : '10,000'} emails/day. Lower limits help protect your sender reputation.
                </p>
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: c.primary.DEFAULT }} />
                  <div>
                    <p style={{ fontSize: 13, color: c.gray[200] }}>Track email opens</p>
                    <p style={{ fontSize: 11, color: c.gray[500] }}>Add invisible pixel to track when recipients open emails</p>
                  </div>
                </label>
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: c.primary.DEFAULT }} />
                  <div>
                    <p style={{ fontSize: 13, color: c.gray[200] }}>Track link clicks</p>
                    <p style={{ fontSize: 11, color: c.gray[500] }}>Track when recipients click links in your emails</p>
                  </div>
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" style={{ flex: 1 }} onClick={() => { setShowEmailSettings(false); setSelectedEmailAccount(null); }}>Cancel</Button>
                <Button variant="gradient" style={{ flex: 1 }} onClick={() => handleUpdateEmailSettings(selectedEmailAccount.id, { dailyLimit: selectedEmailAccount.dailyLimit })}>Save Settings</Button>
              </div>
            </div>
          </Card>
        </ModalOverlay>
      )}
      
      {/* Domain DNS Setup Modal */}
      {showDomainSetup && selectedDomain && (
        <ModalOverlay onClose={() => { setShowDomainSetup(false); setSelectedDomain(null); }} maxWidth={700}>
          <Card padding={0}>
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Configure DNS Records</h2>
                <p style={{ fontSize: 13, color: c.gray[500], marginTop: 2 }}>{selectedDomain.domain}</p>
              </div>
              <button onClick={() => { setShowDomainSetup(false); setSelectedDomain(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: c.gray[500] }} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              {/* Instructions */}
              <div style={{ padding: 14, background: c.primary[50], borderRadius: r.lg, marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[100], marginBottom: 6 }}>Setup Instructions</h3>
                <ol style={{ fontSize: 13, color: c.gray[400], lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
                  <li>Log into your domain registrar (GoDaddy, Cloudflare, Namecheap, etc.)</li>
                  <li>Navigate to DNS settings for <strong style={{ color: c.gray[200] }}>{selectedDomain.domain}</strong></li>
                  <li>Add each DNS record below exactly as shown</li>
                  <li>Wait 5-10 minutes for DNS propagation</li>
                  <li>Click "Verify Records" to confirm setup</li>
                </ol>
              </div>
              
              {/* DNS Records */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(selectedDomain.dnsRecords).map(([key, record]) => (
                  <div key={key} style={{ background: c.gray[850], borderRadius: r.lg, padding: 16, border: `1px solid ${record.status === 'verified' ? c.success.DEFAULT + '40' : c.gray[800]}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: c.gray[100], textTransform: 'uppercase' }}>{key}</span>
                        {record.required && <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 6px', background: c.error.muted, color: c.error.DEFAULT, borderRadius: r.sm }}>Required</span>}
                      </div>
                      {record.status === 'verified' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: c.success.DEFAULT }}>
                          <CheckCircle2 size={14} /> Verified
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: c.warning.DEFAULT }}>
                          <Clock size={14} /> Pending
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 10, color: c.gray[600], marginBottom: 4, textTransform: 'uppercase' }}>Type</p>
                        <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[200], fontFamily: tokens.font.mono }}>{record.type}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: c.gray[600], marginBottom: 4, textTransform: 'uppercase' }}>Host / Name</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <p style={{ fontSize: 13, color: c.gray[300], fontFamily: tokens.font.mono }}>{record.host}</p>
                          <button onClick={() => copyToClipboard(record.host)} style={{ padding: 4, background: c.gray[700], border: 'none', borderRadius: r.sm, cursor: 'pointer' }}>
                            <FileText size={12} style={{ color: c.gray[400] }} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: 12 }}>
                      <p style={{ fontSize: 10, color: c.gray[600], marginBottom: 4, textTransform: 'uppercase' }}>Value / Points To</p>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: c.gray[900], padding: 10, borderRadius: r.md }}>
                        <p style={{ flex: 1, fontSize: 12, color: c.gray[300], fontFamily: tokens.font.mono, wordBreak: 'break-all', lineHeight: 1.5 }}>{record.value}</p>
                        <button onClick={() => copyToClipboard(record.value)} style={{ padding: 6, background: c.gray[700], border: 'none', borderRadius: r.sm, cursor: 'pointer', flexShrink: 0 }}>
                          <FileText size={14} style={{ color: c.gray[400] }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <Button variant="secondary" style={{ flex: 1 }} onClick={() => { setShowDomainSetup(false); setSelectedDomain(null); }}>Done</Button>
                <Button variant="gradient" style={{ flex: 1 }} onClick={() => { handleVerifyDomain(selectedDomain.id); setSelectedDomain(domains.find(d => d.id === selectedDomain.id) || selectedDomain); }}>
                  <RefreshCw size={16} style={{ marginRight: 6 }} /> Verify Records
                </Button>
              </div>
            </div>
          </Card>
        </ModalOverlay>
      )}
      
      {/* Warmup Settings Modal */}
      {showWarmupSettings && selectedWarmup && (
        <ModalOverlay onClose={() => { setShowWarmupSettings(false); setSelectedWarmup(null); }} maxWidth={500}>
          <Card padding={0}>
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Warmup Settings</h2>
              <button onClick={() => { setShowWarmupSettings(false); setSelectedWarmup(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: c.gray[500] }} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 14, background: c.gray[850], borderRadius: r.lg }}>
                <Avatar name={selectedWarmup.email} size={44} />
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>{selectedWarmup.email}</p>
                  <p style={{ fontSize: 12, color: c.gray[500] }}>Day {selectedWarmup.currentDay} • {selectedWarmup.schedule} schedule</p>
                </div>
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 8 }}>Target Daily Volume</label>
                <input
                  type="number"
                  min={5}
                  max={selectedWarmup.maxVolume || 200}
                  value={selectedWarmup.targetVolume}
                  onChange={(e) => setSelectedWarmup({ ...selectedWarmup, targetVolume: parseInt(e.target.value) || 50 })}
                  style={{ width: '100%', padding: '10px 14px', background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], fontSize: 14 }}
                />
                <p style={{ fontSize: 11, color: c.gray[500], marginTop: 6 }}>
                  Recommended for {selectedWarmup.schedule} schedule: {selectedWarmup.schedule === 'conservative' ? 100 : selectedWarmup.schedule === 'aggressive' ? 200 : 150} emails/day
                </p>
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 8 }}>Warmup Schedule</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['conservative', 'moderate', 'aggressive'].map(schedule => (
                    <button
                      key={schedule}
                      onClick={() => setSelectedWarmup({ 
                        ...selectedWarmup, 
                        schedule,
                        maxVolume: schedule === 'conservative' ? 100 : schedule === 'aggressive' ? 200 : 150,
                        targetVolume: Math.min(selectedWarmup.targetVolume, schedule === 'conservative' ? 100 : schedule === 'aggressive' ? 200 : 150)
                      })}
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: r.md, border: `1px solid ${selectedWarmup.schedule === schedule ? c.primary.DEFAULT : c.gray[700]}`,
                        background: selectedWarmup.schedule === schedule ? c.primary[100] : c.gray[850], cursor: 'pointer',
                      }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: selectedWarmup.schedule === schedule ? c.primary.DEFAULT : c.gray[300], textTransform: 'capitalize' }}>{schedule}</p>
                      <p style={{ fontSize: 10, color: c.gray[500], marginTop: 2 }}>
                        {schedule === 'conservative' ? '4-6 weeks' : schedule === 'aggressive' ? '1-2 weeks' : '2-3 weeks'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" style={{ flex: 1 }} onClick={() => { setShowWarmupSettings(false); setSelectedWarmup(null); }}>Cancel</Button>
                <Button variant="gradient" style={{ flex: 1 }} onClick={() => handleUpdateWarmupSettings(selectedWarmup.id, { targetVolume: selectedWarmup.targetVolume, schedule: selectedWarmup.schedule, maxVolume: selectedWarmup.maxVolume })}>Save Settings</Button>
              </div>
            </div>
          </Card>
        </ModalOverlay>
      )}
      
      {/* Connect SMS Provider Modal */}
      {showConnectSMS && (
        <ModalOverlay onClose={() => { setShowConnectSMS(false); setSmsProvider(null); setSmsCredentials({ accountSid: '', authToken: '', phoneNumber: '', apiKey: '', originator: '' }); }} maxWidth={500}>
          <Card padding={0}>
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>
                {smsProvider ? `Connect ${smsProvider === 'twilio' ? 'Twilio' : 'MessageBird'}` : 'Connect SMS Provider'}
              </h2>
              <button onClick={() => { setShowConnectSMS(false); setSmsProvider(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: c.gray[500] }} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              {/* Provider Selection */}
              {!smsProvider && (
                <>
                  <p style={{ fontSize: 13, color: c.gray[500], marginBottom: 16 }}>Choose your SMS provider to connect</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button onClick={() => setSmsProvider('twilio')}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: c.gray[850], border: `1px solid ${c.gray[800]}`, borderRadius: r.lg, cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ width: 44, height: 44, borderRadius: r.lg, background: '#F22F46' + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MessageSquare size={22} style={{ color: '#F22F46' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100] }}>Twilio</p>
                        <p style={{ fontSize: 12, color: c.gray[500] }}>Industry-leading reliability and global coverage</p>
                      </div>
                      <ChevronRight size={18} style={{ color: c.gray[500] }} />
                    </button>
                    <button onClick={() => setSmsProvider('messagebird')}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: c.gray[850], border: `1px solid ${c.gray[800]}`, borderRadius: r.lg, cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ width: 44, height: 44, borderRadius: r.lg, background: '#2481D7' + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MessageSquare size={22} style={{ color: '#2481D7' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100] }}>MessageBird</p>
                        <p style={{ fontSize: 12, color: c.gray[500] }}>European provider with competitive rates</p>
                      </div>
                      <ChevronRight size={18} style={{ color: c.gray[500] }} />
                    </button>
                  </div>
                </>
              )}
              
              {/* Twilio Form */}
              {smsProvider === 'twilio' && (
                <>
                  <div style={{ padding: 14, background: '#F22F46' + '10', borderRadius: r.lg, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: r.md, background: '#F22F46' + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare size={20} style={{ color: '#F22F46' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[100] }}>Twilio</p>
                      <p style={{ fontSize: 11, color: c.gray[500] }}>Find credentials in your Twilio Console</p>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Account SID *</label>
                    <input
                      type="text"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={smsCredentials.accountSid}
                      onChange={(e) => setSmsCredentials({ ...smsCredentials, accountSid: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], fontSize: 14, fontFamily: tokens.font.mono }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Auth Token *</label>
                    <input
                      type="password"
                      placeholder="Your Twilio Auth Token"
                      value={smsCredentials.authToken}
                      onChange={(e) => setSmsCredentials({ ...smsCredentials, authToken: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], fontSize: 14 }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Phone Number *</label>
                    <input
                      type="text"
                      placeholder="+1234567890"
                      value={smsCredentials.phoneNumber}
                      onChange={(e) => setSmsCredentials({ ...smsCredentials, phoneNumber: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], fontSize: 14 }}
                    />
                    <p style={{ fontSize: 11, color: c.gray[500], marginTop: 6 }}>Your Twilio phone number with country code</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="secondary" style={{ flex: 1 }} onClick={() => setSmsProvider(null)}>Back</Button>
                    <Button variant="gradient" style={{ flex: 1 }} onClick={() => handleConnectSMS('twilio')} disabled={!smsCredentials.accountSid || !smsCredentials.authToken || !smsCredentials.phoneNumber}>Connect Twilio</Button>
                  </div>
                </>
              )}
              
              {/* MessageBird Form */}
              {smsProvider === 'messagebird' && (
                <>
                  <div style={{ padding: 14, background: '#2481D7' + '10', borderRadius: r.lg, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: r.md, background: '#2481D7' + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare size={20} style={{ color: '#2481D7' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[100] }}>MessageBird</p>
                      <p style={{ fontSize: 11, color: c.gray[500] }}>Find your API key in the MessageBird Dashboard</p>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>API Key *</label>
                    <input
                      type="password"
                      placeholder="Your MessageBird API Key"
                      value={smsCredentials.apiKey}
                      onChange={(e) => setSmsCredentials({ ...smsCredentials, apiKey: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], fontSize: 14 }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Originator (Sender ID) *</label>
                    <input
                      type="text"
                      placeholder="+1234567890 or YourBrand"
                      value={smsCredentials.originator}
                      onChange={(e) => setSmsCredentials({ ...smsCredentials, originator: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], fontSize: 14 }}
                    />
                    <p style={{ fontSize: 11, color: c.gray[500], marginTop: 6 }}>Phone number or alphanumeric sender ID (max 11 characters)</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="secondary" style={{ flex: 1 }} onClick={() => setSmsProvider(null)}>Back</Button>
                    <Button variant="gradient" style={{ flex: 1 }} onClick={() => handleConnectSMS('messagebird')} disabled={!smsCredentials.apiKey || !smsCredentials.originator}>Connect MessageBird</Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </ModalOverlay>
      )}
    </div>
  );
};