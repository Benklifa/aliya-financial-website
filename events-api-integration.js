/**
 * Events API Integration
 * 
 * This script overrides the hardcoded event data in the compiled React app
 * and fetches events from GitHub Pages instead.
 * 
 * This ensures only PUBLIC locations are displayed on the website.
 */

(function() {
  'use strict';

  // GitHub Pages URL for public events
  const EVENTS_API_URL = 'https://benklifa.github.io/aliya-financial-website/public-events.json';

  console.log('[Events API] Initializing event data override...');
  console.log('[Events API] Fetching from:', EVENTS_API_URL);

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEventAPI);
  } else {
    initEventAPI();
  }

  async function initEventAPI() {
    try {
      // Fetch events from GitHub Pages
      const response = await fetch(EVENTS_API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (!data.success || !data.events) {
        console.error('[Events API] Invalid data format:', data);
        return;
      }

      console.log('[Events API] ✅ Loaded', data.events.length, 'events from GitHub Pages');
      console.log('[Events API] Events:', data.events.map(e => e.title).join(', '));

      // Wait a bit for React to render, then replace event data
      setTimeout(() => {
        replaceEventData(data.events);
      }, 1000);

      // Set up observer to catch dynamically loaded content
      setupObserver(data.events);

    } catch (error) {
      console.error('[Events API] ❌ Error fetching events:', error);
      console.error('[Events API] URL:', EVENTS_API_URL);
    }
  }

  function replaceEventData(apiEvents) {
    let replacementCount = 0;

    // Find all elements that contain "Jerusalem (Full address provided upon registration)"
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
      const text = element.textContent || '';
      
      // Look for the exact text we want to replace
      if (text.trim() === 'Jerusalem (Full address provided upon registration)' && element.children.length === 0) {
        if (apiEvents.length > 0 && apiEvents[0].locationHTML) {
          // Use innerHTML to render the white text span
          element.innerHTML = apiEvents[0].locationHTML;
          replacementCount++;
          console.log('[Events API] ✅ Updated location with white text HTML');
        }
      }
    });

    if (replacementCount > 0) {
      console.log(`[Events API] ✅ Total replacements: ${replacementCount}`);
    } else {
      console.log('[Events API] ℹ️ No location text found to replace yet');
    }
  }

  function setupObserver(apiEvents) {
    // Observe DOM changes to catch dynamically loaded events
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const text = node.textContent;
            if (text && text.includes('Jerusalem (Full address provided upon registration)')) {
              console.log('[Events API] 🔄 Detected location text in new element, adding white text...');
              replaceEventData(apiEvents);
            }
          }
        });
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('[Events API] 👁️ Observer active - watching for dynamic content');
  }

  // Expose API URL for debugging
  window.ALIYA_EVENTS_API = EVENTS_API_URL;
  console.log('[Events API] Debug: window.ALIYA_EVENTS_API =', EVENTS_API_URL);

})();
