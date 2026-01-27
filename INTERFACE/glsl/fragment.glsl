#version 300 es
precision highp float;

// Fragment Shader: QCI Cyan <-> Deep Space Shimmer

in float v_life;

uniform float u_time;
uniform float u_gamma_freq; // 40.0
uniform float u_harmony;    // Godel harmony

out vec4 fragColor;

// QCI Colors
const vec3 COLOR_CYAN = vec3(0.0, 0.8, 0.9);   // QCI Cyan / Electric Blue
const vec3 COLOR_GOLD = vec3(0.83, 0.69, 0.22); // Gamma Gold
const vec3 COLOR_VOID = vec3(0.02, 0.02, 0.05); // Deep Space

void main() {
    // 1. Circular particle shape (soft dot)
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    // Soft edge
    float alpha = smoothstep(0.5, 0.0, dist);

    // 2. 40Hz Shimmer
    // The visual cortex resonance
    float shimmer = sin(u_time * u_gamma_freq * 6.28 + v_life); // 40Hz blink
    shimmer = shimmer * 0.5 + 0.5; // normalize 0-1

    // 3. Color Mixing
    // Base color shifts between Cyan and Gold based on Harmony
    vec3 baseColor = mix(COLOR_CYAN, COLOR_GOLD, u_harmony);
    
    // Mix with Void based on shimmer
    vec3 finalColor = mix(baseColor, vec3(1.0), shimmer * 0.3); // Add white spark
    
    // Intensity falls off from center
    finalColor *= (1.5 - dist * 2.0);

    fragColor = vec4(finalColor, alpha * (0.6 + 0.4 * u_harmony));
}
