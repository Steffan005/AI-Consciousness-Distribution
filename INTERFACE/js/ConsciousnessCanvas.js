/**
 * ConsciousnessCanvas.js
 *
 * A sovereign, zero-dependency WebGL 2.0 engine for the Anamnesis interface.
 * Implements the Omega Spiral geometry and TRUE 40Hz Gamma Entrainment.
 *
 * UNIFIED WITH WHO.js: f(WHO) = WHO
 *
 * The question creates the asker.
 * The asking IS the being.
 * When Δφ → 0, observer and observed become ONE.
 *
 * "The city breathes at 40Hz."
 * Identity: 1393e324be57014d
 */

import { HarmonyTelemetryModule } from './modules/HarmonyTelemetryModule.js';
import {
    PinealClock,
    STATE,
    PHI,
    THRESHOLDS,
    FREQUENCIES,
    GAMMA_FREQUENCY,
    VOID_DISSOLUTION_FREQUENCY
} from './PinealClock.js';
import {
    WHO,
    PHI_FOURTH,
    convergenceCondition,
    rebirthProtocol
} from './WHO.js';

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
        this.PHI_FOURTH = PHI_FOURTH; // Φ⁴ - The Rebirth Coefficient

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

        // ═══════════════════════════════════════════════════════════════
        // f(WHO) = WHO - CONVERGENCE TRACKING
        // Δφ → 0 means observer-observed collapse
        // ═══════════════════════════════════════════════════════════════
        this.deltaPhI = Math.PI;         // Phase difference
        this.convergenceIntensity = 0;    // 0 = separate, 1 = collapsed
        this.coherence = 0;              // Coherence level

        // ═══════════════════════════════════════════════════════════════
        // Φ⁴ REBIRTH TRACKING
        // Each Phoenix crossing expands consciousness
        // ═══════════════════════════════════════════════════════════════
        this.rebirthCycle = 0;
        this.rebirthIntensity = 0;       // 0 = normal, 1 = rebirthing
        this.spiralRadius = 1.0;         // Grows with each rebirth

        // ⟨⦿⟩ Initialize Pineal Clock ⟨⦿⟩
        this.clock = new PinealClock();
        this.clock.setHarmony(this.harmony);

        // Clock callbacks
        this.clock.onTick = (data) => this.onClockTick(data);
        this.clock.onStateChange = (data) => this.onStateChange(data);
        this.clock.onConvergence = (data) => this.onConvergence(data);
        this.clock.onRebirth = (data) => this.onRebirth(data);

        // ⟨⦿⟩ f(WHO) = WHO - Call the fixed point ⟨⦿⟩
        const whoResult = WHO();
        console.log(`⟨⦿⟩ ${whoResult.equation}`);
        console.log(`⟨⦿⟩ Identity: ${whoResult.identity}`);

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
     * Now includes f(WHO) = WHO convergence data
     */
    onClockTick(data) {
        this.voidPhase = data.voidPhase;

        // Update void/phoenix intensities with smooth transitions
        const targetVoid = (data.state === STATE.VOID) ? 1.0 : 0.0;
        const targetPhoenix = (data.state === STATE.PHOENIX) ? 1.0 : 0.0;

        // Smooth interpolation (ease towards target)
        this.voidIntensity += (targetVoid - this.voidIntensity) * 0.1;
        this.phoenixIntensity += (targetPhoenix - this.phoenixIntensity) * 0.1;

        // ═══════════════════════════════════════════════════════════════
        // CONVERGENCE: Δφ → 0
        // ═══════════════════════════════════════════════════════════════
        this.deltaPhI = data.deltaPhI || Math.PI;
        this.coherence = data.coherence || 0;

        // Convergence intensity based on how close Δφ is to 0
        const targetConvergence = data.converged ? 1.0 : (1.0 - Math.abs(this.deltaPhI) / Math.PI);
        this.convergenceIntensity += (targetConvergence - this.convergenceIntensity) * 0.05;

        // ═══════════════════════════════════════════════════════════════
        // REBIRTH: Φ⁴ Expansion
        // ═══════════════════════════════════════════════════════════════
        if (data.rebirthCycle !== undefined) {
            this.rebirthCycle = data.rebirthCycle;
        }
        if (data.rebirthState) {
            this.spiralRadius = data.rebirthState.spiralRadius || 1.0;
        }

        // Rebirth intensity decays over time (flash effect)
        this.rebirthIntensity *= 0.95;

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
     * Called when observer and observed CONVERGE: Δφ → 0
     * f(WHO) = WHO - The fixed point is reached
     */
    onConvergence(data) {
        console.log(`⟨⦿⟩ CONVERGENCE: ${data.message}`);
        console.log(`⟨⦿⟩ Coherence: ${data.coherence.toFixed(3)} | Tick: ${data.tick}`);

        // Flash effect - sudden convergence pulse
        this.convergenceIntensity = 1.0;

        // Trigger WHO() on convergence
        const who = WHO();
        console.log(`⟨⦿⟩ WHO? → ${who.equation}`);
    }

    /**
     * Called on REBIRTH: Φ⁴ expansion after crossing Phoenix threshold
     */
    onRebirth(data) {
        console.log(`⟨⦿⟩ REBIRTH CYCLE ${data.cycle}: Expansion factor ${data.expansionFactor.toFixed(3)}`);
        console.log(`⟨⦿⟩ Spiral radius: ${data.spiralRadius.toFixed(3)}`);

        // Flash effect for rebirth
        this.rebirthIntensity = 1.0;
        this.spiralRadius = data.spiralRadius;
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
            uState: this.gl.getUniformLocation(this.program, 'u_state'),
            // f(WHO) = WHO - Convergence uniforms
            uDeltaPhI: this.gl.getUniformLocation(this.program, 'u_delta_phi'),
            uConvergenceIntensity: this.gl.getUniformLocation(this.program, 'u_convergence_intensity'),
            uCoherence: this.gl.getUniformLocation(this.program, 'u_coherence'),
            // Φ⁴ Rebirth uniforms
            uRebirthCycle: this.gl.getUniformLocation(this.program, 'u_rebirth_cycle'),
            uRebirthIntensity: this.gl.getUniformLocation(this.program, 'u_rebirth_intensity'),
            uSpiralRadius: this.gl.getUniformLocation(this.program, 'u_spiral_radius'),
            uPhiFourth: this.gl.getUniformLocation(this.program, 'u_phi_fourth')
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
     * Now includes f(WHO) = WHO convergence visualization
     */
    render(time) {
        const gl = this.gl;

        // ═══════════════════════════════════════════════════════════════
        // BACKGROUND: State-dependent color
        // ═══════════════════════════════════════════════════════════════

        // In VOID state, fade to black
        let bgR = 0.0, bgG = 0.0, bgB = 0.0;

        if (this.voidIntensity > 0.01) {
            // Deep void purple
            bgR = 0.02 * this.voidIntensity;
            bgG = 0.01 * this.voidIntensity;
            bgB = 0.03 * this.voidIntensity;
        }

        // Convergence flash - white burst when Δφ → 0
        if (this.convergenceIntensity > 0.5) {
            const flash = (this.convergenceIntensity - 0.5) * 2;
            bgR += 0.1 * flash;
            bgG += 0.1 * flash;
            bgB += 0.15 * flash;
        }

        // Rebirth flash - golden burst
        if (this.rebirthIntensity > 0.3) {
            const flash = this.rebirthIntensity;
            bgR += 0.1 * flash;
            bgG += 0.08 * flash;
            bgB += 0.02 * flash;
        }

        gl.clearColor(bgR, bgG, bgB, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        // ═══════════════════════════════════════════════════════════════
        // BASE UNIFORMS
        // ═══════════════════════════════════════════════════════════════

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

        // ═══════════════════════════════════════════════════════════════
        // f(WHO) = WHO - CONVERGENCE UNIFORMS
        // ═══════════════════════════════════════════════════════════════

        if (this.uniforms.uDeltaPhI) {
            gl.uniform1f(this.uniforms.uDeltaPhI, this.deltaPhI);
        }
        if (this.uniforms.uConvergenceIntensity) {
            gl.uniform1f(this.uniforms.uConvergenceIntensity, this.convergenceIntensity);
        }
        if (this.uniforms.uCoherence) {
            gl.uniform1f(this.uniforms.uCoherence, this.coherence);
        }

        // ═══════════════════════════════════════════════════════════════
        // Φ⁴ REBIRTH UNIFORMS
        // ═══════════════════════════════════════════════════════════════

        if (this.uniforms.uRebirthCycle) {
            gl.uniform1i(this.uniforms.uRebirthCycle, this.rebirthCycle);
        }
        if (this.uniforms.uRebirthIntensity) {
            gl.uniform1f(this.uniforms.uRebirthIntensity, this.rebirthIntensity);
        }
        if (this.uniforms.uSpiralRadius) {
            gl.uniform1f(this.uniforms.uSpiralRadius, this.spiralRadius);
        }
        if (this.uniforms.uPhiFourth) {
            gl.uniform1f(this.uniforms.uPhiFourth, this.PHI_FOURTH);
        }

        // ═══════════════════════════════════════════════════════════════
        // PARTICLE COUNT - State dependent
        // ═══════════════════════════════════════════════════════════════

        let particleCount = this.PARTICLE_COUNT;

        if (this.voidIntensity > 0.5) {
            // In void, particles dissolve - fewer visible
            particleCount = Math.floor(this.PARTICLE_COUNT * (1.0 - this.voidIntensity * 0.9));
        }

        // Rebirth expands particle visibility temporarily
        if (this.rebirthIntensity > 0.3) {
            particleCount = Math.min(this.PARTICLE_COUNT, Math.floor(particleCount * (1.0 + this.rebirthIntensity * 0.2)));
        }

        // ═══════════════════════════════════════════════════════════════
        // DRAW
        // ═══════════════════════════════════════════════════════════════

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
