// 创建 Joy 图标
const joyIcon = document.createElement('img');
joyIcon.src = chrome.runtime.getURL('cat.png');
joyIcon.id = 'joy-icon';
joyIcon.style.position = 'fixed';
joyIcon.style.bottom = '20px';
joyIcon.style.right = '20px';
joyIcon.style.width = '50px';
joyIcon.style.height = '50px';
joyIcon.style.cursor = 'pointer';
joyIcon.style.zIndex = '10000';
joyIcon.style.display = 'none'; // 默认隐藏 Joy 图标
joyIcon.style.transition = 'transform 0.2s ease'; // 添加缩放动画

// 创建悬浮窗容器
const popupContainer = document.createElement('div');
popupContainer.id = 'kimi-popup';
popupContainer.style.position = 'fixed';
popupContainer.style.bottom = '80px';
popupContainer.style.right = '20px';
popupContainer.style.backgroundColor = 'white';
popupContainer.style.border = '1px solid #ccc';
popupContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
popupContainer.style.zIndex = '10000';
popupContainer.style.display = 'none';
popupContainer.style.borderRadius = '10px'; // 圆角
popupContainer.style.overflow = 'hidden';

// 创建 iframe 用于加载 AI URL
const kimiFrame = document.createElement('iframe');
kimiFrame.style.width = '100%';
kimiFrame.style.height = '100%';
kimiFrame.style.border = 'none';
popupContainer.appendChild(kimiFrame);

// 创建聊天气泡
const chatBubble = document.createElement('div');
chatBubble.id = 'chat-bubble';
chatBubble.style.position = 'fixed';
chatBubble.style.bottom = '75px'; // 位于 Joy 图标上方
chatBubble.style.right = '20px';
chatBubble.style.backgroundColor = '#ffffff';
chatBubble.style.color = '#333333';
chatBubble.style.padding = '10px';
chatBubble.style.borderRadius = '8px';
chatBubble.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
chatBubble.style.zIndex = '10000';
chatBubble.style.display = 'none'; // 默认隐藏
chatBubble.style.fontFamily = 'Arial, sans-serif';
chatBubble.style.fontSize = '14px';
chatBubble.innerHTML = `
  点我哦～ <span id="close-bubble" style="cursor: pointer; margin-left: 10px; color: #666;">×</span>
`;

// 将 Joy 图标、悬浮窗和聊天气泡添加到页面
document.body.appendChild(joyIcon);
document.body.appendChild(popupContainer);
document.body.appendChild(chatBubble);

// 检查当前 URL 是否为 PDF
function isPDFUrl(url) {
  return url.endsWith('.pdf') || url.includes('.pdf?') || url.includes('/pdf');
}

// 显示或隐藏 Joy 图标和聊天气泡
if (isPDFUrl(window.location.href)) {
  joyIcon.style.display = 'block'; // 如果是 PDF URL，显示 Joy 图标
  chatBubble.style.display = 'block'; // 显示聊天气泡
}

// 动态调整悬浮窗大小
function adjustPopupSize() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // 设置悬浮窗的最大宽度和高度
  const maxWidth = windowWidth * 0.6; // 不超过窗口宽度的 80%
  const maxHeight = windowHeight * 0.8; // 不超过窗口高度的 80%

  // 设置悬浮窗的宽度和高度
  popupContainer.style.width = `${Math.min(800, maxWidth)}px`;
  popupContainer.style.height = `${Math.min(800, maxHeight)}px`;

  // 如果窗口过小，显示提示信息
  if (windowWidth < 400 || windowHeight < 400) {
    if (!document.getElementById('window-tip')) {
      const tip = document.createElement('div');
      tip.id = 'window-tip';
      tip.style.position = 'absolute';
      tip.style.bottom = '10px';
      tip.style.left = '10px';
      tip.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      tip.style.padding = '5px 10px';
      tip.style.borderRadius = '5px';
      tip.style.fontSize = '12px';
      tip.style.color = '#333';
      tip.style.zIndex = '10001';
      tip.textContent = '建议拉大窗口以获得更好的阅读体验～';
      popupContainer.appendChild(tip);
    }
  } else {
    // 如果窗口足够大，移除提示
    const tip = document.getElementById('window-tip');
    if (tip) {
      tip.remove();
    }
  }
}

/// 在悬浮窗显示时调整大小
joyIcon.addEventListener('click', (event) => {
  event.stopPropagation();

  if (popupContainer.style.display === 'block') {
    popupContainer.style.display = 'none';
  } else {
    if (!kimiFrame.src) {
      const url = encodeURIComponent(window.location.href);

      const aiUrl = `https://kimi.moonshot.cn/_prefill_chat?prefill_prompt=${encodeURIComponent(
        `请你阅读这篇论文，链接是 ${decodeURIComponent(url)} ，并回答以下问题：
**Q1. 这篇论文试图解决什么问题？**
**Q2. 这是一个新问题吗？如果有相关研究，请给出并总结方法**
**Q3. 本文试图验证的科学假设是什么？**
**Q4. 这篇论文提出了什么新的想法、方法或模型？与以前的方法相比，有什么特点和优势？**
**Q5. 论文中的实验是如何设计的？**
**Q6. 实验和结果是否很好地支持了需要验证的科学假设**
回答时请先重复问题，再进行对应的回答。`
      )}&system_prompt=${encodeURIComponent(
        '你是一个学术专家，请你仔细阅读后续链接中的论文，并对用户的问题进行专业的回答，使用中文进行回答，不要出现第一人称，当涉及到分点回答时，鼓励你以markdown格式输出。对于引用的内容，你需要及时在引用内容后给出参考链接。'
      )}&send_immediately=true&force_search=true`;

      kimiFrame.src = aiUrl;
    }
    adjustPopupSize(); // 调整悬浮窗大小
    popupContainer.style.display = 'block';
  }
});

// 窗口大小变化时重新调整悬浮窗大小
window.addEventListener('resize', () => {
  if (popupContainer.style.display === 'block') {
    adjustPopupSize();
  }
});

// 点击页面其他区域关闭悬浮窗
document.addEventListener('click', (event) => {
  if (!popupContainer.contains(event.target) && event.target !== joyIcon) {
    popupContainer.style.display = 'none';
  }
});

// 关闭聊天气泡
document.getElementById('close-bubble').addEventListener('click', () => {
  chatBubble.style.display = 'none';
});

// Joy 图标悬停动画
joyIcon.addEventListener('mouseenter', () => {
  joyIcon.style.transform = 'scale(1.1)';
});

joyIcon.addEventListener('mouseleave', () => {
  joyIcon.style.transform = 'scale(1)';
});
