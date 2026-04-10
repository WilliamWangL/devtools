// Theme Toggle
function initTheme() {
  const isDark = localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function toggleTheme() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

// Notification System
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-opacity duration-300 ${type === 'success' ? 'bg-green-600 dark:bg-green-500' : 'bg-red-600 dark:bg-red-500'}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Copy to Clipboard helper
async function copyToClipboard(text) {
  if (!text) {
    showToast(currentLang === 'zh' ? '内容为空' : 'Content is empty', 'error');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast(currentLang === 'zh' ? '已复制到剪贴板' : 'Copied to clipboard');
  } catch (err) {
    showToast(currentLang === 'zh' ? '复制失败' : 'Failed to copy', 'error');
  }
}

// Initialize on load
initTheme();
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons(); // Initialize Lucide icons
});
