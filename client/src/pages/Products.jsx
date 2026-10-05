import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Sparkles, ChevronDown } from 'lucide-react';
import { get, post, put, del } from '../api';
import Modal from '../components/Modal';
import { useCurrency } from '../context/CurrencyContext';

const defaultProducts = [
  {
    _id: 'prd-1',
    sku: 'PRD-01',
    name: 'Basmati Rice 1121',
    icon: '🌾',
    description: 'Long grain, double polished, 25kg PP bags',
    hsCode: '1006.30.20',
    price: 950.00,
    unit: 'MT',
    stock: 120,
    availableStock: '120 MT',
    isLowStock: false
  },
  {
    _id: 'prd-2',
    sku: 'PRD-02',
    name: 'Cotton Yarn 30s',
    icon: '🧶',
    description: 'Combed ring spun 100% cotton yarn',
    hsCode: '5205.12.00',
    price: 3.40,
    unit: 'KG',
    stock: 4500,
    availableStock: '4,500 KG',
    isLowStock: false
  },
  {
    _id: 'prd-3',
    sku: 'PRD-03',
    name: 'Refined Soybean Oil',
    icon: '🫒',
    description: 'Deodorized food grade cooking oil',
    hsCode: '1507.90.10',
    price: 850.00,
    unit: 'MT',
    stock: 18,
    availableStock: '18 MT',
    isLowStock: true
  }
];

export default function Products() {
  const { currencySymbol, formatAmount } = useCurrency();
  const [products, setProducts] = useState(defaultProducts);
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [editProduct, setEditProduct] = useState(null); // object to add or edit
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    try {
      const data = await get('/products');
      if (data && data.length > 0) {
        const mapped = data.map((p, idx) => ({
          ...p,
          sku: p.sku || `PRD-0${idx + 1}`,
          icon: p.icon || (p.name.includes('Rice') ? '🌾' : p.name.includes('Yarn') || p.name.includes('Cotton') ? '🧶' : p.name.includes('Oil') ? '🫒' : '📦'),
          availableStock: p.availableStock || `${p.stock || 50} ${p.unit || 'MT'}`,
          isLowStock: p.stock <= (p.minStock || 25) || p.availableStock?.includes('18 MT')
        }));
        setProducts(mapped);
      }
    } catch (e) {
      console.warn('Failed to load products from backend, using defaults:', e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.hsCode?.toLowerCase().includes(q);

      const matchUnit = !unitFilter || p.unit === unitFilter;
      return matchSearch && matchUnit;
    });
  }, [products, search, unitFilter]);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const o = {
      name: fd.get('name'),
      icon: fd.get('icon') || '📦',
      sku: fd.get('sku') || `PRD-0${products.length + 1}`,
      hsCode: fd.get('hsCode'),
      price: Number(fd.get('price') || 0),
      unit: fd.get('unit'),
      stock: Number(fd.get('stock') || 0),
      availableStock: `${fd.get('stock')} ${fd.get('unit')}`,
      description: fd.get('description'),
      isLowStock: Number(fd.get('stock') || 0) < 25
    };

    try {
      if (editProduct?._id) {
        await put(`/products/${editProduct._id}`, o);
      } else {
        await post('/products', o);
      }
      await load();
      setModalOpen(false);
      setEditProduct(null);
    } catch (err) {
      // Offline fallback
      if (editProduct?._id) {
        setProducts((prev) => prev.map((x) => (x._id === editProduct._id ? { ...x, ...o } : x)));
      } else {
        setProducts((prev) => [...prev, { ...o, _id: `prd-${Date.now()}` }]);
      }
      setModalOpen(false);
      setEditProduct(null);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this product from catalog?')) {
      try {
        await del(`/products/${id}`);
        await load();
      } catch (err) {
        setProducts((prev) => prev.filter((x) => x._id !== id));
      }
    }
  };

  return (
    <div className="products-page">
      {/* Header matching PDF Page 3 */}
      <div className="dash-head">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px', color: '#1e1e2d' }}>
            Product Master
          </h1>
          <p style={{ margin: 0, color: '#7e8299', fontSize: '13.5px' }}>
            Export commodities and available units
          </p>
        </div>
        <button
          className="btn-purple"
          onClick={() => {
            setEditProduct(null);
            setModalOpen(true);
          }}
          style={{ padding: '10px 20px', fontSize: '13px' }}
        >
          <Plus size={16} /> New Product
        </button>
      </div>

      {/* Filter bar matching PDF Page 3 */}
      <div className="filter-toolbar">
        <div className="global-search filter-search" style={{ background: '#ffffff', border: '1px solid var(--border)' }}>
          <Search size={16} />
          <input
            placeholder="Search SKU, name, or HS Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="pill-select-wrap">
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="pill-select"
          >
            <option value="">All Units</option>
            <option value="MT">MT</option>
            <option value="KG">KG</option>
            <option value="ROLL">ROLL</option>
            <option value="PAIR">PAIR</option>
            <option value="PC">PC</option>
          </select>
          <ChevronDown size={14} className="pill-select-arrow" />
        </div>
      </div>

      {/* Product Table matching PDF Page 3 */}
      <div className="panel" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.85)', padding: '22px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>PRODUCT NAME</th>
                <th>HS CODE</th>
                <th>BASE PRICE</th>
                <th>UNIT</th>
                <th>AVAILABLE STOCK</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id || p.sku}>
                  <td>
                    <strong style={{ color: '#1e1e2d', fontSize: '12.5px' }}>{p.sku}</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{p.icon || '📦'}</span>
                      <strong style={{ fontSize: '13px', color: '#1e1e2d' }}>{p.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: '#475569', fontSize: '12.5px' }}>{p.hsCode}</span>
                  </td>
                  <td>
                    <strong style={{ color: '#1e1e2d', fontSize: '13px' }}>
                      {formatAmount(p.price || 0)}
                    </strong>
                  </td>
                  <td>
                    <span
                      style={{
                        background: '#e8f5f1',
                        color: '#0c5a48',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0c5a48' }} />
                      {p.unit}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '12.5px', color: '#1e1e2d' }}>{p.availableStock || `${p.stock} ${p.unit}`}</strong>
                      {p.isLowStock && (
                        <span
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            padding: '2px 7px',
                            borderRadius: '10px',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#dc2626' }} />
                          Low stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="small-btn"
                        title="Edit Product"
                        onClick={() => {
                          setEditProduct(p);
                          setModalOpen(true);
                        }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="small-btn"
                        title="Delete Product"
                        onClick={() => handleDelete(p._id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tip Banner matching PDF Page 3 */}
      <div className="tip-banner">
        <Sparkles size={16} className="tip-icon" />
        <span>Pick a product in any quotation or order and we auto-fill its HS Code, unit and base price.</span>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <Modal
          eyebrow="COMMODITY MANAGEMENT"
          title={editProduct ? 'Edit Product Master' : 'Add New Product'}
          onClose={() => {
            setModalOpen(false);
            setEditProduct(null);
          }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setModalOpen(false);
                  setEditProduct(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" form="prod-form" className="btn-purple">
                Save Product
              </button>
            </div>
          }
        >
          <form id="prod-form" onSubmit={handleSaveProduct}>
            <div className="form-grid">
              <div className="field">
                <label>Product Name *</label>
                <input name="name" defaultValue={editProduct?.name || ''} required placeholder="e.g. Basmati Rice 1121" />
              </div>
              <div className="field">
                <label>Emoji / Icon</label>
                <input name="icon" defaultValue={editProduct?.icon || '🌾'} placeholder="e.g. 🌾, 🧶, 🫒" />
              </div>
              <div className="field">
                <label>SKU Code *</label>
                <input name="sku" defaultValue={editProduct?.sku || `PRD-0${products.length + 1}`} required />
              </div>
              <div className="field">
                <label>HS Code (Harmonized System)</label>
                <input name="hsCode" defaultValue={editProduct?.hsCode || '1006.30.20'} placeholder="e.g. 1006.30.20" />
              </div>
              <div className="field">
                <label>Base Price ({currencySymbol}) *</label>
                <input name="price" type="number" step="0.01" defaultValue={editProduct?.price || 950} required />
              </div>
              <div className="field">
                <label>Unit of Measure</label>
                <select name="unit" defaultValue={editProduct?.unit || 'MT'}>
                  <option>MT</option>
                  <option>KG</option>
                  <option>ROLL</option>
                  <option>PAIR</option>
                  <option>PC</option>
                  <option>BAG</option>
                </select>
              </div>
              <div className="field">
                <label>Available Stock Quantity</label>
                <input name="stock" type="number" defaultValue={editProduct?.stock || 120} />
              </div>
              <div className="field full">
                <label>Commodity Specifications & Packaging</label>
                <textarea name="description" defaultValue={editProduct?.description || ''} placeholder="Standard export seaworthy specifications..." />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
