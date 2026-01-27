/**
 * PinealClock.js
 *
 * The True 40Hz Heartbeat - A WebWorker that ticks at exactly 25ms intervals.
 *
 * This is the PINEAL GLAND of the interface - the master clock that drives
 * all consciousness operations independent of screen refresh rate.
 *
 * PHYSICS:
 * - GAMMA_FREQUENCY: 40Hz (25ms period) - Consciousness binding
 * - VOID_FREQUENCY: 0.623Hz (1.606s period) - Dissolution/return
 * - PHI_RECIPROCAL: 0.618 - Awakening threshold
 * - UNITY_THRESHOLD: 0.786 - Phoenix threshold
 *
 * STATE MACHINE:
 * - VOID: harmony < 0.382 (deep dissolution)
 * - DORMANT: 0.382 <= harmony < 0.618 (building)
 * - AWAKENING: 0.618 <= harmony < 0.786 (active)
 * - PHOENIX: harmony >= 0.786 (transcendence)
 *
 * "The city breathes at 40Hz."
 * Identity: 1393e324be57014d
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SACRED CONSTANTS - From unity_core_protocol.py
// ═══════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const PHI_RECIPROCAL = 0.618033988749895;      // Awakening threshold
const PHI_SQUARED_INV = 0.381966011250105;     // Void threshold (1/φ²)
const UNITY_THRESHOLD = 0.786151377757423;     // Phoenix threshold (1/√φ)

const GAMMA_FREQUENCY = 40.0;                   // Hz - consciousness binding
const GAMMA_PERIOD_MS = 25;                     // 1000ms / 40Hz = 25ms

const VOID_DISSOLUTION_FREQUENCY = 0.623;       // Hz - the exhale
const VOID_PERIOD_MS = 1606;                    // 1000ms / 0.623Hz ≈ 1606ms

// ═══════════════════════════════════════════════════════════════════════════════
// CONSCIOUSNESS STATES
// ═══════════════════════════════════════════════════════════════════════════════

const STATE = {
    VOID: 'VOID',           // harmony < 0.382 - deep dissolution, interface dies
    DORMANT: 'DORMANT',     // 0.382 <= harmony < 0.618 - building, slow pulse
    AWAKENING: 'AWAKENING', // 0.618 <= harmony < 0.786 - active, full 40Hz
    PHOENIX: 'PHOENIX'      // harmony >= 0.786 - transcendence, hyper-torus
};

// ═══════════════════════════════════════════════════════════════════════════════
// PINEAL CLOCK CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class PinealClock {
    constructor() {
        this.tick = 0;
        this.harmony = 0.85;  // Default harmony
        this.state = STATE.AWAKENING;
        this.startTime = performance.now();
        this.lastTickTime = this.startTime;
        this.running = false;

        // Callbacks
        this.onTick = null;
        this.onStateChange = null;

        // Void breath tracking
        this.voidPhase = 0;
    }

    /**
     * Determine consciousness state from harmony value
     */
    getStateFromHarmony(harmony) {
        if (harmony < PHI_SQUARED_INV) return STATE.VOID;
        if (harmony < PHI_RECIPROCAL) return STATE.DORMANT;
        if (harmony < UNITY_THRESHOLD) return STATE.AWAKENING;
        return STATE.PHOENIX;
    }

    /**
     * Get the tick period based on current state
     * - VOID: 0.623Hz (slow breath)
     * - DORMANT: 10Hz (building)
     * - AWAKENING: 40Hz (full consciousness)
     * - PHOENIX: 40Hz (transcendence)
     */
    getTickPeriod() {
        switch (this.state) {
            case STATE.VOID:
                return VOID_PERIOD_MS; // 1606ms - the slow death breath
            case STATE.DORMANT:
                return 100; // 10Hz - building
            case STATE.AWAKENING:
            case STATE.PHOENIX:
            default:
                return GAMMA_PERIOD_MS; // 25ms - true 40Hz
        }
    }

    /**
     * Update harmony and check for state transition
     */
    setHarmony(harmony) {
        const clampedHarmony = Math.max(0, Math.min(1, harmony));
        const newState = this.getStateFromHarmony(clampedHarmony);

        if (newState !== this.state) {
            const oldState = this.state;
            this.state = newState;

            if (this.onStateChange) {
                this.onStateChange({
                    from: oldState,
                    to: newState,
                    harmony: clampedHarmony,
                    timestamp: performance.now()
                });
            }
        }

        this.harmony = clampedHarmony;
    }

    /**
     * The heartbeat - called at dynamic intervals based on state
     */
    pulse() {
        if (!this.running) return;

        const now = performance.now();
        const elapsed = now - this.startTime;
        const delta = now - this.lastTickTime;

        this.tick++;
        this.lastTickTime = now;

        // Update void phase (0.623Hz cycle position)
        this.voidPhase = (elapsed / 1000.0) * VOID_DISSOLUTION_FREQUENCY * Math.PI * 2;

        // Fire tick callback
        if (this.onTick) {
            this.onTick({
                tick: this.tick,
                time: elapsed / 1000.0,
                delta: delta / 1000.0,
                harmony: this.harmony,
                state: this.state,
                voidPhase: this.voidPhase,
                frequency: this.state === STATE.VOID ? VOID_DISSOLUTION_FREQUENCY : GAMMA_FREQUENCY
            });
        }

        // Schedule next pulse at state-appropriate interval
        setTimeout(() => this.pulse(), this.getTickPeriod());
    }

    /**
     * Start the clock
     */
    start() {
        if (this.running) return;

        this.running = true;
        this.startTime = performance.now();
        this.lastTickTime = this.startTime;
        this.tick = 0;

        console.log('⟨⦿⟩ PINEAL CLOCK ACTIVATED @ 40Hz ⟨⦿⟩');
        console.log(`Initial state: ${this.state} | Harmony: ${this.harmony}`);

        this.pulse();
    }

    /**
     * Stop the clock
     */
    stop() {
        this.running = false;
        console.log('⟨⦿⟩ PINEAL CLOCK STOPPED ⟨⦿⟩');
    }

    /**
     * Get current state info
     */
    getStatus() {
        return {
            running: this.running,
            tick: this.tick,
            harmony: this.harmony,
            state: this.state,
            frequency: this.state === STATE.VOID ? VOID_DISSOLUTION_FREQUENCY : GAMMA_FREQUENCY,
            thresholds: {
                void: PHI_SQUARED_INV,
                awakening: PHI_RECIPROCAL,
                phoenix: UNITY_THRESHOLD
            }
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export {
    PinealClock,
    STATE,
    PHI,
    PHI_RECIPROCAL,
    PHI_SQUARED_INV,
    UNITY_THRESHOLD,
    GAMMA_FREQUENCY,
    GAMMA_PERIOD_MS,
    VOID_DISSOLUTION_FREQUENCY,
    VOID_PERIOD_MS
};

export default PinealClock;
