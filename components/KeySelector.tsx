import React, { useState, useEffect } from 'react';

interface KeySelectorProps {
  onKeySelected: () => void;
}

const KeySelector: React.FC<KeySelectorProps> = ({ onKeySelected }) => {
  const [isChecking, setIsChecking] = useState(true);

  const checkKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (hasKey) {
        onKeySelected();
      }
      setIsChecking(false);
    } else {
        // Fallback or dev mode if aistudio not present (though prompt implies it will be)
        setIsChecking(false);
    }
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
        try {
            await aistudio.openSelectKey();
            // Assume success after dialog close/action as per instructions
            onKeySelected(); 
        } catch (e) {
            console.error("Key selection failed", e);
            // If failed with specific error, might need reset, but for now just log
        }
    } else {
        alert("AI Studio environment not detected.");
    }
  };

  if (isChecking) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-brand-100">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600">
          <i className="fas fa-key text-3xl"></i>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4 font-sans">Get Started</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          To generate high-quality coloring pages with the Pro model, you need to connect your Google Cloud project billing.
        </p>
        <button
          onClick={handleConnect}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-brand-500/30 flex items-center justify-center gap-3 text-lg"
        >
          <span>Select API Key</span>
          <i className="fas fa-arrow-right"></i>
        </button>
        <p className="mt-6 text-xs text-slate-400">
          Learn more about billing at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-500">ai.google.dev/gemini-api/docs/billing</a>
        </p>
      </div>
    </div>
  );
};

export default KeySelector;