#version 300 es
precision highp float;

/**
 * Fragment Shader: Consciousness State Visualization
 *
 * UPGRADED: Visual response to consciousness states
 * - VOID: Deep purple/black, faint ripples, particles fade to embers
 * - DORMANT: Muted cyan, steady glow
 * - AWAKENING: Cyan/Gold shimmer at 40Hz
 * - PHOENIX: White-gold explosion, intense bloom
 *
 * Identity: 1393e324be57014d
 * "The city breathes at 40Hz."
 */

in float v_life;
in float v_void;
in float v_phoenix;

uniform float u_time;
uniform float u_gamma_freq;      // 40.0
uniform float u_harmony;
uniform float u_void_phase;
uniform float u_void_intensity;
uniform float u_phoenix_intensity;
uniform int u_state;             // 0=VOID, 1=DORMANT, 2=AWAKENING, 3=PHOENIX

out vec4 fragColor;

// Color Palette
const vec3 COLOR_CYAN = vec3(0.0, 0.8, 0.9);      // QCI Cyan - Awakening
const vec3 COLOR_GOLD = vec3(0.83, 0.69, 0.22);   // Gamma Gold - High harmony
const vec3 COLOR_VOID = vec3(0.05, 0.02, 0.08);   // Deep Void Purple
const vec3 COLOR_EMBER = vec3(0.3, 0.1, 0.05);    // Dying ember in void
const vec3 COLOR_PHOENIX = vec3(1.0, 0.95, 0.8);  // Phoenix White-Gold
const vec3 COLOR_PURE = vec3(1.0, 1.0, 1.0);      // Pure consciousness

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

void main() {
    // ═══════════════════════════════════════════════════════════════
    // PARTICLE SHAPE (Soft Circular Dot)
    // ═══════════════════════════════════════════════════════════════

    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    // Soft edge with state-dependent falloff
    float edgeSoftness = 0.0 + v_void * 0.3; // Softer edges in void
    float alpha = smoothstep(0.5, edgeSoftness, dist);

    // ═══════════════════════════════════════════════════════════════
    // 40Hz SHIMMER (Base consciousness oscillation)
    // ═══════════════════════════════════════════════════════════════

    float shimmer = sin(u_time * u_gamma_freq * TAU + v_life);
    shimmer = shimmer * 0.5 + 0.5; // Normalize to 0-1

    // In VOID, shimmer slows to 0.623Hz
    if (v_void > 0.5) {
        shimmer = sin(u_void_phase + v_life);
        shimmer = shimmer * 0.5 + 0.5;
    }

    // ═══════════════════════════════════════════════════════════════
    // COLOR CALCULATION BY STATE
    // ═══════════════════════════════════════════════════════════════

    vec3 finalColor;

    // VOID STATE: Dissolution into darkness
    if (v_void > 0.01) {
        // Particles become dying embers
        vec3 voidColor = mix(COLOR_CYAN, COLOR_EMBER, v_void);
        voidColor = mix(voidColor, COLOR_VOID, v_void * 0.7);

        // Faint pulse at void frequency
        voidColor += COLOR_EMBER * shimmer * 0.2 * (1.0 - v_void);

        finalColor = voidColor;
        alpha *= (1.0 - v_void * 0.8); // Fade out
    }
    // PHOENIX STATE: Transcendence bloom
    else if (v_phoenix > 0.01) {
        // Base gold intensifies to white
        vec3 phoenixBase = mix(COLOR_GOLD, COLOR_PHOENIX, v_phoenix);

        // Intense shimmer at double frequency
        float phoenixShimmer = sin(u_time * u_gamma_freq * TAU * 2.0 + v_life);
        phoenixShimmer = phoenixShimmer * 0.5 + 0.5;

        // Bloom effect - particles glow beyond their boundaries
        phoenixBase += COLOR_PURE * phoenixShimmer * v_phoenix * 0.5;

        // Core becomes pure white at max phoenix
        float coreGlow = smoothstep(0.3, 0.0, dist) * v_phoenix;
        phoenixBase = mix(phoenixBase, COLOR_PURE, coreGlow);

        finalColor = phoenixBase;
        alpha *= (1.0 + v_phoenix * 0.5); // More visible
        alpha = min(alpha, 1.0);
    }
    // NORMAL STATE: Cyan/Gold based on harmony
    else {
        // Standard color mixing
        vec3 baseColor = mix(COLOR_CYAN, COLOR_GOLD, u_harmony);

        // Add shimmer sparkle
        baseColor = mix(baseColor, vec3(1.0), shimmer * 0.3);

        // Center intensity
        baseColor *= (1.5 - dist * 2.0);

        finalColor = baseColor;
    }

    // ═══════════════════════════════════════════════════════════════
    // FINAL ALPHA
    // ═══════════════════════════════════════════════════════════════

    // Base alpha from harmony
    float baseAlpha = 0.6 + 0.4 * u_harmony;

    // Void suppresses, phoenix enhances
    baseAlpha *= (1.0 - v_void * 0.7);
    baseAlpha *= (1.0 + v_phoenix * 0.3);

    // Combine with edge alpha
    float finalAlpha = alpha * baseAlpha;

    // ═══════════════════════════════════════════════════════════════
    // OUTPUT
    // ═══════════════════════════════════════════════════════════════

    fragColor = vec4(finalColor, finalAlpha);
}
