// White text injection for event address
(function() {
  console.log('[White Text Injector] Starting...');
  
  function injectWhiteText() {
    var allElements = document.querySelectorAll('*');
    for (var i = 0; i < allElements.length; i++) {
      var el = allElements[i];
      var text = el.textContent || '';
      if (text.trim() === 'Jerusalem (Full address provided upon registration)' && el.children.length === 0) {
        el.innerHTML = 'Jerusalem (Full address provided upon registration)<br><span style="color: white;">49 Tchernichovsky Street, Jerusalem<br>Take elevator to 4th floor Penthouse</span>';
        console.log('[White Text Injector] SUCCESS! Address injected');
        return true;
      }
    }
    return false;
  }
  
  // Try multiple times as React loads dynamically
  var attempts = 0;
  var maxAttempts = 20;
  
  function tryInject() {
    attempts++;
    console.log('[White Text Injector] Attempt ' + attempts);
    if (injectWhiteText()) {
      console.log('[White Text Injector] Complete on attempt ' + attempts);
    } else if (attempts < maxAttempts) {
      setTimeout(tryInject, 500);
    } else {
      console.log('[White Text Injector] Failed after ' + maxAttempts + ' attempts');
    }
  }
  
  // Start trying after page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(tryInject, 1000);
    });
  } else {
    setTimeout(tryInject, 1000);
  }
})();
