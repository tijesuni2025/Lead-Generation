import { c, r, tokens } from '../../styles/theme';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Avatar } from '../UserProfile/Avatar';    
import { MOCK_LEADS_BY_CLIENT } from '../../Data/Mocks';
import {
  LayoutDashboard, Users, Upload, X, Search,
  TrendingUp, ChevronLeft, Bell, Filter, Download,
  Plus, Eye, Phone, Mail, Calendar, Clock,
  Target, Zap, Activity, RefreshCw,
  Building2, User, CheckCircle2, AlertCircle,
  FileText, FileJson, Check, ArrowRight,
  Sparkles, ExternalLink, TrendingUp as TrendUp,
  Globe, DollarSign, Briefcase, Award, Linkedin, Shield, Video, MapPin
} from 'lucide-react';
import { fmt } from '../../utils/formatters';
import StatusBadge from '../UI/StatusBadge';
//import { StatusBadge, Card, Button, Avatar, Score, ModalOverlay, MOCK_LEADS_BY_CLIENT } from '../index';
import { Score } from '../UI/Score';
import { ModalOverlay } from '../Layout/ModalOverlay';
//import { VerificationBadge } from '.UI/VerificationBadge';



export const LeadsPage = ({ user, highlightLead }) => {
  const [leads, setLeads] = useState(MOCK_LEADS_BY_CLIENT[user.id] || []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('score');
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const handleImportLeads = (importedLeads) => {
    setLeads(prev => [...importedLeads, ...prev]);
    setShowImport(false);
  };
  
  const filtered = useMemo(() => {
    return leads
      .filter(l => {
        if (status !== 'all' && l.status !== status) return false;
        if (search) {
          const q = search.toLowerCase();
          return l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === 'score') return b.score - a.score;
        if (sort === 'value') return b.value - a.value;
        if (sort === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
        return a.name.localeCompare(b.name);
      });
  }, [leads, search, status, sort]);
  
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filtered.slice(startIndex, endIndex);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, sort, itemsPerPage]);
  
  const stats = useMemo(() => ({
    total: leads.length,
    hot: leads.filter(l => l.status === 'Hot').length,
    warm: leads.filter(l => l.status === 'Warm').length,
    cold: leads.filter(l => l.status === 'Cold').length,
  }), [leads]);
  
  const updateLead = (updatedLead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    setSelectedLead(updatedLead);
  };
  
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 32, padding: '14px 20px', background: c.gray[900], borderRadius: r.xl, border: `1px solid ${c.gray[800]}` }}>
        {[
          { label: 'Total', value: stats.total, color: c.gray[100] },
          { label: 'Hot', value: stats.hot, color: c.hot.text },
          { label: 'Warm', value: stats.warm, color: c.warm.text },
          { label: 'Cold', value: stats.cold, color: c.cold.text },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 13, color: c.gray[500] }}>{s.label}</span>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, maxWidth: 300, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: c.gray[500] }} />
          <input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 40px', fontSize: 14, color: c.gray[100], background: c.gray[900], border: `1px solid ${c.gray[800]}`, borderRadius: r.lg, outline: 'none' }}
          />
        </div>
        
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          style={{ padding: '9px 14px', fontSize: 14, color: c.gray[300], background: c.gray[900], border: `1px solid ${c.gray[800]}`, borderRadius: r.lg, outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="Hot">Hot</option>
          <option value="Warm">Warm</option>
          <option value="Cold">Cold</option>
          <option value="New">New</option>
        </select>
        
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          style={{ padding: '9px 14px', fontSize: 14, color: c.gray[300], background: c.gray[900], border: `1px solid ${c.gray[800]}`, borderRadius: r.lg, outline: 'none', cursor: 'pointer' }}>
          <option value="score">Sort by Score</option>
          <option value="value">Sort by Value</option>
          <option value="recent">Most Recent</option>
          <option value="name">Alphabetical</option>
        </select>
        
        <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}
          style={{ padding: '9px 14px', fontSize: 14, color: c.gray[300], background: c.gray[900], border: `1px solid ${c.gray[800]}`, borderRadius: r.lg, outline: 'none', cursor: 'pointer' }}>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Button variant="gradient" icon={Upload} onClick={() => setShowImport(true)}>Import</Button>
          <Button variant="secondary" icon={Download} onClick={() => setShowExport(true)}>Export</Button>
        </div>
      </div>
      
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Lead', 'Company', 'Status', 'Score', 'Value', 'Source', 'Verified'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: c.gray[500], textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${c.gray[800]}`, background: c.gray[850] }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map(lead => {
                const highlight = highlightLead?.id === lead.id;
                return (
                  <tr key={lead.id} 
                    onClick={() => setSelectedLead(lead)}
                    style={{ background: highlight ? c.primary[50] : 'transparent', transition: tokens.transition.fast, cursor: 'pointer' }}
                    onMouseEnter={(e) => { if (!highlight) e.currentTarget.style.background = c.gray[850]; }}
                    onMouseLeave={(e) => { if (!highlight) e.currentTarget.style.background = 'transparent'; }}>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.gray[850]}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={lead.name} size={34} />
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100] }}>{lead.name}</p>
                          <p style={{ fontSize: 12, color: c.gray[500] }}>{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.gray[850]}` }}>
                      <p style={{ fontSize: 14, color: c.gray[200] }}>{lead.company}</p>
                      <p style={{ fontSize: 12, color: c.gray[500] }}>{lead.title}</p>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.gray[850]}` }}><StatusBadge status={lead.status} /></td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.gray[850]}` }}><Score value={lead.score} /></td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.gray[850]}`, fontSize: 14, fontWeight: 500, color: c.gray[200] }}>{fmt.currency(lead.value)}</td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.gray[850]}`, fontSize: 13, color: c.gray[400] }}>{lead.source}</td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.gray[850]}` }}>
                      <VerificationBadge lead={lead} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filtered.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Search size={40} style={{ color: c.gray[600], marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 500, color: c.gray[400], marginBottom: 4 }}>No leads found</p>
            <p style={{ fontSize: 13, color: c.gray[500] }}>Try adjusting your filters</p>
          </div>
        )}
        
        {filtered.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${c.gray[800]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: c.gray[500] }}>
              Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} leads
            </p>
            
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 10px', fontSize: 13, fontWeight: 500, border: 'none', borderRadius: r.md, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  background: c.gray[800], color: currentPage === 1 ? c.gray[600] : c.gray[300],
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}>
                Previous
              </button>
              
              {getPageNumbers().map((pageNum, idx) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${idx}`} style={{ padding: '6px 8px', fontSize: 13, color: c.gray[500] }}>...</span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    style={{
                      padding: '6px 12px', fontSize: 13, fontWeight: 500, border: 'none', borderRadius: r.md, cursor: 'pointer',
                      background: currentPage === pageNum ? c.primary.DEFAULT : c.gray[800],
                      color: currentPage === pageNum ? '#fff' : c.gray[300],
                    }}>
                    {pageNum}
                  </button>
                )
              ))}
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 10px', fontSize: 13, fontWeight: 500, border: 'none', borderRadius: r.md, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  background: c.gray[800], color: currentPage === totalPages ? c.gray[600] : c.gray[300],
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}>
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
      
      {showExport && <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} data={filtered} />}
      
      {showImport && (
        <LeadImportModal 
          onClose={() => setShowImport(false)}
          onImport={handleImportLeads}
          existingLeads={leads}
        />
      )}
      
      {selectedLead && (
        <LeadDetailModal 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)}
          onUpdate={updateLead}
        />
      )}
    </div>
  );
};

const VerificationBadge = ({ lead }) => {
  const isEmailVerified = lead.emailVerified;
  const isEnriched = lead.enriched;
  
  if (isEmailVerified && isEnriched) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: r.full, background: c.success.muted, color: c.success.DEFAULT, fontSize: 11, fontWeight: 500 }}>
        <CheckCircle2 size={12} /> Verified
      </span>
    );
  }
  
  if (isEmailVerified || isEnriched) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: r.full, background: c.warning.muted, color: c.warning.DEFAULT, fontSize: 11, fontWeight: 500 }}>
        <AlertCircle size={12} /> Partial
      </span>
    );
  }
  
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: r.full, background: c.gray[800], color: c.gray[500], fontSize: 11, fontWeight: 500 }}>
      <Clock size={12} /> Pending
    </span>
  );
};

const LEAD_FIELDS = [
  { id: 'name', label: 'Full Name', required: true, example: 'John Smith' },
  { id: 'email', label: 'Email Address', required: true, example: 'john@company.com' },
  { id: 'company', label: 'Company', required: true, example: 'Acme Corp' },
  { id: 'title', label: 'Job Title', required: false, example: 'VP of Sales' },
  { id: 'phone', label: 'Phone Number', required: false, example: '+1 555-123-4567' },
  { id: 'linkedin', label: 'LinkedIn URL', required: false, example: 'linkedin.com/in/johnsmith' },
  { id: 'website', label: 'Website', required: false, example: 'www.company.com' },
  { id: 'industry', label: 'Industry', required: false, example: 'Technology' },
  { id: 'employees', label: 'Company Size', required: false, example: '100-500' },
  { id: 'revenue', label: 'Revenue', required: false, example: '$10M-$50M' },
  { id: 'location', label: 'Location', required: false, example: 'New York, NY' },
  { id: 'source', label: 'Lead Source', required: false, example: 'LinkedIn' },
  { id: 'notes', label: 'Notes', required: false, example: 'Met at conference' },
  { id: 'value', label: 'Deal Value', required: false, example: '50000' },
  { id: 'status', label: 'Status', required: false, example: 'New' },
];

const LeadImportModal = ({ onClose, onImport, existingLeads = [] }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Preview, 4: Results
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [previewData, setPreviewData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [duplicateHandling, setDuplicateHandling] = useState('skip'); // skip, update, allow
  const fileInputRef = useRef(null);
  
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return { headers: [], data: [] };
    
    const parseRow = (row) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    const headers = parseRow(lines[0]);
    const data = lines.slice(1).map(line => {
      const values = parseRow(line);
      const row = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });
    
    return { headers, data };
  };
  
  const parseJSON = (text) => {
    const data = JSON.parse(text);
    const rows = Array.isArray(data) ? data : [data];
    if (rows.length === 0) return { headers: [], data: [] };
    
    const headers = [...new Set(rows.flatMap(row => Object.keys(row)))];
    return { headers, data: rows };
  };
  
  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    
    setFile(selectedFile);
    const text = await selectedFile.text();
    
    let parsed;
    if (selectedFile.name.endsWith('.json')) {
      try {
        parsed = parseJSON(text);
      } catch (e) {
        alert('Invalid JSON file');
        return;
      }
    } else {
      parsed = parseCSV(text);
    }
    
    setHeaders(parsed.headers);
    setRawData(parsed.data);
    
    const autoMapping = {};
    parsed.headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z]/g, '');
      const matchedField = LEAD_FIELDS.find(f => {
        const normalizedField = f.label.toLowerCase().replace(/[^a-z]/g, '');
        const normalizedId = f.id.toLowerCase();
        return normalizedHeader.includes(normalizedField) || 
               normalizedHeader.includes(normalizedId) ||
               normalizedField.includes(normalizedHeader) ||
               normalizedHeader === normalizedId;
      });
      if (matchedField) {
        autoMapping[header] = matchedField.id;
      }
    });
    setFieldMapping(autoMapping);
    
    setStep(2);
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };
  
  const validateAndPreview = () => {
    const errors = [];
    const preview = [];
    const emailSet = new Set(existingLeads.map(l => l.email?.toLowerCase()));
    
    rawData.forEach((row, index) => {
      const lead = {};
      const rowErrors = [];
      
      Object.entries(fieldMapping).forEach(([csvHeader, leadField]) => {
        if (leadField && row[csvHeader]) {
          lead[leadField] = row[csvHeader];
        }
      });
      
      LEAD_FIELDS.filter(f => f.required).forEach(field => {
        if (!lead[field.id] || !lead[field.id].trim()) {
          rowErrors.push(`Missing ${field.label}`);
        }
      });
      
      if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
        rowErrors.push('Invalid email format');
      }
      
      const isDuplicate = lead.email && emailSet.has(lead.email.toLowerCase());
      if (isDuplicate && duplicateHandling === 'skip') {
        rowErrors.push('Duplicate email (will be skipped)');
      }
      
      preview.push({
        index: index + 1,
        data: lead,
        errors: rowErrors,
        isDuplicate,
        isValid: rowErrors.length === 0 || (isDuplicate && duplicateHandling === 'skip'),
      });
      
      if (rowErrors.length > 0) {
        errors.push({ row: index + 1, errors: rowErrors });
      }
    });
    
    setPreviewData(preview);
    setValidationErrors(errors);
    setStep(3);
  };
  
  // Execute import
  const executeImport = async () => {
    setImporting(true);
    
    const results = {
      total: previewData.length,
      imported: 0,
      skipped: 0,
      errors: 0,
      duplicates: 0,
      leads: [],
    };
    
    await new Promise(r => setTimeout(r, 500));
    
    const existingEmails = new Set(existingLeads.map(l => l.email?.toLowerCase()));
    
    previewData.forEach((item) => {
      if (item.isDuplicate) {
        if (duplicateHandling === 'skip') {
          results.skipped++;
          results.duplicates++;
          return;
        }
      }
      
      if (item.errors.length > 0 && !item.isDuplicate) {
        results.errors++;
        return;
      }
      
      const newLead = {
        id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.data.name || 'Unknown',
        email: item.data.email || '',
        company: item.data.company || 'Unknown',
        title: item.data.title || '',
        phone: item.data.phone || '',
        linkedin: item.data.linkedin || '',
        website: item.data.website || '',
        industry: item.data.industry || '',
        employees: item.data.employees || '',
        location: item.data.location || '',
        source: item.data.source || 'CSV Import',
        notes: item.data.notes || '',
        value: parseInt(item.data.value) || Math.floor(Math.random() * 50000) + 5000,
        status: item.data.status || 'New',
        score: Math.floor(Math.random() * 40) + 30,
        createdAt: new Date().toISOString(),
        emailVerified: false,
        enriched: false,
        activities: [],
        tags: ['Imported'],
      };
      
      results.leads.push(newLead);
      results.imported++;
    });
    
    setImportResults(results);
    setImporting(false);
    setStep(4);
  };
  
  const downloadTemplate = () => {
    const headers = LEAD_FIELDS.map(f => f.label).join(',');
    const example = LEAD_FIELDS.map(f => f.example).join(',');
    const csv = `${headers}\n${example}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const completeImport = () => {
    if (importResults && importResults.leads.length > 0) {
      onImport(importResults.leads);
    } else {
      onClose();
    }
  };
  
  const validCount = previewData.filter(p => p.isValid && !p.isDuplicate).length;
  const errorCount = previewData.filter(p => !p.isValid && !p.isDuplicate).length;
  const duplicateCount = previewData.filter(p => p.isDuplicate).length;

  return (
    <ModalOverlay onClose={onClose} maxWidth={step === 3 ? 900 : 600}>
      <Card padding={0} style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Import Leads</h2>
            <p style={{ fontSize: 13, color: c.gray[500], marginTop: 2 }}>
              {step === 1 && 'Upload your CSV, Excel, or JSON file'}
              {step === 2 && 'Map your columns to lead fields'}
              {step === 3 && 'Review and validate your data'}
              {step === 4 && 'Import complete'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} style={{ color: c.gray[500] }} />
          </button>
        </div>
        
        {/* Progress Steps */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${c.gray[850]}`, display: 'flex', gap: 8 }}>
          {[
            { num: 1, label: 'Upload' },
            { num: 2, label: 'Map Fields' },
            { num: 3, label: 'Preview' },
            { num: 4, label: 'Complete' },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: r.full, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step >= s.num ? tokens.gradients.brand : c.gray[800],
                  color: step >= s.num ? '#fff' : c.gray[500],
                  fontSize: 13, fontWeight: 600,
                }}>
                  {step > s.num ? <CheckCircle2 size={16} /> : s.num}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: step >= s.num ? c.gray[200] : c.gray[500] }}>{s.label}</span>
              </div>
              {i < 3 && <div style={{ flex: 1, height: 2, background: step > s.num ? c.primary.DEFAULT : c.gray[800], borderRadius: 1 }} />}
            </React.Fragment>
          ))}
        </div>
        
        {/* Content */}
        <div style={{ padding: 24 }}>
          {/* Step 1: Upload */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragActive ? c.primary.DEFAULT : c.gray[700]}`,
                  borderRadius: r.xl,
                  padding: 50,
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragActive ? c.primary[50] : c.gray[850],
                  transition: tokens.transition.fast,
                }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  style={{ display: 'none' }}
                />
                <Upload size={40} style={{ color: dragActive ? c.primary.DEFAULT : c.gray[500], margin: '0 auto 16px' }} />
                <p style={{ fontSize: 15, fontWeight: 500, color: c.gray[200], marginBottom: 6 }}>
                  Drop your file here or click to browse
                </p>
                <p style={{ fontSize: 13, color: c.gray[500] }}>
                  Supports CSV, Excel (.xlsx), and JSON files
                </p>
              </div>
              
              <Card style={{ background: c.gray[850] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: r.lg, background: c.primary[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} style={{ color: c.primary.DEFAULT }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[200] }}>Download Template</p>
                    <p style={{ fontSize: 12, color: c.gray[500] }}>Get a CSV template with all available fields</p>
                  </div>
                  <Button variant="secondary" size="sm" icon={Download} onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}>
                    Download
                  </Button>
                </div>
              </Card>
              
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: c.gray[400], marginBottom: 10 }}>Supported Fields</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {LEAD_FIELDS.map(field => (
                    <span key={field.id} style={{
                      padding: '4px 10px', borderRadius: r.full, fontSize: 12,
                      background: field.required ? c.primary[100] : c.gray[800],
                      color: field.required ? c.primary.DEFAULT : c.gray[400],
                    }}>
                      {field.label}{field.required && ' *'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Card style={{ background: c.gray[850] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={18} style={{ color: c.primary.DEFAULT }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[200] }}>{file?.name}</p>
                    <p style={{ fontSize: 12, color: c.gray[500] }}>{rawData.length} rows found</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setStep(1); setFile(null); }}>Change File</Button>
                </div>
              </Card>
              
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: c.gray[400], marginBottom: 12 }}>Map Your Columns</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {headers.map(header => (
                    <div key={header} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 180, padding: '10px 14px', background: c.gray[850], borderRadius: r.md, fontSize: 13, color: c.gray[300], fontFamily: tokens.font.mono }}>
                        {header}
                      </div>
                      <ArrowRight size={18} style={{ color: c.gray[600] }} />
                      <select
                        value={fieldMapping[header] || ''}
                        onChange={(e) => setFieldMapping(prev => ({ ...prev, [header]: e.target.value }))}
                        style={{
                          flex: 1, padding: '10px 14px', fontSize: 14, color: c.gray[200],
                          background: c.gray[900], border: `1px solid ${c.gray[800]}`,
                          borderRadius: r.md, outline: 'none', cursor: 'pointer',
                        }}>
                        <option value="">-- Skip this column --</option>
                        {LEAD_FIELDS.map(field => (
                          <option key={field.id} value={field.id}>
                            {field.label}{field.required ? ' *' : ''}
                          </option>
                        ))}
                      </select>
                      {fieldMapping[header] && (
                        <CheckCircle2 size={18} style={{ color: c.success.DEFAULT }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ padding: 14, background: c.gray[850], borderRadius: r.lg }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: c.gray[400], marginBottom: 8 }}>Required Fields</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  {LEAD_FIELDS.filter(f => f.required).map(field => {
                    const isMapped = Object.values(fieldMapping).includes(field.id);
                    return (
                      <div key={field.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isMapped ? (
                          <CheckCircle2 size={14} style={{ color: c.success.DEFAULT }} />
                        ) : (
                          <AlertCircle size={14} style={{ color: c.error.DEFAULT }} />
                        )}
                        <span style={{ fontSize: 12, color: isMapped ? c.gray[300] : c.error.DEFAULT }}>{field.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Total Rows', value: previewData.length, color: c.gray[200] },
                  { label: 'Valid', value: validCount, color: c.success.DEFAULT },
                  { label: 'Duplicates', value: duplicateCount, color: c.warning.DEFAULT },
                  { label: 'Errors', value: errorCount, color: c.error.DEFAULT },
                ].map(stat => (
                  <div key={stat.label} style={{ padding: 14, background: c.gray[850], borderRadius: r.lg, textAlign: 'center' }}>
                    <p style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</p>
                    <p style={{ fontSize: 12, color: c.gray[500] }}>{stat.label}</p>
                  </div>
                ))}
              </div>
              
              {duplicateCount > 0 && (
                <Card style={{ background: c.warning.muted, border: `1px solid ${c.warning.DEFAULT}30` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <AlertCircle size={20} style={{ color: c.warning.DEFAULT }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100] }}>
                        {duplicateCount} duplicate email{duplicateCount > 1 ? 's' : ''} found
                      </p>
                      <p style={{ fontSize: 12, color: c.gray[400] }}>Choose how to handle duplicates:</p>
                    </div>
                    <select
                      value={duplicateHandling}
                      onChange={(e) => { setDuplicateHandling(e.target.value); validateAndPreview(); }}
                      style={{
                        padding: '8px 12px', fontSize: 13, background: c.gray[900],
                        border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[200],
                      }}>
                      <option value="skip">Skip duplicates</option>
                      <option value="update">Update existing</option>
                      <option value="allow">Import anyway</option>
                    </select>
                  </div>
                </Card>
              )}
              
              <div style={{ background: c.gray[850], borderRadius: r.lg, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${c.gray[800]}` }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: c.gray[400] }}>Data Preview</p>
                </div>
                <div style={{ overflowX: 'auto', maxHeight: 300 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: c.gray[500], background: c.gray[900], position: 'sticky', top: 0 }}>#</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: c.gray[500], background: c.gray[900], position: 'sticky', top: 0 }}>Status</th>
                        {LEAD_FIELDS.filter(f => Object.values(fieldMapping).includes(f.id)).map(field => (
                          <th key={field.id} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: c.gray[500], background: c.gray[900], position: 'sticky', top: 0, whiteSpace: 'nowrap' }}>
                            {field.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 50).map((row) => (
                        <tr key={row.index} style={{ background: row.errors.length > 0 ? c.error.muted + '30' : row.isDuplicate ? c.warning.muted + '30' : 'transparent' }}>
                          <td style={{ padding: '10px 12px', color: c.gray[500], borderBottom: `1px solid ${c.gray[800]}` }}>{row.index}</td>
                          <td style={{ padding: '10px 12px', borderBottom: `1px solid ${c.gray[800]}` }}>
                            {row.errors.length === 0 && !row.isDuplicate ? (
                              <CheckCircle2 size={16} style={{ color: c.success.DEFAULT }} />
                            ) : row.isDuplicate ? (
                              <span title="Duplicate" style={{ color: c.warning.DEFAULT }}><AlertCircle size={16} /></span>
                            ) : (
                              <span title={row.errors.join(', ')} style={{ color: c.error.DEFAULT }}><AlertCircle size={16} /></span>
                            )}
                          </td>
                          {LEAD_FIELDS.filter(f => Object.values(fieldMapping).includes(f.id)).map(field => (
                            <td key={field.id} style={{ padding: '10px 12px', color: c.gray[300], borderBottom: `1px solid ${c.gray[800]}`, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {row.data[field.id] || <span style={{ color: c.gray[600] }}>—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length > 50 && (
                  <div style={{ padding: '10px 16px', borderTop: `1px solid ${c.gray[800]}`, fontSize: 12, color: c.gray[500], textAlign: 'center' }}>
                    Showing first 50 rows of {previewData.length}
                  </div>
                )}
              </div>
              
              {errorCount > 0 && (
                <div style={{ padding: 14, background: c.error.muted, borderRadius: r.lg, border: `1px solid ${c.error.DEFAULT}30` }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: c.error.DEFAULT, marginBottom: 8 }}>
                    {errorCount} row{errorCount > 1 ? 's' : ''} with errors (will be skipped)
                  </p>
                  <div style={{ maxHeight: 100, overflow: 'auto', fontSize: 12, color: c.gray[300] }}>
                    {validationErrors.slice(0, 10).map((err, i) => (
                      <p key={i}>Row {err.row}: {err.errors.join(', ')}</p>
                    ))}
                    {validationErrors.length > 10 && (
                      <p style={{ color: c.gray[500] }}>...and {validationErrors.length - 10} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {step === 4 && importResults && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', textAlign: 'center', padding: 20 }}>
              <div style={{
                width: 80, height: 80, borderRadius: r.full,
                background: importResults.imported > 0 ? c.success.muted : c.warning.muted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {importResults.imported > 0 ? (
                  <CheckCircle2 size={40} style={{ color: c.success.DEFAULT }} />
                ) : (
                  <AlertCircle size={40} style={{ color: c.warning.DEFAULT }} />
                )}
              </div>
              
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: c.gray[100], marginBottom: 4 }}>
                  {importResults.imported > 0 ? 'Import Complete!' : 'No Leads Imported'}
                </h3>
                <p style={{ fontSize: 14, color: c.gray[400] }}>
                  {importResults.imported} lead{importResults.imported !== 1 ? 's' : ''} successfully imported
                </p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, width: '100%', maxWidth: 400 }}>
                {[
                  { label: 'Imported', value: importResults.imported, color: c.success.DEFAULT },
                  { label: 'Skipped', value: importResults.skipped, color: c.warning.DEFAULT },
                  { label: 'Errors', value: importResults.errors, color: c.error.DEFAULT },
                ].map(stat => (
                  <div key={stat.label} style={{ padding: 16, background: c.gray[850], borderRadius: r.lg }}>
                    <p style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</p>
                    <p style={{ fontSize: 12, color: c.gray[500] }}>{stat.label}</p>
                  </div>
                ))}
              </div>
              
              {importResults.imported > 0 && (
                <p style={{ fontSize: 13, color: c.gray[500], maxWidth: 300 }}>
                  Your imported leads have been tagged as "Imported" and are ready for qualification.
                </p>
              )}
            </div>
          )}
        </div>
        
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${c.gray[800]}`, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {step > 1 && step < 4 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ChevronLeft size={18} style={{ marginRight: 4 }} /> Back
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {step < 4 && (
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
            )}
            {step === 2 && (
              <Button 
                variant="gradient"
                onClick={validateAndPreview}
                disabled={!LEAD_FIELDS.filter(f => f.required).every(f => Object.values(fieldMapping).includes(f.id))}>
                Continue
              </Button>
            )}
            {step === 3 && (
              <Button variant="gradient" onClick={executeImport} disabled={importing || validCount === 0}>
                {importing ? 'Importing...' : `Import ${validCount} Lead${validCount !== 1 ? 's' : ''}`}
              </Button>
            )}
            {step === 4 && (
              <Button variant="gradient" onClick={completeImport}>
                {importResults?.imported > 0 ? 'View Leads' : 'Close'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </ModalOverlay>
  );
};

const LeadDetailModal = ({ lead, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [enriching, setEnriching] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState(lead.enrichmentData || null);
  const [verificationData, setVerificationData] = useState(lead.verificationData || null);
  const [notes, setNotes] = useState(lead.notes || '');
  const [showNoteInput, setShowNoteInput] = useState(false);
  
  // Check which integrations are available
  const hasEnrichmentClearbit = integrationConfig.isConfigured('clearbit');
  const hasEnrichmentApollo = integrationConfig.isConfigured('apollo');
  const hasVerificationZeroBounce = integrationConfig.isConfigured('zerobounce');
  const hasVerificationNeverBounce = integrationConfig.isConfigured('neverbounce');
  const hasCRMHubSpot = integrationConfig.isConfigured('hubspot');
  const hasCRMPipedrive = integrationConfig.isConfigured('pipedrive');
  
  const hasAnyEnrichment = hasEnrichmentClearbit || hasEnrichmentApollo;
  const hasAnyVerification = hasVerificationZeroBounce || hasVerificationNeverBounce;
  const hasAnyCRM = hasCRMHubSpot || hasCRMPipedrive;
  
  const handleEnrich = async () => {
    setEnriching(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      
      const provider = hasEnrichmentClearbit ? 'Clearbit' : hasEnrichmentApollo ? 'Apollo.io' : 'Demo';
      
      const mockEnrichment = {
        company: {
          name: lead.company,
          domain: lead.email.split('@')[1],
          industry: 'Technology',
          subIndustry: 'Software & Services',
          employeeCount: '51-200',
          employeeRange: { min: 51, max: 200 },
          revenue: '$10M-$50M',
          revenueEstimate: 28000000,
          founded: 2015,
          description: `${lead.company} is a growing technology company focused on innovative solutions for enterprise customers.`,
          location: 'San Francisco, CA',
          headquarters: { city: 'San Francisco', state: 'California', country: 'United States' },
          linkedin: `https://linkedin.com/company/${lead.company.toLowerCase().replace(/\s/g, '')}`,
          twitter: `https://twitter.com/${lead.company.toLowerCase().replace(/\s/g, '')}`,
          website: `https://${lead.email.split('@')[1]}`,
          techStack: ['Salesforce', 'HubSpot', 'Slack', 'AWS', 'React', 'Node.js'],
          tags: ['B2B', 'SaaS', 'Enterprise', 'Cloud'],
          funding: {
            totalRaised: 15000000,
            lastRound: 'Series A',
            lastRoundAmount: 12000000,
            lastRoundDate: '2024-03-15',
            investors: ['Sequoia Capital', 'Andreessen Horowitz'],
          },
        },
        contact: {
          directPhone: '+1 (555) 123-4567',
          mobilePhone: '+1 (555) 987-6543',
          linkedin: `https://linkedin.com/in/${lead.name.toLowerCase().replace(/\s/g, '')}`,
          twitter: `@${lead.name.split(' ')[0].toLowerCase()}`,
          department: 'Executive',
          seniority: lead.title?.includes('VP') || lead.title?.includes('Director') || lead.title?.includes('Chief') ? 'Executive' : 'Manager',
          bio: `${lead.name} is a ${lead.title} at ${lead.company} with extensive experience in ${lead.title?.includes('Sales') ? 'sales and business development' : 'their field'}.`,
          skills: ['Leadership', 'Strategy', 'Business Development', 'Team Management'],
          experience: [
            { company: lead.company, title: lead.title, current: true },
            { company: 'Previous Corp', title: 'Senior Manager', current: false },
          ],
        },
        enrichedAt: new Date().toISOString(),
        source: provider,
        confidence: 92,
        dataPoints: 47,
      };
      
      setEnrichmentData(mockEnrichment);
      onUpdate({ ...lead, enriched: true, enrichmentData: mockEnrichment });
    } catch (err) {
      console.error('Enrichment failed:', err);
    }
    setEnriching(false);
  };
  
  const handleVerify = async () => {
    setVerifying(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      
      const provider = hasVerificationZeroBounce ? 'ZeroBounce' : hasVerificationNeverBounce ? 'NeverBounce' : 'Demo';
      const isValid = !lead.email.includes('test') && !lead.email.includes('fake');
      
      const mockVerification = {
        email: lead.email,
        status: isValid ? 'valid' : 'invalid',
        score: isValid ? 95 : 23,
        checks: {
          syntax: true,
          domain: true,
          mx: true,
          smtp: isValid,
          disposable: false,
          roleBased: lead.email.split('@')[0] === 'info' || lead.email.split('@')[0] === 'sales',
          catchAll: false,
          spamTrap: false,
        },
        verifiedAt: new Date().toISOString(),
        source: provider,
        deliverability: isValid ? 'high' : 'low',
        risk: isValid ? 'low' : 'high',
        subStatus: isValid ? 'mailbox_verified' : 'mailbox_not_found',
        freeEmail: lead.email.includes('gmail') || lead.email.includes('yahoo') || lead.email.includes('hotmail'),
        creditsUsed: 1,
      };
      
      setVerificationData(mockVerification);
      onUpdate({ ...lead, emailVerified: isValid, verificationData: mockVerification });
    } catch (err) {
      console.error('Verification failed:', err);
    }
    setVerifying(false);
  };
  
  const handleSyncToCRM = async () => {
    setSyncing(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      const crmName = hasCRMHubSpot ? 'HubSpot' : hasCRMPipedrive ? 'Pipedrive' : 'CRM';
      onUpdate({ ...lead, crmSynced: true, crmSyncedAt: new Date().toISOString(), crmProvider: crmName });
    } catch (err) {
      console.error('CRM sync failed:', err);
    }
    setSyncing(false);
  };
  
  const handleSaveNotes = () => {
    onUpdate({ ...lead, notes });
    setShowNoteInput(false);
  };
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'scoring', label: 'Scoring', icon: Target },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];
  
  const activities = [
    { type: 'email_opened', desc: 'Opened email: "Quick question about your goals"', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { type: 'page_view', desc: 'Visited pricing page (3 min)', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { type: 'email_clicked', desc: 'Clicked link in email', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { type: 'form_submit', desc: 'Downloaded whitepaper', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { type: 'created', desc: 'Lead created from LinkedIn campaign', date: new Date(lead.createdAt) },
  ];
  
  // Scoring breakdown
  const scoringFactors = [
    { factor: 'Job Title', weight: 20, score: lead.title?.includes('VP') || lead.title?.includes('Director') || lead.title?.includes('Chief') ? 20 : 12, maxScore: 20 },
    { factor: 'Company Size', weight: 15, score: 12, maxScore: 15 },
    { factor: 'Engagement', weight: 25, score: 18, maxScore: 25 },
    { factor: 'Recency', weight: 20, score: 16, maxScore: 20 },
    { factor: 'Fit Score', weight: 20, score: Math.round(lead.score * 0.2), maxScore: 20 },
  ];

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', zIndex: 100, overflowY: 'auto' }}>
      <Card onClick={(e) => e.stopPropagation()} padding={0} style={{ width: '100%', maxWidth: 900, marginBottom: 40 }}>
        <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', gap: 16 }}>
          <Avatar name={lead.name} size={64} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: c.gray[100] }}>{lead.name}</h2>
              <StatusBadge status={lead.status} />
              {lead.emailVerified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: r.full, background: c.success.muted, color: c.success.DEFAULT, fontSize: 11, fontWeight: 500 }}>
                  <CheckCircle2 size={12} /> Email Verified
                </span>
              )}
              {lead.enriched && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: r.full, background: c.primary[100], color: c.primary.DEFAULT, fontSize: 11, fontWeight: 500 }}>
                  <Sparkles size={12} /> Enriched
                </span>
              )}
              {lead.crmSynced && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: r.full, background: c.accent.muted, color: c.accent.DEFAULT, fontSize: 11, fontWeight: 500 }}>
                  <RefreshCw size={12} /> Synced to {lead.crmProvider}
                </span>
              )}
            </div>
            <p style={{ fontSize: 15, color: c.gray[400], marginBottom: 8 }}>{lead.title} at {lead.company}</p>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: c.gray[500], flexWrap: 'wrap' }}>
              <a href={`mailto:${lead.email}`} style={{ display: 'flex', alignItems: 'center', gap: 5, color: c.primary.DEFAULT, textDecoration: 'none' }}>
                <Mail size={14} /> {lead.email}
              </a>
              {(enrichmentData?.contact?.directPhone || lead.phone) && (
                <a href={`tel:${enrichmentData?.contact?.directPhone || lead.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 5, color: c.primary.DEFAULT, textDecoration: 'none' }}>
                  <Phone size={14} /> {enrichmentData?.contact?.directPhone || lead.phone}
                </a>
              )}
              {enrichmentData?.contact?.linkedin && (
                <a href={enrichmentData.contact.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, color: c.primary.DEFAULT, textDecoration: 'none' }}>
                  <Linkedin size={14} /> LinkedIn
                </a>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <Score value={lead.score} size="lg" />
            <p style={{ fontSize: 13, color: c.gray[500] }}>{fmt.currency(lead.value)}</p>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X size={20} style={{ color: c.gray[500] }} />
            </button>
          </div>
        </div>
        
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', gap: 10, background: c.gray[850], flexWrap: 'wrap', alignItems: 'center' }}>
          <Button size="sm" icon={Mail}>Send Email</Button>
          <Button size="sm" variant="secondary" icon={Phone}>Call</Button>
          <Button size="sm" variant="secondary" icon={Zap}>Add to Sequence</Button>
          
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Button size="sm" variant={enrichmentData ? 'ghost' : 'secondary'} icon={Sparkles} onClick={handleEnrich} disabled={enriching}>
                {enriching ? 'Enriching...' : enrichmentData ? `Re-enrich` : 'Enrich Data'}
              </Button>
              {!hasAnyEnrichment && !enrichmentData && (
                <span style={{ position: 'absolute', top: -6, right: -6, width: 12, height: 12, background: c.warning.DEFAULT, borderRadius: '50%', border: `2px solid ${c.gray[850]}` }} title="No enrichment service configured" />
              )}
            </div>
            
            <div style={{ position: 'relative' }}>
              <Button size="sm" variant={verificationData?.status === 'valid' ? 'ghost' : 'secondary'} icon={Shield} onClick={handleVerify} disabled={verifying}>
                {verifying ? 'Verifying...' : verificationData ? 'Re-verify' : 'Verify Email'}
              </Button>
              {!hasAnyVerification && !verificationData && (
                <span style={{ position: 'absolute', top: -6, right: -6, width: 12, height: 12, background: c.warning.DEFAULT, borderRadius: '50%', border: `2px solid ${c.gray[850]}` }} title="No verification service configured" />
              )}
            </div>
            
            <div style={{ position: 'relative' }}>
              <Button size="sm" variant={lead.crmSynced ? 'ghost' : 'secondary'} icon={RefreshCw} onClick={handleSyncToCRM} disabled={syncing}>
                {syncing ? 'Syncing...' : lead.crmSynced ? 'Synced' : 'Sync to CRM'}
              </Button>
              {!hasAnyCRM && !lead.crmSynced && (
                <span style={{ position: 'absolute', top: -6, right: -6, width: 12, height: 12, background: c.warning.DEFAULT, borderRadius: '50%', border: `2px solid ${c.gray[850]}` }} title="No CRM configured" />
              )}
            </div>
          </div>
        </div>
        
        {(!hasAnyEnrichment || !hasAnyVerification || !hasAnyCRM) && !enrichmentData && !verificationData && (
          <div style={{ padding: '10px 20px', background: c.warning.muted, borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={16} style={{ color: c.warning.DEFAULT }} />
            <p style={{ fontSize: 13, color: c.warning.DEFAULT, flex: 1 }}>
              Configure integrations for real data: 
              {!hasAnyEnrichment && ' Clearbit/Apollo (enrichment)'}
              {!hasAnyVerification && ' ZeroBounce/NeverBounce (verification)'}
              {!hasAnyCRM && ' HubSpot/Pipedrive (CRM sync)'}
            </p>
            <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} style={{ fontSize: 12, color: c.warning.DEFAULT, textDecoration: 'underline' }}>
              Go to Integrations
            </a>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${c.gray[800]}`, flexShrink: 0, overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
                fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer',
                color: activeTab === tab.id ? c.primary.DEFAULT : c.gray[500],
                background: 'transparent',
                borderBottom: activeTab === tab.id ? `2px solid ${c.primary.DEFAULT}` : '2px solid transparent',
                marginBottom: -1, whiteSpace: 'nowrap',
              }}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
        
        <div style={{ padding: 20 }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[300], marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <InfoRow icon={Mail} label="Email" value={lead.email} verified={lead.emailVerified} />
                  <InfoRow icon={Phone} label="Phone" value={lead.phone || 'Not available'} />
                  {enrichmentData?.contact?.directPhone && (
                    <InfoRow icon={Phone} label="Direct Phone" value={enrichmentData.contact.directPhone} enriched />
                  )}
                  {enrichmentData?.contact?.mobilePhone && (
                    <InfoRow icon={Phone} label="Mobile" value={enrichmentData.contact.mobilePhone} enriched />
                  )}
                  {enrichmentData?.contact?.linkedin && (
                    <InfoRow icon={Linkedin} label="LinkedIn" value={enrichmentData.contact.linkedin} link enriched />
                  )}
                  {enrichmentData?.contact?.seniority && (
                    <InfoRow icon={Award} label="Seniority" value={enrichmentData.contact.seniority} enriched />
                  )}
                </div>
                
                {enrichmentData?.contact?.bio && (
                  <div style={{ marginTop: 16, padding: 12, background: c.gray[850], borderRadius: r.lg, borderLeft: `3px solid ${c.primary.DEFAULT}` }}>
                    <p style={{ fontSize: 13, color: c.gray[400], lineHeight: 1.6, fontStyle: 'italic' }}>
                      "{enrichmentData.contact.bio}"
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[300], marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lead Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <InfoRow icon={Briefcase} label="Title" value={lead.title} />
                  <InfoRow icon={Building2} label="Company" value={lead.company} />
                  <InfoRow icon={DollarSign} label="Deal Value" value={fmt.currency(lead.value)} />
                  <InfoRow icon={Calendar} label="Created" value={fmt.date(lead.createdAt)} />
                  <InfoRow icon={Globe} label="Source" value={lead.source} />
                  {enrichmentData?.contact?.department && (
                    <InfoRow icon={Users} label="Department" value={enrichmentData.contact.department} enriched />
                  )}
                </div>
              </div>
              
              {verificationData && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[300], marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Shield size={16} /> Email Verification Results
                    <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: r.full, background: verificationData.status === 'valid' ? c.success.muted : c.error.muted, color: verificationData.status === 'valid' ? c.success.DEFAULT : c.error.DEFAULT, fontSize: 11, fontWeight: 500, textTransform: 'none' }}>
                      via {verificationData.source}
                    </span>
                  </h3>
                  <div style={{ padding: 16, background: c.gray[850], borderRadius: r.lg, border: `1px solid ${verificationData.status === 'valid' ? c.success.DEFAULT + '40' : c.error.DEFAULT + '40'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: verificationData.status === 'valid' ? c.success.muted : c.error.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {verificationData.status === 'valid' ? (
                            <CheckCircle2 size={24} style={{ color: c.success.DEFAULT }} />
                          ) : (
                            <AlertCircle size={24} style={{ color: c.error.DEFAULT }} />
                          )}
                        </div>
                        <div>
                          <p style={{ fontSize: 16, fontWeight: 600, color: verificationData.status === 'valid' ? c.success.DEFAULT : c.error.DEFAULT }}>
                            {verificationData.status === 'valid' ? 'Valid Email Address' : 'Invalid Email Address'}
                          </p>
                          <p style={{ fontSize: 12, color: c.gray[500] }}>
                            Deliverability: {verificationData.deliverability} • Risk: {verificationData.risk}
                            {verificationData.freeEmail && ' • Free email provider'}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 28, fontWeight: 700, color: verificationData.status === 'valid' ? c.success.DEFAULT : c.error.DEFAULT }}>{verificationData.score}</p>
                        <p style={{ fontSize: 11, color: c.gray[500] }}>Confidence Score</p>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                      {Object.entries(verificationData.checks).map(([check, passed]) => (
                        <div key={check} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 10px', background: c.gray[800], borderRadius: r.md, color: passed ? c.success.DEFAULT : check === 'roleBased' ? c.warning.DEFAULT : c.error.DEFAULT }}>
                          {passed ? <Check size={14} /> : <X size={14} />}
                          <span style={{ textTransform: 'capitalize' }}>{check.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: c.gray[600], marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Verified via {verificationData.source} on {fmt.date(verificationData.verifiedAt)}</span>
                      <span>Credits used: {verificationData.creditsUsed}</span>
                    </p>
                  </div>
                </div>
              )}
              
              {enrichmentData?.contact?.skills && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[300], marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skills & Expertise</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {enrichmentData.contact.skills.map(skill => (
                      <span key={skill} style={{ padding: '6px 12px', background: c.gray[800], borderRadius: r.full, fontSize: 13, color: c.gray[300] }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'company' && (
            <div>
              {enrichmentData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Company Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: c.gray[850], borderRadius: r.lg }}>
                    <div style={{ width: 64, height: 64, borderRadius: r.lg, background: c.primary[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={32} style={{ color: c.primary.DEFAULT }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 20, fontWeight: 600, color: c.gray[100], marginBottom: 4 }}>{enrichmentData.company.name}</h3>
                      <p style={{ fontSize: 14, color: c.gray[500] }}>{enrichmentData.company.industry} • {enrichmentData.company.subIndustry}</p>
                      <p style={{ fontSize: 13, color: c.gray[500] }}>{enrichmentData.company.location}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 11, color: c.gray[500] }}>Data Confidence</p>
                      <p style={{ fontSize: 24, fontWeight: 600, color: enrichmentData.confidence > 80 ? c.success.DEFAULT : c.warning.DEFAULT }}>{enrichmentData.confidence}%</p>
                      <p style={{ fontSize: 11, color: c.gray[600] }}>{enrichmentData.dataPoints} data points</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    <div style={{ padding: 16, background: c.gray[850], borderRadius: r.lg, textAlign: 'center' }}>
                      <Users size={20} style={{ color: c.primary.DEFAULT, marginBottom: 8 }} />
                      <p style={{ fontSize: 18, fontWeight: 600, color: c.gray[100] }}>{enrichmentData.company.employeeCount}</p>
                      <p style={{ fontSize: 12, color: c.gray[500] }}>Employees</p>
                    </div>
                    <div style={{ padding: 16, background: c.gray[850], borderRadius: r.lg, textAlign: 'center' }}>
                      <DollarSign size={20} style={{ color: c.success.DEFAULT, marginBottom: 8 }} />
                      <p style={{ fontSize: 18, fontWeight: 600, color: c.gray[100] }}>{enrichmentData.company.revenue}</p>
                      <p style={{ fontSize: 12, color: c.gray[500] }}>Revenue</p>
                    </div>
                    <div style={{ padding: 16, background: c.gray[850], borderRadius: r.lg, textAlign: 'center' }}>
                      <Calendar size={20} style={{ color: c.warning.DEFAULT, marginBottom: 8 }} />
                      <p style={{ fontSize: 18, fontWeight: 600, color: c.gray[100] }}>{enrichmentData.company.founded}</p>
                      <p style={{ fontSize: 12, color: c.gray[500] }}>Founded</p>
                    </div>
                    <div style={{ padding: 16, background: c.gray[850], borderRadius: r.lg, textAlign: 'center' }}>
                      <TrendingUp size={20} style={{ color: c.accent.DEFAULT, marginBottom: 8 }} />
                      <p style={{ fontSize: 18, fontWeight: 600, color: c.gray[100] }}>{fmt.currency(enrichmentData.company.funding?.totalRaised || 0)}</p>
                      <p style={{ fontSize: 12, color: c.gray[500] }}>Total Funding</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: c.gray[300], marginBottom: 8 }}>About</h4>
                    <p style={{ fontSize: 14, color: c.gray[400], lineHeight: 1.7 }}>{enrichmentData.company.description}</p>
                  </div>
                  
                  {enrichmentData.company.funding && (
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 600, color: c.gray[300], marginBottom: 12 }}>Funding History</h4>
                      <div style={{ padding: 16, background: c.gray[850], borderRadius: r.lg }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div>
                            <p style={{ fontSize: 15, fontWeight: 500, color: c.gray[100] }}>{enrichmentData.company.funding.lastRound}</p>
                            <p style={{ fontSize: 12, color: c.gray[500] }}>{fmt.date(enrichmentData.company.funding.lastRoundDate)}</p>
                          </div>
                          <p style={{ fontSize: 18, fontWeight: 600, color: c.success.DEFAULT }}>{fmt.currency(enrichmentData.company.funding.lastRoundAmount)}</p>
                        </div>
                        {enrichmentData.company.funding.investors && (
                          <div>
                            <p style={{ fontSize: 12, color: c.gray[500], marginBottom: 6 }}>Investors</p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {enrichmentData.company.funding.investors.map(inv => (
                                <span key={inv} style={{ padding: '4px 10px', background: c.gray[800], borderRadius: r.full, fontSize: 12, color: c.gray[300] }}>{inv}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {enrichmentData.company.techStack && (
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 600, color: c.gray[300], marginBottom: 10 }}>Tech Stack</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {enrichmentData.company.techStack.map(tech => (
                          <span key={tech} style={{ padding: '6px 12px', background: c.primary[100], borderRadius: r.full, fontSize: 13, color: c.primary.DEFAULT }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {enrichmentData.company.tags && (
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 600, color: c.gray[300], marginBottom: 10 }}>Industry Tags</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {enrichmentData.company.tags.map(tag => (
                          <span key={tag} style={{ padding: '6px 12px', background: c.gray[800], borderRadius: r.full, fontSize: 13, color: c.gray[400] }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: 10 }}>
                    {enrichmentData.company.website && (
                      <a href={enrichmentData.company.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: c.gray[850], borderRadius: r.lg, fontSize: 13, color: c.primary.DEFAULT, textDecoration: 'none' }}>
                        <Globe size={16} /> Website
                      </a>
                    )}
                    {enrichmentData.company.linkedin && (
                      <a href={enrichmentData.company.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: c.gray[850], borderRadius: r.lg, fontSize: 13, color: c.primary.DEFAULT, textDecoration: 'none' }}>
                        <Linkedin size={16} /> LinkedIn
                      </a>
                    )}
                    {enrichmentData.company.twitter && (
                      <a href={enrichmentData.company.twitter} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: c.gray[850], borderRadius: r.lg, fontSize: 13, color: c.primary.DEFAULT, textDecoration: 'none' }}>
                        <Globe size={16} /> Twitter
                      </a>
                    )}
                  </div>
                  
                  <p style={{ fontSize: 11, color: c.gray[600] }}>
                    Data enriched via {enrichmentData.source} on {fmt.date(enrichmentData.enrichedAt)}
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 60 }}>
                  <Building2 size={56} style={{ color: c.gray[600], marginBottom: 16 }} />
                  <h3 style={{ fontSize: 18, fontWeight: 500, color: c.gray[300], marginBottom: 8 }}>No Company Data Available</h3>
                  <p style={{ fontSize: 14, color: c.gray[500], marginBottom: 8 }}>
                    Enrich this lead to get detailed company information including:
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24, color: c.gray[500], fontSize: 13 }}>
                    <span>• Employee count</span>
                    <span>• Revenue</span>
                    <span>• Tech stack</span>
                    <span>• Funding</span>
                  </div>
                  <Button icon={Sparkles} onClick={handleEnrich} disabled={enriching}>
                    {enriching ? 'Enriching...' : 'Enrich Lead Data'}
                  </Button>
                  {!hasAnyEnrichment && (
                    <p style={{ fontSize: 12, color: c.warning.DEFAULT, marginTop: 12 }}>
                      <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                      No enrichment service configured. Using demo data.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {activities.map((activity, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: i < activities.length - 1 ? `1px solid ${c.gray[850]}` : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: c.gray[850], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {activity.type === 'email_opened' && <Mail size={18} style={{ color: c.primary.DEFAULT }} />}
                      {activity.type === 'email_clicked' && <ExternalLink size={18} style={{ color: c.success.DEFAULT }} />}
                      {activity.type === 'page_view' && <Eye size={18} style={{ color: c.warning.DEFAULT }} />}
                      {activity.type === 'form_submit' && <Download size={18} style={{ color: c.accent.DEFAULT }} />}
                      {activity.type === 'created' && <Plus size={18} style={{ color: c.gray[500] }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, color: c.gray[200], marginBottom: 4 }}>{activity.desc}</p>
                      <p style={{ fontSize: 12, color: c.gray[500] }}>{fmt.date(activity.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'scoring' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <Score value={lead.score} size="lg" />
                <div>
                  <p style={{ fontSize: 14, color: c.gray[400] }}>Overall Lead Score</p>
                  <p style={{ fontSize: 12, color: c.gray[500] }}>Based on 5 scoring factors</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {scoringFactors.map(factor => (
                  <div key={factor.factor}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: c.gray[300] }}>{factor.factor}</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: c.gray[100] }}>{factor.score}/{factor.maxScore}</span>
                    </div>
                    <div style={{ height: 8, background: c.gray[800], borderRadius: r.full, overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${(factor.score / factor.maxScore) * 100}%`, 
                        background: factor.score / factor.maxScore >= 0.7 ? c.success.DEFAULT : factor.score / factor.maxScore >= 0.4 ? c.warning.DEFAULT : c.error.DEFAULT,
                        borderRadius: r.full,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: 24, padding: 16, background: c.gray[850], borderRadius: r.lg }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: c.gray[300], marginBottom: 8 }}>Score Explanation</h4>
                <p style={{ fontSize: 13, color: c.gray[400], lineHeight: 1.6 }}>
                  This lead scores {lead.score} out of 100 based on their job title seniority, company fit, engagement level with your content, recency of interactions, and overall profile match. 
                  {lead.score >= 75 ? ' This is a high-quality lead worth prioritizing.' : lead.score >= 50 ? ' Consider nurturing this lead with targeted content.' : ' This lead may need more qualification.'}
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'notes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[300] }}>Notes & Comments</h3>
                {!showNoteInput && (
                  <Button size="sm" variant="secondary" icon={Plus} onClick={() => setShowNoteInput(true)}>Add Note</Button>
                )}
              </div>
              
              {showNoteInput && (
                <div style={{ marginBottom: 20 }}>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this lead..."
                    rows={4}
                    style={{ width: '100%', padding: 12, fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.lg, color: c.gray[100], outline: 'none', resize: 'vertical', marginBottom: 10 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" onClick={handleSaveNotes}>Save Note</Button>
                    <Button size="sm" variant="secondary" onClick={() => setShowNoteInput(false)}>Cancel</Button>
                  </div>
                </div>
              )}
              
              {notes ? (
                <div style={{ padding: 16, background: c.gray[850], borderRadius: r.lg, borderLeft: `3px solid ${c.primary.DEFAULT}` }}>
                  <p style={{ fontSize: 14, color: c.gray[300], lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{notes}</p>
                  <p style={{ fontSize: 11, color: c.gray[600], marginTop: 10 }}>Last updated: {fmt.date(new Date())}</p>
                </div>
              ) : !showNoteInput && (
                <div style={{ padding: 40, textAlign: 'center', background: c.gray[850], borderRadius: r.lg }}>
                  <FileText size={32} style={{ color: c.gray[600], marginBottom: 8 }} />
                  <p style={{ fontSize: 14, color: c.gray[500] }}>No notes yet</p>
                  <p style={{ fontSize: 12, color: c.gray[600], marginTop: 4 }}>Add notes to track important details about this lead</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {(enrichmentData || verificationData) && (
          <div style={{ padding: '10px 20px', background: c.gray[850], borderTop: `1px solid ${c.gray[800]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: c.gray[600] }}>
            <span>
              {enrichmentData && `Enriched via ${enrichmentData.source}`}
              {enrichmentData && verificationData && ' • '}
              {verificationData && `Verified via ${verificationData.source}`}
            </span>
            <span>
              {enrichmentData && `${enrichmentData.dataPoints} data points`}
              {enrichmentData && verificationData && ' • '}
              {verificationData && `Confidence: ${verificationData.score}%`}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
};

export const InfoRow = ({ icon: Icon, label, value, verified, enriched, link }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <Icon size={16} style={{ color: c.gray[500], flexShrink: 0 }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 12, color: c.gray[500], marginBottom: 2 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: c.primary.DEFAULT, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value}
          </a>
        ) : (
          <p style={{ fontSize: 14, color: c.gray[200], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
        )}
        {verified && <CheckCircle2 size={14} style={{ color: c.success.DEFAULT, flexShrink: 0 }} />}
        {enriched && <span style={{ fontSize: 10, padding: '1px 6px', background: c.primary[100], color: c.primary.DEFAULT, borderRadius: r.full }}>Enriched</span>}
      </div>
    </div>
  </div>
);

export const ExportModal = ({ isOpen, onClose, data }) => {
  const [format, setFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  
  const formats = [
    { id: 'csv', name: 'CSV', desc: 'Universal spreadsheet format', icon: FileText },
    { id: 'json', name: 'JSON', desc: 'For developers & APIs', icon: FileJson },
  ];
  
  const handleExport = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    
    let blob, ext;
    if (format === 'csv') {
      const headers = ['Name', 'Email', 'Company', 'Title', 'Status', 'Score', 'Value', 'Source'];
      const rows = data.map(l => [l.name, l.email, l.company, l.title, l.status, l.score, l.value, l.source]);
      const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
      blob = new Blob([csv], { type: 'text/csv' });
      ext = 'csv';
    } else {
      blob = new Blob([JSON.stringify({ exportDate: new Date().toISOString(), leads: data }, null, 2)], { type: 'application/json' });
      ext = 'json';
    }
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    
    setLoading(false);
    setTimeout(onClose, 200);
  };
  
  if (!isOpen) return null;
  
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100 }}>
      <Card onClick={(e) => e.stopPropagation()} padding={24} style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100] }}>Export Leads</h2>
            <p style={{ fontSize: 13, color: c.gray[500], marginTop: 2 }}>{data.length} records</p>
          </div>
          <button onClick={onClose} style={{ padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: c.gray[500] }}><X size={20} /></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {formats.map(f => {
            const Icon = f.icon;
            const selected = format === f.id;
            return (
              <button key={f.id} onClick={() => setFormat(f.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 14,
                  background: selected ? c.primary[100] : c.gray[850],
                  border: `1px solid ${selected ? c.primary.DEFAULT : c.gray[800]}`,
                  borderRadius: r.lg, cursor: 'pointer', textAlign: 'left', transition: tokens.transition.fast,
                }}>
                <Icon size={20} style={{ color: selected ? c.primary.DEFAULT : c.gray[500] }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100] }}>{f.name}</p>
                  <p style={{ fontSize: 12, color: c.gray[500] }}>{f.desc}</p>
                </div>
                {selected && <Check size={18} style={{ color: c.primary.DEFAULT }} />}
              </button>
            );
          })}
        </div>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={loading} onClick={handleExport}>Export</Button>
        </div>
      </Card>
    </div>
  );
};