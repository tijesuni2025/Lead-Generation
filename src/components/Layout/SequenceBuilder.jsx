import { useState } from 'react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { StepEditor } from './StepEditor';
import { Zap, Mail, Settings, ChevronDown } from 'lucide-react';
import { c, r, tokens } from '../../styles/theme';

export const SequenceBuilder = ({ sequence, onSave, onClose, channelIcons, channelColors }) => {
  const [editedSequence, setEditedSequence] = useState(JSON.parse(JSON.stringify(sequence)));
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('steps');
  
  const updateSequence = (updates) => {
    setEditedSequence(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
  };
  
  const addStep = (channel) => {
    const newStep = {
      id: `step-${Date.now()}`,
      order: editedSequence.steps.length,
      channel,
      delayDays: editedSequence.steps.length === 0 ? 0 : 2,
      delayHours: 0,
      subject: channel === 'email' ? '' : undefined,
      body: '',
      template: null,
    };
    updateSequence({ steps: [...editedSequence.steps, newStep] });
    setEditingStepIndex(editedSequence.steps.length);
  };
  
  const updateStep = (index, updates) => {
    const newSteps = [...editedSequence.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    updateSequence({ steps: newSteps });
  };
  
  const deleteStep = (index) => {
    const newSteps = editedSequence.steps.filter((_, i) => i !== index);
    updateSequence({ steps: newSteps });
    setEditingStepIndex(null);
  };
  
  const moveStep = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= editedSequence.steps.length) return;
    const newSteps = [...editedSequence.steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    updateSequence({ steps: newSteps });
  };
  
  const handleSave = () => {
    onSave(editedSequence);
  };
  
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', zIndex: 100, overflowY: 'auto' }}>
      <Card onClick={(e) => e.stopPropagation()} padding={0} style={{ width: '100%', maxWidth: 900, marginBottom: 40 }}>
        <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="text"
              value={editedSequence.name}
              onChange={(e) => updateSequence({ name: e.target.value })}
              style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], background: 'transparent', border: 'none', outline: 'none', padding: 0 }}
              placeholder="Sequence name"
            />
            <span style={{
              padding: '4px 10px', borderRadius: r.full, fontSize: 11, fontWeight: 500,
              background: c.gray[800], color: c.gray[400],
            }}>
              {editedSequence.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Sequence</Button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${c.gray[800]}`, flexShrink: 0 }}>
          {[
            { id: 'steps', label: 'Steps', icon: Zap },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px',
                fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer',
                color: activeTab === tab.id ? c.primary.DEFAULT : c.gray[500],
                background: 'transparent',
                borderBottom: activeTab === tab.id ? `2px solid ${c.primary.DEFAULT}` : '2px solid transparent',
                marginBottom: -1,
              }}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', minHeight: 400 }}>
          {activeTab === 'steps' && (
            <>
              <div style={{ width: 340, borderRight: `1px solid ${c.gray[800]}`, padding: 16, overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {editedSequence.steps.map((step, i) => {
                    const Icon = channelIcons[step.channel] || Mail;
                    const isEditing = editingStepIndex === i;
                    
                    return (
                      <div key={step.id} 
                        onClick={() => setEditingStepIndex(i)}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: 10, padding: 12,
                          background: isEditing ? c.primary[100] : c.gray[850],
                          border: `1px solid ${isEditing ? c.primary.DEFAULT : c.gray[800]}`,
                          borderRadius: r.lg, cursor: 'pointer',
                          transition: tokens.transition.fast,
                        }}>
                        <div style={{ width: 32, height: 32, borderRadius: r.md, background: channelColors[step.channel] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={16} style={{ color: channelColors[step.channel] }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[200], marginBottom: 2 }}>
                            {step.channel.charAt(0).toUpperCase() + step.channel.slice(1)}
                          </p>
                          <p style={{ fontSize: 11, color: c.gray[500], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {step.delayDays === 0 ? 'Immediately' : `Wait ${step.delayDays} day${step.delayDays > 1 ? 's' : ''}`}
                            {step.subject ? ` • ${step.subject}` : ''}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <button onClick={(e) => { e.stopPropagation(); moveStep(i, -1); }} disabled={i === 0}
                            style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', padding: 2, opacity: i === 0 ? 0.3 : 1 }}>
                            <ChevronDown size={14} style={{ color: c.gray[500], transform: 'rotate(180deg)' }} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); moveStep(i, 1); }} disabled={i === editedSequence.steps.length - 1}
                            style={{ background: 'none', border: 'none', cursor: i === editedSequence.steps.length - 1 ? 'default' : 'pointer', padding: 2, opacity: i === editedSequence.steps.length - 1 ? 0.3 : 1 }}>
                            <ChevronDown size={14} style={{ color: c.gray[500] }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <p style={{ fontSize: 12, color: c.gray[500], marginBottom: 10 }}>Add step:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {Object.entries(channelIcons).map(([channel, Icon]) => (
                    <button key={channel} onClick={() => addStep(channel)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 12, background: c.gray[850], border: `1px solid ${c.gray[800]}`, borderRadius: r.lg, cursor: 'pointer', transition: tokens.transition.fast }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = channelColors[channel]}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = c.gray[800]}>
                      <Icon size={18} style={{ color: channelColors[channel] }} />
                      <span style={{ fontSize: 11, color: c.gray[400] }}>{channel.charAt(0).toUpperCase() + channel.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
                {editingStepIndex !== null && editedSequence.steps[editingStepIndex] ? (
                  <StepEditor
                    step={editedSequence.steps[editingStepIndex]}
                    stepIndex={editingStepIndex}
                    onUpdate={(updates) => updateStep(editingStepIndex, updates)}
                    onDelete={() => deleteStep(editingStepIndex)}
                    channelColors={channelColors}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: c.gray[500] }}>
                    <Zap size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <p style={{ fontSize: 14 }}>Select a step to edit</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>or add a new step from the left panel</p>
                  </div>
                )}
              </div>
            </>
          )}
          
          {activeTab === 'settings' && (
            <div style={{ flex: 1, padding: 20 }}>
              <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 8 }}>Description</label>
                  <textarea
                    value={editedSequence.description || ''}
                    onChange={(e) => updateSequence({ description: e.target.value })}
                    placeholder="Describe what this sequence is for..."
                    rows={3}
                    style={{ width: '100%', padding: 12, fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none', resize: 'vertical' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 8 }}>Send Window</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input type="number" min="0" max="23" value={editedSequence.settings.sendWindow.start}
                      onChange={(e) => updateSequence({ settings: { ...editedSequence.settings, sendWindow: { ...editedSequence.settings.sendWindow, start: parseInt(e.target.value) } } })}
                      style={{ width: 70, padding: '8px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none' }}
                    />
                    <span style={{ color: c.gray[500] }}>to</span>
                    <input type="number" min="0" max="23" value={editedSequence.settings.sendWindow.end}
                      onChange={(e) => updateSequence({ settings: { ...editedSequence.settings, sendWindow: { ...editedSequence.settings.sendWindow, end: parseInt(e.target.value) } } })}
                      style={{ width: 70, padding: '8px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none' }}
                    />
                    <span style={{ color: c.gray[500], fontSize: 13 }}>(24h format, recipient's timezone)</span>
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 12 }}>Daily Sending Limit</label>
                  <input type="number" min="1" max="500" value={editedSequence.settings.dailyLimit}
                    onChange={(e) => updateSequence({ settings: { ...editedSequence.settings, dailyLimit: parseInt(e.target.value) } })}
                    style={{ width: 100, padding: '8px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none' }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { key: 'skipWeekends', label: 'Skip weekends', desc: 'Don\'t send on Saturday or Sunday' },
                    { key: 'stopOnReply', label: 'Stop on reply', desc: 'Pause sequence when lead replies' },
                    { key: 'stopOnMeeting', label: 'Stop on meeting booked', desc: 'Pause when lead books a meeting' },
                  ].map(setting => (
                    <label key={setting.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editedSequence.settings[setting.key]}
                        onChange={(e) => updateSequence({ settings: { ...editedSequence.settings, [setting.key]: e.target.checked } })}
                        style={{ marginTop: 3 }}
                      />
                      <div>
                        <p style={{ fontSize: 14, color: c.gray[200] }}>{setting.label}</p>
                        <p style={{ fontSize: 12, color: c.gray[500] }}>{setting.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
