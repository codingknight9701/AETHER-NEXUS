import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const VAULT_DIR = Platform.OS === 'web' ? '' : `${FileSystem.documentDirectory}AetherVault/`;
const THOUGHTS_DIR = Platform.OS === 'web' ? '' : `${VAULT_DIR}thoughts/`;

const WEB_STORAGE_KEY = 'aether_thoughts_web';

// Helper to get web data
const getWebData = (): Record<string, string> => {
    try {
        const data = localStorage.getItem(WEB_STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
};

const saveWebData = (data: Record<string, string>) => {
    try {
        localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('LocalStorage error', e);
    }
};

export interface GraphNode {
    id: string; // The tag name or note id
    label: string; // The tag name
    content: string; // Not strictly used for tags, but we'll keep for backward comp or use as list of notes
    backlinks: string[];
    frequency?: number; // Count of notes with this tag
    type?: 'tag' | 'note';
}

export interface GraphLink {
    source: string;
    target: string;
}

export const initVault = async () => {
    if (Platform.OS === 'web') {
        const data = getWebData();
        if (Object.keys(data).length === 0) {
            await seedVault();
        }
        return;
    }

    const dirInfo = await FileSystem.getInfoAsync(THOUGHTS_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(THOUGHTS_DIR, { intermediates: true });
        await seedVault(); // Seed with dummy data on first create
    }
};

export const resetVault = async () => {
    if (Platform.OS === 'web') {
        localStorage.removeItem(WEB_STORAGE_KEY);
        await initVault();
        return;
    }

    const dirInfo = await FileSystem.getInfoAsync(VAULT_DIR);
    if (dirInfo.exists) {
        await FileSystem.deleteAsync(VAULT_DIR, { idempotent: true });
    }
    await initVault();
};

const seedVault = async () => {
    await saveThought('Moaz Ahmed', 'The brilliant mind behind this instance of Aether Nexus.');
    await saveThought('Aether Nexus', 'The central core of the second brain. It processes [[Thoughts]] using anti-gravity physics.');
    await saveThought('Thoughts', 'Fleeting ideas captured in markdown. [[Aether Nexus]] organizes them visually.');
};

export const saveThought = async (title: string, markdownContent: string) => {
    const filename = `${title.replace(/\s+/g, '-').toLowerCase()}.md`;

    if (Platform.OS === 'web') {
        const data = getWebData();
        data[filename] = markdownContent;
        saveWebData(data);
        return filename;
    }

    const uri = `${THOUGHTS_DIR}${filename}`;
    await FileSystem.writeAsStringAsync(uri, markdownContent);
    return filename;
};

export const parseLinks = (content: string): string[] => {
    // Matches anything inside [[ ]]
    const linkRegex = /\[\[(.*?)\]\]/g;
    const links: string[] = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
        links.push(match[1]);
    }

    return links;
};

export const readThought = async (id: string) => {
    try {
        let content = '';
        if (Platform.OS === 'web') {
            const data = getWebData();
            if (data[id]) {
                content = data[id];
            } else {
                return null;
            }
        } else {
            content = await FileSystem.readAsStringAsync(`${THOUGHTS_DIR}${id}`);
        }

        // Simple title extraction
        const title = id.replace('.md', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        const backlinks: string[] = []; // In a real system, you'd calculate these globally or cache them
        const outgoingLinks = parseLinks(content);

        return { id, title, content, links: outgoingLinks, backlinks };
    } catch (e) {
        return null;
    }
};

export const readAllThoughts = async () => {
    if (Platform.OS === 'web') {
        const data = getWebData();
        return Object.keys(data).map(filename => {
            const title = filename.replace('.md', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            return {
                id: filename,
                title,
                content: data[filename]
            };
        });
    }

    const files = await FileSystem.readDirectoryAsync(THOUGHTS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    const thoughts = await Promise.all(mdFiles.map(async (filename) => {
        const content = await FileSystem.readAsStringAsync(`${THOUGHTS_DIR}${filename}`);
        // Simple title extraction from filename (remove .md and replace dashes with spaces)
        const title = filename.replace('.md', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        return {
            id: filename,
            title,
            content
        };
    }));

    return thoughts;
};

// Helper to extract tags
export const extractTags = (content: string): string[] => {
    const rootMatches = content.match(/#[\w-]+/g) || [];
    return Array.from(new Set(rootMatches.map(tag => tag.substring(1))));
};

export const buildGraph = async () => {
    const files = await readAllThoughts();
    const nodes: Record<string, GraphNode> = {};
    const links: GraphLink[] = [];
    const linkSet = new Set<string>();

    files.forEach(file => {
        const tags = extractTags(file.content);

        // If a file has no tags, maybe categorize it as #untagged
        if (tags.length === 0) {
            tags.push('untagged');
        }

        tags.forEach(tag => {
            if (!nodes[tag]) {
                nodes[tag] = {
                    id: tag,
                    label: `#${tag}`,
                    content: '',
                    backlinks: [],
                    frequency: 0,
                    type: 'tag'
                };
            }
            nodes[tag].frequency! += 1;
        });

        // Create links between co-occurring tags in the same note
        for (let i = 0; i < tags.length; i++) {
            for (let j = i + 1; j < tags.length; j++) {
                const source = tags[i];
                const target = tags[j];
                const linkId = [source, target].sort().join('-');

                if (!linkSet.has(linkId)) {
                    links.push({ source, target });
                    linkSet.add(linkId);

                    nodes[target].backlinks.push(source);
                    nodes[source].backlinks.push(target);
                }
            }
        }
    });

    return { nodes: Object.values(nodes), links };
};
