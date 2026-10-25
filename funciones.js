/* ============================================================
   FUNCIONES.JS - LÓGICA INTERACTIVA 100% ESTÁTICA
   Ideal para GitHub Pages (sin servidor, usando localStorage)
============================================================ */

// CLAVES DE ALMACENAMIENTO LOCAL
const STORAGE_USER_KEY = 'app_current_user';
const STORAGE_THEME_KEY = 'app_theme';
const STORAGE_TODOS_KEY = 'app_todos_list';

/* ============================================================
   1. GESTIÓN DE TEMA (CLARO / OSCURO)
============================================================ */
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem(STORAGE_THEME_KEY, newTheme);
  updateThemeIcon(newTheme);
  showToast(`Modo ${newTheme === 'dark' ? 'Oscuro' : 'Claro'} activado`, 'info');
}

function updateThemeIcon(theme) {
  const themeIcons = document.querySelectorAll('.theme-toggle-icon');
  themeIcons.forEach(icon => {
    if (theme === 'light') {
      icon.className = 'fa-solid fa-moon theme-toggle-icon';
    } else {
      icon.className = 'fa-solid fa-sun theme-toggle-icon';
    }
  });
}

/* ============================================================
   2. SISTEMA DE NOTIFICACIONES (TOASTS)
============================================================ */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconMap = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info'
  };

  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || 'fa-bell'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ============================================================
   3. AUTENTICACIÓN (LOGIN & SESIÓN ESTÁTICA)
============================================================ */
function login(email, password, remember = true) {
  // Simulación de autenticación en el cliente
  if (!email || !password) {
    showToast('Por favor completa todos los campos', 'error');
    return false;
  }

  if (!email.includes('@')) {
    showToast('Ingresa un correo electrónico válido', 'error');
    return false;
  }

  if (password.length < 4) {
    showToast('La contraseña debe tener al menos 4 caracteres', 'error');
    return false;
  }

  // Extraer nombre para saludo tuanis
  const username = email.split('@')[0];
  const formattedName = username.charAt(0).toUpperCase() + username.slice(1);

  const userData = {
    email: email,
    name: formattedName,
    loginAt: new Date().toISOString()
  };

  // Guardar en localStorage (o sessionStorage si no marca recordarme)
  if (remember) {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
  } else {
    sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
  }

  showToast(`¡Bienvenido de nuevo, ${formattedName}!`, 'success');

  // Lanzar confeti si la librería está disponible
  if (typeof confetti === 'function') {
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  }

  // Redirección con enlace relativo (Crucial para GitHub Pages)
  setTimeout(() => {
    window.location.href = 'home.html';
  }, 900);

  return true;
}

function getCurrentUser() {
  const local = localStorage.getItem(STORAGE_USER_KEY);
  if (local) return JSON.parse(local);
  const session = sessionStorage.getItem(STORAGE_USER_KEY);
  if (session) return JSON.parse(session);
  return null;
}

function logout() {
  localStorage.removeItem(STORAGE_USER_KEY);
  sessionStorage.removeItem(STORAGE_USER_KEY);
  showToast('Sesión cerrada correctamente', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 500);
}

function fillDemoUser() {
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  if (emailInput && passInput) {
    emailInput.value = 'mae@puravida.com';
    passInput.value = 'tuanis123';
    showToast('Credenciales Demo cargadas 🚀', 'info');
  }
}

function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (input && icon) {
    if (input.type === 'password') {
      input.type = 'text';
      icon.className = 'fa-regular fa-eye-slash';
    } else {
      input.type = 'password';
      icon.className = 'fa-regular fa-eye';
    }
  }
}

/* ============================================================
   4. HOME: RELOJ & BIENVENIDA DINÁMICA
============================================================ */
function initHomeDashboard() {
  const user = getCurrentUser();
  const userNameEl = document.getElementById('user-display-name');
  const greetingEl = document.getElementById('greeting-text');

  if (userNameEl) {
    userNameEl.textContent = user ? user.name : 'Amigo';
  }

  // Actualizar reloj y saludo cada segundo
  updateClockAndGreeting();
  setInterval(updateClockAndGreeting, 1000);

  // Inicializar lista de tareas
  initTodos();

  // Inicializar frase tuanis
  getRandomQuote();
}

function updateClockAndGreeting() {
  const now = new Date();
  
  // Reloj
  const clockEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');
  
  if (clockEl) {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;
  }

  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('es-ES', options);
  }

  // Saludo según la hora
  const greetingEl = document.getElementById('greeting-text');
  if (greetingEl) {
    const hour = now.getHours();
    let saludo = '¡Buenas noches!';
    if (hour >= 5 && hour < 12) {
      saludo = '¡Buenos días! ☀️';
    } else if (hour >= 12 && hour < 19) {
      saludo = '¡Buenas tardes! 🌤️';
    } else {
      saludo = '¡Buenas noches! 🌙';
    }
    greetingEl.textContent = saludo;
  }
}

/* ============================================================
   5. MINI APP INTERACTIVA: LISTA DE TAREAS & METRICAS
============================================================ */
function getTodos() {
  const data = localStorage.getItem(STORAGE_TODOS_KEY);
  if (data) return JSON.parse(data);
  return [
    { id: 1, text: 'Probar el login estático en GitHub Pages', completed: true },
    { id: 2, text: 'Comprobar el cambio de tema claro/oscuro', completed: true },
    { id: 3, text: 'Disfrutar de las animaciones y confeti tuanis 🎉', completed: false }
  ];
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_TODOS_KEY, JSON.stringify(todos));
  renderTodos();
  updateStats();
}

function initTodos() {
  renderTodos();
  updateStats();

  const form = document.getElementById('todo-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('todo-input');
      const text = input.value.trim();
      if (!text) return;

      const todos = getTodos();
      todos.unshift({
        id: Date.now(),
        text: text,
        completed: false
      });
      saveTodos(todos);
      input.value = '';
      showToast('Nueva meta agregada 💪', 'success');
    });
  }
}

function renderTodos() {
  const listEl = document.getElementById('todo-list');
  if (!listEl) return;

  const todos = getTodos();
  listEl.innerHTML = '';

  if (todos.length === 0) {
    listEl.innerHTML = `<li style="text-align: center; color: var(--text-muted); padding: 1.5rem 0;">No tienes tareas pendientes. ¡Tuanis! ✨</li>`;
    return;
  }

  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.innerHTML = `
      <div class="todo-check" onclick="toggleTodo(${todo.id})">
        <i class="fa-${todo.completed ? 'solid fa-circle-check' : 'regular fa-circle'}" style="color: ${todo.completed ? 'var(--accent-green)' : 'var(--text-muted)'}; font-size: 1.2rem;"></i>
        <span>${escapeHtml(todo.text)}</span>
      </div>
      <button class="btn-delete-todo" title="Eliminar" onclick="deleteTodo(${todo.id})">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    listEl.appendChild(li);
  });
}

function toggleTodo(id) {
  let todos = getTodos();
  todos = todos.map(t => {
    if (t.id === id) {
      const willBeCompleted = !t.completed;
      if (willBeCompleted && typeof confetti === 'function') {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      }
      return { ...t, completed: willBeCompleted };
    }
    return t;
  });
  saveTodos(todos);
}

function deleteTodo(id) {
  let todos = getTodos();
  todos = todos.filter(t => t.id !== id);
  saveTodos(todos);
  showToast('Tarea eliminada', 'info');
}

function updateStats() {
  const todos = getTodos();
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;

  const totalEl = document.getElementById('stat-total-todos');
  const completedEl = document.getElementById('stat-completed-todos');
  const progressEl = document.getElementById('stat-progress-rate');

  if (totalEl) totalEl.textContent = total;
  if (completedEl) completedEl.textContent = completed;
  if (progressEl) {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 100;
    progressEl.textContent = `${percent}%`;
  }
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}

/* ============================================================
   6. SECCIÓN "TUANIS": FRASES INSPIRADORAS Y CONFETI
============================================================ */
const tuanisQuotes = [
  { text: "El código no miente, los comentarios a veces sí.", author: "Ron Jeffries" },
  { text: "¡Mae, todo está saliendo pura vida! Seguí dándole duro.", author: "Filosofía Tica 🇨🇷" },
  { text: "Primero resuelve el problema, luego escribe el código.", author: "John Johnson" },
  { text: "Simplicidad es el requisito previo para la confiabilidad.", author: "Edsger W. Dijkstra" },
  { text: "No te preocupes si no funciona a la primera, para eso está el debug.", author: "Sabiduría Dev" },
  { text: "La mejor manera de predecir el futuro es inventarlo.", author: "Alan Kay" }
];

function getRandomQuote() {
  const quoteText = document.getElementById('tuanis-quote');
  const quoteAuthor = document.getElementById('tuanis-author');
  if (quoteText && quoteAuthor) {
    const random = tuanisQuotes[Math.floor(Math.random() * tuanisQuotes.length)];
    quoteText.textContent = `"${random.text}"`;
    quoteAuthor.textContent = `— ${random.author}`;
  }
}

function celebrateTuanis() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6']
    });
  }
  getRandomQuote();
  showToast('¡Pura Vida! Celebrando tus logros 🚀🔥', 'success');
}

// Inicializar tema al cargar
document.addEventListener('DOMContentLoaded', initTheme);
