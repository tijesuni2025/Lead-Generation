// Fuzzy search function
export const fuzzySearch = (query, items, keys = ['name']) => {
  if (!query || query.length < 1) return items;
  const q = query.toLowerCase().trim();
  
  return items.filter(item => {
    return keys.some(key => {
      const value = String(item[key] || '').toLowerCase();
      // Exact match
      if (value.includes(q)) return true;
      // Fuzzy: check if all characters appear in order
      let qi = 0;
      for (let i = 0; i < value.length && qi < q.length; i++) {
        if (value[i] === q[qi]) qi++;
      }
      return qi === q.length;
    });
  }).sort((a, b) => {
    // Prioritize exact matches
    const aExact = keys.some(k => String(a[k] || '').toLowerCase().startsWith(q));
    const bExact = keys.some(k => String(b[k] || '').toLowerCase().startsWith(q));
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });
};



