import React from 'react';

interface TasksDoneProps {
  width?: number | string;
  height?: number | string;
  fill?: string;
  className?: string;
}

const TasksDoneIcon: React.FC<TasksDoneProps> = ({ width = 24, height = 24, fill = '#000000', className }) => (
  <svg
    viewBox="0 0 48 48"
    id="Layer_2"
    data-name="Layer 2"
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <defs>
        <style>{`.cls-1{fill:none;stroke:${fill};stroke-linecap:round;stroke-linejoin:round;stroke-width:1.25;}`}</style>
      </defs>
      <path className="cls-1" d="M39.5,15.5h-9a2,2,0,0,1-2-2v-9h-18a2,2,0,0,0-2,2v35a2,2,0,0,0,2,2h27a2,2,0,0,0,2-2Z" />
      <line className="cls-1" x1="28.5" y1="4.5" x2="39.5" y2="15.5" />
      <line className="cls-1" x1="24.37" y1="22.52" x2="35.58" y2="22.52" />
      <line className="cls-1" x1="24.37" y1="34.84" x2="35.58" y2="34.84" />
      <line className="cls-1" x1="13.17" y1="34.75" x2="16.27" y2="37.85" />
      <line className="cls-1" x1="16.27" y1="37.85" x2="22.3" y2="31.82" />
      <line className="cls-1" x1="13.17" y1="22.43" x2="16.27" y2="25.53" />
      <line className="cls-1" x1="16.27" y1="25.53" x2="22.3" y2="19.51" />
    </g>
  </svg>
);

export default TasksDoneIcon;
