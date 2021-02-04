# mmir-plugin-tts-nuance-web

----
----

<h1 style="color: red;">
DEPRECATED this plugin is outdated since Nuance SpeechKit service is discontinued, for a current alternative see <a href="https://github.com/mmig/mmir-plugin-tts-cerence-ws">mmir-plugin-tts-cerence-ws</a>
</h1>

```diff
- DEPRECATED Nuance SpeechKit service is discontinued
- for a current alternative see https://github.com/mmig/mmir-plugin-tts-cerence-ws based on the Cerence WebSocket API
```

----
----

Cordova plugin for the MMIR framework that adds Text To Speech (TTS) synthesis via Nuance web services


## configure CSP

(e.g. index.html): allow access to https://tts.nuancemobility.net
```
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self' 'unsafe-inline' 'unsafe-eval' https://tts.nuancemobility.net ...
```


## configuration.json:
```
{

...

	"ttsNuanceXhr": {
      "appId": <the app ID>,
      "appKey": <the secret app key>
    },

	....

	"mediaManager": {
    	"plugins": {
    		"browser": [
    			...
                {"mod": "webAudioTextToSpeech", "config": "ttsNuanceXhr"},
                ...
    		],
    		"cordova": [
    			...
                {"mod": "webAudioTextToSpeech", "config": "ttsNuanceXhr"},
                ...
    		]
    	}
    },
...

}
```

supported options for recoginze() / startRecord():
 * language: String

supported custom options for recoginze() / startRecord():
 * appKey: String
 * appId: String
 * format: "mp3" (default) | "wav" | "pcm"
 * sampleRate: (only valid for "wav"/"pcm") 8000 | 16000 | 22000
