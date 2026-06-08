import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldAlert, Award, FileText, Key, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, average: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      const response = await api.get('/resumes/history');
      const total = response.data.length;
      const average = total > 0
        ? Math.round(response.data.reduce((sum, r) => sum + (r.analysisResult?.atsScore || 0), 0) / total)
        : 0;
      setStats({ total, average });
    } catch (err) {
      console.error('Failed to load profile stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Profile
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details and view application statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* User Card */}
        <div className="glass-card p-6 flex flex-col items-center text-center lg:col-span-1">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-3xl font-bold text-white uppercase shadow-md shadow-indigo-100 dark:shadow-none mb-4">
            {user?.name.charAt(0)}
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h3>
          
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mt-2 ${
            user?.role === 'admin' 
              ? 'bg-red-50 text-red-600 dark:bg-red-950/35 dark:text-red-400 border border-red-100 dark:border-red-900/30' 
              : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/35 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
          }`}>
            <ShieldAlert className="h-3 w-3" />
            {user?.role === 'admin' ? 'Administrator' : 'Job Candidate'}
          </span>

          <hr className="w-full my-6 border-slate-100 dark:border-slate-800" />

          <div className="w-full text-left space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{user?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Role</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics & Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Candidate Stats</h3>
            
            {loading ? (
              <div className="h-24 flex items-center justify-center text-slate-400">
                Loading telemetry...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-slate-800/50">
                  <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Resumes Uploaded</span>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.total}</h4>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-slate-800/50">
                  <div className="h-10 w-10 bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Average ATS Score</span>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.average}%</h4>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">ATS Recommendations</h3>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <li className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                <span><strong>Use a standard layout:</strong> Keep font styles consistent and avoid using non-standard graphic elements or tables that standard scanner parsers cannot read.</span>
              </li>
              <li className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                <span><strong>Target specific keywords:</strong> Map your experience bullet points specifically to skills listed in your target job descriptions.</span>
              </li>
              <li className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                <span><strong>Save in PDF format:</strong> Unless a company specifically requests a Word document, exporting your file as PDF is the safest way to preserve layout indices.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
