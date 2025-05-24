import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '../types';
import './JobCard.css';

interface SortableJobCardProps {
  job: Job;
  rank: number;
}

export const SortableJobCard: React.FC<SortableJobCardProps> = ({ job, rank }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: job.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`job-card sortable ${isDragging ? 'dragging' : ''}`}
    >
      <div className="rank-badge">{rank}</div>
      <div className="job-content">
        <h3>{job.title}</h3>
        {job.description && <p>{job.description}</p>}
      </div>
    </div>
  );
};
