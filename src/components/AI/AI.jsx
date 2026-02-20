import {
  LayoutDashboard, Users, Upload, Settings, LogOut, Menu, X, Search,
  TrendingUp, TrendingDown, ChevronRight, ChevronLeft, Bell, Filter, Download,
  Plus, Edit2, Trash2, Eye, Phone, Mail, Calendar, CalendarDays, Clock,
  Target, Zap, Brain, BarChart3, Activity, RefreshCw,
  Building2, User, CheckCircle2, AlertCircle, MoreHorizontal,
  MessageSquare, Send, Bot, Lightbulb, Lock,
  FileText, FileJson, Check, ChevronDown, ArrowRight,
  Flame, Snowflake, Sparkles, ExternalLink, TrendingUp as TrendUp,
  Globe, DollarSign, Briefcase, Award, Linkedin, Shield, Video, MapPin
} from 'lucide-react';
import LeadAI, { callClaudeAPI, predictConversion, forecastPipeline, identifyAtRiskLeads, recommendNextAction } from '../../services/leadAI';
import { c, r, tokens } from '../../styles/theme';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Avatar } from '../UserProfile/Avatar';
//import { Target, Mail, BarChart3, AlertCircle, Phone, MessageSquare, Lightbulb, RefreshCw, Send, TrendingUp } from 'lucide-react';
import { MOCK_LEADS_BY_CLIENT } from '../../Data/Mocks';
import { renderMarkdown } from './renderMarkdown';
import StatusBadge from '../UI/StatusBadge';

// export const renderMarkdown = (text) => {
//   if (!text) return null;
  
//   const lines = text.split('\n');
//   const elements = [];
//   let inTable = false;
//   let tableRows = [];
//   let inCodeBlock = false;
//   let codeContent = [];
  
//   const processInlineFormatting = (line, idx) => {
//     const parts = line.split(/\*\*(.+?)\*\*/g);
//     return parts.map((part, i) => i % 2 === 1 ? <strong key={`${idx}-${i}`} style={{ color: c.gray[100] }}>{part}</strong> : part);
//   };
  
//   lines.forEach((line, idx) => {
//     if (line.startsWith('```')) {
//       if (inCodeBlock) {
//         elements.push(
//           <pre key={idx} style={{ background: c.gray[900], padding: 12, borderRadius: r.md, fontSize: 13, fontFamily: tokens.font.mono, overflowX: 'auto', margin: '8px 0' }}>
//             {codeContent.join('\n')}
//           </pre>
//         );
//         codeContent = [];
//       }
//       inCodeBlock = !inCodeBlock;
//       return;
//     }
//     if (inCodeBlock) { codeContent.push(line); return; }
    
//     if (line.startsWith('## ')) {
//       elements.push(<h2 key={idx} style={{ fontSize: 16, fontWeight: 600, color: c.gray[100], margin: '16px 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>{line.slice(3)}</h2>);
//       return;
//     }
//     if (line.startsWith('### ')) {
//       elements.push(<h3 key={idx} style={{ fontSize: 14, fontWeight: 600, color: c.gray[200], margin: '12px 0 6px' }}>{line.slice(4)}</h3>);
//       return;
//     }
    
//     if (line.startsWith('|')) {
//       if (!inTable) { inTable = true; tableRows = []; }
//       tableRows.push(line);
//       return;
//     } else if (inTable) {
//       const headers = tableRows[0]?.split('|').filter(c => c.trim()).map(c => c.trim());
//       const dataRows = tableRows.slice(2).map(r => r.split('|').filter(c => c.trim()).map(c => c.trim()));
      
//       elements.push(
//         <div key={`table-${idx}`} style={{ overflowX: 'auto', margin: '8px 0' }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
//             <thead>
//               <tr>{headers?.map((h, i) => <th key={i} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: `1px solid ${c.gray[700]}`, color: c.gray[300], fontWeight: 600 }}>{h}</th>)}</tr>
//             </thead>
//             <tbody>
//               {dataRows.map((row, ri) => (
//                 <tr key={ri}>{row.map((cell, ci) => <td key={ci} style={{ padding: '8px 12px', borderBottom: `1px solid ${c.gray[800]}`, color: c.gray[300] }}>{cell}</td>)}</tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       );
//       inTable = false;
//       tableRows = [];
//     }
    
//     if (line === '---') {
//       elements.push(<hr key={idx} style={{ border: 'none', borderTop: `1px solid ${c.gray[800]}`, margin: '12px 0' }} />);
//       return;
//     }
    
//     if (line.startsWith('- ') || line.startsWith('• ')) {
//       elements.push(
//         <div key={idx} style={{ display: 'flex', gap: 8, marginLeft: 8, marginBottom: 4 }}>
//           <span style={{ color: c.gray[500] }}>•</span>
//           <span style={{ color: c.gray[300], lineHeight: 1.5 }}>{processInlineFormatting(line.slice(2), idx)}</span>
//         </div>
//       );
//       return;
//     }
    
//     // Numbered lists
//     const numMatch = line.match(/^(\d+)\.\s+(.+)/);
//     if (numMatch) {
//       elements.push(
//         <div key={idx} style={{ display: 'flex', gap: 8, marginLeft: 4, marginBottom: 4 }}>
//           <span style={{ color: c.primary.DEFAULT, fontWeight: 600, minWidth: 20 }}>{numMatch[1]}.</span>
//           <span style={{ color: c.gray[300], lineHeight: 1.5 }}>{processInlineFormatting(numMatch[2], idx)}</span>
//         </div>
//       );
//       return;
//     }
    
//     if (!line.trim()) {
//       elements.push(<div key={idx} style={{ height: 8 }} />);
//       return;
//     }
    
//     elements.push(<p key={idx} style={{ color: c.gray[300], lineHeight: 1.6, marginBottom: 4 }}>{processInlineFormatting(line, idx)}</p>);
//   });
  
//   return elements;
// };

export const AIAssistant = ({ user }) => {
  const leads = MOCK_LEADS_BY_CLIENT[user.id] || [];
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedLead, setSelectedLead] = useState(null);
  const chatRef = useRef(null);
  
  const analytics = useMemo(() => {
    const topLeads = [...leads].sort((a, b) => b.score - a.score).slice(0, 10);
    const atRisk = identifyAtRiskLeads(leads);
    const forecast = forecastPipeline(leads, 30);
    const hotLeads = leads.filter(l => l.status === 'Hot');
    
    return {
      total: leads.length,
      hot: hotLeads.length,
      warm: leads.filter(l => l.status === 'Warm').length,
      cold: leads.filter(l => l.status === 'Cold').length,
      value: leads.reduce((s, l) => s + l.value, 0),
      avgScore: Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) || 0,
      topLeads,
      atRisk,
      forecast,
      hotValue: hotLeads.reduce((s, l) => s + l.value, 0),
    };
  }, [leads]);
  
  useEffect(() => {
    if (messages.length === 0) {
      const atRiskCount = analytics.atRisk.length;
      const urgentActions = analytics.atRisk.filter(l => l.risks?.some(r => r.type === 'urgent')).length;
      
      setMessages([{
        role: 'assistant',
        content: `## Welcome back, ${user.name.split(' ')[0]}

I'm your AI sales assistant with full access to your pipeline of **${analytics.total} leads**.

### Quick Status
- **${analytics.hot} hot leads** ready for closing
- **${atRiskCount > 0 ? `${atRiskCount} leads need attention` : 'Pipeline healthy'}**${urgentActions > 0 ? ` (${urgentActions} urgent)` : ''}
- **$${(analytics.forecast.revenue.expected/1000).toFixed(0)}K** expected revenue (30 days)

### How I Can Help
- **Prioritization** — "Which leads should I focus on?"
- **Outreach** — "Write an email to my top lead"
- **Forecasts** — "Show my pipeline forecast"
- **Call Prep** — "Prepare me for a meeting with [name]"
- **Objections** — "How do I handle pricing objections?"

What would you like to explore?`,
        time: new Date().toISOString(),
      }]);
    }
  }, []);
  
  useEffect(() => {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);
  
  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    
    const userMessage = { role: 'user', content: input.trim(), time: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    try {
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));
      
      const response = await callClaudeAPI(conversationHistory, user, leads);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        time: new Date().toISOString(),
      }]);
    } catch (error) {
      console.error('AI response error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an issue. Please try again.',
        time: new Date().toISOString(),
      }]);
    }
    
    setIsProcessing(false);
  };
  
  const quickPrompts = [
    { icon: Target, label: 'Priority leads', query: 'Which leads should I prioritize today?' },
    { icon: Mail, label: 'Draft email', query: 'Write an outreach email to my top lead' },
    { icon: BarChart3, label: 'Forecast', query: 'Show my 30-day pipeline forecast' },
    { icon: AlertCircle, label: 'At-risk', query: 'Which leads are at risk of going cold?' },
    { icon: Phone, label: 'Call script', query: 'Create a call script for my top lead' },
    { icon: MessageSquare, label: 'Objections', query: 'How should I handle pricing objections?' },
  ];
  
  const handleLeadAction = (lead, action) => {
    const queries = {
      email: `Write a personalized outreach email to ${lead.name} at ${lead.company}`,
      call: `Create a call script for my meeting with ${lead.name}, ${lead.title} at ${lead.company}`,
      analyze: `Give me a detailed analysis of ${lead.name} at ${lead.company} including their score breakdown and next best action`,
      linkedin: `Draft a LinkedIn connection request message for ${lead.name} at ${lead.company}`,
    };
    setInput(queries[action]);
    setActiveTab('chat');
  };

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 160px)', minHeight: 500 }}>
      <Card padding={0} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${c.gray[800]}`, background: c.gray[900] }}>
          {[
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'insights', label: 'Quick Insights', icon: Lightbulb },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
                fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer',
                color: activeTab === tab.id ? c.gray[100] : c.gray[500],
                background: activeTab === tab.id ? c.gray[850] : 'transparent',
                borderBottom: activeTab === tab.id ? `2px solid ${c.primary.DEFAULT}` : '2px solid transparent',
                transition: tokens.transition.fast,
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
        
        {activeTab === 'chat' ? (
          <>
            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 20 }}>
                  {msg.role === 'assistant' && (
                    <img src="/logo-colored.png" alt="AI" style={{ width: 32, height: 32, marginRight: 12, flexShrink: 0, objectFit: 'contain' }} />
                  )}
                  <div style={{
                    maxWidth: msg.role === 'user' ? '70%' : '85%',
                    padding: msg.role === 'user' ? '10px 16px' : '16px 20px',
                    background: msg.role === 'user' ? c.primary.DEFAULT : c.gray[850],
                    borderRadius: r.xl,
                    borderTopLeftRadius: msg.role === 'assistant' ? r.sm : r.xl,
                    borderTopRightRadius: msg.role === 'user' ? r.sm : r.xl,
                    border: msg.role === 'assistant' ? `1px solid ${c.gray[800]}` : 'none',
                  }}>
                    {msg.role === 'user' ? (
                      <p style={{ fontSize: 14, color: '#fff', lineHeight: 1.5 }}>{msg.content}</p>
                    ) : (
                      <div style={{ fontSize: 14 }}>{renderMarkdown(msg.content)}</div>
                    )}
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div style={{ display: 'flex', marginBottom: 20 }}>
                  <img src="/logo-colored.png" alt="AI" style={{ width: 32, height: 32, marginRight: 12, objectFit: 'contain' }} />
                  <div style={{ padding: '16px 20px', background: c.gray[850], borderRadius: r.xl, borderTopLeftRadius: r.sm, border: `1px solid ${c.gray[800]}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <RefreshCw size={14} style={{ color: c.primary.DEFAULT, animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: 13, color: c.gray[400] }}>Analyzing your pipeline...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${c.gray[800]}`, display: 'flex', gap: 8, flexWrap: 'wrap', background: c.gray[900] }}>
              {quickPrompts.map(p => (
                <button
                  key={p.label}
                  onClick={() => setInput(p.query)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px', fontSize: 13, color: c.gray[400],
                    background: c.gray[850], border: `1px solid ${c.gray[800]}`,
                    borderRadius: r.full, cursor: 'pointer', transition: tokens.transition.fast,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.gray[700]; e.currentTarget.style.color = c.gray[300]; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = c.gray[800]; e.currentTarget.style.color = c.gray[400]; }}
                >
                  <p.icon size={14} />
                  {p.label}
                </button>
              ))}
            </div>
            
            <div style={{ padding: 16, borderTop: `1px solid ${c.gray[800]}`, display: 'flex', gap: 12 }}>
              <input
                placeholder="Ask about your leads, request emails, forecasts, strategies..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                style={{
                  flex: 1, padding: '12px 16px', fontSize: 14, color: c.gray[100],
                  background: c.gray[850], border: `1px solid ${c.gray[800]}`,
                  borderRadius: r.lg, outline: 'none', transition: tokens.transition.fast,
                }}
                onFocus={(e) => e.target.style.borderColor = c.primary.DEFAULT}
                onBlur={(e) => e.target.style.borderColor = c.gray[800]}
              />
              <Button onClick={handleSend} disabled={!input.trim() || isProcessing}>
                <Send size={18} />
              </Button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[300], marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={16} style={{ color: c.primary.DEFAULT }} />
                30-Day Forecast
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Conservative', value: analytics.forecast.revenue.conservative, deals: analytics.forecast.deals.conservative },
                  { label: 'Expected', value: analytics.forecast.revenue.expected, deals: analytics.forecast.deals.expected, highlight: true },
                  { label: 'Optimistic', value: analytics.forecast.revenue.optimistic, deals: analytics.forecast.deals.optimistic },
                ].map(f => (
                  <div key={f.label} style={{ padding: 14, background: f.highlight ? c.primary[100] : c.gray[850], borderRadius: r.lg, border: `1px solid ${f.highlight ? c.primary.DEFAULT : c.gray[800]}` }}>
                    <p style={{ fontSize: 11, color: c.gray[500], marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: f.highlight ? c.primary.DEFAULT : c.gray[200] }}>${(f.value/1000).toFixed(0)}K</p>
                    <p style={{ fontSize: 12, color: c.gray[500], marginTop: 2 }}>{f.deals} deals</p>
                  </div>
                ))}
              </div>
            </div>
            
            {analytics.atRisk.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[300], marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={16} style={{ color: c.error.DEFAULT }} />
                  Leads Needing Attention ({analytics.atRisk.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {analytics.atRisk.slice(0, 4).map(lead => (
                    <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: c.gray[850], borderRadius: r.lg, border: `1px solid ${c.gray[800]}` }}>
                      <Avatar name={lead.name} size={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[200] }}>{lead.name}</p>
                        <p style={{ fontSize: 12, color: c.error.DEFAULT }}>{lead.risks[0]?.message}</p>
                      </div>
                      <button
                        onClick={() => handleLeadAction(lead, 'email')}
                        style={{ padding: '6px 12px', fontSize: 12, background: c.primary[100], border: `1px solid ${c.primary.DEFAULT}`, borderRadius: r.md, color: c.primary.DEFAULT, cursor: 'pointer' }}
                      >
                        Draft Email
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[300], marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={16} style={{ color: c.success.DEFAULT }} />
                Top Priority Leads
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analytics.topLeads.slice(0, 5).map((lead, i) => {
                  const prediction = predictConversion(lead);
                  const action = recommendNextAction(lead, leads);
                  return (
                    <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: c.gray[850], borderRadius: r.lg, border: `1px solid ${c.gray[800]}` }}>
                      <span style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, borderRadius: r.sm, color: i < 3 ? c.primary.DEFAULT : c.gray[500], background: i < 3 ? c.primary[100] : 'transparent' }}>{i + 1}</span>
                      <Avatar name={lead.name} size={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[200] }}>{lead.name}</p>
                          <StatusBadge status={lead.status} />
                        </div>
                        <p style={{ fontSize: 12, color: c.gray[500] }}>{lead.company} • {prediction.probability}% conversion</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: c.gray[200] }}>${(lead.value/1000).toFixed(0)}K</p>
                        <p style={{ fontSize: 11, color: c.gray[500] }}>Score: {lead.score}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleLeadAction(lead, 'email')} title="Draft Email" style={{ padding: 6, background: c.gray[800], border: 'none', borderRadius: r.sm, cursor: 'pointer', color: c.gray[400], transition: tokens.transition.fast }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = c.primary[100]; e.currentTarget.style.color = c.primary.DEFAULT; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = c.gray[800]; e.currentTarget.style.color = c.gray[400]; }}>
                          <Mail size={14} />
                        </button>
                        <button onClick={() => handleLeadAction(lead, 'call')} title="Call Script" style={{ padding: 6, background: c.gray[800], border: 'none', borderRadius: r.sm, cursor: 'pointer', color: c.gray[400], transition: tokens.transition.fast }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = c.success.muted; e.currentTarget.style.color = c.success.DEFAULT; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = c.gray[800]; e.currentTarget.style.color = c.gray[400]; }}>
                          <Phone size={14} />
                        </button>
                        <button onClick={() => handleLeadAction(lead, 'analyze')} title="Analyze" style={{ padding: 6, background: c.gray[800], border: 'none', borderRadius: r.sm, cursor: 'pointer', color: c.gray[400], transition: tokens.transition.fast }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = c.accent.muted; e.currentTarget.style.color = c.accent.DEFAULT; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = c.gray[800]; e.currentTarget.style.color = c.gray[400]; }}>
                          <Brain size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card>
      
      <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 16 }} className="ai-sidebar">
        <Card>
          <p style={{ fontSize: 11, fontWeight: 600, color: c.gray[500], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Pipeline Overview</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Total Leads', value: analytics.total },
              { label: 'Hot Leads', value: analytics.hot, color: c.hot.text },
              { label: 'Warm Leads', value: analytics.warm, color: c.warm.text },
              { label: 'At Risk', value: analytics.atRisk.length, color: analytics.atRisk.length > 0 ? c.error.DEFAULT : c.gray[400] },
              { label: 'Pipeline Value', value: `$${(analytics.value/1000).toFixed(0)}K` },
              { label: 'Avg Score', value: analytics.avgScore },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: c.gray[400] }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: s.color || c.gray[200] }}>{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card>
          <p style={{ fontSize: 11, fontWeight: 600, color: c.gray[500], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>AI Capabilities</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: Target, label: 'ML Lead Scoring', desc: 'Multi-signal analysis' },
              { icon: TrendingUp, label: 'Conversion Predictions', desc: 'Probability estimates' },
              { icon: Mail, label: 'Email Generation', desc: 'Personalized outreach' },
              { icon: Phone, label: 'Call Scripts', desc: 'Meeting preparation' },
              { icon: BarChart3, label: 'Pipeline Forecasts', desc: 'Revenue projections' },
              { icon: MessageSquare, label: 'Objection Handling', desc: 'Response strategies' },
            ].map(cap => (
              <div key={cap.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: r.md, background: c.gray[850], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <cap.icon size={14} style={{ color: c.primary.DEFAULT }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: c.gray[300] }}>{cap.label}</p>
                  <p style={{ fontSize: 11, color: c.gray[600] }}>{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card style={{ background: `linear-gradient(135deg, ${c.primary[100]}, ${c.accent.muted})`, border: `1px solid ${c.primary.DEFAULT}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Lightbulb size={16} style={{ color: c.primary.DEFAULT }} />
            <p style={{ fontSize: 12, fontWeight: 600, color: c.gray[200] }}>Pro Tip</p>
          </div>
          <p style={{ fontSize: 13, color: c.gray[300], lineHeight: 1.5 }}>
            Ask me to "prepare for a meeting with [name]" and I'll create a comprehensive brief with talking points and discovery questions.
          </p>
        </Card>
      </div>
    </div>
  );
};