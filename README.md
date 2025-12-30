# Scrum Sidekick

A Chrome browser extension designed to help Scrum Masters efficiently manage daily stand-ups and team meetings.

<img width="472" height="1233" alt="Screenshot 2025-12-29 201612" src="https://github.com/user-attachments/assets/3a638828-d0ea-4fa5-9297-fb27ef0c88eb" />

<img width="473" height="1233" alt="image" src="https://github.com/user-attachments/assets/d4e7e27e-4686-46d6-83a3-e8e05019fcb8" />


## Overview

Scrum Sidekick is a sidebar extension that provides essential meeting management tools in a convenient side panel. Track team participation, manage follow-up topics, and keep meetings on schedule - all without leaving your browser.

## Features

- **Speaker Tracking**: Keep track of which team members have already spoken during the meeting
- **Follow-up Management**: Capture and manage follow-up topics that arise during discussions
- **Time Management**: Monitor remaining meeting time to ensure efficient use of everyone's schedule

## Installation

### From Source

1. Clone this repository or download the source code:
   ```bash
   git clone https://github.com/yourusername/scrum-sidekick.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" using the toggle in the top right corner

4. Click "Load unpacked" and select the directory containing the extension files

5. The Scrum Sidekick icon should now appear in your Chrome toolbar

## Usage

1. Click the Scrum Sidekick icon in your Chrome toolbar to open the side panel

2. **Track Speakers**: Mark team members as they speak during the meeting

3. **Add Follow-ups**: Capture any topics that need follow-up discussion

4. **Monitor Time**: Keep an eye on the remaining meeting time to stay on schedule

## Technical Details

- **Manifest Version**: 3
- **Version**: 1.2
- **Permissions**: Side Panel API

## Project Structure

```
scrum-sidekick/
├── manifest.json       # Extension configuration
├── background.js       # Background service worker
├── popup.html          # Side panel UI
├── script.js           # Main application logic
├── style.css           # Styling
└── images/             # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Development

This extension uses Chrome's Side Panel API to provide a persistent sidebar interface. The extension is built with vanilla JavaScript, HTML, and CSS for simplicity and performance.

### Files

- [`manifest.json`](manifest.json) - Extension manifest and configuration
- [`background.js`](background.js) - Service worker for background tasks
- [`popup.html`](popup.html) - Side panel HTML structure
- [`script.js`](script.js) - Application logic and event handlers
- [`style.css`](style.css) - UI styling

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve Scrum Sidekick.

## License

MIT

## Support

For questions or issues, please [open an issue](https://github.com/yourusername/scrum-sidekick/issues) on GitHub.
