
import React, { useState, useRef } from 'react';
import { StepId, NicheData } from './types';
import { PROBLEM_OPTIONS, ENVIRONMENT_OPTIONS, STYLE_OPTIONS } from './constants';
import ProgressBar from './components/ProgressBar';
import { refineNicheStatement, generateNicheAvatar } from './services/geminiService';

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
  const [finalStatement, setFinalStatement] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<{ data: string, mimeType: string } | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAIStudio = (): AIStudio => (window as any).aistudio;

  const updateData = (key: keyof NicheData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = (nextStep: StepId) => {
    setStep(nextStep);
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

  const reset = () => {
    setStep('welcome');
    setData({ problem: '', environment: '', style: '' });
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
              <div className="mt-4">
                <input 
                  type="text" 
                  placeholder="Or type your own..."
                  className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl focus:border-blue-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                      updateData('problem', (e.target as HTMLInputElement).value);
                      handleNext('environment');
                    }
                  }}
                />
              </div>
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
              <div className="mt-4">
                <input 
                  type="text" 
                  placeholder="Specific sector (e.g. HealthTech, AI Logistics)..."
                  className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl focus:border-blue-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                      updateData('environment', (e.target as HTMLInputElement).value);
                      handleNext('style');
                    }
                  }}
                />
              </div>
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
              <div className="mt-4">
                <input 
                  type="text" 
                  placeholder="Your unique leadership style..."
                  className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl focus:border-blue-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                      updateData('style', (e.target as HTMLInputElement).value);
                      generateAndRefine();
                    }
                  }}
                />
              </div>
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

            <div className="relative bg-gradient-to-br from-blue-900 to-emerald-900 p-1 rounded-2xl shadow-2xl overflow-hidden">
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
                        <img src={avatarUrl} alt="Niche Avatar" className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-blue-50 shadow-lg object-cover" />
                      </div>
                    )}
                    <div className="space-y-6 flex-1 text-center md:text-left">
                      <p className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug">
                        "{finalStatement}"
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
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 self-start">
                    <span className="text-emerald-600">👤</span> AI Niche Avatar
                  </h3>
                  
                  <div className="w-full flex flex-col gap-6">
                    {/* Avatar Display */}
                    {avatarUrl ? (
                      <div className="w-full flex flex-col items-center">
                        <img src={avatarUrl} alt="Generated niche avatar" className="rounded-xl shadow-lg border border-white w-full max-w-sm aspect-square object-cover" />
                        <p className="text-[10px] text-slate-400 mt-2 text-center italic">Persona Representation (Nano Banana)</p>
                      </div>
                    ) : (
                      <div className="space-y-4 w-full">
                        <p className="text-sm text-slate-500 italic text-center">Generate a 3D-styled profile avatar that matches your niche persona.</p>
                        
                        {/* Upload Section */}
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
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(finalStatement);
                      alert("Copied to clipboard!");
                    }}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-all"
                  >
                    Copy Statement
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={generateAndRefine}
                      className="py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl transition-all"
                    >
                      Regenerate Statement
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
