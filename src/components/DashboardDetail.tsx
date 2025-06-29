import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DashboardDetail.css';
import { jobSets } from '../data';
import { getStudentById } from '../api';

function getJobTitleById(jobId: string, gender: string): string {
    const setPrefix = jobId.split('-')[0]; 
    const jobSet = jobSets.find(set => set.id === setPrefix);
    if (!jobSet) return jobId;
  
    const isMale = gender.toLowerCase() === 'male';
    const jobs = isMale ? jobSet.maleJobs : jobSet.femaleJobs;
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : jobId;
}

type Student = {
    studentInfo: {
      _id: string | object; // Added _id field to match Dashboard component
      name: string;
      gender: string;
      schoolName: string;
    };
    jobPreferences: {
      setId: string;
      rankedJobs: string[];
    }[];
    submittedAt: string;
};  

export function DashboardDetail() {
    const [student, setStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams(); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudent = async () => {
          try {
            const data = await getStudentById(id || '');
            setStudent(data);
            setError(null);
          } catch (err: any) {
            setError(err.message || 'Gagal mengambil data siswa');
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchStudent();
    }, [id]);
    
    if (isLoading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!student) return <p>Student data not found</p>;
    
    return (
        <div className="dashboard-detail-container">
            <button
                onClick={() => navigate('/dashboard/student-answer')}
                className="btn-back"
                style={{
                marginBottom: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
                }}
            >
                ← Kembali
            </button>
            <h1>Detail Jawaban Siswa {student.studentInfo.name}</h1>
            <div className="student-info">
                <p><strong>Nama:</strong> {student.studentInfo.name}</p>
                <p><strong>Gender:</strong> {student.studentInfo.gender}</p>
                <p><strong>Sekolah:</strong> {student.studentInfo.schoolName}</p>
                <p><strong>Submit:</strong> {new Date(student.submittedAt).toLocaleString()}</p>
            </div>
    
          <h2>Job Preferences</h2>
          <div className="job-table-wrapper">
            <table>
                <thead>
                    <tr>
                    <th>Set ID</th>
                    <th>Urutan pekerjaan sesuai dengan pilihan siswa</th>
                    </tr>
                </thead>
                <tbody>
                    {student.jobPreferences && student.jobPreferences.length > 0 ? (
                    student.jobPreferences.map((pref: any) => {
                        const jobTitles = pref.rankedJobs.map((jobId: string) =>
                            getJobTitleById(jobId, student.studentInfo.gender)
                        );

                        return (
                            <tr key={pref.setId}>
                            <td data-label="Set ID">{pref.setId}</td>
                            <td data-label="Ranked Jobs">{jobTitles.join(', ')}</td>
                            </tr>
                        );
                        })
                    ) : (
                        <tr>
                        <td colSpan={2} style={{ textAlign: 'center', fontStyle: 'italic' }}>
                            Tidak ada data yang tampil
                        </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
        </div>
    );      
}
