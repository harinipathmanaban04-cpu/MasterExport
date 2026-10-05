const API = 'http://localhost:5000/api';

export async function get(path) {
  const r = await fetch(API + path);
  if (!r.ok) {
    const err = await r.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return r.json();
}

export async function post(path, data) {
  const r = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ message: 'Save failed' }));
    throw new Error(err.message || 'Save failed');
  }
  return r.json();
}

export async function put(path, data) {
  const r = await fetch(API + path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ message: 'Update failed' }));
    throw new Error(err.message || 'Update failed');
  }
  return r.json();
}

export async function del(path) {
  const r = await fetch(API + path, { method: 'DELETE' });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ message: 'Delete failed' }));
    throw new Error(err.message || 'Delete failed');
  }
  return r.json();
}

// Sales Workflow API
export const prepareQuotation = (data) => post('/sales/prepare-quotation', data);
export const convertToOrder = (quotationId) => post('/sales/convert-to-order', { quotationId });
export const advanceOrderStage = (id, status) => put(`/sales/${id}/advance-stage`, status ? { status } : {});
export const resetAllData = () => post('/reset-data', {});

// Dedicated Quotations API
export const getQuotations = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
  ).toString();
  return get(`/quotations${qs ? '?' + qs : ''}`);
};
export const getQuotationById = (id) => get(`/quotations/${id}`);
export const createQuotation = (data) => post('/quotations', data);
export const updateQuotation = (id, data) => put(`/quotations/${id}`, data);
export const deleteQuotation = (id) => del(`/quotations/${id}`);
export const convertQuotationToOrder = (id, data = {}) => post(`/quotations/${id}/convert-to-order`, data);

// Shipments API
export const getShipments = () => get('/shipments');
export const getShipmentById = (id) => get(`/shipments/${id}`);
export const createShipment = (data) => post('/shipments', data);
export const updateShipment = (id, data) => put(`/shipments/${id}`, data);
export const deleteShipment = (id) => del(`/shipments/${id}`);

// Invoices & Payments API
export const getInvoices = () => get('/invoices');
export const getInvoiceById = (id) => get(`/invoices/${id}`);
export const createInvoice = (data) => post('/invoices', data);
export const updateInvoice = (id, data) => put(`/invoices/${id}`, data);
export const deleteInvoice = (id) => del(`/invoices/${id}`);

export const getPayments = () => get('/payments');
export const recordPayment = (data) => post('/payments', data);
export const deletePayment = (id) => del(`/payments/${id}`);


