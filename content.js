let isAnnotationMode = false;
let comments = {};

// コメントの保存
function saveComment(element, comment, selectedText = '') {
  const path = getElementPath(element);
  const key = selectedText ? `${path}:${selectedText}` : path;
  comments[key] = {
    text: comment,
    selectedText: selectedText
  };
  chrome.storage.local.set({ [window.location.href]: comments });
}

// コメントの読み込み
function loadComments() {
  chrome.storage.local.get([window.location.href], function(result) {
    if (result[window.location.href]) {
      comments = result[window.location.href];
      displayComments();
    }
  });
}

// 要素のパスを取得
function getElementPath(element) {
  const path = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    if (element.id) {
      selector += '#' + element.id;
    } else if (element.className) {
      selector += '.' + element.className.split(' ').join('.');
    }
    path.unshift(selector);
    element = element.parentNode;
  }
  return path.join(' > ');
}

// コメントの表示
function displayComments() {
  // 既存のコメントを削除
  document.querySelectorAll('.web-annotator-comment').forEach(el => el.remove());

  Object.entries(comments).forEach(([key, commentData]) => {
    const [path, selectedText] = key.split(':');
    const element = document.querySelector(path);
    if (element) {
      const commentEl = document.createElement('div');
      commentEl.className = 'web-annotator-comment';
      commentEl.textContent = commentData.text;
      
      if (commentData.selectedText) {
        // 選択テキストがある場合は、そのテキストをハイライト
        const highlightEl = document.createElement('span');
        highlightEl.className = 'web-annotator-highlight';
        highlightEl.textContent = commentData.selectedText;
        element.innerHTML = element.innerHTML.replace(
          commentData.selectedText,
          highlightEl.outerHTML
        );
      }
      
      element.appendChild(commentEl);
    }
  });
}

// 選択テキストの取得
function getSelectedText() {
  const selection = window.getSelection();
  return selection.toString().trim();
}

// マウスアップイベントの処理
document.addEventListener('mouseup', function(e) {
  if (!isAnnotationMode) return;

  const selectedText = getSelectedText();
  if (selectedText) {
    const comment = prompt('コメントを入力してください:', '');
    if (comment) {
      saveComment(e.target, comment, selectedText);
      displayComments();
    }
  }
});

// メッセージの受信
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleAnnotation') {
    isAnnotationMode = request.isActive;
  } else if (request.action === 'viewComments') {
    displayComments();
  }
});

// ページ読み込み時にコメントを読み込む
loadComments(); 