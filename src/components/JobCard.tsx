import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Job } from '../types';
import './JobCard.css';

interface JobCardProps {
  job: Job;
  isDragging?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDragActive,
  } = useDraggable({
    id: job.id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragActive ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`job-card ${isDragging ? 'dragging' : ''} ${isDragActive ? 'drag-active' : ''}`}
    >
      <h3>{job.title}</h3>
      {job.description && <p>{job.description}</p>}
    </div>
  );
};
