import { create } from 'zustand';
import { appStorage } from './storage';
import { DEFAULT_THEME_ID, getTheme, Theme } from '../utils/themes';
import { Platform } from 'react-native';

const STORAGE_KEY = 'aether-theme-id';

interface ThemeState {
    themeId: string;
    theme: Theme;
    setTheme: (id: string) => void;
    hydrateTheme: () => Promise<void>;
}

function applyThemeToWeb(theme: Theme) {
    if (Platform.OS !== 'web') return;
    const root = document.documentElement;
    root.style.setProperty('--color-bg-from', theme.bgFrom);
    root.style.setProperty('--color-bg-to', theme.bgTo);
    root.style.setProperty('--color-card', theme.cardBg);
    root.style.setProperty('--color-surface', theme.surfaceBg);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-accent-light', theme.accentLight);
}

export const useThemeStore = create<ThemeState>((set) => ({
    themeId: DEFAULT_THEME_ID,
    theme: getTheme(DEFAULT_THEME_ID),

    setTheme: async (id: string) => {
        const theme = getTheme(id);
        applyThemeToWeb(theme);
        await appStorage.setItem(STORAGE_KEY, id);
        set({ themeId: id, theme });
    },

    hydrateTheme: async () => {
        try {
            const savedId = await appStorage.getItem(STORAGE_KEY);
            const id = savedId || DEFAULT_THEME_ID;
            const theme = getTheme(id);
            applyThemeToWeb(theme);
            set({ themeId: id, theme });
        } catch {
            const theme = getTheme(DEFAULT_THEME_ID);
            applyThemeToWeb(theme);
            set({ themeId: DEFAULT_THEME_ID, theme });
        }
    },
}));
