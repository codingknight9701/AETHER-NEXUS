import * as FileSystem from 'expo-file-system/legacy';

const VAULT_DIR = `${FileSystem.documentDirectory}AetherVault/`;
const THOUGHTS_DIR = `${VAULT_DIR}thoughts/`;

export interface GraphNode {
    id: string;
    label: string;
    content: string;
    backlinks: string[];
}

export interface GraphLink {
    source: string;
    target: string;
}

export const initVault = async () => {
    const dirInfo = await FileSystem.getInfoAsync(THOUGHTS_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(THOUGHTS_DIR, { intermediates: true });
        await seedVault(); // Seed with dummy data on first create
    }
};

export const resetVault = async () => {
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
        const content = await FileSystem.readAsStringAsync(`${THOUGHTS_DIR}${id}`);
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

export const buildGraph = async () => {
    const files = await readAllThoughts();
    const nodes: Record<string, GraphNode> = {};
    const links: GraphLink[] = [];

    // First pass: Create nodes
    files.forEach(file => {
        nodes[file.id] = {
            id: file.id,
            label: file.title,
            content: file.content,
            backlinks: []
        };
    });

    // Second pass: Create links and populate backlinks
    files.forEach(file => {
        const outgoingLinks = parseLinks(file.content);
        outgoingLinks.forEach(targetTitle => {
            const targetId = `${targetTitle.replace(/\s+/g, '-').toLowerCase()}.md`;

            // Only link if the target exists
            if (nodes[targetId]) {
                links.push({ source: file.id, target: targetId });
                nodes[targetId].backlinks.push(file.id);
            }
        });
    });

    return { nodes: Object.values(nodes), links };
};
