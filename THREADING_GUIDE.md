# تطبيق نظام الرسائل والخيوط - دليل التطبيق الكامل

## خطوات التطبيق

### 1️⃣ إنشاء قاعدة البيانات في Supabase

1. اذهب إلى **Supabase Dashboard**
2. اختر مشروعك
3. اذهب إلى **SQL Editor**
4. انسخ محتوى ملف `schema.sql` بالكامل
5. اضغط **Execute**

✅ هذا سينشئ:
- جدول `threads` (الخيوط/المحادثات)
- جدول `thread_members` (أعضاء الخيط)
- جدول `messages` (الرسائل)
- جدول `message_summaries` (التلخيصات)
- RLS Policies (سياسات الأمان)
- Indexes (للأداء السريع)

---

### 2️⃣ تثبيت Edge Function

#### الطريقة A: عبر CLI (أسهل)

```bash
# 1. ثبت Supabase CLI إذا لم يكن مثبتاً
npm install -g supabase

# 2. ادخل مشروعك
cd c:\Users\DELL\Downloads\مشروع التخرج\knowledge-hub.html

# 3. اربط مع Supabase
supabase link --project-ref vpwpafsqmnuogsoivfid

# 4. اضغط Deploy لـ Edge Function
supabase functions deploy summarize-thread-openai --no-verify
```

#### الطريقة B: عبر Dashboard

1. اذهب إلى **Edge Functions** في Supabase Dashboard
2. اضغط **Create a new function**
3. سمّه: `summarize-thread-openai`
4. اختر: **TypeScript**
5. انسخ محتوى ملف `supabase/functions/summarize-thread-openai/index.ts`
6. اضغط **Deploy**

---

### 3️⃣ إضافة Secrets (مهم جداً)

اذهب إلى **Edge Functions → Secrets** في Supabase:

أضف هذا:
```
OPENAI_API_KEY = sk-xxxx... (your OpenAI API key)
OPENAI_MODEL = gpt-4o-mini (اختياري)
```

للحصول على OpenAI API Key:
1. اذهب إلى https://platform.openai.com/api-keys
2. اضغط **Create new secret key**
3. انسخ الـ key
4. اضفه إلى Supabase Secrets

---

### 4️⃣ إضافة Scripts للـ HTML

أضف هذين السطرين في ملف `ai-assistant.html` (قبل `</head>`):

```html
<!-- Thread Manager -->
<script src="thread-manager.js"></script>
```

---

### 5️⃣ استخدام النظام في JavaScript

#### إنشاء محادثة جديدة

```javascript
// 1:1 chat (مستخدم واحد + AI)
const thread = await threadManager.createThread(
  'درس لغة الإشارة - الموضوع 1',
  'محادثة فريدة بين الطالب والمساعد الذكي',
  'individual'
)

// أو مجموعة نقاش
const groupThread = await threadManager.createThread(
  'مجموعة - تعليم لغة الإشارة',
  'نقاش جماعي',
  'group',
  ['user_id_1', 'user_id_2'] // أعضاء إضافيين
)
```

#### إرسال رسالة

```javascript
await threadManager.sendMessage(thread.id, 'مرحباً، أريد أن تعلمني حروف الإشارة')
```

#### الاستماع للرسائل الجديدة (Real-time)

```javascript
const subscription = threadManager.subscribeToMessages(thread.id, (newMessage) => {
  console.log('رسالة جديدة:', newMessage.content)
  // ✨ حدّث الـ UI مباشرة
})
```

#### الحصول على جميع الرسائل

```javascript
const messages = await threadManager.getThreadMessages(thread.id)
console.log(messages)
```

#### توليد تلخيص ذكي

```javascript
// تلخيص عام
await threadManager.generateSummary(thread.id, 'general')

// تركيز على التعلم
await threadManager.generateSummary(thread.id, 'learning')

// تركيز على التقدم
await threadManager.generateSummary(thread.id, 'progress')

// تركيز على المجالات المطلوب تحسينها
await threadManager.generateSummary(thread.id, 'areas_to_improve')
```

#### الحصول على التلخيصات

```javascript
const summaries = await threadManager.getThreadSummaries(thread.id)
summaries.forEach(summary => {
  console.log('📋 التلخيص:', summary.summary)
  console.log('🎯 النقاط الرئيسية:', summary.key_points)
})
```

#### الحصول على جميع الخيوط

```javascript
const myThreads = await threadManager.getUserThreads()
console.log('خيوطي:', myThreads)
```

---

## مثال عملي كامل

```javascript
// 1. إنشاء محادثة
const thread = await threadManager.createThread(
  'درس - الأرقام من 1 إلى 10',
  'تعلم الأرقام باستخدام لغة الإشارة'
)

// 2. إرسال سؤال
await threadManager.sendMessage(thread.id, 'كيف أقول رقم 5 بلغة الإشارة؟')

// 3. قراءة الرسائل (في الـ backend ستصل الإجابة)
// بعد وصول الرد من الذكاء الاصطناعي
const messages = await threadManager.getThreadMessages(thread.id)

// 4. توليد تلخيص بعد انتهاء الدرس
await threadManager.generateSummary(thread.id, 'learning')

// 5. قراءة التلخيص
const summaries = await threadManager.getThreadSummaries(thread.id)
console.log(summaries[0].summary) // 📋 التلخيص
```

---

## البنية النهائية

```
knowledge-hub.html/
├── schema.sql                              ← SQL queries (قاعدة البيانات)
├── thread-manager.js                       ← JavaScript manager
├── supabase/
│   └── functions/
│       └── summarize-thread-openai/
│           └── index.ts                    ← Edge Function
├── ai-assistant.html                       ← إضافة thread-manager.js
└── ...
```

---

## أنواع الـ Focus Areas للتلخيص

| Focus Area | الوصف |
|-----------|-------|
| `general` | تلخيص عام ومتوازن |
| `learning` | التركيز على ما تم تعلمه والمفاهيم الأساسية |
| `progress` | التركيز على التقدم والتحسن |
| `areas_to_improve` | التركيز على المجالات المطلوبة تحسين فيها |

---

## معلومات مهمة

✅ **التلخيصات شخصية**: كل مستخدم يحصل على تلخيصه الخاص  
✅ **Real-time**: الرسائل تصل فوراً لجميع الأعضاء  
✅ **آمن**: RLS يحمي البيانات  
✅ **مرن**: يدعم محادثات فردية وجماعية  

---

## استكشاف الأخطاء

#### الخطأ: "Missing env var: OPENAI_API_KEY"
**الحل**: أضف الـ secret في Supabase Secrets

#### الخطأ: "Invalid auth"
**الحل**: تأكد من تسجيل الدخول قبل إنشاء محادثة

#### الخطأ: "No messages found"
**الحل**: أضف رسائل قبل محاولة التلخيص

---

## أسئلة شائعة

**س: كيف أصنع محادثة بين طالب والـ AI؟**  
ج: استخدم `createThread` مع `threadType: 'individual'`

**س: هل يمكن لمستخدمين متعددين أن يروا نفس التلخيص؟**  
ج: لا، كل مستخدم يحصل على تلخيصه الخاص (personalized)

**س: كيف أحذف رسالة؟**  
ج: استخدم `threadManager.deleteMessage(messageId)`

---

هل تريد ساعدة إضافية في التطبيق؟ 🚀
