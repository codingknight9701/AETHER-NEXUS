export interface Theme {
    id: string;
    name: string;
    emoji: string;
    description: string;
    // Backgrounds
    bgFrom: string;
    bgTo: string;
    // Cards & surfaces
    cardBg: string;
    surfaceBg: string;
    // Accent color
    accent: string;
    accentLight: string; // lighter shade for tags, borders
    accentDim: string;   // very dim for card borders
    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    // Overlay
    overlayColor: string;
}

export const THEMES: Record<string, Theme> = {
    void: {
        id: 'void',
        name: 'Void',
        emoji: '🌌',
        description: 'Mysterious · Deep Space',
        bgFrom: '#0D1117',
        bgTo: '#111827',
        cardBg: '#1C2333',
        surfaceBg: '#161B22',
        accent: '#7D5FFF',
        accentLight: '#A080FF',
        accentDim: 'rgba(125, 95, 255, 0.35)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.8)',
        textMuted: 'rgba(255,255,255,0.5)',
        overlayColor: 'rgba(13, 17, 23, 0.65)',
    },
    inferno: {
        id: 'inferno',
        name: 'Inferno',
        emoji: '🔥',
        description: 'Intense · Passionate',
        bgFrom: '#120808',
        bgTo: '#200A0A',
        cardBg: '#1F1010',
        surfaceBg: '#180C0C',
        accent: '#FF4444',
        accentLight: '#FF7777',
        accentDim: 'rgba(255, 68, 68, 0.35)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.85)',
        textMuted: 'rgba(255,220,220,0.55)',
        overlayColor: 'rgba(18, 8, 8, 0.65)',
    },
    forest: {
        id: 'forest',
        name: 'Forest',
        emoji: '🌿',
        description: 'Calm · Grounded',
        bgFrom: '#061208',
        bgTo: '#0A1C0F',
        cardBg: '#111F16',
        surfaceBg: '#0D1A11',
        accent: '#22C55E',
        accentLight: '#4ADE80',
        accentDim: 'rgba(34, 197, 94, 0.35)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.85)',
        textMuted: 'rgba(200,255,220,0.55)',
        overlayColor: 'rgba(6, 18, 8, 0.65)',
    },
    amber: {
        id: 'amber',
        name: 'Amber',
        emoji: '🌅',
        description: 'Cozy · Creative',
        bgFrom: '#130E05',
        bgTo: '#1F1608',
        cardBg: '#201808',
        surfaceBg: '#1A1206',
        accent: '#F59E0B',
        accentLight: '#FBC34A',
        accentDim: 'rgba(245, 158, 11, 0.35)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.85)',
        textMuted: 'rgba(255, 240, 200, 0.55)',
        overlayColor: 'rgba(19, 14, 5, 0.65)',
    },
    arctic: {
        id: 'arctic',
        name: 'Arctic',
        emoji: '🧊',
        description: 'Clear · Minimal',
        bgFrom: '#060A14',
        bgTo: '#0A1428',
        cardBg: '#0F1F35',
        surfaceBg: '#0A1828',
        accent: '#38BDF8',
        accentLight: '#7DD3F8',
        accentDim: 'rgba(56, 189, 248, 0.35)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.88)',
        textMuted: 'rgba(200,235,255,0.55)',
        overlayColor: 'rgba(6, 10, 20, 0.65)',
    },
};

export const THEME_ORDER: string[] = ['void', 'inferno', 'forest', 'amber', 'arctic'];
export const DEFAULT_THEME_ID = 'void';

export function getTheme(id: string): Theme {
    return THEMES[id] || THEMES[DEFAULT_THEME_ID];
}
