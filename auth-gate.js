// =============================================================================
// auth-gate.js — Login por "magic link" para Life-OS.
// Requiere cargar @supabase/supabase-js ANTES de este script.
//
// Uso en cada página, justo antes de cargar los datos:
//     const token = await LifeAuth.requireSession();
//     HDRS.Authorization = 'Bearer ' + token;   // usa el JWT del usuario
//
// El usuario se loguea UNA vez por dispositivo; la sesión queda guardada y se
// renueva sola. Solo vuelve a pedir login si cierra sesión o usa otro equipo.
// =============================================================================
(function () {
  const SUPA_URL = "https://klorwiibsviqlwbplqdr.supabase.co";
  const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsb3J3aWlic3ZpcWx3YnBscWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjE2MjcsImV4cCI6MjA5NTEzNzYyN30.mYknsRf9OUIssXi3PZDBFcbybgVMORrSLSD0_UEve3s";

  const client = supabase.createClient(SUPA_URL, SUPA_KEY);

  function renderLogin() {
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;" +
      "justify-content:center;background:rgba(10,16,24,.92);font-family:system-ui,sans-serif";
    wrap.innerHTML = `
      <div style="background:#18222e;color:#e6edf3;border:1px solid #25323f;
                  border-radius:14px;padding:28px;max-width:340px;width:90%">
        <h2 style="margin:0 0 6px;font-size:18px">🔒 Life-OS</h2>
        <p style="margin:0 0 16px;color:#8aa0b3;font-size:14px">
          Ingresa tu correo y te enviaremos un enlace de acceso.</p>
        <input id="la-email" type="email" placeholder="tu@correo.com"
          style="width:100%;padding:10px;border-radius:8px;border:1px solid #25323f;
                 background:#0c121a;color:#e6edf3;font-size:14px;box-sizing:border-box">
        <button id="la-send" style="width:100%;margin-top:12px;padding:10px;
          border:none;border-radius:8px;background:#2e9bff;color:#fff;font-size:14px;
          font-weight:600;cursor:pointer">Enviar enlace</button>
        <div id="la-msg" style="margin-top:12px;font-size:13px;color:#8aa0b3"></div>
      </div>`;
    document.body.appendChild(wrap);

    const msg = wrap.querySelector("#la-msg");
    wrap.querySelector("#la-send").onclick = async () => {
      const email = wrap.querySelector("#la-email").value.trim();
      if (!email) { msg.textContent = "Escribe tu correo."; return; }
      msg.textContent = "Enviando…";
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.href },
      });
      msg.textContent = error
        ? "Error: " + error.message
        : "✅ Revisa tu correo y haz clic en el enlace.";
    };
  }

  window.LifeAuth = {
    client,
    // Devuelve el access_token si hay sesión; si no, muestra el login y
    // detiene la carga (la promesa nunca resuelve hasta que vuelva con sesión).
    async requireSession() {
      const { data: { session } } = await client.auth.getSession();
      if (session) return session.access_token;
      renderLogin();
      return new Promise(() => {});
    },
    async logout() {
      await client.auth.signOut();
      location.reload();
    },
  };
})();
