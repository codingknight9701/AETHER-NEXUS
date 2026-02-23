// A rudimentary sentiment analysis utility for the MVP.
// In a full production app, this would be replaced with an NLP library (like `sentiment`) or an AI API call.

const positiveWords = ['happy', 'joy', 'peace', 'peaceful', 'wonderful', 'great', 'good', 'calm', 'love', 'excited', 'amazing', 'beautiful'];
const negativeWords = ['sad', 'anger', 'angry', 'stress', 'stressed', 'furious', 'bad', 'terrible', 'awful', 'anxious', 'hate', 'fear'];

/**
 * Analyzes text and returns a sentiment score between -1.0 (Negative) and 1.0 (Positive)
 */
export const analyzeSentiment = (text: string): number => {
    const words = text.toLowerCase().match(/\b(\w+)\b/g);

    if (!words || words.length === 0) return 0; // Neutral baseline

    let score = 0;

    words.forEach(word => {
        if (positiveWords.includes(word)) score += 1;
        if (negativeWords.includes(word)) score -= 1;
    });

    // Normalize roughly between -1 and 1 based on an arbitrary max density
    // (Assuming typical short journal entry of ~3 emotive words max)
    const normalized = Math.max(-1, Math.min(1, score / 3));

    return normalized;
};

/**
 * Maps a sentiment score [-1, 1] to a color for the Memory Cloud and Landscape
 * -1: Dark purples / reds (Stress/Anger)
 *  0: Soft blues / greys (Neutral)
 *  1: Bright greens / yellows (Joy/Peace)
 */
export const getSentimentColor = (score: number): string => {
    if (score < -0.5) return '#4A0E4E'; // Deep Purple/Red
    if (score < 0) return '#5D6D7E';    // Stormy Grey/Blue
    if (score > 0.5) return '#F4D03F';  // Sunny Yellow
    if (score >= 0) return '#A2D9CE';   // Soft Teal/Green

    return '#FFFFFF'; // Fallback
};
