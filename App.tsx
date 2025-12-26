import React, { useState, useRef } from 'react';
import { StepId, NicheData } from './types';
import { PROBLEM_OPTIONS, ENVIRONMENT_OPTIONS, STYLE_OPTIONS } from './constants';
import ProgressBar from './components/ProgressBar';
import { refineNicheStatement, generateNicheAvatar, optimizeInput } from './services/geminiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface AIStudio {
  hasSelectedApiKey(): Promise<boolean>;
  openSelectKey(): Promise<void>;
}

const App: React.FC = () => {
  const [step, setStep] = useState<StepId>('welcome');
  const [data, setData] = useState<NicheData>({
    problem: '',
    environment: '',
    style: '',
  });
  const [customInput, setCustomInput] = useState<string>('');
  const [finalStatement, setFinalStatement] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<{ data: string, mimeType: string } | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  const getAIStudio = (): AIStudio => (window as any).aistudio;

  const updateData = (key: keyof NicheData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = (nextStep: StepId) => {
    setStep(nextStep);
    setCustomInput('');
  };

  const handleCustomSubmit = (key: keyof NicheData, nextStep: StepId | 'generate') => {
    if (!customInput.trim()) return;
    updateData(key, customInput.trim());
    if (nextStep === 'generate') {
      generateAndRefine();
    } else {
      handleNext(nextStep);
    }
  };

  const handleMagicPolish = async (category: string) => {
    if (!customInput.trim()) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizeInput(category, customInput);
      setCustomInput(optimized);
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const generateAndRefine = async () => {
    setStep('result');
    setIsRefining(true);
    setError(null);
    const refined = await refineNicheStatement(data);
    setFinalStatement(refined);
    setIsRefining(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setUploadedImage({
          data: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAvatar = async () => {
    setIsGeneratingAvatar(true);
    setError(null);
    try {
      const aistudio = getAIStudio();
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await aistudio.openSelectKey();
      }
      const url = await generateNicheAvatar(finalStatement, uploadedImage || undefined);
      setAvatarUrl(url);
    } catch (err: any) {
      setError("Failed to generate avatar. Please try again.");
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleExportImage = async () => {
    if (!resultCardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(resultCardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `PM-Niche-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export image.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!resultCardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(resultCardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`PM-Niche-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const reset = () => {
    setStep('welcome');
    setData({ problem: '', environment: '', style: '' });
    setCustomInput('');
    setFinalStatement('');
    setAvatarUrl('');
    setUploadedImage(null);
    setError(null);
  };

  const stepIndex = {
    'welcome': 0,
    'problem': 1,
    'environment': 2,
    'style': 3,
    'result': 4
  }[step];

  const renderCustomInputSection = (category: string, key: keyof NicheData, nextStep: StepId | 'generate') => (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2 relative">
        <input 
          type="text" 
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder={`Describe your own ${category.toLowerCase()}...`}
          className={`flex-1 p-4 border-2 border-dashed border-slate-300 rounded-xl focus:border-blue-500 outline-none transition-all ${isOptimizing ? 'opacity-50' : 'opacity-100'}`}
          onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit(key, nextStep)}
          disabled={isOptimizing}
        />
        {customInput.trim() && !isOptimizing && (
          <button 
            onClick={() => handleMagicPolish(category)}
            className="absolute right-[110px] top-1/2 -translate-y-1/2 p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors group"
            title="Polish with AI"
          >
            <span className="text-xl group-hover:scale-110 transition-transform block">✨</span>
          </button>
        )}
        {isOptimizing && (
          <div className="absolute right-[110px] top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        )}
        {customInput.trim() && (
          <button 
            onClick={() => handleCustomSubmit(key, nextStep)}
            disabled={isOptimizing}
            className={`px-6 font-bold rounded-xl transition-all shadow-md animate-in slide-in-from-right-2 ${
              nextStep === 'generate' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {nextStep === 'generate' ? 'Finalize' : 'Next'}
          </button>
        )}
      </div>
      {customInput.trim() && !isOptimizing && (
        <p className="text-[10px] text-slate-400 italic px-1 flex items-center gap-1">
          <span className="text-emerald-500">✨</span> Click the wand to polish your phrasing with AI
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100">
        
        {step !== 'welcome' && step !== 'result' && (
          <ProgressBar currentStep={stepIndex} totalSteps={3} />
        )}

        {step === 'welcome' && (
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight">
              Define Your PM Niche
            </h1>
            <p className="text-lg text-slate-600">
              Not getting interviews? You're not underqualified. <br/>
              <span className="font-semibold text-blue-700">You're underpositioned.</span>
            </p>
            <div className="py-8">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" 
                alt="Product Management Illustration" 
                className="rounded-2xl shadow-md w-full object-cover h-48"
              />
            </div>
            <button 
              onClick={() => handleNext('problem')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-lg shadow-lg"
            >
              Start Positioning Now
            </button>
            <p className="text-xs text-slate-400">Based on Jesus Romero's 3-Question Framework</p>
          </div>
        )}

        {step === 'problem' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">1. What problem do you actually <span className="text-blue-600">enjoy</span> solving?</h2>
            <p className="text-slate-500">Pick the one you'd gladly do again. This is your gravity.</p>
            <div className="grid gap-3">
              {PROBLEM_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { updateData('problem', opt.label); handleNext('environment'); }}
                  className="text-left p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <p className="font-bold text-slate-700 group-hover:text-blue-700">{opt.label}</p>
                  <p className="text-sm text-slate-500">{opt.description}</p>
                </button>
              ))}
              {renderCustomInputSection('Problem', 'problem', 'environment')}
            </div>
          </div>
        )}

        {step === 'environment' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">2. Where does your experience make the <span className="text-blue-600">most sense</span>?</h2>
            <p className="text-slate-500">"Tech" is not a destination. Be specific.</p>
            <div className="grid gap-3">
              {ENVIRONMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { updateData('environment', opt.label); handleNext('style'); }}
                  className="text-left p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <p className="font-bold text-slate-700 group-hover:text-blue-700">{opt.label}</p>
                  <p className="text-sm text-slate-500">{opt.description}</p>
                </button>
              ))}
              {renderCustomInputSection('Environment', 'environment', 'style')}
            </div>
            <button onClick={() => setStep('problem')} className="text-sm text-slate-400 hover:text-blue-600 flex items-center gap-1">
              ← Go back
            </button>
          </div>
        )}

        {step === 'style' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">3. How do you <span className="text-blue-600">naturally</span> lead?</h2>
            <p className="text-slate-500">This is your PM fingerprint. How people remember you.</p>
            <div className="grid gap-3">
              {STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { updateData('style', opt.label); generateAndRefine(); }}
                  className="text-left p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <p className="font-bold text-slate-700 group-hover:text-blue-700">{opt.label}</p>
                  <p className="text-sm text-slate-500">{opt.description}</p>
                </button>
              ))}
              {renderCustomInputSection('Style', 'style', 'generate')}
            </div>
            <button onClick={() => setStep('environment')} className="text-sm text-slate-400 hover:text-blue-600 flex items-center gap-1">
              ← Go back
            </button>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-blue-900">Your PM Niche Statement</h2>
              <p className="text-slate-500 mt-2">Positioning = Noise into Signal.</p>
            </div>

            <div ref={resultCardRef} className="relative bg-gradient-to-br from-blue-900 to-emerald-900 p-1 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-white p-8 rounded-[0.9rem] relative z-10 flex flex-col md:flex-row gap-6 items-center">
                {isRefining ? (
                  <div className="flex flex-col items-center py-10 w-full space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 italic">AI is refining your positioning...</p>
                  </div>
                ) : (
                  <>
                    {avatarUrl && (
                      <div className="shrink-0">
                        <img crossOrigin="anonymous" src={avatarUrl} alt="Niche Avatar" className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-blue-50 shadow-lg object-cover" />
                      </div>
                    )}
                    <div className="space-y-6 flex-1 text-center md:text-left">
                      <p className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug">
                        {finalStatement}
                      </p>
                      <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Problem Area</p>
                          <p className="text-sm font-medium text-slate-700">{data.problem}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Environment</p>
                          <p className="text-sm font-medium text-slate-700">{data.environment}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Leadership</p>
                          <p className="text-sm font-medium text-slate-700">{data.style}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {!isRefining && (
              <div className="space-y-6">
                {!avatarUrl && (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 self-start">
                      <span className="text-emerald-600">👤</span> AI Niche Avatar
                    </h3>
                    
                    <div className="w-full flex flex-col gap-6">
                      <div className="space-y-4 w-full">
                        <p className="text-sm text-slate-500 italic text-center">Generate a 3D-styled profile avatar that matches your niche persona.</p>
                        
                        <div className="flex flex-col items-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-500 transition-colors bg-white">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            className="hidden" 
                            ref={fileInputRef} 
                          />
                          {uploadedImage ? (
                            <div className="flex flex-col items-center gap-3">
                              <img src={`data:${uploadedImage.mimeType};base64,${uploadedImage.data}`} alt="Upload preview" className="w-20 h-20 rounded-lg object-cover border border-slate-200 shadow-sm" />
                              <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-emerald-600 font-bold hover:underline"
                              >
                                Change Photo
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="flex flex-col items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                              <span className="text-2xl">📷</span>
                              <span className="text-xs font-bold uppercase tracking-wider">Upload Photo for Reference (Optional)</span>
                            </button>
                          )}
                        </div>

                        <button 
                          onClick={handleGenerateAvatar}
                          disabled={isGeneratingAvatar}
                          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                            isGeneratingAvatar 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {isGeneratingAvatar ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Creating your persona...
                            </>
                          ) : (
                            uploadedImage ? 'Generate Stylized Avatar from Photo' : 'Generate From Scratch'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {avatarUrl && (
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center">
                    <h3 className="text-lg font-bold text-emerald-900 mb-2">Export Your Personal Brand</h3>
                    <p className="text-sm text-emerald-700 mb-6">Save your niche card for LinkedIn, Resumes, or Portfolio.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={handleExportImage}
                        disabled={isExporting}
                        className="py-3 bg-white border-2 border-emerald-200 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                      >
                        {isExporting ? 'Exporting...' : '💾 Save as PNG'}
                      </button>
                      <button 
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="py-3 bg-white border-2 border-emerald-200 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                      >
                        {isExporting ? 'Exporting...' : '📄 Save as PDF'}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(finalStatement);
                      alert("Copied to clipboard!");
                    }}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-all"
                  >
                    Copy Statement Text
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={generateAndRefine}
                      className="py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl transition-all"
                    >
                      Regenerate
                    </button>
                    <button 
                      onClick={reset}
                      className="py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl transition-all"
                    >
                      Start Over
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center text-slate-400 text-sm">
        <p>Inspired by the coaching of Jesus Romero</p>
        <p className="mt-1">Built for high-impact PMs • Powered by Gemini 3 & Nano Banana</p>
      </div>
    </div>
  );
};

export default App;