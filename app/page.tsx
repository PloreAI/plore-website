'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Menu, Settings, Send, User, MessageSquare, Trash2, Plus, X, Sparkles, Moon, Sun } from 'lucide-react';
import { getPloreModel } from './lib/plore-router';
import MessageContent from './components/MessageContent';

const PloreAI = () => {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are Plore, an expert AI coding assistant. You help users write, debug, and explain code. You provide clear, well-commented code examples. You understand multiple programming languages and frameworks. When asked to code, provide complete, working solutions with explanations.');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Array<any>>([]);
  const [currentConvId, setCurrentConvId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [PloreMode, setPloreMode] = useState<'speed' | 'reasoning' | 'minimal'>('speed');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Get API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingText]);

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const savedPrompt = localStorage.getItem('Plore_system_prompt');
    if (savedPrompt) setSystemPrompt(savedPrompt);
    
    const savedConvs = localStorage.getItem('Plore_conversations');
    if (savedConvs) setConversations(JSON.parse(savedConvs));
    
    const savedMode = localStorage.getItem('Plore_mode');
    if (savedMode) setPloreMode(savedMode as 'speed' | 'reasoning' | 'minimal');
    
    const savedTheme = localStorage.getItem('Plore_theme');
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('Plore_theme', newTheme ? 'dark' : 'light');
  };

  const saveSettings = () => {
    localStorage.setItem('Plore_system_prompt', systemPrompt);
    localStorage.setItem('Plore_mode', PloreMode);
    setShowSettings(false);
  };

  const saveConversation = () => {
    if (messages.length === 0) return;
    
    const conv = {
      id: currentConvId || Date.now(),
      timestamp: new Date().toISOString(),
      messages: messages,
      title: messages[0]?.content.substring(0, 50) + (messages[0]?.content.length > 50 ? '...' : '')
    };
    
    const updated = conversations.filter(c => c.id !== conv.id);
    updated.unshift(conv);
    setConversations(updated);
    setCurrentConvId(conv.id);
    localStorage.setItem('Plore_conversations', JSON.stringify(updated));
  };

  const loadConversation = (conv: any) => {
    setMessages(conv.messages);
    setCurrentConvId(conv.id);
  };

  const newChat = () => {
    if (messages.length > 0) saveConversation();
    setMessages([]);
    setCurrentConvId(null);
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentConvId(null);
  };

  // Typing speed based on mode
  const getTypingSpeed = () => {
    switch (PloreMode) {
      case 'speed':
        return 5; // 5ms per character
      case 'reasoning':
        return 20; // 20ms per character
      case 'minimal':
        return 0; // Instant
      default:
        return 10;
    }
  };

  // Simulated thinking delay based on mode
  const getThinkingDelay = () => {
    switch (PloreMode) {
      case 'speed':
        return 500; // 0.5s
      case 'reasoning':
        return 2000; // 2s
      case 'minimal':
        return 0; // Instant
      default:
        return 500;
    }
  };

  // Typewriter effect function
  const typewriterEffect = (text: string, callback: () => void) => {
    const speed = getTypingSpeed();
    
    // For minimal mode, skip typing animation
    if (speed === 0) {
      setTypingText(text);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        callback();
      }, 50);
      return;
    }
    
    setIsTyping(true);
    let index = 0;
    setTypingText('');
    
    const interval = setInterval(() => {
      setTypingText(text.substring(0, index + 1)); // Use substring instead of character-by-character
      index++;
      
      if (index >= text.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsTyping(false);
          callback();
        }, 200); // Small delay before finishing
      }
    }, speed);
    
    typingIntervalRef.current = interval;
  };

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Plore v1: Smart model routing
      const routedModel = getPloreModel(currentInput);
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.href : '',
          'X-Title': 'Plore AI'
        },
        body: JSON.stringify({
          model: routedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            ...newMessages
          ]
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const content = data.choices[0].message.content;
        
        // Simulate thinking delay based on mode
        const thinkingDelay = getThinkingDelay();
        setTimeout(() => {
          setIsLoading(false);
          
          // Start typewriter effect
          typewriterEffect(content, () => {
            // After typing completes, add to messages
            const assistantMessage = {
              role: 'assistant',
              content: content
            };
            setMessages([...newMessages, assistantMessage]);
            setTypingText('');
          });
        }, thinkingDelay);
      } else {
        setIsLoading(false);
        const errorMessage = {
          role: 'assistant',
          content: `Error: ${data.error?.message || 'Unknown error occurred'}`
        };
        setMessages([...newMessages, errorMessage]);
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${error.message}`
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (showSettings) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
        <div className={`rounded-xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
          
          <div className="mb-4">
            <label className={`block font-semibold mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className={`w-full rounded-lg px-3 py-2 h-28 focus:outline-none focus:ring-2 transition-all text-sm ${isDarkMode ? 'bg-gray-700 text-white focus:ring-gray-600' : 'bg-gray-100 text-gray-900 focus:ring-gray-400'}`}
              placeholder="You are Plore, a helpful AI assistant."
            />
          </div>
          
          <div className="mb-4">
            <label className={`block font-semibold mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>API Key</label>
            <div className={`rounded-lg px-3 py-2 text-sm ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {apiKey ? '••••••••••••••••' : 'Not configured'}
            </div>
            <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>API key is configured in .env file</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={saveSettings}
              className={`flex-1 font-medium py-2 rounded-lg transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
            >
              Save
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className={`flex-1 font-medium py-2 rounded-lg transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64 md:w-72' : 'w-0'} ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} transition-all duration-300 overflow-hidden flex flex-col border-r relative z-10`}>
        <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={newChat}
            className={`w-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-all`}
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => loadConversation(conv)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm group ${isDarkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="truncate">{conv.title}</span>
              </div>
            </button>
          ))}
        </div>
        
        <div className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setShowSettings(true)}
            className={`w-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-2 rounded-lg flex items-center justify-center gap-2 transition-all`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`transition-colors p-1.5 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Image src="/Plore-icon.png" alt="Plore" width={32} height={32} className="rounded-lg" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h1 className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Plore</h1>
                  <span className={`text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} px-1.5 py-0.5 rounded`}>v1</span>
                </div>
                <span className={`text-xs capitalize ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{PloreMode}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} px-3 py-1.5 rounded-lg transition-all`}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button
              onClick={clearChat}
              className={`${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all`}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden md:inline text-sm">Clear</span>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-xl animate-fade-in">
                <Image src="/Plore-icon.png" alt="Plore" width={64} height={64} className="rounded-2xl shadow-lg mx-auto mb-4" />
                <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Welcome to Plore
                </h2>
                <p className={`text-base mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Start a conversation and let AI assist you</p>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {[
                    { icon: "💡", text: "Get creative ideas" },
                    { icon: "📝", text: "Write content" },
                    { icon: "🔍", text: "Research topics" },
                    { icon: "💬", text: "Have conversations" }
                  ].map((item, i) => (
                    <div key={i} className={`rounded-lg p-3 border transition-all cursor-pointer group ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                      <div className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">{item.icon}</div>
                      <div className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>{item.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div
                className={`max-w-2xl md:max-w-3xl rounded-xl px-4 py-3 shadow-md ${
                  msg.role === 'user'
                    ? isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
                    : isDarkMode ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-gray-100 text-gray-900 border border-gray-200'
                }`}
              >
                <div className="font-semibold mb-1.5 text-xs opacity-75 flex items-center gap-1.5">
                  {msg.role === 'user' ? (
                    <>
                      <User className="w-3.5 h-3.5" />
                      You
                    </>
                  ) : (
                    <>
                  <Image src="/Plore-icon.png" alt="Plore" width={14} height={14} className="rounded" />
                      Plore
                    </>
                  )}
                </div>
                <div className="leading-relaxed">
                  <MessageContent content={msg.content} />
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading: Thinking state */}
          {isLoading && (
            <div className="flex justify-start mb-4 animate-slide-up">
              <div className={`rounded-xl px-4 py-3 shadow-md ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>
                <div className="font-semibold mb-1.5 text-xs opacity-75 flex items-center gap-1.5">
                  <Image src="/Plore-icon.png" alt="Plore" width={14} height={14} className="rounded animate-pulse" />
                  Plore
                </div>
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="flex gap-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '0ms' }}></div>
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '150ms' }}></div>
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs font-medium">
                    {PloreMode === 'reasoning' ? 'Deep thinking...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Typing: AI is typing response */}
          {isTyping && typingText && (
            <div className="flex justify-start mb-4 animate-slide-up">
              <div className={`max-w-2xl md:max-w-3xl rounded-xl px-4 py-3 shadow-md ${isDarkMode ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}>
                <div className="font-semibold mb-1.5 text-xs opacity-75 flex items-center gap-1.5">
                  <Image src="/Plore-icon.png" alt="Plore" width={14} height={14} className="rounded" />
                  Plore
                </div>
                <div className="leading-relaxed">
                  <MessageContent content={typingText} />
                  <span className={`inline-block w-1.5 h-3.5 ml-0.5 animate-pulse ${isDarkMode ? 'bg-gray-400' : 'bg-gray-600'}`}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t px-4 md:px-6 py-3`}>
          <div className="max-w-4xl mx-auto">
            {/* Mode Selector */}
            <div className="flex items-center gap-2 mb-2">
              <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mode:</label>
              <select
                value={PloreMode}
                onChange={(e) => {
                  const newMode = e.target.value as 'speed' | 'reasoning' | 'minimal';
                  setPloreMode(newMode);
                  localStorage.setItem('Plore_mode', newMode);
                }}
                className={`${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} text-xs rounded-md px-2.5 py-1 focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-gray-600' : 'focus:ring-gray-400'} transition-all cursor-pointer`}
              >
                <option value="speed">⚡ Speed</option>
                <option value="reasoning">🧠 Reasoning</option>
                <option value="minimal">⚡️ Minimal</option>
              </select>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {PloreMode === 'speed' && 'Fast responses'}
                {PloreMode === 'reasoning' && 'Detailed thinking'}
                {PloreMode === 'minimal' && 'Instant answers'}
              </div>
            </div>
            
            <div className={`relative rounded-xl border transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 focus-within:border-gray-500' : 'bg-white border-gray-300 focus-within:border-gray-400'}`}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me to code something..."
                className={`w-full bg-transparent rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                rows={2}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 bottom-2 text-white p-2 rounded-lg transition-all ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700' : 'bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300'}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className={`text-xs text-center mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PloreAI;