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

// Tip Footer Bar
function injectTipFooter() {
  const isZh = currentLang === 'zh';
  const text = isZh ? '觉得好用？请我喝杯咖啡 ☕' : 'Enjoying these tools? Buy me a coffee ☕';
  const btnText = isZh ? '打赏' : 'Tip';
  
  const footer = document.createElement('div');
  footer.className = 'w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50';
  footer.innerHTML = `
    <div class="container mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <span>${text}</span>
      <a href="https://paypal.me/willliam789" target="_blank" rel="noopener noreferrer"
         class="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded-md transition-colors">
        ☕ ${btnText}
      </a>
    </div>
  `;
  document.body.appendChild(footer);
}

// Initialize on load
initTheme();
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons(); // Initialize Lucide icons
  injectTipFooter(); // Inject tip bar at bottom
});
