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
  const [availableJobs, setAvailableJobs] = useState<Job[]>(jobsToUse);
  const [rankedJobs, setRankedJobs] = useState<Job[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const handleComplete = () => {
    if (rankedJobs.length === jobsToUse.length) {
      onComplete(rankedJobs.map(job => job.id));
    }
  };

  const activeJob = activeId ? findJobById(activeId) : null;

  return (
    <div className="job-sorter">
      <div className="job-sorter-header">
        <h1>Set {currentSet} dari {totalSets}: {jobSet.name}</h1>
        <p className="instructions">
          Seret pekerjaan dari kiri ke kanan dan urutkan sesuai minat Anda.
          Pekerjaan yang paling Anda minati di atas, yang kurang diminati di bawah.
        </p>
        <div className="progress">
          <div className="progress-text">
            {rankedJobs.length} dari {jobsToUse.length} pekerjaan telah diurutkan
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(rankedJobs.length / jobsToUse.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

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

      <div className="job-sorter-actions">
        {onBack && (
          <button className="secondary-button" onClick={onBack}>
            Kembali
          </button>
        )}
        <button
          className="primary-button"
          onClick={handleComplete}
          disabled={rankedJobs.length !== jobsToUse.length}
        >
          {currentSet === totalSets ? 'Selesai' : 'Lanjutkan ke Set Berikutnya'}
        </button>
      </div>
    </div>
  );
};
