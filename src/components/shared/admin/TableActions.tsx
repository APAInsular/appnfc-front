// src/components/admin/TableActions.tsx
import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import ViewDataModal from '../../modals/ViewDataModal';

interface Props {
  editPath: string;
  patientName: string;
  pencilIcon?: ComponentChildren;
  bookIcon?: ComponentChildren;  
}

export default function TableActions({ editPath, patientName, pencilIcon, bookIcon }: Props) {
  const [isViewOpen, setIsViewOpen] = useState(false);

  return (
    <div className="flex justify-end gap-2 pr-2">
      <a href={editPath} className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors">
        {pencilIcon}
      </a>

      <button 
        onClick={() => setIsViewOpen(true)}
        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
      >
        {bookIcon}
      </button>

      <ViewDataModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} patientName={patientName} />
    </div>
  );
}