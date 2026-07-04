"use client";

import React, { useState, useEffect } from 'react';
import { Palette, Type, LayoutTemplate, Monitor, Moon, Sun, Smartphone, Globe, Bell, Save, CheckCircle2, Bot, Plus, Trash2, Send, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('appearance');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mock State
  const [theme, setTheme] = useState('dark');
  const [font, setFont] = useState('inter');
  const [accent, setAccent] = useState('gold');

  // AI State
  const [aiRules, setAiRules] = useState([]);
  const [newRule, setNewRule] = useState('');

  // AI Trainer Chat State
  const [trainerMessages, setTrainerMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am your AI Assistant Trainer. Tell me about any new policies, schedules, or routes, and I will automatically formulate and save them for you. What would you like to update today?' }
  ]);
  const [trainerInput, setTrainerInput] = useState('');
  const [trainerLoading, setTrainerLoading] = useState(false);
  const trainerEndRef = React.useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    trainerEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [trainerMessages]);

  const handleSendTrainerMessage = async () => {
    if (!trainerInput.trim() || trainerLoading) return;
    const userMsgText = trainerInput.trim();
    setTrainerInput('');
    setTrainerMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMsgText }]);
    setTrainerLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsgText, language: 'en', isOwner: true })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          setTrainerMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: data.reply }]);
        } else {
          setTrainerMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: '⚠️ API Key Missing: Please configure GEMINI_API_KEY in your .env.local file to enable the AI Trainer.' }]);
        }
        if (data.ruleAdded) {
          // Re-fetch dynamic rules list to refresh the left panel in real-time!
          fetch('/api/admin/ai-instructions')
            .then(res => res.json())
            .then(d => {
              if (d.rules) setAiRules(d.rules);
            });
        }
      } else {
        setTrainerMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Sorry, I failed to process that request.' }]);
      }
    } catch (e) {
      console.error(e);
      setTrainerMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Network error. Please try again.' }]);
    } finally {
      setTrainerLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/admin/ai-instructions')
      .then(res => res.json())
      .then(data => {
        if (data.rules) setAiRules(data.rules);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    
    fetch('/api/admin/ai-instructions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules: aiRules })
    }).then(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }).catch(err => {
      console.error(err);
      setIsSaving(false);
    });
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
    { id: 'typography', label: 'Typography & Fonts', icon: Type },
    { id: 'layout', label: 'Store Layout', icon: LayoutTemplate },
    { id: 'general', label: 'General Info', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Store Settings</h1>
          <p className="text-sm text-[#A09393]">Manage your website's appearance, branding, and global preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] ${saved ? 'bg-emerald-500 text-black shadow-emerald-500/20' : 'bg-[#D4AF37] hover:bg-[#BFA030] text-black'}`}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4" /> Saved</>
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </button>
      </div>

      {/* Navigation Tabs (Horizontal) */}
      <div className="flex flex-wrap gap-2 mb-6 shrink-0 border-b border-[#2C1E1E] pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id 
              ? 'bg-[#D4AF37]/10 border border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
              : 'text-[#A09393] hover:text-white hover:bg-[#1C1212] border border-transparent hover:border-[#2C1E1E]'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#D4AF37]' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {/* Content Area */}
        <div className="flex-1 bg-[#160F0F] border border-[#2C1E1E] rounded-2xl overflow-y-auto scrollbar-thin p-8 shadow-xl">
          
          {activeTab === 'appearance' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Color Theme</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div onClick={() => setTheme('dark')} className={`cursor-pointer rounded-xl border-2 p-4 transition ${theme === 'dark' ? 'border-[#D4AF37] bg-[#1C1212]' : 'border-[#2C1E1E] hover:border-[#3D2828] bg-[#0F0A0A]'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-[#D4AF37]' : 'text-[#A09393]'}`} />
                      <div className={`w-4 h-4 rounded-full border-2 ${theme === 'dark' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#3D2828] bg-transparent'}`}></div>
                    </div>
                    <div className="font-semibold text-white mb-1">Midnight Dark</div>
                    <div className="text-xs text-[#A09393]">Deep blacks with high contrast text. Recommended for premium feel.</div>
                  </div>

                  <div onClick={() => setTheme('light')} className={`cursor-pointer rounded-xl border-2 p-4 transition ${theme === 'light' ? 'border-[#D4AF37] bg-zinc-100' : 'border-[#2C1E1E] hover:border-zinc-300 bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-[#D4AF37]' : 'text-zinc-400'}`} />
                      <div className={`w-4 h-4 rounded-full border-2 ${theme === 'light' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-zinc-300 bg-transparent'}`}></div>
                    </div>
                    <div className="font-semibold text-zinc-900 mb-1">Pristine Light</div>
                    <div className="text-xs text-zinc-500">Clean white backgrounds. Good for high readability.</div>
                  </div>

                  <div onClick={() => setTheme('system')} className={`cursor-pointer rounded-xl border-2 p-4 transition ${theme === 'system' ? 'border-[#D4AF37] bg-[#1C1212]' : 'border-[#2C1E1E] hover:border-[#3D2828] bg-gradient-to-br from-[#0F0A0A] to-white/10'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <Monitor className={`w-5 h-5 ${theme === 'system' ? 'text-[#D4AF37]' : 'text-[#A09393]'}`} />
                      <div className={`w-4 h-4 rounded-full border-2 ${theme === 'system' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#3D2828] bg-transparent'}`}></div>
                    </div>
                    <div className="font-semibold text-white mb-1">System Default</div>
                    <div className="text-xs text-[#A09393]">Follows the customer's device settings automatically.</div>
                  </div>

                </div>
              </section>

              <div className="h-px w-full bg-[#2C1E1E]"></div>

              <section>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Accent Color</h3>
                <p className="text-xs text-[#A09393] mb-4 -mt-3">Primary color used for buttons, links, and highlights across the storefront.</p>
                <div className="flex gap-4">
                  {[
                    { id: 'gold', color: 'bg-[#D4AF37]', name: 'Royal Gold' },
                    { id: 'rose', color: 'bg-rose-500', name: 'Rose Red' },
                    { id: 'blue', color: 'bg-blue-500', name: 'Ocean Blue' },
                    { id: 'emerald', color: 'bg-emerald-500', name: 'Emerald' },
                    { id: 'violet', color: 'bg-violet-500', name: 'Deep Violet' },
                  ].map(c => (
                    <button key={c.id} onClick={() => setAccent(c.id)} className="flex flex-col items-center gap-2 group">
                      <div className={`w-10 h-10 rounded-full ${c.color} flex items-center justify-center transition-all ${accent === c.id ? 'ring-4 ring-offset-2 ring-offset-[#160F0F] ring-white/20 scale-110' : 'opacity-70 hover:opacity-100 hover:scale-110'}`}>
                        {accent === c.id && <CheckCircle2 className="w-5 h-5 text-white/80" />}
                      </div>
                      <span className={`text-[10px] font-medium ${accent === c.id ? 'text-white' : 'text-[#5A4B4B]'}`}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <section>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Primary Font Family</h3>
                <p className="text-xs text-[#A09393] mb-6 -mt-3">Choose the typography style that best represents your brand.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div onClick={() => setFont('inter')} className={`cursor-pointer rounded-xl border-2 p-5 transition ${font === 'inter' ? 'border-[#D4AF37] bg-[#1C1212]' : 'border-[#2C1E1E] hover:border-[#3D2828] bg-transparent'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-sans text-2xl text-white">Inter</div>
                      <div className={`w-4 h-4 rounded-full border-2 ${font === 'inter' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#3D2828] bg-transparent'}`}></div>
                    </div>
                    <p className="font-sans text-sm text-[#A09393] leading-relaxed">A highly legible sans-serif font designed for computer screens. Clean, modern, and professional.</p>
                  </div>

                  <div onClick={() => setFont('playfair')} className={`cursor-pointer rounded-xl border-2 p-5 transition ${font === 'playfair' ? 'border-[#D4AF37] bg-[#1C1212]' : 'border-[#2C1E1E] hover:border-[#3D2828] bg-transparent'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-serif text-2xl text-white italic tracking-wide">Playfair Display</div>
                      <div className={`w-4 h-4 rounded-full border-2 ${font === 'playfair' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#3D2828] bg-transparent'}`}></div>
                    </div>
                    <p className="font-serif text-sm text-[#A09393] leading-relaxed">An elegant serif font. Perfect for a classic, traditional, and highly premium instrument aesthetic.</p>
                  </div>

                  <div onClick={() => setFont('outfit')} className={`cursor-pointer rounded-xl border-2 p-5 transition ${font === 'outfit' ? 'border-[#D4AF37] bg-[#1C1212]' : 'border-[#2C1E1E] hover:border-[#3D2828] bg-transparent'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-sans font-semibold text-2xl text-white tracking-tight">Outfit</div>
                      <div className={`w-4 h-4 rounded-full border-2 ${font === 'outfit' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#3D2828] bg-transparent'}`}></div>
                    </div>
                    <p className="font-sans text-sm text-[#A09393] leading-relaxed">A beautiful geometric sans-serif font. Playful yet highly readable, giving a bold modern look.</p>
                  </div>

                  <div onClick={() => setFont('mono')} className={`cursor-pointer rounded-xl border-2 p-5 transition ${font === 'mono' ? 'border-[#D4AF37] bg-[#1C1212]' : 'border-[#2C1E1E] hover:border-[#3D2828] bg-transparent'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-mono text-2xl text-white">Space Mono</div>
                      <div className={`w-4 h-4 rounded-full border-2 ${font === 'mono' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#3D2828] bg-transparent'}`}></div>
                    </div>
                    <p className="font-mono text-sm text-[#A09393] leading-relaxed">An eclectic monospace font. Great for an industrial, raw, or tech-forward aesthetic.</p>
                  </div>

                </div>
              </section>

              <div className="h-px w-full bg-[#2C1E1E]"></div>

              <section>
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Font Sizing</h3>
                 <div className="flex items-center gap-6">
                    <span className="text-xs text-[#5A4B4B]">Smaller</span>
                    <input type="range" min="1" max="3" defaultValue="2" className="flex-1 accent-[#D4AF37]" />
                    <span className="text-lg text-[#5A4B4B]">Larger</span>
                 </div>
              </section>

            </div>
          )}

          {activeTab === 'ai' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
               
               {/* Left Column: Rule Manager */}
               <section className="flex flex-col border-r border-[#2C1E1E] pr-0 xl:pr-10">
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Dynamic AI Instructions</h3>
                    <p className="text-xs text-[#A09393] mt-1">Directly view and manage active rules. Checked rules are fed to the AI.</p>
                  </div>
                </div>
                
                <div className="h-[480px] overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-thin">
                  {aiRules.map((rule) => (
                    <div key={rule.id} className="flex items-start gap-4 p-4 rounded-xl border border-[#2C1E1E] bg-[#1C1212] transition-colors hover:border-[#3D2828]">
                      <input 
                        type="checkbox" 
                        checked={rule.isActive}
                        onChange={(e) => {
                          setAiRules(aiRules.map(r => r.id === rule.id ? {...r, isActive: e.target.checked} : r));
                        }}
                        className="mt-1 w-4 h-4 rounded border-gray-600 text-[#D4AF37] focus:ring-[#D4AF37] bg-black cursor-pointer shrink-0"
                      />
                      <div className="flex-1">
                        <textarea 
                          value={rule.text}
                          onChange={(e) => {
                            setAiRules(aiRules.map(r => r.id === rule.id ? {...r, text: e.target.value} : r));
                          }}
                          rows={2}
                          className="w-full bg-transparent border-none focus:ring-0 text-sm text-white resize-y p-0 focus:outline-none"
                          placeholder="Instruction text..."
                        />
                      </div>
                      <button 
                        onClick={() => setAiRules(aiRules.filter(r => r.id !== rule.id))}
                        className="p-2 text-[#A09393] hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {aiRules.length === 0 && (
                    <div className="text-center p-8 border border-dashed border-[#2C1E1E] rounded-xl text-[#A09393] text-sm">
                      No custom instructions added yet.
                    </div>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <input 
                    type="text" 
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newRule.trim()) {
                        setAiRules([...aiRules, { id: Date.now().toString(), text: newRule.trim(), isActive: true }]);
                        setNewRule('');
                      }
                    }}
                    placeholder="Add manual rule..."
                    className="flex-1 bg-[#1C1212] border border-[#2C1E1E] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button 
                    onClick={() => {
                      if (newRule.trim()) {
                        setAiRules([...aiRules, { id: Date.now().toString(), text: newRule.trim(), isActive: true }]);
                        setNewRule('');
                      }
                    }}
                    className="px-5 py-3 bg-[#2C1E1E] hover:bg-[#3D2828] text-white rounded-xl transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
               </section>

               {/* Right Column: AI Trainer Chat */}
               <section className="flex flex-col">
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <div>
                    <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                      <Bot className="w-4 h-4" /> AI Trainer Chat
                    </h3>
                    <p className="text-xs text-[#A09393] mt-1">Chat with the AI to teach it new rules. It will automatically save them.</p>
                  </div>
                </div>

                <div className="h-[480px] overflow-y-auto space-y-4 mb-6 pr-2 bg-[#0F0A0A] border border-[#2C1E1E] rounded-2xl p-5 scrollbar-thin">
                  {trainerMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-[#D4AF37]/10 border border-[#D4AF37] text-white rounded-br-none' 
                            : 'bg-[#1C1212] border border-[#2C1E1E] text-white rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {trainerLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#1C1212] border border-[#2C1E1E] rounded-2xl rounded-bl-none p-4 text-sm text-[#A09393] flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                        <span>AI is writing rules...</span>
                      </div>
                    </div>
                  )}
                  <div ref={trainerEndRef} />
                </div>

                <div className="flex gap-2 shrink-0">
                  <input 
                    type="text" 
                    value={trainerInput}
                    onChange={(e) => setTrainerInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendTrainerMessage();
                    }}
                    placeholder="Tell AI a new rule or answer its questions..."
                    className="flex-1 bg-[#1C1212] border border-[#2C1E1E] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button 
                    onClick={handleSendTrainerMessage}
                    className="px-5 py-3 bg-[#D4AF37] hover:bg-[#BFA030] text-black rounded-xl transition-colors flex items-center justify-center font-bold"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
               </section>

            </div>
          )}

          {activeTab !== 'appearance' && activeTab !== 'typography' && activeTab !== 'ai' && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 animate-in fade-in">
              <LayoutTemplate className="w-12 h-12 text-[#5A4B4B] mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Module Under Construction</h3>
              <p className="text-sm text-[#A09393] max-w-sm">The {tabs.find(t => t.id === activeTab)?.label} configuration panel is currently being designed and will be available soon.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
