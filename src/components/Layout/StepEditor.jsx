
import { c, r, tokens } from '../../styles/theme';
import { Trash2 } from 'lucide-react';

export const StepEditor = ({ step, stepIndex, onUpdate, onDelete, channelColors }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: c.gray[100] }}>
          Step {stepIndex + 1}: {step.channel.charAt(0).toUpperCase() + step.channel.slice(1)}
        </h3>
        <button onClick={onDelete} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: c.error.muted, border: 'none', borderRadius: r.md, cursor: 'pointer', color: c.error.DEFAULT, fontSize: 13 }}>
          <Trash2 size={14} /> Delete
        </button>
      </div>
      
      {/* Delay */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 8 }}>
          {stepIndex === 0 ? 'When to send' : 'Wait time after previous step'}
        </label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input type="number" min="0" value={step.delayDays}
            onChange={(e) => onUpdate({ delayDays: parseInt(e.target.value) || 0 })}
            style={{ width: 70, padding: '8px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none' }}
          />
          <span style={{ color: c.gray[400], fontSize: 13 }}>days</span>
          <input type="number" min="0" max="23" value={step.delayHours || 0}
            onChange={(e) => onUpdate({ delayHours: parseInt(e.target.value) || 0 })}
            style={{ width: 70, padding: '8px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none' }}
          />
          <span style={{ color: c.gray[400], fontSize: 13 }}>hours</span>
        </div>
      </div>
      
      {step.channel === 'email' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 8 }}>Subject Line</label>
            <input type="text" value={step.subject || ''}
              onChange={(e) => onUpdate({ subject: e.target.value })}
              placeholder="Enter subject line... Use {first_name}, {company} for personalization"
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 8 }}>Email Body</label>
            <textarea
              value={step.body || ''}
              onChange={(e) => onUpdate({ body: e.target.value })}
              placeholder={`Hi {first_name},\n\nI noticed {company} has been...\n\nBest,\n{sender_name}`}
              rows={12}
              style={{ width: '100%', padding: 12, fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none', resize: 'vertical', fontFamily: tokens.font.sans, lineHeight: 1.6 }}
            />
          </div>
          <p style={{ fontSize: 12, color: c.gray[500], marginTop: 8 }}>
            Available variables: {'{first_name}'}, {'{last_name}'}, {'{company}'}, {'{title}'}, {'{sender_name}'}
          </p>
        </>
      )}
      
      {step.channel === 'linkedin' && (
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 8 }}>LinkedIn Message</label>
          <textarea
            value={step.body || ''}
            onChange={(e) => onUpdate({ body: e.target.value })}
            placeholder="Hi {first_name}, I came across your profile and..."
            rows={6}
            style={{ width: '100%', padding: 12, fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
          />
          <p style={{ fontSize: 12, color: c.gray[500], marginTop: 8 }}>Keep under 300 characters for connection requests</p>
        </div>
      )}
      
      {step.channel === 'sms' && (
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 8 }}>SMS Message</label>
          <textarea
            value={step.body || ''}
            onChange={(e) => onUpdate({ body: e.target.value })}
            placeholder="Hi {first_name}, quick follow up on my email..."
            rows={4}
            style={{ width: '100%', padding: 12, fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
          />
          <p style={{ fontSize: 12, color: c.gray[500], marginTop: 8 }}>
            {(step.body || '').length}/160 characters (1 SMS segment)
          </p>
        </div>
      )}
      
      {step.channel === 'call' && (
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 8 }}>Call Script / Notes</label>
          <textarea
            value={step.body || ''}
            onChange={(e) => onUpdate({ body: e.target.value })}
            placeholder="Opening: Hi {first_name}, this is [Your Name] from [Company]...\n\nKey points:\n- ...\n\nClose:\n- ..."
            rows={10}
            style={{ width: '100%', padding: 12, fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>
      )}
      
      {step.channel === 'task' && (
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 8 }}>Task Description</label>
          <textarea
            value={step.body || ''}
            onChange={(e) => onUpdate({ body: e.target.value })}
            placeholder="Check LinkedIn profile and engage with recent posts..."
            rows={4}
            style={{ width: '100%', padding: 12, fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>
      )}
    </div>
  );
};