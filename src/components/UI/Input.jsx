import {tokens, r, c} from '../../styles/theme';
import { useState } from 'react';

export const Input = ({ label, icon: Icon, error, ...props }) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div style={{ width: '100%' }}>
      {label && <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: c.gray[400], fontFamily: tokens.font.sans }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused ? c.primary.light : c.gray[500], transition: tokens.transition.fast }} />}
        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: Icon ? '11px 12px 11px 40px' : '11px 12px',
            fontSize: 14, color: c.gray[100], background: c.gray[850],
            fontFamily: tokens.font.sans,
            border: `1px solid ${focused ? c.primary.DEFAULT : error ? c.error.DEFAULT : c.gray[700]}`,
            borderRadius: r.md, outline: 'none', transition: tokens.transition.fast,
            boxShadow: focused ? `0 0 0 3px ${c.primary[100]}` : 'none',
          }}
          {...props}
        />
      </div>
      {error && <p style={{ marginTop: 4, fontSize: 12, color: c.error.DEFAULT }}>{error}</p>}
    </div>
  );
};
export default Input;