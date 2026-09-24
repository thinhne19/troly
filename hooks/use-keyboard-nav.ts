// hooks/use-keyboard-nav.ts — Arrow & Tab Grid Traversal for High-Speed Data Entry
import { useEffect, useCallback } from 'react';

interface GridCoordinates {
  rowIndex: number;
  colIndex: number;
}

export function useKeyboardGridNav(
  rowCount: number,
  colCount: number,
  onCellFocus: (coords: GridCoordinates) => void
) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, row: number, col: number) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          // Move down to next row, same column
          if (row < rowCount - 1) {
            onCellFocus({ rowIndex: row + 1, colIndex: col });
          }
          break;
        case 'ArrowDown':
          if (row < rowCount - 1) {
            onCellFocus({ rowIndex: row + 1, colIndex: col });
          }
          break;
        case 'ArrowUp':
          if (row > 0) {
            onCellFocus({ rowIndex: row - 1, colIndex: col });
          }
          break;
        case 'ArrowRight':
          // Move right if at end of input or selection
          if (col < colCount - 1) {
            onCellFocus({ rowIndex: row, colIndex: col + 1 });
          }
          break;
        case 'ArrowLeft':
          if (col > 0) {
            onCellFocus({ rowIndex: row, colIndex: col - 1 });
          }
          break;
      }
    },
    [rowCount, colCount, onCellFocus]
  );

  return { handleKeyDown };
}
