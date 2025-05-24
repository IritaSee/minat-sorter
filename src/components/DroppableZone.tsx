import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableZoneProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const DroppableZone: React.FC<DroppableZoneProps> = ({ id, children, className = '' }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const style = {
    backgroundColor: isOver ? 'rgba(0, 150, 255, 0.1)' : undefined,
    border: isOver ? '2px dashed rgba(0, 150, 255, 0.5)' : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children}
    </div>
  );
};
