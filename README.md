# Kanji Helper Chrome Extension

A Chrome extension I made to help me learn Japanese kanji. Select any Japanese text on a webpage, right-click, and get instant translations with readings and meanings. There's also a popup interface with search, history, and settings.

## Features

- **Right-click translations** - Select text on any page and translate it instantly
- **Interactive popup** - Click the extension icon to access search, history, and settings
- **Character breakdown** - See individual kanji with their readings (both on'yomi and kun'yomi)
- **Translation history** - Automatically saves your last 50 translations
- **Customizable** - Toggle auto-hide, readings, and meanings on/off

## Installation

1. Download or clone this repo
2. Open Chrome and go to `chrome://extensions/`
3. Turn on "Developer mode" (top right)
4. Click "Load unpacked" and select the `kanji-helper-extension` folder
5. You should see the Kanji Helper icon in your toolbar

## How to Use

### Method 1: Right-click Translation
1. Go to any webpage with Japanese text
2. Select some Japanese text
3. Right-click and choose "Translate with Kanji Helper"
4. A popup appears with the translation

### Method 2: Extension Popup
1. Click the extension icon in your toolbar
2. Use the navigation menu to access different sections:
   - Home - Quick overview
   - Search - Look up kanji
   - Translation - Manually translate text
   - History - See past translations
   - Settings - Customize behavior

## Testing

I included some test files you can use:
- `quick-test.html` - Simple test with basic kanji
- `test-page.html` - More comprehensive test
- `demo.html` - Full feature demo

Or try these sample texts:
```
日本人は漢字を学校で学びます。
私は日本語を勉強しています。
水 火 土 木 金 大 小 山 川
```

## What's in the Dictionary

Right now it supports 22+ basic kanji characters:
- Common ones: 日, 本, 人, 学, 校, 生, 先, 年, 月, 時, 間
- Elements: 水, 火, 土, 木, 金, 山, 川
- Sizes: 大, 小

Plus all hiragana and katakana are recognized. Unknown kanji will be marked but not translated.

## What I Learned

This was my first Chrome extension, and it taught me a lot:

- **Chrome Extension APIs** - Context menus, content scripts, background workers
- **Manifest V3** - The newer (and more complicated) extension format
- **Content Script Injection** - Adding elements to existing webpages
- **Chrome Storage API** - Saving user preferences and history
- **TypeScript** - Used it for better code organization

The trickiest part was getting content scripts to communicate with the background service worker. Chrome's permission system can be pretty strict!

## Development

If you want to modify the code:

```bash
# Compile TypeScript (if you modify popup.ts)
npx tsc popup.ts --target es2020 --outDir . --skipLibCheck
```

After making changes, go to `chrome://extensions/` and click the refresh icon on the extension.

## Future Ideas

Some things I'd like to add eventually:
- Audio pronunciations
- More kanji in the dictionary (or connect to an API)
- Flashcard system
- Stroke order animations
- Export translations to a file

## License

MIT - do whatever you want with it!
