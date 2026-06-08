import React, { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const PERFORMANCES = ['Excellent', 'Good', 'Average', 'Poor'];

const perfBadge = (p) => {
  const map = { Excellent: 'text-green-400 bg-green-900/30 border-green-800/50', Good: 'text-blue-400 bg-blue-900/30 border-blue-800/50', Average: 'text-yellow-400 bg-yellow-900/30 border-yellow-800/50', Poor: 'text-red-400 bg-red-900/30 border-red-800/50' };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${map[p] || ''}`}>{p}</span>;
};

export default function PromotionVehicles() {
  const [pvs, setPvs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ PromotionID: '', Plate_Number: '', Performance: 'Good' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pvRes, vRes, pRes] = await Promise.all([
        api.get('/promotion-vehicles'),
        api.get('/vehicles'),
        api.get('/promotions')
      ]);
      setPvs(pvRes.data); setVehicles(vRes.data); setPromotions(pRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setForm({ PromotionID: promotions[0]?.PromotionID || '', Plate_Number: vehicles[0]?.Plate_Number || '', Performance: 'Good' });
    setModal('add');
  };
  const openEdit = (pv) => { setSelected(pv); setForm({ Performance: pv.Performance }); setModal('edit'); };
  const openDelete = (pv) => { setSelected(pv); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal === 'add') { await api.post('/promotion-vehicles', form); toast.success('Vehicle assigned to promotion!'); }
      else { await api.put(`/promotion-vehicles/${selected.PV_ID}`, { Performance: form.Performance }); toast.success('Performance updated!'); }
      closeModal(); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/promotion-vehicles/${selected.PV_ID}`);
      toast.success('Removed!'); closeModal(); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Promo Vehicles</h1>
          <p className="text-gray-500 text-sm mt-0.5">Link promotions to vehicles — {pvs.length} records</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Assign Vehicle</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {['Promotion', 'Vehicle', 'Type', 'Discount', 'Performance', 'Assigned', 'Actions'].map(h => (
                  <th key={h} className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-[#1e1e1e]">
                  {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-gray-800 rounded animate-pulse w-16"></div></td>)}
                </tr>
              )) : pvs.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">No assignments found.</td></tr>
              ) : pvs.map(pv => (
                <tr key={pv.PV_ID} className="border-b border-[#1e1e1e] hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-4 py-3 text-gray-200 text-xs font-medium max-w-[130px]"><span className="truncate block">{pv.PromotionTitle}</span></td>
                  <td className="px-4 py-3">
                    <p className="text-gray-200 font-medium">{pv.Brand} {pv.Model}</p>
                    <p className="text-gray-600 text-xs font-mono">{pv.Plate_Number}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{pv.Vehicle_Type}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    <span className="font-mono">{pv.Discount_Type}</span>
                    <span className="block text-gray-600">{Number(pv.Discount_Value).toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">{perfBadge(pv.Performance)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{new Date(pv.AssignedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(pv)} className="text-gray-400 hover:text-white text-xs border border-[#333] px-2 py-1 rounded hover:border-gray-500 transition-colors">Edit</button>
                      <button onClick={() => openDelete(pv)} className="text-red-500 hover:text-red-300 text-xs border border-red-900/50 px-2 py-1 rounded hover:border-red-700 transition-colors">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal === 'add' && (
        <Modal title="Assign Vehicle to Promotion" onClose={closeModal}>
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="label">Promotion</label>
              <select className="input-field" value={form.PromotionID} onChange={e => setForm({ ...form, PromotionID: e.target.value })} required>
                <option value="">-- Select Promotion --</option>
                {promotions.map(p => <option key={p.PromotionID} value={p.PromotionID}>{p.Title}</option>)}
              </select>
            </div>
            <div><label className="label">Vehicle</label>
              <select className="input-field" value={form.Plate_Number} onChange={e => setForm({ ...form, Plate_Number: e.target.value })} required>
                <option value="">-- Select Vehicle --</option>
                {vehicles.map(v => <option key={v.Plate_Number} value={v.Plate_Number}>{v.Brand} {v.Model} ({v.Plate_Number})</option>)}
              </select>
            </div>
            <div><label className="label">Performance</label>
              <select className="input-field" value={form.Performance} onChange={e => setForm({ ...form, Performance: e.target.value })}>
                {PERFORMANCES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Saving...' : 'Assign'}</button>
              <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'edit' && (
        <Modal title="Update Performance" onClose={closeModal}>
          <form onSubmit={handleSave} className="space-y-4">
            <p className="text-gray-400 text-sm">{selected?.Brand} {selected?.Model} — <span className="text-gray-300">{selected?.PromotionTitle}</span></p>
            <div><label className="label">Performance</label>
              <select className="input-field" value={form.Performance} onChange={e => setForm({ ...form, Performance: e.target.value })}>
                {PERFORMANCES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Saving...' : 'Update'}</button>
              <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Remove Assignment" onClose={closeModal}>
          <p className="text-gray-400 text-sm mb-4">Remove <span className="text-white font-medium">{selected?.Brand} {selected?.Model}</span> from <span className="text-white font-medium">"{selected?.PromotionTitle}"</span>?</p>
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1 disabled:opacity-50">{saving ? 'Removing...' : 'Remove'}</button>
            <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
