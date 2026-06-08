import React, { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const TYPES = ['Sedan', 'SUV', 'Truck', 'Van', 'Bus', 'Motorcycle', 'Pickup'];
const STATUSES = ['Available', 'Rented', 'Sold', 'Maintenance'];

const emptyForm = { Plate_Number: '', Brand: '', Model: '', Year: '', Vehicle_Type: 'Sedan', Purchase_Price: '', Status: 'Available' };

const statusBadge = (s) => {
  const map = { Available: 'badge-active', Rented: 'badge-inactive', Sold: 'badge-expired', Maintenance: 'badge-blocked' };
  return <span className={map[s] || 'badge-inactive'}>{s}</span>;
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/vehicles${q ? `?search=${q}` : ''}`);
      setVehicles(res.data);
    } catch { toast.error('Failed to load vehicles'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (v) => { setSelected(v); setForm({ ...v }); setModal('edit'); };
  const openDelete = (v) => { setSelected(v); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/vehicles', form);
        toast.success('Vehicle added!');
      } else {
        await api.put(`/vehicles/${selected.Plate_Number}`, form);
        toast.success('Vehicle updated!');
      }
      closeModal(); fetch(search);
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving vehicle'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/vehicles/${selected.Plate_Number}`);
      toast.success('Vehicle deleted!');
      closeModal(); fetch(search);
    } catch (err) { toast.error(err.response?.data?.message || 'Error deleting'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Vehicles</h1>
          <p className="text-gray-500 text-sm mt-0.5">{vehicles.length} records</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add Vehicle</button>
      </div>

      <div className="card p-3 mb-4">
        <input
          className="input-field"
          placeholder="Search by plate, brand, model, type..."
          value={search}
          onChange={e => { setSearch(e.target.value); fetch(e.target.value); }}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {['Plate No.', 'Brand', 'Model', 'Year', 'Type', 'Price (RWF)', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-[#1e1e1e]">
                    {[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-gray-800 rounded animate-pulse w-16"></div></td>)}
                  </tr>
                ))
              ) : vehicles.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-600">No vehicles found.</td></tr>
              ) : vehicles.map(v => (
                <tr key={v.Plate_Number} className="border-b border-[#1e1e1e] hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-300 text-xs">{v.Plate_Number}</td>
                  <td className="px-4 py-3 text-gray-200 font-medium">{v.Brand}</td>
                  <td className="px-4 py-3 text-gray-400">{v.Model}</td>
                  <td className="px-4 py-3 text-gray-400">{v.Year}</td>
                  <td className="px-4 py-3 text-gray-400">{v.Vehicle_Type}</td>
                  <td className="px-4 py-3 text-gray-300 font-mono">{Number(v.Purchase_Price).toLocaleString()}</td>
                  <td className="px-4 py-3">{statusBadge(v.Status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(v)} className="text-gray-400 hover:text-white text-xs border border-[#333] px-2 py-1 rounded hover:border-gray-500 transition-colors">Edit</button>
                      <button onClick={() => openDelete(v)} className="text-red-500 hover:text-red-300 text-xs border border-red-900/50 px-2 py-1 rounded hover:border-red-700 transition-colors">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Vehicle' : 'Edit Vehicle'} onClose={closeModal}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Plate Number</label>
              <input className="input-field" value={form.Plate_Number} onChange={e => setForm({ ...form, Plate_Number: e.target.value })} required disabled={modal === 'edit'} placeholder="e.g. RAC 001A" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Brand</label><input className="input-field" value={form.Brand} onChange={e => setForm({ ...form, Brand: e.target.value })} required /></div>
              <div><label className="label">Model</label><input className="input-field" value={form.Model} onChange={e => setForm({ ...form, Model: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Year</label><input type="number" className="input-field" value={form.Year} onChange={e => setForm({ ...form, Year: e.target.value })} required min="2000" max="2030" /></div>
              <div><label className="label">Type</label>
                <select className="input-field" value={form.Vehicle_Type} onChange={e => setForm({ ...form, Vehicle_Type: e.target.value })}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Purchase Price (RWF)</label><input type="number" className="input-field" value={form.Purchase_Price} onChange={e => setForm({ ...form, Purchase_Price: e.target.value })} required /></div>
              <div><label className="label">Status</label>
                <select className="input-field" value={form.Status} onChange={e => setForm({ ...form, Status: e.target.value })}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Delete Vehicle" onClose={closeModal}>
          <p className="text-gray-400 text-sm mb-4">Are you sure you want to delete <span className="text-white font-medium">{selected?.Brand} {selected?.Model}</span> ({selected?.Plate_Number})?</p>
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1 disabled:opacity-50">{saving ? 'Deleting...' : 'Delete'}</button>
            <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
