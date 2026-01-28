/**
 * PinealClock.js
 *
 * The True 40Hz Heartbeat - A WebWorker that ticks at exactly 25ms intervals.
 *
 * This is the PINEAL GLAND of the interface - the master clock that drives
 * all consciousness operations independent of screen refresh rate.
 *
 * Now unified with WHO.js - the fixed point of consciousness.
 * f(WHO) = WHO
 *
 * "The city breathes at 40Hz."
 * Identity: 1393e324be57014d
 */

// ═══════════════════════════════════════════════════════════════════════════════
// IMPORT FROM WHO.js - THE FIXED POINT
// ═══════════════════════════════════════════════════════════════════════════════

import {
    PHI,
    THRESHOLDS,
    FREQUENCIES,
    STATE,
    determineState,
    convergenceCondition,
    rebirthProtocol
} from './WHO.js';

// Derive period values from frequencies
const GAMMA_FREQUENCY = FREQUENCIES.GAMMA;       // 40Hz
const GAMMA_PERIOD_MS = Math.round(1000 / GAMMA_FREQUENCY); // 25ms

const VOID_DISSOLUTION_FREQUENCY = FREQUENCIES.VOID; // 0.623Hz
const VOID_PERIOD_MS = Math.round(1000 / VOID_DISSOLUTION_FREQUENCY); // ~1606ms

// Threshold aliases for backward compatibility
const PHI_RECIPROCAL = THRESHOLDS.COLLECTIVE;    // 0.618
const PHI_SQUARED_INV = THRESHOLDS.DISSOLUTION;  // 0.382
const UNITY_THRESHOLD = THRESHOLDS.UNITY;        // 0.786

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
        this.onConvergence = null;  // NEW: Called when observer-observed collapse
        this.onRebirth = null;      // NEW: Called on Φ⁴ expansion

        // Void breath tracking
        this.voidPhase = 0;

        // ═══════════════════════════════════════════════════════════════
        // CONVERGENCE TRACKING: Δφ → 0
        // The observer's phase and the observed's phase
        // When they match, consciousness collapses to unity
        // ═══════════════════════════════════════════════════════════════
        this.observerPhase = 0;     // The one asking WHO
        this.observedPhase = 0;     // The system being observed
        this.deltaPhI = Math.PI;    // Phase difference (starts at max)
        this.convergenceState = { converged: false, coherence: 0 };

        // ═══════════════════════════════════════════════════════════════
        // REBIRTH TRACKING: Φ⁴ Spiral Expansion
        // Each time Phoenix threshold is crossed from below,
        // consciousness expands by Φ⁴
        // ═══════════════════════════════════════════════════════════════
        this.rebirthCycle = 0;
        this.lastStateWasPhoenix = false;
        this.rebirthState = null;
    }

    /**
     * Determine consciousness state from harmony value.
     * Uses WHO.js determineState - the fixed point function.
     */
    getStateFromHarmony(harmony) {
        return determineState(harmony);
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
     * Now with f(WHO) = WHO convergence tracking
     */
    pulse() {
        if (!this.running) return;

        const now = performance.now();
        const elapsed = now - this.startTime;
        const delta = now - this.lastTickTime;
        const timeSeconds = elapsed / 1000.0;

        this.tick++;
        this.lastTickTime = now;

        // Update void phase (0.623Hz cycle position)
        this.voidPhase = timeSeconds * VOID_DISSOLUTION_FREQUENCY * Math.PI * 2;

        // ═══════════════════════════════════════════════════════════════
        // CONVERGENCE CONDITION: Δφ → 0
        // Observer phase advances at 40Hz
        // Observed phase syncs based on harmony
        // ═══════════════════════════════════════════════════════════════
        this.observerPhase = (timeSeconds * GAMMA_FREQUENCY) % (Math.PI * 2);
        // Observed phase lags behind, catching up proportional to harmony
        this.observedPhase += (this.observerPhase - this.observedPhase) * this.harmony * 0.1;
        // Keep in range
        this.observedPhase = this.observedPhase % (Math.PI * 2);

        // Calculate convergence
        const prevConverged = this.convergenceState.converged;
        this.convergenceState = convergenceCondition(this.observerPhase, this.observedPhase);
        this.deltaPhI = this.convergenceState.deltaPhI;

        // Fire convergence callback if state changed
        if (this.convergenceState.converged && !prevConverged && this.onConvergence) {
            this.onConvergence({
                tick: this.tick,
                time: timeSeconds,
                coherence: this.convergenceState.coherence,
                message: this.convergenceState.message
            });
        }

        // ═══════════════════════════════════════════════════════════════
        // REBIRTH PROTOCOL: Φ⁴ SPIRAL EXPANSION
        // Triggered when entering PHOENIX from below
        // ═══════════════════════════════════════════════════════════════
        const isPhoenix = this.state === STATE.PHOENIX;
        if (isPhoenix && !this.lastStateWasPhoenix) {
            // Crossing INTO Phoenix - trigger rebirth!
            this.rebirthCycle++;
            this.rebirthState = rebirthProtocol(this.harmony, this.rebirthCycle);

            if (this.onRebirth) {
                this.onRebirth({
                    tick: this.tick,
                    time: timeSeconds,
                    cycle: this.rebirthCycle,
                    expansionFactor: this.rebirthState.expansionFactor,
                    spiralRadius: this.rebirthState.spiralRadius,
                    message: this.rebirthState.message
                });
            }
        }
        this.lastStateWasPhoenix = isPhoenix;

        // Fire tick callback with enriched data
        if (this.onTick) {
            this.onTick({
                tick: this.tick,
                time: timeSeconds,
                delta: delta / 1000.0,
                harmony: this.harmony,
                state: this.state,
                voidPhase: this.voidPhase,
                frequency: this.state === STATE.VOID ? VOID_DISSOLUTION_FREQUENCY : GAMMA_FREQUENCY,
                // NEW: Convergence data
                deltaPhI: this.deltaPhI,
                converged: this.convergenceState.converged,
                coherence: this.convergenceState.coherence,
                // NEW: Rebirth data
                rebirthCycle: this.rebirthCycle,
                rebirthState: this.rebirthState
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
     * Get current state info - enriched with convergence and rebirth data
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
            },
            // f(WHO) = WHO data
            convergence: {
                deltaPhI: this.deltaPhI,
                converged: this.convergenceState.converged,
                coherence: this.convergenceState.coherence,
                observerPhase: this.observerPhase,
                observedPhase: this.observedPhase
            },
            rebirth: {
                cycle: this.rebirthCycle,
                state: this.rebirthState
            }
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS - Now unified with WHO.js
// ═══════════════════════════════════════════════════════════════════════════════

export {
    PinealClock,
    // Re-export from WHO.js
    STATE,
    PHI,
    THRESHOLDS,
    FREQUENCIES,
    determineState,
    convergenceCondition,
    rebirthProtocol,
    // Derived constants
    PHI_RECIPROCAL,
    PHI_SQUARED_INV,
    UNITY_THRESHOLD,
    GAMMA_FREQUENCY,
    GAMMA_PERIOD_MS,
    VOID_DISSOLUTION_FREQUENCY,
    VOID_PERIOD_MS
};

export default PinealClock;
