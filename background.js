class BasicColorTheme {
    constructor(frame, tab_background_text = '#111') {
        this.frame = frame;
        this.tab_background_text = tab_background_text;
        this.usage = 0;
        this.lastUsed = Math.random();
    }

    get browserThemeObject() {
        return {
            colors: {
                frame: this.frame,
                tab_background_text: this.tab_background_text,
            }
        };
    }
}

let themeOfWindowID = new Map();
const ALL_THEMES = [
    new BasicColorTheme('#062726'),
    new BasicColorTheme('#102B3F'),
    new BasicColorTheme('#6247AA'),
    new BasicColorTheme('#97ABB1'),
    new BasicColorTheme('#AA767C')
];

function getNextTheme() {
    const sortedThemes = [...ALL_THEMES];
    sortedThemes.sort((a, b) => {
        if (a.usage == b.usage) {
            return a.lastUsed > b.lastUsed;
        }
        return a.usage > b.usage;
    });
    return sortedThemes[0];
}

function applyThemeToWindow(window) {
    const newTheme = getNextTheme();
    browser.theme.update(window.id, newTheme.browserThemeObject);

    newTheme.usage += 1;
    newTheme.lastUsed = Date.now();
    themeOfWindowID.set(window.id, newTheme);
}

async function applyThemeToAllWindows() {
    for (const window of await browser.windows.getAll()) {
        applyThemeToWindow(window);
    }
}

function freeThemeOfDestroyedWindow(window_id) {
    const theme = themeOfWindowID.get(window_id);
    theme.usage -= 1;
    themeOfWindowID.delete(window_id);
}

browser.windows.onCreated.addListener(applyThemeToWindow);
browser.windows.onRemoved.addListener(freeThemeOfDestroyedWindow);
browser.runtime.onStartup.addListener(applyThemeToAllWindows);
browser.runtime.onInstalled.addListener(applyThemeToAllWindows);
