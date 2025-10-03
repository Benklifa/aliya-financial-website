/**
 * Events API Integration
 * 
 * This script overrides the hardcoded event data in the compiled React app
 * and fetches events from the API instead, ensuring publicLocation is used.
 * 
 * Add this script to index.html before the closing </body> tag:
 * <script src="/events-api-integration.js"></script>
 */

(function() {
  'use strict';

  console.log('[Events API] Initializing event data override...');

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEventAPI);
  } else {
    initEventAPI();
  }

  async function initEventAPI() {
    try {
      // Fetch events from public API
      const response = await fetch('/api/events');
      const data = await response.json();

      if (!data.success || !data.events) {
        console.error('[Events API] Failed to load events:', data);
        return;
      }

      console.log('[Events API] Loaded', data.events.length, 'events from API');

      // Wait a bit for React to render, then replace event data
      setTimeout(() => {
        replaceEventData(data.events);
      }, 1000);

    } catch (error) {
      console.error('[Events API] Error fetching events:', error);
    }
  }

  function replaceEventData(apiEvents) {
    // Find all event location elements and update them
    const locationElements = document.querySelectorAll('[class*="location"]');
    
    locationElements.forEach(element => {
      const text = element.textContent;
      
      // If it contains old hardcoded address, replace with API data
      if (text.includes('Tchernichovsky') || text.includes('49 ')) {
        // Find matching event from API
        const matchingEvent = apiEvents.find(e => 
          text.toLowerCase().includes(e.title.toLowerCase().substring(0, 10))
        );
        
        if (matchingEvent) {
          element.textContent = matchingEvent.location; // This is publicLocation
          console.log('[Events API] Updated location for:', matchingEvent.title);
        }
      }
    });

    // Also update any elements that might contain the full address
    const allTextElements = document.querySelectorAll('p, span, div');
    
    allTextElements.forEach(element => {
      if (element.textContent.includes('49 Tchernichovsky')) {
        // Replace with public location from first event
        if (apiEvents.length > 0) {
          element.textContent = apiEvents[0].location;
          console.log('[Events API] Replaced hardcoded address with public location');
        }
      }
    });
  }

  // Observe DOM changes to catch dynamically loaded events
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const text = node.textContent;
          if (text && text.includes('Tchernichovsky')) {
            console.log('[Events API] Detected hardcoded address in new element, fetching API data...');
            initEventAPI();
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

})();
