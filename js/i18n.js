const translations = {
  zh: {
    // Common
    'nav.home': '首页',
    'nav.tools': '工具',
    'theme.toggle': '切换主题',
    'lang.toggle': 'EN',
    
    // Home Page
    'home.title': '开发者工具集',
    'home.subtitle': '精选的高端、快速、纯粹的在线开发者工具。',
    'home.privacy': '100% 本地计算。不上传任何数据到服务器。',
    'tool.json': 'JSON 格式化',
    'tool.json.desc': '格式化、校验和折叠 JSON 数据',
    'tool.url': 'URL 编解码',
    'tool.url.desc': '对 URL 字符串进行编码或解码',
    'tool.timestamp': '时间戳转换',
    'tool.timestamp.desc': 'Unix 时间戳与人类可读日期的相互转换',
    'tool.base64': 'Base64 编解码',
    'tool.base64.desc': '对文本进行 Base64 编码或解码',
    'tool.yaml': 'YAML 校验',
    'tool.yaml.desc': 'YAML 格式化与语法校验',
    'tool.xml': 'XML 校验',
    'tool.xml.desc': 'XML 格式化与语法校验',
    'tool.md5': 'MD5 生成',
    'tool.md5.desc': '计算文本的 MD5 哈希值',
    'tool.sha256': 'SHA256 生成',
    'tool.sha256.desc': '计算文本的 SHA-256 哈希值',
    'tool.diff': '在线文本比对',
    'tool.diff.desc': '比较两段文本并高亮差异',
    'tool.password': '随机密码生成',
    'tool.password.desc': '生成高强度的安全随机密码',
    'tool.worldtime': '世界时间',
    'tool.worldtime.desc': '查看全球各时区当前时间',
    'tool.regex': '正则表达式测试',
    'tool.regex.desc': '在线测试和验证正则表达式',

    // Shared Tool UI
    'btn.clear': '清空',
    'btn.copy': '复制',
    'btn.format': '格式化',
    'btn.compress': '压缩',
    'btn.encode': '编码',
    'btn.decode': '解码',
    'msg.copied': '已复制到剪贴板',
    'msg.error': '处理时发生错误',
    'msg.empty': '请输入内容',

    // JSON Tool
    'json.title': 'JSON 格式化',
    'json.input': '在此粘贴 JSON...',
    'json.page.desc': '粘贴 JSON 数据进行格式化、校验、压缩和美化。',
    
    // YAML Tool
    'yaml.title': 'YAML 校验与格式化',
    'yaml.input': '在此粘贴 YAML...',
    'yaml.page.desc': '粘贴 YAML 数据进行校验、格式化并转换为 JSON。',
    
    // XML Tool
    'xml.title': 'XML 校验与格式化',
    'xml.input': '在此粘贴 XML...',
    'xml.page.desc': '粘贴 XML 数据进行校验和美化缩进格式化。',
    
    // URL Tool
    'url.title': 'URL 编码 / 解码',
    'url.input': '输入需要编码或解码的 URL 或文本...',
    'url.page.desc': '对 URL 字符串进行编码或解码，确保在网址中安全使用。',
    
    // Timestamp Tool
    'timestamp.title': '时间戳转换',
    'ts.now': '当前时间戳 (秒)',
    'ts.now.ms': '当前时间戳 (毫秒)',
    
    'ts.section.totm': '时间戳 转 时间',
    'ts.input.totm': '输入时间戳 (秒或毫秒)...',
    'ts.btn.totm': '转换时间',
    
    'ts.section.tots': '时间 转 时间戳',
    'ts.input.tots': '输入日期时间 (例如 2026-04-10 12:00:00)...',
    'ts.btn.tots': '转换时间戳',
    'ts.btn.now': '当前时间',
    'ts.page.desc': '在 Unix 时间戳和人类可读日期之间相互转换。',

    'ts.result': '结果',
    
    // Base64 Tool
    'base64.title': 'Base64 编码 / 解码',
    'base64.input': '输入需要处理的文本...',
    'base64.page.desc': '将文本编码为 Base64 或将 Base64 解码回纯文本。',
    
    // Hash Tools
    'md5.title': 'MD5 哈希生成器',
    'sha256.title': 'SHA-256 哈希生成器',
    'hash.input': '输入要计算哈希的文本...',
    'hash.result': '哈希结果',
    'md5.page.desc': '为任意文本生成 MD5 哈希值。',
    'sha256.page.desc': '为任意文本生成安全的 SHA-256 哈希值。',

    // Diff Tool
    'diff.title': '在线文本比对',
    'diff.original': '原文本',
    'diff.modified': '修改后的文本',
    'diff.btn': '比对差异',
    'diff.page.desc': '并排比较两段文本，高亮显示差异内容。',

    // Password Tool
    'pwd.title': '随机密码生成器',
    'pwd.length': '密码长度',
    'pwd.uppercase': '大写字母 (A-Z)',
    'pwd.lowercase': '小写字母 (a-z)',
    'pwd.numbers': '数字 (0-9)',
    'pwd.symbols': '特殊符号 (!@#$%)',
    'pwd.btn': '生成密码',
    'pwd.page.desc': '生成高强度随机密码，支持自定义选项。',

    // World Time Tool
    'world.title': '世界时钟',
    'world.local': '本地时间',
    'world.utc': '协调世界时 (UTC)',
    'world.newyork': '纽约 (EST/EDT)',
    'world.london': '伦敦 (GMT/BST)',
    'world.tokyo': '东京 (JST)',
    'world.sydney': '悉尼 (AEST/AEDT)',
    'world.beijing': '北京 (CST)',
    'world.page.desc': '查看全球各时区的当前时间。',

    // Regex Tool
    'regex.title': '正则表达式测试',
    'regex.pattern': '正则表达式',
    'regex.flags': '修饰符',
    'regex.text': '测试文本',
    'regex.result': '匹配结果',
    'regex.nomatch': '未找到匹配项',
    'regex.error': '无效的正则表达式',
    'regex.group': '分组',
    'regex.page.desc': '测试和调试正则表达式，实时查看匹配结果。',
  }
};

let currentLang = localStorage.getItem('lang') || 'en';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  
  if (lang === 'zh') {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations.zh[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.placeholder) el.placeholder = translations.zh[key];
          if (el.value && el.type === 'button') el.value = translations.zh[key];
        } else {
          el.innerText = translations.zh[key];
        }
      }
    });
  } else {
    // If returning to english, we need to reload the page or store original english text.
    // For pure HTML, reloading is easiest to restore English fully if it's the static default,
    // or we just reload always when switching to default.
    window.location.reload();
  }
}

function toggleLanguage() {
  const newLang = currentLang === 'en' ? 'zh' : 'en';
  if (newLang === 'en') {
    localStorage.setItem('lang', 'en');
    window.location.reload();
  } else {
    setLanguage(newLang);
    updateLangBtn();
  }
}

function updateLangBtn() {
  const btn = document.getElementById('lang-toggle-text');
  if (btn) {
    btn.innerText = currentLang === 'en' ? '中文' : 'EN';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (currentLang === 'zh') {
    setLanguage('zh');
  }
  updateLangBtn();
});
