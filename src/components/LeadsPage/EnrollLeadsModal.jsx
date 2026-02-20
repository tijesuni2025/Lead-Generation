import { c, r } from '../../styles/theme';
import { useState, useMemo } from 'react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Avatar } from '../UserProfile/Avatar';
import { MOCK_LEADS } from '../../Data/Mocks';
import { Search } from 'lucide-react';
import { sequenceEngine } from '../../utils/sequenceEngine';



export const EnrollLeadsModal = ({ sequenceId, onClose, onEnroll }) => {
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get mock leads (in real app, would come from leads service)
  const allLeads = useMemo(() => MOCK_LEADS, []);
  
  const filteredLeads = useMemo(() => {
    return allLeads.filter(lead => 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allLeads, searchTerm]);
  
  const toggleLead = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };
  
  const selectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };
  
  const handleEnroll = () => {
    const sequence = sequenceEngine.sequences.get(sequenceId);
    if (sequence) {
      sequence.stats.enrolled += selectedLeads.length;
      sequence.stats.active += selectedLeads.length;
    }
    onEnroll();
  };
  
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100 }}>
      <Card onClick={(e) => e.stopPropagation()} padding={0} style={{ width: '100%', maxWidth: 600, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}` }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100], marginBottom: 4 }}>Enroll Leads in Sequence</h2>
          <p style={{ fontSize: 13, color: c.gray[500] }}>Select leads to add to this sequence</p>
        </div>
        
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${c.gray[800]}` }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: c.gray[500] }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads..."
              style={{ width: '100%', padding: '10px 12px 10px 40px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none' }}
            />
          </div>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', padding: '0 20px' }}>
          <div style={{ padding: '12px 0', borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="checkbox" checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0} onChange={selectAll} />
            <span style={{ fontSize: 13, color: c.gray[400] }}>
              {selectedLeads.length > 0 ? `${selectedLeads.length} selected` : 'Select all'}
            </span>
          </div>
          
          {filteredLeads.map(lead => (
            <div key={lead.id} onClick={() => toggleLead(lead.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${c.gray[850]}`, cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => {}} />
              <Avatar name={lead.name} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[200] }}>{lead.name}</p>
                <p style={{ fontSize: 12, color: c.gray[500], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {lead.title} at {lead.company}
                </p>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: r.full, fontSize: 11, background: c.gray[800], color: c.gray[400] }}>
                {lead.status}
              </span>
            </div>
          ))}
        </div>
        
        <div style={{ padding: 20, borderTop: `1px solid ${c.gray[800]}`, display: 'flex', gap: 10 }}>
          <Button variant="secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</Button>
          <Button style={{ flex: 1 }} onClick={handleEnroll} disabled={selectedLeads.length === 0}>
            Enroll {selectedLeads.length} Lead{selectedLeads.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </Card>
    </div>
  );
};