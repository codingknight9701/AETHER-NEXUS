import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { readAllThoughts } from './vault';

// Function to extract tags from markdown content
export const extractTags = (content: string): string[] => {
    const rootMatches = content.match(/#[\w-]+/g) || [];
    return Array.from(new Set(rootMatches.map(tag => tag.substring(1))));
};

// Assuming sentiment color is part of the metadata you might want to infer
// For now, we will just format basic Date and Tags. You can extend this logic to 
// map the known ID from store to extract exact Mood score/color if needed. 
// However, since vault is pure markdown, we will stick to text-based metadata.

export const exportToNotebookLM = async () => {
    try {
        const thoughts = await readAllThoughts();
        let aggregatedMarkdown = `# Aether Nexus Export\n\n*Generated on: ${new Date().toLocaleDateString()}*\n\n---\n\n`;

        thoughts.forEach((thought) => {
            const tags = extractTags(thought.content);
            const tagString = tags.length > 0 ? tags.map(t => `#${t}`).join(' ') : 'None';

            // Format for NotebookLM with clear Document boundaries
            aggregatedMarkdown += `## Document: ${thought.title}\n`;
            aggregatedMarkdown += `**Date:** ${new Date().toLocaleDateString()}\n`;
            aggregatedMarkdown += `**Tags:** ${tagString}\n\n`;
            aggregatedMarkdown += `${thought.content}\n\n---\n\n`;
        });

        if (Platform.OS === 'web') {
            // For Web, create a blob and trigger download
            const blob = new Blob([aggregatedMarkdown], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Aether_Export_${new Date().toISOString().split('T')[0]}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } else {
            // For Native, save to cache and share
            const fileUri = `${FileSystem.cacheDirectory}Aether_Export.md`;
            await FileSystem.writeAsStringAsync(fileUri, aggregatedMarkdown, {
                encoding: FileSystem.EncodingType.UTF8
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/markdown',
                    dialogTitle: 'Export to NotebookLM'
                });
                return true;
            } else {
                console.warn("Sharing is not available on this device");
                return false;
            }
        }
    } catch (error) {
        console.error("Failed to export notes:", error);
        return false;
    }
};
