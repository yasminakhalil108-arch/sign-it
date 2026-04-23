# 🤖 Sign It AI Assistant API - Documentation

## نظرة عامة

مساعد ذكي متكامل يوفر دردشة تفاعلية وإجابات ذكية حول تعلم لغة الإشارة مع دعم Supabase.

---

## 📋 الميزات الرئيسية

✅ **دردشة تفاعلية** - محادثات فورية مع المساعد الذكي
✅ **قاعدة بيانات ذكية** - إجابات منظمة حسب الفئات
✅ **Supabase Integration** - حفظ وتخزين البيانات
✅ **تسجيل الأحداث** - تتبع تفاعلات المستخدم
✅ **إدارة جلسات** - تتبع جلسات المستخدمين الفردية
✅ **MediaPipe Support** - كشف الحركات والإشارات

---

## 🔐 بيانات الاتصال بـ Supabase

```javascript
Supabase URL: https://akvfeyaecyjitnsdc jks.supabase.co
API Key (Anon): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Publishable Key: sb_publishable_czLmoVxAx2t8EI8nr68QCQ_vqRjcrnt
```

---

## 📚 الدوال الرئيسية

### 1. `AIAssistant.initSession()`
```javascript
// إنشاء أو استرجاع معرف الجلسة
const sessionId = AIAssistant.initSession();
```

### 2. `AIAssistant.processQuery(userMessage)`
```javascript
// معالجة سؤال المستخدم والحصول على إجابة ذكية
const response = AIAssistant.processQuery('كيف أتعلم الحروف');
// الإرجاع: يمكنك تعلم الحروف من خلال مختبر التعلم! ...
```

### 3. `AIAssistant.saveMessage(userMessage, botResponse)`
```javascript
// حفظ الرسائل في Supabase
await AIAssistant.saveMessage('سؤالي', 'الإجابة');
```

### 4. `AIAssistant.getUserStats()`
```javascript
// الحصول على إحصائيات المستخدم
const stats = await AIAssistant.getUserStats();
// { totalMessages, sessionMessages, topicsMastered, lastActive }
```

### 5. `AIAssistant.logEvent(eventType, eventData)`
```javascript
// تسجيل حدث معين
AIAssistant.logEvent('message_sent', { message: 'text' });
```

---

## 📂 قاعدة البيانات (Response Database)

تم تنظيم الإجابات في فئات:

### فئة التعلم والدروس
- `كيف أتعلم` - كيفية البدء
- `متى أبدأ` - متى تبدأ التعلم
- `كم يستغرق` - المدة المتوقعة
- `ما الفائدة` - فوائد التعلم

### فئة الحروف
- `كيف أتعلم الحروف` - شرح تعلم الحروف
- `هل الحروف صعبة` - مستوى الصعوبة
- `كم عدد الحروف` - عدد الحروف

### فئة الأرقام
- `كيف أتعلم الأرقام` - شرح الأرقام
- `ما بعد 5` - الأرقام الأعلى
- `الأرقام الكبيرة` - العشرات والمئات

### فئة الاختبارات
- `هل هناك اختبارات` - توفر الاختبارات
- `كيف أختبر نفسي` - كيفية الاختبار
- `هل النتائج تحفظ` - حفظ النتائج

### فئة المساعدة والخدمات
- `كيف أطلب المساعدة` - طلب الدعم
- `ما الخدمات` - الخدمات المتاحة
- `هل متاح 24/7` - توفر الدعم

### فئة الطوارئ
- `ما الطوارئ` - خدمة SOS
- `متى أستخدمها` - متى تستخدم SOS

### الأسئلة العامة
- `من انتم` - معلومات الفريق
- `ما الهدف` - هدف التطبيق
- `هل مجاني` - التكلفة
- `كيف أبلغ عن خطأ` - الإبلاغ عن الأخطاء

---

## 🛠️ طريقة الاستخدام

### إضافة الـ API إلى صفحتك

```html
<!-- في الـ HTML Head -->
<script src="ai-assistant-api.js"></script>
```

### استخدام الدالة الأساسية

```javascript
// 1. تهيئة الجلسة
AIAssistant.initSession();

// 2. معالجة السؤال
const userMessage = "كيف أتعلم الحروف";
const response = AIAssistant.processQuery(userMessage);

// 3. حفظ الرسالة
await AIAssistant.saveMessage(userMessage, response);

// 4. تسجيل الحدث
AIAssistant.logEvent('user_query', { query: userMessage });
```

---

## 🔌 تفعيل Supabase الفعلي

حالياً، الكود يحفظ البيانات في `localStorage` للتطوير.

لتفعيل Supabase الفعلي، قم بتعديل دالة `saveMessage()`:

```javascript
async saveMessage(userMessage, botResponse) {
  // قم بإلغاء التعليقات من الكود التالي:
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
}
```

---

## 📊 تخزين البيانات

### في localStorage
```javascript
// معرف الجلسة
localStorage.getItem('aiSessionId')

// أحداث الدردشة
localStorage.getItem('chatEvents')
```

---

## 🎯 أمثلة عملية

### مثال 1: مراقبة التفاعلات
```javascript
AIAssistant.logEvent('message_sent', {
  userMessage: 'كيف أبدأ؟',
  responseTime: 800,
  responseLength: 150
});
```

### مثال 2: إحصائيات المستخدم
```javascript
const stats = await AIAssistant.getUserStats();
console.log(stats);
// { totalMessages: 5, sessionMessages: 3, topicsMastered: [...], lastActive: "2024-04-11T..." }
```

### مثال 3: معالجة أسئلة متقدمة
```javascript
// البحث الذكي يدعم:
// 1. البحث المباشر: "كيف أتعلم"
// 2. البحث الجزئي: "تعلم" -> يبحث في جميع الإجابات التي تحتوي على "تعلم"
// 3. الإجابات العشوائية: إذا لم يجد تطابق
```

---

## 🔄 دورة حياة الرسالة

```
المستخدم يكتب رسالة
         ↓
AIAssistant.processQuery() - البحث الذكي
         ↓
العثور على الإجابة / إجابة افتراضية
         ↓
عرض الرسالة على الواجهة
         ↓
AIAssistant.saveMessage() - حفظ في Supabase
         ↓
AIAssistant.logEvent() - تسجيل الحدث
```

---

## ⚙️ الإعدادات المتقدمة

### تغيير معرف الجلسة
```javascript
// بدلاً من الاستخدام الافتراضي
localStorage.setItem('aiSessionId', 'custom_session_id');
```

### إضافة إجابات جديدة
```javascript
// أضف إجابات في ai-assistant-api.js
AIAssistant.responseDatabase['فئة جديدة'] = {
  'سؤال جديد': 'إجابة جديدة'
};
```

---

## 📝 الترجمة والعربية

الـ API بالكامل يدعم العربية:
- جميع الإجابات بالعربية
- معالجة النصوص العربية بذكاء
- دعم كامل للاتجاه من اليمين إلى اليسار

---

## 🐛 استكشاف الأخطاء

### الرسالة لا تظهر
- تأكد من أن `userInput` موجود في الـ HTML
- تحقق من وجود `chatMessages` div

### الإجابة غير صحيحة
- أضف سؤالك إلى قاعدة البيانات
- تحقق من البحث الجزئي في `processQuery()`

### عدم حفظ البيانات
- تفعيل Supabase الفعلي (انظر الأعلى)
- تحقق من console للأخطاء

---

## 📞 الدعم والمساعدة

للمزيد من المعلومات أو الإبلاغ عن مشاكل:
- قم بزيارة قسم الصحة النفسية
- استخدم خدمة SOS الطوارئ
- راسلنا عبر البريد الإلكتروني

---

**آخر تحديث:** أبريل 2024 | **الإصدار:** 1.0
