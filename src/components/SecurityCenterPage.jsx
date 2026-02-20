import { useState } from 'react';
import { Trash2, Shield, Lock, Activity, Briefcase, Eye, FileText, CheckCircle2, AlertCircle, Download, Phone, RefreshCw } from 'lucide-react';
import { Card } from './UI/Card';
import { Button } from './UI/Button';
import { tokens, r, c } from '../styles/theme';
import {Input } from './UI/Input';
import {fmt} from '../utils/formatters';
import { ModalOverlay } from './Layout/ModalOverlay';

export const SecurityCenterPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Security state
  const [securityHealth, setSecurityHealth] = useState({
    status: 'healthy',
    score: 85,
    lastChecked: new Date().toISOString(),
  });
  
  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  
  // Sessions state
  const [sessions, setSessions] = useState([
    { id: 'session_1', device: 'Chrome on Windows', location: 'Charlotte, NC', lastActive: new Date().toISOString(), current: true, ip: '192.168.1.xxx' },
    { id: 'session_2', device: 'Safari on iPhone', location: 'Charlotte, NC', lastActive: new Date(Date.now() - 2 * 3600000).toISOString(), current: false, ip: '192.168.1.xxx' },
    { id: 'session_3', device: 'Firefox on MacOS', location: 'New York, NY', lastActive: new Date(Date.now() - 24 * 3600000).toISOString(), current: false, ip: '10.0.0.xxx' },
  ]);
  
  // Data access log state
  const [accessLogs, setAccessLogs] = useState([
    { id: 'log_1', action: 'view', dataType: 'leads', timestamp: new Date().toISOString(), details: 'Viewed lead list' },
    { id: 'log_2', action: 'export', dataType: 'leads', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Exported 150 leads to CSV' },
    { id: 'log_3', action: 'modify', dataType: 'settings', timestamp: new Date(Date.now() - 7200000).toISOString(), details: 'Updated notification preferences' },
    { id: 'log_4', action: 'view', dataType: 'analytics', timestamp: new Date(Date.now() - 86400000).toISOString(), details: 'Viewed dashboard analytics' },
  ]);
  
  // Security alerts
  const [securityAlerts, setSecurityAlerts] = useState([
    { id: 'alert_1', severity: 'info', message: 'Password last changed 45 days ago', timestamp: new Date().toISOString(), dismissed: false },
  ]);
  
  // Trusted devices
  const [trustedDevices, setTrustedDevices] = useState([
    { id: 'dev_1', name: 'Work Laptop', type: 'laptop', browser: 'Chrome', os: 'Windows 11', registeredAt: new Date(Date.now() - 30 * 86400000).toISOString(), lastUsed: new Date().toISOString() },
    { id: 'dev_2', name: 'iPhone 15 Pro', type: 'mobile', browser: 'Safari', os: 'iOS 17', registeredAt: new Date(Date.now() - 60 * 86400000).toISOString(), lastUsed: new Date(Date.now() - 86400000).toISOString() },
  ]);
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    dataRetention: 365,
    shareAnalytics: false,
    marketingEmails: true,
    activityTracking: true,
  });
  
  // Export data state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  
  // Delete data state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const tabs = [
    { id: 'overview', label: 'Security Overview', icon: Shield },
    { id: 'authentication', label: 'Authentication', icon: Lock },
    { id: 'sessions', label: 'Active Sessions', icon: Activity },
    { id: 'devices', label: 'Trusted Devices', icon: Briefcase },
    { id: 'privacy', label: 'Privacy & Data', icon: Eye },
    { id: 'logs', label: 'Access Logs', icon: FileText },
  ];
  
  // Handle 2FA setup
  const handleSetup2FA = () => {
    const secret = 'JBSWY3DPEHPK3PXP'; // Mock secret
    const backupCodes = ['A1B2C3D4', 'E5F6G7H8', 'I9J0K1L2', 'M3N4O5P6', 'Q7R8S9T0'];
    setTwoFASecret({ secret, backupCodes, qrUrl: `otpauth://totp/LeadGenPro:${user.email}?secret=${secret}&issuer=BluestarAI` });
    setShowSetup2FA(true);
  };
  
  const handleVerify2FA = () => {
    if (verificationCode.length === 6) {
      setTwoFAEnabled(true);
      setShowSetup2FA(false);
      setVerificationCode('');
    }
  };
  
  const handleDisable2FA = () => {
    if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      setTwoFAEnabled(false);
      setTwoFASecret(null);
    }
  };
  
  // Handle session management
  const revokeSession = (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };
  
  const revokeAllSessions = () => {
    if (confirm('This will log you out of all other devices. Continue?')) {
      setSessions(prev => prev.filter(s => s.current));
    }
  };
  
  // Handle device management
  const removeDevice = (deviceId) => {
    setTrustedDevices(prev => prev.filter(d => d.id !== deviceId));
  };
  
  // Handle data export
  const handleExportData = () => {
    setIsExporting(true);
    setExportProgress(0);
    
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setTimeout(() => {
            setShowExportModal(false);
            alert('Your data export is ready for download.');
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };
  
  // Handle data deletion
  const handleDeleteData = () => {
    if (deleteConfirmText === 'DELETE MY DATA') {
      alert('Data deletion request submitted. You will receive a confirmation email within 24 hours.');
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    }
  };
  
  // Handle change password
  const handleChangePassword = () => {
    setPasswordError('');
    setPasswordSuccess(false);
    
    if (passwordForm.current.length < 8) {
      setPasswordError('Current password is incorrect');
      return;
    }
    if (passwordForm.new.length < 12) {
      setPasswordError('New password must be at least 12 characters');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (!/[A-Z]/.test(passwordForm.new) || !/[a-z]/.test(passwordForm.new) || !/\d/.test(passwordForm.new) || !/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.new)) {
      setPasswordError('Password must include uppercase, lowercase, number, and special character');
      return;
    }
    
    // Success
    setPasswordSuccess(true);
    setPasswordForm({ current: '', new: '', confirm: '' });
    setTimeout(() => {
      setShowChangePassword(false);
      setPasswordSuccess(false);
    }, 2000);
  };
  
  // Handle export access logs
  const handleExportAccessLogs = () => {
    const headers = ['ID', 'Action', 'Data Type', 'Details', 'Timestamp'];
    const rows = accessLogs.map(l => [l.id, l.action, l.dataType, l.details, l.timestamp]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Handle export user data with actual data
  const handleExportUserData = () => {
    setIsExporting(true);
    setExportProgress(0);
    
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Generate actual export data
          const exportData = {
            exportedAt: new Date().toISOString(),
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              company: user.company,
            },
            securitySettings: {
              twoFactorEnabled: twoFAEnabled,
              trustedDevices: trustedDevices.length,
              activeSessions: sessions.length,
            },
            privacySettings: privacySettings,
            accessHistory: accessLogs,
            securityAlerts: securityAlerts,
          };
          
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `user_data_export_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          
          setIsExporting(false);
          setTimeout(() => setShowExportModal(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  
  const getSecurityScoreColor = (score) => {
    if (score >= 80) return c.success.DEFAULT;
    if (score >= 60) return c.warning.DEFAULT;
    return c.error.DEFAULT;
  };
  
  const actionColors = {
    view: c.primary.DEFAULT,
    export: c.accent.DEFAULT,
    modify: c.warning.DEFAULT,
    delete: c.error.DEFAULT,
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: c.gray[900], borderRadius: r.lg, width: 'fit-content', border: `1px solid ${c.gray[800]}`, overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', fontSize: 14, fontWeight: 500, border: 'none', borderRadius: r.md, cursor: 'pointer',
              color: activeTab === tab.id ? c.gray[100] : c.gray[500],
              background: activeTab === tab.id ? tokens.gradients.brandSubtle : 'transparent',
              borderLeft: activeTab === tab.id ? `2px solid ${c.accent.DEFAULT}` : '2px solid transparent',
              transition: tokens.transition.fast, whiteSpace: 'nowrap',
            }}>
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* ========== SECURITY OVERVIEW TAB ========== */}
      {activeTab === 'overview' && (
        <>
          {/* Security Score Card */}
          <Card gradient>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke={c.gray[800]} strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={getSecurityScoreColor(securityHealth.score)} strokeWidth="10" 
                    strokeDasharray={`${securityHealth.score * 3.14} 314`} strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: getSecurityScoreColor(securityHealth.score) }}>{securityHealth.score}</span>
                  <span style={{ fontSize: 11, color: c.gray[500] }}>Score</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Shield size={24} style={{ color: getSecurityScoreColor(securityHealth.score) }} />
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>
                    {securityHealth.status === 'healthy' ? 'Your account is secure' : 'Security improvements needed'}
                  </h2>
                </div>
                <p style={{ fontSize: 14, color: c.gray[400], marginBottom: 16, lineHeight: 1.5 }}>
                  Your security score is based on password strength, two-factor authentication, session management, and recent activity patterns.
                </p>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {twoFAEnabled ? <CheckCircle2 size={16} style={{ color: c.success.DEFAULT }} /> : <AlertCircle size={16} style={{ color: c.warning.DEFAULT }} />}
                    <span style={{ fontSize: 13, color: c.gray[300] }}>2FA {twoFAEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} style={{ color: c.success.DEFAULT }} />
                    <span style={{ fontSize: 13, color: c.gray[300] }}>{sessions.length} Active Sessions</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} style={{ color: c.success.DEFAULT }} />
                    <span style={{ fontSize: 13, color: c.gray[300] }}>{trustedDevices.length} Trusted Devices</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Security Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: r.lg, background: c.success.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={22} style={{ color: c.success.DEFAULT }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: c.gray[500] }}>Password Strength</p>
                  <p style={{ fontSize: 18, fontWeight: 600, color: c.success.DEFAULT }}>Strong</p>
                </div>
              </div>
            </Card>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: r.lg, background: twoFAEnabled ? c.success.muted : c.warning.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={22} style={{ color: twoFAEnabled ? c.success.DEFAULT : c.warning.DEFAULT }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: c.gray[500] }}>Two-Factor Auth</p>
                  <p style={{ fontSize: 18, fontWeight: 600, color: twoFAEnabled ? c.success.DEFAULT : c.warning.DEFAULT }}>{twoFAEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: r.lg, background: c.primary[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={22} style={{ color: c.primary.DEFAULT }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: c.gray[500] }}>Active Sessions</p>
                  <p style={{ fontSize: 18, fontWeight: 600, color: c.gray[100] }}>{sessions.length}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: r.lg, background: c.accent.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={22} style={{ color: c.accent.DEFAULT }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: c.gray[500] }}>Data Accesses (24h)</p>
                  <p style={{ fontSize: 18, fontWeight: 600, color: c.gray[100] }}>{accessLogs.filter(l => new Date(l.timestamp) > new Date(Date.now() - 86400000)).length}</p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Security Alerts */}
          {securityAlerts.filter(a => !a.dismissed).length > 0 && (
            <Card>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 16, fontFamily: tokens.font.heading }}>Security Recommendations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {securityAlerts.filter(a => !a.dismissed).map(alert => (
                  <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: c.gray[850], borderRadius: r.md, border: `1px solid ${c.gray[800]}` }}>
                    <AlertCircle size={18} style={{ color: alert.severity === 'warning' ? c.warning.DEFAULT : c.primary.light, flexShrink: 0 }} />
                    <p style={{ flex: 1, fontSize: 13, color: c.gray[300] }}>{alert.message}</p>
                    <Button variant="ghost" size="sm" onClick={() => setSecurityAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, dismissed: true } : a))}>Dismiss</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {/* Quick Actions */}
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 16, fontFamily: tokens.font.heading }}>Quick Security Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <Button variant="secondary" onClick={() => setActiveTab('authentication')}>
                <Lock size={16} style={{ marginRight: 8 }} /> Change Password
              </Button>
              <Button variant="secondary" onClick={() => twoFAEnabled ? setActiveTab('authentication') : handleSetup2FA()}>
                <Shield size={16} style={{ marginRight: 8 }} /> {twoFAEnabled ? 'Manage 2FA' : 'Enable 2FA'}
              </Button>
              <Button variant="secondary" onClick={() => setActiveTab('sessions')}>
                <Activity size={16} style={{ marginRight: 8 }} /> Review Sessions
              </Button>
              <Button variant="secondary" onClick={() => setShowExportModal(true)}>
                <Download size={16} style={{ marginRight: 8 }} /> Export My Data
              </Button>
            </div>
          </Card>
        </>
      )}
      
      {/* ========== AUTHENTICATION TAB ========== */}
      {activeTab === 'authentication' && (
        <>
          {/* Password Section */}
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 16, fontFamily: tokens.font.heading }}>Password</h3>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: c.gray[400], marginBottom: 8 }}>Last changed: 45 days ago</p>
                <p style={{ fontSize: 13, color: c.gray[500], lineHeight: 1.5 }}>
                  We recommend changing your password every 90 days. Use a strong, unique password that you don't use elsewhere.
                </p>
              </div>
              <Button variant="secondary" onClick={() => setShowChangePassword(true)}>Change Password</Button>
            </div>
            
            {/* Password Requirements */}
            <div style={{ marginTop: 20, padding: 16, background: c.gray[850], borderRadius: r.lg }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 12 }}>Password Requirements</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {[
                  'At least 12 characters',
                  'One uppercase letter',
                  'One lowercase letter',
                  'One number',
                  'One special character',
                  'No common patterns',
                ].map((req, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={14} style={{ color: c.success.DEFAULT }} />
                    <span style={{ fontSize: 12, color: c.gray[400] }}>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          {/* Two-Factor Authentication */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Two-Factor Authentication</h3>
                <p style={{ fontSize: 13, color: c.gray[500], marginTop: 4 }}>Add an extra layer of security to your account</p>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: r.full, fontSize: 12, fontWeight: 500,
                background: twoFAEnabled ? c.success.muted : c.gray[800],
                color: twoFAEnabled ? c.success.DEFAULT : c.gray[400],
              }}>
                {twoFAEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            {twoFAEnabled ? (
              <div>
                <p style={{ fontSize: 13, color: c.gray[400], marginBottom: 16, lineHeight: 1.5 }}>
                  Two-factor authentication is enabled on your account. You'll need to enter a code from your authenticator app when signing in.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button variant="secondary">View Backup Codes</Button>
                  <Button variant="ghost" style={{ color: c.error.DEFAULT }} onClick={handleDisable2FA}>Disable 2FA</Button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: c.gray[400], marginBottom: 16, lineHeight: 1.5 }}>
                  Protect your account with an authenticator app like Google Authenticator, Authy, or 1Password. 
                  After enabling, you'll need to enter a code from the app each time you sign in.
                </p>
                <Button variant="gradient" onClick={handleSetup2FA}>
                  <Shield size={16} style={{ marginRight: 8 }} /> Enable Two-Factor Authentication
                </Button>
              </div>
            )}
          </Card>
          
          {/* Login History */}
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 16, fontFamily: tokens.font.heading }}>Recent Login Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { time: 'Just now', device: 'Chrome on Windows', location: 'Charlotte, NC', status: 'success' },
                { time: '2 hours ago', device: 'Safari on iPhone', location: 'Charlotte, NC', status: 'success' },
                { time: 'Yesterday', device: 'Chrome on Windows', location: 'Charlotte, NC', status: 'success' },
                { time: '3 days ago', device: 'Unknown Browser', location: 'New York, NY', status: 'blocked' },
              ].map((login, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: c.gray[850], borderRadius: r.md }}>
                  {login.status === 'success' ? (
                    <CheckCircle2 size={18} style={{ color: c.success.DEFAULT }} />
                  ) : (
                    <AlertCircle size={18} style={{ color: c.error.DEFAULT }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: c.gray[200] }}>{login.device}</p>
                    <p style={{ fontSize: 12, color: c.gray[500] }}>{login.location} • {login.time}</p>
                  </div>
                  <span style={{ fontSize: 11, color: login.status === 'success' ? c.success.DEFAULT : c.error.DEFAULT }}>
                    {login.status === 'success' ? 'Successful' : 'Blocked'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
      
      {/* ========== SESSIONS TAB ========== */}
      {activeTab === 'sessions' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Active Sessions</h2>
              <p style={{ fontSize: 13, color: c.gray[500], marginTop: 4 }}>Manage your active login sessions across devices</p>
            </div>
            {sessions.length > 1 && (
              <Button variant="secondary" onClick={revokeAllSessions}>
                Sign Out All Other Devices
              </Button>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sessions.map(session => (
              <Card key={session.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: r.lg, background: session.current ? c.success.muted : c.gray[800], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {session.device.includes('iPhone') || session.device.includes('Mobile') ? (
                      <Phone size={24} style={{ color: session.current ? c.success.DEFAULT : c.gray[400] }} />
                    ) : (
                      <Briefcase size={24} style={{ color: session.current ? c.success.DEFAULT : c.gray[400] }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>{session.device}</h3>
                      {session.current && (
                        <span style={{ padding: '2px 8px', borderRadius: r.full, fontSize: 10, fontWeight: 500, background: c.success.muted, color: c.success.DEFAULT }}>
                          This Device
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: c.gray[500], marginTop: 2 }}>
                      {session.location} • IP: {session.ip}
                    </p>
                    <p style={{ fontSize: 12, color: c.gray[600], marginTop: 2 }}>
                      Last active: {session.current ? 'Now' : fmt.date(session.lastActive)}
                    </p>
                  </div>
                  {!session.current && (
                    <Button variant="ghost" size="sm" style={{ color: c.error.DEFAULT }} onClick={() => revokeSession(session.id)}>
                      Sign Out
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {/* ========== TRUSTED DEVICES TAB ========== */}
      {activeTab === 'devices' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Trusted Devices</h2>
              <p style={{ fontSize: 13, color: c.gray[500], marginTop: 4 }}>Devices that don't require additional verification</p>
            </div>
          </div>
          
          <Card style={{ background: c.primary[50] }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Shield size={20} style={{ color: c.primary.DEFAULT, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 13, color: c.gray[200], lineHeight: 1.5 }}>
                  Trusted devices are remembered and won't require two-factor authentication for 30 days. 
                  Remove any devices you don't recognize or no longer use.
                </p>
              </div>
            </div>
          </Card>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trustedDevices.map(device => (
              <Card key={device.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: r.lg, background: c.gray[800], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {device.type === 'mobile' ? (
                      <Phone size={24} style={{ color: c.gray[400] }} />
                    ) : (
                      <Briefcase size={24} style={{ color: c.gray[400] }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>{device.name}</h3>
                    <p style={{ fontSize: 13, color: c.gray[500], marginTop: 2 }}>
                      {device.browser} on {device.os}
                    </p>
                    <p style={{ fontSize: 12, color: c.gray[600], marginTop: 2 }}>
                      Registered: {fmt.date(device.registeredAt)} • Last used: {fmt.date(device.lastUsed)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" style={{ color: c.error.DEFAULT }} onClick={() => removeDevice(device.id)}>
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {/* ========== PRIVACY & DATA TAB ========== */}
      {activeTab === 'privacy' && (
        <>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Privacy & Data Management</h2>
            <p style={{ fontSize: 13, color: c.gray[500], marginTop: 4 }}>Control how your data is used and manage your privacy preferences</p>
          </div>
          
          {/* Data Protection Notice */}
          <Card gradient>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: r.lg, background: c.primary[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={24} style={{ color: c.primary.DEFAULT }} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 6 }}>Your Data is Protected</h3>
                <p style={{ fontSize: 13, color: c.gray[400], lineHeight: 1.5 }}>
                  We use industry-standard encryption (AES-256) to protect your data at rest and in transit. 
                  Your data is stored in SOC 2 Type II certified data centers with GDPR and CCPA compliance.
                </p>
              </div>
            </div>
          </Card>
          
          {/* Privacy Settings */}
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 16, fontFamily: tokens.font.heading }}>Privacy Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[200] }}>Activity Tracking</p>
                  <p style={{ fontSize: 12, color: c.gray[500] }}>Track your activity to personalize recommendations</p>
                </div>
                <label style={{ position: 'relative', width: 48, height: 24, cursor: 'pointer' }}>
                  <input type="checkbox" checked={privacySettings.activityTracking} onChange={(e) => setPrivacySettings({ ...privacySettings, activityTracking: e.target.checked })} style={{ display: 'none' }} />
                  <span style={{ position: 'absolute', inset: 0, background: privacySettings.activityTracking ? c.success.DEFAULT : c.gray[700], borderRadius: 12, transition: 'background 200ms' }}>
                    <span style={{ position: 'absolute', top: 2, left: privacySettings.activityTracking ? 26 : 2, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left 200ms' }} />
                  </span>
                </label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[200] }}>Share Anonymous Analytics</p>
                  <p style={{ fontSize: 12, color: c.gray[500] }}>Help us improve by sharing anonymous usage data</p>
                </div>
                <label style={{ position: 'relative', width: 48, height: 24, cursor: 'pointer' }}>
                  <input type="checkbox" checked={privacySettings.shareAnalytics} onChange={(e) => setPrivacySettings({ ...privacySettings, shareAnalytics: e.target.checked })} style={{ display: 'none' }} />
                  <span style={{ position: 'absolute', inset: 0, background: privacySettings.shareAnalytics ? c.success.DEFAULT : c.gray[700], borderRadius: 12, transition: 'background 200ms' }}>
                    <span style={{ position: 'absolute', top: 2, left: privacySettings.shareAnalytics ? 26 : 2, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left 200ms' }} />
                  </span>
                </label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[200] }}>Marketing Communications</p>
                  <p style={{ fontSize: 12, color: c.gray[500] }}>Receive product updates and promotional emails</p>
                </div>
                <label style={{ position: 'relative', width: 48, height: 24, cursor: 'pointer' }}>
                  <input type="checkbox" checked={privacySettings.marketingEmails} onChange={(e) => setPrivacySettings({ ...privacySettings, marketingEmails: e.target.checked })} style={{ display: 'none' }} />
                  <span style={{ position: 'absolute', inset: 0, background: privacySettings.marketingEmails ? c.success.DEFAULT : c.gray[700], borderRadius: 12, transition: 'background 200ms' }}>
                    <span style={{ position: 'absolute', top: 2, left: privacySettings.marketingEmails ? 26 : 2, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left 200ms' }} />
                  </span>
                </label>
              </div>
            </div>
          </Card>
          
          {/* Data Retention */}
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 16, fontFamily: tokens.font.heading }}>Data Retention</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[200] }}>Retention Period</p>
                <p style={{ fontSize: 12, color: c.gray[500] }}>How long we keep your data after account closure</p>
              </div>
              <select value={privacySettings.dataRetention} onChange={(e) => setPrivacySettings({ ...privacySettings, dataRetention: parseInt(e.target.value) })}
                style={{ padding: '8px 12px', background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[200], fontSize: 13 }}>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>1 year</option>
                <option value={730}>2 years</option>
              </select>
            </div>
          </Card>
          
          {/* Data Actions */}
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 16, fontFamily: tokens.font.heading }}>Your Data Rights (GDPR / CCPA)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <div style={{ padding: 16, background: c.gray[850], borderRadius: r.lg }}>
                <Download size={24} style={{ color: c.primary.DEFAULT, marginBottom: 12 }} />
                <h4 style={{ fontSize: 14, fontWeight: 600, color: c.gray[200], marginBottom: 4 }}>Export Your Data</h4>
                <p style={{ fontSize: 12, color: c.gray[500], marginBottom: 12, lineHeight: 1.5 }}>
                  Download a copy of all your data in a portable format (JSON)
                </p>
                <Button variant="secondary" size="sm" onClick={() => setShowExportModal(true)}>Request Export</Button>
              </div>
              
              <div style={{ padding: 16, background: c.gray[850], borderRadius: r.lg }}>
                <Trash2 size={24} style={{ color: c.error.DEFAULT, marginBottom: 12 }} />
                <h4 style={{ fontSize: 14, fontWeight: 600, color: c.gray[200], marginBottom: 4 }}>Delete Your Data</h4>
                <p style={{ fontSize: 12, color: c.gray[500], marginBottom: 12, lineHeight: 1.5 }}>
                  Permanently delete your account and all associated data
                </p>
                <Button variant="ghost" size="sm" style={{ color: c.error.DEFAULT }} onClick={() => setShowDeleteModal(true)}>Request Deletion</Button>
              </div>
            </div>
          </Card>
        </>
      )}
      
      {/* ========== ACCESS LOGS TAB ========== */}
      {activeTab === 'logs' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Data Access Logs</h2>
              <p style={{ fontSize: 13, color: c.gray[500], marginTop: 4 }}>View history of all data access and modifications</p>
            </div>
            <Button variant="secondary" icon={Download} onClick={handleExportAccessLogs}>Export Logs</Button>
          </div>
          
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 120px 1fr 150px', gap: 16, padding: '12px 16px', background: c.gray[850], borderRadius: `${r.md}px ${r.md}px 0 0` }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: c.gray[500], textTransform: 'uppercase' }}>Action</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: c.gray[500], textTransform: 'uppercase' }}>Data Type</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: c.gray[500], textTransform: 'uppercase' }}>Details</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: c.gray[500], textTransform: 'uppercase' }}>Timestamp</span>
              </div>
              {accessLogs.map((log, i) => (
                <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '100px 120px 1fr 150px', gap: 16, padding: '12px 16px', background: i % 2 === 0 ? c.gray[900] : c.gray[850], borderRadius: i === accessLogs.length - 1 ? `0 0 ${r.md}px ${r.md}px` : 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: actionColors[log.action] || c.gray[400], textTransform: 'capitalize' }}>{log.action}</span>
                  <span style={{ fontSize: 12, color: c.gray[300], textTransform: 'capitalize' }}>{log.dataType}</span>
                  <span style={{ fontSize: 12, color: c.gray[400] }}>{log.details}</span>
                  <span style={{ fontSize: 12, color: c.gray[500] }}>{fmt.date(log.timestamp)}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
      
      {/* ========== MODALS ========== */}
      
      {/* 2FA Setup Modal */}
      {showSetup2FA && twoFASecret && (
        <ModalOverlay onClose={() => setShowSetup2FA(false)} maxWidth={480}>
          <Card padding={0}>
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}` }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Set Up Two-Factor Authentication</h2>
            </div>
            <div style={{ padding: 20 }}>
              <ol style={{ margin: 0, padding: '0 0 0 20px', color: c.gray[400], fontSize: 13, lineHeight: 2 }}>
                <li>Download an authenticator app (Google Authenticator, Authy, 1Password)</li>
                <li>Scan the QR code or enter the secret key manually</li>
                <li>Enter the 6-digit code from your app to verify</li>
              </ol>
              
              <div style={{ margin: '20px 0', padding: 20, background: '#fff', borderRadius: r.lg, textAlign: 'center' }}>
                <div style={{ width: 150, height: 150, background: c.gray[200], margin: '0 auto', borderRadius: r.md, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 12, color: c.gray[600] }}>[QR Code]</span>
                </div>
              </div>
              
              <div style={{ padding: 12, background: c.gray[850], borderRadius: r.md, marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: c.gray[500], marginBottom: 4 }}>Manual entry key:</p>
                <p style={{ fontSize: 14, fontFamily: tokens.font.mono, color: c.gray[200], letterSpacing: '0.1em' }}>{twoFASecret.secret}</p>
              </div>
              
              <Input
                label="Verification Code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ marginBottom: 20 }}
              />
              
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowSetup2FA(false)}>Cancel</Button>
                <Button variant="gradient" style={{ flex: 1 }} onClick={handleVerify2FA} disabled={verificationCode.length !== 6}>Verify & Enable</Button>
              </div>
              
              <div style={{ marginTop: 20, padding: 14, background: c.warning.muted, borderRadius: r.md }}>
                <p style={{ fontSize: 12, color: c.warning.DEFAULT, marginBottom: 8, fontWeight: 500 }}>Save your backup codes</p>
                <p style={{ fontSize: 11, color: c.gray[400], marginBottom: 8 }}>Store these codes in a safe place. You can use them to access your account if you lose your authenticator device.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {twoFASecret.backupCodes.map((code, i) => (
                    <span key={i} style={{ padding: '4px 8px', background: c.gray[900], borderRadius: r.sm, fontSize: 11, fontFamily: tokens.font.mono, color: c.gray[300] }}>{code}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </ModalOverlay>
      )}
      
      {/* Export Data Modal */}
      {showExportModal && (
        <ModalOverlay onClose={() => !isExporting && setShowExportModal(false)} maxWidth={480}>
          <Card padding={0}>
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}` }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Export Your Data</h2>
            </div>
            <div style={{ padding: 20 }}>
              {!isExporting ? (
                <>
                  <p style={{ fontSize: 13, color: c.gray[400], marginBottom: 16, lineHeight: 1.6 }}>
                    We'll prepare a downloadable file containing all your data including:
                  </p>
                  <ul style={{ margin: '0 0 20px 0', padding: '0 0 0 20px', color: c.gray[300], fontSize: 13, lineHeight: 1.8 }}>
                    <li>Profile information</li>
                    <li>Lead data and notes</li>
                    <li>Sequence configurations</li>
                    <li>Communication history</li>
                    <li>Consent records</li>
                    <li>Activity logs</li>
                  </ul>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowExportModal(false)}>Cancel</Button>
                    <Button variant="gradient" style={{ flex: 1 }} onClick={handleExportUserData}>Start Export</Button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <RefreshCw size={40} style={{ color: c.primary.DEFAULT, marginBottom: 16, animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontSize: 14, color: c.gray[200], marginBottom: 12 }}>Preparing your data export...</p>
                  <div style={{ height: 8, background: c.gray[800], borderRadius: r.full, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: `${exportProgress}%`, height: '100%', background: tokens.gradients.brand, transition: 'width 200ms ease' }} />
                  </div>
                  <p style={{ fontSize: 12, color: c.gray[500] }}>{exportProgress}% complete</p>
                </div>
              )}
            </div>
          </Card>
        </ModalOverlay>
      )}
      
      {/* Change Password Modal */}
      {showChangePassword && (
        <ModalOverlay onClose={() => { setShowChangePassword(false); setPasswordError(''); setPasswordSuccess(false); }} maxWidth={440}>
          <Card padding={0}>
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}` }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Change Password</h2>
            </div>
            <div style={{ padding: 20 }}>
              {passwordSuccess ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <CheckCircle2 size={48} style={{ color: c.success.DEFAULT, marginBottom: 16 }} />
                  <p style={{ fontSize: 16, fontWeight: 500, color: c.gray[100] }}>Password Changed Successfully!</p>
                  <p style={{ fontSize: 13, color: c.gray[400], marginTop: 8 }}>Your password has been updated.</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      placeholder="Enter current password"
                      style={{ width: '100%', padding: '10px 14px', background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], fontSize: 14, outline: 'none' }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>New Password</label>
                    <input
                      type="password"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      placeholder="Enter new password"
                      style={{ width: '100%', padding: '10px 14px', background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], fontSize: 14, outline: 'none' }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      placeholder="Confirm new password"
                      style={{ width: '100%', padding: '10px 14px', background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], fontSize: 14, outline: 'none' }}
                    />
                  </div>
                  
                  {passwordError && (
                    <div style={{ padding: 12, background: c.error.muted, borderRadius: r.md, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={16} style={{ color: c.error.DEFAULT }} />
                      <p style={{ fontSize: 13, color: c.error.DEFAULT }}>{passwordError}</p>
                    </div>
                  )}
                  
                  <div style={{ padding: 12, background: c.gray[850], borderRadius: r.md, marginBottom: 16 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: c.gray[400], marginBottom: 8 }}>Password Requirements:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      {[
                        { label: '12+ characters', met: passwordForm.new.length >= 12 },
                        { label: 'Uppercase letter', met: /[A-Z]/.test(passwordForm.new) },
                        { label: 'Lowercase letter', met: /[a-z]/.test(passwordForm.new) },
                        { label: 'Number', met: /\d/.test(passwordForm.new) },
                        { label: 'Special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.new) },
                        { label: 'Passwords match', met: passwordForm.new && passwordForm.new === passwordForm.confirm },
                      ].map((req, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {req.met ? (
                            <CheckCircle2 size={12} style={{ color: c.success.DEFAULT }} />
                          ) : (
                            <div style={{ width: 12, height: 12, borderRadius: '50%', border: `1px solid ${c.gray[600]}` }} />
                          )}
                          <span style={{ fontSize: 11, color: req.met ? c.success.DEFAULT : c.gray[500] }}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="secondary" style={{ flex: 1 }} onClick={() => { setShowChangePassword(false); setPasswordError(''); }}>Cancel</Button>
                    <Button variant="gradient" style={{ flex: 1 }} onClick={handleChangePassword}>Change Password</Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </ModalOverlay>
      )}
      
      {/* Delete Data Modal */}
      {showDeleteModal && (
        <ModalOverlay onClose={() => setShowDeleteModal(false)} maxWidth={480}>
          <Card padding={0}>
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}`, background: c.error.muted }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: c.error.DEFAULT, fontFamily: tokens.font.heading }}>⚠️ Delete All Data</h2>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 13, color: c.gray[300], marginBottom: 16, lineHeight: 1.6 }}>
                This action is <strong>permanent and cannot be undone</strong>. All your data will be permanently deleted including:
              </p>
              <ul style={{ margin: '0 0 20px 0', padding: '0 0 0 20px', color: c.gray[400], fontSize: 13, lineHeight: 1.8 }}>
                <li>Account information</li>
                <li>All lead data</li>
                <li>Sequences and automation rules</li>
                <li>Integration configurations</li>
                <li>Communication history</li>
              </ul>
              
              <p style={{ fontSize: 12, color: c.gray[500], marginBottom: 8 }}>
                Type <strong style={{ color: c.error.DEFAULT }}>DELETE MY DATA</strong> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE MY DATA"
                style={{ width: '100%', padding: '10px 14px', background: c.gray[850], border: `1px solid ${c.error.DEFAULT}30`, borderRadius: r.md, color: c.gray[100], fontSize: 14, marginBottom: 20 }}
              />
              
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" style={{ flex: 1 }} onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}>Cancel</Button>
                <Button 
                  variant="primary" 
                  style={{ flex: 1, background: c.error.DEFAULT, borderColor: c.error.DEFAULT }} 
                  onClick={handleDeleteData}
                  disabled={deleteConfirmText !== 'DELETE MY DATA'}
                >
                  Permanently Delete
                </Button>
              </div>
            </div>
          </Card>
        </ModalOverlay>
      )}
    </div>
  );
};