/**
 * BACKGROUND SERVICE WORKER
 * 
 * This file runs in the background and handles:
 * 1. Creating right-click context menus
 * 2. Processing context menu clicks
 * 3. Communicating with content scripts
 * 
 * In Manifest V3, this replaces the old background page system
 */

// Event listener for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Kanji Helper extension installed');
  
  // Create the right-click context menu item
  chrome.contextMenus.create({
    id: "translateKanji",           // Unique identifier for this menu item
    title: "Translate with Kanji Helper",  // Text shown in context menu
    contexts: ["selection"],        // Only show when text is selected
    documentUrlPatterns: ["<all_urls>"]  // Available on all websites
  });
});

/**
 * CONTEXT MENU CLICK HANDLER
 * 
 * When user right-clicks selected text and chooses our menu item:
 * 1. Get the selected text from the click info
 * 2. Send message to content script to show translation popup
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Check if our menu item was clicked
  if (info.menuItemId === "translateKanji") {
    console.log('Context menu clicked, selected text:', info.selectionText);
    
    // Send message to content script running on the active tab
    chrome.tabs.sendMessage(tab.id, {
      action: "translateText",      // Action type for content script
      text: info.selectionText      // The text user selected
    }).catch(error => {
      // Handle errors (e.g., if content script isn't loaded)
      console.error('Error sending message to content script:', error);
    });
  }
});

/**
 * MESSAGE HANDLER
 * 
 * Listen for messages from other parts of the extension
 * (popup, content scripts, etc.)
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  // Handle different types of messages
  switch(request.action) {
    case 'getTabInfo':
      // Provide information about current tab if needed
      sendResponse({tabId: sender.tab?.id});
      break;
      
    default:
      console.log('Unknown message action:', request.action);
  }
  
  // Return true to indicate we'll send a response asynchronously
  return true;
});

/**
 * ERROR HANDLING
 * 
 * Log any unhandled errors in the service worker
 */
self.addEventListener('error', (event) => {
  console.error('Background script error:', event.error);
});

// Log when service worker starts
console.log('Kanji Helper background service worker loaded');

// Simple kanji translation function (can be enhanced with real API)
async function translateText(text) {
  // Basic kanji dictionary - in a real app, this would use an API
  const kanjiDict = {
    '漢': { reading: 'かん/カン', meaning: 'Chinese character, man' },
    '字': { reading: 'じ/ジ', meaning: 'character, letter' },
    '日': { reading: 'にち/ニチ、ひ', meaning: 'day, sun' },
    '本': { reading: 'ほん/ホン、もと', meaning: 'book, origin' },
    '人': { reading: 'じん/ジン、ひと', meaning: 'person' },
    '大': { reading: 'だい/ダイ、おお', meaning: 'big, large' },
    '小': { reading: 'しょう/ショウ、ちい', meaning: 'small, little' },
    '山': { reading: 'さん/サン、やま', meaning: 'mountain' },
    '川': { reading: 'せん/セン、かわ', meaning: 'river' },
    '水': { reading: 'すい/スイ、みず', meaning: 'water' },
    '火': { reading: 'か/カ、ひ', meaning: 'fire' },
    '土': { reading: 'ど/ド、つち', meaning: 'earth, soil' },
    '木': { reading: 'もく/モク、き', meaning: 'tree, wood' },
    '金': { reading: 'きん/キン、かね', meaning: 'gold, money' },
    '学': { reading: 'がく/ガク、まな', meaning: 'study, learn' },
    '校': { reading: 'こう/コウ', meaning: 'school' },
    '生': { reading: 'せい/セイ、い', meaning: 'life, birth' },
    '先': { reading: 'せん/セン、さき', meaning: 'previous, ahead' },
    '年': { reading: 'ねん/ネン、とし', meaning: 'year' },
    '月': { reading: 'げつ/ゲツ、つき', meaning: 'month, moon' },
    '時': { reading: 'じ/ジ、とき', meaning: 'time' },
    '間': { reading: 'かん/カン、あいだ', meaning: 'interval, between' }
  };

  const results = [];
  
  // Analyze each character
  for (const char of text) {
    if (kanjiDict[char]) {
      results.push({
        character: char,
        reading: kanjiDict[char].reading,
        meaning: kanjiDict[char].meaning
      });
    } else if (char.match(/[\u3040-\u309F]/)) {
      // Hiragana
      results.push({
        character: char,
        reading: char,
        meaning: 'Hiragana character'
      });
    } else if (char.match(/[\u30A0-\u30FF]/)) {
      // Katakana
      results.push({
        character: char,
        reading: char,
        meaning: 'Katakana character'
      });
    } else if (char.match(/[\u4E00-\u9FAF]/)) {
      // Other kanji not in our dictionary
      results.push({
        character: char,
        reading: 'Unknown',
        meaning: 'Kanji character (not in dictionary)'
      });
    }
  }

  return {
    originalText: text,
    translations: results,
    timestamp: new Date().toISOString()
  };
}
