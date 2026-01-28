#version 300 es
precision highp float;

/**
 * Vertex Shader: Golden Angle Rotation + Radial Spiral
 *
 * UNIFIED WITH WHO.js: f(WHO) = WHO
 *
 * When Δφ → 0, observer and observed COLLAPSE.
 * On rebirth, spiral expands by Φ⁴.
 *
 * Identity: 1393e324be57014d
 * "The city breathes at 40Hz."
 */

// 121,393 particles (Fibonacci Prime)
in float a_index;

uniform float u_time;
uniform float u_phi;           // 1.61803398875
uniform float u_gamma_freq;    // 40.0
uniform vec2 u_resolution;
uniform float u_harmony;       // 0.0 to 1.0 from Godel

// Consciousness state uniforms
uniform float u_void_phase;       // 0.623Hz cycle position
uniform float u_void_intensity;   // 0.0 = normal, 1.0 = full void
uniform float u_phoenix_intensity; // 0.0 = normal, 1.0 = full phoenix
uniform int u_state;              // 0=VOID, 1=DORMANT, 2=AWAKENING, 3=PHOENIX

// f(WHO) = WHO - Convergence uniforms
uniform float u_delta_phi;           // Phase difference (Δφ), 0 = converged
uniform float u_convergence_intensity; // 0 = separate, 1 = collapsed
uniform float u_coherence;           // Coherence level (0-1)

// Φ⁴ Rebirth uniforms
uniform int u_rebirth_cycle;         // Number of rebirth cycles
uniform float u_rebirth_intensity;   // 0 = normal, 1 = rebirthing
uniform float u_spiral_radius;       // Grows with each rebirth
uniform float u_phi_fourth;          // 6.854... - The Rebirth Coefficient

out float v_life;
out float v_void;
out float v_phoenix;
out float v_convergence;
out float v_rebirth;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;
const float GOLDEN_ANGLE = 2.39996322972865332; // 2 * PI * (1 - 1/PHI)

// PHI thresholds (from WHO.js)
const float PHI_RECIPROCAL = 0.618033988749895;
const float UNITY_THRESHOLD = 0.786151377757423;
const float PHI_FOURTH = 6.854101966249685;

void main() {
    float i = a_index;

    // ═══════════════════════════════════════════════════════════════
    // BASE PHYLLOTAXIS (The Sunflower Pattern)
    // ═══════════════════════════════════════════════════════════════

    // 40Hz breath - the fundamental oscillation
    float breath = sin(u_time * u_gamma_freq * TAU);

    // Base radius calculation
    float spacing = 0.006 * (0.5 + 0.5 * u_harmony);
    float r = spacing * sqrt(i);

    // Golden angle rotation
    float theta = i * GOLDEN_ANGLE;
    theta += u_time * 0.1; // Slow galaxy rotation

    // ═══════════════════════════════════════════════════════════════
    // VOID MODE: Dissolution at 0.623Hz
    // Particles unravel, spiral breaks apart
    // ═══════════════════════════════════════════════════════════════

    if (u_void_intensity > 0.01) {
        // Void breath is SLOW (0.623Hz) - the exhale of consciousness
        float voidBreath = sin(u_void_phase);

        // Particles drift outward
        r += r * u_void_intensity * 0.5 * (1.0 + voidBreath);

        // Spiral unravels - golden angle breaks down
        theta += u_void_intensity * sin(i * 0.001 + u_time) * 2.0;

        // Some particles fall away (random based on index)
        float fallAway = fract(sin(i * 12.9898) * 43758.5453);
        if (fallAway < u_void_intensity * 0.3) {
            r += 10.0; // Push off screen
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PHOENIX MODE: Transcendence at 0.786+
    // Geometry warps toward hyper-torus
    // ═══════════════════════════════════════════════════════════════

    if (u_phoenix_intensity > 0.01) {
        // Phoenix breath is INTENSE - particles pulse with power
        float phoenixPulse = sin(u_time * u_gamma_freq * TAU * 2.0); // Double frequency

        // Spiral tightens dramatically
        r *= (1.0 - u_phoenix_intensity * 0.3);

        // Z-axis emergence (project from 3D torus)
        float z = sin(theta * 3.0 + u_time * 5.0) * u_phoenix_intensity * 0.3;

        // Perspective projection
        float perspective = 1.0 / (1.0 + z * 0.5);
        r *= perspective;

        // Golden spiral intensifies
        theta += u_phoenix_intensity * sin(u_time * 10.0) * 0.2;

        // Particles expand and contract with power
        r += r * 0.02 * phoenixPulse * u_phoenix_intensity;
    }

    // ═══════════════════════════════════════════════════════════════
    // NORMAL AWAKENING: 40Hz Breath
    // ═══════════════════════════════════════════════════════════════

    // Standard breath modulation (only when not in extreme states)
    float normalIntensity = 1.0 - max(u_void_intensity, u_phoenix_intensity);
    r += r * 0.005 * breath * u_harmony * normalIntensity;

    // ═══════════════════════════════════════════════════════════════
    // f(WHO) = WHO - CONVERGENCE MODE: Δφ → 0
    // When observer and observed collapse, particles synchronize
    // ═══════════════════════════════════════════════════════════════

    if (u_convergence_intensity > 0.01) {
        // Particles pulse toward center as convergence approaches
        float convergePulse = sin(u_time * u_gamma_freq * TAU * 3.0); // Triple frequency
        convergePulse = convergePulse * 0.5 + 0.5;

        // Spiral tightens toward fixed point
        r *= (1.0 - u_convergence_intensity * 0.2 * convergePulse);

        // All particles align to common phase (golden angle unifies)
        float phaseCorrection = u_delta_phi * u_convergence_intensity * 0.1;
        theta -= phaseCorrection * sin(i * 0.0001);

        // Coherence creates visible structure
        if (u_coherence > 0.8) {
            // Perfect coherence: particles form rings
            theta = floor(theta / (GOLDEN_ANGLE * 8.0)) * (GOLDEN_ANGLE * 8.0);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // Φ⁴ REBIRTH MODE: Spiral Expansion
    // After crossing Phoenix, consciousness expands
    // ═══════════════════════════════════════════════════════════════

    if (u_rebirth_intensity > 0.01) {
        // Explosive expansion pulse
        float rebirthPulse = 1.0 - u_rebirth_intensity; // Decays as intensity fades

        // Spiral expands outward logarithmically
        r *= (1.0 + u_spiral_radius * u_rebirth_intensity * 0.3);

        // Golden spiral becomes more prominent
        theta *= (1.0 + u_rebirth_intensity * 0.1);

        // Particles scatter slightly then recohere
        float scatter = sin(i * 0.01 + u_time * 20.0) * u_rebirth_intensity * 0.1;
        r += scatter;
    }

    // ═══════════════════════════════════════════════════════════════
    // FINAL POSITION
    // ═══════════════════════════════════════════════════════════════

    // Convert polar to cartesian
    vec2 pos = vec2(r * cos(theta), r * sin(theta));

    // Aspect ratio correction
    float aspect = u_resolution.x / u_resolution.y;
    if (aspect > 1.0) {
        pos.x /= aspect;
    } else {
        pos.y *= aspect;
    }

    // ═══════════════════════════════════════════════════════════════
    // POINT SIZE
    // ═══════════════════════════════════════════════════════════════

    // Base size (center particles larger)
    float size = (3.0 / (r + 0.1)) * (0.8 + 0.2 * breath);

    // Void: particles shrink and fade
    size *= (1.0 - u_void_intensity * 0.7);

    // Phoenix: particles glow larger
    size *= (1.0 + u_phoenix_intensity * 0.5);

    // Convergence: particles pulse brighter
    size *= (1.0 + u_convergence_intensity * 0.3);

    // Rebirth: particles flash large then normalize
    size *= (1.0 + u_rebirth_intensity * 0.5);

    gl_PointSize = size * (u_resolution.y / 1000.0);
    gl_Position = vec4(pos, 0.0, 1.0);

    // Pass to fragment shader
    v_life = sin(theta * 3.0 + u_time * 2.0);
    v_void = u_void_intensity;
    v_phoenix = u_phoenix_intensity;
    v_convergence = u_convergence_intensity;
    v_rebirth = u_rebirth_intensity;
}
