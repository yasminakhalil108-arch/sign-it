// ============================================
// Sign It - Backend Services & Chat Manager
// ============================================

/**
 * Supabase Configuration (من chat.html محسنة)
 */
const supabaseConfig = {
  url: 'https://vpwpafsqmnuogsoivfid.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwd3BhZnNxbW51b2dzb2l2ZmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjQ0ODIsImV4cCI6MjA5MTUwMDQ4Mn0.RnnPZ4hc_0S7Nhx-Y9HE0dVW-Hs-wP56ISeF9BUeMtA',
  anonKey: 'sb_publishable_czLmoVxAx2t8EI8nr68QCQ_vqRjcrnt'
};

let supabase = null;

// Initialize Supabase
try {
  supabase = window.supabase.createClient(supabaseConfig.url, supabaseConfig.key);
  console.log('✅ Supabase initialized');
} catch (error) {
  console.warn('⚠️ Supabase initialization failed:', error);
}

/**
 * Chat Manager - Advanced Chat System with Supabase
 */
class ChatManager {
  constructor() {
    this.messages = [];
    this.conversationHistory = localStorage.getItem('chatHistory') 
      ? JSON.parse(localStorage.getItem('chatHistory')) 
      : [];
    this.sessionId = this.initializeSession();
    this.userId = 'user-' + Math.floor(Math.random() * 100000);
    this.chatId = 'room-' + localStorage.getItem('preferredChatRoom') || 'room1';
    this.isTyping = false;
    this.messageLimit = 1000;
    this.retryAttempts = 3;
  }

  // Initialize Chat Session
  initializeSession() {
    let sessionId = localStorage.getItem('chatSessionId');
    if (!sessionId) {
      sessionId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('chatSessionId', sessionId);
    }
    return sessionId;
  }

  // Add message to chat
  async addMessage(text, sender = 'user', metadata = {}) {
    try {
      const message = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        text: text,
        sender: sender,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        userId: this.userId,
        chatId: this.chatId,
        metadata: metadata,
        read: false
      };

      this.messages.push(message);
      
      // Save to Local Storage
      await this.saveToDB(message);
      
      // Save to Supabase (non-blocking)
      if (supabase) {
        this.saveToSupabase(message);
      }
      
      this.updateChatUI(message);
      
      return message;
    } catch (error) {
      console.error('❌ Error adding message:', error);
      return null;
    }
  }

  // Save to Local Database
  async saveToDB(message) {
    try {
      this.conversationHistory.push(message);
      
      // Keep only last 500 messages
      if (this.conversationHistory.length > 500) {
        this.conversationHistory = this.conversationHistory.slice(-500);
      }
      
      localStorage.setItem('chatHistory', JSON.stringify(this.conversationHistory));
      console.log('✅ Message saved locally');
    } catch (error) {
      console.error('❌ Local database error:', error);
    }
  }

  // Save to Supabase
  async saveToSupabase(message) {
    try {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: this.chatId,
            sender_id: this.userId,
            content: message.text,
            message_type: message.sender,
            metadata: message.metadata,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      console.log('✅ Message saved to Supabase');
    } catch (error) {
      console.warn('⚠️ Supabase save failed (non-critical):', error);
    }
  }

  // Update Chat UI
  updateChatUI(message) {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message-pro ${message.sender}`;
    messageDiv.id = message.id;
    
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    
    // Add user info for multi-user chats
    let content = `<p>${this.escapeHTML(message.text)}</p>`;
    if (message.sender === 'user' && message.userId !== this.userId) {
      content = `<small style="opacity: 0.7;">${message.userId}</small><p>${this.escapeHTML(message.text)}</p>`;
    }
    
    bubble.innerHTML = content;
    messageDiv.appendChild(bubble);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Load messages from Supabase Realtime
  async loadMessagesRealtime() {
    try {
      if (!supabase) return;

      // Load initial messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', this.chatId)
        .order('created_at');

      if (data) {
        data.forEach(msg => {
          const messageDiv = document.createElement('div');
          messageDiv.className = `chat-message-pro ${msg.message_type || 'bot'}`;
          
          const bubble = document.createElement('div');
          bubble.className = 'msg-bubble';
          bubble.innerHTML = `<p>${this.escapeHTML(msg.content)}</p>`;
          
          messageDiv.appendChild(bubble);
          const chatBox = document.getElementById('chatBox');
          if (chatBox) chatBox.appendChild(messageDiv);
        });
      }

      // Subscribe to realtime updates
      supabase
        .channel(`messages:${this.chatId}`)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            table: 'messages',
            filter: `chat_id=eq.${this.chatId}`
          },
          (payload) => {
            const msg = payload.new;
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message-pro ${msg.message_type || 'bot'}`;
            
            const bubble = document.createElement('div');
            bubble.className = 'msg-bubble';
            bubble.innerHTML = `<p>${this.escapeHTML(msg.content)}</p>`;
            
            messageDiv.appendChild(bubble);
            const chatBox = document.getElementById('chatBox');
            if (chatBox) {
              chatBox.appendChild(messageDiv);
              chatBox.scrollTop = chatBox.scrollHeight;
            }
            
            console.log('📨 New message received:', msg.content);
          }
        )
        .subscribe();

      console.log('✅ Realtime messages loaded');
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  }

  // Clear Chat History
  clearHistory() {
    if (confirm('هل تريد حذف سجل الدردشة بالكامل؟')) {
      this.conversationHistory = [];
      this.messages = [];
      localStorage.setItem('chatHistory', JSON.stringify([]));
      const chatBox = document.getElementById('chatBox');
      if (chatBox) {
        chatBox.innerHTML = '<div class="chat-message-pro bot"><div class="msg-bubble"><p>تم حذف السجل. مرحباً! 👋</p></div></div>';
      }
    }
  }

  // Get Chat Statistics
  getStats() {
    return {
      totalMessages: this.conversationHistory.length,
      sessionMessages: this.messages.length,
      averageResponseTime: this.calculateAvgResponseTime(),
      lastMessageTime: this.conversationHistory.length > 0 
        ? this.conversationHistory[this.conversationHistory.length - 1].timestamp 
        : null,
      userId: this.userId,
      chatId: this.chatId
    };
  }

  // Calculate Average Response Time
  calculateAvgResponseTime() {
    if (this.conversationHistory.length < 2) return 0;
    let totalTime = 0;
    let count = 0;
    
    for (let i = 1; i < this.conversationHistory.length; i++) {
      if (this.conversationHistory[i].sender === 'bot' && this.conversationHistory[i-1].sender === 'user') {
        const userTime = new Date(this.conversationHistory[i-1].timestamp);
        const botTime = new Date(this.conversationHistory[i].timestamp);
        totalTime += (botTime - userTime);
        count++;
      }
    }
    
    return count > 0 ? Math.round(totalTime / count) : 0;
  }

  // Escape HTML to prevent XSS
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Export Chat History
  exportChatHistory() {
    const dataStr = JSON.stringify(this.conversationHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${new Date().getTime()}.json`;
    link.click();
  }
}

/**
 * AI Response Engine - Intelligent Response System
 */
class AIResponseEngine {
  constructor() {
    this.responseCache = new Map();
    this.contextMemory = [];
    this.maxCacheSize = 100;
  }

  // Generate AI Response
  async generateResponse(userMessage, context = {}) {
    try {
      // Check cache first
      const cacheKey = userMessage.toLowerCase().trim();
      if (this.responseCache.has(cacheKey)) {
        console.log('📦 Using cached response');
        return this.responseCache.get(cacheKey);
      }

      // Add to context memory
      this.contextMemory.push({
        userMessage: userMessage,
        timestamp: new Date(),
        context: context
      });

      // Process with AIAssistant API
      let response = AIAssistant.processQuery(userMessage);

      // Add smart suggestions if no specific match
      if (response.includes('سؤال جديد') || response.includes('لم أفهم')) {
        response += '\n\n💡 جرب أسئلة مثل:\n• "كيف أتعلم الحروف؟"\n• "ما هي المستويات؟"\n• "هل هناك اختبارات؟"';
      }

      // Cache response
      if (this.responseCache.size >= this.maxCacheSize) {
        const firstKey = this.responseCache.keys().next().value;
        this.responseCache.delete(firstKey);
      }
      this.responseCache.set(cacheKey, response);

      return response;
    } catch (error) {
      console.error('❌ AI Engine Error:', error);
      return 'عذراً، حدث خطأ. يرجى حاولة لاحقاً. 🤖';
    }
  }

  // Clear Cache
  clearCache() {
    this.responseCache.clear();
    this.contextMemory = [];
  }
}

/**
 * Global Chat Instance
 */
let chatManager = new ChatManager();
let aiEngine = new AIResponseEngine();

/**
 * Send Message Function - Main Handler (محسنة مع Supabase)
 */
async function sendMessage() {
  const msgInput = document.getElementById('msgInput');
  if (!msgInput) return;

  const message = msgInput.value.trim();
  if (!message) return;

  try {
    // Add user message
    await chatManager.addMessage(message, 'user');
    msgInput.value = '';

    // Show typing indicator
    await showTypingIndicator();

    // Get AI response
    const response = await aiEngine.generateResponse(message);
    
    // Remove typing indicator
    removeTypingIndicator();

    // Add bot message
    await chatManager.addMessage(response, 'bot', { 
      responseTime: new Date().getTime(),
      cached: false 
    });

  } catch (error) {
    console.error('❌ Send Message Error:', error);
    chatManager.addMessage('حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.', 'bot');
  }
}

/**
 * Typing Indicator
 */
async function showTypingIndicator() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;

  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message-pro bot loading';
  typingDiv.id = 'typing-indicator';
  
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  
  typingDiv.appendChild(bubble);
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const typingDiv = document.getElementById('typing-indicator');
  if (typingDiv) typingDiv.remove();
}

/**
 * AI Camera Function (with error handling)
 */
async function startAI() {
  try {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const output = document.getElementById('output');

    if (!video || !canvas) {
      console.error('❌ Video or Canvas element not found');
      return;
    }

    // Request camera permission
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240 }
    });

    video.srcObject = stream;
    output.textContent = '🎥 الكاميرا تعمل... في انتظار الإشارة...';

    // Initialize MediaPipe Hands
    if (typeof Hands !== 'undefined') {
      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(onHandsResults);

      const camera = new Camera(video, {
        onFrame: async () => {
          await hands.send({ image: video });
        },
        width: 320,
        height: 240,
      });

      camera.start();
      console.log('✅ AI Camera initialized successfully');
    } else {
      output.textContent = '⚠️ مكتبة MediaPipe غير محملة بنجاح';
    }

  } catch (error) {
    console.error('❌ Camera Error:', error);
    const output = document.getElementById('output');
    if (output) {
      output.textContent = '❌ خطأ: لم تتم الموافقة على الكاميرا. يرجى السماح بالوصول.';
    }
  }
}

/**
 * Stop AI Camera
 */
function stopAI() {
  try {
    const video = document.getElementById('video');
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
      const output = document.getElementById('output');
      if (output) {
        output.textContent = '⏹️ تم إيقاف الكاميرا';
      }
      console.log('✅ Camera stopped');
    }
  } catch (error) {
    console.error('❌ Error stopping camera:', error);
  }
}

/**
 * Handle Hand Detection Results
 */
function onHandsResults(results) {
  const canvas = document.getElementById('canvas');
  const output = document.getElementById('output');
  
  if (!canvas || !output) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    results.multiHandLandmarks.forEach((landmarks) => {
      // Draw hand landmarks
      landmarks.forEach((landmark, index) => {
        ctx.beginPath();
        ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#FF5733';
        ctx.fill();
      });
    });
    
    output.textContent = '✅ تم التقاط الإشارة! جاري التحليل...';
  } else {
    output.textContent = '⏳ في انتظار الإشارة...';
  }
}

/**
 * Save Chat to Supabase (Async)
 */
async function saveChatToSupabase(userMsg, botMsg) {
  try {
    if (typeof AIAssistant !== 'undefined') {
      await AIAssistant.saveMessage(userMsg, botMsg);
    }
  } catch (error) {
    console.warn('⚠️ Supabase save failed (non-critical):', error);
  }
}

/**
 * Export Statistics
 */
function exportChatStats() {
  const stats = chatManager.getStats();
  const statsText = `
📊 إحصائيات الدردشة
═══════════════════════
وقت الجلسة: ${new Date().toLocaleString('ar-EG')}
إجمالي الرسائل: ${stats.totalMessages}
رسائل الجلسة الحالية: ${stats.sessionMessages}
متوسط وقت الرد: ${stats.averageResponseTime}ms
آخر رسالة: ${stats.lastMessageTime ? new Date(stats.lastMessageTime).toLocaleString('ar-EG') : 'لا توجد'}
═══════════════════════
  `;
  
  alert(statsText);
}

/**
 * Initialize Chat on Page Load
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Chat System Initialized');
  
  // Load messages from Supabase
  if (chatManager) {
    chatManager.loadMessagesRealtime();
  }
  
  // Setup event listeners
  const msgInput = document.getElementById('msgInput');
  if (msgInput) {
    msgInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // Display initial greeting
  chatManager.addMessage('مرحباً! 👋 أنا مساعدك الذكي. اسأل عني عن تعلم لغة الإشارة، أو انضم إلى الحوار الجماعي! 🚀', 'bot');
  
  console.log('📊 Chat Statistics:', chatManager.getStats());
});

/**
 * Cleanup on Page Unload
 */
window.addEventListener('beforeunload', () => {
  console.log('💾 Saving session data...');
  // Auto-save any pending data
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ChatManager,
    AIResponseEngine,
    chatManager,
    aiEngine,
    sendMessage,
    startAI
  };
}
