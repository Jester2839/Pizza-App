import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminOrdersPage } from './AdminOrdersPage';
import { fetchOrders, updateOrderStatus, deleteOrder } from '../services/api';
import { ModalProvider } from '../hooks/useAlert';
import { BrowserRouter } from 'react-router-dom';
// import React from 'react';

// Mockování API služeb
vi.mock('../services/api', () => ({
  fetchOrders: vi.fn(),
  updateOrderStatus: vi.fn(),
  deleteOrder: vi.fn(),
}));

// Mockování ResizeObserveru (používá se v OrderStatusSelector)
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
);

const mockOrders = [
  {
    id_orders: '101',
    customer_name: 'Jan Novák',
    phone: '123456789',
    address: 'Vodičkova 1, Praha',
    total_price: 500,
    status: 'přijato',
    created_at: '2023-10-27T10:00:00Z',
    items: [
      { pizza_name: 'Margherita', quantity: 2, dough_name: 'Klasické', base_name: 'Rajčatový', edge_name: 'Klasický' }
    ]
  }
];

describe('AdminOrdersPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchOrders as any).mockResolvedValue(mockOrders);
  });

  const renderOrders = () => render(
    <BrowserRouter>
      <ModalProvider>
        <AdminOrdersPage />
      </ModalProvider>
    </BrowserRouter>
  );

  it('should render the list of orders from API', async () => {
    renderOrders();
    expect(await screen.findByText(/Objednávka #101/i)).toBeDefined();
    expect(screen.getByText('Jan Novák')).toBeDefined();
    expect(screen.getByText('500 Kč')).toBeDefined();
  });

  it('should update order status when a status button is clicked', async () => {
    (updateOrderStatus as any).mockResolvedValue({ success: true });
    renderOrders();

    await screen.findByText(/Objednávka #101/i);
    
    // Najdeme tlačítko pro stav "v přípravě" a klikneme na něj
    const prepBtn = screen.getByText('v přípravě');
    fireEvent.click(prepBtn);

    await waitFor(() => {
      expect(updateOrderStatus).toHaveBeenCalledWith('101', 'v přípravě');
    });
  });

  it('should only show delete button for canceled orders and handle deletion', async () => {
    // Připravíme data se zrušenou objednávkou
    const canceledOrder = [{ ...mockOrders[0], status: 'zrušeno' }];
    (fetchOrders as any).mockResolvedValue(canceledOrder);
    
    renderOrders();
    
    const deleteBtn = await screen.findByText(/Smazat objednávku/i);
    fireEvent.click(deleteBtn);

    // Ověříme, že se otevřel potvrzovací modál
    expect(screen.getByText(/Opravdu chcete smazat tuto objednávku/i)).toBeDefined();
    
    const confirmBtn = screen.getByRole('button', { name: /^Smazat$/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteOrder).toHaveBeenCalledWith('101');
    });
  });

  it('should call fetchOrders with force refresh when clicking update button', async () => {
    renderOrders();
    const refreshBtn = await screen.findByText(/Aktualizovat/i);
    fireEvent.click(refreshBtn);
    expect(fetchOrders).toHaveBeenCalledWith(true);
  });
});