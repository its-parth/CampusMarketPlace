import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingBag, ShieldCheck, AlertTriangle, DollarSign, 
  Check, X, Eye, Lock, Unlock, Plus, Trash2, Loader2, BarChart2 
} from 'lucide-react';
import api from '../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'categories'>('overview');

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Category modal
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes, repRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/reports')
      ]);

      setStats(dashRes.data.data);
      setUsersList(usersRes.data.data || []);
      setReportsList(repRes.data.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: number) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-active`);
      setUsersList(usersList.map(u => u.id === userId ? { ...u, is_active: res.data.data.is_active } : u));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle active state.');
    }
  };

  const handleVerifyStudent = async (userId: number, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.put(`/admin/users/${userId}/verify`, { status });
      setUsersList(usersList.map(u => u.id === userId ? { ...u, verification_status: status } : u));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update verification status.');
    }
  };

  const handleUpdateReportStatus = async (reportId: number, status: string) => {
    try {
      await api.put(`/reports/${reportId}/status`, { status });
      setReportsList(reportsList.map(r => r.id === reportId ? { ...r, status } : r));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update report.');
    }
  };

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading admin management console...</p>
      </div>
    );
  }

  const kpis = stats.kpis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Admin Console
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Campus Operations & Moderation</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-800 p-1.5 rounded-2xl gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Users ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Reports ({reportsList.length})
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{kpis.totalUsers}</p>
              <p className="text-[11px] font-semibold text-emerald-600">{kpis.verifiedStudents} Verified Students</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Listings</span>
                <ShoppingBag className="w-5 h-5 text-brand-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{kpis.totalProducts}</p>
              <p className="text-[11px] font-semibold text-slate-500">{kpis.activeListings} Active For Sale</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Volume</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">₹{kpis.totalVolumeUSD.toFixed(2)}</p>
              <p className="text-[11px] font-semibold text-slate-500">{kpis.totalTransactions} Total Trades</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Reports</span>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-rose-600">{kpis.pendingReports}</p>
              <p className="text-[11px] font-semibold text-amber-600">{kpis.pendingVerifications} ID Verifications</p>
            </div>

          </div>

          {/* Recent Registrations & Active Listings Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-subtle">
              <h3 className="text-sm font-extrabold text-slate-900">Recent Student Signups</h3>
              <div className="divide-y divide-slate-100">
                {stats.recentUsers.map((u: any) => (
                  <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{u.full_name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.verification_status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {u.verification_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-subtle">
              <h3 className="text-sm font-extrabold text-slate-900">Category Distribution</h3>
              <div className="space-y-3">
                {stats.categoryDistribution.map((c: any) => (
                  <div key={c.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{c.name}</span>
                      <span>{c.count} items</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, c.count * 15)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Campus / ID</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      {u.full_name}
                      <span className="block text-[11px] text-slate-400 font-normal">{u.email}</span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {u.university}
                      <span className="block text-[10px] text-slate-400">{u.student_id_number || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${u.verification_status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : u.verification_status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {u.verification_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {u.verification_status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleVerifyStudent(u.id, 'VERIFIED')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerifyStudent(u.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold text-[10px]"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleToggleActive(u.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${u.is_active ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                        title={u.is_active ? 'Suspend User' : 'Activate User'}
                      >
                        {u.is_active ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-subtle">
          <h3 className="text-base font-bold text-slate-900">Fraud & Content Flagging Reports Queue</h3>
          
          {reportsList.length === 0 ? (
            <p className="text-xs text-slate-400">No reports logged.</p>
          ) : (
            <div className="space-y-4">
              {reportsList.map((rep) => (
                <div key={rep.id} className="p-4 rounded-2xl border border-slate-200 space-y-3 text-xs bg-slate-50/50">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-bold text-rose-600">
                      [{rep.target_type} REPORT #{rep.id}] Reason: {rep.reason}
                    </span>
                    <span className={`px-2.5 py-0.5 font-bold rounded-full text-[10px] ${rep.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : rep.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                      {rep.status}
                    </span>
                  </div>

                  {/* Reporter & Complain Against User Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Reporter Info */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">Reporter (Filer)</span>
                      <p className="font-bold text-slate-800">{rep.reporter_name}</p>
                      <p className="text-slate-500">User ID: <strong className="text-slate-700">#{rep.reporter_id}</strong></p>
                      <p className="text-slate-500">Email: <strong className="text-slate-700">{rep.reporter_email}</strong></p>
                    </div>

                    {/* Target / Complain Against User Info */}
                    <div className="p-3 bg-white rounded-xl border border-rose-100 space-y-1">
                      <span className="font-bold text-rose-500 text-[10px] uppercase tracking-wider block">Complain Against / Target</span>
                      {rep.target_type === 'PRODUCT' ? (
                        <>
                          <p className="font-bold text-slate-800">Item: {rep.target_detail?.title || 'Product'} (ID: #{rep.target_id})</p>
                          <p className="text-slate-600 font-semibold mt-1">Seller (Accused): <span className="text-slate-900 font-bold">{rep.target_detail?.seller_name || 'N/A'}</span></p>
                          <p className="text-slate-500">Seller ID: <strong className="text-slate-700">#{rep.target_detail?.seller_id || 'N/A'}</strong></p>
                          <p className="text-slate-500">Seller Email: <strong className="text-slate-700">{rep.target_detail?.seller_email || 'N/A'}</strong></p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-slate-800">Reported Student: {rep.target_detail?.user_name || 'User'}</p>
                          <p className="text-slate-500">Accused User ID: <strong className="text-slate-700">#{rep.target_id}</strong></p>
                          <p className="text-slate-500">Accused Email: <strong className="text-slate-700">{rep.target_detail?.user_email || 'N/A'}</strong></p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Complaint Description */}
                  <div>
                    <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block mb-1">Complaint Description</span>
                    <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed italic">
                      "{rep.description}"
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-1 justify-end">
                    <button
                      onClick={() => handleUpdateReportStatus(rep.id, 'RESOLVED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleUpdateReportStatus(rep.id, 'DISMISSED')}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
