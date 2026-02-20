import { Upload, CheckCircle2, FileText, TrendingUp as TrendUp } from 'lucide-react';

import React, { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext } from 'react';
import { c, r, tokens } from '../../styles/theme';
import { fmt } from '../../utils/formatters';
import { FileUploadModal } from '../../utils/FileUploadModal';
import { Card } from '../UI/Card';

export const AdminUpload = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const handleUpload = (files) => {
    // Simulate processing uploaded files
    const processedFiles = files.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'processed',
      leadsImported: Math.floor(Math.random() * 500) + 50,
    }));
    setUploadedFiles(prev => [...processedFiles, ...prev]);
  };
  
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Upload Card */}
        <Card>
          <div 
            onClick={() => setShowUploadModal(true)}
            style={{ 
              textAlign: 'center', padding: 60, cursor: 'pointer',
              border: `2px dashed ${c.gray[700]}`, borderRadius: r.xl,
              background: c.gray[850], transition: tokens.transition.base,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.primary.DEFAULT; e.currentTarget.style.background = c.gray[800]; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = c.gray[700]; e.currentTarget.style.background = c.gray[850]; }}
          >
            <div style={{ 
              width: 64, height: 64, borderRadius: r.xl, margin: '0 auto 16px',
              background: tokens.gradients.brandSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Upload size={28} style={{ color: c.primary.DEFAULT }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], marginBottom: 8, fontFamily: tokens.font.heading }}>Upload Lead Data</h2>
            <p style={{ fontSize: 14, color: c.gray[400], marginBottom: 20 }}>Click to browse or drag and drop files</p>
            <p style={{ fontSize: 12, color: c.gray[600] }}>Supports CSV, Excel (.xlsx), and JSON files</p>
          </div>
        </Card>
        
        {/* Recent Uploads */}
        {uploadedFiles.length > 0 && (
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 16, fontFamily: tokens.font.heading }}>Recent Uploads</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {uploadedFiles.slice(0, 5).map(file => (
                <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: c.gray[850], borderRadius: r.lg }}>
                  <div style={{ width: 36, height: 36, borderRadius: r.md, background: c.primary[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} style={{ color: c.primary.DEFAULT }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[200] }}>{file.name}</p>
                    <p style={{ fontSize: 12, color: c.gray[500] }}>{fmt.date(file.uploadedAt)} • {(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} style={{ color: c.success.DEFAULT }} />
                    <span style={{ fontSize: 13, color: c.success.DEFAULT, fontWeight: 500 }}>{file.leadsImported} leads</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
      
      {/* File Upload Modal */}
      <FileUploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />
    </>
  );
};