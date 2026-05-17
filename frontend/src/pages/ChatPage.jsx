import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Stethoscope } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import socket from '../lib/socket';

// AI Symptom suggestions (mock for MVP)
const getAIResponse = (msg) => {
  const lower = msg.toLowerCase();
  if (lower.includes('headache') || lower.includes('head')) {
    return '🤖 Based on your symptoms, possible causes include tension headaches, dehydration, or migraine. Recommendations: rest, hydrate well, and avoid screen time. If pain persists over 3 days or worsens suddenly, please see a doctor immediately.';
  }
  if (lower.includes('fever') || lower.includes('temperature')) {
    return '🤖 A fever often indicates your body is fighting an infection. Monitor your temperature. If it exceeds 39°C (102°F), persists more than 3 days, or is accompanied by difficulty breathing, seek immediate medical attention.';
  }
  if (lower.includes('chest') || lower.includes('heart')) {
    return '🤖 ⚠️ Chest pain or discomfort requires prompt evaluation. If you are experiencing severe chest pain, shortness of breath, or pain radiating to the arm — call emergency services immediately. Do not wait.';
  }
  if (lower.includes('cough') || lower.includes('cold')) {
    return '🤖 Cough and cold symptoms are often viral. Rest, stay hydrated, and use over-the-counter remedies. If you have a productive cough lasting > 2 weeks, high fever, or difficulty breathing, schedule a consultation.';
  }
  return `🤖 Thank you for sharing. Based on what you described, I recommend scheduling a consultation with a specialist. Would you like me to help you book an appointment? Type "book appointment" to proceed.`;
};

export default function ChatPage() {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { role: 'ai', content: '👋 Hi! I\'m CareSync AI. Describe your symptoms and I\'ll provide insights. Remember: I\'m not a substitute for professional medical advice.' }
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Load contacts (doctors for patients, patients for doctors)
    const endpoint = user?.role === 'patient' ? '/users/doctors' : '/users';
    api.get(endpoint).then(res => {
      setContacts(user?.role === 'patient' ? res.data : res.data.filter(u => u.role === 'patient'));
    }).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      api.get(`/messages/${selectedContact._id}`).then(res => setMessages(res.data)).catch(console.error);
    }
  }, [selectedContact]);

  useEffect(() => {
    socket.on('message:receive', (msg) => {
      if (selectedContact && (msg.sender === selectedContact._id || msg.receiver === selectedContact._id)) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return () => socket.off('message:receive');
  }, [selectedContact]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiMessages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    if (aiMode) {
      const userMsg = { role: 'user', content: input };
      const aiReply = { role: 'ai', content: getAIResponse(input) };
      setAiMessages(prev => [...prev, userMsg, aiReply]);
      setInput('');
      return;
    }
    if (!selectedContact) return;
    const msgData = { senderId: user._id, receiverId: selectedContact._id, content: input };
    socket.emit('message:send', msgData);
    setMessages(prev => [...prev, { sender: user._id, receiver: selectedContact._id, content: input, createdAt: new Date() }]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 130px)' }}>
        {/* Sidebar */}
        <div className="stat-card" style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Messages</h2>
          </div>

          {/* AI Mode Button */}
          <button onClick={() => { setAiMode(true); setSelectedContact(null); }}
            style={{ margin: '0.75rem', padding: '0.75rem', borderRadius: 10, border: `2px solid ${aiMode ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.06)'}`, background: aiMode ? 'rgba(139,92,246,0.1)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: aiMode ? '#a78bfa' : '#64748b', transition: 'all 0.2s' }}>
            <Bot size={20} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>AI Assistant</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Symptom checker</div>
            </div>
          </button>

          {/* Contacts */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.75rem 0.75rem' }}>
            {contacts.map(c => (
              <button key={c._id} onClick={() => { setSelectedContact(c); setAiMode(false); }}
                style={{ width: '100%', padding: '0.875rem', borderRadius: 10, border: `2px solid ${!aiMode && selectedContact?._id === c._id ? 'rgba(59,130,246,0.4)' : 'transparent'}`, background: !aiMode && selectedContact?._id === c._id ? 'rgba(59,130,246,0.08)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', transition: 'all 0.2s' }}>
                <div style={{ width: 38, height: 38, background: 'rgba(16,185,129,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#10b981', flexShrink: 0 }}>
                  {c.name?.charAt(0)}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f1f5f9' }}>{user?.role === 'patient' ? `Dr. ${c.name}` : c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.specialization || c.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="stat-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {aiMode ? (
              <>
                <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={22} color="#a78bfa" />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>CareSync AI</div>
                  <div style={{ fontSize: '0.8rem', color: '#34d399' }}>● AI Symptom Checker Active</div>
                </div>
              </>
            ) : selectedContact ? (
              <>
                <div style={{ width: 40, height: 40, background: 'rgba(16,185,129,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#10b981' }}>
                  {selectedContact.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{user?.role === 'patient' ? `Dr. ${selectedContact.name}` : selectedContact.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedContact.specialization || selectedContact.role}</div>
                </div>
              </>
            ) : (
              <div style={{ color: '#64748b' }}>Select a contact to start messaging</div>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {aiMode ? (
              aiMessages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {m.role === 'ai' && (
                    <div style={{ width: 32, height: 32, background: 'rgba(139,92,246,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bot size={16} color="#a78bfa" />
                    </div>
                  )}
                  <div style={{ maxWidth: '75%', padding: '0.875rem 1.1rem', borderRadius: m.role === 'user' ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem', background: m.role === 'user' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(30,41,59,0.8)', border: m.role === 'ai' ? '1px solid rgba(139,92,246,0.2)' : 'none', fontSize: '0.875rem', lineHeight: 1.6, color: '#f1f5f9' }}>
                    {m.content}
                  </div>
                  {m.role === 'user' && (
                    <div style={{ width: 32, height: 32, background: 'rgba(37,99,235,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={16} color="#60a5fa" />
                    </div>
                  )}
                </div>
              ))
            ) : selectedContact ? (
              messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#475569', padding: '2rem' }}>
                  <Stethoscope size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : messages.map((m, i) => {
                const isMe = m.sender === user?._id || m.sender?._id === user?._id;
                return (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    {!isMe && (
                      <div style={{ width: 32, height: 32, background: 'rgba(16,185,129,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#10b981', flexShrink: 0 }}>
                        {selectedContact.name?.charAt(0)}
                      </div>
                    )}
                    <div style={{ maxWidth: '75%', padding: '0.875rem 1.1rem', borderRadius: isMe ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem', background: isMe ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(30,41,59,0.8)', border: !isMe ? '1px solid rgba(255,255,255,0.06)' : 'none', fontSize: '0.875rem', lineHeight: 1.6, color: '#f1f5f9' }}>
                      {m.content}
                      <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: '#334155', marginTop: '4rem' }}>
                <Bot size={56} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>Select a contact or use the AI Assistant</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {(aiMode || selectedContact) && (
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <textarea
                className="input-field"
                rows={1}
                placeholder={aiMode ? 'Describe your symptoms...' : 'Type a message...'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ flex: 1, resize: 'none', maxHeight: 120 }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="btn-primary"
                style={{ padding: '0.75rem', flexShrink: 0, opacity: input.trim() ? 1 : 0.5 }}
              >
                <Send size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
