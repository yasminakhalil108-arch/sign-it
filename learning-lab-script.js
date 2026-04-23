// ===========================
// Learning Lab System
// ===========================

// DOM Elements
const levelSelectionView = document.getElementById('level-selection');
const lessonView = document.getElementById('lesson-view');
const quizView = document.getElementById('quiz-view');
const resultsView = document.getElementById('results-view');
const levelQuizView = document.getElementById('level-quiz-view');
const levelCompleteView = document.getElementById('level-complete-view');

const currentLevelTitle = document.getElementById('current-level-title');
const lessonCounter = document.getElementById('lesson-counter');
const lessonProgressFill = document.getElementById('lesson-progress-fill');
const lessonProgressText = document.getElementById('lesson-progress-text');
const lessonContent = document.getElementById('lesson-content');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const achievementToast = document.getElementById('achievement-toast');
const toastMessage = document.getElementById('toast-message');

// Progress bars
const miniProgressFill = document.getElementById('mini-progress-fill');
const overallProgressText = document.getElementById('overall-progress-text');

// State Management
let currentLevel = 1;
let currentLessonIndex = 0;
let currentQuizType = 'lesson'; // 'lesson' or 'level'
let quizAnswers = {};
let levelStartTime = 0;

// Level Data
const levelsData = {
    1: {
        title: 'المستوى الأول: الحروف',
        lessons: [
            {
                id: 'l1-1',
                title: 'الحروف من أ إلى ज',
                content: `
                    <h3>تعلم الحروف الأساسية</h3>
                    <p>بدء التعلم برفع يدك بحركات بسيطة لتشكيل كل حرف من حروف الأبجدية.</p>
                    
                    <h3>الحروف:</h3>
                    <ul>
                        <li><strong>أ:</strong> اليد المفتوحة مع الإبهام للأعلى</li>
                        <li><strong>ب:</strong> قبضة يد مع إصبع السبابة مرفوع</li>
                        <li><strong>ت:</strong> إصبع السبابة والوسطى معاً</li>
                        <li><strong>ث:</strong> اليد بشكل مثلث</li>
                        <li><strong>ج:</strong> اليد المغلقة مع حركة دائرية</li>
                        <li><strong>ح:</strong> اليد المفتوحة مع حركة صغيرة</li>
                    </ul>

                    <div class="content-highlight">
                        <strong>💡 نصيحة:</strong> مارس كل حرف 10 مرات أمام المرآة.
                    </div>
                `
            },
            {
                id: 'l1-2',
                title: 'الحروف من ح إلى ص',
                content: `
                    <h3>استكمال الحروف</h3>
                    <p>تابع تعلم حروف جديدة بنفس الطريقة.</p>

                    <h3>الحروف:</h3>
                    <ul>
                        <li><strong>ح:</strong> اليد المفتوحة مع حركة</li>
                        <li><strong>خ:</strong> اليد المقفولة مع الإبهام للخارج</li>
                        <li><strong>د:</strong> إصبع السبابة فقط</li>
                        <li><strong>ذ:</strong> إصبعان معاً بشكل V</li>
                        <li><strong>ر:</strong> حركة دوران بالإصبع</li>
                        <li><strong>ز:</strong> حركة زجزاج</li>
                    </ul>

                    <div class="content-highlight">
                        <strong>✅ ممارسة:</strong> اكتب جملة واحدة وهجها بلغة الإشارة.
                    </div>
                `
            },
            {
                id: 'l1-3',
                title: 'الحروف من ص إلى ي',
                content: `
                    <h3>إكمال الحروف الأخيرة</h3>
                    <p>الآن نتعلم الحروف المتبقية من الأبجدية.</p>

                    <h3>الحروف:</h3>
                    <ul>
                        <li><strong>ص:</strong> الأصابع الخمسة معاً</li>
                        <li><strong>ض:</strong> أصابع مع حركة صغيرة</li>
                        <li><strong>ط:</strong> اليد بشكل يشبه P</li>
                        <li><strong>ظ:</strong> اليد بشكل مشابه مع حركة</li>
                        <li><strong>ع:</strong> دوران الأصابع</li>
                        <li><strong>غ:</strong> أصابع ملتصقة</li>
                    </ul>

                    <div class="content-highlight">
                        <strong>🎯 التمرين:</strong> اكتب اسمك وهجه بحروف الإشارة.
                    </div>
                `
            },
            {
                id: 'l1-4',
                title: 'الحروف الباء والياء والفاء والقاف والكاف واللام والميم والنون والهاء والواو',
                content: `
                    <h3>الحروف الأخيرة من الأبجدية</h3>
                    <p>نهاية الحروف - اتقنها واحفظها جيداً.</p>

                    <h3>الحروف:</h3>
                    <ul>
                        <li><strong>ف:</strong> يدا V مع حركة</li>
                        <li><strong>ق:</strong> قبضة مع حركة</li>
                        <li><strong>ك:</strong> إصبعان بشكل V</li>
                        <li><strong>ل:</strong> إصبع السبابة لأعلى</li>
                        <li><strong>م:</strong> اليد المفتوحة على الفم</li>
                        <li><strong>ن:</strong> إصبعان معاً</li>
                    </ul>

                    <div class="content-highlight">
                        <strong>✅ الهدف النهائي:</strong> احفظ جميع الحروف وهجج كلمات كاملة!
                    </div>

                    <h3>التحديات الشائعة:</h3>
                    <ul>
                        <li>📌 الإرهاق من الممارسة المفرطة → الحل: خذ فترات راحة</li>
                        <li>📌 عدم الثقة بالتقدم → الحل: احتفظ بسجل للتقدم</li>
                        <li>📌 الخجل من الممارسة مع الآخرين → الحل: ابدأ مع أصدقاء مقربين</li>
                        <li>📌 عدم الانسجام بين اليدين → الحل: مارس كل يد على حدة</li>
                    </ul>
                `
            }
        ],
        quiz: [
            {
                question: 'أي من التالي يصحح شكل الحرف ك؟',
                options: [
                    'اليد المفتوحة على الفم',
                    'إصبعان بشكل V',
                    'قبضة مع حركة',
                    'إصبع السبابة فقط'
                ],
                correct: 1
            },
            {
                question: 'كم عدد الحروف في الأبجدية العربية؟',
                options: [
                    '20 حرف',
                    '25 حرف',
                    '28 حرف',
                    '30 حرف'
                ],
                correct: 2
            },
            {
                question: 'كيف تهجي اسمك بلغة الإشارة؟',
                options: [
                    'باستخدام إشارة واحدة فقط',
                    'بتشكيل كل حرف من حروف الاسم',
                    'باستخدام إشارات كاملة فقط',
                    'لا يمكن تهجية الأسماء'
                ],
                correct: 1
            },
            {
                question: 'أين يجب أن تمارس الحروف؟',
                options: [
                    'في الأماكن العامة فقط',
                    'أمام المرآة للتحقق من صحتك',
                    'بمفردك في الظلام',
                    'مع أشخاص غرباء فقط'
                ],
                correct: 1
            }
        ]
    },
    2: {
        title: 'المستوى الثاني: الأرقام',
        lessons: [
            {
                id: 'l2-1',
                title: 'الأرقام من 1 إلى 5',
                content: `
                    <h3>تعلم الأرقام الأساسية</h3>
                    <p>الأرقام في لغة الإشارة تستخدم أصابع اليد لتمثيل القيم.</p>

                    <h3>الأرقام:</h3>
                    <ul>
                        <li><strong>1:</strong> إصبع واحد (السبابة)</li>
                        <li><strong>2:</strong> إصبعان (السبابة والوسطى)</li>
                        <li><strong>3:</strong> ثلاثة أصابع (السبابة والوسطى والبنصر)</li>
                        <li><strong>4:</strong> أربعة أصابع (بدون الإبهام)</li>
                        <li><strong>5:</strong> خمسة أصابع (كف مفتوحة)</li>
                    </ul>

                    <div class="content-highlight">
                        <strong>💡 تطبيق:</strong> أشر إلى أصابعك وقل الأرقام!
                    </div>
                `
            },
            {
                id: 'l2-2',
                title: 'الأرقام من 6 إلى 10',
                content: `
                    <h3>الأرقام الأعلى</h3>
                    <p>الأرقام من 6 إلى 10 تستخدم حركات إضافية.</p>

                    <h3>الأرقام:</h3>
                    <ul>
                        <li><strong>6:</strong> كف مفتوحة + إبهام الجانب</li>
                        <li><strong>7:</strong> حركة دوران بإصبعين</li>
                        <li><strong>8:</strong> يدان تشكلان 8</li>
                        <li><strong>9:</strong> إصبع واحد مرفوع مع حركة دائرية</li>
                        <li><strong>10:</strong> كف مفتوحة ثم قبضة مع حركة</li>
                    </ul>

                    <div class="content-highlight">
                        <strong>✅ التمرين:</strong> عد من 1 إلى 10 بلغة الإشارة!
                    </div>
                `
            },
            {
                id: 'l2-3',
                title: 'الأرقام العشرات والمئات',
                content: `
                    <h3>الأرقام الأكبر</h3>
                    <p>العشرات والمئات لها إشارات خاصة.</p>

                    <h3>الأرقام:</h3>
                    <ul>
                        <li><strong>20:</strong> إشارة 2 + حركة العشرات</li>
                        <li><strong>30:</strong> إشارة 3 + حركة العشرات</li>
                        <li><strong>100:</strong> إشارة الباء مع حركة دائرية</li>
                        <li><strong>1000:</strong> إشارة خاصة للألف</li>
                    </ul>

                    <div class="content-highlight">
                        <strong>🎯 التطبيق:</strong> أخبر شخص عن سنة ميلادك باستخدام الأرقام!
                    </div>
                `
            },
            {
                id: 'l2-4',
                title: 'الأرقام في السياقات اليومية',
                content: `
                    <h3>استخدام الأرقام بطريقة عملية</h3>
                    <p>تعلم استخدام الأرقام في الحياة اليومية.</p>

                    <h3>السياقات الشائعة:</h3>
                    <ul>
                        <li>🕐 الوقت: "الساعة 3 صباحاً"</li>
                        <li>📅 التواريخ: "21 ديسمبر 2023"</li>
                        <li>💰 الأسعار: "100 جنيه"</li>
                        <li>📞 الهاتف: "رقم الهاتف 123456789"</li>
                        <li>👥 العدد: "هناك 5 أشخاص"</li>
                    </ul>

                    <div class="content-highlight">
                        <strong>✅ النهاية:</strong> أتقنت الأرقام! الآن جرب المستوى الثالث!
                    </div>
                `
            }
        ],
        quiz: [
            {
                question: 'كم إصبع يشار في الرقم 3؟',
                options: [
                    'إصبع واحد',
                    'إصبعان',
                    'ثلاثة أصابع',
                    'أربعة أصابع'
                ],
                correct: 2
            },
            {
                question: 'كيف تشير إلى الرقم 5؟',
                options: [
                    'قبضة مغلقة',
                    'كف مفتوحة',
                    'إصبع واحد فقط',
                    'إصبعان'
                ],
                correct: 1
            },
            {
                question: 'ماذا تعني حركة العشرات؟',
                options: [
                    'تضرب اليد على الطاولة',
                    'حركة خاصة لتمثيل العشرات',
                    'لا معنى لها',
                    'حركة عشوائية'
                ],
                correct: 1
            },
            {
                question: 'كيف تقول الوقت 15:30 بلغة الإشارة؟',
                options: [
                    'الرقم 15 فقط',
                    'إشارة الوقت ثم الأرقام',
                    'بترديد الرقم',
                    'غير ممكن'
                ],
                correct: 1
            }
        ]
    },
    3: {
        title: 'المستوى الثالث: متقدم جداً',
        lessons: [
            {
                id: 'l3-1',
                title: 'الإشارات المعقدة والتراكيب المتقدمة',
                content: `
                    <h3>تطور اللغة: من البسيط إلى المعقد</h3>
                    <p>في هذا المستوى، سنتعامل مع تراكيب أكثر تعقيداً تتضمن معاني مجازية وتعبيرات معقدة.</p>

                    <h3>الإشارات المركبة والمشتقات:</h3>
                    <ul>
                        <li><strong>المشتقات:</strong> تغيير الإشارة الأساسية بإضافة حركات إضافية</li>
                        <li><strong>الإشارات المرسومة:</strong> رسم أشكال في الهواء للدلالة على الأشياء</li>
                        <li><strong>الإشارات الموضعية:</strong> استخدام المساحة للتمييز بين الأفراد والمواقف</li>
                        <li><strong>الإشارات الجماعية:</strong> إشارات تشير إلى مجموعات بدلاً من الأفراد</li>
                    </ul>

                    <div class="content-highlight">
                        <strong>💡 المستوى المتقدم:</strong> البدء برؤية لغة الإشارة كفن لا كمجرد ترجمة.
                    </div>

                    <h3>أمثلة على تراكيب متقدمة:</h3>
                    <ul>
                        <li>"الآن أفهم أخيراً" - تزامن زمني مع تغيير في التعبيرات</li>
                        <li>"ذهبت إلى المتجر مع صديقي" - إشارات موضعية للأشخاص</li>
                        <li>"أنا أحب الطعام لذلك أطبخ كثيراً" - ربط السبب والنتيجة</li>
                    </ul>
                `
            },
            {
                id: 'l3-2',
                title: 'الإشارات المهنية والأكاديمية',
                content: `
                    <h3>لغة الإشارة في السياقات الرسمية</h3>
                    <p>سنتعلم كيفية استخدام لغة الإشارة في المواقف الاحترافية والأكاديمية.</p>

                    <h3>المجالات المهنية:</h3>
                    <ul>
                        <li><strong>الطب والصحة:</strong> إشارات محددة للأعراض والعلاجات</li>
                        <li><strong>القانون والعدل:</strong> مصطلحات قانونية بلغة الإشارة</li>
                        <li><strong>التعليم:</strong> إشارات للمفاهيم الأكاديمية</li>
                        <li><strong>التجارة والأعمال:</strong> إشارات متعلقة بالصفقات والعقود</li>
                        <li><strong>التكنولوجيا:</strong> مصطلحات تقنية حديثة</li>
                    </ul>

                    <h3>المصطلحات الأكاديمية:</h3>
                    <ul>
                        <li>📚 جامعة - مكان التعليم العالي</li>
                        <li>🔬 علم - دراسة المعرفة</li>
                        <li>📐 رياضيات - أرقام وحسابات</li>
                        <li>🌍 جغرافيا - دراسة الأرض</li>
                        <li>🎨 فن - التعبير الإبداعي</li>
                        <li>📖 قراءة - استخراج المعاني من النصوص</li>
                    </ul>

                    <div class="content-highlight">
                        <strong>🎯 تطبيق عملي:</strong> تعلم إشارات من مجال تخصصك أو اهتمامك.
                    </div>
                `
            },
            {
                id: 'l3-3',
                title: 'النقاشات المعقدة والحجج المنطقية',
                content: `
                    <h3>النقاش والحوار المتقدم</h3>
                    <p>الآن يمكنك المشاركة في نقاشات عميقة وجدلية حول مواضيع معقدة.</p>

                    <h3>عناصر النقاش المتقدم:</h3>
                    <ul>
                        <li><strong>الاختلاف والموافقة:</strong> إشارات تعبر عن وجهات النظر المختلفة</li>
                        <li><strong>السبب والنتيجة:</strong> الربط بين الأسباب والمترتبات</li>
                        <li><strong>المقارنة والتباين:</strong> إظهار الفروقات والتشابهات</li>
                        <li><strong>الشرط والنتيجة:</strong> "إذا... فإن..." بلغة الإشارة</li>
                        <li><strong>التسلسل الزمني:</strong> الأحداث والترتيب الزمني</li>
                    </ul>

                    <h3>أمثلة على حجج منطقية:</h3>
                    <ul>
                        <li>"في رأيي، لأن... لذلك أعتقد أن..."</li>
                        <li>"أوافق معك لكن... من ناحية أخرى..."</li>
                        <li>"بناءً على ما قلت، فإن النتيجة هي..."</li>
                        <li>"لا أتفق لأن الأدلة تشير إلى..."</li>
                    </ul>

                    <div class="content-highlight">
                        <strong>💬 الحوار الثقافي:</strong> لغة الإشارة تفتح أبواب فهم عميق للثقافة الصماء.
                    </div>
                `
            },
            {
                id: 'l3-4',
                title: 'القصص والسرد المتقدم',
                content: `
                    <h3>فن السرد القصصي بلغة الإشارة</h3>
                    <p>يعتبر السرد بلغة الإشارة فناً عميقاً. ستتعلم كيفية روي القصص بطريقة جذابة ومعبرة.</p>

                    <h3>عناصر السرد الفعال:</h3>
                    <ul>
                        <li><strong>الشخصيات:</strong> تمثيل الشخصيات بإشارات وتعابير مختلفة</li>
                        <li><strong>الحبكة:</strong> تطور الأحداث بتسلسل منطقي</li>
                        <li><strong>الحوار:</strong> محادثات واقعية بين الشخصيات</li>
                        <li><strong>الذروة:</strong> لحظة التوتر الأعظم</li>
                        <li><strong>الخاتمة:</strong> حل المشكلة والدرس المستفاد</li>
                    </ul>

                    <h3>تقنيات السرد المتقدمة:</h3>
                    <ul>
                        <li>🎭 تغيير الموضع للإشارة إلى شخصيات مختلفة</li>
                        <li>⏰ استخدام الإيماءات للدلالة على مرور الوقت</li>
                        <li>🎬 الحركات البسيطة لتمثيل الأفعال</li>
                        <li>😟 المبالغة في التعابير لزيادة التأثير</li>
                        <li>🔄 الترديد للتأكيد والتشويق</li>
                    </ul>

                    <div class="content-highlight">
                        <strong>🎪 تحدٍ:</strong> حاول رواية قصة بدون استخدام أي مفردات مكتوبة!
                    </div>

                    <h3>أمثلة على قصص شهيرة:</h3>
                    <ul>
                        <li>قصة الأطفال المشهورة (سيندريلا، علاء الدين، إلخ)</li>
                        <li>القصص الشخصية والتجارب الحقيقية</li>
                        <li>النكات والفكاهة بلغة الإشارة</li>
                        <li>القصص الملهمة والدروس المستفادة</li>
                    </ul>
                `
            }
        ],
        quiz: [
            {
                question: 'في المستوى المتقدم، ما الذي يميز الإشارات المركبة؟',
                options: [
                    'تركيب واحد فقط يكفي',
                    'تغيير الإشارة الأساسية بإضافة حركات وتراكيب معقدة',
                    'لا تختلف عن الإشارات البسيطة',
                    'غير ضرورية'
                ],
                correct: 1
            },
            {
                question: 'كيف يتم تمثيل شخصيات مختلفة في السرد بلغة الإشارة؟',
                options: [
                    'استخدام كلمات فقط',
                    'الموضع المختلف في المساحة حول جسدك مع تعابير مختلفة',
                    'تغيير الملابس',
                    'عدم الحاجة لتمثيل الشخصيات'
                ],
                correct: 1
            },
            {
                question: 'ما الدور الأساسي للإشارات في المجالات المهنية؟',
                options: [
                    'غير ضروري في المجالات الرسمية',
                    'توصيل المصطلحات التخصصية بطريقة دقيقة',
                    'استخدام فقط للترفيه',
                    'لا علاقة لها بالعمل'
                ],
                correct: 1
            },
            {
                question: 'كيف يمكنك عرض السبب والنتيجة في لغة الإشارة؟',
                options: [
                    'فقط بالكلمات',
                    'الربط بين الإشارات بحركات انتقالية وتعابير منطقية',
                    'غير ممكن في لغة الإشارة',
                    'استخدام أرقام فقط'
                ],
                correct: 1
            }
        ]
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    updateLevelCards();
});

// Level Selection
function startLevel(level) {
    currentLevel = level;
    currentLessonIndex = 0;
    levelStartTime = Date.now();
    
    levelSelectionView.classList.add('hidden');
    lessonView.classList.remove('hidden');
    
    loadLesson();
    showToast('🎉 بدأت المستوى ' + level);
}

function loadLesson() {
    const lesson = levelsData[currentLevel].lessons[currentLessonIndex];
    const totalLessons = levelsData[currentLevel].lessons.length;
    
    currentLevelTitle.textContent = `${levelsData[currentLevel].title}`;
    lessonCounter.textContent = `الدرس ${currentLessonIndex + 1} من ${totalLessons}`;
    lessonContent.innerHTML = lesson.content;
    
    // Update progress
    const progress = ((currentLessonIndex + 1) / totalLessons) * 100;
    lessonProgressFill.style.width = progress + '%';
    lessonProgressText.textContent = Math.round(progress) + '% اكتمل';
    
    // Update navigation buttons
    prevBtn.disabled = currentLessonIndex === 0;
    prevBtn.style.opacity = currentLessonIndex === 0 ? '0.5' : '1';
    
    nextBtn.textContent = currentLessonIndex === totalLessons - 1 ? 'اختبر معلوماتك →' : 'درس التالي →';
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function previousLesson() {
    if (currentLessonIndex > 0) {
        currentLessonIndex--;
        loadLesson();
    }
}

function nextLesson() {
    const totalLessons = levelsData[currentLevel].lessons.length;
    if (currentLessonIndex < totalLessons - 1) {
        currentLessonIndex++;
        loadLesson();
    } else {
        // Move to quiz
        startQuiz('lesson');
    }
}

// Quiz System
function startQuiz(type) {
    currentQuizType = type;
    if (type === 'lesson') {
        lessonView.classList.add('hidden');
        quizView.classList.remove('hidden');
        loadQuiz();
    } else if (type === 'level') {
        // Load level quiz
        levelCompleteView.classList.add('hidden');
        levelQuizView.classList.remove('hidden');
        loadLevelQuiz();
    }
}

function loadQuiz() {
    const quiz = levelsData[currentLevel].quiz;
    let quizHTML = '';
    
    quiz.forEach((q, index) => {
        quizHTML += `
            <div class="question-item">
                <div class="question-number">${index + 1}</div>
                <div class="question-text">${q.question}</div>
                <div class="options">
        `;
        
        q.options.forEach((option, optIndex) => {
            const optionId = `q${index}-opt${optIndex}`;
            quizHTML += `
                    <div class="answer-option">
                        <input type="radio" id="${optionId}" name="q${index}" value="${optIndex}">
                        <label for="${optionId}">${option}</label>
                    </div>
            `;
        });
        
        quizHTML += `
                </div>
            </div>
        `;
    });
    
    document.getElementById('quiz-questions').innerHTML = quizHTML;
    window.scrollTo(0, 0);
}

function submitQuiz() {
    const quiz = levelsData[currentLevel].quiz;
    let score = 0;
    const answers = [];
    
    quiz.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        if (selected) {
            const answer = parseInt(selected.value);
            answers.push(answer);
            if (answer === q.correct) {
                score++;
            }
        } else {
            answers.push(null);
        }
    });
    
    quizAnswers = { level: currentLevel, lesson: currentLessonIndex, answers, score };
    
    // Show results
    showResults(score, quiz.length);
}

function showResults(score, total) {
    quizView.classList.add('hidden');
    resultsView.classList.remove('hidden');
    
    const percentage = Math.round((score / total) * 100);
    const scorePercentageEl = document.getElementById('score-percentage');
    scorePercentageEl.textContent = percentage + '%';
    
    // Color based on score
    let resultClass = 'poor';
    let message = '⭐ ممتاز! لقد أحرزت نتيجة رائعة!';
    
    if (percentage >= 80) {
        resultClass = 'excellent';
        message = '🌟 ممتاز جداً! أنت متفوق!';
    } else if (percentage >= 60) {
        resultClass = 'good';
        message = '👍 جيد جداً! استمر في المحاولة!';
    } else if (percentage >= 40) {
        resultClass = 'fair';
        message = '📚 ليس بالسيء! تابع الدراسة!';
    } else {
        resultClass = 'poor';
        message = '💪 لا تستسلم! جرب مرة أخرى!';
    }
    
    document.getElementById('score-circle').style.background = 
        percentage >= 80 ? 'linear-gradient(135deg, #43e97b, #38f9d7)' :
        percentage >= 60 ? 'linear-gradient(135deg, #4facfe, #00f2fe)' :
        percentage >= 40 ? 'linear-gradient(135deg, #f093fb, #f5576c)' :
        'linear-gradient(135deg, #f5576c, #f093fb)';
    
    document.getElementById('results-message').textContent = message;
    document.getElementById('results-message').className = 'results-message ' + resultClass;
    
    const detailsHTML = `
        <div class="result-item">
            <span class="result-label">الإجابات الصحيحة</span>
            <span class="result-value">${score} من ${total}</span>
        </div>
        <div class="result-item">
            <span class="result-label">النسبة المئوية</span>
            <span class="result-value">${percentage}%</span>
        </div>
        <div class="result-item">
            <span class="result-label">التقييم</span>
            <span class="result-value">${resultClass === 'excellent' ? '⭐⭐⭐⭐⭐' : resultClass === 'good' ? '⭐⭐⭐⭐' : resultClass === 'fair' ? '⭐⭐⭐' : '⭐⭐'}</span>
        </div>
    `;
    
    document.getElementById('results-details').innerHTML = detailsHTML;
    
    // Save progress
    saveProgress();
    
    window.scrollTo(0, 0);
}

function retakeQuiz() {
    resultsView.classList.add('hidden');
    quizView.classList.remove('hidden');
    loadQuiz();
}

function returnToLesson() {
    resultsView.classList.add('hidden');
    quizView.classList.add('hidden');
    lessonView.classList.remove('hidden');
}

function proceedToNextLessonOrLevel() {
    const totalLessons = levelsData[currentLevel].lessons.length;
    const totalLevels = 3;
    
    if (currentLevel < totalLevels) {
        // More lessons in this level? No - move to level quiz
        resultsView.classList.add('hidden');
        levelCompleteView.classList.remove('hidden');
        prepareLevelComplete();
    } else {
        // Last level completed
        backToLevels();
    }
}

function prepareLevelComplete() {
    const levelMin = quizAnswers.score;
    const levelMax = levelsData[currentLevel].quiz.length;
    const avgScore = Math.round((levelMin / levelMax) * 100);
    
    document.getElementById('level-complete-message').textContent = `لقد أكملت المستوى ${currentLevel} بنجاح!`;
    document.getElementById('level-avg-score').textContent = avgScore;
    document.getElementById('level-lessons-completed').textContent = levelsData[currentLevel].lessons.length;
    
    const time = Math.round((Date.now() - levelStartTime) / 60000);
    document.getElementById('level-time-spent').textContent = time;
    
    if (currentLevel === 3) {
        document.getElementById('unlock-next-level').style.display = 'none';
    }
}

function unlockNextLevel() {
    currentLevel++;
    levelCompleteView.classList.add('hidden');
    backToLevels();
    showToast('🔓 تم فتح المستوى ' + currentLevel);
}

function skipLevelQuiz() {
    levelQuizView.classList.add('hidden');
    levelCompleteView.classList.remove('hidden');
    prepareLevelComplete();
}

function submitLevelQuiz() {
    // Similar to submitQuiz but for level quiz
    const quiz = levelsData[currentLevel].quiz;
    let score = 0;
    
    quiz.forEach((q, index) => {
        const selected = document.querySelector(`input[name="lq${index}"]:checked`);
        if (selected && parseInt(selected.value) === q.correct) {
            score++;
        }
    });
    
    levelQuizView.classList.add('hidden');
    levelCompleteView.classList.remove('hidden');
    document.getElementById('level-avg-score').textContent = Math.round((score / quiz.length) * 100);
}

function loadLevelQuiz() {
    const quiz = levelsData[currentLevel].quiz;
    let quizHTML = '';
    
    quiz.forEach((q, index) => {
        quizHTML += `
            <div class="question-item">
                <div class="question-number">${index + 1}</div>
                <div class="question-text">${q.question}</div>
                <div class="options">
        `;
        
        q.options.forEach((option, optIndex) => {
            const optionId = `lq${index}-opt${optIndex}`;
            quizHTML += `
                    <div class="answer-option">
                        <input type="radio" id="${optionId}" name="lq${index}" value="${optIndex}">
                        <label for="${optionId}">${option}</label>
                    </div>
            `;
        });
        
        quizHTML += `
                </div>
            </div>
        `;
    });
    
    document.getElementById('level-quiz-questions').innerHTML = quizHTML;
    window.scrollTo(0, 0);
}

// Navigation
function backToLevels() {
    lessonView.classList.add('hidden');
    quizView.classList.add('hidden');
    resultsView.classList.add('hidden');
    levelQuizView.classList.add('hidden');
    levelCompleteView.classList.add('hidden');
    levelSelectionView.classList.remove('hidden');
    
    updateLevelCards();
    window.scrollTo(0, 0);
}

// Progress Management
function saveProgress() {
    const progress = {
        completedLessons: {},
        quizScores: [],
        timestamp: Date.now()
    };
    
    // Save to localStorage
    localStorage.setItem('learningLabProgress', JSON.stringify(progress));
}

function loadProgress() {
    const saved = localStorage.getItem('learningLabProgress');
    if (saved) {
        // Load saved progress
    }
}

function updateLevelCards() {
    for (let i = 1; i <= 3; i++) {
        const progressPercent = Math.random() * 100; // Placeholder
        const progressEl = document.getElementById(`level${i}-progress`);
        const textEl = document.getElementById(`level${i}-text`);
        
        if (progressEl) {
            progressEl.style.width = progressPercent + '%';
            textEl.textContent = Math.round(progressPercent) + '% مكتمل';
        }
    }
    
    // Update overall progress
    updateOverallProgress();
}

function updateOverallProgress() {
    const overall = Math.round((Math.random() * 35 + 10));
    miniProgressFill.style.width = overall + '%';
    overallProgressText.textContent = `التقدم الإجمالي: ${overall}%`;
}

// Toast Notification
function showToast(message) {
    toastMessage.textContent = message;
    achievementToast.classList.remove('hidden');
    
    setTimeout(() => {
        achievementToast.classList.add('hidden');
    }, 3000);
}
