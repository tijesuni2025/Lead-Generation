import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { tokens, r, c } from '../../styles/theme';

export const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, iconRight, loading, disabled, fullWidth, onClick, style = {} }) => {
  const [hovered, setHovered] = useState(false);
  
  const variants = {
    primary: { 
      bg: hovered ? c.primary.hover : c.primary.DEFAULT, 
      bgHover: c.primary.hover, 
      text: '#fff', 
      border: 'none',
      shadow: hovered ? tokens.shadow.glow : 'none',
    },
    accent: { 
      bg: hovered ? c.accent.dark : c.accent.DEFAULT, 
      bgHover: c.accent.dark, 
      text: '#fff', 
      border: 'none',
      shadow: hovered ? tokens.shadow.glowOrange : 'none',
    },
    gradient: {
      bg: tokens.gradients.brand,
      bgHover: tokens.gradients.brand,
      text: '#fff',
      border: 'none',
      shadow: hovered ? `0 0 20px rgba(49, 72, 185, 0.3), 0 0 40px rgba(242, 76, 3, 0.2)` : 'none',
    },
    secondary: { bg: 'transparent', bgHover: c.gray[800], text: c.gray[300], border: `1px solid ${c.gray[700]}`, shadow: 'none' },
    ghost: { bg: 'transparent', bgHover: c.gray[850], text: c.gray[400], border: 'none', shadow: 'none' },
    danger: { bg: c.error.muted, bgHover: 'rgba(239,68,68,0.2)', text: c.error.DEFAULT, border: 'none', shadow: 'none' },
  };
  const sizes = { sm: { px: 12, py: 6, fs: 13 }, md: { px: 16, py: 10, fs: 14 }, lg: { px: 20, py: 12, fs: 15 } };
  const v = variants[variant], s = sizes[size];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: `${s.py}px ${s.px}px`, fontSize: s.fs, fontWeight: 500,
        fontFamily: tokens.font.sans,
        color: v.text, background: variant === 'gradient' ? v.bg : (hovered && !disabled ? v.bgHover : v.bg),
        border: v.border, borderRadius: r.md, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: tokens.transition.fast,
        width: fullWidth ? '100%' : 'auto', outline: 'none',
        boxShadow: v.shadow,
        ...style,
      }}
    >
      {loading ? <RefreshCw size={16} className="animate-spin" /> : Icon && !iconRight && <Icon size={16} />}
      {children}
      {Icon && iconRight && !loading && <Icon size={16} />}
    </button>
  );
};

export default Button;