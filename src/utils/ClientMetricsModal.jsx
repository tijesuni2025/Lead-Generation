import React, { useState } from 'react';
import { ModalOverlay } from '../components/Layout/ModalOverlay';
import { Card } from '../components/UI/Card';
import { Avatar } from '../components/UserProfile/Avatar';
import StatusBadge  from '../components/UI/StatusBadge';

export const ClientMetricsModal = ({ isOpen, onClose, client, leads }) => {
  if (!isOpen || !client) return null;
  
  const clientLeads = leads || [];
  const stats = {
    total: clientLeads.length,
    hot: clientLeads.filter(l => l.status === 'Hot').length,
    warm: clientLeads.filter(l => l.status === 'Warm').length,
    cold: clientLeads.filter(l => l.status === 'Cold').length,
    value: clientLeads.reduce((s, l) => s + (l.value || 0), 0),
    avgScore: Math.round(clientLeads.reduce((s, l) => s + l.score, 0) / clientLeads.length) || 0,
    recentLeads: clientLeads.slice(0, 5),
    sources: clientLeads.reduce((acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1;
      return acc;
    }, {}),
  };
  
  return (
    <ModalOverlay onClose={onClose} maxWidth={700}>
      <Card padding={0}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${c.gray[800]}`, background: tokens.gradients.brandSubtle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar name={client.name} size={48} />
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>{client.name}</h2>
              <p style={{ fontSize: 14, color: c.gray[400] }}>{client.company}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 8, background: c.gray[800], border: 'none', borderRadius: r.lg, cursor: 'pointer', color: c.gray[400] }}>
            <X size={20} />
          </button>
        </div>
        
        {/* Metrics Grid */}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Leads', value: stats.total, color: c.gray[100] },
              { label: 'Hot Leads', value: stats.hot, color: c.hot.text },
              { label: 'Pipeline Value', value: fmt.currency(stats.value), color: c.success.DEFAULT },
              { label: 'Avg Score', value: stats.avgScore, color: c.primary.light },
            ].map((metric, i) => (
              <div key={i} style={{ padding: 16, background: c.gray[850], borderRadius: r.lg, textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: metric.color, fontFamily: tokens.font.heading }}>{metric.value}</p>
                <p style={{ fontSize: 12, color: c.gray[500], marginTop: 4 }}>{metric.label}</p>
              </div>
            ))}
          </div>
          
          {/* Source Breakdown */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[300], marginBottom: 12 }}>Lead Sources</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(stats.sources).map(([source, count]) => (
                <span key={source} style={{ padding: '6px 12px', background: c.gray[850], borderRadius: r.full, fontSize: 13, color: c.gray[300] }}>
                  {source}: <strong style={{ color: c.accent.DEFAULT }}>{count}</strong>
                </span>
              ))}
            </div>
          </div>
          
          {/* Recent Leads */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[300], marginBottom: 12 }}>Recent Leads</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.recentLeads.map(lead => (
                <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: c.gray[850], borderRadius: r.lg }}>
                  <Avatar name={lead.name} size={32} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[200] }}>{lead.name}</p>
                    <p style={{ fontSize: 12, color: c.gray[500] }}>{lead.company}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.gray[300] }}>{lead.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: `1px solid ${c.gray[800]}` }}>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="primary" icon={BarChart3}>View Full Analytics</Button>
        </div>
      </Card>
    </ModalOverlay>
  );
};