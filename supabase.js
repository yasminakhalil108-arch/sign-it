const supabaseUrl = "https://vpwpafsqmnuogsoivfid.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwd3BhZnNxbW51b2dzb2l2ZmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjQ0ODIsImV4cCI6MjA5MTUwMDQ4Mn0.RnnPZ4hc_0S7Nhx-Y9HE0dVW-Hs-wP56ISeF9BUeMtAا";

const { createClient } = supabase;
const client = createClient(supabaseUrl, supabaseKey);
client
  .channel("messages")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public", // 🔥 مهم جدًا
      table: "messages"
    },
    (payload) => {
      console.log("Realtime شغال:", payload);

      const msg = payload.new;

      document.getElementById("chatBox").innerHTML += `
        <div>${msg.content}</div>
      `;
    }
  )
  .subscribe();