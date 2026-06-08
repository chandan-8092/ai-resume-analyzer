import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  BookOpen, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  ArrowRight,
  User,
  Cpu,
  AlertCircle,
  FileQuestion
} from 'lucide-react';

const InterviewPrep = () => {
  const location = useLocation();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [revealedAnswers, setRevealedAnswers] = useState({});

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (selectedResumeId) {
      fetchResumeDetails(selectedResumeId);
    } else {
      setSelectedResume(null);
    }
  }, [selectedResumeId]);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await api.get('/resumes/history');
      setResumes(response.data);

      // Pre-select if redirected from a specific report
      const redirectId = location.state?.resumeId;
      if (redirectId) {
        setSelectedResumeId(redirectId);
      } else if (response.data.length > 0) {
        setSelectedResumeId(response.data[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve resume list.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchResumeDetails = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/resumes/${id}`);
      setSelectedResume(response.data);
      setRevealedAnswers({});
    } catch (err) {
      console.error(err);
      setError('Could not retrieve interview preparation questions.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (idx) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Filter logic
  const questions = selectedResume?.analysisResult?.interviewPrep || [];
  
  const filteredQuestions = questions.filter(q => {
    const matchType = filterType === 'all' || q.type === filterType;
    const matchDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    return matchType && matchDifficulty;
  });

  return (
    <div className="dashboard-container p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          AI Interview Prep Simulator
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review dynamic, HR and technical questions simulated by Gemini AI specifically mapped to the skills extracted from your resume.
        </p>
      </div>

      {/* Selector Dropdown & Settings */}
      <div className="glass-card p-6 mb-8 flex flex-col md:flex-row gap-5 items-end">
        <div className="flex-1 w-full">
          <label htmlFor="resume-select" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Select Resume Profile
          </label>
          {historyLoading ? (
            <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse dark:bg-slate-800"></div>
          ) : resumes.length === 0 ? (
            <div className="text-sm text-slate-500 py-3">
              No resumes found. Please <Link to="/upload" className="text-indigo-600 underline">upload a resume</Link> to generate prep questions.
            </div>
          ) : (
            <select
              id="resume-select"
              className="input-field w-full"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
            >
              {resumes.map(r => (
                <option key={r._id} value={r._id}>
                  {r.fileName} ({r.targetRole})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Filters */}
        <div className="w-full md:w-48">
          <label htmlFor="type-select" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Question Category
          </label>
          <select
            id="type-select"
            className="input-field cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="hr">HR / Behavioral</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <label htmlFor="difficulty-select" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Difficulty Level
          </label>
          <select
            id="difficulty-select"
            className="input-field cursor-pointer"
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Main Questions View */}
      {selectedResumeId === '' && !historyLoading ? (
        <div className="glass-card p-12 text-center text-slate-500">
          Upload a resume first to prepare interview items.
        </div>
      ) : loading && selectedResumeId !== '' ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Consulting recruitment simulator...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500 flex items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileQuestion className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">No questions fit criteria</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Try resetting your difficulty filters or category settings.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => (
            <div 
              key={idx}
              className="glass-card overflow-hidden transition-all duration-300 hover:border-indigo-300/60 dark:hover:border-indigo-800/60"
            >
              <div 
                onClick={() => toggleAnswer(idx)}
                className="p-6 cursor-pointer flex items-start justify-between gap-4 select-none"
              >
                <div className="flex gap-4">
                  {/* Category icon indicator */}
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    q.type === 'technical'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/45 dark:text-blue-400'
                      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-400'
                  }`}>
                    {q.type === 'technical' ? <Cpu className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        q.difficulty === 'hard'
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                          : q.difficulty === 'medium'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {q.type === 'technical' ? 'Technical Spec' : 'Recruiting HR'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2 leading-relaxed">
                      {q.question}
                    </h3>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mt-1 shrink-0 p-1">
                  {revealedAnswers[idx] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>

              {/* Reveal Section */}
              {revealedAnswers[idx] && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/15">
                  <div className="flex gap-2.5">
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm select-none shrink-0 mt-0.5">
                      Answer Suggestion:
                    </span>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mt-0.5">
                      {q.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
