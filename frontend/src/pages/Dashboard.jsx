import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  TrendingUp, 
  Award, 
  Trash2, 
  Eye, 
  Download, 
  Plus, 
  Search, 
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/resumes/history');
      setResumes(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve your resume history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume report?')) return;
    try {
      setDeleteLoading(id);
      await api.delete(`/resumes/${id}`);
      setResumes(resumes.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete resume report');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Compute metrics
  const totalUploaded = resumes.length;
  const avgAtsScore = totalUploaded > 0 
    ? Math.round(resumes.reduce((sum, r) => sum + (r.analysisResult?.atsScore || 0), 0) / totalUploaded) 
    : 0;
  const highestAts = totalUploaded > 0 
    ? Math.max(...resumes.map(r => r.analysisResult?.atsScore || 0)) 
    : 0;

  // Chart data: ATS progression over time
  const chartData = [...resumes]
    .reverse()
    .map((r, i) => ({
      name: `R-${i+1}`,
      score: r.analysisResult?.atsScore || 0,
      role: r.targetRole,
      date: new Date(r.createdAt).toLocaleDateString()
    }));

  // Aggregated skills analysis
  const skillCountMap = {};
  resumes.forEach(r => {
    const hard = r.analysisResult?.skills?.foundHardSkills || [];
    hard.slice(0, 5).forEach(s => {
      skillCountMap[s] = (skillCountMap[s] || 0) + 1;
    });
  });

  const skillChartData = Object.keys(skillCountMap)
    .map(name => ({ name, count: skillCountMap[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="dashboard-container p-6 lg:p-8">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.name}</span>! Analyze and track your ATS profile.
          </p>
        </div>
        <Link
          to="/upload"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:opacity-95 focus:outline-none dark:shadow-none"
        >
          <Plus className="h-5 w-5" />
          New Resume Analysis
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <div className="glass-card p-6 flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Uploaded</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{totalUploaded}</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average ATS Score</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{avgAtsScore}%</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Highest ATS Score</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{highestAts}%</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      {totalUploaded > 0 && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
          {/* ATS Score Progress Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">ATS score progression</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.9)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Extracted Skills Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Skill extraction profile (Top 5)</h3>
            {skillChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillChartData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ 
                        background: 'rgba(255, 255, 255, 0.9)', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {skillChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-slate-400">
                Not enough skill telemetry. Upload another resume.
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analysis History</h3>
          <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full font-semibold">
            {totalUploaded} Records
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading uploads...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        ) : resumes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 mb-4">
              <Search className="h-7 w-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">No resume analysis found</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-md mx-auto">
              You haven't uploaded or analyzed any resumes yet. Send us your PDF/DOCX to generate a comprehensive evaluation report.
            </p>
            <Link
              to="/upload"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all focus:outline-none"
            >
              Analyze Your First Resume
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">File Name</th>
                  <th className="px-6 py-4">Target Job Role</th>
                  <th className="px-6 py-4">ATS Score</th>
                  <th className="px-6 py-4">Analyzed Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                {resumes.map((resume) => (
                  <tr key={resume._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-950 dark:text-white">
                      {resume.fileName}
                    </td>
                    <td className="px-6 py-4">
                      {resume.targetRole}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              (resume.analysisResult?.atsScore || 0) >= 80 
                                ? 'bg-emerald-500' 
                                : (resume.analysisResult?.atsScore || 0) >= 60 
                                ? 'bg-amber-500' 
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${resume.analysisResult?.atsScore || 0}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs">
                          {resume.analysisResult?.atsScore || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(resume.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-1.5">
                      <Link
                        to={`/resumes/${resume._id}`}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 rounded-lg transition-colors"
                        title="View Full Report"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </Link>
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resumes/${resume._id}/download`}
                        download
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 rounded-lg transition-colors"
                        title="Download Original Doc"
                      >
                        <Download className="h-4.5 w-4.5" />
                      </a>
                      <button
                        onClick={() => handleDelete(resume._id)}
                        disabled={deleteLoading === resume._id}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Report"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
