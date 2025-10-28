/**
 * CONTENT SCRIPT
 * 
 * This script is injected into every webpage and handles:
 * 1. Receiving messages from background script
 * 2. Creating translation popups on web pages
 * 3. Managing popup display and interactions
 * 4. Kanji dictionary and translation logic
 * 
 * It runs in the context of the webpage but has access to Chrome APIs
 */

console.log('Kanji Helper content script loaded');

/**
 * KANJI DICTIONARY
 * 
 * Built-in dictionary with kanji characters, readings, and meanings
 * Format: character -> {readings: [], meanings: [], type: 'kanji'|'hiragana'|'katakana'}
 */
const kanjiDictionary = {
  // Basic kanji characters
  '日': { readings: ['ニチ', 'ひ'], meanings: ['sun', 'day'], type: 'kanji' },
  '本': { readings: ['ホン', 'もと'], meanings: ['book', 'origin'], type: 'kanji' },
  '人': { readings: ['ジン', 'ひと'], meanings: ['person', 'people'], type: 'kanji' },
  '学': { readings: ['ガク', 'まな'], meanings: ['study', 'learn'], type: 'kanji' },
  '校': { readings: ['コウ'], meanings: ['school'], type: 'kanji' },
  '生': { readings: ['セイ', 'い'], meanings: ['life', 'birth'], type: 'kanji' },
  '先': { readings: ['セン', 'さき'], meanings: ['before', 'ahead'], type: 'kanji' },
  '年': { readings: ['ネン', 'とし'], meanings: ['year'], type: 'kanji' },
  '月': { readings: ['ゲツ', 'つき'], meanings: ['month', 'moon'], type: 'kanji' },
  '時': { readings: ['ジ', 'とき'], meanings: ['time'], type: 'kanji' },
  '間': { readings: ['カン', 'あいだ'], meanings: ['interval', 'between'], type: 'kanji' },
  
  // Element kanji
  '水': { readings: ['スイ', 'みず'], meanings: ['water'], type: 'kanji' },
  '火': { readings: ['カ', 'ひ'], meanings: ['fire'], type: 'kanji' },
  '土': { readings: ['ド', 'つち'], meanings: ['earth', 'soil'], type: 'kanji' },
  '木': { readings: ['モク', 'き'], meanings: ['tree', 'wood'], type: 'kanji' },
  '金': { readings: ['キン', 'かね'], meanings: ['gold', 'money'], type: 'kanji' },
  '山': { readings: ['サン', 'やま'], meanings: ['mountain'], type: 'kanji' },
  '川': { readings: ['セン', 'かわ'], meanings: ['river'], type: 'kanji' },
  
  // Size kanji
  '大': { readings: ['ダイ', 'おお'], meanings: ['big', 'large'], type: 'kanji' },
  '小': { readings: ['ショウ', 'ちい'], meanings: ['small', 'little'], type: 'kanji' },
  
  // Additional useful kanji
  '漢': { readings: ['カン'], meanings: ['Chinese', 'Han'], type: 'kanji' },
  '字': { readings: ['ジ'], meanings: ['character', 'letter'], type: 'kanji' },
  '私': { readings: ['シ', 'わたし'], meanings: ['I', 'private'], type: 'kanji' },
  '語': { readings: ['ゴ'], meanings: ['language', 'word'], type: 'kanji' },
  '勉': { readings: ['ベン'], meanings: ['diligence', 'study'], type: 'kanji' },
  '強': { readings: ['キョウ', 'つよ'], meanings: ['strong'], type: 'kanji' }
};

/**
 * CHARACTER TYPE DETECTION
 * 
 * Determines if a character is hiragana, katakana, or kanji
 */
function getCharacterType(char) {
  const code = char.charCodeAt(0);
  
  // Hiragana range: U+3040–U+309F
  if (code >= 0x3040 && code <= 0x309F) {
    return 'hiragana';
  }
  
  // Katakana range: U+30A0–U+30FF
  if (code >= 0x30A0 && code <= 0x30FF) {
    return 'katakana';
  }
  
  // CJK Unified Ideographs (main kanji range): U+4E00–U+9FAF
  if (code >= 0x4E00 && code <= 0x9FAF) {
    return 'kanji';
  }
  
  // Other character types
  return 'other';
}

/**
 * TEXT TRANSLATION FUNCTION
 * 
 * Processes Japanese text character by character
 * Returns array of character objects with translation info
 */
function translateText(text) {
  const results = [];
  
  // Process each character individually
  for (let char of text) {
    // Skip whitespace and punctuation
    if (char.match(/\s/)) {
      continue;
    }
    
    const type = getCharacterType(char);
    let charInfo = {
      character: char,
      type: type,
      readings: [],
      meanings: []
    };
    
    // Look up character in dictionary
    if (kanjiDictionary[char]) {
      charInfo.readings = kanjiDictionary[char].readings;
      charInfo.meanings = kanjiDictionary[char].meanings;
      charInfo.inDictionary = true;
    } else {
      // Character not in dictionary
      charInfo.inDictionary = false;
      if (type === 'kanji') {
        charInfo.meanings = ['Not in dictionary'];
      } else if (type === 'hiragana') {
        charInfo.meanings = ['Hiragana character'];
      } else if (type === 'katakana') {
        charInfo.meanings = ['Katakana character'];
      }
    }
    
    results.push(charInfo);
  }
  
  return results;
}

/**
 * POPUP CREATION FUNCTION
 * 
 * Creates and displays the translation popup on the webpage
 */
function createTranslationPopup(text, x, y) {
  // Remove any existing popup
  removeExistingPopup();
  
  console.log('Creating translation popup for:', text);
  
  // Translate the text
  const translations = translateText(text);
  
  if (translations.length === 0) {
    console.log('No translations found');
    return;
  }
  
  // Create popup container
  const popup = document.createElement('div');
  popup.id = 'kanji-helper-popup';
  popup.className = 'kanji-helper-popup';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'kanji-popup-header';
  header.innerHTML = `
    <span class="kanji-popup-title">🎌 Kanji Helper</span>
    <button class="kanji-popup-close" onclick="this.closest('.kanji-helper-popup').remove()">×</button>
  `;
  
  // Create content area
  const content = document.createElement('div');
  content.className = 'kanji-popup-content';
  
  // Add original text
  const originalText = document.createElement('div');
  originalText.className = 'kanji-original-text';
  originalText.textContent = `Original: ${text}`;
  content.appendChild(originalText);
  
  // Create character cards
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'kanji-cards-container';
  
  translations.forEach(charInfo => {
    const card = document.createElement('div');
    card.className = 'kanji-character-card';
    
    // Character display
    const charElement = document.createElement('div');
    charElement.className = 'kanji-character';
    charElement.textContent = charInfo.character;
    
    // Type label
    const typeElement = document.createElement('div');
    typeElement.className = 'kanji-type';
    typeElement.textContent = charInfo.type;
    
    // Readings
    const readingsElement = document.createElement('div');
    readingsElement.className = 'kanji-readings';
    if (charInfo.readings.length > 0) {
      readingsElement.textContent = charInfo.readings.join(', ');
    }
    
    // Meanings
    const meaningsElement = document.createElement('div');
    meaningsElement.className = 'kanji-meanings';
    meaningsElement.textContent = charInfo.meanings.join(', ');
    
    // Dictionary status
    if (!charInfo.inDictionary && charInfo.type === 'kanji') {
      card.classList.add('not-in-dictionary');
    }
    
    // Assemble card
    card.appendChild(charElement);
    card.appendChild(typeElement);
    if (charInfo.readings.length > 0) {
      card.appendChild(readingsElement);
    }
    card.appendChild(meaningsElement);
    
    cardsContainer.appendChild(card);
  });
  
  content.appendChild(cardsContainer);
  
  // Assemble popup
  popup.appendChild(header);
  popup.appendChild(content);
  
  // Position popup near cursor
  popup.style.position = 'fixed';
  popup.style.left = Math.min(x, window.innerWidth - 400) + 'px';
  popup.style.top = Math.min(y, window.innerHeight - 300) + 'px';
  popup.style.zIndex = '10000';
  
  // Add to page
  document.body.appendChild(popup);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (document.getElementById('kanji-helper-popup')) {
      popup.remove();
    }
  }, 10000);
  
  console.log('Translation popup created with', translations.length, 'characters');
}

/**
 * UTILITY FUNCTIONS
 */

// Remove any existing popup
function removeExistingPopup() {
  const existingPopup = document.getElementById('kanji-helper-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
}

// Close popup when clicking outside
document.addEventListener('click', (event) => {
  const popup = document.getElementById('kanji-helper-popup');
  if (popup && !popup.contains(event.target)) {
    popup.remove();
  }
});

// Close popup with Escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    removeExistingPopup();
  }
});

/**
 * MESSAGE LISTENER
 * 
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.action === 'translateText') {
    // Get mouse position for popup placement
    // Since we don't have exact click coordinates, use center of viewport
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    
    // Create translation popup
    createTranslationPopup(request.text, x, y);
    
    // Send response back to background script
    sendResponse({success: true, text: request.text});
  }
  
  // Return true to indicate we'll send response asynchronously
  return true;
});

/**
 * INITIALIZATION
 * 
 * Set up content script when page loads
 */
console.log('Kanji Helper content script ready. Dictionary contains', Object.keys(kanjiDictionary).length, 'characters');
