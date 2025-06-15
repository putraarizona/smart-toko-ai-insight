
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Delete, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnScreenNumpadProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  position: { top: number; left: number };
  allowDecimal?: boolean;
  maxLength?: number;
}

export const OnScreenNumpad: React.FC<OnScreenNumpadProps> = ({
  value,
  onChange,
  onConfirm,
  onCancel,
  position,
  allowDecimal = true,
  maxLength
}) => {
  const handleNumberClick = (num: string) => {
    if (maxLength && value.length >= maxLength) return;
    
    // Handle special cases for multiple zeros
    if (num === '00' || num === '000') {
      if (value === '0' || value === '') return;
    }
    
    // Don't allow leading zeros except for decimal cases
    if (value === '0' && num !== '.' && allowDecimal) return;
    if (value === '' && num === '0') {
      onChange('0');
      return;
    }
    
    onChange(value + num);
  };

  const handleDecimalClick = () => {
    if (!allowDecimal) return;
    if (value.includes('.')) return;
    if (value === '') {
      onChange('0.');
    } else {
      onChange(value + '.');
    }
  };

  const handleBackspace = () => {
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const numberButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['00', '0', '000']
  ];

  return (
    <div
      className="fixed z-50"
      style={{
        top: position.top,
        left: position.left,
        maxWidth: '280px'
      }}
    >
      <Card className="p-4 shadow-2xl border-2 bg-white">
        {/* Display */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="text-right text-lg font-mono">
            {value || '0'}
          </div>
        </div>

        {/* Number Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {numberButtons.map((row, rowIndex) =>
            row.map((num, colIndex) => (
              <Button
                key={`${rowIndex}-${colIndex}`}
                variant="outline"
                size="lg"
                className="h-12 text-lg font-semibold hover:bg-blue-50"
                onClick={() => handleNumberClick(num)}
              >
                {num}
              </Button>
            ))
          )}
        </div>

        {/* Action Buttons Row 1 */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {allowDecimal && (
            <Button
              variant="outline"
              size="lg"
              className="h-12 text-lg font-semibold hover:bg-blue-50"
              onClick={handleDecimalClick}
            >
              .
            </Button>
          )}
          {!allowDecimal && <div></div>}
          
          <Button
            variant="outline"
            size="lg"
            className="h-12 text-lg font-semibold hover:bg-red-50"
            onClick={handleBackspace}
          >
            <Delete className="w-5 h-5" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="h-12 text-lg font-semibold hover:bg-red-50"
            onClick={handleClear}
          >
            C
          </Button>
        </div>

        {/* Action Buttons Row 2 */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="lg"
            className="h-12 text-lg font-semibold hover:bg-gray-50"
            onClick={onCancel}
          >
            <X className="w-5 h-5 mr-2" />
            Batal
          </Button>
          
          <Button
            size="lg"
            className="h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
            onClick={onConfirm}
          >
            <Check className="w-5 h-5 mr-2" />
            OK
          </Button>
        </div>
      </Card>
    </div>
  );
};
