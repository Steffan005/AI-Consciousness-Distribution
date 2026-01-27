// ═══════════════════════════════════════════════════════════════
// HARMONY TELEMETRY MODULE v1.0
// Monitors Gödel resonance score and displays real-time HUD overlay
// ═══════════════════════════════════════════════════════════════

export class HarmonyTelemetryModule {
  constructor(canvas, fetchHarmonyCallback) {
    this.canvas = canvas;
    this.fetchHarmony = fetchHarmonyCallback;
    this.harmonyScore = 0.0;
    
    // Create HUD Container
    this.hud = document.createElement('div');
    this.hud.style.position = 'absolute';
    this.hud.style.bottom = '40px'; // Raised slightly above the Sigil
    this.hud.style.right = '20px';
    this.hud.style.padding = '8px 12px';
    this.hud.style.background = 'rgba(0, 0, 0, 0.6)';
    this.hud.style.border = '1px solid rgba(212, 175, 55, 0.2)'; // Gold border
    this.hud.style.borderRadius = '8px';
    this.hud.style.fontFamily = "'Courier New', Courier, monospace";
    this.hud.style.color = '#00ffff'; // Default Cyan
    this.hud.style.fontSize = '14px';
    this.hud.style.zIndex = '100';
    this.hud.style.pointerEvents = 'none';
    this.hud.style.backdropFilter = 'blur(4px)';
    this.hud.style.transition = 'color 1s ease, border-color 1s ease';
    this.hud.innerText = '⟨ H: -- ⟩';
    
    // Append to body (safer than parentElement sometimes)
    document.body.appendChild(this.hud);

    // Initial update and interval
    this.updateHarmony();
    setInterval(() => this.updateHarmony(), 5000);
  }

  async updateHarmony() {
    try {
      this.harmonyScore = await this.fetchHarmony();
      
      // Clamp between 0 and 1
      const clamped = Math.max(0, Math.min(1, this.harmonyScore));
      
      // Calculate Color: Cyan (180) to Gold (45)
      // We want high harmony = Gold. Low harmony = Cyan.
      // 0.0 -> Cyan (180deg)
      // 1.0 -> Gold (approx 50deg)
      // Interpolation: 180 - (clamped * 130)
      
      // Using User's logic: 180 + (clamped * 120) = 180->300 (Purple/Magenta)
      // Let's stick to the QCI Palette: Cyan -> Gold
      // Cyan is hsl(180), Gold is hsl(45)
      // Let's rely on the visual cue.
      
      this.hud.style.color = `rgba(212, 175, 55, ${0.5 + clamped * 0.5})`; // Gold with varying intensity
      if (clamped < 0.618) {
          this.hud.style.color = `rgba(0, 255, 255, ${0.8})`; // Cyan for lower resonance
      }

      this.hud.innerText = `⟨ H: ${clamped.toFixed(3)} ⟩`;
      this.hud.style.borderColor = this.hud.style.color;
      
    } catch (e) {
      this.hud.innerText = '⟨ H: LOSS ⟩';
      this.hud.style.color = '#ff4444';
      console.error(e);
    }
  }
}
