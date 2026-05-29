import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuantitySelector } from './QuantitySelector';
// import React from 'react';

describe('QuantitySelector Component', () => {
  it('should display the current quantity', () => {
    render(<QuantitySelector quantity={5} onChange={vi.fn()} />);
    expect(screen.getByText('5')).toBeDefined();
  });

  it('should call onChange with quantity - 1 when minus is clicked', () => {
    const onChange = vi.fn();
    render(<QuantitySelector quantity={5} onChange={onChange} />);
    
    const minusBtn = screen.getByLabelText(/Snížit množství/i);
    fireEvent.click(minusBtn);
    
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('should call onChange with quantity + 1 when plus is clicked', () => {
    const onChange = vi.fn();
    render(<QuantitySelector quantity={5} onChange={onChange} />);
    
    const plusBtn = screen.getByLabelText(/Zvýšit množství/i);
    fireEvent.click(plusBtn);
    
    expect(onChange).toHaveBeenCalledWith(6);
  });
});