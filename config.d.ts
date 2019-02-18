
import { MediaManagerPluginEntry } from 'mmir-lib';

/**
 * (optional) entry "ttsNuanceXhr" in main configuration.json
 * for settings of webttsNuanceImpl module.
 *
 * Some of these settings can also be specified by using the options argument
 * in the TTS functions of {@link MediaManagerWebInput}, e.g.
 * {@link MediaManagerWebInput#recognize} or {@link MediaManagerWebInput#startRecord}
 * (if specified via the options, values will override configuration settings).
 */
export interface TTSNuanceXHRConfigEntry {
  ttsNuanceXhr?: TTSNuanceXHRConfig;
}

export interface TTSNuanceXHRConfig extends MediaManagerPluginEntry {
  /** OPTIONAL
   * the language/country for TTS
   * @type string
   */
  language?: string;
  /** OPTIONAL
   * a specific voice for TTS
   * @type string
   */
  voice?: string;

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
