/**
 * Events API Integration
 * 
 * This script overrides the hardcoded event data in the compiled React app
 * and fetches events from the public-events.json file instead.
 * 
 * This ensures only PUBLIC locations are displayed on the website.
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
      // Fetch events from static JSON file
      const response = await fetch('/public-events.json');
      const data = await response.json();

      if (!data.success || !data.events) {
        console.error('[Events API] Failed to load events:', data);
        return;
      }

      console.log('[Events API] Loaded', data.events.length, 'events from public-events.json');

      // Wait a bit for React to render, then replace event data
      setTimeout(() => {
        replaceEventData(data.events);
      }, 1000);

      // Set up observer to catch dynamically loaded content
      setupObserver(data.events);

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
        if (apiEvents.length > 0) {
          element.textContent = apiEvents[0].location; // Public location only
          console.log('[Events API] Updated location element');
        }
      }
    });

    // Also update any elements that might contain the full address
    const allTextElements = document.querySelectorAll('p, span, div');
    
    allTextElements.forEach(element => {
      const text = element.textContent;
      if (text.includes('49 Tchernichovsky') || text.includes('Take elevator to 4th floor')) {
        // Replace with public location from first event
        if (apiEvents.length > 0) {
          element.textContent = apiEvents[0].location;
          console.log('[Events API] Replaced hardcoded address with public location');
        }
      }
    });
  }

  function setupObserver(apiEvents) {
    // Observe DOM changes to catch dynamically loaded events
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const text = node.textContent;
            if (text && (text.includes('Tchernichovsky') || text.includes('49 '))) {
              console.log('[Events API] Detected hardcoded address in new element, replacing...');
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
  }

})();
