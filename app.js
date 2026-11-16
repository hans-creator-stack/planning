/**
 * Recuerda+ — Lógica Frontend Completa
 * - Autenticación (RF01, RF02)
 * - CRUD de Tareas y Exámenes en PostgreSQL (RF03, RF05, RF08)
 * - Vista Cronológica y Filtros (RF04, RF10)
 * - Calendario Mensual en Cuadrícula (RF07)
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Elementos de Autenticación ---------- */
  const authSection = document.getElementById('auth-section');
  const mainAppContainer = document.getElementById('main-app-container');
  const authEmailInput = document.getElementById('auth-email');
  const authPasswordInput = document.getElementById('auth-password');
  const authError = document.getElementById('auth-error');
  const btnAuthSubmit = document.getElementById('btn-auth-submit');
  const btnAuthToggle = document.getElementById('btn-auth-toggle');
  const btnLogout = document.getElementById('btn-logout');
  const userDisplay = document.getElementById('user-display');

  /* ---------- Elementos de Lista y Filtros ---------- */
  const itemsContainer = document.getElementById('items-container');
  const alertBanner = document.getElementById('alert-banner');
  const alertBannerText = document.getElementById('alert-banner-text');
  const fabAdd = document.getElementById('fab-add');

  /* ---------- Elementos de Modal Sheet ---------- */
  const sheetOverlay = document.getElementById('sheet-overlay');
  const sheetTitle = document.getElementById('sheet-title');
  const sheetError = document.getElementById('sheet-error');
  const btnItemSave = document.getElementById('btn-item-save');
  const btnItemCancel = document.getElementById('btn-item-cancel');
  const itemIdInput = document.getElementById('item-id');
  const itemTitleInput = document.getElementById('item-title');
  const itemSubjectInput = document.getElementById('item-subject');
  const itemDueInput = document.getElementById('item-due');
  const itemRemindSelect = document.getElementById('item-remind');
  const btnTypeTarea = document.getElementById('btn-type-tarea');
  const btnTypeExamen = document.getElementById('btn-type-examen');

  /* ---------- Elementos de Calendario ---------- */
  const calPrevBtn = document.getElementById('cal-prev');
  const calNextBtn = document.getElementById('cal-next');
  const calMonthTitle = document.getElementById('cal-month-title');
  const calGrid = document.getElementById('cal-grid');
  const calSelectedTitle = document.getElementById('cal-selected-title');
  const calDayItems = document.getElementById('cal-day-items');

  /* ---------- Elementos de Navegación de Pestañas ---------- */
  const navButtons = document.querySelectorAll('.app-nav .nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  /* ---------- Estado de la Aplicación ---------- */
  let isRegisterMode = false;
  let currentUser = null;
  let items = [];
  let selectedType = 'tarea';
  let activeFilter = 'all';
  let activeTab = 'lista';

  // Estado del calendario
  let calDate = new Date();
  calDate.setDate(1);
  let selectedCalDay = toDayKey(new Date());

  /* ---------- Funciones Utilitarias ---------- */
  const esc = (s) => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  
  function toDateTimeLocal(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function toDayKey(date) {
    const d = new Date(date);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function formatDueLabel(isoString) {
    const d = new Date(isoString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();

    const timeStr = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    if (d < now) {
      return `<span class="card-due urgent">Venció: ${timeStr}</span>`;
    }
    if (isToday) {
      return `<span class="card-due urgent">Hoy, ${timeStr}</span>`;
    }
    if (isTomorrow) {
      return `<span class="card-due">Mañana, ${timeStr}</span>`;
    }
    const dateStr = d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    return `<span class="card-due">${dateStr}, ${timeStr}</span>`;
  }

  /* ---------- Autenticación (RF01, RF02) ---------- */
  function toggleAuthMode(toRegister) {
    isRegisterMode = typeof toRegister === 'boolean' ? toRegister : !isRegisterMode;
    authError.textContent = '';
    
    if (isRegisterMode) {
      btnAuthSubmit.textContent = 'Crear cuenta';
      btnAuthToggle.textContent = '¿Ya tienes cuenta? Inicia sesión';
      authPasswordInput.setAttribute('autocomplete', 'new-password');
    } else {
      btnAuthSubmit.textContent = 'Iniciar sesión';
      btnAuthToggle.textContent = '¿No tienes cuenta? Regístrate';
      authPasswordInput.setAttribute('autocomplete', 'current-password');
    }
  }

  btnAuthToggle.addEventListener('click', () => toggleAuthMode());

  function validateInputs(email, password) {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      authError.textContent = 'Por favor, ingresa un correo electrónico válido.';
      return false;
    }
    if (!password || password.length < 6) {
      authError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
      return false;
    }
    authError.textContent = '';
    return true;
  }

  async function handleAuthSubmit() {
    const email = (authEmailInput.value || '').trim().toLowerCase();
    const password = authPasswordInput.value || '';

    if (!validateInputs(email, password)) return;

    btnAuthSubmit.disabled = true;
    btnAuthSubmit.textContent = isRegisterMode ? 'Creando cuenta...' : 'Iniciando sesión...';

    const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la autenticación.');
      }

      startSession(data.user);
    } catch (err) {
      authError.textContent = err.message || 'No se pudo conectar con el servidor.';
    } finally {
      btnAuthSubmit.disabled = false;
      btnAuthSubmit.textContent = isRegisterMode ? 'Crear cuenta' : 'Iniciar sesión';
    }
  }

  btnAuthSubmit.addEventListener('click', handleAuthSubmit);
  authPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAuthSubmit();
  });

  function startSession(user) {
    currentUser = user;
    sessionStorage.setItem('rm_current_user', JSON.stringify(user));
    userDisplay.textContent = user.email;

    authSection.classList.add('hidden');
    mainAppContainer.classList.remove('hidden');

    authEmailInput.value = '';
    authPasswordInput.value = '';
    authError.textContent = '';

    loadPendientes();
  }

  function endSession() {
    currentUser = null;
    sessionStorage.removeItem('rm_current_user');
    userDisplay.textContent = '';
    items = [];

    mainAppContainer.classList.add('hidden');
    authSection.classList.remove('hidden');
    toggleAuthMode(false);
  }

  btnLogout.addEventListener('click', endSession);

  /* ---------- Navegación de Pestañas ---------- */
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      switchTab(targetTab);
    });
  });

  function switchTab(tabName) {
    activeTab = tabName;
    navButtons.forEach(b => {
      if (b.dataset.tab === tabName) b.classList.add('active');
      else b.classList.remove('active');
    });

    tabPanes.forEach(pane => {
      if (pane.id === `tab-${tabName}`) pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    });

    if (tabName === 'calendario') {
      renderCalendar();
    }
    if (tabName === 'avisos') {
      renderAvisos();
    }
    if (tabName === 'ayuda') {
      renderAyuda();
    }
  }

  /* ---------- Modal Bottom Sheet (RF03, RF08) ---------- */
  function setModalType(tipo) {
    selectedType = tipo === 'examen' ? 'examen' : 'tarea';
    if (selectedType === 'tarea') {
      btnTypeTarea.classList.add('active');
      btnTypeExamen.classList.remove('active');
    } else {
      btnTypeExamen.classList.add('active');
      btnTypeTarea.classList.remove('active');
    }
  }

  btnTypeTarea.addEventListener('click', () => setModalType('tarea'));
  btnTypeExamen.addEventListener('click', () => setModalType('examen'));

  function openSheet(item = null) {
    sheetError.textContent = '';
    if (item) {
      sheetTitle.textContent = 'Editar pendiente';
      itemIdInput.value = item.id;
      itemTitleInput.value = item.titulo;
      itemSubjectInput.value = item.materia || '';
      itemDueInput.value = toDateTimeLocal(item.fecha_limite);
      itemRemindSelect.value = String(item.recordatorio_horas || 24);
      setModalType(item.tipo);
      btnItemSave.textContent = 'Actualizar pendiente';
    } else {
      sheetTitle.textContent = 'Nuevo pendiente';
      itemIdInput.value = '';
      itemTitleInput.value = '';
      itemSubjectInput.value = '';
      
      const d = new Date();
      d.setHours(d.getHours() + 2);
      d.setMinutes(0);
      itemDueInput.value = toDateTimeLocal(d);
      itemRemindSelect.value = '24';
      setModalType('tarea');
      btnItemSave.textContent = 'Guardar pendiente';
    }
    sheetOverlay.classList.add('active');
    sheetOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeSheet() {
    sheetOverlay.classList.remove('active');
    sheetOverlay.setAttribute('aria-hidden', 'true');
    sheetError.textContent = '';
  }

  fabAdd.addEventListener('click', () => openSheet());
  btnItemCancel.addEventListener('click', closeSheet);
  sheetOverlay.addEventListener('click', (e) => {
    if (e.target === sheetOverlay) closeSheet();
  });

  /* ---------- Carga de Datos desde PostgreSQL ---------- */
  async function loadPendientes() {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/pendientes?usuario_id=${encodeURIComponent(currentUser.id)}`);
      if (!res.ok) throw new Error('Error al cargar pendientes.');
      items = await res.json();
      renderItems();
      checkReminders();
      if (activeTab === 'calendario') {
        renderCalendar();
      }
      if (activeTab === 'avisos') {
        renderAvisos();
      }
    } catch (err) {
      console.error(err);
    }
  }

  /* ---------- Renderizado de Lista Cronológica y Filtros (RF04, RF10) ---------- */
  function renderItems() {
    itemsContainer.innerHTML = '';
    
    // Filtrar por tipo (RF10)
    const filtered = items.filter(item => {
      if (activeFilter === 'tarea') return item.tipo === 'tarea';
      if (activeFilter === 'examen') return item.tipo === 'examen';
      return true;
    });

    // Banner de alerta para entregas en próximas 24 horas (RF10)
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const urgentCount = items.filter(item => {
      if (item.estado === 'hecho') return false;
      const due = new Date(item.fecha_limite);
      return due >= now && due <= in24Hours;
    }).length;

    if (urgentCount > 0) {
      alertBanner.style.display = 'flex';
      alertBannerText.innerHTML = `Tienes <strong>${urgentCount} entrega${urgentCount > 1 ? 's' : ''} pendiente${urgentCount > 1 ? 's' : ''}</strong> en las próximas 24 horas.`;
    } else {
      alertBanner.style.display = 'none';
    }

    if (filtered.length === 0) {
      itemsContainer.innerHTML = `
        <div style="text-align:center; padding: 40px 10px; color: var(--color-text-muted);">
          <div style="font-size:36px; margin-bottom:8px;">📚</div>
          <p style="font-size:14px; font-weight:600;">No tienes pendientes en esta vista.</p>
          <small>Toca el botón (+) para agregar una tarea o examen.</small>
        </div>
      `;
      return;
    }

    // Ordenar cronológicamente por fecha límite (RF04)
    filtered.sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite));

    // Agrupar en secciones: Vencidos, Hoy, Mañana, y Fechas Posteriores (RF04)
    const todayStart = startOfDay(now);
    const groups = {
      vencidos: [],
      hoy: [],
      manana: [],
      posteriores: {},
      hechos: []
    };

    filtered.forEach(item => {
      if (item.estado === 'hecho') {
        groups.hechos.push(item);
        return;
      }
      const dueDate = new Date(item.fecha_limite);
      const diffDays = Math.round((startOfDay(dueDate) - todayStart) / (1000 * 60 * 60 * 24));

      if (dueDate < now) {
        groups.vencidos.push(item);
      } else if (diffDays === 0) {
        groups.hoy.push(item);
      } else if (diffDays === 1) {
        groups.manana.push(item);
      } else {
        const dateKey = dueDate.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
        if (!groups.posteriores[dateKey]) groups.posteriores[dateKey] = [];
        groups.posteriores[dateKey].push(item);
      }
    });

    // Renderizar grupo Vencidos
    if (groups.vencidos.length > 0) {
      const h = document.createElement('div');
      h.className = 'section-day late';
      h.textContent = 'Vencidos';
      itemsContainer.appendChild(h);
      groups.vencidos.forEach(item => itemsContainer.appendChild(createCardElement(item)));
    }

    // Renderizar grupo Hoy
    if (groups.hoy.length > 0) {
      const h = document.createElement('div');
      h.className = 'section-day';
      h.textContent = 'Hoy';
      itemsContainer.appendChild(h);
      groups.hoy.forEach(item => itemsContainer.appendChild(createCardElement(item)));
    }

    // Renderizar grupo Mañana
    if (groups.manana.length > 0) {
      const h = document.createElement('div');
      h.className = 'section-day';
      h.textContent = 'Mañana';
      itemsContainer.appendChild(h);
      groups.manana.forEach(item => itemsContainer.appendChild(createCardElement(item)));
    }

    // Renderizar grupos Posteriores
    Object.keys(groups.posteriores).forEach(dateLabel => {
      const h = document.createElement('div');
      h.className = 'section-day';
      h.textContent = dateLabel.toUpperCase();
      itemsContainer.appendChild(h);
      groups.posteriores[dateLabel].forEach(item => itemsContainer.appendChild(createCardElement(item)));
    });

    // Renderizar Hechos
    if (groups.hechos.length > 0) {
      const h = document.createElement('div');
      h.className = 'section-day';
      h.style.color = '#155724';
      h.textContent = 'Completados';
      itemsContainer.appendChild(h);
      groups.hechos.forEach(item => itemsContainer.appendChild(createCardElement(item)));
    }
  }

  function createCardElement(item) {
    const card = document.createElement('article');
    const isExamen = item.tipo === 'examen';
    const isHecho = item.estado === 'hecho';
    const isProgreso = item.estado === 'en progreso';

    card.className = `card ${isExamen ? 'examen' : 'tarea'} ${isHecho ? 'hecho' : ''}`;
    
    let statusClass = '';
    if (isProgreso) statusClass = 'progreso';
    if (isHecho) statusClass = 'hecho';

    card.innerHTML = `
      <div class="card-header">
        <div>
          <h2 class="card-title">${esc(item.titulo)}</h2>
          ${item.materia ? `<p class="card-subject">${esc(item.materia)}</p>` : ''}
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="tag-badge">${isExamen ? '🎯 Examen' : '📝 Tarea'}</span>
          <div class="card-actions">
            <button class="card-btn-action btn-edit" title="Editar" data-id="${item.id}" type="button">✏️</button>
            <button class="card-btn-action btn-delete" title="Eliminar" data-id="${item.id}" type="button">🗑️</button>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <button class="btn-status ${statusClass}" data-id="${item.id}" type="button">
          ${esc(item.estado === 'en progreso' ? 'En progreso' : item.estado.charAt(0).toUpperCase() + item.estado.slice(1))}
        </button>
        ${formatDueLabel(item.fecha_limite)}
      </div>
    `;

    card.querySelector('.btn-status').addEventListener('click', () => cycleItemStatus(item.id));
    card.querySelector('.btn-edit').addEventListener('click', () => openSheet(item));
    card.querySelector('.btn-delete').addEventListener('click', () => confirmDeleteItem(item));

    return card;
  }

  /* ---------- Guardar / Actualizar Pendiente (RF03, RF08) ---------- */
  async function saveItem() {
    if (!currentUser) return;
    const titulo = (itemTitleInput.value || '').trim();
    const materia = (itemSubjectInput.value || '').trim();
    const fecha_limite = itemDueInput.value;
    const recordatorio_horas = Number(itemRemindSelect.value) || 24;
    const editId = itemIdInput.value;

    if (!titulo) {
      sheetError.textContent = 'El título es obligatorio.';
      return;
    }
    if (titulo.length > 80) {
      sheetError.textContent = 'El título no puede exceder 80 caracteres.';
      return;
    }
    if (!fecha_limite) {
      sheetError.textContent = 'Selecciona la fecha y hora límite.';
      return;
    }

    btnItemSave.disabled = true;

    try {
      let res;
      if (editId) {
        res = await fetch(`/api/pendientes/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario_id: currentUser.id,
            tipo: selectedType,
            titulo,
            materia,
            fecha_limite: new Date(fecha_limite).toISOString(),
            recordatorio_horas
          })
        });
      } else {
        res = await fetch('/api/pendientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario_id: currentUser.id,
            tipo: selectedType,
            titulo,
            materia,
            fecha_limite: new Date(fecha_limite).toISOString(),
            recordatorio_horas
          })
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'No se pudo guardar el pendiente.');
      }

      closeSheet();
      await loadPendientes();
    } catch (err) {
      sheetError.textContent = err.message;
    } finally {
      btnItemSave.disabled = false;
    }
  }

  btnItemSave.addEventListener('click', saveItem);

  /* ---------- Cambio Cíclico de Estado (RF05) ---------- */
  async function cycleItemStatus(id) {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/pendientes/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: currentUser.id })
      });
      if (res.ok) {
        const updated = await res.json();
        const idx = items.findIndex(i => i.id === id);
        if (idx !== -1) {
          items[idx] = updated;
          renderItems();
          if (activeTab === 'calendario') {
            renderCalendarDayDetails(selectedCalDay);
          }
        }
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  }

  /* ---------- Eliminación con Confirmación (RF08) ---------- */
  async function confirmDeleteItem(item) {
    if (!currentUser) return;
    const ok = confirm(`¿Estás seguro de que deseas eliminar "${item.titulo}"?\nEsta acción no se puede deshacer.`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/pendientes/${item.id}?usuario_id=${encodeURIComponent(currentUser.id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        items = items.filter(i => i.id !== item.id);
        renderItems();
        if (activeTab === 'calendario') {
          renderCalendar();
        }
      } else {
        alert('No se pudo eliminar el pendiente.');
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  }

  /* ---------- Chips de Filtro (RF10) ---------- */
  document.querySelectorAll('.chip-group .chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chip-group .chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter || 'all';
      renderItems();
    });
  });

  /* ---------- Calendario Mensual en Cuadrícula (RF07) ---------- */
  calPrevBtn.addEventListener('click', () => {
    calDate.setMonth(calDate.getMonth() - 1);
    renderCalendar();
  });

  calNextBtn.addEventListener('click', () => {
    calDate.setMonth(calDate.getMonth() + 1);
    renderCalendar();
  });

  function renderCalendar() {
    const year = calDate.getFullYear();
    const month = calDate.getMonth();

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    calMonthTitle.textContent = `${monthNames[month]} ${year}`;

    calGrid.innerHTML = '';

    // Primer día del mes (0 = domingo, 1 = lunes ... 6 = sábado)
    const firstDay = new Date(year, month, 1).getDay();
    // Ajustar a formato lunes = 0, domingo = 6
    const startOffset = (firstDay + 6) % 7;

    // Cantidad de días en el mes
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Celdas vacías previas
    for (let i = 0; i < startOffset; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day-cell empty';
      calGrid.appendChild(emptyCell);
    }

    const todayStr = toDayKey(new Date());

    // Celdas de días
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const dayKey = toDayKey(cellDate);

      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell';
      if (dayKey === todayStr) cell.classList.add('today');
      if (dayKey === selectedCalDay) cell.classList.add('selected');

      // Buscar pendientes de este día
      const dayPendientes = items.filter(it => toDayKey(it.fecha_limite) === dayKey);
      const hasTarea = dayPendientes.some(it => it.tipo === 'tarea');
      const hasExamen = dayPendientes.some(it => it.tipo === 'examen');

      let dotsHtml = '';
      if (hasTarea || hasExamen) {
        dotsHtml = '<div class="dot-container">';
        if (hasTarea) dotsHtml += '<span class="dot tarea"></span>';
        if (hasExamen) dotsHtml += '<span class="dot examen"></span>';
        dotsHtml += '</div>';
      }

      cell.innerHTML = `<span>${day}</span>${dotsHtml}`;

      cell.addEventListener('click', () => {
        selectedCalDay = dayKey;
        renderCalendar();
      });

      calGrid.appendChild(cell);
    }

    renderCalendarDayDetails(selectedCalDay);
  }

  function renderCalendarDayDetails(dayKey) {
    const d = new Date(dayKey + 'T12:00:00');
    const dayLabel = d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
    calSelectedTitle.textContent = `Pendientes para ${dayLabel}`;

    calDayItems.innerHTML = '';
    const dayPendientes = items.filter(it => toDayKey(it.fecha_limite) === dayKey);

    if (dayPendientes.length === 0) {
      calDayItems.innerHTML = `
        <div style="text-align:center; padding: 20px; color: var(--color-text-muted); font-size:13px;">
          No hay tareas ni exámenes programados para este día.
        </div>
      `;
      return;
    }

    dayPendientes.forEach(item => {
      calDayItems.appendChild(createCardElement(item));
    });
  }

  /* ---------- Sistema de Avisos Anticipados y Notificaciones (RF06, RF09, RF11) ---------- */
  let toastTimer = null;
  function showToast(message) {
    const toastEl = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    if (!toastEl || !toastText) return;
    toastText.textContent = message;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 4500);
  }

  async function checkReminders() {
    if (!currentUser || !items.length) return;
    const now = Date.now();
    let activeNoticeCount = 0;

    for (const item of items) {
      if (item.estado === 'hecho') continue;
      const dueTime = new Date(item.fecha_limite).getTime();
      const remindMs = (Number(item.recordatorio_horas) || 24) * 3600000;
      const triggerTime = dueTime - remindMs;

      if (now >= triggerTime) {
        activeNoticeCount++;
        if (!item.notificado) {
          item.notificado = true;
          const msg = `🔔 Recordatorio: Tu ${item.tipo} "${item.titulo}" vence pronto.`;
          showToast(msg);

          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('Recuerda+', {
                body: `${item.tipo === 'examen' ? '🎯 Examen' : '📝 Tarea'}: ${item.titulo} vence pronto.`
              });
            } catch (e) {
              console.warn('Error emitiendo Notification:', e);
            }
          }

          fetch(`/api/pendientes/${item.id}/notificado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: currentUser.id })
          }).catch(err => console.error('Error al actualizar bandera notificado:', err));
        }
      }
    }

    const badge = document.getElementById('avisos-badge');
    if (badge) {
      if (activeNoticeCount > 0) {
        badge.textContent = activeNoticeCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // Verificación periódica cada 20 segundos y al enfocar la ventana
  setInterval(checkReminders, 20000);
  window.addEventListener('focus', checkReminders);

  /* ---------- Centro de Avisos (RF11) ---------- */
  function renderAvisos() {
    const avisosContainer = document.getElementById('avisos-container');
    if (!avisosContainer) return;
    avisosContainer.innerHTML = '';

    const now = Date.now();
    const avisosActivos = [];
    const avisosProgramados = [];

    items.forEach(item => {
      if (item.estado === 'hecho') return;
      const dueTime = new Date(item.fecha_limite).getTime();
      const remindMs = (Number(item.recordatorio_horas) || 24) * 3600000;
      const triggerTime = dueTime - remindMs;

      if (now >= triggerTime) {
        avisosActivos.push(item);
      } else {
        avisosProgramados.push({ item, triggerTime });
      }
    });

    // Permisos de notificación
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      const permBtn = document.createElement('button');
      permBtn.className = 'perm-btn';
      permBtn.type = 'button';
      permBtn.textContent = '🔔 Habilitar notificaciones en este dispositivo';
      permBtn.addEventListener('click', async () => {
        const res = await Notification.requestPermission();
        if (res === 'granted') {
          showToast('¡Notificaciones activadas!');
          renderAvisos();
        }
      });
      avisosContainer.appendChild(permBtn);
    }

    // Sección 1: Avisos Activos
    const secActivos = document.createElement('div');
    secActivos.className = 'avisos-section';
    secActivos.innerHTML = `<h3 class="avisos-section-title">Avisos Activos (${avisosActivos.length})</h3>`;

    if (avisosActivos.length === 0) {
      secActivos.innerHTML += `
        <div style="text-align:center; padding: 18px; color: var(--color-text-muted); font-size:13px; background:var(--color-surface); border-radius:var(--radius-md);">
          ✨ No tienes avisos activos pendientes. ¡Todo al día!
        </div>
      `;
    } else {
      avisosActivos.forEach(item => {
        const card = document.createElement('article');
        card.className = `card card-aviso-activo ${item.tipo === 'examen' ? 'examen' : 'tarea'}`;
        card.innerHTML = `
          <div class="card-header">
            <div>
              <h2 class="card-title">${esc(item.titulo)}</h2>
              ${item.materia ? `<p class="card-subject">${esc(item.materia)}</p>` : ''}
            </div>
            <span class="tag-badge">${item.tipo === 'examen' ? '🎯 Examen' : '📝 Tarea'}</span>
          </div>
          <div class="scheduled-meta">
            <span>⏰ Alerta activada (${item.recordatorio_horas}h antes)</span>
          </div>
          <div class="card-footer" style="margin-top:12px;">
            <button class="btn-done-fast" type="button" data-id="${item.id}">✓ Marcar hecho</button>
            ${formatDueLabel(item.fecha_limite)}
          </div>
        `;

        card.querySelector('.btn-done-fast').addEventListener('click', async () => {
          await markDoneFromAvisos(item.id);
        });

        secActivos.appendChild(card);
      });
    }
    avisosContainer.appendChild(secActivos);

    // Sección 2: Próximos Avisos Programados
    const secProg = document.createElement('div');
    secProg.className = 'avisos-section';
    secProg.innerHTML = `<h3 class="avisos-section-title">Próximos Avisos Programados (${avisosProgramados.length})</h3>`;

    if (avisosProgramados.length === 0) {
      secProg.innerHTML += `
        <div style="text-align:center; padding: 18px; color: var(--color-text-muted); font-size:13px; background:var(--color-surface); border-radius:var(--radius-md);">
          No hay avisos futuros programados.
        </div>
      `;
    } else {
      avisosProgramados.sort((a, b) => a.triggerTime - b.triggerTime);
      avisosProgramados.forEach(({ item, triggerTime }) => {
        const card = document.createElement('article');
        card.className = 'card-aviso-programado';
        const trigDate = new Date(triggerTime);
        const trigStr = trigDate.toLocaleDateString('es-PE', { weekday:'short', day:'numeric', month:'short' }) + ', ' + trigDate.toLocaleTimeString('es-PE', { hour:'2-digit', minute:'2-digit' });

        card.innerHTML = `
          <div class="card-header">
            <div>
              <h2 class="card-title">${esc(item.titulo)}</h2>
              ${item.materia ? `<p class="card-subject">${esc(item.materia)}</p>` : ''}
            </div>
            <span class="tag-badge">${item.tipo === 'examen' ? '🎯 Examen' : '📝 Tarea'}</span>
          </div>
          <div class="scheduled-meta">
            <span>🔔 Se avisará el <strong>${trigStr}</strong> (${item.recordatorio_horas}h antes)</span>
          </div>
        `;
        secProg.appendChild(card);
      });
    }
    avisosContainer.appendChild(secProg);
  }

  async function markDoneFromAvisos(id) {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/pendientes/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: currentUser.id, estado: 'hecho' })
      });
      if (res.ok) {
        const updated = await res.json();
        const idx = items.findIndex(i => i.id === id);
        if (idx !== -1) items[idx] = updated;
        showToast('¡Pendiente marcado como hecho!');
        renderAvisos();
        checkReminders();
        renderItems();
      }
    } catch (err) {
      console.error('Error al marcar hecho:', err);
    }
  }

  /* ---------- Ayuda, Sugerencias y Acerca de (RF12) ---------- */
  async function renderAyuda() {
    const container = document.getElementById('ayuda-container');
    if (!container) return;

    container.innerHTML = `
      <div class="ayuda-card">
        <h3>ℹ️ Acerca de Recuerda+</h3>
        <p>Recuerda+ v1.0 (MVP) está diseñado para ayudar a los estudiantes a organizar sus tareas y exámenes con avisos oportunos respaldados en PostgreSQL.</p>
      </div>

      <div class="ayuda-card">
        <h3>💬 Reportar un Fallo o Enviar una Sugerencia</h3>
        <p>Tu opinión nos ayuda a mejorar la aplicación para todos los estudiantes.</p>

        <form class="ayuda-form" id="form-sugerencia">
          <div class="sheet-form-group" style="margin-bottom:10px;">
            <label for="sug-tipo">Tipo de comentario</label>
            <select id="sug-tipo">
              <option value="mejora">💡 Idea de mejora</option>
              <option value="fallo">🐛 Reporte de fallo técnico</option>
            </select>
          </div>

          <div class="sheet-form-group">
            <label for="sug-mensaje">Mensaje (mín. 5 caracteres, máx. 500)</label>
            <textarea id="sug-mensaje" maxlength="500" placeholder="Escribe aquí tu sugerencia o describe el error que encontraste..."></textarea>
          </div>

          <div class="auth-error" id="sug-error" style="margin-bottom:8px;"></div>
          <div class="ayuda-success-msg" id="sug-success">¡Gracias! Recibimos tu mensaje.</div>

          <button type="button" class="btn-primary" id="btn-sug-submit">Enviar comentarios</button>
        </form>
      </div>

      <div class="ayuda-card">
        <h3>📋 Historial de tus Envíos</h3>
        <div id="sug-history-list">
          <p style="font-size:13px; color:var(--color-text-muted);">Cargando historial...</p>
        </div>
      </div>
    `;

    const btnSubmit = document.getElementById('btn-sug-submit');
    const msgInput = document.getElementById('sug-mensaje');
    const tipoSelect = document.getElementById('sug-tipo');
    const errEl = document.getElementById('sug-error');
    const succEl = document.getElementById('sug-success');

    btnSubmit.addEventListener('click', async () => {
      if (!currentUser) return;
      const mensaje = (msgInput.value || '').trim();
      const tipo = tipoSelect.value;

      if (mensaje.length < 5) {
        errEl.textContent = 'Escribe al menos 5 caracteres.';
        succEl.style.display = 'none';
        return;
      }
      errEl.textContent = '';

      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Enviando...';

      try {
        const res = await fetch('/api/sugerencias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario_id: currentUser.id,
            tipo,
            mensaje
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al enviar sugerencia.');

        msgInput.value = '';
        succEl.style.display = 'block';
        succEl.textContent = '¡Gracias! Recibimos tu mensaje.';
        loadSugerenciasHistory();
      } catch (err) {
        errEl.textContent = err.message;
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Enviar comentarios';
      }
    });

    loadSugerenciasHistory();
  }

  async function loadSugerenciasHistory() {
    const listEl = document.getElementById('sug-history-list');
    if (!listEl || !currentUser) return;

    try {
      const res = await fetch(`/api/sugerencias?usuario_id=${encodeURIComponent(currentUser.id)}`);
      if (!res.ok) throw new Error('Error al cargar historial.');
      const data = await res.json();

      if (data.length === 0) {
        listEl.innerHTML = '<p style="font-size:13px; color:var(--color-text-muted);">Aún no has enviado sugerencias o reportes.</p>';
        return;
      }

      listEl.innerHTML = '';
      data.forEach(item => {
        const div = document.createElement('div');
        const isError = item.tipo === 'error';
        div.className = `sug-history-item ${isError ? 'error' : ''}`;
        const dateStr = new Date(item.created_at).toLocaleDateString('es-PE', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
        div.innerHTML = `
          <div class="sug-meta">
            <span>${isError ? '🐛 Fallo técnico' : '💡 Mejora'}</span>
            <span>${dateStr}</span>
          </div>
          <div class="sug-text">${esc(item.mensaje)}</div>
        `;
        listEl.appendChild(div);
      });
    } catch (e) {
      listEl.innerHTML = '<p style="font-size:13px; color:var(--color-text-muted);">No se pudo cargar el historial.</p>';
    }
  }

  /* ---------- Restaurar Sesión Existente ---------- */
  try {
    const saved = sessionStorage.getItem('rm_current_user');
    if (saved) {
      const user = JSON.parse(saved);
      if (user && user.email) {
        startSession(user);
      }
    }
  } catch (e) {
    console.warn('Error restaurando sesión:', e);
  }
});
