
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

}

export enum RemoteUrls {
  baseUrl = 'https://tts.nuancemobility.net'
}
