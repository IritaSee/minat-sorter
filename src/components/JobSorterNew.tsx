import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Job, JobSet } from '../types';
import { JobCard } from './JobCard';
import { SortableJobCard } from './SortableJobCard';
import { DroppableZone } from './DroppableZone';
import './JobSorter.css';

interface JobSorterProps {
  jobSet: JobSet;
  studentGender: 'male' | 'female' | 'other';
  onComplete: (rankedJobIds: string[]) => void;
  onBack?: () => void;
  currentSet: number;
  totalSets: number;
}

export const JobSorter: React.FC<JobSorterProps> = ({
  jobSet,
  studentGender,
  onComplete,
  onBack,
  currentSet,
  totalSets,
}) => {
  // Select jobs based on gender
  const getJobsForGender = (gender: 'male' | 'female' | 'other'): Job[] => {
    if (gender === 'female') {
      return jobSet.femaleJobs;
    }
    return jobSet.maleJobs; // Default to male jobs for 'male' and 'other'
  };

  const jobsToUse = getJobsForGender(studentGender);
  
  // State for mode toggle
  const [isEasyMode, setIsEasyMode] = useState(false);
  
  // State for drag and drop mode
  const [availableJobs, setAvailableJobs] = useState<Job[]>(jobsToUse);
  const [rankedJobs, setRankedJobs] = useState<Job[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // State for easy mode
  const [easyModeRanks, setEasyModeRanks] = useState<Record<string, number>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeJob = findJobById(active.id as string);
    if (!activeJob) return;

    // If dropped on available jobs area (moving from ranked back to available)
    if (over.id === 'available-jobs') {
      if (rankedJobs.find(job => job.id === activeJob.id)) {
        setRankedJobs(prev => prev.filter(job => job.id !== activeJob.id));
        setAvailableJobs(prev => [...prev, activeJob]);
      }
      return;
    }

    // If dropped on ranked jobs area
    if (over.id === 'ranked-jobs') {
      if (availableJobs.find(job => job.id === activeJob.id)) {
        setAvailableJobs(prev => prev.filter(job => job.id !== activeJob.id));
        setRankedJobs(prev => [...prev, activeJob]);
      }
      return;
    }

    // If reordering within ranked jobs
    if (rankedJobs.find(job => job.id === activeJob.id)) {
      const oldIndex = rankedJobs.findIndex(job => job.id === activeJob.id);
      const newIndex = rankedJobs.findIndex(job => job.id === over.id);
      
      if (oldIndex !== newIndex) {
        setRankedJobs(arrayMove(rankedJobs, oldIndex, newIndex));
      }
    }
  };

  const findJobById = (id: string): Job | undefined => {
    return [...availableJobs, ...rankedJobs].find(job => job.id === id);
  };

  // Easy mode handlers
  const handleRankChange = (jobId: string, rank: number) => {
    setEasyModeRanks(prev => {
      // Create a copy of the current ranks
      const newRanks = { ...prev };
      
      // If rank is 0 or invalid, clear the current job's rank
      if (rank <= 0 || rank > jobsToUse.length) {
        delete newRanks[jobId];
        return newRanks;
      }
      
      // Find if any other job already has this rank
      const existingJobWithRank = Object.entries(newRanks).find(
        ([id, existingRank]) => existingRank === rank && id !== jobId
      );
      
      // If another job has this rank, clear it
      if (existingJobWithRank) {
        delete newRanks[existingJobWithRank[0]];
      }
      
      // Assign the new rank to the current job
      newRanks[jobId] = rank;
      
      return newRanks;
    });
  };

  const handleToggleMode = () => {
    setIsEasyMode(!isEasyMode);
    // Reset states when switching modes
    if (!isEasyMode) {
      // Switching to easy mode
      setAvailableJobs(jobsToUse);
      setRankedJobs([]);
      setEasyModeRanks({});
    } else {
      // Switching to drag mode
      setEasyModeRanks({});
    }
  };

  const getProgress = () => {
    if (isEasyMode) {
      const filledRanks = Object.values(easyModeRanks).filter(rank => rank >= 1 && rank <= jobsToUse.length);
      return filledRanks.length;
    }
    return rankedJobs.length;
  };

  const isEasyModeComplete = () => {
    const ranks = Object.values(easyModeRanks);
    const validRanks = ranks.filter(rank => rank >= 1 && rank <= jobsToUse.length);
    const uniqueRanks = new Set(validRanks);
    return validRanks.length === jobsToUse.length && uniqueRanks.size === jobsToUse.length;
  };

  const handleComplete = () => {
    if (isEasyMode) {
      if (isEasyModeComplete()) {
        // Convert easy mode ranks to ordered job IDs
        const rankedJobIds = jobsToUse
          .map(job => ({ job, rank: easyModeRanks[job.id] || 999 }))
          .sort((a, b) => a.rank - b.rank)
          .map(item => item.job.id);
        onComplete(rankedJobIds);
      }
    } else {
      if (rankedJobs.length === jobsToUse.length) {
        onComplete(rankedJobs.map(job => job.id));
      }
    }
  };

  const activeJob = activeId ? findJobById(activeId) : null;
  const progress = getProgress();

  return (
    <div className="job-sorter">
      <div className="job-sorter-header">
        <div className="mode-toggle">
          <button 
            className={`mode-button ${!isEasyMode ? 'active' : ''}`}
            onClick={() => !isEasyMode || handleToggleMode()}
          >
            Drag & Drop
          </button>
          <button 
            className={`mode-button ${isEasyMode ? 'active' : ''}`}
            onClick={() => isEasyMode || handleToggleMode()}
          >
            Easy Mode
          </button>
        </div>
        
        <h1>Set {currentSet} dari {totalSets}: {jobSet.name}</h1>
        <p className="instructions">
          {isEasyMode ? 
            'Isi angka 1-12 pada kotak di sebelah setiap pekerjaan. 1 untuk pekerjaan yang paling diminati, 12 untuk yang paling tidak diminati.' :
            'Seret pekerjaan dari kiri ke kanan dan urutkan sesuai minat Anda. Pekerjaan yang paling Anda minati di atas, yang kurang diminati di bawah.'
          }
        </p>
        <div className="progress">
          <div className="progress-text">
            {progress} dari {jobsToUse.length} pekerjaan telah diurutkan
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(progress / jobsToUse.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {isEasyMode ? (
        // Easy Mode View
        <div className="easy-mode-content">
          <h2>Isi Ranking untuk Setiap Pekerjaan</h2>
          <div className="ranking-instructions">
            <p>Setiap ranking (1-12) hanya dapat digunakan sekali. Jika Anda memilih ranking yang sudah digunakan, pekerjaan sebelumnya akan dikosongkan.</p>
          </div>
          <div className="easy-mode-jobs">
            {jobsToUse.map((job, index) => {
              const currentRank = easyModeRanks[job.id];
              
              return (
                <div key={job.id} className="easy-mode-job-item">
                  <div className="job-info">
                    <span className="job-number">{index + 1}.</span>
                    <span className="job-title">{job.title}</span>
                    {job.description && <span className="job-description">{job.description}</span>}
                  </div>
                  <div className="rank-input-container">
                    <label htmlFor={`rank-${job.id}`}>Ranking:</label>
                    <input
                      id={`rank-${job.id}`}
                      type="number"
                      min="1"
                      max={jobsToUse.length}
                      value={currentRank || ''}
                      onChange={(e) => handleRankChange(job.id, parseInt(e.target.value) || 0)}
                      placeholder="1-12"
                      className={`rank-input ${currentRank ? 'filled' : ''}`}
                    />
                    {currentRank && (
                      <span className="rank-status">✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Drag & Drop Mode View
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="job-sorter-content">
            <div className="available-jobs-section">
              <h2>Daftar Pekerjaan</h2>
              <DroppableZone id="available-jobs" className="available-jobs">
                {availableJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
                {availableJobs.length === 0 && (
                  <div className="empty-state">
                    Semua pekerjaan telah dipindahkan
                  </div>
                )}
              </DroppableZone>
            </div>

            <div className="ranked-jobs-section">
              <h2>Urutan Minat Anda</h2>
              <div className="rank-indicator">
                <span>Paling diminati</span>
                <span>Kurang diminati</span>
              </div>
              <SortableContext
                items={rankedJobs.map(job => job.id)}
                strategy={verticalListSortingStrategy}
              >
                <DroppableZone id="ranked-jobs" className="ranked-jobs">
                  {rankedJobs.map((job, index) => (
                    <SortableJobCard 
                      key={job.id} 
                      job={job} 
                      rank={index + 1}
                    />
                  ))}
                  {rankedJobs.length === 0 && (
                    <div className="drop-zone">
                      Seret pekerjaan ke sini untuk mengurutkannya
                    </div>
                  )}
                </DroppableZone>
              </SortableContext>
            </div>
          </div>

          <DragOverlay>
            {activeJob ? <JobCard job={activeJob} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <div className="job-sorter-actions">
        {onBack && (
          <button className="secondary-button" onClick={onBack}>
            Kembali
          </button>
        )}
        <button
          className="primary-button"
          onClick={handleComplete}
          disabled={isEasyMode ? !isEasyModeComplete() : rankedJobs.length !== jobsToUse.length}
        >
          {currentSet === totalSets ? 'Selesai' : 'Lanjutkan ke Set Berikutnya'}
        </button>
      </div>
    </div>
  );
};
