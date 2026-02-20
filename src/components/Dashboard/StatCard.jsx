//import React, { useMemo } from 'react';
import { tokens, r, c } from '../../styles/theme';


  
  export const StatCard = ({ label, value, icon: Icon, currentVal, previousVal }) => {

    const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return '+0.0%';
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  }; 
    const trend = calculateTrend(currentVal || 0, previousVal || 0);
    const isPositive = !trend.startsWith('-');
    return (
      <div style={{
        background: 'linear-gradient(180deg, rgba(46, 51, 90, 0) 0%, rgba(28, 27, 51, 0.2) 100%)',
        borderRadius: 20,
        padding: '24px',
        border: '1px solid #3148B9',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        minWidth: 0,
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 140,
      }}>
        {/* Background glow effects */}
        <div style={{
          position: 'absolute',
          bottom: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: 80,
          background: 'radial-gradient(ellipse at center, rgba(49, 72, 185, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: 20,
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        
        {/* Icon and stats */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative', zIndex: 1 }}>
          {/* Glassmorphic Icon container */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 14,
            background: 'linear-gradient(180deg, rgba(46, 51, 90, 0.5) 0%, rgba(28, 27, 51, 0.3) 100%)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(172, 186, 253, 0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Inner glow */}
            <div style={{
              position: 'absolute',
              bottom: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              height: 40,
              background: 'radial-gradient(ellipse at center, rgba(49, 72, 185, 0.5) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <Icon size={28} style={{ color: '#94a3b8', position: 'relative', zIndex: 1 }} />
          </div>
          
          {/* Label and value */}
          <div style={{ paddingTop: 4 }}>
            <p style={{ 
              fontSize: 14, 
              color: '#94a3b8', 
              marginBottom: 8, 
              fontFamily: tokens.font.sans,
              fontWeight: 400,
            }}>{label}</p>
            <p style={{ 
              fontSize: 40, 
              fontWeight: 600, 
              color: '#ffffff', 
              fontFamily: tokens.font.heading, 
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}>{value}</p>
          </div>
        </div>
        
        {/* Trend indicator */}
        <div style={{ 
          textAlign: 'right', 
          flexShrink: 0, 
          position: 'relative', 
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6,
            marginBottom: 4,
          }}>
            {/* Trend arrow */}
            {isPositive ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 12.5L10 7.5M10 7.5H6.25M10 7.5V11.25" stroke="#63D2A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5M10 12.5H6.25M10 12.5V8.75" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            <span style={{ 
              fontSize: 15, 
              fontWeight: 600, 
              color: isPositive ? '#63D2A1' : '#ef4444',
            }}>{trend}</span>
          </div>
          <p style={{ 
            fontSize: 12, 
            color: '#64748b',
            lineHeight: 1.3,
          }}>From Last<br/>Month</p>
        </div>
      </div>
    );
  };
 
  export default StatCard;