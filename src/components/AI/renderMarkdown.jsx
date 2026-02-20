// import { useState, useMemo } from 'react';
// import { Card } from '../UI/Card';
// import {Button } from '../UI/Button';
// import { Avatar } from '../UserProfile/Avatar';
// import { Search } from 'lucide-react';
import { c, r } from '../../styles/theme';
// import { MOCK_LEADS_BY_CLIENT } from '../../Data/Mocks';
// import { sequenceEngine } from '../../services/sequenceService';

export const renderMarkdown = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  let inTable = false;
  let tableRows = [];
  let inCodeBlock = false;
  let codeContent = [];
  
  const processInlineFormatting = (line, idx) => {
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={`${idx}-${i}`} style={{ color: c.gray[100] }}>{part}</strong> : part);
  };
  
  lines.forEach((line, idx) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={idx} style={{ background: c.gray[900], padding: 12, borderRadius: r.md, fontSize: 13, fontFamily: tokens.font.mono, overflowX: 'auto', margin: '8px 0' }}>
            {codeContent.join('\n')}
          </pre>
        );
        codeContent = [];
      }
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) { codeContent.push(line); return; }
    
    if (line.startsWith('## ')) {
      elements.push(<h2 key={idx} style={{ fontSize: 16, fontWeight: 600, color: c.gray[100], margin: '16px 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>{line.slice(3)}</h2>);
      return;
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={idx} style={{ fontSize: 14, fontWeight: 600, color: c.gray[200], margin: '12px 0 6px' }}>{line.slice(4)}</h3>);
      return;
    }
    
    if (line.startsWith('|')) {
      if (!inTable) { inTable = true; tableRows = []; }
      tableRows.push(line);
      return;
    } else if (inTable) {
      const headers = tableRows[0]?.split('|').filter(c => c.trim()).map(c => c.trim());
      const dataRows = tableRows.slice(2).map(r => r.split('|').filter(c => c.trim()).map(c => c.trim()));
      
      elements.push(
        <div key={`table-${idx}`} style={{ overflowX: 'auto', margin: '8px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{headers?.map((h, i) => <th key={i} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: `1px solid ${c.gray[700]}`, color: c.gray[300], fontWeight: 600 }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => <td key={ci} style={{ padding: '8px 12px', borderBottom: `1px solid ${c.gray[800]}`, color: c.gray[300] }}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableRows = [];
    }
    
    if (line === '---') {
      elements.push(<hr key={idx} style={{ border: 'none', borderTop: `1px solid ${c.gray[800]}`, margin: '12px 0' }} />);
      return;
    }
    
    if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={idx} style={{ display: 'flex', gap: 8, marginLeft: 8, marginBottom: 4 }}>
          <span style={{ color: c.gray[500] }}>•</span>
          <span style={{ color: c.gray[300], lineHeight: 1.5 }}>{processInlineFormatting(line.slice(2), idx)}</span>
        </div>
      );
      return;
    }
    
    // Numbered lists
    const numMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      elements.push(
        <div key={idx} style={{ display: 'flex', gap: 8, marginLeft: 4, marginBottom: 4 }}>
          <span style={{ color: c.primary.DEFAULT, fontWeight: 600, minWidth: 20 }}>{numMatch[1]}.</span>
          <span style={{ color: c.gray[300], lineHeight: 1.5 }}>{processInlineFormatting(numMatch[2], idx)}</span>
        </div>
      );
      return;
    }
    
    if (!line.trim()) {
      elements.push(<div key={idx} style={{ height: 8 }} />);
      return;
    }
    
    elements.push(<p key={idx} style={{ color: c.gray[300], lineHeight: 1.6, marginBottom: 4 }}>{processInlineFormatting(line, idx)}</p>);
  });
  
  return elements;
};