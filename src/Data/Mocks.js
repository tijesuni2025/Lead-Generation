export const MOCK_USERS = {
  admin: { id: 'admin-1', email: 'admin@bluestarai.world', password: 'admin123', role: 'admin', name: 'Victor Oluwagbemiga' },
  clients: [
    { id: 'client-1', email: 'chris@azimont.com', password: 'client123', role: 'client', name: 'Chris Garcia', company: 'The Azimont Group' },
    { id: 'client-2', email: 'john@soona.com', password: 'client123', role: 'client', name: 'John Mitchell', company: 'Soona Realty' },
    { id: 'client-3', email: 'sarah@libertas.com', password: 'client123', role: 'client', name: 'Sarah Chen', company: 'Libertas Funding' },
  ]
};

export const generateMockLeads = (clientId) => {
  const names = ['James Wilson', 'Emma Thompson', 'Michael Brown', 'Olivia Davis', 'William Taylor', 'Sophia Anderson', 'Benjamin Martinez', 'Isabella Garcia', 'Lucas Robinson', 'Mia Johnson'];
  const companies = ['Quantum Labs', 'Atlas Ventures', 'Meridian Capital', 'Nexus Holdings', 'Apex Industries', 'Vertex Partners', 'Summit Group', 'Horizon Tech', 'Nova Systems', 'Stellar Corp'];
  const statuses = ['Hot', 'Warm', 'Cold', 'New'];
  const sources = ['LinkedIn', 'Website', 'Referral', 'Native Ad', 'Database', 'Outbound'];
  const titles = ['CEO', 'CFO', 'VP Sales', 'Director', 'Partner', 'Founder'];
  
  return Array.from({ length: 48 }, (_, i) => ({
    id: `lead-${clientId}-${i + 1}`,
    name: names[i % names.length],
    email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@${companies[i % companies.length].toLowerCase().replace(/\s/g, '')}.com`,
    phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    company: companies[i % companies.length],
    title: titles[Math.floor(Math.random() * titles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    score: Math.floor(Math.random() * 100),
    value: Math.floor(Math.random() * 500000) + 10000,
    lastContact: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    interactions: Math.floor(Math.random() * 15) + 1,
  }));
};

export const MOCK_LEADS_BY_CLIENT = {
  'client-1': generateMockLeads('client-1'),
  'client-2': generateMockLeads('client-2'),
  'client-3': generateMockLeads('client-3'),
};

