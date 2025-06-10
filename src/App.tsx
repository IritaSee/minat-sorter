import { useState } from 'react';
import { StudentForm } from './components/StudentForm';
import { JobSorter } from './components/JobSorterNew';
import { CompletionPage } from './components/CompletionPage';
import type { StudentInfo, StudentPreferences } from './types';
import { jobSets, savePreferencesToDatabase } from './data';
import './App.css'

type AppState = 'form' | 'sorting' | 'completed';

function App() {
  const [appState, setAppState] = useState<AppState>('form');
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [allPreferences, setAllPreferences] = useState<{ setId: string; rankedJobs: string[] }[]>([]);
  const [finalPreferences, setFinalPreferences] = useState<StudentPreferences | null>(null);

  const handleStudentFormSubmit = (info: StudentInfo) => {
    setStudentInfo(info);
    setAppState('sorting');
  };

  const handleJobSetComplete = async (rankedJobIds: string[]) => {
    const newPreference = {
      setId: jobSets[currentSetIndex].id,
      rankedJobs: rankedJobIds
    };

    const updatedPreferences = [...allPreferences, newPreference];
    setAllPreferences(updatedPreferences);

    // Check if this is the last set
    if (currentSetIndex === jobSets.length - 1) {
      // All sets completed, create final preferences
      const preferences: StudentPreferences = {
        studentInfo: studentInfo!,
        jobPreferences: updatedPreferences,
        submittedAt: new Date()
      };

      // Save to database (placeholder)
      const saved = await savePreferencesToDatabase(preferences);
      if (saved) {
        setFinalPreferences(preferences);
        setAppState('completed');
      } else {
        alert('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
      }
    } else {
      // Move to next set
      setCurrentSetIndex(currentSetIndex + 1);
    }
  };

  const handleBackToForm = () => {
    if (currentSetIndex > 0) {
      setCurrentSetIndex(currentSetIndex - 1);
      setAllPreferences(allPreferences.slice(0, -1));
    } else {
      setAppState('form');
      setStudentInfo(null);
      setAllPreferences([]);
      setCurrentSetIndex(0);
    }
  };

  const handleStartOver = () => {
    setAppState('form');
    setStudentInfo(null);
    setAllPreferences([]);
    setCurrentSetIndex(0);
    setFinalPreferences(null);
  };

  return (
    <div className="app">
      {appState === 'form' && (
        <StudentForm onSubmit={handleStudentFormSubmit} />
      )}
      
      {appState === 'sorting' && studentInfo && (
        <JobSorter
          jobSet={jobSets[currentSetIndex]}
          studentGender={studentInfo.gender}
          onComplete={handleJobSetComplete}
          onBack={currentSetIndex > 0 || allPreferences.length > 0 ? handleBackToForm : undefined}
          currentSet={currentSetIndex + 1}
          totalSets={jobSets.length}
        />
      )}
      
      {appState === 'completed' && finalPreferences && (
        <CompletionPage
          preferences={finalPreferences}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}

export default App
