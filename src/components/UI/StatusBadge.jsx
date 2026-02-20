import React from 'react';
import { Flame, Sparkles, Snowflake, Zap } from 'lucide-react';
import { r, c } from '../../styles/theme';

const StatusBadge = ({ status }) => {
    if (!c || !r) {
    console.error("Theme not loaded! Check '../../styles/theme' path and exports.");
    return <span style={{ color: 'red' }}>Theme Error</span>;
  }
  const safeStatus = (status || 'new').toLowerCase();
  const config = c[safeStatus] || c.new;
  const icons = { hot: Flame, warm: Sparkles, cold: Snowflake, new: Zap };
  const Icon = icons[safeStatus] || Zap;
  
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: r.full,
      background: config.bg, border: `1px solid ${config.border}`,
      fontSize: 12, fontWeight: 500, color: config.text,
    }}>
      <Icon size={12} />
      {status}
    </span>
  );
};

export default StatusBadge;
