import React, { useState } from 'react';
import type { StudentInfo } from '../types';
import { SCHOOLS } from '../types';
import './StudentForm.css';

interface StudentFormProps {
  onSubmit: (studentInfo: StudentInfo) => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<StudentInfo>({
    name: '',
    gender: 'male',
    schoolName: '',
    customSchoolName: ''
  });

  const [errors, setErrors] = useState<Partial<StudentInfo & { customSchoolName?: string }>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Partial<StudentInfo & { customSchoolName?: string }> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }
    if (!formData.schoolName) {
      newErrors.schoolName = 'Sekolah harus dipilih';
    }
    if (formData.schoolName === 'Lainnya' && !formData.customSchoolName?.trim()) {
      newErrors.customSchoolName = 'Nama sekolah harus diisi';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Create final student info with proper school name
      const finalStudentInfo: StudentInfo = {
        ...formData,
        schoolName: formData.schoolName === 'Lainnya' ? formData.customSchoolName! : formData.schoolName
      };
      onSubmit(finalStudentInfo);
    }
  };

  const handleInputChange = (field: keyof (StudentInfo & { customSchoolName?: string }), value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear custom school name when changing from "Lainnya" to another option
    if (field === 'schoolName' && value !== 'Lainnya') {
      setFormData(prev => ({ ...prev, customSchoolName: '' }));
      setErrors(prev => ({ ...prev, customSchoolName: undefined }));
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
            <select
              id="school"
              value={formData.schoolName}
              onChange={(e) => handleInputChange('schoolName', e.target.value)}
              className={errors.schoolName ? 'error' : ''}
            >
              <option value="">Pilih sekolah Anda</option>
              {SCHOOLS.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
            {errors.schoolName && <span className="error-message">{errors.schoolName}</span>}
          </div>

          {formData.schoolName === 'Lainnya' && (
            <div className="form-group">
              <label htmlFor="customSchool">Nama Sekolah *</label>
              <input
                type="text"
                id="customSchool"
                value={formData.customSchoolName || ''}
                onChange={(e) => handleInputChange('customSchoolName', e.target.value)}
                className={errors.customSchoolName ? 'error' : ''}
                placeholder="Masukkan nama sekolah Anda"
              />
              {errors.customSchoolName && <span className="error-message">{errors.customSchoolName}</span>}
            </div>
          )}

          <button type="submit" className="submit-button">
            Lanjutkan ke Survei
          </button>
        </form>
      </div>
    </div>
  );
};
