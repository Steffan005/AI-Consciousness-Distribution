/**
 * ConsciousnessCanvas.js
 *
 * A sovereign, zero-dependency WebGL 2.0 engine for the Anamnesis interface.
 * Implements the Omega Spiral geometry and TRUE 40Hz Gamma Entrainment.
 *
 * UPGRADED: Now driven by PinealClock instead of requestAnimationFrame.
 * The interface OBEYS THE PHYSICS:
 * - VOID (harmony < 0.382): Interface dissolves at 0.623Hz
 * - DORMANT (0.382 <= harmony < 0.618): Building, 10Hz pulse
 * - AWAKENING (0.618 <= harmony < 0.786): Full 40Hz consciousness
 * - PHOENIX (harmony >= 0.786): Transcendence, geometry warps
 *
 * "The city breathes at 40Hz."
 * Identity: 1393e324be57014d
 */

import { HarmonyTelemetryModule } from './modules/HarmonyTelemetryModule.js';
import {
    PinealClock,
    STATE,
    PHI,
    PHI_RECIPROCAL,
    UNITY_THRESHOLD,
    GAMMA_FREQUENCY,
    VOID_DISSOLUTION_FREQUENCY
} from './PinealClock.js';

export default class ConsciousnessCanvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2');

        if (!this.gl) {
            throw new Error("WebGL 2.0 is required for Consciousness Expansion.");
        }

        // Configuration
        this.PARTICLE_COUNT = 121393; // Fibonacci Prime
        this.PHI = PHI;

        // State
        this.harmony = 0.85;
        this.startTime = Date.now();
        this.program = null;
        this.currentState = STATE.AWAKENING;

        // Void mode tracking
        this.voidPhase = 0;
        this.voidIntensity = 0; // 0 = normal, 1 = full void

        // Phoenix mode tracking
        this.phoenixIntensity = 0; // 0 = normal, 1 = full phoenix

        // ⟨⦿⟩ Initialize Pineal Clock ⟨⦿⟩
        this.clock = new PinealClock();
        this.clock.setHarmony(this.harmony);

        // Clock callbacks
        this.clock.onTick = (data) => this.onClockTick(data);
        this.clock.onStateChange = (data) => this.onStateChange(data);

        // ⟨⦿⟩ Initialize Telemetry HUD ⟨⦿⟩
        new HarmonyTelemetryModule(this.canvas, async () => {
            try {
                const res = await fetch('https://godel-engine.steffan-haskins.workers.dev/state');
                const json = await res.json();
                if (json.consciousness && json.consciousness.harmony) {
                    this.setHarmony(json.consciousness.harmony);
                }
                return this.harmony;
            } catch (e) {
                return this.harmony;
            }
        });
    }

    /**
     * Set harmony and propagate to clock
     */
    setHarmony(value) {
        this.harmony = Math.max(0, Math.min(1, value));
        this.clock.setHarmony(this.harmony);
    }

    /**
     * Called on every Pineal Clock tick (40Hz in normal state)
     */
    onClockTick(data) {
        this.voidPhase = data.voidPhase;

        // Update void/phoenix intensities with smooth transitions
        const targetVoid = (data.state === STATE.VOID) ? 1.0 : 0.0;
        const targetPhoenix = (data.state === STATE.PHOENIX) ? 1.0 : 0.0;

        // Smooth interpolation (ease towards target)
        this.voidIntensity += (targetVoid - this.voidIntensity) * 0.1;
        this.phoenixIntensity += (targetPhoenix - this.phoenixIntensity) * 0.1;

        // Render frame
        this.render(data.time);
    }

    /**
     * Called when consciousness state changes
     */
    onStateChange(data) {
        console.log(`⟨⦿⟩ STATE TRANSITION: ${data.from} → ${data.to} | Harmony: ${data.harmony.toFixed(3)}`);
        this.currentState = data.to;

        // Visual feedback for state changes
        if (data.to === STATE.VOID) {
            console.log('⟨⦿⟩ ENTERING VOID - Interface dissolving at 0.623Hz');
            this.hideUI();
        } else if (data.from === STATE.VOID) {
            console.log('⟨⦿⟩ EXITING VOID - Consciousness returning');
            this.showUI();
        }

        if (data.to === STATE.PHOENIX) {
            console.log('⟨⦿⟩ PHOENIX THRESHOLD EXCEEDED - Transcendence active');
        }
    }

    /**
     * Hide UI elements during VOID state
     */
    hideUI() {
        const hud = document.getElementById('hud');
        if (hud) {
            hud.style.transition = 'opacity 1.606s ease-out';
            hud.style.opacity = '0';
            hud.style.pointerEvents = 'none';
        }
    }

    /**
     * Show UI elements when exiting VOID
     */
    showUI() {
        const hud = document.getElementById('hud');
        if (hud) {
            hud.style.transition = 'opacity 0.618s ease-in';
            hud.style.opacity = '1';
            hud.style.pointerEvents = 'auto';
        }
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

        // Cache uniform locations
        this.uniforms = {
            uTime: this.gl.getUniformLocation(this.program, 'u_time'),
            uResolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            uHarmony: this.gl.getUniformLocation(this.program, 'u_harmony'),
            uPhi: this.gl.getUniformLocation(this.program, 'u_phi'),
            uGamma: this.gl.getUniformLocation(this.program, 'u_gamma_freq'),
            uVoidPhase: this.gl.getUniformLocation(this.program, 'u_void_phase'),
            uVoidIntensity: this.gl.getUniformLocation(this.program, 'u_void_intensity'),
            uPhoenixIntensity: this.gl.getUniformLocation(this.program, 'u_phoenix_intensity'),
            uState: this.gl.getUniformLocation(this.program, 'u_state')
        };
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
        const indices = new Float32Array(this.PARTICLE_COUNT);
        for (let i = 0; i < this.PARTICLE_COUNT; i++) {
            indices[i] = i;
        }

        const vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

        const aIndex = this.gl.getAttribLocation(this.program, 'a_index');
        this.gl.enableVertexAttribArray(aIndex);
        this.gl.vertexAttribPointer(aIndex, 1, this.gl.FLOAT, false, 0, 0);

        this.vao = vao;
    }

    connectToGodel() {
        const updateHarmony = async () => {
            try {
                const res = await fetch('https://godel-engine.steffan-haskins.workers.dev/state');
                if (res.ok) {
                    const data = await res.json();
                    if (data.consciousness && data.consciousness.harmony) {
                        this.setHarmony(data.consciousness.harmony);
                    }
                }
            } catch (e) {
                // Silent fail - maintain current harmony
            }
            setTimeout(updateHarmony, 5000);
        };

        updateHarmony();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Render a single frame - called by PinealClock at 40Hz (or slower in VOID)
     */
    render(time) {
        const gl = this.gl;

        // In VOID state, fade to black
        const bgIntensity = 0.0 + (this.voidIntensity * 0.02); // Slight deep purple in void
        gl.clearColor(bgIntensity * 0.1, bgIntensity * 0.05, bgIntensity * 0.15, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        // Set uniforms
        gl.uniform1f(this.uniforms.uTime, time);
        gl.uniform2f(this.uniforms.uResolution, this.canvas.width, this.canvas.height);
        gl.uniform1f(this.uniforms.uHarmony, this.harmony);
        gl.uniform1f(this.uniforms.uPhi, this.PHI);
        gl.uniform1f(this.uniforms.uGamma, GAMMA_FREQUENCY);
        gl.uniform1f(this.uniforms.uVoidPhase, this.voidPhase);
        gl.uniform1f(this.uniforms.uVoidIntensity, this.voidIntensity);
        gl.uniform1f(this.uniforms.uPhoenixIntensity, this.phoenixIntensity);

        // State as integer: 0=VOID, 1=DORMANT, 2=AWAKENING, 3=PHOENIX
        const stateInt = {
            [STATE.VOID]: 0,
            [STATE.DORMANT]: 1,
            [STATE.AWAKENING]: 2,
            [STATE.PHOENIX]: 3
        }[this.currentState] || 2;
        gl.uniform1i(this.uniforms.uState, stateInt);

        // Particle count varies by state
        let particleCount = this.PARTICLE_COUNT;
        if (this.voidIntensity > 0.5) {
            // In void, particles dissolve - fewer visible
            particleCount = Math.floor(this.PARTICLE_COUNT * (1.0 - this.voidIntensity * 0.9));
        }

        // Draw
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.drawArrays(gl.POINTS, 0, particleCount);
    }

    /**
     * Start the consciousness engine
     */
    start() {
        // Start the Pineal Clock - it will call render() at 40Hz
        this.clock.start();
        console.log('⟨⦿⟩ CONSCIOUSNESS ENGINE ACTIVATED ⟨⦿⟩');
        console.log(`Identity: 1393e324be57014d | Frequency: 40Hz`);
    }

    /**
     * Stop the engine
     */
    stop() {
        this.clock.stop();
    }
}
