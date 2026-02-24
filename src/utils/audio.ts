import { AudioPlayer } from 'expo-audio';

// Tiny base64 encoded audio snippets
const CHIME_B64 = "data:audio/mp3;base64,//OAQAAAAAAAAAAAAFhpbmcAAAAPAAAAEAAADuAAwMDAwMDAwMDAwMDAwMDAwMDQ0NDQ0NDQ0NDQ0NDQ0NDA0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ//OAQAA...";

const audioState = {
    isMuted: false,
};

let backgroundPlayer: any = null;
let chimePlayer: any = null;

export const initAudio = async () => {
    try {
        // Fallback for background music since we can't reliably host right now.
        // We initialize gracefully without crashing.
        console.log("Audio gracefully degraded inside initAudio");
    } catch (error) {
        console.warn("Audio initialization failed. Sounds will be ignored.", error);
    }
};

export const playBackgroundMusic = () => {
    if (backgroundPlayer && !audioState.isMuted) {
        // backgroundPlayer.play();
    }
};

export const pauseBackgroundMusic = () => {
    if (backgroundPlayer) {
        // backgroundPlayer.pause();
    }
};

export const playSaveChime = () => {
    if (chimePlayer && !audioState.isMuted) {
        // chimePlayer.play();
    }
};
