export const appStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(name);
            }
        } catch (e) { }
        return null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(name, value);
            }
        } catch (e) { }
    },
    removeItem: async (name: string): Promise<void> => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(name);
            }
        } catch (e) { }
    }
};
