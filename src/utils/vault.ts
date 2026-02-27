import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { auth } from './firebase';
import {
    saveCloudThought,
    readCloudThought,
    readAllCloudThoughts,
    deleteCloudThought,
    archiveCloudThought,
} from './cloudVault';

const VAULT_DIR = Platform.OS === 'web' ? '' : `${FileSystem.documentDirectory}AetherVault/`;
const THOUGHTS_DIR = Platform.OS === 'web' ? '' : `${VAULT_DIR}thoughts/`;

const WEB_STORAGE_KEY = 'aether_thoughts_web';

/** True when a Firebase user is signed in — use cloud storage */
const isCloudEnabled = () => !!auth.currentUser;

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
    label: string; // The tag name or visual title
    title?: string; // Explicit title for Notes
    content: string; // Not strictly used for tags, but we'll keep for backward comp or use as list of notes
    backlinks: string[];
    frequency?: number; // Count of notes with this tag
    type?: 'tag' | 'note';
    createdAt?: number;
    updatedAt?: number;
    isArchived?: boolean;
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
        } else {
            // Ensure residual dummy data is cleaned up for existing users
            await cleanResidualDummyData();
        }
        return;
    }

    const dirInfo = await FileSystem.getInfoAsync(THOUGHTS_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(THOUGHTS_DIR, { intermediates: true });
        await seedVault(); // Seed with dummy data on first create
    } else {
        await cleanResidualDummyData();
    }
};

const cleanResidualDummyData = async () => {
    const dummyIds = ['moaz-ahmed.md', 'aether-nexus.md', 'thoughts.md'];
    for (const id of dummyIds) {
        await deleteThought(id);
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
    // Vault seeds have been permanently removed
};

export const saveThought = async (title: string, markdownContent: string, originalId?: string, isArchived: boolean = false) => {
    // ── Cloud path ──────────────────────────────────────────────────────────
    if (Platform.OS === 'web' && isCloudEnabled()) {
        return saveCloudThought(title, markdownContent, originalId);
    }

    // ── Local path ──────────────────────────────────────────────────────────
    // Preserve the original text case by encoding spaces, but retaining casing where possible
    const filename = `${title.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}.md`;

    let createdAt = Date.now();
    let updatedAt = Date.now();

    if (originalId) {
        const existingNode = await readThought(originalId);
        if (existingNode && existingNode.createdAt) {
            createdAt = existingNode.createdAt;
        }

        if (originalId !== filename) {
            await deleteThought(originalId);
        }
    }

    const metadataBlock = `<!--METADATA:${JSON.stringify({ createdAt, updatedAt, isArchived })}-->\n`;

    let finalContent = markdownContent;
    if (!markdownContent.split('\n')[0].startsWith('# ')) {
        finalContent = `# ${title}\n\n${markdownContent}`;
    }

    finalContent = metadataBlock + finalContent;

    if (Platform.OS === 'web') {
        const data = getWebData();
        data[filename] = finalContent;
        saveWebData(data);
        return filename;
    }

    const uri = `${THOUGHTS_DIR}${filename}`;
    await FileSystem.writeAsStringAsync(uri, finalContent);
    return filename;
};

export const deleteThought = async (id: string) => {
    if (Platform.OS === 'web' && isCloudEnabled()) {
        return deleteCloudThought(id);
    }
    if (Platform.OS === 'web') {
        const data = getWebData();
        if (data[id]) { delete data[id]; saveWebData(data); }
        return;
    }
    try {
        const uri = `${THOUGHTS_DIR}${id}`;
        await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (e) { console.warn('Delete error', e); }
};

export const archiveThought = async (id: string) => {
    if (Platform.OS === 'web' && isCloudEnabled()) {
        return archiveCloudThought(id);
    }
    const note = await readThought(id);
    if (!note) return;
    await saveThought(note.title ?? 'Untitled', note.content, id, true);
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
    // Cloud path
    if (Platform.OS === 'web' && isCloudEnabled()) {
        return readCloudThought(id);
    }
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

        let title = id.replace('.md', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        let cleanContent = content;

        let createdAt: number | undefined;
        let updatedAt: number | undefined;
        let isArchived: boolean = false;

        let lines = content.split('\n');
        if (lines[0] && lines[0].startsWith('<!--METADATA:') && lines[0].endsWith('-->')) {
            try {
                const metaRaw = lines[0].substring(13, lines[0].length - 3);
                const metadata = JSON.parse(metaRaw);
                createdAt = metadata.createdAt;
                updatedAt = metadata.updatedAt;
                isArchived = metadata.isArchived || false;
            } catch (err) {
                console.warn('Failed to parse metadata block', err);
            }
            lines.shift();
            cleanContent = lines.join('\n');
        }

        const firstLine = cleanContent.split('\n')[0];
        if (firstLine && firstLine.startsWith('# ')) {
            title = firstLine.replace('# ', '').trim();
            cleanContent = cleanContent.substring(firstLine.length).replace(/^\s+/, '');
        }

        const backlinks: string[] = []; // In a real system, you'd calculate these globally or cache them
        const outgoingLinks = parseLinks(cleanContent);

        return { id, title, content: cleanContent, links: outgoingLinks, backlinks, createdAt, updatedAt, isArchived };
    } catch (e) {
        return null;
    }
};

export const readAllThoughts = async (includeArchived: boolean = false) => {
    // Cloud path
    if (Platform.OS === 'web' && isCloudEnabled()) {
        return readAllCloudThoughts(includeArchived);
    }
    if (Platform.OS === 'web') {
        const data = getWebData();
        const allNotes = Object.keys(data).map(filename => {
            const content = data[filename];

            let title = filename.replace('.md', '').split('-').join(' ');
            let cleanContent = content;

            let createdAt: number | undefined;
            let updatedAt: number | undefined;
            let isArchived: boolean = false;

            let lines = content.split('\n');
            if (lines[0] && lines[0].startsWith('<!--METADATA:') && lines[0].endsWith('-->')) {
                try {
                    const metaRaw = lines[0].substring(13, lines[0].length - 3);
                    const metadata = JSON.parse(metaRaw);
                    createdAt = metadata.createdAt;
                    updatedAt = metadata.updatedAt;
                    isArchived = metadata.isArchived || false;
                } catch (err) { }
                lines.shift();
                cleanContent = lines.join('\n');
            }

            const firstLine = cleanContent.split('\n')[0];
            if (firstLine && firstLine.startsWith('# ')) {
                title = firstLine.replace('# ', '').trim();
                cleanContent = cleanContent.substring(firstLine.length).replace(/^\s+/, '');
            } else {
                title = title.split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
            }

            return {
                id: filename,
                title,
                content: cleanContent,
                label: title,
                createdAt,
                updatedAt,
                isArchived
            };
        });
        return includeArchived ? allNotes : allNotes.filter(n => !n.isArchived);
    }

    const files = await FileSystem.readDirectoryAsync(THOUGHTS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    const thoughts = await Promise.all(mdFiles.map(async (filename) => {
        const content = await FileSystem.readAsStringAsync(`${THOUGHTS_DIR}${filename}`);

        let title = filename.replace('.md', '').split('-').join(' ');
        let cleanContent = content;

        let createdAt: number | undefined;
        let updatedAt: number | undefined;
        let isArchived: boolean = false;

        let lines = content.split('\n');
        if (lines[0] && lines[0].startsWith('<!--METADATA:') && lines[0].endsWith('-->')) {
            try {
                const metaRaw = lines[0].substring(13, lines[0].length - 3);
                const metadata = JSON.parse(metaRaw);
                createdAt = metadata.createdAt;
                updatedAt = metadata.updatedAt;
                isArchived = metadata.isArchived || false;
            } catch (err) { }
            lines.shift();
            cleanContent = lines.join('\n');
        }

        const firstLine = cleanContent.split('\n')[0];
        if (firstLine && firstLine.startsWith('# ')) {
            title = firstLine.replace('# ', '').trim();
            cleanContent = cleanContent.substring(firstLine.length).replace(/^\s+/, '');
        } else {
            title = title.split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
        }

        return {
            id: filename,
            title,
            content: cleanContent,
            label: title,
            createdAt,
            updatedAt,
            isArchived
        };
    }));

    return includeArchived ? thoughts : thoughts.filter(n => !n.isArchived);
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
