
export * from './config';

/// <reference types="mmir-lib" />
import { TTSOnError, TTSOnComplete, TTSOnReady, MediaManager, TTSOptions } from 'mmir-lib';

declare interface PluginTTSOptions extends TTSOptions {
  /**
   * [supported option]
   * set language/country for TTS
   */
  language?: string;

  /** [supported option]
   * set specific voice for TTS
   */
  voice?: string | 'male' | 'female';

  /**
   * [custom option]
   * credentials app-key (must be set via configuration or via options)
   */
  appKey?: string;
  /**
   * [custom option]
   * credentials app-id (must be set via configuration or via options)
   */
  appId?: string;

  /** [custom option]
   * format for the synthesized audio
   *
   * NOTE: 'pcm' and 'wav' are synonymous
   *
   * @default "mp3"
   */
  format?: 'mp3' | 'wav' | 'pcm';//TODO support 'speex' | 'amr'

  /** [custom option]
   * if format is 'wav' or 'pcm', the sampling rate (Hz) for the audio
   * (otherwise ignored).
   *
   * @default 8000
   */
  sampleRate?: 8000 | 16000 | 22000;//TODO valid values for speex: 8000 | 16000 / for amr: ignored

}

declare interface PluginMediaManager extends MediaManager {
  tts: (options: string | string[] | PluginTTSOptions, successCallback?: TTSOnComplete, failureCallback?: TTSOnError, onInit?: TTSOnReady, ...args: any[]) => void;
}
