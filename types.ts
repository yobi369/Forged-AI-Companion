
export interface ModelConfig {
  id: string;
  name: string;
  role: 'reasoning' | 'autocomplete' | 'summarization';
  status: 'online' | 'offline' | 'loading';
  quantization: string;
  vramUsage: string;
}

export interface MemoryNode {
  id: string;
  type: 'file' | 'summary' | 'git-commit' | 'abstraction';
  label: string;
  depth: number;
  connections: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}
