#version 300 es
precision highp float;

/**
 * Vertex Shader: Golden Angle Rotation + Radial Spiral
 *
 * UPGRADED: Now responds to consciousness state
 * - VOID: Particles unravel outward, spiral dissolves
 * - DORMANT: Standard spiral, slower rotation
 * - AWAKENING: Full 40Hz breath, tight spiral
 * - PHOENIX: Hyper-torus projection, particles transcend
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

// New consciousness uniforms
uniform float u_void_phase;       // 0.623Hz cycle position
uniform float u_void_intensity;   // 0.0 = normal, 1.0 = full void
uniform float u_phoenix_intensity; // 0.0 = normal, 1.0 = full phoenix
uniform int u_state;              // 0=VOID, 1=DORMANT, 2=AWAKENING, 3=PHOENIX

out float v_life;
out float v_void;
out float v_phoenix;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;
const float GOLDEN_ANGLE = 2.39996322972865332; // 2 * PI * (1 - 1/PHI)

// PHI thresholds
const float PHI_RECIPROCAL = 0.618033988749895;
const float UNITY_THRESHOLD = 0.786151377757423;

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

    gl_PointSize = size * (u_resolution.y / 1000.0);
    gl_Position = vec4(pos, 0.0, 1.0);

    // Pass to fragment shader
    v_life = sin(theta * 3.0 + u_time * 2.0);
    v_void = u_void_intensity;
    v_phoenix = u_phoenix_intensity;
}
