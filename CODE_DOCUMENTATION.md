# 📖 Kanji Helper Extension - Code Documentation

This document explains the structure and functionality of all code files in the Kanji Helper Chrome Extension.

## 🏗️ Architecture Overview

The extension uses Chrome Extension Manifest V3 architecture with:
- **Background Service Worker**: Handles context menus and background tasks
- **Content Scripts**: Injected into web pages for translation popups
- **Popup Interface**: Interactive 5-section popup when clicking extension icon
- **Local Storage**: Persistent settings and translation history

## 📁 File Structure & Explanations

### 🔧 `manifest.json` - Extension Configuration
```json
{
  "manifest_version": 3,     // Chrome Extension Manifest V3
  "name": "Kanji Helper",    // Extension name
  "permissions": [           // Required permissions:
    "contextMenus",          //   - Right-click menu creation
    "activeTab",             //   - Access to current tab
    "storage"                //   - Local data storage
  ],
  "background": {
    "service_worker": "background.js"  // Background script
  },
  "content_scripts": [{      // Scripts injected into web pages
    "matches": ["<all_urls>"],         // Run on all websites
    "js": ["content.js"],              // JavaScript for interaction
    "css": ["content.css"]             // Styles for popup
  }],
  "action": {
    "default_popup": "popup.html"     // Popup interface
  }
}
```

### 🔄 `background.js` - Service Worker (3.6KB)
**Purpose**: Runs in background, handles context menus and messaging

**Key Functions**:
```javascript
chrome.runtime.onInstalled.addListener(() => {
  // Creates right-click context menu item
  chrome.contextMenus.create({
    id: "translateKanji",
    title: "Translate with Kanji Helper",
    contexts: ["selection"]  // Only show when text is selected
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  // When user right-clicks selected text:
  // 1. Gets selected text from info.selectionText
  // 2. Sends message to content script to show popup
  chrome.tabs.sendMessage(tab.id, {
    action: "translateText",
    text: info.selectionText
  });
});
```

**Key Features**:
- Context menu creation on extension install
- Message routing between popup and content scripts
- Error handling for failed message sending

### 🌐 `content.js` - Web Page Injection (5.1KB)
**Purpose**: Injected into every webpage, creates translation popups

**Built-in Dictionary**: Contains 22+ kanji characters with readings and meanings
**Character Detection**: Identifies hiragana, katakana, and kanji using Unicode ranges
**Translation Logic**: Processes text character-by-character through dictionary
**Popup Creation**: Generates styled translation popup with glassmorphism effects

**Key Features**:
- Unicode character type detection (hiragana/katakana/kanji)
- Built-in dictionary with readings and meanings
- Dynamic popup creation with glassmorphism styling
- Auto-hide after 10 seconds
- Click-outside and Escape key closing
- Responsive positioning to stay within viewport

### 🎨 `content.css` - Webpage Popup Styles (1.8KB)
**Purpose**: Styles for translation popups that appear on web pages

**Key Features**:
- Glassmorphism design with blur effects
- Maximum z-index to appear above all content
- Responsive grid layout for character cards
- Hover animations and transitions
- Custom scrollbars
- Support for high contrast and reduced motion
- Mobile-responsive breakpoints

### 🖥️ `popup.html` - Main Interface (10KB)
**Purpose**: 5-section interactive popup interface

**Structure**:
- Fixed sidebar navigation with 5 sections
- Home: Welcome screen with real-time clock
- Search: Live dictionary search
- Translation: Manual text input and translation
- History: Saved translation history
- Settings: User preferences

**Key Features**:
- Fixed 600x500px popup size
- Sidebar navigation with icons
- Tailwind CSS for styling
- Glassmorphism effects throughout
- Responsive sections that show/hide

### ⚡ `popup.js` - Main Controller (17KB)
**Purpose**: Main JavaScript controller for popup functionality

**Class Structure**:
```javascript
class KanjiHelperPopup {
  constructor() {
    this.currentSection = 'Home';
    this.translationHistory = [];     // Array of saved translations
    this.settings = {                 // User preferences
      autoHide: true,
      showReadings: true,
      showMeanings: true
    };
  }
}
```

**Key Methods**:
- `initializePopup()`: Sets up the entire interface
- `setupEventListeners()`: Attaches all click/input handlers
- `showSection()`: Navigation between 5 sections
- `translateText()`: Main translation processing
- `searchKanji()`: Live dictionary search
- `saveTranslationToHistory()`: Persistent history storage
- `updateDateTime()`: Real-time clock display

## 🔄 Data Flow

### Right-click Translation Flow:
1. User selects text on webpage
2. Right-clicks → "Translate with Kanji Helper"
3. `background.js` receives context menu click
4. Sends message to `content.js` with selected text
5. `content.js` processes text through built-in dictionary
6. Creates styled popup on webpage with results
7. Auto-hides after 10 seconds

### Popup Translation Flow:
1. User clicks extension icon → `popup.html` opens
2. User navigates to Translation section
3. Enters text in input field
4. Clicks Translate or presses Ctrl+Enter
5. `popup.js` processes text (same logic as content script)
6. Displays results in formatted cards
7. Saves translation to history in Chrome storage

## 💾 Data Storage

**Chrome Storage Usage**:
- Settings: User preferences (autoHide, showReadings, showMeanings)
- History: Up to 50 recent translations with timestamps
- Persistent across browser sessions

## 🎨 Styling Architecture

**Design System**:
- Colors: Blue gradient theme with cyan accents
- Effects: Glassmorphism with backdrop blur
- Typography: System fonts with proper hierarchy
- Animations: Smooth transitions and hover effects
- Layout: CSS Grid and Flexbox for responsive design

## 🔧 Built-in Dictionary

The extension includes 22+ common kanji characters with:
- On'yomi and Kun'yomi readings
- English meanings
- Character type classification
- Basic kanji, elements, and common characters

## 🚀 Performance Optimizations

1. Lazy loading of section content
2. Event delegation for efficient handling
3. Storage limits (50 history entries max)
4. Debounced search functionality
5. Hardware-accelerated CSS animations
6. Proper memory management

This architecture provides a robust, performant, and user-friendly kanji learning experience! 