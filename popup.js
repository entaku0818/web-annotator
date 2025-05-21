document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggleAnnotation');
  const viewButton = document.getElementById('viewComments');
  let isAnnotationMode = false;

  toggleButton.addEventListener('click', function() {
    isAnnotationMode = !isAnnotationMode;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggleAnnotation',
        isActive: isAnnotationMode
      });
    });
    toggleButton.textContent = isAnnotationMode ? 'コメントモードをオフ' : 'コメントモードをオン';
  });

  viewButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'viewComments'
      });
    });
  });
}); 