import React, { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const TITLES = ['New Year Sale', 'Holiday Price Slash', 'Weekend Flash Sale', 'Clearance Discount Offer', 'Seasonal Price Drop'];
const DISCOUNT_TYPES = ['free', 'percentage', 'FLAT_RATE', 'CASHBACK', 'BUY_ONE_GET_ONE', 'Bundle and amount'];
const STATUSES = ['Active', 'Inactive', 'Expired'];

const emptyForm = { Title: TITLES[0], Description: '', Discount_Type: 'percentage', Discount_Value: '', Start_Date: '', End_Date: '', Status: 'Active' };

const statusBadge = (s) => {
  const map = { Active: 'badge-active', Inactive: 'badge-inactive', Expired: 'badge-expired' };
  return <span className={map[s] || 'badge-inactive'}>{s}</span>;
};

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/promotions${q ? `?search=${q}` : ''}`);
      setPromotions(res.data);
    } catch { toast.error('Failed to load promotions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (p) => {
    setSelected(p);
    setForm({
      Title: p.Title, Description: p.Description || '', Discount_Type: p.Discount_Type,
      Discount_Value: p.Discount_Value, Status: p.Status,
      Start_Date: p.Start_Date?.split('T')[0] || '', End_Date: p.End_Date?.split('T')[0] || ''
    });
    setModal('edit');
  };
  const openDelete = (p) => { setSelected(p); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal === 'add') { await api.post('/promotions', form); toast.success('Promotion added!'); }
      else { await api.put(`/promotions/${selected.PromotionID}`, form); toast.success('Promotion updated!'); }
      closeModal(); fetchData(search);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/promotions/${selected.PromotionID}`);
      toast.success('Promotion deleted!'); closeModal(); fetchData(search);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Promotions</h1>
          <p className="text-gray-500 text-sm mt-0.5">{promotions.length} records</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add Promotion</button>
      </div>

      <div className="card p-3 mb-4">
        <input className="input-field" placeholder="Search by title, discount type..." value={search} onChange={e => { setSearch(e.target.value); fetchData(e.target.value); }} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {['Title', 'Discount Type', 'Value', 'Start', 'End', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-[#1e1e1e]">
                  {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-gray-800 rounded animate-pulse w-16"></div></td>)}
                </tr>
              )) : promotions.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">No promotions found.</td></tr>
              ) : promotions.map(p => (
                <tr key={p.PromotionID} className="border-b border-[#1e1e1e] hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-4 py-3 text-gray-200 font-medium max-w-[160px]">
                    <span className="truncate block">{p.Title}</span>
                    {p.Description && <span className="text-gray-600 text-xs truncate block">{p.Description}</span>}
                  </td>
                  <td className="px-4 py-3"><span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono">{p.Discount_Type}</span></td>
                  <td className="px-4 py-3 text-gray-300 font-mono text-xs">{Number(p.Discount_Value).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.Start_Date?.split('T')[0]}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.End_Date?.split('T')[0]}</td>
                  <td className="px-4 py-3">{statusBadge(p.Status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-white text-xs border border-[#333] px-2 py-1 rounded hover:border-gray-500 transition-colors">Edit</button>
                      <button onClick={() => openDelete(p)} className="text-red-500 hover:text-red-300 text-xs border border-red-900/50 px-2 py-1 rounded hover:border-red-700 transition-colors">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Promotion' : 'Edit Promotion'} onClose={closeModal}>
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="label">Title</label>
              <select className="input-field" value={form.Title} onChange={e => setForm({ ...form, Title: e.target.value })}>
                {TITLES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Description</label>
              <textarea className="input-field resize-none h-20" value={form.Description} onChange={e => setForm({ ...form, Description: e.target.value })} placeholder="Optional description..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Discount Type</label>
                <select className="input-field" value={form.Discount_Type} onChange={e => setForm({ ...form, Discount_Type: e.target.value })}>
                  {DISCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="label">Discount Value</label>
                <input type="number" step="0.01" className="input-field" value={form.Discount_Value} onChange={e => setForm({ ...form, Discount_Value: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Start Date</label><input type="date" className="input-field" value={form.Start_Date} onChange={e => setForm({ ...form, Start_Date: e.target.value })} required /></div>
              <div><label className="label">End Date</label><input type="date" className="input-field" value={form.End_Date} onChange={e => setForm({ ...form, End_Date: e.target.value })} required /></div>
            </div>
            <div><label className="label">Status</label>
              <select className="input-field" value={form.Status} onChange={e => setForm({ ...form, Status: e.target.value })}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Delete Promotion" onClose={closeModal}>
          <p className="text-gray-400 text-sm mb-4">Delete promotion <span className="text-white font-medium">"{selected?.Title}"</span>?</p>
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1 disabled:opacity-50">{saving ? 'Deleting...' : 'Delete'}</button>
            <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
