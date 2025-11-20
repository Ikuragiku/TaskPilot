/**
 * ColorPalettePicker Component
 *
 * Renders a grid of color swatches for selecting a color. Used in dropdowns and option editors.
 */
import React from 'react';
import { PALETTE } from '../../utils/constants';

type Props = {
  selectedColor: string;
  onColorSelect: (color: string) => void;
};

/**
 * Color swatch picker for selecting a color from the palette.
 */
export const ColorPalettePicker: React.FC<Props> = ({ selectedColor, onColorSelect }) => {
  return (
    <div className="swatches">
      {PALETTE.map(p => (
        <div
          key={p.color}
          className={`swatch${selectedColor === p.color ? ' selected' : ''}`}
          data-color={p.color}
          title={p.name}
          style={{ background: p.color }}
          onClick={() => onColorSelect(p.color)}
        />
      ))}
    </div>
  );
};
