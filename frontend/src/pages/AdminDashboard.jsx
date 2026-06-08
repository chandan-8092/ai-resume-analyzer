import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  TrendingUp, 
  Trash2, 
  Download, 
  AlertCircle,
  Activity,
  Award,
  Lock,
  UserCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('metrics');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [statsRes, usersRes, resumesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/resumes')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setResumes(resumesRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Access denied. You must be logged in as an administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) return;

    try {
      setActionLoading(userId);
      await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: nextRole } : u));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('WARNING: Deleting this user will permanently erase their account and all their resume history reports. Proceed?')) return;

    try {
      setActionLoading(userId);
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      setResumes(resumes.filter(r => r.user?._id !== userId));
      // Refresh stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Delete this resume evaluation report from the system database?')) return;

    try {
      setActionLoading(resumeId);
      await api.delete(`/resumes/${resumeId}`);
      setResumes(resumes.filter(r => r._id !== resumeId));
      // Refresh stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to delete resume report');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container p-6 lg:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading Administrative Panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Lock className="h-12 w-12 text-red-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Access Unauthorized</h3>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  // Formatting chart data for ranges
  const rangeData = stats?.metrics?.scoreRanges 
    ? Object.keys(stats.metrics.scoreRanges).map(key => ({
        name: key,
        value: stats.metrics.scoreRanges[key]
      }))
    : [];

  const topRolesData = stats?.metrics?.topRoles || [];

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  return (
    <div className="dashboard-container p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-red-500" />
            Admin Console
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            System status monitoring, user elevations, and upload management indexes.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <div className="glass-card p-6 flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total System Users</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats?.metrics?.totalUsers}</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Resumes Scanned</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats?.metrics?.totalResumes}</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">System Avg ATS Score</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats?.metrics?.avgAtsScore}%</h3>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto">
        {[
          { id: 'metrics', label: 'Telemetry Charts', icon: Activity },
          { id: 'users', label: 'System Users', icon: Users },
          { id: 'resumes', label: 'Uploaded Resumes', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* METRICS VIEW */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* ATS Score Bracket Distribution */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">ATS score bracket distribution</h3>
            {rangeData.some(d => d.value > 0) ? (
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rangeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {rangeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                No scores to analyze. Scaffold more candidate uploads.
              </div>
            )}
          </div>

          {/* Top Targeted Roles Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top target job roles</h3>
            {topRolesData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topRolesData} layout="vertical">
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                    <YAxis dataKey="role" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                No roles metrics detected.
              </div>
            )}
          </div>
        </div>
      )}

      {/* USERS LIST VIEW */}
      {activeTab === 'users' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4">Access Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-950 dark:text-white">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        u.role === 'admin' 
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRoleChange(u._id, u.role)}
                        disabled={actionLoading === u._id}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 rounded-lg transition-colors disabled:opacity-50"
                        title="Toggle Admin Privilege"
                      >
                        <UserCheck className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={actionLoading === u._id}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete User & Data"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESUMES LIST VIEW */}
      {activeTab === 'resumes' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">File Name</th>
                  <th className="px-6 py-4">Uploaded By</th>
                  <th className="px-6 py-4">Target Job</th>
                  <th className="px-6 py-4">ATS Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                {resumes.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-950 dark:text-white max-w-[200px] truncate">{r.fileName}</td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="block font-medium">{r.user?.name || 'Deleted User'}</span>
                        <span className="block text-xs text-slate-400">{r.user?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{r.targetRole}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                        (r.analysisResult?.atsScore || 0) >= 80 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                          : (r.analysisResult?.atsScore || 0) >= 60 
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' 
                          : 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                      }`}>
                        {r.analysisResult?.atsScore || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resumes/${r._id}/download`}
                        download
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 rounded-lg transition-colors"
                        title="Download Document"
                      >
                        <Download className="h-4.5 w-4.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteResume(r._id)}
                        disabled={actionLoading === r._id}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Document"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
