
// Translation Language Management
let currentLanguage = 'ar';

const translations = {
  ar: {
    landingBrand: 'Sign It',
    landingNavHome: 'الرئيسية',
    landingNavAbout: 'من نحن',
    landingNavLessons: 'الدروس',
    landingNavDictionary: 'القاموس',
    landingNavQuiz: 'اختبار',
    landingNavPsych: 'الصحة النفسية',
    landingHeroLabel: 'تعلم لغة الإشارة اليوم',
    landingHeroTitle: 'Welcome to Sign It',
    landingHeroText: 'ابدأ رحلتك في تعلم لغة الإشارة من خلال دروس سهلة وواضحة تناسب جميع الأعمار.',
    landingStartLearning: 'ابدأ التعلم',
    landingOpenDictionary: 'فتح القاموس',
    landingFeature1Title: 'دروس منظمة',
    landingFeature1Desc: 'خطة تعلم خطوة بخطوة مناسبة للمبتدئين.',
    landingFeature2Title: 'مناسب للعائلة',
    landingFeature2Desc: 'مثالي للآباء والأطفال للتعلم معًا.',
    landingFeature3Title: 'تتبع التقدم',
    landingFeature3Desc: 'تابع رحلتك التعليمية بإحصائيات سهلة.',
    landingFeature4Title: 'تفاعلي',
    landingFeature4Desc: 'فيديوهات وتمارين عملية ممتعة.',
    landingAboutTitle: 'عن Sign It',
    landingAboutDesc1: 'منصتنا مكرسة لتعليم لغة الإشارة للجميع، مع التركيز على تسهيل التواصل بين الصم وضعاف السمع والعالم الناطق.',
    landingAboutDesc2: 'نوفر محتوى تعليمي عالي الجودة، بدءاً من الأساسيات وحتى المستويات المتقدمة، مع أدوات تفاعلية وداعمة.',
    landingJourneyTitle: 'مستعد تبدأ رحلتك؟',
    landingJourneyText: 'انضم لآلاف المتعلمين وابدأ التواصل بلغة الإشارة اليوم.',
    landingBrowseLessons: 'تصفح الدروس',
    landingTakeQuiz: 'ابدأ اختبار'
  },
  en: {
    landingBrand: 'Sign It',
    landingNavHome: 'Home',
    landingNavAbout: 'About',
    landingNavLessons: 'Lessons',
    landingNavDictionary: 'Dictionary',
    landingNavQuiz: 'Quiz',
    landingNavPsych: 'Mental Health',
    landingHeroLabel: 'Learn Sign Language Today',
    landingHeroTitle: 'Welcome to Sign It',
    landingHeroText: 'Start your journey in learning sign language through easy and clear lessons suitable for all ages.',
    landingStartLearning: 'Start Learning',
    landingOpenDictionary: 'Open Dictionary',
    landingFeature1Title: 'Organized Lessons',
    landingFeature1Desc: 'Step-by-step learning plan suitable for beginners.',
    landingFeature2Title: 'Family Friendly',
    landingFeature2Desc: 'Perfect for parents and children to learn together.',
    landingFeature3Title: 'Track Progress',
    landingFeature3Desc: 'Follow your educational journey with easy statistics.',
    landingFeature4Title: 'Interactive',
    landingFeature4Desc: 'Videos and practical exercises.',
    landingAboutTitle: 'About Sign It',
    landingAboutDesc1: 'Our platform is dedicated to teaching sign language to everyone, with a focus on facilitating communication between deaf and hard of hearing people and the hearing world.',
    landingAboutDesc2: 'We provide high-quality educational content, from basics to advanced levels, with interactive and supportive tools.',
    landingJourneyTitle: 'Ready to start your journey?',
    landingJourneyText: 'Join thousands of learners and start communicating in sign language today.',
    landingBrowseLessons: 'Browse Lessons',
    landingTakeQuiz: 'Take Quiz'
  }
};

// Toggle Language Function - Enhanced
function toggleLanguage(event) {
  if (event) event.preventDefault();
  
  currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
  
  // Update HTML direction and lang
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  
  // Update all translated elements
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      element.textContent = translations[currentLanguage][key];
    }
  });
  
  // Update language button text
  const langBtn = document.getElementById('langToggle');
  if (langBtn) {
    langBtn.textContent = currentLanguage === 'ar' ? 'English' : 'العربية';
  }
  
  // Store preference in localStorage
  localStorage.setItem('preferredLanguage', currentLanguage);
  localStorage.setItem('htmlDir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
  
  console.log('Language switched to:', currentLanguage);
}

// Initialize language on page load
function initializeLanguage() {
  // Check saved language preference
  const savedLanguage = localStorage.getItem('preferredLanguage');
  const savedDir = localStorage.getItem('htmlDir');
  
  if (savedLanguage) {
    currentLanguage = savedLanguage;
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = savedDir || (currentLanguage === 'ar' ? 'rtl' : 'ltr');
    
    // Update button text
    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
      langBtn.textContent = currentLanguage === 'ar' ? 'English' : 'العربية';
    }
  }
  
  // Attach event listener to language toggle button
  const langBtn = document.getElementById('langToggle');
  if (langBtn) {
    langBtn.addEventListener('click', (event) => {
      event.preventDefault();
      toggleLanguage(event);
    });
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLanguage);
} else {
  initializeLanguage();
}

// SOS Emergency Function
function triggerSOS() {
  console.log('SOS triggered!');
  alert('🚨 تم تفعيل الطوارئ! يتم التواصل مع الدعم...\n\nEmergency activated! Contacting support...');
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Enhanced Accessibility Features
function enhanceAccessibility() {
  // Add skip to main content link
  const skipLink = document.createElement('a');
  skipLink.href = '#main';
  skipLink.textContent = 'Skip to main content';
  skipLink.style.position = 'absolute';
  skipLink.style.top = '-40px';
  skipLink.style.left = '0';
  skipLink.style.background = '#000';
  skipLink.style.color = '#fff';
  skipLink.style.padding = '8px';
  skipLink.onFocus = () => {
    skipLink.style.top = '0';
  };
  skipLink.onBlur = () => {
    skipLink.style.top = '-40px';
  };
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', enhanceAccessibility);

// Log version info
console.log('Sign It - Global Script v1.0 Loaded');
console.log('Current Language:', currentLanguage);