/* ==========================================================
   BakeSpace — Baking Planner
   script.js — Logika utama aplikasi (Vanilla JavaScript)
   ==========================================================
   STRUKTUR:
   1.  UTILITAS DASAR (getFutureDate, genId — harus di atas data)
   2.  STATE & DATA AWAL
   3.  UTILITAS LANJUTAN (localStorage, toast, format tanggal)
   4.  NAVIGASI
   5.  DASHBOARD
   6.  RESEP — Render, CRUD, Detail, Scaling
   7.  JADWAL — Render, CRUD, Filter
   8.  CHECKLIST — Render, Toggle
   9.  INISIALISASI
   ========================================================== */

/* ============================================================
   1. UTILITAS DASAR
   (Harus didefinisikan sebelum data DEFAULT_SCHEDULES)
   ============================================================ */

/** Membuat ID unik sederhana */
function genId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

/** Mengembalikan tanggal N hari dari sekarang (format YYYY-MM-DD) */
function getFutureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/* ============================================================
   2. STATE & DATA AWAL
   ============================================================ */

// Contoh foto kue dari Unsplash (bebas royalti)
const CAKE_IMAGES = {
  brownies:  'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80',
  nastar:    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
  rotimanis: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=400&q=80',
  cheesecake:'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80',
  croissant: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
};

// Data resep awal (sample data)
const DEFAULT_RECIPES = [
  {
    id: 'r1',
    name: 'Brownies Cokelat Fudgy',
    category: 'Cake',
    duration: 45,
    servings: 12,
    image: CAKE_IMAGES.brownies,
    ingredients: [
      { id: 'i1', name: 'Cokelat hitam', amount: 200, unit: 'gram' },
      { id: 'i2', name: 'Mentega',        amount: 150, unit: 'gram' },
      { id: 'i3', name: 'Gula pasir',     amount: 200, unit: 'gram' },
      { id: 'i4', name: 'Telur',          amount: 3,   unit: 'butir' },
      { id: 'i5', name: 'Tepung terigu',  amount: 100, unit: 'gram' },
      { id: 'i6', name: 'Bubuk cokelat',  amount: 30,  unit: 'gram' },
    ],
    steps: [
      'Lelehkan cokelat hitam dan mentega di atas double boiler, aduk rata lalu dinginkan.',
      'Kocok telur dan gula hingga mengembang dan pucat.',
      'Masukkan campuran cokelat ke adonan telur, aduk perlahan.',
      'Ayak tepung dan bubuk cokelat, lipat ke dalam adonan.',
      'Tuang ke loyang 20x20 cm yang sudah diolesi mentega.',
      'Panggang 180°C selama 25–30 menit. Jangan terlalu lama agar tetap fudgy.',
    ],
  },
  {
    id: 'r2',
    name: 'Nastar Keju',
    category: 'Kue Kering',
    duration: 90,
    servings: 60,
    image: CAKE_IMAGES.nastar,
    ingredients: [
      { id: 'i7',  name: 'Tepung terigu', amount: 300, unit: 'gram' },
      { id: 'i8',  name: 'Mentega',       amount: 200, unit: 'gram' },
      { id: 'i9',  name: 'Kuning telur',  amount: 3,   unit: 'butir' },
      { id: 'i10', name: 'Gula halus',    amount: 50,  unit: 'gram' },
      { id: 'i11', name: 'Keju parut',    amount: 50,  unit: 'gram' },
      { id: 'i12', name: 'Selai nanas',   amount: 200, unit: 'gram' },
    ],
    steps: [
      'Kocok mentega dan gula halus hingga lembut dan creamy.',
      'Masukkan kuning telur satu per satu sambil terus dikocok.',
      'Tambahkan keju parut dan tepung terigu, uleni hingga kalis.',
      'Bentuk selai nanas menjadi bola kecil (~5 gram).',
      'Bungkus adonan kulit sekitar selai nanas, bentuk bulat.',
      'Susun di loyang, olesi kuning telur, panggang 160°C selama 25–30 menit.',
    ],
  },
  {
    id: 'r3',
    name: 'Roti Manis Isi Cokelat',
    category: 'Roti',
    duration: 120,
    servings: 10,
    image: CAKE_IMAGES.rotimanis,
    ingredients: [
      { id: 'i13', name: 'Tepung bread',    amount: 350, unit: 'gram' },
      { id: 'i14', name: 'Ragi instan',     amount: 7,   unit: 'gram' },
      { id: 'i15', name: 'Gula pasir',      amount: 50,  unit: 'gram' },
      { id: 'i16', name: 'Susu cair',       amount: 180, unit: 'ml' },
      { id: 'i17', name: 'Telur',           amount: 1,   unit: 'butir' },
      { id: 'i18', name: 'Mentega',         amount: 40,  unit: 'gram' },
      { id: 'i19', name: 'Cokelat meses',   amount: 100, unit: 'gram' },
    ],
    steps: [
      'Campurkan tepung, ragi, dan gula. Aduk rata.',
      'Tambahkan susu cair hangat dan telur, uleni 5 menit.',
      'Masukkan mentega, uleni hingga adonan elastis (±15 menit).',
      'Istirahatkan adonan 1 jam hingga mengembang dua kali lipat.',
      'Kempiskan, bagi jadi 10 bagian. Isi dengan cokelat meses.',
      'Diamkan kembali 30 menit, lalu panggang 180°C selama 15–18 menit.',
    ],
  },
  {
    id: 'r4',
    name: 'No-Bake Cheesecake Strawberry',
    category: 'Dessert',
    duration: 30,
    servings: 8,
    image: CAKE_IMAGES.cheesecake,
    ingredients: [
      { id: 'i20', name: 'Cream cheese',   amount: 250, unit: 'gram' },
      { id: 'i21', name: 'Whip cream',     amount: 200, unit: 'ml' },
      { id: 'i22', name: 'Gula halus',     amount: 80,  unit: 'gram' },
      { id: 'i23', name: 'Biskuit marie',  amount: 150, unit: 'gram' },
      { id: 'i24', name: 'Mentega cair',   amount: 60,  unit: 'gram' },
      { id: 'i25', name: 'Selai stroberi', amount: 100, unit: 'gram' },
    ],
    steps: [
      'Hancurkan biskuit, campur dengan mentega cair. Padatkan di dasar loyang springform.',
      'Kocok cream cheese hingga lembut, tambahkan gula halus.',
      'Kocok whip cream hingga kaku, lipat ke campuran cream cheese.',
      'Tuang filling di atas base biskuit, ratakan.',
      'Dinginkan di kulkas minimal 4 jam atau semalaman.',
      'Sajikan dengan topping selai stroberi di atasnya.',
    ],
  },
  {
    id: 'r5',
    name: 'Croissant Klasik',
    category: 'Pastry',
    duration: 180,
    servings: 8,
    image: CAKE_IMAGES.croissant,
    ingredients: [
      { id: 'i26', name: 'Tepung terigu',  amount: 400, unit: 'gram' },
      { id: 'i27', name: 'Mentega tawar',  amount: 250, unit: 'gram' },
      { id: 'i28', name: 'Ragi instan',    amount: 7,   unit: 'gram' },
      { id: 'i29', name: 'Gula pasir',     amount: 50,  unit: 'gram' },
      { id: 'i30', name: 'Garam',          amount: 8,   unit: 'gram' },
      { id: 'i31', name: 'Susu cair',      amount: 220, unit: 'ml' },
    ],
    steps: [
      'Campur tepung, ragi, gula, garam. Tambahkan susu, uleni hingga kalis.',
      'Dinginkan adonan di kulkas 1 jam.',
      'Pipihkan mentega di antara plastik, masukkan ke adonan (laminating).',
      'Lakukan pelipatan 3 kali, dinginkan 30 menit setiap kali.',
      'Gulung adonan tipis, potong segitiga, gulung dari pangkal ke ujung.',
      'Proofing 2 jam, olesi telur, panggang 200°C selama 18–20 menit.',
    ],
  },
];

// Data jadwal awal
const DEFAULT_SCHEDULES = [
  {
    id: 's1',
    recipeId: 'r1',
    date: getFutureDate(2),
    time: '09:00',
    status: 'upcoming',
    note: 'Untuk acara ulang tahun.',
  },
  {
    id: 's2',
    recipeId: 'r2',
    date: getFutureDate(5),
    time: '14:00',
    status: 'upcoming',
    note: 'Persiapan lebaran.',
  },
];

// State aplikasi (variabel utama)
let state = {
  recipes:   [],
  schedules: [],
  checklist: {}, // { ingredientId: true/false }
  currentPage: 'dashboard',
  scheduleFilter: 'all',
};

/* ============================================================
   3. UTILITAS LANJUTAN
   ============================================================ */

/** Format tanggal ke bahasa Indonesia */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/** Format tanggal singkat (mis. "15 Jan") */
function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/** Format bulan singkat */
function getMonthShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { month: 'short' });
}

/** Format hari */
function getDayNumber(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').getDate();
}

/** Simpan semua state ke localStorage */
function saveToStorage() {
  localStorage.setItem('bakespace_recipes',   JSON.stringify(state.recipes));
  localStorage.setItem('bakespace_schedules', JSON.stringify(state.schedules));
  localStorage.setItem('bakespace_checklist', JSON.stringify(state.checklist));
}

/** Muat state dari localStorage; pakai data default jika kosong */
function loadFromStorage() {
  const recipes   = localStorage.getItem('bakespace_recipes');
  const schedules = localStorage.getItem('bakespace_schedules');
  const checklist = localStorage.getItem('bakespace_checklist');

  state.recipes   = recipes   ? JSON.parse(recipes)   : DEFAULT_RECIPES;
  state.schedules = schedules ? JSON.parse(schedules)  : DEFAULT_SCHEDULES;
  state.checklist = checklist ? JSON.parse(checklist)  : {};

  // Jika localStorage sudah ada tapi kosong array, isi data default
  if (state.recipes.length === 0) state.recipes = DEFAULT_RECIPES;
  if (state.schedules.length === 0) state.schedules = DEFAULT_SCHEDULES;
}

/** Tampilkan toast notifikasi */
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

/* ============================================================
   3. NAVIGASI
   ============================================================ */

/** Navigasi ke halaman tertentu */
function navigateTo(page) {
  state.currentPage = page;

  // Sembunyikan semua section
  document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));

  // Tampilkan section aktif
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.remove('hidden');

  // Update nav link aktif
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });

  // Render konten sesuai halaman
  if (page === 'dashboard')   renderDashboard();
  if (page === 'recipes')     renderRecipes();
  if (page === 'schedule')    renderSchedule();
  if (page === 'ingredients') renderIngredientPage();

  // Tutup mobile menu jika terbuka
  closeMobileMenu();
}

/** Pasang event listener pada nav link */
function setupNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });
}

/** Toggle mobile sidebar */
function toggleMobileMenu() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('mobileOverlay').classList.toggle('hidden');
}

function closeMobileMenu() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('mobileOverlay').classList.add('hidden');
}

/* ============================================================
   4. DASHBOARD
   ============================================================ */

function renderDashboard() {
  const today = new Date().toISOString().split('T')[0];

  // Hitung statistik
  const totalRecipes    = state.recipes.length;
  const upcoming        = state.schedules.filter(s => s.status === 'upcoming').length;
  const done            = state.schedules.filter(s => s.status === 'done').length;
  const allIngredients  = state.recipes.flatMap(r => r.ingredients);
  const checkedCount    = allIngredients.filter(ing => state.checklist[ing.id]).length;

  document.getElementById('statRecipes').textContent    = totalRecipes;
  document.getElementById('statSchedules').textContent  = upcoming;
  document.getElementById('statDone').textContent       = done;
  document.getElementById('statIngredients').textContent= checkedCount;

  // Jadwal mendatang (maks 4, diurutkan tanggal)
  const upcomingList = [...state.schedules]
    .filter(s => s.status === 'upcoming')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const dashUpcoming = document.getElementById('dashUpcoming');
  if (upcomingList.length === 0) {
    dashUpcoming.innerHTML = '<p class="text-brown text-sm text-center py-4">Belum ada jadwal mendatang</p>';
  } else {
    dashUpcoming.innerHTML = upcomingList.map(sch => {
      const recipe = state.recipes.find(r => r.id === sch.recipeId);
      const recipeName = recipe ? recipe.name : '(Resep dihapus)';
      return `
        <div class="dash-schedule-item">
          <span class="text-xl">${recipe ? '🎂' : '❓'}</span>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-chocolate-dark truncate">${recipeName}</p>
            <p class="text-xs text-brown">${formatDateShort(sch.date)} · ${sch.time}</p>
          </div>
          <span class="status-badge status-upcoming">📌 Akan datang</span>
        </div>`;
    }).join('');
  }

  // Resep terbaru (maks 4)
  const recentRecipes = [...state.recipes].slice(-4).reverse();
  const dashRecipes = document.getElementById('dashRecipes');
  if (recentRecipes.length === 0) {
    dashRecipes.innerHTML = '<p class="text-brown text-sm text-center py-4">Belum ada resep</p>';
  } else {
    dashRecipes.innerHTML = recentRecipes.map(r => `
      <div class="dash-recipe-item cursor-pointer" onclick="openDetailModal('${r.id}')">
        <span class="text-xl">🍰</span>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-chocolate-dark truncate">${r.name}</p>
          <p class="text-xs text-brown">${r.category} · ${r.duration} menit · ${r.servings} porsi</p>
        </div>
        <span class="category-badge">${r.category}</span>
      </div>`).join('');
  }
}

/* ============================================================
   5. RESEP
   ============================================================ */

/** Render grid kartu resep dengan filter & pencarian */
function renderRecipes() {
  const searchVal   = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const categoryVal = document.getElementById('filterCategory')?.value || '';

  let filtered = state.recipes.filter(r => {
    const matchName     = r.name.toLowerCase().includes(searchVal);
    const matchCategory = !categoryVal || r.category === categoryVal;
    return matchName && matchCategory;
  });

  const grid    = document.getElementById('recipeGrid');
  const noMsg   = document.getElementById('noRecipes');

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noMsg.classList.remove('hidden');
    return;
  }

  noMsg.classList.add('hidden');
  grid.innerHTML = filtered.map(r => buildRecipeCard(r)).join('');
}

/** Buat HTML kartu resep */
function buildRecipeCard(recipe) {
  const imgHtml = recipe.image
    ? `<img src="${recipe.image}" alt="${recipe.name}" class="recipe-card-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="recipe-card-img-placeholder" style="display:none">🍰</div>`
    : `<div class="recipe-card-img-placeholder">🍰</div>`;

  return `
    <div class="recipe-card" onclick="openDetailModal('${recipe.id}')">
      ${imgHtml}
      <div class="recipe-card-body">
        <span class="category-badge">${recipe.category}</span>
        <h3 class="font-semibold text-chocolate-dark mt-2 text-base leading-snug">${recipe.name}</h3>
        <div class="recipe-card-meta">
          <span>⏱ ${recipe.duration} menit</span>
          <span>🍽 ${recipe.servings} porsi</span>
          <span>📝 ${recipe.ingredients.length} bahan</span>
        </div>
        <div class="recipe-card-actions" onclick="event.stopPropagation()">
          <button class="btn-outline btn-sm flex-1" onclick="openDetailModal('${recipe.id}')">Lihat Detail</button>
          <button class="btn-outline btn-sm" onclick="openRecipeModal('${recipe.id}')" title="Edit">✏️</button>
          <button class="btn-danger btn-sm" onclick="deleteRecipe('${recipe.id}')" title="Hapus">🗑</button>
        </div>
      </div>
    </div>`;
}

/* ---- RECIPE MODAL (Tambah / Edit) ---- */

/** Buka modal resep. Jika id diberikan → mode edit */
function openRecipeModal(id = null) {
  const form = document.getElementById('recipeForm');
  form.reset();
  document.getElementById('ingredientsList').innerHTML = '';
  document.getElementById('stepsList').innerHTML = '';

  if (id) {
    // Mode EDIT
    const recipe = state.recipes.find(r => r.id === id);
    if (!recipe) return;

    document.getElementById('recipeModalTitle').textContent = 'Edit Resep';
    document.getElementById('recipeId').value        = recipe.id;
    document.getElementById('recipeName').value      = recipe.name;
    document.getElementById('recipeCategory').value  = recipe.category;
    document.getElementById('recipeDuration').value  = recipe.duration;
    document.getElementById('recipeServings').value  = recipe.servings;
    document.getElementById('recipeImage').value     = recipe.image || '';

    // Isi bahan
    recipe.ingredients.forEach(ing => addIngredientRow(ing));
    // Isi langkah
    recipe.steps.forEach(step => addStepRow(step));
  } else {
    // Mode TAMBAH
    document.getElementById('recipeModalTitle').textContent = 'Tambah Resep Baru';
    document.getElementById('recipeId').value = '';
    addIngredientRow();
    addStepRow();
  }

  document.getElementById('recipeModal').classList.remove('hidden');
}

function closeRecipeModal() {
  document.getElementById('recipeModal').classList.add('hidden');
}

/** Tambah baris input bahan */
function addIngredientRow(ing = null) {
  const list = document.getElementById('ingredientsList');
  const row  = document.createElement('div');
  row.className = 'ingredient-row';
  row.innerHTML = `
    <input type="text"   class="input-field ing-name"   placeholder="Nama bahan"   value="${ing ? ing.name   : ''}" required />
    <input type="number" class="input-field ing-amount" placeholder="Jumlah"        value="${ing ? ing.amount : ''}" min="0.01" step="0.01" required />
    <input type="text"   class="input-field ing-unit"   placeholder="Satuan"        value="${ing ? ing.unit   : ''}" required />
    <button type="button" class="remove-btn" onclick="this.parentElement.remove()" title="Hapus">×</button>`;
  list.appendChild(row);
}

/** Tambah baris input langkah */
function addStepRow(text = '') {
  const list   = document.getElementById('stepsList');
  const index  = list.children.length + 1;
  const row    = document.createElement('div');
  row.className = 'step-row';
  row.innerHTML = `
    <span class="step-number">${index}</span>
    <textarea class="input-field step-text w-full resize-none" rows="2" placeholder="Langkah ${index}..." required>${text}</textarea>
    <button type="button" class="remove-btn" onclick="removeStepRow(this)" title="Hapus">×</button>`;
  list.appendChild(row);
}

/** Hapus baris langkah dan renumber */
function removeStepRow(btn) {
  btn.parentElement.remove();
  // Renumber step circles
  document.querySelectorAll('#stepsList .step-number').forEach((el, i) => {
    el.textContent = i + 1;
  });
}

/** Simpan resep baru atau perbarui yang ada */
function saveRecipe(event) {
  event.preventDefault();

  // Kumpulkan bahan
  const ingRows = document.querySelectorAll('#ingredientsList .ingredient-row');
  const ingredients = [];
  for (const row of ingRows) {
    const name   = row.querySelector('.ing-name').value.trim();
    const amount = parseFloat(row.querySelector('.ing-amount').value);
    const unit   = row.querySelector('.ing-unit').value.trim();
    if (!name || isNaN(amount) || !unit) {
      showToast('Lengkapi semua field bahan!', 'error'); return;
    }
    ingredients.push({ id: genId(), name, amount, unit });
  }
  if (ingredients.length === 0) {
    showToast('Tambahkan minimal 1 bahan!', 'error'); return;
  }

  // Kumpulkan langkah
  const stepRows = document.querySelectorAll('#stepsList .step-text');
  const steps = [];
  for (const el of stepRows) {
    const text = el.value.trim();
    if (!text) { showToast('Langkah tidak boleh kosong!', 'error'); return; }
    steps.push(text);
  }
  if (steps.length === 0) {
    showToast('Tambahkan minimal 1 langkah!', 'error'); return;
  }

  const id       = document.getElementById('recipeId').value;
  const name     = document.getElementById('recipeName').value.trim();
  const category = document.getElementById('recipeCategory').value;
  const duration = parseInt(document.getElementById('recipeDuration').value);
  const servings = parseInt(document.getElementById('recipeServings').value);
  const image    = document.getElementById('recipeImage').value.trim();

  if (id) {
    // UPDATE
    const idx = state.recipes.findIndex(r => r.id === id);
    state.recipes[idx] = { id, name, category, duration, servings, image, ingredients, steps };
    showToast('Resep berhasil diperbarui! ✏️', 'success');
  } else {
    // CREATE
    state.recipes.push({ id: genId(), name, category, duration, servings, image, ingredients, steps });
    showToast('Resep berhasil ditambahkan! 🍰', 'success');
  }

  saveToStorage();
  closeRecipeModal();
  renderRecipes();
  renderIngredientSelector(); // update dropdown bahan
}

/** Hapus resep */
function deleteRecipe(id) {
  if (!confirm('Yakin ingin menghapus resep ini?')) return;
  state.recipes = state.recipes.filter(r => r.id !== id);
  // Hapus juga jadwal yang menggunakan resep ini
  state.schedules = state.schedules.filter(s => s.recipeId !== id);
  saveToStorage();
  renderRecipes();
  renderIngredientSelector();
  showToast('Resep dihapus.', '');
}

/* ---- DETAIL MODAL ---- */

// Simpan porsi saat ini untuk scaling
let _currentDetailId = null;
let _currentServings = 1;

/** Buka modal detail resep */
function openDetailModal(id) {
  const recipe = state.recipes.find(r => r.id === id);
  if (!recipe) return;

  _currentDetailId = id;
  _currentServings = recipe.servings;

  document.getElementById('detailTitle').textContent = recipe.name;
  renderDetailBody(recipe, _currentServings);
  document.getElementById('detailModal').classList.remove('hidden');
}

/** Render isi detail modal (dipanggil ulang saat scaling) */
function renderDetailBody(recipe, servings) {
  const ratio = servings / recipe.servings;

  const imgHtml = recipe.image
    ? `<img src="${recipe.image}" alt="${recipe.name}" class="w-full rounded-xl mb-5 object-cover" style="max-height:220px" onerror="this.style.display='none'" />`
    : '';

  const metaHtml = `
    <div class="grid grid-cols-3 gap-3 mb-5">
      <div class="bg-cream rounded-xl p-3 text-center">
        <div class="text-2xl">⏱</div>
        <div class="font-bold text-chocolate-dark">${recipe.duration} mnt</div>
        <div class="text-xs text-brown">Durasi</div>
      </div>
      <div class="bg-cream rounded-xl p-3 text-center">
        <div class="text-2xl">📝</div>
        <div class="font-bold text-chocolate-dark">${recipe.ingredients.length}</div>
        <div class="text-xs text-brown">Bahan</div>
      </div>
      <div class="bg-cream rounded-xl p-3 text-center">
        <div class="text-2xl">📂</div>
        <div class="font-bold text-chocolate-dark">${recipe.category}</div>
        <div class="text-xs text-brown">Kategori</div>
      </div>
    </div>`;

  // === RECIPE SCALING CONTROL ===
  const scalingHtml = `
    <div class="scaling-control mb-5">
      <span class="text-sm font-semibold text-chocolate-dark flex-1">🍽 Porsi</span>
      <button class="scale-btn" onclick="scaleRecipe(-1)">−</button>
      <span id="scalingServings" class="text-lg font-bold text-chocolate-dark w-8 text-center">${servings}</span>
      <button class="scale-btn" onclick="scaleRecipe(1)">+</button>
      <span class="text-sm text-brown ml-1">(asli: ${recipe.servings})</span>
    </div>`;

  // === INGREDIENTS LIST ===
  const ingredientsHtml = `
    <div class="mb-5">
      <p class="detail-section-title">🥚 Bahan-Bahan</p>
      ${recipe.ingredients.map(ing => {
        const scaled = Math.round(ing.amount * ratio * 100) / 100;
        return `
          <div class="ingredient-detail-row">
            <span class="text-chocolate-dark">${ing.name}</span>
            <span class="font-semibold text-brown">${scaled} ${ing.unit}</span>
          </div>`;
      }).join('')}
    </div>`;

  // === STEPS LIST ===
  const stepsHtml = `
    <div class="mb-5">
      <p class="detail-section-title">👨‍🍳 Langkah Pembuatan</p>
      ${recipe.steps.map((step, i) => `
        <div class="step-detail-item">
          <span class="step-number flex-shrink-0">${i + 1}</span>
          <p class="text-sm text-chocolate-dark leading-relaxed">${step}</p>
        </div>`).join('')}
    </div>`;

  // === ACTIONS ===
  const actionsHtml = `
    <div class="flex gap-3 flex-wrap">
      <button onclick="closeDetailModal(); openRecipeModal('${recipe.id}')" class="btn-outline flex-1">✏️ Edit Resep</button>
      <button onclick="closeDetailModal(); navigateTo('schedule'); openScheduleModal(null,'${recipe.id}')" class="btn-primary flex-1">📅 Jadwalkan</button>
    </div>`;

  document.getElementById('detailBody').innerHTML =
    imgHtml + metaHtml + scalingHtml + ingredientsHtml + stepsHtml + actionsHtml;
}

/** Ubah porsi ±1 dan re-render bahan yang sudah di-scale */
function scaleRecipe(delta) {
  const recipe = state.recipes.find(r => r.id === _currentDetailId);
  if (!recipe) return;
  _currentServings = Math.max(1, _currentServings + delta);
  renderDetailBody(recipe, _currentServings);
}

function closeDetailModal() {
  document.getElementById('detailModal').classList.add('hidden');
  _currentDetailId = null;
}

/* ============================================================
   6. JADWAL BAKING
   ============================================================ */

/** Render daftar jadwal dengan filter status */
function renderSchedule() {
  const filter = state.scheduleFilter;

  let filtered = state.schedules.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  // Urutkan: mendatang dulu berdasar tanggal, selesai di bawah
  filtered.sort((a, b) => {
    const order = { upcoming: 0, inprogress: 1, done: 2 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return a.date.localeCompare(b.date);
  });

  const list  = document.getElementById('scheduleList');
  const noMsg = document.getElementById('noSchedule');

  if (filtered.length === 0) {
    list.innerHTML = '';
    noMsg.classList.remove('hidden');
    return;
  }

  noMsg.classList.add('hidden');
  list.innerHTML = filtered.map(sch => buildScheduleCard(sch)).join('');
}

/** Buat HTML kartu jadwal */
function buildScheduleCard(sch) {
  const recipe  = state.recipes.find(r => r.id === sch.recipeId);
  const rName   = recipe ? recipe.name : '(Resep dihapus)';
  const statusMap = {
    upcoming:   ['status-upcoming',   '📌 Mendatang'],
    inprogress: ['status-inprogress', '🔥 Berlangsung'],
    done:       ['status-done',       '✅ Selesai'],
  };
  const [statusClass, statusLabel] = statusMap[sch.status] || statusMap.upcoming;

  return `
    <div class="schedule-card">
      <div class="schedule-date-box">
        <div class="text-lg font-bold text-chocolate-dark leading-none">${getDayNumber(sch.date)}</div>
        <div class="text-xs text-brown font-medium">${getMonthShort(sch.date)}</div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2 flex-wrap">
          <h4 class="font-semibold text-chocolate-dark text-base">${rName}</h4>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <p class="text-sm text-brown mt-1">🕐 ${sch.time} · ${formatDateShort(sch.date)}</p>
        ${sch.note ? `<p class="text-sm text-brown/80 mt-1 italic">${sch.note}</p>` : ''}
      </div>
      <div class="flex flex-col gap-2 flex-shrink-0">
        <button onclick="openScheduleModal('${sch.id}')" class="btn-outline btn-sm" title="Edit">✏️</button>
        <button onclick="deleteSchedule('${sch.id}')" class="btn-danger btn-sm" title="Hapus">🗑</button>
      </div>
    </div>`;
}

/** Filter tab jadwal */
function filterSchedule(btn, filter) {
  state.scheduleFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderSchedule();
}

/* ---- SCHEDULE MODAL ---- */

/** Buka modal jadwal. id = edit, recipeId = pre-select dari detail resep */
function openScheduleModal(id = null, preRecipeId = null) {
  const form = document.getElementById('scheduleForm');
  form.reset();

  // Isi dropdown resep
  const sel = document.getElementById('scheduleRecipe');
  sel.innerHTML = '<option value="">Pilih resep</option>' +
    state.recipes.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

  // Set tanggal minimum = hari ini
  document.getElementById('scheduleDate').min = new Date().toISOString().split('T')[0];

  if (id) {
    // Mode EDIT
    const sch = state.schedules.find(s => s.id === id);
    if (!sch) return;
    document.getElementById('scheduleModalTitle').textContent = 'Edit Jadwal';
    document.getElementById('scheduleId').value     = sch.id;
    document.getElementById('scheduleRecipe').value = sch.recipeId;
    document.getElementById('scheduleDate').value   = sch.date;
    document.getElementById('scheduleTime').value   = sch.time;
    document.getElementById('scheduleStatus').value = sch.status;
    document.getElementById('scheduleNote').value   = sch.note || '';
  } else {
    // Mode TAMBAH
    document.getElementById('scheduleModalTitle').textContent = 'Tambah Jadwal Baking';
    document.getElementById('scheduleId').value = '';
    if (preRecipeId) document.getElementById('scheduleRecipe').value = preRecipeId;
    // Default waktu 08:00
    document.getElementById('scheduleTime').value = '08:00';
  }

  document.getElementById('scheduleModal').classList.remove('hidden');
}

function closeScheduleModal() {
  document.getElementById('scheduleModal').classList.add('hidden');
}

/** Simpan jadwal baru atau perbarui */
function saveSchedule(event) {
  event.preventDefault();

  const id       = document.getElementById('scheduleId').value;
  const recipeId = document.getElementById('scheduleRecipe').value;
  const date     = document.getElementById('scheduleDate').value;
  const time     = document.getElementById('scheduleTime').value;
  const status   = document.getElementById('scheduleStatus').value;
  const note     = document.getElementById('scheduleNote').value.trim();

  if (!recipeId || !date || !time) {
    showToast('Lengkapi semua field yang wajib!', 'error'); return;
  }

  if (id) {
    // UPDATE
    const idx = state.schedules.findIndex(s => s.id === id);
    state.schedules[idx] = { id, recipeId, date, time, status, note };
    showToast('Jadwal diperbarui! 📅', 'success');
  } else {
    // CREATE
    state.schedules.push({ id: genId(), recipeId, date, time, status, note });
    showToast('Jadwal ditambahkan! 📅', 'success');
  }

  saveToStorage();
  closeScheduleModal();
  renderSchedule();
}

/** Hapus jadwal */
function deleteSchedule(id) {
  if (!confirm('Yakin ingin menghapus jadwal ini?')) return;
  state.schedules = state.schedules.filter(s => s.id !== id);
  saveToStorage();
  renderSchedule();
  showToast('Jadwal dihapus.');
}

/* ============================================================
   7. INGREDIENT CHECKLIST
   ============================================================ */

/** Render halaman ingredients (isi dropdown) */
function renderIngredientPage() {
  renderIngredientSelector();
  // Pertahankan pilihan yang sudah dipilih jika masih valid
  const currentVal = document.getElementById('ingredientRecipeSelect').value;
  if (currentVal) renderChecklist();
}

/** Isi dropdown pilih resep */
function renderIngredientSelector() {
  const sel = document.getElementById('ingredientRecipeSelect');
  const prevVal = sel.value;
  sel.innerHTML = '<option value="">— Pilih resep —</option>' +
    state.recipes.map(r => `<option value="${r.id}" ${r.id === prevVal ? 'selected' : ''}>${r.name}</option>`).join('');
}

/** Render daftar checklist bahan berdasar resep yang dipilih */
function renderChecklist() {
  const recipeId = document.getElementById('ingredientRecipeSelect').value;
  const area     = document.getElementById('checklistArea');
  const noMsg    = document.getElementById('noChecklist');

  if (!recipeId) {
    area.classList.add('hidden');
    noMsg.classList.remove('hidden');
    return;
  }

  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  area.classList.remove('hidden');
  noMsg.classList.add('hidden');

  document.getElementById('checklistTitle').textContent = `🛒 ${recipe.name}`;

  // Progress
  const total   = recipe.ingredients.length;
  const checked = recipe.ingredients.filter(ing => state.checklist[ing.id]).length;
  const pct     = total > 0 ? Math.round((checked / total) * 100) : 0;
  document.getElementById('progressBar').style.width  = pct + '%';
  document.getElementById('progressText').textContent = `${checked} dari ${total} bahan tersedia (${pct}%)`;

  // Bahan list
  const items = document.getElementById('checklistItems');
  items.innerHTML = recipe.ingredients.map(ing => {
    const isChecked = !!state.checklist[ing.id];
    return `
      <div class="checklist-item ${isChecked ? 'checked' : ''}" onclick="toggleIngredient('${ing.id}', '${recipeId}')">
        <input type="checkbox" class="checklist-checkbox" ${isChecked ? 'checked' : ''} readonly />
        <div class="flex-1">
          <span class="ingredient-name font-medium text-chocolate-dark">${ing.name}</span>
          <span class="text-sm text-brown ml-2">${ing.amount} ${ing.unit}</span>
        </div>
        <span class="text-lg">${isChecked ? '✅' : '⬜'}</span>
      </div>`;
  }).join('');
}

/** Toggle status bahan pada checklist */
function toggleIngredient(ingId, recipeId) {
  state.checklist[ingId] = !state.checklist[ingId];
  saveToStorage();
  renderChecklist();        // re-render untuk update progress
  renderDashboard();        // update stat di dashboard
}

/** Tandai semua / reset semua bahan pada resep yang dipilih */
function checkAll(checked) {
  const recipeId = document.getElementById('ingredientRecipeSelect').value;
  if (!recipeId) return;
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;
  recipe.ingredients.forEach(ing => { state.checklist[ing.id] = checked; });
  saveToStorage();
  renderChecklist();
  renderDashboard();
}

/* ============================================================
   8. INISIALISASI
   ============================================================ */

/** Jalankan saat DOM siap */
document.addEventListener('DOMContentLoaded', () => {
  // Muat data dari localStorage (atau pakai data default)
  loadFromStorage();

  // Setup navigasi sidebar
  setupNavigation();

  // Tombol hamburger mobile
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) menuBtn.addEventListener('click', toggleMobileMenu);

  // Tutup modal jika klik overlay
  document.getElementById('recipeModal').addEventListener('click', function(e) {
    if (e.target === this) closeRecipeModal();
  });
  document.getElementById('detailModal').addEventListener('click', function(e) {
    if (e.target === this) closeDetailModal();
  });
  document.getElementById('scheduleModal').addEventListener('click', function(e) {
    if (e.target === this) closeScheduleModal();
  });

  // Keyboard: Escape menutup modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeRecipeModal();
      closeDetailModal();
      closeScheduleModal();
    }
  });

  // Render halaman awal
  navigateTo('dashboard');

  console.log('🎂 BakeSpace loaded! Recipes:', state.recipes.length, '| Schedules:', state.schedules.length);
});
