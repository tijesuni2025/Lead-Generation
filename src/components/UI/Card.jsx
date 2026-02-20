import { useState } from 'react';
import { tokens, r, c } from '../../styles/theme';

// export const Card = ({ children, padding = 20, hover = false, onClick, accent = false, gradient = false, style = {} }) => {
//   const [hovered, setHovered] = useState(false);
  
//   return (
//     <div
//       onClick={onClick}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       style={{
//         background: gradient ? tokens.gradients.card : c.gray[900],
//         border: `1px solid ${accent ? c.accent.DEFAULT + '30' : hovered && hover ? c.gray[600] : c.gray[800]}`,
//         borderRadius: r.xl, padding, cursor: onClick ? 'pointer' : 'default',
//         transition: tokens.transition.base, 
//         transform: hovered && hover ? 'translateY(-2px)' : 'none',
//         boxShadow: hovered && hover ? tokens.shadow.card : 'none',
//         position: 'relative',
//         overflow: 'hidden',
//         ...style,
//       }}
//     >
//       {/* Subtle gradient overlay for depth */}
//       {gradient && (
//         <div style={{
//           position: 'absolute', inset: 0, 
//           background: tokens.gradients.blueRadial,
//           pointerEvents: 'none',
//         }} />
//       )}
//       <div style={{ position: 'relative', zIndex: 1 }}>
//         {children}
//       </div>
//     </div>
//   );
// };

// /**
//  * 1. Extract the complex background gradients to keep the main component clean.
//  */
// export const CardBackground = () => (
//   <>
//     {/* Bottom glow effects */}
//     <div style={styles.glowLarge} />
//     <div style={{ ...styles.glowSmall, ...styles.glowWhite }} />
//   </>
// );

/**
 * 2. Extract the Trend Indicator to handle the logic separately.
 */
// const TrendIndicator = ({ current, previous }) => {
//   // Logic is now isolated here
//   if (!previous || previous === 0) return <span style={styles.trendNeutral}>+0.0%</span>;
  
//   const change = ((current - previous) / previous) * 100;
//   const isPositive = change >= 0;
//   const formattedChange = (change >= 0 ? '+' : '') + change.toFixed(1) + '%';
//   const color = isPositive ? '#63D2A1' : '#ef4444';

//   return (
//     <div style={styles.trendContainer}>
//       <div style={styles.trendValue}>
//         {/* We use a standard Icon component here instead of raw SVG paths */}
//         <TrendIcon up={isPositive} color={color} />
//         <span style={{ ...styles.trendText, color }}>{formattedChange}</span>
//       </div>
//       <p style={styles.trendLabel}>From Last<br/>Month</p>
//     </div>
//   );
// };

// /**
//  * 3. The Main Component is now only 30 lines and focuses on layout.
//  */
// const StatCard = ({ label, value, icon: Icon, currentVal, previousVal }) => {
//   return (
//     <div style={styles.cardContainer}>
//       <CardBackground />
      
//       {/* Icon and stats */}
//       <div style={styles.contentWrapper}>
//         <div style={styles.iconGlass}>
//           <div style={styles.iconGlow} />
//           <Icon size={28} style={styles.iconSvg} />
//         </div>
        
//         <div style={{ paddingTop: 4 }}>
//           <p style={styles.label}>{label}</p>
//           <p style={styles.value}>{value}</p>
//         </div>
//       </div>
      
//       <TrendIndicator current={currentVal} previous={previousVal} />
//     </div>
//   );
// };


export const Card = ({ children, padding = 20, hover = false, onClick, accent = false, gradient = false, style = {} }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: gradient ? tokens.gradients.card : c.gray[900],
        border: `1px solid ${accent ? c.accent.DEFAULT + '30' : hovered && hover ? c.gray[600] : c.gray[800]}`,
        borderRadius: r.xl, padding, cursor: onClick ? 'pointer' : 'default',
        transition: tokens.transition.base, 
        transform: hovered && hover ? 'translateY(-2px)' : 'none',
        boxShadow: hovered && hover ? tokens.shadow.card : 'none',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Subtle gradient overlay for depth */}
      {gradient && (
        <div style={{
          position: 'absolute', inset: 0, 
          background: tokens.gradients.blueRadial,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default Card;