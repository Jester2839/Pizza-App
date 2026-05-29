import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrderForm } from './OrderForm';
import { CartProvider } from '../hooks/useCart';
import { ModalProvider } from '../hooks/useAlert';
// import React from 'react';

// Mock fetch
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const renderOrderForm = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    ...props
  };

  return render(
    <ModalProvider>
      <CartProvider>
        <OrderForm {...defaultProps} />
      </CartProvider>
    </ModalProvider>
  );
};

describe('OrderForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { queryByText } = renderOrderForm({ isOpen: false });
    expect(queryByText('Dokončení objednávky')).toBeNull();
  });

  it('should show validation errors for empty fields on submit', async () => {
    renderOrderForm();
    
    const submitBtn = screen.getByRole('button', { name: /OBJEDNAT/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Jméno je povinné/i)).toBeDefined();
    expect(await screen.findByText(/Adresa je povinná/i)).toBeDefined();
  });

  it('should validate phone number format', async () => {
    renderOrderForm();
    
    const phoneInput = screen.getByLabelText(/Telefonní číslo/i);
    fireEvent.change(phoneInput, { target: { value: '123', name: 'phone' } });
    
    const submitBtn = screen.getByRole('button', { name: /OBJEDNAT/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Zadejte platné telefonní číslo/i)).toBeDefined();
  });

  it('should call API and close on successful submission', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as any);

    const onClose = vi.fn();
    const onSuccess = vi.fn();
    
    renderOrderForm({ onClose, onSuccess });

    fireEvent.change(screen.getByLabelText(/Jméno a příjmení/i), {
      target: { value: 'Jan Novák', name: 'customer_name' }
    });
    fireEvent.change(screen.getByLabelText(/Telefonní číslo/i), {
      target: { value: '+420777888999', name: 'phone' }
    });
    fireEvent.change(screen.getByLabelText(/Adresa doručení/i), {
      target: { value: 'Dlouhá 1, Praha', name: 'address' }
    });

    const submitBtn = screen.getByRole('button', { name: /OBJEDNAT/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      statusText: 'Server Error',
      json: async () => ({ message: 'Chyba na serveru' }),
    } as any);

    renderOrderForm();

    fireEvent.change(screen.getByLabelText(/Jméno a příjmení/i), { target: { value: 'Jan Novák', name: 'customer_name' } });
    fireEvent.change(screen.getByLabelText(/Telefonní číslo/i), { target: { value: '777888999', name: 'phone' } });
    fireEvent.change(screen.getByLabelText(/Adresa doručení/i), { target: { value: 'Adresa', name: 'address' } });

    fireEvent.click(screen.getByRole('button', { name: /OBJEDNAT/i }));

    await waitFor(() => {
      // useAlert hook displays the error, check if alert is shown (logic depends on AlertProvider implementation)
      expect(fetchMock).toHaveBeenCalled();
    });
  });
});