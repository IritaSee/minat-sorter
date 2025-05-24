import React from 'react';
import type { StudentPreferences } from '../types';
import './CompletionPage.css';

interface CompletionPageProps {
  preferences: StudentPreferences;
  onStartOver: () => void;
}

export const CompletionPage: React.FC<CompletionPageProps> = ({ preferences, onStartOver }) => {
  const downloadData = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${preferences.studentInfo.name}_preferences_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="completion-container">
      <div className="completion-card">
        <div className="success-icon">✅</div>
        <h1>Survei Selesai!</h1>
        <p className="completion-message">
          Terima kasih <strong>{preferences.studentInfo.name}</strong> dari{' '}
          <strong>{preferences.studentInfo.schoolName}</strong>.
          <br />
          Preferensi karir Anda telah berhasil direkam.
        </p>
        
        <div className="summary">
          <h3>Ringkasan Data:</h3>
          <div className="summary-item">
            <span>Nama:</span>
            <span>{preferences.studentInfo.name}</span>
          </div>
          <div className="summary-item">
            <span>Jenis Kelamin:</span>
            <span>
              {preferences.studentInfo.gender === 'male' ? 'Laki-laki' : 
               preferences.studentInfo.gender === 'female' ? 'Perempuan' : 'Lainnya'}
            </span>
          </div>
          <div className="summary-item">
            <span>Sekolah:</span>
            <span>{preferences.studentInfo.schoolName}</span>
          </div>
          <div className="summary-item">
            <span>Set Pekerjaan Selesai:</span>
            <span>{preferences.jobPreferences.length} set</span>
          </div>
          <div className="summary-item">
            <span>Waktu Selesai:</span>
            <span>{preferences.submittedAt.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="completion-actions">
          <button className="download-button" onClick={downloadData}>
            Unduh Data
          </button>
          <button className="restart-button" onClick={onStartOver}>
            Mulai Survei Baru
          </button>
        </div>
      </div>
    </div>
  );
};
