import type { Application } from 'pixi.js';
import { Assets, Sprite } from 'pixi.js';
import { Scene } from '../core/Scene';
import {
  CENTER_DIVISOR,
  CORE_ALPHA_AMPLITUDE,
  CORE_ALPHA_BASE,
  CORE_ALPHA_PULSE_FREQUENCY,
  CORE_ALPHA_INITIAL,
  CORE_ANCHOR_X,
  CORE_ANCHOR_Y,
  CORE_SCALE_PULSE_AMPLITUDE,
  CORE_SCALE_PULSE_FREQUENCY,
  EMBER_BASE_SCALE,
  EMBER_BASE_SCALE_MIN,
  EMBER_BASE_SCALE_RANGE,
  EMBER_HORIZONTAL_SPREAD,
  EMBER_INITIAL_Y_BASE,
  EMBER_INITIAL_Y_RANGE,
  EMBER_MAX_AGE_BASE,
  EMBER_MAX_AGE_RANGE,
  EMBER_SCALE_RANGE,
  EMBER_VELOCITY_X_RANGE,
  EMBER_VELOCITY_Y_BASE,
  EMBER_VELOCITY_Y_RANGE,
  FLAME_BASE_SCALE,
  FLAME_BASE_SCALE_MIN,
  FLAME_BASE_SCALE_RANGE,
  FLAME_HORIZONTAL_SPREAD,
  FLAME_INITIAL_Y,
  FLAME_MAX_AGE_BASE,
  FLAME_MAX_AGE_RANGE,
  FLAME_ROTATION_RANGE,
  FLAME_SCALE_X_BASE,
  FLAME_SCALE_X_RANGE,
  FLAME_SCALE_Y_BASE,
  FLAME_SCALE_Y_MULTIPLIER,
  FLAME_SCALE_Y_RANGE,
  FLAME_VELOCITY_X_RANGE,
  FLAME_VELOCITY_Y_BASE,
  FLAME_VELOCITY_Y_RANGE,
  GLOW_ALPHA_AMPLITUDE,
  GLOW_ALPHA_BASE,
  GLOW_ALPHA_INITIAL,
  GLOW_ALPHA_PULSE_FREQUENCY,
  GLOW_ANCHOR,
  GLOW_SCALE_INITIAL,
  GLOW_SCALE_PULSE_AMPLITUDE,
  GLOW_SCALE_PULSE_FREQUENCY,
  MAX_EMBERS,
  MAX_FLAMES,
  UPDATE_DELTA_DIVISOR,
} from '../logic/phoenixFlame/PhoenixFlameConfig';

type ParticleType = 'glow' | 'core' | 'flame' | 'ember';

interface Particle {
  sprite: Sprite;
  type: ParticleType;
  age: number;
  maxAge: number;
  velocityX: number;
  velocityY: number;
  baseScale: number;
}

export class PhoenixFlameScene extends Scene {
  private particles: Particle[] = [];

  private time = 0;

  constructor(app: Application) {
    super(app);
  }

  override enter(): void {
    this.createFireDemo();
  }

  override exit(): void {
    // Detach sprites but keep them and their particle data for reuse.
    this.root.removeChildren();
  }

  override update(delta: number): void {
    const dt = delta / UPDATE_DELTA_DIVISOR;
    this.time += dt;

    for (const particle of this.particles) {
      if (particle.type === 'glow') {
        const scalePulse =
          1 + Math.sin(this.time * GLOW_SCALE_PULSE_FREQUENCY) * GLOW_SCALE_PULSE_AMPLITUDE;
        const alphaPulse =
          GLOW_ALPHA_BASE +
          Math.sin(this.time * GLOW_ALPHA_PULSE_FREQUENCY) * GLOW_ALPHA_AMPLITUDE;
        particle.sprite.scale.set(particle.baseScale * scalePulse);
        particle.sprite.alpha = alphaPulse;
        continue;
      }

      if (particle.type === 'core') {
        const scalePulse =
          1 + Math.sin(this.time * CORE_SCALE_PULSE_FREQUENCY) * CORE_SCALE_PULSE_AMPLITUDE;
        const alphaPulse =
          CORE_ALPHA_BASE +
          Math.sin(this.time * CORE_ALPHA_PULSE_FREQUENCY) * CORE_ALPHA_AMPLITUDE;
        particle.sprite.scale.set(particle.baseScale * scalePulse);
        particle.sprite.alpha = alphaPulse;
        continue;
      }

      particle.age += dt;
      const t = particle.age / particle.maxAge;

      particle.sprite.x += particle.velocityX * dt;
      particle.sprite.y += particle.velocityY * dt;

      if (particle.type === 'flame') {
        const scaleX =
          particle.baseScale * (FLAME_SCALE_X_BASE + t * FLAME_SCALE_X_RANGE);
        const scaleY =
          particle.baseScale * (FLAME_SCALE_Y_BASE + t * FLAME_SCALE_Y_RANGE);
        particle.sprite.scale.set(scaleX, scaleY);
        particle.sprite.alpha = 1 - t;

        if (particle.age >= particle.maxAge) {
          this.resetFlame(particle);
        }
      } else if (particle.type === 'ember') {
        const scale = particle.baseScale * (1 - t * EMBER_SCALE_RANGE);
        particle.sprite.scale.set(scale);
        particle.sprite.alpha = 1 - t;

        if (particle.age >= particle.maxAge) {
          this.resetEmber(particle);
        }
      }
    }
  }

  override onResize(designWidth: number, designHeight: number): void {
    this.root.position.set(designWidth / CENTER_DIVISOR, designHeight / CENTER_DIVISOR);
  }

  private createFireDemo(): void {
    this.time = 0;

    // If we've already created the sprites once, just reattach and reset them.
    if (this.particles.length > 0) {
      this.root.removeChildren();

      for (const particle of this.particles) {
        this.root.addChild(particle.sprite);

        if (particle.type === 'glow') {
          particle.age = 0;
          particle.maxAge = Number.POSITIVE_INFINITY;
          particle.sprite.alpha = GLOW_ALPHA_INITIAL;
          particle.baseScale = GLOW_SCALE_INITIAL;
          particle.sprite.scale.set(particle.baseScale);
          particle.sprite.position.set(0, 0);
        } else if (particle.type === 'core') {
          particle.age = 0;
          particle.maxAge = Number.POSITIVE_INFINITY;
          particle.sprite.alpha = CORE_ALPHA_INITIAL;
          particle.baseScale = CORE_ALPHA_INITIAL;
          particle.sprite.scale.set(particle.baseScale);
          particle.sprite.position.set(0, 0);
        } else if (particle.type === 'flame') {
          this.resetFlame(particle);
        } else if (particle.type === 'ember') {
          this.resetEmber(particle);
        }
      }

      return;
    }

    // First-time setup: create sprites and particle metadata.
    const glowTexture = Assets.get('fire-light');
    const fireTexture1 = Assets.get('fire-00001');
    const fireTexture2 = Assets.get('fire-00003');
    const fireTexture4 = Assets.get('fire-00005');
    const fireTexture5 = Assets.get('fire-00007');
    const fireTexture6 = Assets.get('fire-00009');
    const fireTexture7 = Assets.get('fire-00011');
    const fireTexture8 = Assets.get('fire-00013');
    const fireTexture3 = Assets.get('fire-00029');

    const textures = [fireTexture1, fireTexture2, fireTexture3, fireTexture4, fireTexture5, fireTexture6, fireTexture7, fireTexture8];

    const glowSprite = new Sprite(glowTexture);
    glowSprite.anchor.set(GLOW_ANCHOR);
    glowSprite.alpha = GLOW_ALPHA_INITIAL;
    glowSprite.scale.set(GLOW_SCALE_INITIAL);
    this.root.addChild(glowSprite);
    this.particles.push({
      sprite: glowSprite,
      type: 'glow',
      age: 0,
      maxAge: Number.POSITIVE_INFINITY,
      velocityX: 0,
      velocityY: 0,
      baseScale: glowSprite.scale.x,
    });

    const coreSprite = new Sprite(fireTexture2);
    coreSprite.anchor.set(CORE_ANCHOR_X, CORE_ANCHOR_Y);
    coreSprite.alpha = CORE_ALPHA_INITIAL;
    coreSprite.scale.set(CORE_ALPHA_INITIAL);
    this.root.addChild(coreSprite);
    this.particles.push({
      sprite: coreSprite,
      type: 'core',
      age: 0,
      maxAge: Number.POSITIVE_INFINITY,
      velocityX: 0,
      velocityY: 0,
      baseScale: coreSprite.scale.x,
    });

    for (let i = 0; i < MAX_FLAMES; i += 1) {
      const texture = textures[i % textures.length];
      const sprite = new Sprite(texture);
      sprite.anchor.set(GLOW_ANCHOR, 1);
      this.root.addChild(sprite);

      const particle: Particle = {
        sprite,
        type: 'flame',
        age: 0,
        maxAge: 0,
        velocityX: 0,
        velocityY: 0,
        baseScale: FLAME_BASE_SCALE,
      };

      this.resetFlame(particle);
      this.particles.push(particle);
    }

    for (let i = 0; i < MAX_EMBERS; i += 1) {
      const sprite = new Sprite(fireTexture1);
      sprite.anchor.set(GLOW_ANCHOR);
      this.root.addChild(sprite);

      const particle: Particle = {
        sprite,
        type: 'ember',
        age: 0,
        maxAge: 0,
        velocityX: 0,
        velocityY: 0,
        baseScale: EMBER_BASE_SCALE,
      };

      this.resetEmber(particle);
      this.particles.push(particle);
    }
  }

  private resetFlame(particle: Particle): void {
    particle.age = 0;
    particle.maxAge = FLAME_MAX_AGE_BASE + Math.random() * FLAME_MAX_AGE_RANGE;
    particle.sprite.x = (Math.random() - GLOW_ANCHOR) * FLAME_HORIZONTAL_SPREAD;
    particle.sprite.y = FLAME_INITIAL_Y;
    particle.velocityX = (Math.random() - GLOW_ANCHOR) * FLAME_VELOCITY_X_RANGE;
    particle.velocityY = -(FLAME_VELOCITY_Y_BASE + Math.random() * FLAME_VELOCITY_Y_RANGE);
    particle.sprite.rotation = (Math.random() - GLOW_ANCHOR) * FLAME_ROTATION_RANGE;
    particle.baseScale = FLAME_BASE_SCALE_MIN + Math.random() * FLAME_BASE_SCALE_RANGE;
    particle.sprite.scale.set(
      particle.baseScale,
      particle.baseScale * FLAME_SCALE_Y_MULTIPLIER,
    );
    particle.sprite.alpha = CORE_ALPHA_INITIAL;
  }

  private resetEmber(particle: Particle): void {
    particle.age = 0;
    particle.maxAge = EMBER_MAX_AGE_BASE + Math.random() * EMBER_MAX_AGE_RANGE;
    particle.sprite.x = (Math.random() - GLOW_ANCHOR) * EMBER_HORIZONTAL_SPREAD;
    particle.sprite.y = EMBER_INITIAL_Y_BASE - Math.random() * EMBER_INITIAL_Y_RANGE;
    particle.velocityX = (Math.random() - GLOW_ANCHOR) * EMBER_VELOCITY_X_RANGE;
    particle.velocityY = -(EMBER_VELOCITY_Y_BASE + Math.random() * EMBER_VELOCITY_Y_RANGE);
    particle.baseScale = EMBER_BASE_SCALE_MIN + Math.random() * EMBER_BASE_SCALE_RANGE;
    particle.sprite.scale.set(particle.baseScale);
    particle.sprite.alpha = CORE_ALPHA_INITIAL;
  }
}

