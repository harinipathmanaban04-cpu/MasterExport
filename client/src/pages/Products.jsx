import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Sparkles, ChevronDown, Eye, X } from 'lucide-react';
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
  },
  {
    _id: 'prd-4',
    sku: 'PRD-04',
    name: 'Organic Spices Assorted',
    icon: '🌶️',
    description: 'Certified organic whole black pepper & turmeric',
    hsCode: '0904.11.10',
    price: 28.00,
    unit: 'KG',
    stock: 3200,
    availableStock: '3,200 KG',
    isLowStock: false
  },
  {
    _id: 'prd-5',
    sku: 'PRD-05',
    name: 'Industrial Valve Assemblies',
    icon: '⚙️',
    description: 'Stainless steel high pressure export ball valves',
    hsCode: '8481.80.30',
    price: 94.28,
    unit: 'PCS',
    stock: 850,
    availableStock: '850 PCS',
    isLowStock: false
  },
  {
    _id: 'prd-6',
    sku: 'PRD-06',
    name: 'Cashew Kernels W320 Grade',
    icon: '🥜',
    description: 'Export vacuum packed 25lb tins cashew nuts',
    hsCode: '0801.32.10',
    price: 9.80,
    unit: 'KG',
    stock: 8500,
    availableStock: '8,500 KG',
    isLowStock: false
  },
  {
    _id: 'prd-7',
    sku: 'PRD-07',
    name: 'Pure Leather Handcrafted Bags',
    icon: '💼',
    description: 'Full grain artisanal export travel duffels & laptop bags',
    hsCode: '4202.11.00',
    price: 65.00,
    unit: 'PCS',
    stock: 620,
    availableStock: '620 PCS',
    isLowStock: false
  }
];

export default function Products() {
  const { currencySymbol, formatAmount } = useCurrency();
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('export_pro_products');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultProducts;
  });
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [viewProduct, setViewProduct] = useState(null);
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
        localStorage.setItem('export_pro_products', JSON.stringify(mapped));
      }
    } catch (e) {
      console.warn('Failed to load products from backend, using saved/defaults:', e);
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
      let updatedList;
      if (editProduct?._id) {
        updatedList = products.map((x) => (x._id === editProduct._id ? { ...x, ...o } : x));
      } else {
        updatedList = [...products, { ...o, _id: `prd-${Date.now()}` }];
      }
      setProducts(updatedList);
      localStorage.setItem('export_pro_products', JSON.stringify(updatedList));
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
        const remaining = products.filter((x) => x._id !== id);
        setProducts(remaining);
        localStorage.setItem('export_pro_products', JSON.stringify(remaining));
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
        <div className="global-search filter-search" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px' }}>
          <Search size={16} style={{ color: '#0c5a48', flexShrink: 0 }} />
          <input
            placeholder="Search SKU, name, or HS Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                color: '#8fa4a8',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
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
                    <div className="actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        className="small-btn"
                        title="View Product Details"
                        onClick={() => setViewProduct(p)}
                      >
                        <Eye size={14} />
                      </button>
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

      {/* View Product Modal */}
      {viewProduct && (
        <Modal
          eyebrow="COMMODITY PROFILE"
          title={`${viewProduct.name} (${viewProduct.sku})`}
          onClose={() => setViewProduct(null)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              <button
                type="button"
                className="secondary"
                onClick={() => setViewProduct(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-purple"
                onClick={() => {
                  const p = viewProduct;
                  setViewProduct(null);
                  setEditProduct(p);
                  setModalOpen(true);
                }}
              >
                <Edit size={14} style={{ marginRight: '6px' }} /> Edit Commodity
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '36px', lineHeight: 1 }}>{viewProduct.icon || '📦'}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: '#1e1e2d' }}>{viewProduct.name}</h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>SKU: {viewProduct.sku} • HS Code: {viewProduct.hsCode || 'N/A'}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Base Price</span>
                <strong style={{ fontSize: '18px', color: '#0c5a48', fontWeight: 800 }}>{formatAmount(viewProduct.price || 0)} / {viewProduct.unit}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginBottom: '2px', fontWeight: 700 }}>AVAILABLE STOCK</small>
                <strong style={{ fontSize: '14px', color: '#1e1e2d' }}>{viewProduct.availableStock || `${viewProduct.stock} ${viewProduct.unit}`}</strong>
              </div>
              <div style={{ padding: '12px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginBottom: '2px', fontWeight: 700 }}>UNIT OF MEASURE</small>
                <strong style={{ fontSize: '14px', color: '#1e1e2d' }}>{viewProduct.unit}</strong>
              </div>
              <div style={{ padding: '12px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginBottom: '2px', fontWeight: 700 }}>STOCK STATUS</small>
                {viewProduct.isLowStock ? (
                  <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '13px' }}>⚠️ Low Stock</span>
                ) : (
                  <span style={{ color: '#10b981', fontWeight: 700, fontSize: '13px' }}>✓ Normal Stock</span>
                )}
              </div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <strong style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Export Specifications & Packaging</strong>
              <p style={{ margin: 0, fontSize: '13px', color: '#1e1e2d', lineHeight: 1.5 }}>
                {viewProduct.description || 'Standard seaworthy export packaging and specifications.'}
              </p>
            </div>
          </div>
        </Modal>
      )}

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
