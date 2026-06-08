import React, { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const STATUSES = ['Active', 'Inactive', 'Blocked'];
const emptyForm = { FirstName: '', LastName: '', Email: '', PhoneNumber: '', Status: 'Active' };

const statusBadge = (s) => {
  const map = { Active: 'badge-active', Inactive: 'badge-inactive', Blocked: 'badge-blocked' };
  return <span className={map[s] || 'badge-inactive'}>{s}</span>;
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/customers${q ? `?search=${q}` : ''}`);
      setCustomers(res.data);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (c) => { setSelected(c); setForm({ FirstName: c.FirstName, LastName: c.LastName, Email: c.Email, PhoneNumber: c.PhoneNumber, Status: c.Status }); setModal('edit'); };
  const openDelete = (c) => { setSelected(c); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal === 'add') { await api.post('/customers', form); toast.success('Customer added!'); }
      else { await api.put(`/customers/${selected.CustomerID}`, form); toast.success('Customer updated!'); }
      closeModal(); fetchData(search);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/customers/${selected.CustomerID}`);
      toast.success('Customer deleted!'); closeModal(); fetchData(search);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{customers.length} records</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add Customer</button>
      </div>

      <div className="card p-3 mb-4">
        <input className="input-field" placeholder="Search by name, email, phone..." value={search} onChange={e => { setSearch(e.target.value); fetchData(e.target.value); }} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {['#', 'Name', 'Email', 'Phone', 'Status', 'Registered', 'Actions'].map(h => (
                  <th key={h} className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(4)].map((_, i) => (
                <tr key={i} className="border-b border-[#1e1e1e]">
                  {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-gray-800 rounded animate-pulse w-16"></div></td>)}
                </tr>
              )) : customers.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">No customers found.</td></tr>
              ) : customers.map(c => (
                <tr key={c.CustomerID} className="border-b border-[#1e1e1e] hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{c.CustomerID}</td>
                  <td className="px-4 py-3 text-gray-200 font-medium">{c.FirstName} {c.LastName}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.Email}</td>
                  <td className="px-4 py-3 text-gray-400">{c.PhoneNumber}</td>
                  <td className="px-4 py-3">{statusBadge(c.Status)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{new Date(c.CreatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-white text-xs border border-[#333] px-2 py-1 rounded hover:border-gray-500 transition-colors">Edit</button>
                      <button onClick={() => openDelete(c)} className="text-red-500 hover:text-red-300 text-xs border border-red-900/50 px-2 py-1 rounded hover:border-red-700 transition-colors">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Customer' : 'Edit Customer'} onClose={closeModal}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">First Name</label><input className="input-field" value={form.FirstName} onChange={e => setForm({ ...form, FirstName: e.target.value })} required /></div>
              <div><label className="label">Last Name</label><input className="input-field" value={form.LastName} onChange={e => setForm({ ...form, LastName: e.target.value })} required /></div>
            </div>
            <div><label className="label">Email</label><input type="email" className="input-field" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} required /></div>
            <div><label className="label">Phone Number</label><input className="input-field" value={form.PhoneNumber} onChange={e => setForm({ ...form, PhoneNumber: e.target.value })} required placeholder="+250..." /></div>
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
        <Modal title="Delete Customer" onClose={closeModal}>
          <p className="text-gray-400 text-sm mb-4">Delete <span className="text-white font-medium">{selected?.FirstName} {selected?.LastName}</span>?</p>
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1 disabled:opacity-50">{saving ? 'Deleting...' : 'Delete'}</button>
            <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
