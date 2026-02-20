import react from 'react';
import { useState } from 'react';
import { LayoutDashboard, Users, Zap, Brain, RefreshCw, CheckCircle2, Lightbulb, Mail, Phone, MessageSquare, ChevronDown, Target, Clock } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { r, c, tokens } from '../../styles/theme';

export const HelpPage = ({ user }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  
  const helpSections = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      title: 'Dashboard',
      description: 'Your command center for lead management',
      content: [
        { q: 'What is the Dashboard?', a: 'The Dashboard gives you a quick overview of your pipeline health, including total leads, conversion metrics, and top opportunities requiring attention.' },
        { q: 'What do the metrics mean?', a: 'Total Leads shows your database size. Hot Leads are high-intent prospects ready to buy. Pipeline Value is the total potential revenue. Avg Score indicates overall lead quality.' },
        { q: 'How do I use Top Leads?', a: 'Top Leads are ranked by our AI scoring system. Click any lead to view details or use quick actions to email or call them directly.' },
      ],
    },
    {
      id: 'leads',
      icon: Users,
      title: 'Leads',
      description: 'View, filter, and manage your lead database',
      content: [
        { q: 'How are leads scored?', a: 'Our AI analyzes 5 factors: engagement history (25%), title seniority (20%), contact recency (20%), intent signals (20%), and deal fit (15%). Scores range from 1-100.' },
        { q: 'What do the status colors mean?', a: 'Hot (red) = high buying intent, ready to close. Warm (orange) = engaged, needs nurturing. New (blue) = recently added. Cold (gray) = low engagement or stale.' },
        { q: 'How do I export leads?', a: 'Click the Export button to download your leads as CSV or JSON. You can export all leads or apply filters first to export a subset.' },
        { q: 'Can I search for specific leads?', a: 'Yes, use the search bar to find leads by name, company, or email. Results appear in real-time as you type.' },
      ],
    },
    {
      id: 'sequences',
      icon: Zap,
      title: 'Sequences',
      description: 'Automated multi-channel outreach campaigns',
      content: [
        { q: 'What is a Sequence?', a: 'A sequence is an automated series of touchpoints (emails, calls, LinkedIn messages) that run on a schedule. When a lead is enrolled, they receive each step automatically.' },
        { q: 'What channels are supported?', a: 'Email, LinkedIn (connection requests, messages), SMS, phone calls, and manual tasks. Mix channels for higher response rates.' },
        { q: 'When do sequences pause?', a: 'Sequences automatically pause when a lead replies, books a meeting, or opts out. You can also manually pause any enrollment.' },
        { q: 'How do I create a sequence?', a: 'Click Create Sequence and choose a template (Initial Outreach, Warm Nurture, etc.) or build from scratch. Add steps, set delays, and activate when ready.' },
      ],
    },
    {
      id: 'ai',
      icon: Brain,
      title: 'AI Assistant',
      description: 'Your intelligent sales companion',
      content: [
        { q: 'What can the AI Assistant do?', a: 'It can prioritize your leads, write personalized emails and call scripts, forecast pipeline revenue, identify at-risk deals, and provide objection handling strategies.' },
        { q: 'How do I get the best results?', a: 'Be specific in your questions. Instead of "help me", try "write a follow-up email for John at Acme Corp who hasn\'t responded in 5 days".' },
        { q: 'Does it know my leads?', a: 'Yes, the AI has full context on your pipeline including names, scores, values, and interaction history. It uses this data to personalize recommendations.' },
        { q: 'What are Quick Prompts?', a: 'Pre-built questions to get you started fast. Click any prompt to use it, or type your own question.' },
      ],
    },
    {
      id: 'integrations',
      icon: RefreshCw,
      title: 'Integrations',
      description: 'Connect your tools for seamless workflows',
      content: [
        { q: 'How do I set up an integration?', a: 'Go to Integrations, click any service, follow the setup steps shown, enter your API credentials, then click "Test Connection" to verify. Each integration shows step-by-step instructions for getting your API keys.' },
        { q: 'Where do I get API keys?', a: 'Each integration has detailed instructions. Generally: CRMs provide keys in Settings > API/Integrations. For SendGrid, go to Settings > API Keys. For Twilio, find Account SID and Auth Token on your dashboard.' },
        { q: 'What CRMs are supported?', a: 'HubSpot (private app token), Pipedrive (API token), and Salesforce (OAuth). Each syncs leads bi-directionally - changes in either system stay in sync.' },
        { q: 'How do I connect email sending?', a: 'We support SendGrid. Create a SendGrid account, generate an API key with full access, and enter it in the Email integration setup along with your verified sender email.' },
        { q: 'How does SMS/calling work?', a: 'Connect Twilio by entering your Account SID, Auth Token, and a purchased phone number. This enables sequence steps with SMS and voice calls.' },
        { q: 'What enrichment services work?', a: 'Clearbit and Apollo.io. Both automatically fill in company data (size, revenue, industry, tech stack) and contact details (title, phone, social profiles) for your leads.' },
        { q: 'How do I verify emails?', a: 'Connect ZeroBounce or NeverBounce. These check if email addresses are deliverable before you send, protecting your sender reputation and improving deliverability.' },
        { q: 'Can I export my settings?', a: 'Yes, click "Export .env Template" to get a file with all your configuration keys. This is useful for backup or setting up on a new environment.' },
      ],
    },
    {
      id: 'compliance',
      icon: CheckCircle2,
      title: 'Compliance',
      description: 'Stay compliant with regulations',
      content: [
        { q: 'What is the DNC List?', a: 'Do Not Call list contains phone numbers that must not be contacted. Numbers are checked automatically before any call or SMS sequence step.' },
        { q: 'What is TCPA?', a: 'The Telephone Consumer Protection Act requires consent before automated calls or texts. We track consent status and block non-compliant outreach.' },
        { q: 'What is the Audit Trail?', a: 'A complete log of all compliance-related actions including consent records, opt-outs, and data changes. Required for regulatory audits.' },
        { q: 'How do retention policies work?', a: 'Data retention policies automatically archive or delete old records after a set period (e.g., 3 years for lead data). This helps with GDPR/CCPA compliance.' },
      ],
    },
  ];
  
  const quickTips = [
    { icon: Target, tip: 'Focus on Hot leads first - they have the highest conversion probability' },
    { icon: Clock, tip: 'Best times to reach prospects: Tuesday-Thursday, 9-11am or 3-5pm' },
    { icon: Mail, tip: 'Keep initial emails under 100 words for higher response rates' },
    { icon: Phone, tip: 'Always check DNC status before making outbound calls' },
    { icon: Brain, tip: 'Ask the AI Assistant for objection handling scripts before important calls' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: c.gray[100], marginBottom: 8 }}>Help Center</h1>
        <p style={{ fontSize: 14, color: c.gray[500] }}>Quick guides to help you get the most out of LeadGen Pro</p>
      </div>
      
      {/* Quick Tips */}
      <Card style={{ background: `linear-gradient(135deg, ${c.primary[50]}, ${c.accent.muted})`, border: `1px solid ${c.primary.DEFAULT}30` }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lightbulb size={18} style={{ color: c.primary.DEFAULT }} />
          Quick Tips
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {quickTips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <tip.icon size={16} style={{ color: c.primary.DEFAULT, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: c.gray[300] }}>{tip.tip}</span>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Feature Guides */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {helpSections.map(section => {
          const isExpanded = expandedSection === section.id;
          const Icon = section.icon;
          
          return (
            <Card key={section.id} padding={0} style={{ overflow: 'hidden' }}>
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: 18,
                  background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: r.lg, background: c.primary[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ color: c.primary.DEFAULT }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 2 }}>{section.title}</h3>
                  <p style={{ fontSize: 13, color: c.gray[500] }}>{section.description}</p>
                </div>
                <ChevronDown size={20} style={{ color: c.gray[500], transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: tokens.transition.fast }} />
              </button>
              
              {isExpanded && (
                <div style={{ padding: '0 18px 18px', borderTop: `1px solid ${c.gray[800]}`, marginTop: -1 }}>
                  <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {section.content.map((item, i) => (
                      <div key={i}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[200], marginBottom: 6 }}>{item.q}</p>
                        <p style={{ fontSize: 13, color: c.gray[400], lineHeight: 1.6 }}>{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      {/* Glossary */}
      <Card>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 16 }}>Glossary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { term: 'Lead Score', def: 'AI-calculated 1-100 rating indicating conversion likelihood' },
            { term: 'Hot Lead', def: 'High-intent prospect showing strong buying signals' },
            { term: 'Sequence', def: 'Automated series of outreach touchpoints' },
            { term: 'Enrollment', def: 'Adding a lead to a sequence' },
            { term: 'Pipeline Value', def: 'Total potential revenue from all active leads' },
            { term: 'Conversion Rate', def: 'Percentage of leads that become customers' },
            { term: 'DNC', def: 'Do Not Call - regulatory list of blocked numbers' },
            { term: 'TCPA', def: 'Telephone Consumer Protection Act - US calling regulations' },
            { term: 'Enrichment', def: 'Automatically adding data to lead records' },
            { term: 'Bounce Rate', def: 'Percentage of emails that fail to deliver' },
          ].map(item => (
            <div key={item.term} style={{ padding: 12, background: c.gray[850], borderRadius: r.md }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: c.gray[200], marginBottom: 4 }}>{item.term}</p>
              <p style={{ fontSize: 12, color: c.gray[500] }}>{item.def}</p>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Contact Support */}
      <Card style={{ textAlign: 'center', padding: 32 }}>
        <MessageSquare size={32} style={{ color: c.gray[500], marginBottom: 12 }} />
        <h3 style={{ fontSize: 16, fontWeight: 600, color: c.gray[100], marginBottom: 6 }}>Need More Help?</h3>
        <p style={{ fontSize: 13, color: c.gray[500], marginBottom: 16 }}>Our team is here to assist you</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button variant="secondary" icon={Mail}>Email Support</Button>
          <Button icon={Phone}>Schedule a Call</Button>
        </div>
      </Card>
    </div>
  );
};
export default HelpPage;