/**
 * TaskCell Component
 *
 * Renders a single cell in the tasks table. Handles editing, selection, tab navigation, and option dropdowns.
 */
import React, { useRef, useState } from 'react';
import { Task } from '../../types';
import { formatDate } from '../../utils/dateUtils';

type Props = {
  col: string;
  task: Task;
  updateTaskField: (id: string, input: any) => Promise<void>;
  onOpenOptionDropdown: (cell: HTMLElement, type: 'status' | 'project', task: Task) => void;
  rowIdx: number;
  colIdx: number;
  editableCols: string[];
  totalRows: number;
  focusCell: (row: number, col: number) => void;
};

/**
 * Renders a table cell for a given column and task. Supports inline editing, dropdowns, and keyboard navigation.
 */
export const TaskCell: React.FC<Props> = ({ col, task, updateTaskField, onOpenOptionDropdown, rowIdx, colIdx, editableCols, totalRows, focusCell }) => {
  if (col === 'done') {
    return (
      <td key={col} className="col-done">
        <input
          type="checkbox"
          checked={!!task.done}
          onChange={async () => {
            await updateTaskField(task.id, { done: !task.done });
          }}
        />
      </td>
    );
  }

  if (col === 'name') {
    return (
      <td
        key={col}
        contentEditable
        suppressContentEditableWarning
        data-field="title"
        tabIndex={0}
        onMouseDown={(e) => {
          if (e.button === 2) {
            e.preventDefault();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            let nextColIdx = editableCols.indexOf(col) + 1;
            let nextRowIdx = rowIdx;
            if (nextColIdx >= editableCols.length) {
              nextColIdx = 0;
              nextRowIdx = rowIdx + 1;
              if (nextRowIdx >= totalRows) {
                nextRowIdx = 0;
              }
            }
            focusCell(nextRowIdx, nextColIdx);
          }
        }}
        onBlur={async (e) => {
          const newValue = e.currentTarget.textContent || '';
          if (newValue.trim() !== task.title) {
            await updateTaskField(task.id, { title: newValue.trim() });
          }
        }}
      >
        {task.title}
      </td>
    );
  }

  if (col === 'description') {
    return (
      <td
        key={col}
        contentEditable
        suppressContentEditableWarning
        data-field="description"
        tabIndex={0}
        onMouseDown={(e) => {
          if (e.button === 2) {
            e.preventDefault();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            let nextColIdx = editableCols.indexOf(col) + 1;
            let nextRowIdx = rowIdx;
            if (nextColIdx >= editableCols.length) {
              nextColIdx = 0;
              nextRowIdx = rowIdx + 1;
              if (nextRowIdx >= totalRows) {
                nextRowIdx = 0;
              }
            }
            focusCell(nextRowIdx, nextColIdx);
          }
        }}
        onBlur={async (e) => {
          const newValue = e.currentTarget.textContent || '';
          if (newValue.trim() !== (task.description || '')) {
            await updateTaskField(task.id, { description: newValue.trim() });
          }
        }}
      >
        {task.description || ''}
      </td>
    );
  }

  const [statusOpen, setStatusOpen] = useState(false);
  if (col === 'status') {
    return (
      <td
        key={col}
        data-field="status"
        tabIndex={0}
        onClick={(e) => {
          setStatusOpen(true);
          onOpenOptionDropdown(e.currentTarget, 'status', task);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            setStatusOpen(false);
            let nextColIdx = editableCols.indexOf(col) + 1;
            let nextRowIdx = rowIdx;
            if (nextColIdx >= editableCols.length) {
              nextColIdx = 0;
              nextRowIdx = rowIdx + 1;
              if (nextRowIdx >= totalRows) {
                nextRowIdx = 0;
              }
            }
            focusCell(nextRowIdx, nextColIdx);
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            if (!statusOpen) {
              setStatusOpen(true);
              onOpenOptionDropdown(e.currentTarget, 'status', task);
            } else {
              setStatusOpen(false);
              // simulate closing: blur the cell
              (e.currentTarget as HTMLElement).blur();
            }
          }
        }}
      >
        {task.statuses && task.statuses.length > 0 ? (
          task.statuses.map(s => (
            <span
              key={s.id}
              className="badge"
              style={{
                background: `${s.color}20`,
                borderColor: `${s.color}50`,
                color: s.color
              }}
            >
              {s.value}
            </span>
          ))
        ) : (
          <span className="muted">Select…</span>
        )}
      </td>
    );
  }

  const deadlineInputRef = useRef<HTMLInputElement>(null);
  const [deadlineOpen, setDeadlineOpen] = useState(false);
  if (col === 'deadline') {
    return (
      <td
        key={col}
        className="deadline-cell"
        data-field="deadline"
        tabIndex={0}
        onClick={(e) => {
          setDeadlineOpen(true);
          const input = e.currentTarget.querySelector('input') as HTMLInputElement;
          input?.showPicker?.();
          input?.focus();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            setDeadlineOpen(false);
            let nextColIdx = editableCols.indexOf(col) + 1;
            let nextRowIdx = rowIdx;
            if (nextColIdx >= editableCols.length) {
              nextColIdx = 0;
              nextRowIdx = rowIdx + 1;
              if (nextRowIdx >= totalRows) {
                nextRowIdx = 0;
              }
            }
            focusCell(nextRowIdx, nextColIdx);
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            if (!deadlineOpen) {
              setDeadlineOpen(true);
              deadlineInputRef.current?.showPicker?.();
              deadlineInputRef.current?.focus();
            } else {
              setDeadlineOpen(false);
              deadlineInputRef.current?.blur();
            }
          }
        }}
      >
        {formatDate(task.deadline)}
        <input
          ref={deadlineInputRef}
          type="date"
          className="deadline-picker-hidden"
          value={task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : ''}
          onChange={async (e) => {
            await updateTaskField(task.id, { deadline: e.target.value || null });
          }}
        />
      </td>
    );
  }

  const [projectOpen, setProjectOpen] = useState(false);
  if (col === 'project') {
    return (
      <td
        key={col}
        data-field="project"
        tabIndex={0}
        onClick={(e) => {
          setProjectOpen(true);
          onOpenOptionDropdown(e.currentTarget, 'project', task);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            setProjectOpen(false);
            let nextColIdx = editableCols.indexOf(col) + 1;
            let nextRowIdx = rowIdx;
            if (nextColIdx >= editableCols.length) {
              nextColIdx = 0;
              nextRowIdx = rowIdx + 1;
              if (nextRowIdx >= totalRows) {
                nextRowIdx = 0;
              }
            }
            focusCell(nextRowIdx, nextColIdx);
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            if (!projectOpen) {
              setProjectOpen(true);
              onOpenOptionDropdown(e.currentTarget, 'project', task);
            } else {
              setProjectOpen(false);
              (e.currentTarget as HTMLElement).blur();
            }
          }
        }}
      >
        {task.projects && task.projects.length > 0 ? (
          task.projects.map(p => (
            <span
              key={p.id}
              className="badge"
              style={{
                background: `${p.color}20`,
                borderColor: `${p.color}50`,
                color: p.color
              }}
            >
              {p.value}
            </span>
          ))
        ) : (
          <span className="muted">Select…</span>
        )}
      </td>
    );
  }

  return <td key={col}></td>;
};

export default TaskCell;
