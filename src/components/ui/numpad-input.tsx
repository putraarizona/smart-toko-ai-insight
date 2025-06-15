
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { OnScreenNumpad } from './on-screen-numpad';
import { cn } from '@/lib/utils';

interface NumpadInputProps extends Omit<React.ComponentProps<"input">, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  allowDecimal?: boolean;
  maxLength?: number;
  formatCurrency?: boolean;
}

export const NumpadInput = React.forwardRef<HTMLInputElement, NumpadInputProps>(
  ({ 
    value, 
    onChange, 
    onBlur,
    className, 
    placeholder, 
    disabled = false,
    allowDecimal = true,
    maxLength,
    formatCurrency = false,
    ...props 
  }, ref) => {
    const [showNumpad, setShowNumpad] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setShowNumpad(false);
          onBlur?.();
        }
      };

      if (showNumpad) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [showNumpad, onBlur]);

    const handleInputClick = () => {
      if (disabled) return;
      
      const inputElement = inputRef.current;
      if (inputElement) {
        const rect = inputElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const numpadHeight = 320; // Approximate numpad height
        
        // Position numpad below input if there's space, otherwise above
        const top = rect.bottom + numpadHeight > viewportHeight 
          ? rect.top - numpadHeight - 10
          : rect.bottom + 10;
        
        setPosition({
          top: top + window.scrollY,
          left: rect.left + window.scrollX
        });
        setShowNumpad(true);
      }
    };

    const handleNumpadChange = (newValue: string) => {
      onChange(newValue);
    };

    const handleNumpadConfirm = () => {
      setShowNumpad(false);
      onBlur?.();
    };

    const formatDisplayValue = (val: string) => {
      if (!formatCurrency || !val) return val;
      
      const numericValue = parseFloat(val.replace(/[^\d.]/g, ''));
      if (isNaN(numericValue)) return val;
      
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numericValue);
    };

    return (
      <div ref={containerRef} className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={formatCurrency ? formatDisplayValue(value) : value}
          onClick={handleInputClick}
          onChange={() => {}} // Prevent direct typing
          onKeyDown={(e) => e.preventDefault()} // Prevent keyboard input
          placeholder={placeholder}
          disabled={disabled}
          className={cn("cursor-pointer", className)}
          readOnly
          {...props}
        />
        
        {showNumpad && (
          <OnScreenNumpad
            value={value}
            onChange={handleNumpadChange}
            onConfirm={handleNumpadConfirm}
            onCancel={() => setShowNumpad(false)}
            position={position}
            allowDecimal={allowDecimal}
            maxLength={maxLength}
          />
        )}
      </div>
    );
  }
);

NumpadInput.displayName = "NumpadInput";
