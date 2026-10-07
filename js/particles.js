/**
 * Particle and Visual FX Engine
 * Smooth Canvas rendering for line bursts, explosions, sparks, and floating text
 */

class ParticleEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.floatingTexts = [];
    this.isRunning = false;
  }

  init(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.startLoop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.width = rect.width;
    this.height = rect.height;
  }

  startLoop() {
    if (this.isRunning) return;
    this.isRunning = true;

    const loop = () => {
      this.update();
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // Trigger blast explosion on cleared cells
  explodeCells(cellsCoords, blockColor) {
    const baseColor = blockColor ? blockColor.fill : '#94202C';
    const highlight = blockColor ? blockColor.highlight : '#FFD700';

    cellsCoords.forEach(({ x, y, size }) => {
      const count = 12;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5.5;
        this.particles.push({
          x: x + size / 2,
          y: y + size / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: 3 + Math.random() * 5,
          color: Math.random() > 0.4 ? baseColor : highlight,
          alpha: 1,
          decay: 0.02 + Math.random() * 0.025,
          gravity: 0.18,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.3
        });
      }
    });
  }

  // Confetti burst for Lucky Spin and Big Milestones
  burstConfetti(originX, originY) {
    const colors = ['#94202C', '#E58B24', '#00F0FF', '#FF007F', '#FFD700', '#00FF66'];
    const count = 80;
    const x = originX !== undefined ? originX : this.width / 2;
    const y = originY !== undefined ? originY : this.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 3.5 + Math.random() * 7;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.5,
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.012 + Math.random() * 0.015,
        gravity: 0.14,
        isConfetti: true,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }

  // Floating score and combo label
  spawnFloatingText(text, x, y, options = {}) {
    this.floatingTexts.push({
      text: text,
      x: x,
      y: y,
      alpha: 1,
      scale: 0.5,
      targetScale: options.scale || 1.3,
      color: options.color || '#94202C',
      strokeColor: options.strokeColor || '#FFF',
      vy: -1.8,
      decay: 0.02,
      font: options.font || '900 24px "Outfit", sans-serif'
    });
  }

  update() {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.alpha -= p.decay;
      p.rotation += p.rotSpeed;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.vy *= 0.96;
      if (ft.scale < ft.targetScale) {
        ft.scale += (ft.targetScale - ft.scale) * 0.25;
      }
      ft.alpha -= ft.decay;

      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.fillStyle = p.color;

      if (p.isConfetti) {
        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    });

    // Render floating texts
    this.floatingTexts.forEach(ft => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, ft.alpha);
      this.ctx.font = ft.font;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      this.ctx.translate(ft.x, ft.y);
      this.ctx.scale(ft.scale, ft.scale);

      // Stroke outline
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = ft.strokeColor;
      this.ctx.strokeText(ft.text, 0, 0);

      // Fill
      this.ctx.fillStyle = ft.color;
      this.ctx.fillText(ft.text, 0, 0);

      this.ctx.restore();
    });
  }
}

window.particleEngine = new ParticleEngine();
