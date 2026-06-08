import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Download, 
  Printer, 
  AlertTriangle,
  Lightbulb,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';

const AnalysisReport = () => {
  const { id } = useParams();
  const location = useLocation();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ats');

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/resumes/${id}`);
      setResume(response.data);

      // Trigger Confetti if just analyzed and score is decent
      const isNew = location.state?.justAnalyzed;
      const score = response.data?.analysisResult?.atsScore || 0;
      if (isNew && score >= 70) {
        triggerConfetti();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve resume analysis report.');
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="dashboard-container p-6 lg:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Compiling your analysis report...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="dashboard-container p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Error Loading Report</h3>
          <p className="text-slate-500 mt-2">{error || 'Report not found.'}</p>
          <Link to="/dashboard" className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-semibold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const analysis = resume.analysisResult;
  const score = analysis.atsScore || 0;
  const matchRating = analysis.jobMatchRating || 0;

  // Circle formatting variables
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="dashboard-container p-6 lg:p-8 print-full-width">
      
      {/* Back Button & Tooling */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 no-print">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Dashboard
        </Link>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
          
          <a
            href={`http://localhost:5000/api/resumes/${resume._id}/download`}
            download
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
          >
            <Download className="h-4 w-4" />
            Download Original Doc
          </a>
        </div>
      </div>

      {/* Mock Mode Alert Banner */}
      {analysis.isMock && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200/50 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/30 dark:text-amber-400 no-print">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Demo Simulation Mode</h4>
            <p className="text-xs mt-1 leading-relaxed opacity-90">
              The backend did not find a valid GEMINI_API_KEY environment variable. A simulated Recruiter evaluation report has been generated. Setup a Gemini API Key in the backend <code>.env</code> file for live parser checks.
            </p>
          </div>
        </div>
      )}

      {/* Header Block */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between mb-8 border-b border-slate-200/50 pb-8 dark:border-slate-800/50">
        <div>
          <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full font-bold">
            Target Job Role: {resume.targetRole}
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {resume.fileName}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Scan completed on {new Date(resume.createdAt).toLocaleDateString(undefined, {
              dateStyle: 'long'
            })}
          </p>
        </div>

        {/* ATS Score Radial Circle */}
        <div className="flex items-center gap-5">
          <div className="relative h-28 w-28 shrink-0">
            <svg className="h-full w-full -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800 fill-transparent"
                strokeWidth="10"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-indigo-600 dark:stroke-indigo-500 fill-transparent transition-all duration-1000"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{score}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ATS Score</span>
            </div>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">Overall Strength: {
              score >= 80 ? 'Excellent' : score >= 65 ? 'Good Progress' : 'Needs Optimization'
            }</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              {analysis.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 no-print overflow-x-auto">
        {[
          { id: 'ats', label: 'ATS Analysis', icon: Layers },
          { id: 'skills', label: 'Skills & Keyword Matching', icon: Sparkles },
          { id: 'parsed', label: 'Extracted Profile Data', icon: FileText }
        ].map((tab) => {
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

      {/* Tab Contents */}
      <div className="space-y-8">
        
        {/* ATS BREAKDOWN TAB */}
        {activeTab === 'ats' && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            
            {/* Strengths and Weaknesses */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  Key Strengths
                </h3>
                <div className="space-y-4">
                  {analysis.strengthAnalysis?.strengths?.map((str, idx) => (
                    <div key={idx} className="border-l-4 border-emerald-500 pl-4 py-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{str.category}</h4>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                          Score: {str.score}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{str.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Areas for Improvement
                </h3>
                <div className="space-y-4">
                  {analysis.strengthAnalysis?.weaknesses?.map((weak, idx) => (
                    <div key={idx} className="border-l-4 border-red-500 pl-4 py-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{weak.category}</h4>
                        <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">
                          Score: {weak.score}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{weak.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Improvement Tips & Keyword Optimization */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  AI Improvement Tips
                </h3>
                <ul className="space-y-3.5">
                  {analysis.improvementTips?.map((tip, idx) => (
                    <li key={idx} className="flex gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <p className="leading-normal mt-0.5">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Formatting Scorecard
                </h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl text-xs leading-relaxed text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/50">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">Layout Assessment:</span>
                  {analysis.strengthAnalysis?.overallFormatting || "Good ATS compatibility detected."}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            
            {/* Found Skills */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Extracted Technical Skills</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2.5">Hard Skills Found</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills?.foundHardSkills?.map((skill, idx) => (
                      <span key={idx} className="text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/35">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2.5">Soft Skills Found</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills?.foundSoftSkills?.map((skill, idx) => (
                      <span key={idx} className="text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:text-teal-400 px-3 py-1.5 rounded-lg border border-teal-100 dark:border-teal-900/35">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Missing Skills and Optimization */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Missing Skills relative to targetRole
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {analysis.skills?.missingSkills?.map((skill, idx) => (
                    <span key={idx} className="text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/25 dark:text-amber-400 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-900/35">
                      + {skill}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Including these capabilities will dramatically boost your ATS index and compliance rate.
                </p>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Keyword Optimization suggestions</h3>
                <div className="space-y-3">
                  {analysis.skills?.keywordOptimization?.map((keyword, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                      <span>{keyword}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXTRACTED PROFILE DATA TAB */}
        {activeTab === 'parsed' && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Parsed Resume Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                
                {/* Contact Data */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" /> Identification Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-500">Name:</span> {analysis.extractedDetails?.name || 'Not detected'}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-500">Email:</span> {analysis.extractedDetails?.email || 'Not detected'}
                    </p>
                  </div>
                </div>

                {/* Education section */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4.5 w-4.5" /> Education History
                  </h4>
                  {analysis.extractedDetails?.education?.length > 0 ? (
                    <ul className="space-y-3.5">
                      {analysis.extractedDetails.education.map((edu, idx) => (
                        <li key={idx} className="text-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-slate-700 dark:text-slate-300 shadow-sm leading-relaxed">
                          {edu}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">No education entries extracted.</p>
                  )}
                </div>
              </div>

              {/* Experience Section */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-2">
                  <Briefcase className="h-4.5 w-4.5" /> Professional Experience
                </h4>
                {analysis.extractedDetails?.experience?.length > 0 ? (
                  <ul className="space-y-3.5">
                    {analysis.extractedDetails.experience.map((exp, idx) => (
                      <li key={idx} className="text-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-slate-700 dark:text-slate-300 shadow-sm leading-relaxed">
                        {exp}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">No work experience entries extracted.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call To Action - Interview Prep Link */}
      <div className="mt-8 glass-card p-6 bg-gradient-to-r from-indigo-900 to-indigo-950 border-none text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl glow-indigo no-print">
        <div>
          <h3 className="text-xl font-bold">Launch Interview Prep Simulator</h3>
          <p className="text-indigo-200 text-sm mt-1 max-w-lg">
            Let our AI generate customized HR and Technical interview preparation questions based on the skills detected in this resume.
          </p>
        </div>
        <Link
          to="/interview-prep"
          state={{ resumeId: resume._id }}
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-900 transition-all hover:bg-slate-50 shrink-0"
        >
          Prepare for Interview
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

    </div>
  );
};

export default AnalysisReport;
