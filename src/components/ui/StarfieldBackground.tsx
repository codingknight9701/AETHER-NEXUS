import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

const { width: W, height: H } = Dimensions.get('window');

// ─── Particle config per theme ───────────────────────────────────────────────

interface ParticleConfig {
    count: number;
    colors: string[];
    minSize: number;
    maxSize: number;
    minSpeed: number;
    maxSpeed: number;
    direction: 'up' | 'down' | 'float' | 'diagonal-left' | 'diagonal-right';
    glow: boolean;
    shape: 'circle' | 'elongated' | 'leaf';
    opacity?: { min: number; max: number };
}

const THEME_CONFIGS: Record<string, ParticleConfig> = {
    void: {
        count: 100,
        colors: ['#7D5FFF', '#00E5FF', '#A080FF', '#ffffff'],
        minSize: 1.5, maxSize: 3.5,
        minSpeed: 9000, maxSpeed: 20000,
        direction: 'up',
        glow: true,
        shape: 'circle',
    },
    inferno: {
        count: 90,
        colors: ['#FF4444', '#FF7700', '#FFAA00', '#FF3300', '#FF6622'],
        minSize: 2, maxSize: 5,
        minSpeed: 4000, maxSpeed: 10000,
        direction: 'up',
        glow: true,
        shape: 'elongated',
    },
    forest: {
        count: 55,
        colors: ['#22C55E', '#4ADE80', '#86EFAC', '#A3E635', '#D9F99D', '#BBF7D0'],
        minSize: 8, maxSize: 16,
        minSpeed: 7000, maxSpeed: 16000,
        direction: 'diagonal-right',
        glow: false,
        shape: 'leaf',
        opacity: { min: 0.45, max: 0.85 },
    },
    amber: {
        count: 80,
        colors: ['#D4A017', '#C8961A', '#E8B84B', '#F0C040', '#BF8A14', '#EAD090'],
        minSize: 3, maxSize: 18,
        minSpeed: 14000, maxSpeed: 32000,
        direction: 'diagonal-left',
        glow: false,
        shape: 'circle',
        opacity: { min: 0.06, max: 0.35 },
    },
    arctic: {
        count: 85,
        colors: ['#ffffff', '#E0F2FE', '#BAE6FD', '#38BDF8', '#7DD3FC'],
        minSize: 2, maxSize: 5,
        minSpeed: 7000, maxSpeed: 16000,
        direction: 'down',
        glow: false,
        shape: 'circle',
    },
};

// ─── Create particles based on config ────────────────────────────────────────

function createParticles(cfg: ParticleConfig) {
    return Array.from({ length: cfg.count }).map(() => ({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * (cfg.maxSize - cfg.minSize) + cfg.minSize,
        opacity: cfg.opacity
            ? Math.random() * (cfg.opacity.max - cfg.opacity.min) + cfg.opacity.min
            : Math.random() * 0.55 + 0.25,
        speed: Math.random() * (cfg.maxSpeed - cfg.minSpeed) + cfg.minSpeed,
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
        xDrift: (Math.random() - 0.5) * 80,
        // Leaf-specific: random initial rotation + spin direction
        rotation: Math.random() * 360,
        spinDir: Math.random() > 0.5 ? 1 : -1,
    }));
}

// ─── Per-direction animated particle ─────────────────────────────────────────

function AnimatedParticle({
    particle, animVal, cfg,
}: {
    particle: ReturnType<typeof createParticles>[0];
    animVal: Animated.Value;
    cfg: ParticleConfig;
}) {
    // ── LEAF shape: rotates and falls diagonally ──────────────────────────────
    if (cfg.shape === 'leaf') {
        const leafW = particle.size * 0.55;
        const leafH = particle.size;
        const xShift = particle.spinDir > 0 ? W * 0.35 : -W * 0.3;
        const translateY = animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [-leafH * 2, H + leafH * 2],
        });
        const translateX = animVal.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [particle.x, particle.x + xShift * 0.5, particle.x + xShift],
        });
        const rotate = animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [`${particle.rotation}deg`, `${particle.rotation + particle.spinDir * 280}deg`],
        });
        return (
            <Animated.View style={[styles.particle, {
                width: leafW,
                height: leafH,
                borderRadius: leafW / 2,
                backgroundColor: particle.color,
                opacity: particle.opacity,
                transform: [{ translateX }, { translateY }, { rotate }],
            }]} />
        );
    }

    // ── ELONGATED ember: fast rising sparks ───────────────────────────────────
    if (cfg.shape === 'elongated') {
        const pw = particle.size * 0.6;
        const ph = particle.size * 2.2;
        const baseStyle = {
            width: pw, height: ph, borderRadius: pw / 2,
            opacity: particle.opacity, backgroundColor: particle.color,
            shadowColor: particle.color, shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9, shadowRadius: 5,
        };
        const ty1 = Animated.add(animVal, particle.y);
        const ty2 = Animated.add(animVal, particle.y + H);
        return (
            <React.Fragment>
                <Animated.View style={[styles.particle, baseStyle, { transform: [{ translateX: particle.x }, { translateY: ty1 }] }]} />
                <Animated.View style={[styles.particle, baseStyle, { transform: [{ translateX: particle.x }, { translateY: ty2 }] }]} />
            </React.Fragment>
        );
    }

    // ── CIRCLE ────────────────────────────────────────────────────────────────
    const glowProps = cfg.glow ? {
        shadowColor: particle.color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9, shadowRadius: 5,
    } : {};
    const baseStyle = {
        width: particle.size, height: particle.size,
        borderRadius: particle.size / 2,
        opacity: particle.opacity,
        backgroundColor: particle.color,
        ...glowProps,
    };

    // Dune: diagonal sand drift
    if (cfg.direction === 'diagonal-left' || cfg.direction === 'diagonal-right') {
        const xShift = cfg.direction === 'diagonal-left' ? -W * 0.65 : W * 0.65;
        const translateY = animVal.interpolate({ inputRange: [0, 1], outputRange: [particle.y, particle.y + H * 0.45] });
        const translateX = animVal.interpolate({ inputRange: [0, 1], outputRange: [particle.x, particle.x + xShift] });
        return (
            <Animated.View style={[styles.particle, baseStyle, { transform: [{ translateX }, { translateY }] }]} />
        );
    }

    // Up / Down seamless two-copy loop
    const ty1 = Animated.add(animVal, particle.y);
    const ty2 = cfg.direction === 'down'
        ? Animated.add(animVal, particle.y - H)
        : Animated.add(animVal, particle.y + H);
    return (
        <React.Fragment>
            <Animated.View style={[styles.particle, baseStyle, { transform: [{ translateX: particle.x }, { translateY: ty1 }] }]} />
            <Animated.View style={[styles.particle, baseStyle, { transform: [{ translateX: particle.x }, { translateY: ty2 }] }]} />
        </React.Fragment>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StarfieldBackground() {
    const { themeId } = useThemeStore();
    const cfg = THEME_CONFIGS[themeId] || THEME_CONFIGS.void;

    // Recreate particles when theme changes
    const particles = useMemo(() => createParticles(cfg), [themeId]);
    const animVals = useRef<Animated.Value[]>([]);

    // Ensure we have enough animated values
    if (animVals.current.length !== particles.length) {
        animVals.current = particles.map(() => new Animated.Value(0));
    }

    useEffect(() => {
        const anims = particles.map((p, i) => {
            const av = animVals.current[i];
            av.setValue(0);

            if (cfg.direction === 'float') {
                return Animated.loop(
                    Animated.timing(av, { toValue: 1, duration: p.speed, useNativeDriver: true })
                );
            } else if (cfg.direction === 'diagonal-left' || cfg.direction === 'diagonal-right' || cfg.shape === 'leaf') {
                return Animated.loop(
                    Animated.sequence([
                        Animated.timing(av, { toValue: 1, duration: p.speed, useNativeDriver: true }),
                        Animated.timing(av, { toValue: 0, duration: 0, useNativeDriver: true }),
                    ])
                );
            } else {
                return Animated.loop(
                    Animated.timing(av, {
                        toValue: cfg.direction === 'down' ? H : -H,
                        duration: p.speed,
                        useNativeDriver: true,
                    })
                );
            }
        });

        Animated.parallel(anims).start();
        return () => anims.forEach(a => a.stop());
    }, [themeId]);

    return (
        <View style={styles.container} pointerEvents="none">
            {particles.map((p, i) => (
                <AnimatedParticle
                    key={`${themeId}-${i}`}
                    particle={p}
                    animVal={animVals.current[i]}
                    cfg={cfg}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        zIndex: 0,
    },
    particle: {
        position: 'absolute',
    },
});
