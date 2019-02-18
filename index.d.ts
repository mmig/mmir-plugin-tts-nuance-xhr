
export * from './config';

/// <reference types="mmir-lib" />
import { TTSOnError, TTSOnComplete, TTSOnReady, MediaManager, TTSOptions } from 'mmir-lib';

declare interface TTSNuanceXHROptions extends TTSOptions {
  /**
   * [supported option]
   * set language/country for TTS
   */
  language?: string;

  /** [supported option]
   * set specific voice for TTS
   */
  voice?: string | 'male' | 'female';
}

declare interface MediaManagerTTSNuanceXHR extends MediaManager {
  tts: (options: string | string[] | TTSOptions, successCallback?: TTSOnComplete, failureCallback?: TTSOnError, onInit?: TTSOnReady, ...args: any[]) => void;
}
