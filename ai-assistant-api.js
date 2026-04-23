// ============================================
// Sign It AI Assistant API Module
// ============================================

const AIAssistant = {
  // Supabase Configuration
  supabase: {
    url: 'https://vpwpafsqmnuogsoivfid.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwd3BhZnNxbW51b2dzb2l2ZmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjQ0ODIsImV4cCI6MjA5MTUwMDQ4Mn0.RnnPZ4hc_0S7Nhx-Y9HE0dVW-Hs-wP56ISeF9BUeMtA',
    anonKey: 'sb_publishable_czLmoVxAx2t8EI8nr68QCQ_vqRjcrnt'
  },

  // Enhanced AI Response Database
  responseDatabase: {
    // أسئلة عن التعلم والدروس
    'تعلم': {
      'كيف أتعلم': 'يمكنك تعلم لغة الإشارة من خلال مختبر التعلم! ابدأ بالمستوى الأول ومارس يومياً. 📚',
      'متى أبدأ': 'يمكنك البدء الآن! اضغط على "ابدأ التعلم" واختر المستوى المناسب. 🚀',
      'كم يستغرق': 'تعتمد على تركيزك، لكن عادة 3-6 أشهر للوصول للمستوى المتقدم! ⏱️',
      'ما الفائدة': 'تعلم لغة الإشارة يساعدك على التواصل مع الصم والمساهمة في المجتمع! 🌟'
    },
    'حروف': {
      'كيف أتعلم الحروف': 'كل حرف له حركة يد خاصة. ابدأ بحرف واحد يومياً وكرره 20 مرة! 🔤',
      'هل الحروف صعبة': 'لا، الحروف الأساسية سهلة جداً! الممارسة تجعلها أسهل وأسهل! 💪',
      'كم عدد الحروف': 'الأبجدية العربية تشمل 28 حرف. ستتعلمها جميعاً في المستوى الأول! ✅'
    },
    'أرقام': {
      'كيف أتعلم الأرقام': 'الأرقام في الإشارة تمثل بعدد الأصابع المرفوعة. من 1-5 سهل جداً! 🔢',
      'ما بعد 5': 'من 6-10 نستخدم حركات إضافية. شاهد دروس المستوى الثاني! 📖',
      'الأرقام الكبيرة': 'العشرات والمئات لها إشارات خاصة. تعلمها في المستوى الثاني والثالث! 📊'
    },
    'اختبار': {
      'هل هناك اختبارات': 'نعم! اختبارات شاملة لكل مستوى! 📝',
      'كيف أختبر نفسي': 'اذهب إلى صفحة الاختبارات واختر المستوى الذي تريد! 🎯',
      'هل النتائج تحفظ': 'نعماً! نحفظ تقدمك ويمكنك متابعة إحصائياتك! 📊'
    },
    // أسئلة عن الخدمات والمساعدة
    'مساعدة': {
      'كيف أطلب المساعدة': 'يمكنك استخدام هذا الصندوق، أو زيارة قسم الصحة النفسية! 🆘',
      'ما الخدمات': 'لدينا: دروس، قاموس، اختبارات، مساعد ذكي، ودعم نفسي! 🎉',
      'هل متاح 24/7': 'المساعد الذكي متاح 24/7! 🤖'
    },
    'طوارئ': {
      'ما الطوارئ': 'خدمة SOS لحالات طارئة. اضغط على الزر الأحمر في الموقع! 🚨',
      'متى أستخدمها': 'عند الحاجة لمساعدة فورية في حالات طارئة! ⚠️'
    },
    // أسئلة عامة
    'عام': {
      'من انتم': 'نحن فريق من طلاب جامعة بنها قسم إعداد معلم حاسب! 👥',
      'ما الهدف': 'مساعدة الصم والبكم والأشخاص ذوي الاحتياجات الخاصة! 🤝',
      'هل مجاني': 'نعم! التطبيق مجاني 100%! 🎁',
      'كيف أبلغ عن خطأ': 'اتصل بنا من خلال قسم الصحة النفسية! 📞'
    }
  },

  // Initialize Session
  initSession() {
    let sessionId = localStorage.getItem('aiSessionId');
    if (!sessionId) {
      sessionId = this.generateId();
      localStorage.setItem('aiSessionId', sessionId);
    }
    return sessionId;
  },

  // Generate Unique ID
  generateId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Process User Query
  processQuery(userMessage) {
    userMessage = userMessage.toLowerCase().trim();
    
    // Search in database
    for (let category in this.responseDatabase) {
      for (let key in this.responseDatabase[category]) {
        if (userMessage.includes(key)) {
          return this.responseDatabase[category][key];
        }
      }
    }
    
    // Smart suggestions
    const suggestions = [
      'سؤال ذكي! 💡 جرب: "كيف أتعلم الحروف" أو "ما هي الخدمات"',
      'أنا هنا للمساعدة! 🤖 اسأل عن: "المستويات"، "الاختبارات"، و"المزايا"',
      'لم أفهم تماماً، لكن يمكنك محاولة: "كيف أبدأ التعلم"',
      'هذا سؤال جديد! 🤔 يمكنك زيارة المختبر للعثور على إجابة أفضل! 📚',
      'لا تقلق! 😊 جميع الأسئلة مهمة. اسأل عن أي مستوى من المستويات الثلاثة!'
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  },

  // Save Message to Database (with API integration)
  async saveMessage(userMessage, botResponse) {
    try {
      const messageData = {
        user_message: userMessage,
        bot_response: botResponse,
        timestamp: new Date().toISOString(),
        session_id: this.initSession(),
        user_language: localStorage.getItem('preferredLanguage') || 'ar'
      };

      // Log instead of making actual API call for now
      console.log('💾 Saved message:', messageData);

      // Uncomment for real Supabase integration:
      /*
      const response = await fetch(`${this.supabase.url}/rest/v1/chat_messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabase.key}`,
          'apikey': this.supabase.key,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      */

      return messageData;
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  },

  // Get User Statistics
  async getUserStats() {
    try {
      const sessionId = this.initSession();
      
      // For now, return mock data
      return {
        totalMessages: localStorage.getItem('totalMessages') || 0,
        sessionMessages: localStorage.getItem('sessionMessages') || 0,
        topicsMastered: localStorage.getItem('topicsMastered') || [],
        lastActive: new Date().toISOString()
      };

      /* Uncomment for real Supabase integration:
      const response = await fetch(
        `${this.supabase.url}/rest/v1/user_stats?session_id=eq.${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.supabase.key}`,
            'apikey': this.supabase.key
          }
        }
      );
      return await response.json();
      */
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      return null;
    }
  },

  // Log Chat Event
  logEvent(eventType, eventData) {
    const event = {
      type: eventType,
      data: eventData,
      timestamp: new Date().toISOString(),
      sessionId: this.initSession()
    };
    
    console.log(`📊 Event: ${eventType}`, event);
    
    // Store in localStorage for analytics
    let events = JSON.parse(localStorage.getItem('chatEvents') || '[]');
    events.push(event);
    localStorage.setItem('chatEvents', JSON.stringify(events.slice(-100))); // Keep last 100 events
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIAssistant;
}
