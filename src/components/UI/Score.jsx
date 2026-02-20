import { c, tokens } from '../../styles/theme';

export const Score = ({ value, size = 'md' }) => {
  const color = value >= 75 ? c.success.DEFAULT : value >= 50 ? c.warning.DEFAULT : value >= 25 ? '#f97316' : c.error.DEFAULT;
  const widths = { sm: 40, md: 52, lg: 64 };
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: widths[size], height: 4, background: c.gray[800], borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2, transition: tokens.transition.slow }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums', minWidth: 24 }}>{value}</span>
    </div>
  );
};