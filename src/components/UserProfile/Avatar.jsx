import { react } from 'react';
import { Building2 } from 'lucide-react';
import { fmt } from '../../utils/formatters';
import { tokens, r, c } from '../../styles/theme';

export const Avatar = ({ name, size = 40, src }) => {
  // Brand-aligned avatar gradients
  const gradients = [
    `linear-gradient(135deg, ${c.primary.DEFAULT}, ${c.primary.light})`,  // Space Blue
    `linear-gradient(135deg, ${c.accent.DEFAULT}, ${c.accent.light})`,    // Orange
    `linear-gradient(135deg, #3148B9, #F24C03)`,                           // Brand gradient
    `linear-gradient(135deg, ${c.primary.light}, #8b5cf6)`,               // Blue to purple
    `linear-gradient(135deg, #10b981, ${c.primary.DEFAULT})`,             // Green to blue
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  
  return (
    <div style={{
      width: size, height: size, borderRadius: r.lg, flexShrink: 0,
      background: src ? 'transparent' : gradients[idx],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 600, color: '#fff', overflow: 'hidden',
      fontFamily: tokens.font.heading,
      boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
    }}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : fmt.initials(name)}
    </div>
  );
};

export const UserOrgAvatar = ({ userName, orgName, userSize = 40, showOrg = true }) => {
  const orgSize = userSize * 0.65;
  
  return (
    <div style={{ position: 'relative', width: userSize + 8, height: userSize + 8 }}>
      {/* Org badge - positioned behind and offset */}
      {showOrg && orgName && (
        <div style={{
          position: 'absolute',
          bottom: 0, right: 0,
          width: orgSize, height: orgSize, borderRadius: r.md,
          background: `linear-gradient(135deg, ${c.gray[700]}, ${c.gray[600]})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: orgSize, fontWeight: 600, color: c.gray[300],
          fontFamily: tokens.font.sans,
          border: `2px solid ${c.gray[900]}`,
          zIndex: 1,
        }}>
          <Building2 size={orgSize * 0.5} />
        </div>
      )}
      {/* User avatar - on top */}
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
        <Avatar name={userName} size={userSize} />
      </div>
    </div>
  );
};

// export default Avatar;