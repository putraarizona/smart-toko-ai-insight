
import { useState } from 'react';

interface UseNumpadProps {
  initialValue?: string;
  allowDecimal?: boolean;
  maxLength?: number;
  onConfirm?: (value: string) => void;
}

export const useNumpad = ({
  initialValue = '',
  allowDecimal = true,
  maxLength,
  onConfirm
}: UseNumpadProps = {}) => {
  const [value, setValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (newValue: string) => {
    setValue(newValue);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    onConfirm?.(value);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setValue(initialValue);
  };

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const reset = () => setValue('');

  return {
    value,
    setValue,
    isOpen,
    handleChange,
    handleConfirm,
    handleCancel,
    open,
    close,
    reset
  };
};
