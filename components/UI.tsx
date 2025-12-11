import React, { useState, useRef } from 'react';
import { generateHolidayBlessing } from '../services/geminiService';
import { TreeMode } from '../types';

interface UIProps {
  mode: TreeMode;
  setMode: (mode: TreeMode) => void;
  setPhotos: (photos: string[]) => void;
}

export const UI: React.FC<UIProps> = ({ mode, setMode, setPhotos }) => {
  const [name, setName] = useState('');
  const [blessing, setBlessing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setBlessing(null);
    
    const result = await generateHolidayBlessing(name);
    
    setBlessing(result);
    setIsLoading(false);
  };

  const toggleMode = () => {
    setMode(mode === 'tree' ? 'scattered' : 'tree');
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newPhotos = Array.from(event.target.files).map((file: File) => URL.createObjectURL(file));
      setPhotos(newPhotos);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-10">
      {/* Header */}
      <header className="flex justify-between items-start pointer-events-auto">
        <div className="drop-shadow-lg">
          <h1 className="text-3xl md:text-5xl font-cinzel font-bold text-gold-gradient tracking-widest uppercase leading-tight">
            Sunny's Magical Tree 💗
          </h1>
          <p className="text-emerald-500 font-serif italic text-2xl mt-2 tracking-wide font-bold">
            Merry Christmas 🎄
          </p>
        </div>
        
        {/* Toggle Mode Button */}
        <button 
          onClick={toggleMode}
          className="group flex items-center gap-3 px-4 py-2 bg-black/30 border border-emerald-900/50 backdrop-blur-sm rounded-full transition-all hover:bg-emerald-900/20 hover:border-emerald-500/50"
        >
          <span className={`text-xs uppercase tracking-widest ${mode === 'tree' ? 'text-amber-400' : 'text-emerald-400/60'}`}>Tree</span>
          <div className="w-10 h-5 bg-black/50 rounded-full border border-emerald-800 relative">
             <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-500 ${mode === 'tree' ? 'left-0.5 bg-amber-400 shadow-[0_0_10px_#fbbf24]' : 'left-5 bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}></div>
          </div>
          <span className={`text-xs uppercase tracking-widest ${mode === 'scattered' ? 'text-emerald-400' : 'text-emerald-400/60'}`}>Chaos</span>
        </button>
      </header>

      {/* Main Interaction Area - Moved to Bottom Left */}
      <div className="absolute bottom-8 left-8 z-20 pointer-events-auto flex flex-col items-start gap-4">
        {!isOpen && !blessing && (
             <button 
             onClick={() => setIsOpen(true)}
             className="group relative px-6 py-3 bg-black/60 backdrop-blur-md border border-amber-500/40 text-amber-100 font-cinzel tracking-widest uppercase transition-all duration-500 hover:bg-amber-900/30 hover:border-amber-400 overflow-hidden rounded-sm"
           >
             <span className="relative z-10 flex items-center gap-2">
                <span className="text-amber-400 text-lg">✦</span> 
                Receive a Blessing
             </span>
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
           </button>
        )}

        {isOpen && !blessing && (
          <div className="bg-black/80 backdrop-blur-xl p-6 border-l-2 border-amber-500/50 w-80 text-left transition-all duration-500 animate-fadeIn origin-bottom-left shadow-[0_0_30px_rgba(0,0,0,0.5)]">
             <h2 className="text-xl font-serif text-amber-200 mb-4 italic">Who seeks the light?</h2>
             <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-white/5 border-b border-amber-500/30 text-left pl-2 text-amber-100 text-lg py-2 focus:outline-none focus:border-amber-400 placeholder-amber-700/50 font-serif w-full"
                  disabled={isLoading}
                />
                <div className="flex gap-4 items-center">
                    <button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1 bg-amber-900/20 border border-amber-500/20 py-2 text-xs font-cinzel text-amber-400 tracking-[0.2em] uppercase hover:bg-amber-800/40 hover:text-amber-200 transition-all disabled:opacity-50"
                    >
                    {isLoading ? '...' : 'Reveal'}
                    </button>
                    <button 
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-emerald-600/60 hover:text-emerald-500 uppercase tracking-widest px-2"
                    >
                    Close
                    </button>
                </div>
             </form>
          </div>
        )}

        {blessing && (
           <div className="bg-black/80 backdrop-blur-xl p-8 border-l-4 border-amber-500 w-[90vw] md:w-[400px] text-left relative animate-fadeInUp shadow-[0_0_40px_rgba(255,165,0,0.1)]">
              <p className="text-emerald-400/60 text-[10px] tracking-[0.3em] uppercase mb-2">A gift for {name}</p>
              <p className="text-lg font-serif text-amber-100 leading-relaxed italic drop-shadow-[0_0_10px_rgba(255,215,0,0.2)]">
                "{blessing}"
              </p>
              
              <button 
                onClick={() => { setBlessing(null); setIsOpen(false); setName(''); }}
                className="absolute top-2 right-2 text-amber-500/50 hover:text-amber-300 transition-colors text-xl"
                aria-label="Close"
              >
                ×
              </button>
           </div>
        )}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 right-6 flex flex-col items-end gap-4 pointer-events-auto">
         {/* Upload Button */}
         <input 
            type="file" 
            multiple 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handlePhotoUpload}
         />
         <button 
            onClick={() => fileInputRef.current?.click()}
            className="group flex items-center gap-2 px-4 py-2 bg-amber-900/20 border border-amber-500/30 hover:bg-amber-800/40 transition-all rounded-sm backdrop-blur-sm"
         >
            <span className="text-amber-400 text-lg">📷</span>
            <span className="text-amber-200 text-xs font-cinzel tracking-[0.2em] uppercase group-hover:text-white">Upload Photos</span>
         </button>

         <div className="inline-block border-r-2 border-emerald-800/50 pr-4 text-right">
            <p className="text-amber-600/40 text-xs tracking-[0.2em] uppercase">Interactive 3D Experience</p>
            <p className="text-emerald-900/40 text-[10px] mt-1">Powered by React Three Fiber & Gemini</p>
         </div>
      </footer>
    </div>
  );
};