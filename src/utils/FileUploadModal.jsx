import React, { useState, useRef, useCallback } from 'react';
import  Card  from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { ModalOverlay } from '../components/Layout/ModalOverlay';
import { Upload, FileText, X } from 'lucide-react';
import { c, r, tokens } from '../styles/theme';


export const FileUploadModal = ({ isOpen, onClose, onUpload, acceptedTypes = '.csv,.xlsx,.json' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };
  
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    // Simulate processing
    await new Promise(r => setTimeout(r, 2500));
    
    onUpload?.(selectedFiles);
    setUploading(false);
    setSelectedFiles([]);
    setUploadProgress(0);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClose={onClose} maxWidth={560}>
      <Card padding={0} style={{ overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${c.gray[800]}` }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Upload Lead Data</h2>
          <button onClick={onClose} style={{ padding: 6, background: 'transparent', border: 'none', borderRadius: r.md, cursor: 'pointer', color: c.gray[400] }}>
            <X size={20} />
          </button>
        </div>
        
        {/* Drop Zone */}
        <div style={{ padding: 20 }}>
          <div
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: 40, textAlign: 'center', cursor: 'pointer',
              border: `2px dashed ${isDragging ? c.primary.DEFAULT : c.gray[700]}`,
              borderRadius: r.xl, background: isDragging ? c.primary[50] : c.gray[850],
              transition: tokens.transition.base,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes}
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Upload size={40} style={{ color: isDragging ? c.primary.DEFAULT : c.gray[500], marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 500, color: c.gray[200], marginBottom: 6 }}>
              {isDragging ? 'Drop files here' : 'Drag and drop files here'}
            </p>
            <p style={{ fontSize: 13, color: c.gray[500], marginBottom: 16 }}>or click to browse</p>
            <p style={{ fontSize: 12, color: c.gray[600] }}>Supports CSV, Excel, and JSON files</p>
          </div>
          
          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[400], marginBottom: 10 }}>Selected Files ({selectedFiles.length})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedFiles.map((file, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: c.gray[850], borderRadius: r.lg }}>
                    <FileText size={18} style={{ color: c.primary.DEFAULT }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: c.gray[200], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                      <p style={{ fontSize: 11, color: c.gray[500] }}>{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(index); }} style={{ padding: 4, background: 'transparent', border: 'none', borderRadius: r.sm, cursor: 'pointer', color: c.gray[500] }}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Upload Progress */}
          {uploading && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: c.gray[400] }}>Uploading...</span>
                <span style={{ fontSize: 13, color: c.primary.DEFAULT }}>{uploadProgress}%</span>
              </div>
              <div style={{ height: 6, background: c.gray[800], borderRadius: r.full, overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: tokens.gradients.brand, transition: 'width 200ms ease' }} />
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 20px', borderTop: `1px solid ${c.gray[800]}`, background: c.gray[850] }}>
          <Button variant="secondary" onClick={onClose} disabled={uploading}>Cancel</Button>
          <Button variant="gradient" icon={Upload} onClick={handleUpload} disabled={selectedFiles.length === 0 || uploading} loading={uploading}>
            {uploading ? 'Processing...' : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
          </Button>
        </div>
      </Card>
    </ModalOverlay>
  );
};