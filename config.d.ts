
/* plugin config definition: used by mmir-plugin-exports to generate module-config.gen.js */

import { MediaManagerPluginEntry, SpeechConfigPluginEntry } from 'mmir-lib';

/**
 * (optional) entry "ttsNuanceXhr" in main configuration.json
 * for settings of ttsNuanceXhr module.
 *
 * Some of these settings can also be specified by using the options argument
 * in the TTS functions of {@link MediaManagerWebInput}, e.g.
 * {@link MediaManagerWebInput#recognize} or {@link MediaManagerWebInput#startRecord}
 * (if specified via the options, values will override configuration settings).
 */
export interface PluginConfig {
  ttsNuanceXhr?: PluginConfigEntry | PluginSpeechConfigEntry;
}

/**
 * Speech config entry for the plugin: per language (code) configuration e.g. for
 * adjusting the language-code or setting a specific voice for the language
 */
export interface PluginSpeechConfigEntry extends SpeechConfigPluginEntry {
  /** OPTIONAL
   * the language/country for TTS
   * @type string
   */
  language?: string;
  /** OPTIONAL
   * a specific voice for TTS
   * @type string
   */
  voice?: 'female' | 'male' | string;
}

export interface PluginConfigEntry extends MediaManagerPluginEntry {

  /** the plugin/module which which will load/use this specific TTS implementation
   * @default mmir-plugin-tts-core-xhr.js
   */
  mod: 'mmir-plugin-tts-core-xhr.js';
  /**
   * the plugin type
   * @default "tts"
   */
  type: 'tts';

  /** credentials application ID (MUST be set via configuration or options) */
  appId?: string;
  /** credentials application key (MUST be set via configuration or options) */
  appKey?: string;

  /** OPTIONAL
   * [custom option]
   * format for the synthesized audio
   * NOTE: 'pcm' and 'wav' are synonymous
   * @type 'mp3' | 'wav' | 'pcm'
   * @default "mp3"
   */
  format?: 'mp3' | 'wav' | 'pcm';//TODO support 'speex' | 'amr'
  /** OPTIONAL
   * [custom option]
   * if format is 'wav' or 'pcm', the sampling rate (Hz) for the audio
   * (otherwise ignored).
   * @type 8000 | 16000 | 22000
   * @default 8000
   */
  sampleRate?: 8000 | 16000 | 22000;//TODO valid values for speex: 8000 | 16000 / for amr: ignored

}

export enum RemoteUrls {
  baseUrl = 'https://tts.nuancemobility.net'
}
