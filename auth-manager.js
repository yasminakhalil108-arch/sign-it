// ============================================
// Authentication Manager
// ============================================

const AuthManager = {
  // Supabase Configuration
  supabaseUrl: 'https://vpwpafsqmnuogsoivfid.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwd3BhZnNxbW51b2dzb2l2ZmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjQ0ODIsImV4cCI6MjA5MTUwMDQ4Mn0.RnnPZ4hc_0S7Nhx-Y9HE0dVW-Hs-wP56ISeF9BUeMtA',

  supabase: null,

  // Initialize
  init() {
    try {
      this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
      console.log('✅ Auth Manager initialized');
      return true;
    } catch (error) {
      console.error('❌ Auth Manager error:', error);
      return false;
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      if (!this.supabase) this.init();
      
      const { data } = await this.supabase.auth.getUser();
      return !!data.user;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      if (!this.supabase) this.init();
      
      const { data } = await this.supabase.auth.getUser();
      return data.user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  // Login
  async login(email, password) {
    try {
      if (!this.supabase) this.init();

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Store user info
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userLoginTime', new Date().toISOString());

      console.log('✅ Login successful');
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },

  // Signup
  async signup(email, password, fullName) {
    try {
      if (!this.supabase) this.init();

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      // Store user info
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userFullName', fullName);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userSignupTime', new Date().toISOString());

      console.log('✅ Signup successful');
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout
  async logout() {
    try {
      if (!this.supabase) this.init();

      await this.supabase.auth.signOut();

      // Clear local storage
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userFullName');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userLoginTime');
      localStorage.removeItem('userSignupTime');

      console.log('✅ Logout successful');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Check and Redirect
  async checkAuthAndRedirect() {
    const isAuth = await this.isAuthenticated();
    const currentPath = window.location.pathname.split('/').pop();
    const publicPages = ['login.html', 'signup.html', ''];
    const isPublicPage = !currentPath || publicPages.includes(currentPath);

    if (!isAuth && !isPublicPage) {
      // Not authenticated and on protected page
      console.log('⚠️ Redirecting to login');
      window.location.href = 'login.html';
    } else if (isAuth && (currentPath === 'login.html' || currentPath === 'signup.html')) {
      // Already authenticated and on login page
      console.log('✅ Redirecting to learning-lab');
      window.location.href = 'learning-lab.html';
    }
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  AuthManager.init();
  AuthManager.checkAuthAndRedirect();
});
