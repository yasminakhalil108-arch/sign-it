/**
 * Sign It - مساعد لغة الإشارة الذكي المحسّن
 * 👋 كشف الإشارات وتحويلها إلى نصوص وأصوات V2.0
 */

// ===========================
// 1. المتغيرات العامة
// ===========================

// عناصر DOM
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gestureDisplay = document.getElementById('gestureDisplay');
const messagesBox = document.getElementById('messages');
const statusDiv = document.getElementById('status');
const suggestionPopup = document.getElementById('suggestionPopup');
const suggestionsBox = document.getElementById('suggestions');
const confidenceSpan = document.getElementById('confidence');

// أزرار التحكم
const toggleCameraBtn = document.getElementById('toggleCamera');
const speakBtn = document.getElementById('speakBtn');
const clearBtn = document.getElementById('clearBtn');

// متغيرات الحالة
let currentMode = 'sign-to-text';
let cameraActive = false;
let hands = null;
let lastGesture = '';
let gestureHistory = [];
let lastDetectionTime = 0;
const detectionDelay = 300;

// ===========================
// 2. قاموس الإشارات المدعومة
// ===========================

const gesturesDictionary = {
    'مرحبا': 'مرحبا',
    'توقف': 'توقف',
    'واحد': 'واحد',
    'اثنين': 'اثنين',
    'شكرا': 'شكرا لك',
    'أحسنت': 'أحسنت',
    'لا': 'لا',
    'حب': 'أنا أحبك'
};

// قائمة الاقتراحات
const allGestures = Object.keys(gesturesDictionary);

// ===========================
// 3. دالة التهيئة
// ===========================

window.addEventListener('load', async () => {
    console.log('🚀 جاري تحميل Sign It...');
    // لا نستدعي setupCamera هنا - ننتظر المستخدم يضغط على الزر
    await initializeMediaPipe();
    setupEventListeners();
    statusDiv.textContent = '👉 اضغط على "بدء الكاميرا" للبدء';
    console.log('✅ تم تحميل التطبيق بنجاح');
});

// ===========================
// 4. إدارة الأوضاع
// ===========================

function switchMode(mode) {
    currentMode = mode;
    
    // تحديث الأزرار
    document.getElementById('signToTextBtn').classList.toggle('active', mode === 'sign-to-text');
    document.getElementById('textToSpeechBtn').classList.toggle('active', mode === 'text-to-speech');
    
    // تحديث المحتوى
    document.getElementById('signToTextMode').classList.toggle('active', mode === 'sign-to-text');
    document.getElementById('textToSpeechMode').classList.toggle('active', mode === 'text-to-speech');
    
    // إيقاف الكاميرا عند التبديل للنص
    if (mode === 'text-to-speech' && cameraActive) {
        stopCamera();
    }
    
    console.log(`📌 تم التبديل إلى: ${mode}`);
}

// ===========================
// 5. إعداد الكاميرا
// ===========================

async function setupCamera() {
    try {
        statusDiv.textContent = '📷 جاري طلب إذن الكاميرا...';
        addMessage('📷 يرجى الموافقة على الوصول للكاميرا', 'bot');
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            },
            audio: false
        });
        
        video.srcObject = stream;
        
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            statusDiv.textContent = '✅ الكاميرا جاهزة - ابدأ بعمل الإشارات';
            cameraActive = true;
            toggleCameraBtn.textContent = '⏹️ إيقاف الكاميرا';
            addMessage('✅ الكاميرا جاهزة! ابدأ بعمل الإشارات أمام الكاميرا', 'bot');
            startDetection();
        };
        
    } catch (error) {
        console.error('❌ خطأ في الكاميرا:', error);
        
        if (error.name === 'NotAllowedError') {
            statusDiv.textContent = '❌ تم رفض الوصول للكاميرا';
            addMessage('⚠️ تم رفض إذن الكاميرا. يرجى السماح بالوصول في إعدادات المتصفح.', 'bot');
        } else if (error.name === 'NotFoundError') {
            statusDiv.textContent = '❌ لا توجد كاميرا متصلة';
            addMessage('❌ لم يتم العثور على كاميرا. تأكد من توصيل الكاميرا.', 'bot');
        } else if (error.name === 'NotReadableError') {
            statusDiv.textContent = '❌ الكاميرا قيد الاستخدام';
            addMessage('❌ الكاميرا قيد الاستخدام من قبل تطبيق آخر.', 'bot');
        } else {
            statusDiv.textContent = '❌ خطأ: ' + error.message;
            addMessage('❌ خطأ: ' + error.message, 'bot');
        }
    }
}

function stopCamera() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    cameraActive = false;
    toggleCameraBtn.textContent = '📷 بدء الكاميرا';
    statusDiv.textContent = '⏹️ الكاميرا متوقفة';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ===========================
// 6. إعداد MediaPipe
// ===========================

async function initializeMediaPipe() {
    try {
        statusDiv.textContent = '⏳ جاري تحميل نموذج الكشف...';
        
        hands = new window.Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        
        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        hands.onResults(onHandsDetected);
        console.log('✅ تم تحميل MediaPipe');
        
    } catch (error) {
        console.error('❌ خطأ في MediaPipe:', error);
        addMessage('خطأ في تحميل نموذج الكشف.', 'bot');
    }
}

// ===========================
// 7. الكشف عن الأيدي والإشارات المحسّن
// ===========================

function onHandsDetected(results) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const landmarks = results.multiHandLandmarks[i];
            drawLandmarks(landmarks);
            
            if (Date.now() - lastDetectionTime > detectionDelay) {
                detectGestureAdvanced(landmarks);
                lastDetectionTime = Date.now();
            }
        }
    } else {
        gestureDisplay.querySelector('.gesture-text').textContent = '--';
        confidenceSpan.textContent = '0%';
        statusDiv.textContent = '👁️ انتظر...';
    }
}

function drawLandmarks(landmarks) {
    const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20]
    ];
    
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    for (const [start, end] of connections) {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];
        ctx.beginPath();
        ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
        ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
        ctx.stroke();
    }
    
    ctx.fillStyle = '#FF0000';
    for (const landmark of landmarks) {
        ctx.beginPath();
        ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
}

/**
 * الكشف المحسّن عن الإشارات مع 8 إشارات جديدة
 */
function detectGestureAdvanced(landmarks) {
    const palmRadius = calculateDistance(landmarks[0], landmarks[9]);
    
    // قياس مواضع الأصابع
    const thumbOpen = calculateDistance(landmarks[4], landmarks[3]) > palmRadius * 0.3;
    const indexOpen = calculateDistance(landmarks[8], landmarks[6]) > palmRadius * 0.3;
    const middleOpen = calculateDistance(landmarks[12], landmarks[10]) > palmRadius * 0.3;
    const ringOpen = calculateDistance(landmarks[16], landmarks[14]) > palmRadius * 0.3;
    const pinkyOpen = calculateDistance(landmarks[20], landmarks[18]) > palmRadius * 0.3;
    
    // قياس ارتفاع الأصابع (للكشف عن الأيدي المرفوعة)
    const indexHeight = landmarks[8].y - landmarks[6].y;
    const middleHeight = landmarks[12].y - landmarks[10].y;
    const thumbHeight = landmarks[4].y - landmarks[3].y;
    
    // قياس المسافة بين يدين (إذا كانت هناك يدان)
    const palmDistance = calculateDistance(landmarks[5], landmarks[17]);
    
    const openFingers = [thumbOpen, indexOpen, middleOpen, ringOpen, pinkyOpen].filter(Boolean).length;
    
    let gesture = '';
    let confidence = 0;
    
    // الكشف المتقدم
    if (openFingers === 5) {
        gesture = 'مرحبا';
        confidence = 95;
    } 
    else if (openFingers === 0) {
        gesture = 'توقف';
        confidence = 90;
    } 
    else if (openFingers === 1 && indexOpen && !thumbOpen) {
        gesture = 'واحد';
        confidence = 85;
    } 
    else if (openFingers === 2 && indexOpen && middleOpen) {
        gesture = 'اثنين';
        confidence = 85;
    } 
    else if (indexOpen && middleOpen && !thumbOpen && !ringOpen && !pinkyOpen && indexHeight > 0.15 && middleHeight > 0.15) {
        gesture = 'لا';
        confidence = 80;
    } 
    else if (thumbOpen && indexOpen && (indexHeight > 0.1 && thumbHeight > 0.1)) {
        gesture = 'أحسنت';
        confidence = 82;
    } 
    else if (openFingers === 5 && indexHeight > 0.2 && middleHeight > 0.2) {
        gesture = 'شكرا';
        confidence = 80;
    } 
    else if (openFingers >= 3 && palmDistance < 0.3) {
        gesture = 'حب';
        confidence = 75;
    } 
    else {
        gesture = 'غير واضح';
        confidence = Math.max(40, 100 - openFingers * 15);
    }
    
    updateGestureDisplay(gesture, confidence);
}

function calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function updateGestureDisplay(gesture, confidence) {
    gestureDisplay.querySelector('.gesture-text').textContent = gesture;
    confidenceSpan.textContent = `${confidence}%`;
    statusDiv.textContent = `✅ ${gesture} (${confidence}%)`;
    
    if (gesture !== 'غير واضح' && gesture !== lastGesture && confidence > 70) {
        addMessage(gesture, 'user');
        gestureHistory.push(gesture);
        lastGesture = gesture;
        suggestionPopup.style.display = 'none';
    } 
    else if (confidence < 70 && gesture !== 'غير واضح') {
        showSuggestion(gesture, confidence);
    }
}

// ===========================
// 8. نظام الاقتراحات المحسّن
// ===========================

/**
 * عرض popup باقتراحات الإشارات
 */
function showSuggestion(gesture, confidence) {
    if (confidence < 50) {
        suggestionsBox.innerHTML = '';
        
        // عرض جميع الخيارات
        allGestures.forEach(g => {
            const btn = document.createElement('button');
            btn.textContent = g;
            btn.onclick = () => selectGesture(g);
            suggestionsBox.appendChild(btn);
        });
        
        suggestionPopup.style.display = 'block';
    } else {
        // عرض الاقتراح الأطول
        suggestionsBox.innerHTML = '';
        allGestures.slice(0, 3).forEach(g => {
            const btn = document.createElement('button');
            btn.textContent = g;
            btn.onclick = () => selectGesture(g);
            suggestionsBox.appendChild(btn);
        });
        
        suggestionPopup.style.display = 'block';
    }
}

function selectGesture(gesture) {
    lastGesture = gesture;
    gestureDisplay.querySelector('.gesture-text').textContent = gesture;
    confidenceSpan.textContent = '100%';
    addMessage(gesture, 'user');
    gestureHistory.push(gesture);
    closeSuggestion();
}

function closeSuggestion() {
    suggestionPopup.style.display = 'none';
}

// ===========================
// 9. إدارة الرسائل
// ===========================

function addMessage(text, type = 'user') {
    try {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        if (messagesBox) {
            messagesBox.appendChild(message);
            messagesBox.scrollTop = messagesBox.scrollHeight;
        } else {
            console.warn('⚠️ messagesBox غير موجود بعد');
        }
    } catch (e) {
        console.error('خطأ في إضافة الرسالة:', e);
    }
}

function clearHistory() {
    messagesBox.innerHTML = '';
    gestureHistory = [];
    lastGesture = '';
    addMessage('تم مسح السجل ✓', 'bot');
}

// ===========================
// 10. تحويل النص إلى كلام (TTS) المحسّن
// ===========================

function speakText() {
    if (gestureHistory.length === 0) {
        alert('لا توجد إشارات للنطق');
        return;
    }
    
    const textToSpeak = gestureHistory.join(' ');
    speakWithSettings(textToSpeak);
}

function speakCustomText() {
    const textInput = document.getElementById('textInput');
    if (textInput.value.trim() === '') {
        alert('الرجاء إدخال نص');
        return;
    }
    
    speakWithSettings(textInput.value);
}

function speakExample(text) {
    speakWithSettings(text);
}

function speakWithSettings(text) {
    const speed = parseFloat(document.getElementById('speed')?.value || 1);
    const pitch = parseFloat(document.getElementById('pitch')?.value || 1);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = speed;
    utterance.pitch = pitch;
    utterance.volume = 1;
    
    utterance.onstart = () => {
        speakBtn.disabled = true;
        speakBtn.textContent = '🔊 جاري النطق...';
    };
    
    utterance.onend = () => {
        speakBtn.disabled = false;
        speakBtn.textContent = '🔊 نطق النص';
    };
    
    utterance.onerror = () => {
        speakBtn.disabled = false;
        speakBtn.textContent = '🔊 نطق النص';
        alert('حدث خطأ في النطق');
    };
    
    window.speechSynthesis.speak(utterance);
    addMessage(`📢 ${text}`, 'bot');
}

function stopSpeech() {
    window.speechSynthesis.cancel();
}

// ===========================
// 11. ربط الأحداث
// ===========================

function setupEventListeners() {
    // الكاميرا
    toggleCameraBtn.addEventListener('click', () => {
        if (cameraActive) {
            stopCamera();
        } else {
            setupCamera();
        }
    });
    
    // النطق
    speakBtn.addEventListener('click', speakText);
    clearBtn.addEventListener('click', clearHistory);
    
    // مراقب السرعة والتردد
    document.getElementById('speed')?.addEventListener('input', (e) => {
        document.getElementById('speedValue').textContent = e.target.value + 'x';
    });
    
    document.getElementById('pitch')?.addEventListener('input', (e) => {
        document.getElementById('pitchValue').textContent = e.target.value + 'x';
    });
}

// ===========================
// 12. بدء كشف الإشارات
// ===========================

async function startDetection() {
    const send = async () => {
        if (cameraActive && hands) {
            await hands.send({ image: video });
        }
        requestAnimationFrame(send);
    };
    send();
}

console.log(`
╔════════════════════════════════════════╗
║     👋 Sign It V2.0 - محسّن          ║
║  اكتشف الإشارات وحولها إلى أصوات  ║
╚════════════════════════════════════════╝
`);
