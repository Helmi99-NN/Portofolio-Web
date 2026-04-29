let cmsData = {
  experiences: [],
  organizations: [],
  certifications: [],
  contents: []
};
let currentTab = 'experiences';

const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');

// --- Auth ---
async function checkAuth() {
  try {
    const res = await fetch('/api/check-auth');
    if (res.ok) {
      loginSection.style.display = 'none';
      adminSection.style.display = 'flex';
      loadData();
    }
  } catch (e) {
    console.error(e);
  }
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    loginSection.style.display = 'none';
    adminSection.style.display = 'flex';
    loadData();
  } else {
    document.getElementById('login-error').innerText = 'Username atau Password salah!';
  }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  location.reload();
});

// --- Data Management ---
async function loadData() {
  const res = await fetch('/api/data');
  cmsData = await res.json();
  renderEditor();
}

document.getElementById('save-btn').addEventListener('click', async () => {
  const res = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cmsData)
  });

  if (res.ok) {
    const status = document.getElementById('save-status');
    status.innerText = 'Tersimpan!';
    setTimeout(() => { status.innerText = ''; }, 3000);
  }
});

// --- UI Logic ---
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const targetBtn = e.currentTarget;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    targetBtn.classList.add('active');
    currentTab = targetBtn.getAttribute('data-tab');
    
    // Update header title based on button text (ignoring SVG content)
    document.getElementById('current-page-title').innerText = targetBtn.innerText.trim();
    
    renderEditor();
  });
});

function renderEditor() {
  const container = document.getElementById('editor-container');
  container.innerHTML = '';

  const items = cmsData[currentTab] || [];
  
  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'item-card';

    let fieldsHTML = '';
    for (let key in item) {
      if (key === 'id') continue;
      
      let val = item[key];
      if (Array.isArray(val)) {
        val = val.join('\\n'); // array to newline string
        fieldsHTML += `
          <div class="form-group">
            <label>${key} (pisahkan dengan enter)</label>
            <textarea oninput="updateItem(${index}, '${key}', this.value, true)">${val}</textarea>
          </div>
        `;
      } else {
        fieldsHTML += `
          <div class="form-group">
            <label>${key}</label>
            <input type="text" value="${val.replace(/"/g, '&quot;')}" oninput="updateItem(${index}, '${key}', this.value)">
          </div>
        `;
      }
    }

    card.innerHTML = `
      <button class="btn btn-danger delete-btn" onclick="deleteItem(${index})">Hapus</button>
      ${fieldsHTML}
    `;
    container.appendChild(card);
  });
}

window.updateItem = function(index, key, value, isArray = false) {
  if (isArray) {
    cmsData[currentTab][index][key] = value.split('\\n').filter(i => i.trim() !== '');
  } else {
    cmsData[currentTab][index][key] = value;
  }
}

window.deleteItem = function(index) {
  if(confirm('Yakin ingin menghapus item ini?')) {
    cmsData[currentTab].splice(index, 1);
    renderEditor();
  }
}

window.addNewItem = function() {
  const template = getTemplate(currentTab);
  cmsData[currentTab].unshift(template);
  renderEditor();
}

function getTemplate(tab) {
  const id = Date.now().toString();
  if (tab === 'experiences') return { id, category: 'finance', date: '', title: '', role: '', points: [''] };
  if (tab === 'organizations') return { id, date: '', title: '', org: '', points: [''] };
  if (tab === 'certifications') return { id, issuer: '', title: '', desc: '', svgIcon: '<svg></svg>' };
  if (tab === 'contents') return { id, type: 'video', src: '', title: '', desc: '' };
  return { id };
}

checkAuth();
