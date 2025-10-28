/**
 * POPUP SCRIPT - MAIN INTERFACE CONTROLLER
 * 
 * This is the main JavaScript file for the Kanji Helper popup interface.
 * It manages a 5-section interactive popup with navigation, translation,
 * search, history, and settings functionality.
 * 
 * Key Features:
 * - Class-based architecture for organization
 * - Section navigation system
 * - Real-time kanji translation
 * - Search through built-in dictionary
 * - Translation history with persistence
 * - User settings with local storage
 * - Modern UI with loading states and animations
 */

/**
 * MAIN POPUP CLASS
 * 
 * Central controller for all popup functionality.
 * Handles initialization, event management, and data persistence.
 */
class KanjiHelperPopup {
    constructor() {
        // Current active section in the navigation
        this.currentSection = 'Home';
        
        // Array to store translation history
        this.translationHistory = [];
        
        // User settings with defaults
        this.settings = {
            autoHide: true,        // Auto-hide webpage popups
            showReadings: true,    // Show kanji readings in results
            showMeanings: true     // Show kanji meanings in results
        };
        
        // Start the popup initialization process
        this.initializePopup();
    }

    /**
     * INITIALIZATION METHOD
     * 
     * Sets up the popup when it first loads:
     * 1. Load saved settings from storage
     * 2. Load translation history from storage
     * 3. Set up all event listeners
     * 4. Initialize the home section
     * 5. Start the real-time clock
     */
    async initializePopup() {
        await this.loadSettings();
        await this.loadTranslationHistory();
        this.setupEventListeners();
        this.updateDateTime();
        this.showSection('Home');
        
        // Update the clock display every second
        setInterval(() => this.updateDateTime(), 1000);
    }

    /**
     * EVENT LISTENERS SETUP
     * 
     * Attaches event listeners to all interactive elements in the popup.
     * This includes navigation, buttons, inputs, and toggles.
     */
    setupEventListeners() {
        // NAVIGATION SYSTEM
        // Handle clicks on sidebar navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // HOME SECTION
        // "Learn More" button on home page
        const learnMoreBtn = document.getElementById('learnMoreBtn');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                this.showSection('Translation');
            });
        }

        // TRANSLATION SECTION
        const translateBtn = document.getElementById('translateBtn');
        const clearBtn = document.getElementById('clearBtn');
        const translationInput = document.getElementById('translationInput');

        // Translate button - process the input text
        if (translateBtn) {
            translateBtn.addEventListener('click', () => {
                const text = translationInput?.value?.trim();
                if (text) {
                    this.translateText(text);
                }
            });
        }

        // Clear button - reset input and results
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (translationInput) {
                    translationInput.value = '';
                }
                this.clearTranslationResults();
            });
        }

        // Keyboard shortcut: Ctrl+Enter to translate
        if (translationInput) {
            translationInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    const text = translationInput.value.trim();
                    if (text) {
                        this.translateText(text);
                    }
                }
            });
        }

        // SEARCH SECTION
        // Live search as user types
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchKanji(e.target.value);
            });
        }

        // HISTORY SECTION
        // Clear all translation history
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                this.clearHistory();
            });
        }

        // SETTINGS SECTION
        // Toggle switches for user preferences
        const autoHideToggle = document.getElementById('autoHideToggle');
        const showReadingsToggle = document.getElementById('showReadingsToggle');
        const showMeaningsToggle = document.getElementById('showMeaningsToggle');

        // Auto-hide webpage popups setting
        if (autoHideToggle) {
            autoHideToggle.checked = this.settings.autoHide;
            autoHideToggle.addEventListener('change', (e) => {
                this.settings.autoHide = e.target.checked;
                this.saveSettings();
            });
        }

        // Show readings in translation results
        if (showReadingsToggle) {
            showReadingsToggle.checked = this.settings.showReadings;
            showReadingsToggle.addEventListener('change', (e) => {
                this.settings.showReadings = e.target.checked;
                this.saveSettings();
            });
        }

        // Show meanings in translation results
        if (showMeaningsToggle) {
            showMeaningsToggle.checked = this.settings.showMeanings;
            showMeaningsToggle.addEventListener('change', (e) => {
                this.settings.showMeanings = e.target.checked;
                this.saveSettings();
            });
        }
    }

    /**
     * SECTION NAVIGATION SYSTEM
     * 
     * Handles switching between the 5 main sections:
     * Home, Search, Translation, History, Settings
     * 
     * @param {string} sectionName - The name of the section to show
     */
    showSection(sectionName) {
        // Remove active state from all navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Hide all content areas
        document.querySelectorAll('.content-area').forEach(area => {
            area.classList.remove('active');
        });

        // Show the selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
        }

        // Highlight the active navigation item
        const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Load section-specific content when needed
        if (sectionName === 'History') {
            this.displayHistory();
        }
    }

    /**
     * TEXT TRANSLATION PROCESSOR
     * 
     * Main translation function that:
     * 1. Validates input text
     * 2. Shows loading state
     * 3. Processes text through background script
     * 4. Displays results or error messages
     * 5. Saves successful translations to history
     * 
     * @param {string} text - Japanese text to translate
     */
    async translateText(text) {
        if (!text) return;

        const resultsDiv = document.getElementById('translationResults');
        if (!resultsDiv) return;

        // Show loading spinner while processing
        resultsDiv.innerHTML = `
            <div class="flex items-center justify-center text-teal-400 py-4">
                <div class="spinner mr-3"></div>
                <span>Translating...</span>
            </div>
        `;

        try {
            // Send text to background script for processing
            const response = await this.sendMessage({ action: 'translateText', text });
            
            if (response && response.translations) {
                // Display successful translation results
                this.displayTranslationResults(response, resultsDiv);
                // Save to history for later reference
                this.saveTranslationToHistory(response);
            } else {
                throw new Error('No translation received');
            }
        } catch (error) {
            console.error('Translation error:', error);
            // Show user-friendly error message
            resultsDiv.innerHTML = `
                <div class="text-red-400 text-center py-4">
                    <div class="mb-2">❌ Translation failed</div>
                    <div class="text-sm">Please try again or check your connection</div>
                </div>
            `;
        }
    }

    /**
     * TRANSLATION RESULTS DISPLAY
     * 
     * Creates and displays formatted translation results with:
     * - Original text display
     * - Character-by-character breakdown
     * - Readings and meanings for each character
     * - Visual cards with hover effects
     * 
     * @param {Object} result - Translation result from background script
     * @param {HTMLElement} container - DOM element to display results in
     */
    displayTranslationResults(result, container) {
        // Header showing original text
        let html = `
            <div class="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-teal-500 mb-4">
                <div class="text-sm text-gray-400 mb-2">Original Text:</div>
                <div class="text-2xl font-bold text-center text-teal-300">${result.originalText}</div>
            </div>
        `;

        // Individual character cards
        if (result.translations && result.translations.length > 0) {
            result.translations.forEach(trans => {
                html += `
                    <div class="translation-char">
                        <div class="flex items-center gap-4">
                            <div class="character-display">${trans.character}</div>
                            <div class="character-info">
                                <div class="character-type">${trans.type.toUpperCase()}</div>
                                ${trans.readings && trans.readings.length > 0 ? 
                                    `<div class="character-readings">${trans.readings.join(', ')}</div>` : ''
                                }
                                <div class="character-meanings">${trans.meanings.join(', ')}</div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            // No translations found message
            html += `
                <div class="text-center text-gray-400 py-8">
                    <div class="text-4xl mb-4">🤔</div>
                    <div>No characters found to translate</div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    /**
     * CLEAR TRANSLATION RESULTS
     * 
     * Removes all translation results from the display area
     */
    clearTranslationResults() {
        const resultsDiv = document.getElementById('translationResults');
        if (resultsDiv) {
            resultsDiv.innerHTML = '';
        }
    }

    /**
     * TRANSLATION HISTORY MANAGEMENT
     * 
     * Saves a translation result to the history array and persists to storage.
     * Maintains a maximum of 50 entries to prevent unlimited growth.
     * 
     * @param {Object} result - Translation result to save
     */
    async saveTranslationToHistory(result) {
        const historyEntry = {
            originalText: result.originalText,
            translations: result.translations,
            timestamp: new Date().toISOString(),
            id: Date.now() // Simple unique ID
        };

        // Add to beginning of array (most recent first)
        this.translationHistory.unshift(historyEntry);
        
        // Keep only the 50 most recent translations
        if (this.translationHistory.length > 50) {
            this.translationHistory = this.translationHistory.slice(0, 50);
        }

        // Persist to Chrome storage
        try {
            await chrome.storage.local.set({ 
                translationHistory: this.translationHistory 
            });
        } catch (error) {
            console.error('Failed to save translation history:', error);
        }
    }

    /**
     * LOAD TRANSLATION HISTORY
     * 
     * Retrieves saved translation history from Chrome storage on startup
     */
    async loadTranslationHistory() {
        try {
            const result = await chrome.storage.local.get(['translationHistory']);
            if (result.translationHistory) {
                this.translationHistory = result.translationHistory;
            }
        } catch (error) {
            console.error('Failed to load translation history:', error);
            this.translationHistory = [];
        }
    }

    /**
     * HISTORY DISPLAY GENERATOR
     * 
     * Creates HTML for the history section showing all saved translations
     * with timestamps and the ability to view character breakdowns
     */
    displayHistory() {
        const historyContainer = document.getElementById('historyList');
        if (!historyContainer) return;

        if (this.translationHistory.length === 0) {
            historyContainer.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    <div class="text-4xl mb-4">📚</div>
                    <div class="mb-2">No translation history yet</div>
                    <div class="text-sm">Try translating some Japanese text first!</div>
                </div>
            `;
            return;
        }

        let html = '';
        this.translationHistory.forEach(entry => {
            const date = new Date(entry.timestamp);
            const timeString = date.toLocaleString();
            
            html += `
                <div class="history-item">
                    <div class="flex justify-between items-start mb-2">
                        <div class="text-lg font-bold text-teal-300">${entry.originalText}</div>
                        <div class="text-xs text-gray-400">${timeString}</div>
                    </div>
                    <div class="text-sm text-gray-300 mb-3">
                        ${entry.translations.length} character${entry.translations.length !== 1 ? 's' : ''} translated
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        ${entry.translations.map(trans => `
                            <div class="bg-gray-800 bg-opacity-50 p-2 rounded border border-gray-600">
                                <div class="text-center text-teal-400 text-xl font-bold mb-1">${trans.character}</div>
                                <div class="text-xs text-center text-gray-400">${trans.type}</div>
                                ${trans.readings && trans.readings.length > 0 ? 
                                    `<div class="text-xs text-center text-yellow-400">${trans.readings.join(', ')}</div>` : ''
                                }
                                <div class="text-xs text-center text-gray-300">${trans.meanings.join(', ')}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        historyContainer.innerHTML = html;
    }

    /**
     * CLEAR ALL HISTORY
     * 
     * Removes all translation history from memory and storage
     */
    async clearHistory() {
        this.translationHistory = [];
        try {
            await chrome.storage.local.set({ translationHistory: [] });
            this.displayHistory(); // Refresh the display
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    }

    /**
     * KANJI SEARCH FUNCTIONALITY
     * 
     * Searches through the built-in kanji dictionary and displays results.
     * Searches character, readings, and meanings for matches.
     * 
     * @param {string} query - Search term entered by user
     */
    searchKanji(query) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;

        // Clear results if no query
        if (!query.trim()) {
            resultsContainer.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    <div class="text-4xl mb-4">🔍</div>
                    <div>Enter a character, reading, or meaning to search</div>
                </div>
            `;
            return;
        }

        // Built-in kanji dictionary for searching
        const kanjiDictionary = {
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
            '水': { readings: ['スイ', 'みず'], meanings: ['water'], type: 'kanji' },
            '火': { readings: ['カ', 'ひ'], meanings: ['fire'], type: 'kanji' },
            '土': { readings: ['ド', 'つち'], meanings: ['earth', 'soil'], type: 'kanji' },
            '木': { readings: ['モク', 'き'], meanings: ['tree', 'wood'], type: 'kanji' },
            '金': { readings: ['キン', 'かね'], meanings: ['gold', 'money'], type: 'kanji' },
            '山': { readings: ['サン', 'やま'], meanings: ['mountain'], type: 'kanji' },
            '川': { readings: ['セン', 'かわ'], meanings: ['river'], type: 'kanji' },
            '大': { readings: ['ダイ', 'おお'], meanings: ['big', 'large'], type: 'kanji' },
            '小': { readings: ['ショウ', 'ちい'], meanings: ['small', 'little'], type: 'kanji' },
            '漢': { readings: ['カン'], meanings: ['Chinese', 'Han'], type: 'kanji' },
            '字': { readings: ['ジ'], meanings: ['character', 'letter'], type: 'kanji' },
            '私': { readings: ['シ', 'わたし'], meanings: ['I', 'private'], type: 'kanji' },
            '語': { readings: ['ゴ'], meanings: ['language', 'word'], type: 'kanji' }
        };

        // Search through dictionary
        const results = [];
        const searchTerm = query.toLowerCase();

        Object.entries(kanjiDictionary).forEach(([char, info]) => {
            // Check if query matches character, readings, or meanings
            const matchesChar = char === query;
            const matchesReading = info.readings.some(reading => 
                reading.toLowerCase().includes(searchTerm)
            );
            const matchesMeaning = info.meanings.some(meaning => 
                meaning.toLowerCase().includes(searchTerm)
            );

            if (matchesChar || matchesReading || matchesMeaning) {
                results.push({ character: char, ...info });
            }
        });

        // Display search results
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    <div class="text-4xl mb-4">❌</div>
                    <div>No results found for "${query}"</div>
                    <div class="text-sm mt-2">Try searching for a different character, reading, or meaning</div>
                </div>
            `;
            return;
        }

        // Generate HTML for search results
        let html = `<div class="mb-4 text-sm text-gray-400">Found ${results.length} result${results.length !== 1 ? 's' : ''}</div>`;
        
        results.forEach(result => {
            html += `
                <div class="search-result-item cursor-pointer" onclick="kanjiHelper.fillTranslationInput('${result.character}')">
                    <div class="flex items-center gap-4">
                        <div class="character-display">${result.character}</div>
                        <div class="character-info">
                            <div class="character-type">${result.type.toUpperCase()}</div>
                            ${result.readings.length > 0 ? 
                                `<div class="character-readings">${result.readings.join(', ')}</div>` : ''
                            }
                            <div class="character-meanings">${result.meanings.join(', ')}</div>
                        </div>
                    </div>
                </div>
            `;
        });

        resultsContainer.innerHTML = html;
    }

    /**
     * FILL TRANSLATION INPUT
     * 
     * Helper method to fill the translation input with a character
     * from search results. Switches to translation section automatically.
     * 
     * @param {string} character - Character to fill into translation input
     */
    fillTranslationInput(character) {
        const translationInput = document.getElementById('translationInput');
        if (translationInput) {
            translationInput.value = character;
            this.showSection('Translation');
            translationInput.focus();
        }
    }

    /**
     * SETTINGS MANAGEMENT
     * 
     * Load user settings from Chrome storage
     */
    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['kanjiHelperSettings']);
            if (result.kanjiHelperSettings) {
                this.settings = { ...this.settings, ...result.kanjiHelperSettings };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    /**
     * SAVE SETTINGS
     * 
     * Persist current settings to Chrome storage
     */
    async saveSettings() {
        try {
            await chrome.storage.local.set({ 
                kanjiHelperSettings: this.settings 
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    /**
     * CHROME EXTENSION MESSAGING
     * 
     * Utility method to send messages to background script and handle responses
     * 
     * @param {Object} message - Message object to send
     * @returns {Promise} Promise that resolves with the response
     */
    sendMessage(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });
    }

    /**
     * REAL-TIME CLOCK
     * 
     * Updates the date and time display on the home section
     */
    updateDateTime() {
        const dateTimeElement = document.getElementById('currentDateTime');
        if (dateTimeElement) {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            dateTimeElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }
}

/**
 * POPUP INITIALIZATION
 * 
 * Create the main popup controller when the DOM is ready
 */
let kanjiHelper;

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    kanjiHelper = new KanjiHelperPopup();
});

/**
 * GLOBAL HELPER FUNCTIONS
 * 
 * Functions that can be called from HTML onclick attributes
 */

// Make fillTranslationInput globally accessible for onclick handlers
window.fillTranslationInput = (character) => {
    if (kanjiHelper) {
        kanjiHelper.fillTranslationInput(character);
    }
};
