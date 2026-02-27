import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const NUM_STARS = 100;

const createStars = () => {
    return Array.from({ length: NUM_STARS }).map(() => {
        const isCyan = Math.random() > 0.7; // 30% chance for bright cyan star
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2.5 + 1.5, // slightly larger
            opacity: Math.random() * 0.6 + 0.3, // Brighter base opacity
            speed: Math.random() * 12000 + 10000, // Slightly faster
            color: isCyan ? '#00E5FF' : '#7D5FFF' // Cyan or Nebula Purple
        };
    });
};

export default function StarfieldBackground() {
    const stars = useRef(createStars()).current;

    // Create animated values for each star's Y position
    const animatedValues = useRef(stars.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        const animations = stars.map((star, index) => {
            return Animated.loop(
                Animated.timing(animatedValues[index], {
                    toValue: -height,
                    duration: star.speed,
                    useNativeDriver: true,
                })
            );
        });

        Animated.parallel(animations).start();

        return () => {
            animations.forEach(anim => anim.stop());
        };
    }, []);

    return (
        <View style={styles.container} pointerEvents="none">
            {stars.map((star, index) => {
                const baseStyle = {
                    width: star.size,
                    height: star.size,
                    borderRadius: star.size / 2,
                    opacity: star.opacity,
                    backgroundColor: star.color,
                    shadowColor: star.color,
                };
                return (
                    <React.Fragment key={index}>
                        <Animated.View
                            style={[
                                styles.star,
                                baseStyle,
                                {
                                    transform: [
                                        { translateX: star.x },
                                        { translateY: Animated.add(animatedValues[index], star.y) },
                                    ],
                                }
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.star,
                                baseStyle,
                                {
                                    transform: [
                                        { translateX: star.x },
                                        { translateY: Animated.add(animatedValues[index], star.y + height) },
                                    ],
                                }
                            ]}
                        />
                    </React.Fragment>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        zIndex: 0,
    },
    star: {
        position: 'absolute',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
    }
});
