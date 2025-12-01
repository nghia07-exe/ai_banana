import React, { useState } from 'react';
import { AppState, GeneratedImage, ImageSize } from './types';
import { generateColoringPage } from './services/geminiService';
import { generateBookPDF } from './services/pdfService';
import ChatBot from './components/ChatBot';
import KeySelector from './components/KeySelector';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    hasApiKey: false,
    theme: '',
    childName: '',
    imageSize: '1K',
    isGenerating: false,
    progress: 0,
    generatedImages: [],
    error: null,
  });

  const handleKeySelected = () => {
    setState(prev => ({ ...prev, hasApiKey: true }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.theme || !state.childName) return;

    setState(prev => ({
      ...prev,
      isGenerating: true,
      progress: 0,
      generatedImages: [],
      error: null
    }));

    try {
      const newImages: GeneratedImage[] = [];
      const totalPages = 5;

      for (let i = 0; i < totalPages; i++) {
        // Update progress
        setState(prev => ({ ...prev, progress: Math.round((i / totalPages) * 100) }));
        
        // Generate one page
        // We append a slight variation to the prompt to ensure distinctness if needed, 
        // though the model usually varies enough. 
        // Let's rely on the natural variance but indicate page number in log if helpful.
        const imageData = await generateColoringPage(state.theme, state.imageSize);
        
        newImages.push({
          id: Date.now() + i.toString(),
          dataUrl: imageData,
          prompt: state.theme
        });
      }

      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: 100,
        generatedImages: newImages
      }));

    } catch (error: any) {
      console.error(error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message || "Failed to generate coloring book. Please try again."
      }));
    }
  };

  const handleDownloadPDF = () => {
    if (state.generatedImages.length === 0) return;
    generateBookPDF(state.generatedImages, state.theme, state.childName);
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  if (!state.hasApiKey) {
    return (
      <div className="min-h-screen bg-brand-50">
         <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
             <i className="fas fa-paint-brush text-brand-500 text-2xl"></i>
             <h1 className="text-xl font-bold text-slate-800 font-sans">DreamLines</h1>
          </div>
        </header>
        <KeySelector onKeySelected={handleKeySelected} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center text-white shadow-md">
                <i className="fas fa-paint-brush text-xl"></i>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">DreamLines</h1>
          </div>
          <div className="flex items-center gap-2">
              <span className="hidden sm:inline px-3 py-1 bg-brand-100 text-brand-600 rounded-full text-xs font-bold uppercase tracking-wider">
                Pro Model Active
              </span>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Input Section */}
        <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-8 border border-white/50 backdrop-blur-sm">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Create Your Magic Coloring Book</h2>
            <p className="text-slate-500">Enter a theme and we'll use AI to illustrate 5 unique pages for you.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6 max-w-xl mx-auto">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">What should the book be about?</label>
              <div className="relative">
                <i className="fas fa-wand-magic-sparkles absolute left-4 top-1/2 -translate-y-1/2 text-brand-400"></i>
                <input
                  type="text"
                  value={state.theme}
                  onChange={(e) => setState(prev => ({ ...prev, theme: e.target.value }))}
                  placeholder="e.g., Space Dinosaurs, Underwater Princess, Robot City..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand-500 focus:ring-0 transition-colors text-lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Child's Name</label>
                  <div className="relative">
                    <i className="fas fa-child absolute left-4 top-1/2 -translate-y-1/2 text-brand-400"></i>
                    <input
                      type="text"
                      value={state.childName}
                      onChange={(e) => setState(prev => ({ ...prev, childName: e.target.value }))}
                      placeholder="e.g., Leo"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand-500 focus:ring-0 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Image Quality</label>
                    <div className="relative">
                        <i className="fas fa-image absolute left-4 top-1/2 -translate-y-1/2 text-brand-400"></i>
                        <select
                            value={state.imageSize}
                            onChange={(e) => setState(prev => ({ ...prev, imageSize: e.target.value as ImageSize }))}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand-500 focus:ring-0 transition-colors appearance-none cursor-pointer"
                        >
                            <option value="1K">1K (Standard)</option>
                            <option value="2K">2K (High Res)</option>
                            <option value="4K">4K (Ultra HD)</option>
                        </select>
                        <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                    </div>
                </div>
            </div>

            <button
              type="submit"
              disabled={state.isGenerating}
              className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg shadow-brand-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3
                ${state.isGenerating ? 'bg-slate-400 cursor-not-allowed shadow-none hover:transform-none' : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:to-brand-500'}`}
            >
              {state.isGenerating ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span>Generating Page {Math.floor((state.progress / 100) * 5) + 1} of 5...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-rocket"></i>
                  <span>Generate Book</span>
                </>
              )}
            </button>
            
            {state.isGenerating && (
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-brand-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${state.progress}%` }}></div>
                </div>
            )}
          </form>

          {state.error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
              <i className="fas fa-exclamation-circle text-xl"></i>
              <p>{state.error}</p>
            </div>
          )}
        </section>

        {/* Results Section */}
        {state.generatedImages.length > 0 && !state.isGenerating && (
          <section className="animate-fade-in space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">Your Coloring Pages</h3>
                    <p className="text-slate-500">Ready to print for {state.childName}!</p>
                </div>
                <button
                    onClick={handleDownloadPDF}
                    className="bg-fun-pink hover:bg-pink-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-pink-500/20 transition-all transform hover:-translate-y-1 flex items-center gap-2 justify-center"
                >
                    <i className="fas fa-file-pdf text-xl"></i>
                    <span>Download Full PDF</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {state.generatedImages.map((img, idx) => (
                <div key={img.id} className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 aspect-square">
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-600 text-xs font-bold px-2 py-1 rounded-md shadow-sm z-10">
                        Page {idx + 1}
                    </div>
                  <img
                    src={img.dataUrl}
                    alt={`Coloring page ${idx + 1}`}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none"></div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-slate-400 text-sm">
        <p>Powered by Google Gemini 3 Pro</p>
      </footer>

      <ChatBot />
    </div>
  );
};

export default App;
