
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ArchitectureView } from './components/ArchitectureView';
import { MemoryGraph } from './components/MemoryGraph';
import { ModelStatus } from './components/ModelStatus';
import { ChatInterface } from './components/ChatInterface';
import { RoadmapView } from './components/RoadmapView';
import { Terminal } from './components/Terminal';
import { LiveAgent } from './components/LiveAgent';

type Tab = 'architecture' | 'memory' | 'models' | 'roadmap';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('architecture');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-[#e5e5e5] overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 h-full">
        <Header activeTab={activeTab} />
        
        <div className="flex-1 overflow-auto p-6 relative">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            {activeTab === 'architecture' && <ArchitectureView />}
            {activeTab === 'memory' && <MemoryGraph />}
            {activeTab === 'models' && <ModelStatus />}
            {activeTab === 'roadmap' && <RoadmapView />}
          </div>
        </div>

        <Terminal />
      </main>

      <div className="w-[400px] border-l border-white/10 flex flex-col hidden lg:flex bg-[#0d0d0d]">
        <ChatInterface />
      </div>

      <LiveAgent />
    </div>
  );
};

export default App;
