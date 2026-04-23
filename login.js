import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://<https://vpwpafsqmnuogsoivfid.supabase.co>.supabase.co";
const supabaseKey = "<eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwd3BhZnNxbW51b2dzb2l2ZmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjQ0ODIsImV4cCI6MjA5MTUwMDQ4Mn0.RnnPZ4hc_0S7Nhx-Y9HE0dVW-Hs-wP56ISeF9BUeMtA>";
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("login-form");
const msg = document.getElementById("login-message");

form.onsubmit = async (e) => {
  e.preventDefault();
  msg.textContent = "جارٍ تسجيل الدخول...";
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    msg.textContent = "خطأ: " + error.message;
  } else {
    msg.textContent = "تم تسجيل الدخول بنجاح!";
    setTimeout(() => window.location = "chat.html", 1000);
  }
};