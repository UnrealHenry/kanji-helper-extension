// Background service worker for Kanji Helper Extension

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translateKanji",
    title: "Translate with Kanji Helper",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translateKanji" && info.selectionText && tab?.id) {
    // Send message to content script to show translation popup
    chrome.tabs.sendMessage(tab.id, {
      action: "showTranslation",
      text: info.selectionText
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translateText") {
    translateText(request.text).then(result => {
      sendResponse(result);
    });
    return true; // Will respond asynchronously
  }
});

// Simple kanji translation function (can be enhanced with real API)
async function translateText(text: string) {
  // Basic kanji dictionary - in a real app, this would use an API
  const kanjiDict: Record<string, { reading: string; meaning: string }> = {
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

  const results: Array<{
    character: string;
    reading: string;
    meaning: string;
  }> = [];
  
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