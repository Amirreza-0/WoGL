import { Howl, Howler } from 'howler';
import { loadSettings, saveSettings } from './storage';

type SoundType =
  | 'button_click'
  | 'card_draw'
  | 'card_play'
  | 'token_place'
  | 'token_remove'
  | 'die_roll'
  | 'zone_capture'
  | 'achievement_unlock'
  | 'amr_increase'
  | 'global_event'
  | 'victory'
  | 'defeat'
  | 'turn_change';

type MusicType = 'menu' | 'gameplay' | 'victory' | 'defeat' | 'tutorial';

interface SoundConfig {
  src: string[];
  volume?: number;
  loop?: boolean;
}

// Sound effect configurations
const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  button_click: { src: ['/audio/sfx/click.mp3', '/audio/sfx/click.ogg'], volume: 0.5 },
  card_draw: { src: ['/audio/sfx/card-draw.mp3'], volume: 0.6 },
  card_play: { src: ['/audio/sfx/card-play.mp3'], volume: 0.7 },
  token_place: { src: ['/audio/sfx/token-place.mp3'], volume: 0.5 },
  token_remove: { src: ['/audio/sfx/token-remove.mp3'], volume: 0.5 },
  die_roll: { src: ['/audio/sfx/die-roll.mp3'], volume: 0.6 },
  zone_capture: { src: ['/audio/sfx/zone-capture.mp3'], volume: 0.7 },
  achievement_unlock: { src: ['/audio/sfx/achievement.mp3'], volume: 0.8 },
  amr_increase: { src: ['/audio/sfx/amr-warning.mp3'], volume: 0.6 },
  global_event: { src: ['/audio/sfx/global-event.mp3'], volume: 0.7 },
  victory: { src: ['/audio/sfx/victory.mp3'], volume: 0.8 },
  defeat: { src: ['/audio/sfx/defeat.mp3'], volume: 0.6 },
  turn_change: { src: ['/audio/sfx/turn-change.mp3'], volume: 0.4 },
};

// Music track configurations
const MUSIC_CONFIGS: Record<MusicType, SoundConfig> = {
  menu: { src: ['/audio/music/menu-theme.mp3'], volume: 0.5, loop: true },
  gameplay: { src: ['/audio/music/gameplay.mp3'], volume: 0.3, loop: true },
  victory: { src: ['/audio/music/victory.mp3'], volume: 0.5, loop: false },
  defeat: { src: ['/audio/music/defeat.mp3'], volume: 0.4, loop: false },
  tutorial: { src: ['/audio/music/tutorial.mp3'], volume: 0.4, loop: true },
};

class AudioManager {
  private sounds: Map<SoundType, Howl> = new Map();
  private music: Map<MusicType, Howl> = new Map();
  private currentMusic: MusicType | null = null;
  private _musicVolume: number = 0.7;
  private _sfxVolume: number = 0.8;
  private initialized: boolean = false;

  constructor() {
    // Load volume settings
    const settings = loadSettings();
    this._musicVolume = settings.musicVolume;
    this._sfxVolume = settings.sfxVolume;
  }

  /**
   * Initialize audio system (should be called after user interaction)
   */
  init(): void {
    if (this.initialized) return;

    // Preload common sounds
    this.preloadSound('button_click');
    this.preloadSound('card_play');
    this.preloadSound('die_roll');

    this.initialized = true;
  }

  /**
   * Preload a sound effect
   */
  private preloadSound(type: SoundType): Howl {
    if (this.sounds.has(type)) {
      return this.sounds.get(type)!;
    }

    const config = SOUND_CONFIGS[type];
    const sound = new Howl({
      src: config.src,
      volume: (config.volume || 1) * this._sfxVolume,
      preload: true,
      onloaderror: (_id: number, error: unknown) => {
        console.warn(`Failed to load sound ${type}:`, error);
      },
    });

    this.sounds.set(type, sound);
    return sound;
  }

  /**
   * Preload a music track
   */
  private preloadMusic(type: MusicType): Howl {
    if (this.music.has(type)) {
      return this.music.get(type)!;
    }

    const config = MUSIC_CONFIGS[type];
    const music = new Howl({
      src: config.src,
      volume: (config.volume || 1) * this._musicVolume,
      loop: config.loop ?? true,
      preload: true,
      onloaderror: (_id: number, error: unknown) => {
        console.warn(`Failed to load music ${type}:`, error);
      },
    });

    this.music.set(type, music);
    return music;
  }

  /**
   * Play a sound effect
   */
  playSound(type: SoundType): void {
    try {
      const sound = this.preloadSound(type);
      sound.volume((SOUND_CONFIGS[type].volume || 1) * this._sfxVolume);
      sound.play();
    } catch (error) {
      console.warn(`Failed to play sound ${type}:`, error);
    }
  }

  /**
   * Play a music track
   */
  playMusic(type: MusicType): void {
    // Don't restart if already playing
    if (this.currentMusic === type) return;

    // Stop current music
    if (this.currentMusic) {
      this.stopMusic();
    }

    try {
      const music = this.preloadMusic(type);
      music.volume((MUSIC_CONFIGS[type].volume || 1) * this._musicVolume);
      music.play();
      this.currentMusic = type;
    } catch (error) {
      console.warn(`Failed to play music ${type}:`, error);
    }
  }

  /**
   * Stop current music
   */
  stopMusic(): void {
    if (this.currentMusic && this.music.has(this.currentMusic)) {
      this.music.get(this.currentMusic)!.stop();
    }
    this.currentMusic = null;
  }

  /**
   * Pause current music
   */
  pauseMusic(): void {
    if (this.currentMusic && this.music.has(this.currentMusic)) {
      this.music.get(this.currentMusic)!.pause();
    }
  }

  /**
   * Resume current music
   */
  resumeMusic(): void {
    if (this.currentMusic && this.music.has(this.currentMusic)) {
      this.music.get(this.currentMusic)!.play();
    }
  }

  /**
   * Set music volume (0-1)
   */
  setMusicVolume(volume: number): void {
    this._musicVolume = Math.max(0, Math.min(1, volume));

    // Update all music tracks
    this.music.forEach((music, type) => {
      music.volume((MUSIC_CONFIGS[type].volume || 1) * this._musicVolume);
    });

    // Save to settings
    const settings = loadSettings();
    settings.musicVolume = this._musicVolume;
    saveSettings(settings);
  }

  /**
   * Set SFX volume (0-1)
   */
  setSFXVolume(volume: number): void {
    this._sfxVolume = Math.max(0, Math.min(1, volume));

    // Update all sound effects
    this.sounds.forEach((sound, type) => {
      sound.volume((SOUND_CONFIGS[type].volume || 1) * this._sfxVolume);
    });

    // Save to settings
    const settings = loadSettings();
    settings.sfxVolume = this._sfxVolume;
    saveSettings(settings);
  }

  /**
   * Get current music volume
   */
  get musicVolume(): number {
    return this._musicVolume;
  }

  /**
   * Get current SFX volume
   */
  get sfxVolume(): number {
    return this._sfxVolume;
  }

  /**
   * Mute all audio
   */
  mute(): void {
    Howler.mute(true);
  }

  /**
   * Unmute all audio
   */
  unmute(): void {
    Howler.mute(false);
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    const isMuted = Howler.volume() === 0;
    if (isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return !isMuted;
  }
}

// Singleton instance
export const audioManager = new AudioManager();

// Hook for React components
export function useAudio() {
  return {
    playSound: (type: SoundType) => audioManager.playSound(type),
    playMusic: (type: MusicType) => audioManager.playMusic(type),
    stopMusic: () => audioManager.stopMusic(),
    setMusicVolume: (volume: number) => audioManager.setMusicVolume(volume),
    setSFXVolume: (volume: number) => audioManager.setSFXVolume(volume),
    musicVolume: audioManager.musicVolume,
    sfxVolume: audioManager.sfxVolume,
    init: () => audioManager.init(),
  };
}
