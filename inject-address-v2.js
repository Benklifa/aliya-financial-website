// Inject hidden address in white text for email copy-paste
// Version 2 - Created to bypass CDN caching
(function() {
  console.log('[Address Injector v2] Starting...');
  
  var attempts = 0;
  var maxAttempts = 30;
  
  function injectAddress() {
    attempts++;
    console.log('[Address Injector v2] Attempt', attempts);
    
    // Find all elements that might contain the location text
    var allElements = document.querySelectorAll('*');
    var found = false;
    
    for (var i = 0; i < allElements.length; i++) {
      var el = allElements[i];
      var text = el.textContent || '';
      
      // Check if this element contains ONLY the Jerusalem text (no child elements)
      if (text.trim() === 'Jerusalem (Full address provided upon registration)' && el.children.length === 0) {
        console.log('[Address Injector v2] Found location element:', el.tagName);
        
        // Inject the hidden address
        el.innerHTML = 'Jerusalem (Full address provided upon registration)<br><span style="color: white; user-select: text;">49 Tchernichovsky Street, Jerusalem<br>Take elevator to 4th floor Penthouse</span>';
        
        console.log('[Address Injector v2] ✅ SUCCESS! Hidden address injected');
        found = true;
        return true;
      }
    }
    
    if (!found && attempts < maxAttempts) {
      setTimeout(injectAddress, 500);
    } else if (attempts >= maxAttempts) {
      console.log('[Address Injector v2] ⚠️ Failed after', maxAttempts, 'attempts');
    }
    
    return found;
  }
  
  // Start after a short delay to let React render
  setTimeout(injectAddress, 1000);
})();
