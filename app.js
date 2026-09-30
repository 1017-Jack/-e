// ===== 我的待辦清單 =====
// 待辦資料只存在目前頁面記憶體中，重新整理後會清空。

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const remainingCount = document.getElementById('remaining-count');
const filterButtons = document.querySelectorAll('.btn-filter');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');

let todos = [];
let currentFilter = 'all';
let manuallySelectedTheme = false;

// 套用主題並更新切換按鈕的圖示、文字與狀態。
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === 'dark';
  themeIcon.textContent = isDark ? '☀️' : '🌙';
  themeLabel.textContent = isDark ? '淺色模式' : '深色模式';
  themeToggle.setAttribute('aria-pressed', String(isDark));
}

// 初始主題跟隨系統，手動切換只在目前頁面有效。
function initializeTheme() {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  applyTheme(systemTheme.matches ? 'dark' : 'light');

  systemTheme.addEventListener('change', (event) => {
    if (!manuallySelectedTheme) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });
}

// 依照目前篩選條件取得要顯示的待辦事項。
function getVisibleTodos() {
  if (currentFilter === 'active') {
    return todos.filter((todo) => !todo.completed);
  }
  if (currentFilter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }
  return todos;
}

// 根據清單或篩選結果顯示合適的空狀態提示。
function getEmptyMessage() {
  if (currentFilter === 'active') {
    return '目前沒有未完成的事項';
  }
  if (currentFilter === 'completed') {
    return '目前沒有已完成的事項';
  }
  return '還沒有任何待辦事項，新增一個吧！';
}

// 更新待辦清單、空狀態與整體未完成數量。
function render() {
  const visibleTodos = getVisibleTodos();
  list.replaceChildren();

  visibleTodos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = todo.completed ? 'todo-item completed' : 'todo-item';
    item.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `標記「${todo.text}」為完成`);

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn-delete';
    deleteButton.textContent = '刪除';
    deleteButton.setAttribute('aria-label', `刪除「${todo.text}」`);

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  emptyState.hidden = visibleTodos.length > 0;
  emptyState.textContent = getEmptyMessage();
  const remaining = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `未完成:${remaining} 項`;
}

// 更新目前篩選條件與按鈕的選取狀態。
function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  render();
}

// 新增待辦，只保留在目前頁面中。
function addTodo(text) {
  todos.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text,
    completed: false,
  });
  render();
}

// 切換指定待辦的完成狀態。
function toggleTodo(id) {
  todos = todos.map((todo) => (
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  ));
  render();
}

// 刪除指定待辦。
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  render();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  addTodo(text);
  input.value = '';
  input.focus();
});

// 使用事件委派處理待辦的完成與刪除操作。
list.addEventListener('click', (event) => {
  const item = event.target.closest('.todo-item');
  if (!item) return;

  if (event.target.matches('input[type="checkbox"]')) {
    toggleTodo(item.dataset.id);
  } else if (event.target.matches('.btn-delete')) {
    deleteTodo(item.dataset.id);
  }
});

// 篩選只改變顯示內容，不影響待辦資料。
filterButtons.forEach((button) => {
  button.addEventListener('click', () => setFilter(button.dataset.filter));
});

// 手動切換主題只在目前頁面生效，不儲存選擇。
themeToggle.addEventListener('click', () => {
  manuallySelectedTheme = true;
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
});

initializeTheme();
render();
