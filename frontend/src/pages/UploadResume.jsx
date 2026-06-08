import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload, FileText, AlertCircle, Sparkles, Check } from 'lucide-react';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const loadingSteps = [
    "Uploading document securely...",
    "Extracting text from resume sections...",
    "Running NLP parsing algorithms...",
    "Consulting Gemini AI recruiters for ATS scoring...",
    "Structuring skills, gap recommendations, and interview prep...",
    "Finalizing dashboard analytics..."
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.docx') && !selectedFile.name.endsWith('.doc')) {
      setError('Only PDF or DOCX documents are supported.');
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be smaller than 10MB.');
      setFile(null);
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a resume file first.');
      return;
    }
    if (!targetRole || targetRole.trim() === '') {
      setError('Please enter a target job role.');
      return;
    }

    setError('');
    setLoading(true);
    setLoadingStep(0);

    // Setup interval to cycle through loading stages
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', targetRole.trim());

      const response = await api.post('/resumes/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(stepInterval);
      navigate(`/resumes/${response.data._id}`, { state: { justAnalyzed: true } });
    } catch (err) {
      clearInterval(stepInterval);
      console.error(err);
      setError(err.response?.data?.message || 'Resume parsing or analysis failed. Ensure API key is set or try again.');
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Title */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Analytics
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            ATS Compliance Scanner
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Upload your resume, enter your target job role, and see your ATS score instantly.
          </p>
        </div>

        {/* Upload Card */}
        <div className="glass-card p-8 relative">
          
          {/* Scanning Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 z-30 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
              <div className="relative flex items-center justify-center h-20 w-20 mb-6">
                {/* Ping rings */}
                <div className="absolute inset-0 rounded-full bg-indigo-400/20 dark:bg-indigo-500/15 animate-ping"></div>
                <div className="absolute h-14 w-14 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Upload className="h-7 w-7 animate-bounce" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">Analyzing Resume</h3>
              
              {/* Dynamic steps tracker */}
              <div className="mt-4 max-w-md w-full">
                <p className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold h-6 animate-pulse">
                  {loadingSteps[loadingStep]}
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div 
                    className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                    style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                  />
                </div>
                
                {/* Checklist */}
                <ul className="text-xs text-slate-400 dark:text-slate-500 text-left mt-6 space-y-2.5 mx-auto max-w-xs">
                  {loadingSteps.map((step, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className={`h-4 w-4 rounded-full flex items-center justify-center border text-[9px] ${
                        idx < loadingStep 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                          : idx === loadingStep 
                          ? 'border-indigo-500 text-indigo-500 animate-pulse'
                          : 'border-slate-200 dark:border-slate-800 text-transparent'
                      }`}>
                        {idx < loadingStep ? <Check className="h-2.5 w-2.5" /> : idx + 1}
                      </span>
                      <span className={idx === loadingStep ? 'text-slate-700 dark:text-slate-300 font-medium' : ''}>
                        {step.replace("...", "")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAnalyze} className="space-y-6">
            
            {/* Target Job Role */}
            <div>
              <label htmlFor="targetRole" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Target Job Role
              </label>
              <input
                id="targetRole"
                type="text"
                required
                placeholder="e.g. Frontend Developer, Fullstack Engineer, Data Analyst"
                className="input-field"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                We will test your resume layout and keywords specifically against standard metrics for this career path.
              </p>
            </div>

            {/* Drag & Drop File Zone */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Upload Resume Document
              </label>
              
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-8 bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-950/45 group"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform mb-4">
                    <Upload className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Drag and drop your file here
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5">
                    or click to browse from directory
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-4">
                    Supported Formats: PDF, DOCX (Max 10MB)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/25">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-950 dark:text-white max-w-[250px] md:max-w-md truncate">
                        {file.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-xs text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Analyze Trigger */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-150 transition-all hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:shadow-none"
            >
              <Sparkles className="h-4 w-4" />
              Scan & Analyze Resume
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
