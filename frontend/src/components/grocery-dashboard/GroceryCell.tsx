/**
 * TaskCell Component
 *
 * Renders a single cell in the tasks table. Handles editing, selection, tab navigation, and option dropdowns.
 */
import React, { useState } from 'react';
import { Grocery, ProjectOption } from '../../types';
import { readableTextColor, rgbaFromHex } from '../../utils/colorUtils';

type Props = {
  col: string;
  task: Grocery;
  updateTaskField: (id: string, input: any) => Promise<void>;
  onOpenOptionDropdown: (cell: HTMLElement, type: 'status' | 'project', task: Grocery | any) => void;
  rowIdx: number;
  editableCols: string[];
  groceryCategories?: ProjectOption[];
  totalRows: number;
  focusCell: (row: number, col: number) => void;
};

/**
 * Renders a table cell for a given column and task. Supports inline editing, dropdowns, and keyboard navigation.
 */
export const TaskCell: React.FC<Props> = ({ col, task, updateTaskField, onOpenOptionDropdown, rowIdx, editableCols, totalRows, focusCell, groceryCategories = [] }) => {
  const [projectOpen, setProjectOpen] = useState(false);
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
          if (newValue.trim() !== (task.menge || '')) {
            await updateTaskField(task.id, { menge: newValue.trim() });
          }
        }}
      >
        {task.menge || ''}
      </td>
    );
  }

  // 'menge' is used by Grocery board as a text field mapped to description
  if (col === 'menge') {
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
          if (newValue.trim() !== (task.menge || '')) {
            await updateTaskField(task.id, { menge: newValue.trim() });
          }
        }}
      >
        {task.menge || ''}
      </td>
    );
  }

  // remove status/deadline/project columns for Grocery cell — Grocery uses only done, name, menge, kategorie

  // 'kategorie' for Grocery board maps to project behaviour (single/multi category badges)
  if (col === 'kategorie') {
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
        {task.kategorieIds && task.kategorieIds.length > 0 ? (
          task.kategorieIds.map(id => {
            const cat = groceryCategories.find(c => c.id === id);
            return (
              <span
                key={id}
                className="badge muted"
                style={{
                  background: cat?.color ? rgbaFromHex(cat.color, 0.22) : undefined,
                  borderColor: cat?.color ? rgbaFromHex(cat.color, 0.45) : undefined,
                  color: cat?.color ? readableTextColor(cat.color) : undefined,
                }}
              >
                {cat ? cat.value : id}
              </span>
            );
          })
        ) : (
          <span className="muted">Select…</span>
        )}
      </td>
    );
  }

  return <td key={col}></td>;
};

export default TaskCell;
