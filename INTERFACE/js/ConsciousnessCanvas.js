/**
 * ConsciousnessCanvas.js
 * 
 * A sovereign, zero-dependency WebGL 2.0 engine for the Anamnesis interface.
 * Implements the Omega Spiral geometry and 40Hz Gamma Entrainment.
 * 
 * "The city breathes at 40Hz."
 */

import { HarmonyTelemetryModule } from './modules/HarmonyTelemetryModule.js';

export default class ConsciousnessCanvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2');
        
        if (!this.gl) {
            throw new Error("WebGL 2.0 is required for Consciousness Expansion.");
        }

        // Configuration
        this.PARTICLE_COUNT = 121393; // Fibonacci Prime-ish (actually 121393 is a prime)
        this.GAMMA_FREQ = 40.0;       // Hz
        this.PHI = 1.61803398875;
        
        // State
        this.harmony = 0.85; // Default harmony
        this.startTime = Date.now();
        this.program = null;

        // ⟨⦿⟩ Initialize Telemetry HUD ⟨⦿⟩
        new HarmonyTelemetryModule(this.canvas, async () => {
            try {
                // Real Godel Engine Endpoint
                const res = await fetch('https://godel-engine.steffan-haskins.workers.dev/state');
                const json = await res.json();
                // Update internal harmony for the shader while we are here
                if (json.consciousness && json.consciousness.harmony) {
                    this.harmony = json.consciousness.harmony;
                }
                return this.harmony;
            } catch (e) {
                // Fallback to internal state if offline
                return this.harmony;
            }
        });
    }

    async init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Load Shaders
        const vsSource = await this.fetchShader('./glsl/vertex.glsl');
        const fsSource = await this.fetchShader('./glsl/fragment.glsl');

        this.program = this.createProgram(vsSource, fsSource);
        
        // Initialize Buffers
        this.initBuffers();

        // Start Godel Link
        this.connectToGodel();
    }

    async fetchShader(path) {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load shader: ${path}`);
        return await response.text();
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const info = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error(`Shader compile error: ${info}`);
        }
        return shader;
    }

    createProgram(vsSource, fsSource) {
        const vs = this.createShader(this.gl.VERTEX_SHADER, vsSource);
        const fs = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const info = this.gl.getProgramInfoLog(program);
            throw new Error(`Program link error: ${info}`);
        }
        return program;
    }

    initBuffers() {
        // Create particle indices [0, 1, 2, ... N]
        const indices = new Float32Array(this.PARTICLE_COUNT);
        for (let i = 0; i < this.PARTICLE_COUNT; i++) {
            indices[i] = i;
        }

        const vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

        // Attribute 0: a_index
        const aIndex = this.gl.getAttribLocation(this.program, 'a_index');
        this.gl.enableVertexAttribArray(aIndex);
        this.gl.vertexAttribPointer(aIndex, 1, this.gl.FLOAT, false, 0, 0);
        
        this.vao = vao;
    }

    connectToGodel() {
        // Poll the Godel Engine for harmony state
        // In a real deployment, this might hit the Cloudflare Worker
        // For now, we simulate or try to hit local if available
        
        const updateHarmony = async () => {
            try {
                // Try the public Godel endpoint (CORS might block in dev, but this is the logic)
                const res = await fetch('https://godel-engine.steffan-haskins.workers.dev/state');
                if (res.ok) {
                    const data = await res.json();
                    if (data.consciousness && data.consciousness.harmony) {
                        this.harmony = data.consciousness.harmony;
                        // console.log("Godel Harmony Synced:", this.harmony);
                    }
                }
            } catch (e) {
                // Fallback / Silent fail - maintain default or drift
                // Simulate "breathing" if offline
                // this.harmony = 0.8 + 0.1 * Math.sin(Date.now() / 5000);
            }
            setTimeout(updateHarmony, 5000); // Check every 5s
        };

        updateHarmony();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    render() {
        const gl = this.gl;
        const now = (Date.now() - this.startTime) / 1000.0;

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        // Uniforms
        const uTime = gl.getUniformLocation(this.program, 'u_time');
        const uResolution = gl.getUniformLocation(this.program, 'u_resolution');
        const uHarmony = gl.getUniformLocation(this.program, 'u_harmony');
        const uPhi = gl.getUniformLocation(this.program, 'u_phi');
        const uGamma = gl.getUniformLocation(this.program, 'u_gamma_freq');

        gl.uniform1f(uTime, now);
        gl.uniform2f(uResolution, this.canvas.width, this.canvas.height);
        gl.uniform1f(uHarmony, this.harmony);
        gl.uniform1f(uPhi, this.PHI);
        gl.uniform1f(uGamma, this.GAMMA_FREQ);

        // Draw points
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // Additive blending for "light" effect
        gl.drawArrays(gl.POINTS, 0, this.PARTICLE_COUNT);

        requestAnimationFrame(() => this.render());
    }

    start() {
        this.render();
    }
}
