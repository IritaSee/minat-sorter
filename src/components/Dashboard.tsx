import { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

type Student = {
  studentInfo: {
    name: string;
    gender: string;
    schoolName: string;
    customSchoolName: string;
  };
  jobPreferences: {
    setId: string;
    rankedJobs: string[];
  }[];
  submittedAt: string;
};

export function Dashboard() {
    const [students, setStudents] = useState<Student[]>([]);
    const URL = import.meta.env.VITE_API_URL;
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
            setIsLoading(true);
            const response = await axios.get(`${URL}/students/`);
            setStudents(response.data);
            setError(null); 
            } catch (err: any) {
            setError(err.message || 'Gagal mengambil data');
            } finally {
            setIsLoading(false);
            }
        };

        fetchStudents();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="dashboard-container">
          <div>
            <h1>List Jawaban Siswa</h1>
            <button
                onClick={() => navigate('/')}
                className="btn-new"
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
                Form Survey
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Gender</th>
                <th>Sekolah</th>
                <th>Submit</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, index) => (
                <tr key={s.id}>
                  <td data-label="No">{index + 1}</td>
                  <td data-label="Nama">{s.name}</td>
                  <td data-label="Gender">{s.gender}</td>
                  <td data-label="Sekolah">
                    {s.schoolName || s.customSchoolName}
                  </td>
                  <td data-label="Submit">
                    {new Date(s.submittedAt).toLocaleString()}
                  </td>
                  <td data-label="Aksi">
                    <button
                      onClick={() => {
                        window.location.href = `/dashboard/student-answer/${s.id}`;
                      }}
                    >
                      Lihat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    );
}
