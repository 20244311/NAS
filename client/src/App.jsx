import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Upload, Download, Trash2, Search, File, HardDrive } from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/files`);
      setFiles(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`${API_BASE}/upload`, formData);
      fetchFiles();
    } catch (err) {
      alert("Upload failed");
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDownload = (storedName) => {
    window.open(`${API_BASE}/download/${storedName}`, '_blank');
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this file?")) {
      await axios.delete(`${API_BASE}/files/${id}`);
      fetchFiles();
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="container">
      <header className="header">
        <h1>NAS Manager</h1>
        <p>Simple & Secure File Storage</p>
      </header>

      <div className="card">
        <div 
          className={`upload-zone ${dragging ? 'dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={(e) => handleUpload(e.target.files[0])}
          />
          <Upload size={40} color="#6366f1" />
          <h3>Drag & Drop to Upload</h3>
          <p>or click to browse files</p>
        </div>

        <div className="search-bar">
          <Search size={20} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search files by name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="file-list">
          {filteredFiles.map(file => (
            <div key={file.id} className="file-item">
              <div className="file-info">
                <File size={24} color="#6366f1" />
                <div>
                  <span className="file-name">{file.name}</span>
                  <span className="file-meta">
                    {formatSize(file.size)} • {new Date(file.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="actions">
                <button className="btn btn-ghost" onClick={() => handleDownload(file.storedName)}>
                  <Download size={18} />
                </button>
                <button className="btn btn-ghost" style={{ color: '#ef4444' }} onClick={() => handleDelete(file.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {filteredFiles.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <HardDrive size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
              <p>No files found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
