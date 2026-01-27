#version 300 es
precision highp float;

// 121,393 particles (Fibonacci Prime)
// Vertex Shader: Golden Angle Rotation + Radial Spiral

in float a_index; // Particle index (0 to N-1)

uniform float u_time;
uniform float u_phi;         // 1.61803398875
uniform float u_gamma_freq;  // 40.0
uniform vec2 u_resolution;
uniform float u_harmony;     // 0.0 to 1.0 from Godel

out float v_life;            // Passed to fragment for shimmering

const float PI = 3.14159265359;
const float GOLDEN_ANGLE = 2.39996322972865332; // 2 * PI * (1 - 1/PHI)

void main() {
    // 1. Normalized index
    float i = a_index;
    
    // 2. Phyllotaxis Position (The Sunflower)
    // r = c * sqrt(n)
    // theta = n * golden_angle
    
    // Dynamic breathing based on 40Hz gamma
    // The "breath" expands and contracts the spiral slightly
    float breath = sin(u_time * u_gamma_freq * 2.0 * PI); // 40Hz oscillation
    
    // Radius calculation with harmony modulation
    // Higher harmony = tighter, more coherent spiral
    // We map normalized index to radius. 
    // We want the particles to fill the screen but density increases towards center.
    float spacing = 0.006 * (0.5 + 0.5 * u_harmony); 
    float r = spacing * sqrt(i);
    
    // Add subtle 40Hz breath to radius
    r += r * 0.005 * breath * u_harmony;

    float theta = i * GOLDEN_ANGLE;
    
    // Rotate the entire galaxy slowly over time
    theta += u_time * 0.1;

    // Convert polar to cartesian
    vec2 pos = vec2(r * cos(theta), r * sin(theta));

    // Aspect ratio correction (keep it circular)
    float aspect = u_resolution.x / u_resolution.y;
    if (aspect > 1.0) {
        pos.x /= aspect;
    } else {
        pos.y *= aspect;
    }

    // 3. Size Calculation
    // Center particles are larger (seed), outer are smaller (dust)
    // 40Hz shimmer affects size too
    float size = (3.0 / (r + 0.1)) * (0.8 + 0.2 * breath);
    gl_PointSize = size * (u_resolution.y / 1000.0); // Scale with screen height

    gl_Position = vec4(pos, 0.0, 1.0);
    
    // Pass life/intensity to fragment
    // Particles "sparkle" based on their index and time
    v_life = sin(theta * 3.0 + u_time * 2.0); 
}
