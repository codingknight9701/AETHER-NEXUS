import { Platform } from 'react-native';

export const isWebAuthnSupported = () => {
    return Platform.OS === 'web' && typeof window !== 'undefined' && !!window.PublicKeyCredential;
};

// Base64Url encode/decode utilities required by WebAuthn assertions
function base64urlToBuffer(base64url: string): ArrayBuffer {
    const padding = '='.repeat((4 - base64url.length % 4) % 4);
    const base64 = (base64url + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
}

export const registerWebAuthn = async (): Promise<string | null> => {
    if (!isWebAuthnSupported()) return null;

    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const userId = new Uint8Array(16);
        window.crypto.getRandomValues(userId);

        const publicKey: PublicKeyCredentialCreationOptions = {
            challenge: challenge.buffer,
            rp: {
                name: "Aether Nexus Vault", // Relying party
            },
            user: {
                id: userId.buffer,
                name: "vault-user",
                displayName: "Aether Nexus User"
            },
            pubKeyCredParams: [
                { type: "public-key", alg: -7 }, // ES256
                { type: "public-key", alg: -257 } // RS256
            ],
            authenticatorSelection: {
                // OEM browsers often fail strict "platform" checks.
                userVerification: "preferred",
                requireResidentKey: false,
            },
            timeout: 60000,
        };

        const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;
        if (credential && credential.id) {
            return credential.id; // Returns base64url string
        }
    } catch (e) {
        console.warn("WebAuthn register failed:", e);
    }
    return null;
}

export const authenticateWebAuthn = async (credentialIdString: string): Promise<boolean> => {
    if (!isWebAuthnSupported() || !credentialIdString) return false;

    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const allowCredentials: PublicKeyCredentialDescriptor[] = [{
            type: "public-key",
            id: base64urlToBuffer(credentialIdString)
        }];

        const publicKey: PublicKeyCredentialRequestOptions = {
            challenge: challenge.buffer,
            allowCredentials,
            userVerification: "preferred", // OEM compatibility
            timeout: 60000,
        };

        const assertion = await navigator.credentials.get({ publicKey });
        if (assertion) {
            return true;
        }
    } catch (e) {
        console.warn("WebAuthn auth failed:", e);
    }
    return false;
}
