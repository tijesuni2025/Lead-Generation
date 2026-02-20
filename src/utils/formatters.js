import { react } from 'react';

export const fmt = {
  currency: (v) => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${v}`,
  date: (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 864e5);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },
  initials: (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2),
  number: (n) => n.toLocaleString(),
};