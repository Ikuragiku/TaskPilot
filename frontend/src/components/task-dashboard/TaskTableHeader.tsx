/**
 * TaskTableHeader Component
 *
 * Renders the table header for tasks, including column drag-and-drop and sort controls.
 */
import React, { useRef } from 'react';
import { Sort } from '../../utils/taskSort';

type Props = {
  columns: string[];
  sorts: Sort[];
  setColumns: React.Dispatch<React.SetStateAction<string[]>>;
  setSorts: React.Dispatch<React.SetStateAction<Sort[]>>;
  columnWidths: Record<string, number>;
  handleColumnResize: (columnKey: string, newWidth: number) => void;
};

/**
 * Table header for the tasks table. Supports column reordering and sorting.
 */
export const TaskTableHeader: React.FC<Props> = ({ columns, sorts, setColumns, setSorts, columnWidths, handleColumnResize }) => {
  const dragColRef = useRef<string | null>(null);

  const labelMap: Record<string, string> = {
    done: 'Done',
    name: 'Name',
    description: 'Description',
    status: 'Status',
    deadline: 'Deadline',
    project: 'Project'
  };

  return (
    <thead>
      <tr>
        {columns.map(col => {
          const sIdx = sorts.findIndex(s => s.field === (col === 'name' ? 'title' : col));
          const width = columnWidths[col];
          return (
            <th
              key={col}
              className={col === 'done' ? 'col-done' : ''}
              style={{ width: width ? `${width}px` : undefined, position: 'relative' }}
              draggable
              data-col={col}
              onDragStart={(e) => {
                dragColRef.current = col;
                e.currentTarget.classList.add('th-dragging');
                e.dataTransfer.effectAllowed = 'move';
                try {
                  e.dataTransfer.setData('text/plain', col);
                } catch { }
              }}
              onDragEnd={(e) => {
                e.currentTarget.classList.remove('th-dragging');
                document.querySelectorAll('.th-drop-target').forEach(el =>
                  el.classList.remove('th-drop-target')
                );
                dragColRef.current = null;
              }}
              onDragOver={(e) => {
                e.preventDefault();
                document.querySelectorAll('.th-drop-target').forEach(el =>
                  el.classList.remove('th-drop-target')
                );
                if (col !== dragColRef.current) {
                  e.currentTarget.classList.add('th-drop-target');
                }
                e.dataTransfer.dropEffect = 'move';
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('th-drop-target');
              }}
              onDrop={(e) => {
                e.preventDefault();
                const toCol = col;
                if (!dragColRef.current || dragColRef.current === toCol) return;
                const fromIdx = columns.indexOf(dragColRef.current);
                const toIdx = columns.indexOf(toCol);
                if (fromIdx < 0 || toIdx < 0) return;
                const newColumns = [...columns];
                [newColumns[fromIdx], newColumns[toIdx]] = [newColumns[toIdx], newColumns[fromIdx]];
                setColumns(newColumns);
              }}
              onClick={(e) => {
                const field = col === 'name' ? 'title' : col;
                const shift = e.shiftKey;
                setSorts(prev => {
                  const existingIdx = prev.findIndex(s => s.field === field);
                  if (!shift) {
                    if (existingIdx === -1) {
                      return [{ field, asc: true }];
                    } else if (prev[existingIdx].asc) {
                      return [{ field, asc: false }];
                    } else {
                      return [];
                    }
                  } else {
                    if (existingIdx === -1) {
                      return [...prev, { field, asc: true }];
                    } else {
                      return prev.map((s, i) =>
                        i === existingIdx ? { ...s, asc: !s.asc } : s
                      );
                    }
                  }
                });
              }}
            >
              {labelMap[col] || col}
              {sIdx >= 0 && (
                <span className="sort-ind">
                  {sorts[sIdx].asc ? '↑' : '↓'}
                  <span className="idx">{sIdx + 1}</span>
                </span>
              )}
              <div
                className="resize-handle"
                draggable={false}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const th = e.currentTarget.parentElement as HTMLElement;
                  if (th) th.setAttribute('draggable', 'false');
                  const startX = e.clientX;
                  const startWidth = width || 150;
                  const onMouseMove = (me: MouseEvent) => {
                    const delta = me.clientX - startX;
                    handleColumnResize(col, startWidth + delta);
                  };
                  const onMouseUp = () => {
                    if (th) th.setAttribute('draggable', 'true');
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                  };
                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

export default TaskTableHeader;
