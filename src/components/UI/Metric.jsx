import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {tokens, r, c} from '../../styles/theme';


export const Metric = ({ label, value, change, trend, icon: Icon, iconColor, accent = false }) => (
  <Card hover gradient>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: 13, color: c.gray[400], marginBottom: 6, fontWeight: 500, fontFamily: tokens.font.sans }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: c.gray[100], letterSpacing: '-0.02em', lineHeight: 1.1, fontFamily: tokens.font.heading }}>{value}</p>
        {change && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            {trend === 'up' ? <TrendingUp size={14} color={c.success.DEFAULT} /> : <TrendingDown size={14} color={c.error.DEFAULT} />}
            <span style={{ fontSize: 13, fontWeight: 500, color: trend === 'up' ? c.success.DEFAULT : c.error.DEFAULT, fontFamily: tokens.font.sans }}>{change}</span>
          </div>
        )}
      </div>
      {Icon && (
        <div style={{ 
          width: 44, height: 44, borderRadius: r.lg, 
          background: accent ? tokens.gradients.brand : `linear-gradient(135deg, ${c.primary[100]} 0%, rgba(242, 76, 3, 0.08) 100%)`, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: accent ? tokens.shadow.glowOrange : 'none',
        }}>
          <Icon size={22} color={accent ? '#fff' : c.primary.DEFAULT} style={{ opacity: 0.9 }} />
        </div>
      )}
    </div>
  </Card>
);
export default Metric;