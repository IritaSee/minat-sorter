import React, { useState } from 'react';
import type { StudentInfo } from '../types';
import './StudentForm.css';

// Common school suggestions
const COMMON_SCHOOLS = [
  'SMPN 1 Melaya',
  'SMPN 2 Melaya',
  'SMPN 3 Melaya',
  'SMPN 4 Melaya',
  'SMPN 5 Melaya',
  'SMA Negeri 1 Melaya',
  'SMA Negeri 2 Melaya',
  'SMK Negeri 1 Melaya',
  'SMK Negeri 2 Melaya'
];

interface StudentFormProps {
  onSubmit: (studentInfo: StudentInfo) => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<StudentInfo>({
    name: '',
    gender: 'male',
    schoolName: ''
  });

  const [errors, setErrors] = useState<Partial<StudentInfo>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    const newErrors: Partial<StudentInfo> = {};
    
    // Name validation
    const nameValue = formData.name.trim();
    if (!nameValue) {
      newErrors.name = 'Nama harus diisi';
    } else if (nameValue.length < 3) {
      newErrors.name = 'Nama minimal 3 karakter';
    } else if (nameValue.length > 50) {
      newErrors.name = 'Nama maksimal 50 karakter';
    } else if (!/^[a-zA-Z\s'.]+$/.test(nameValue)) {
      newErrors.name = 'Nama hanya boleh berisi huruf, spasi, titik, dan apostrof';
    }
    
    // School validation
    const schoolValue = formData.schoolName.trim();
    if (!schoolValue) {
      newErrors.schoolName = 'Sekolah harus diisi';
    } else if (schoolValue.length < 5) {
      newErrors.schoolName = 'Nama sekolah terlalu pendek';
    } else if (schoolValue.length > 100) {
      newErrors.schoolName = 'Nama sekolah terlalu panjang';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // All validations passed
      setIsSubmitting(true);
      onSubmit({
        ...formData,
        name: nameValue,
        schoolName: schoolValue
      });
    }
  };

  const handleInputChange = (field: keyof StudentInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Capitalize first letter of each word for school name
    if (field === 'schoolName' && value) {
      const formattedValue = value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      if (formattedValue !== value) {
        setFormData(prev => ({ ...prev, [field]: formattedValue }));
      }
    }
  };

  return (
    <div className="student-form-container">
      <div className="student-form">
        <h1>Formulir Informasi Siswa</h1>
        <p className="form-description">
          Silakan isi informasi diri Anda sebelum melanjutkan ke survei minat karir.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
              placeholder="Masukkan nama lengkap Anda"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="gender">Jenis Kelamin *</label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value as StudentInfo['gender'])}
            >
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
              <option value="other">Lainnya</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="school">Sekolah *</label>
            <input
              type="text"
              id="school"
              value={formData.schoolName}
              onChange={(e) => handleInputChange('schoolName', e.target.value)}
              className={errors.schoolName ? 'error' : ''}
              placeholder="Masukkan nama sekolah Anda"
              list="school-suggestions"
            />
            <datalist id="school-suggestions">
              {COMMON_SCHOOLS.map((school) => (
                <option key={school} value={school} />
              ))}
            </datalist>
            {errors.schoolName && <span className="error-message">{errors.schoolName}</span>}
            <small className="helper-text">Contoh: SMPN 1 Melaya, SMA Negeri 2 Melaya</small>
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Sedang Mengirim...' : 'Lanjutkan ke Survei'}
          </button>
        </form>
      </div>
    </div>
  );
};
