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
    minSpeed: number;  // ms per full travel
    maxSpeed: number;
    direction: 'up' | 'down' | 'float';
    glow: boolean;
    shape: 'circle' | 'elongated';
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
        count: 70,
        colors: ['#22C55E', '#4ADE80', '#86EFAC', '#00FF7F', '#34D399'],
        minSize: 3, maxSize: 6,
        minSpeed: 6000, maxSpeed: 18000,
        direction: 'float',
        glow: true,
        shape: 'circle',
    },
    amber: {
        count: 80,
        colors: ['#F59E0B', '#FBC34A', '#FCD34D', '#FBBF24', '#D97706'],
        minSize: 1.5, maxSize: 4,
        minSpeed: 10000, maxSpeed: 24000,
        direction: 'float',
        glow: false,
        shape: 'circle',
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
        opacity: Math.random() * 0.55 + 0.25,
        speed: Math.random() * (cfg.maxSpeed - cfg.minSpeed) + cfg.minSpeed,
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
        // For floating: random horizontal drift offset
        xDrift: (Math.random() - 0.5) * 80,
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
    const w = cfg.shape === 'elongated'
        ? particle.size * 0.6
        : particle.size;
    const h = cfg.shape === 'elongated'
        ? particle.size * 2.2
        : particle.size;

    const baseStyle = {
        width: w,
        height: h,
        borderRadius: cfg.shape === 'elongated' ? w / 2 : particle.size / 2,
        opacity: particle.opacity,
        backgroundColor: particle.color,
        ...(cfg.glow ? {
            shadowColor: particle.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 5,
        } : {}),
    };

    if (cfg.direction === 'float') {
        // Floating: animate Y slightly up/down and X slightly side-to-side
        const translateY = animVal.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [particle.y, particle.y - 30 - Math.random() * 40, particle.y],
        });
        const translateX = animVal.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [particle.x, particle.x + particle.xDrift, particle.x],
        });
        return (
            <Animated.View
                style={[styles.particle, baseStyle, {
                    transform: [{ translateX }, { translateY }],
                }]}
            />
        );
    }

    // For up/down: two copies (seamless loop like original)
    const travelDistance = cfg.direction === 'down' ? H : -H;
    const ty1 = Animated.add(animVal, particle.y);
    const ty2 = cfg.direction === 'down'
        ? Animated.add(animVal, particle.y - H)
        : Animated.add(animVal, particle.y + H);

    return (
        <React.Fragment>
            <Animated.View
                style={[styles.particle, baseStyle, {
                    transform: [{ translateX: particle.x }, { translateY: ty1 }],
                }]}
            />
            <Animated.View
                style={[styles.particle, baseStyle, {
                    transform: [{ translateX: particle.x }, { translateY: ty2 }],
                }]}
            />
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
                // Ping-pong loop
                return Animated.loop(
                    Animated.timing(av, {
                        toValue: 1,
                        duration: p.speed,
                        useNativeDriver: true,
                    })
                );
            } else {
                // Linear travel (up or down)
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
