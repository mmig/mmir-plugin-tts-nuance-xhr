;(function (root, factory) {

	//mmir legacy mode: use pre-v4 API of mmir-lib
	var _isLegacyMode3 = true;
	var _isLegacyMode4 = true;
	var mmirName = typeof MMIR_CORE_NAME === 'string'? MMIR_CORE_NAME : 'mmir';
	var _mmir = root[mmirName];
	if(_mmir){
		//set legacy-mode if version is < v4 (isVersion() is available since v4)
		_isLegacyMode3 = _mmir.isVersion? _mmir.isVersion(4, '<') : true;
		_isLegacyMode4 = _mmir.isVersion? _mmir.isVersion(5, '<') : true;
	}
	var _req = _mmir? _mmir.require : require;

	if(_isLegacyMode3){

		// HELPER: backwards compatibility v3 for module IDs
		var isArray = _req('util/isArray');
		var getId = function(ids){
			if(ids){
				if(isArray(ids)){
					return ids.map(function(id){ return id.replace(/^mmirf\//, '');})
				}
				return ids.replace(/^mmirf\//, '');
			}
			return ids;
		};
		var __req = _req;
		_req = function(deps, id, success, error){
			var args = [getId(deps), getId(id), success, error];
			return __req.apply(null, args);
		};

		//HELPER: backwards compatibility v3 for configurationManager.get():
		var config = _req('configurationManager');
		if(!config.__get){
			config.__get = config.get;
			config.get = function(propertyName, useSafeAccess, defaultValue){
				return this.__get(propertyName, defaultValue, useSafeAccess);
			};
		}

	}

	if(_isLegacyMode3 || _isLegacyMode4){

		//backwards compatibility v3 and v4:
		//  plugin instance is "exported" to global var newMediaPlugin
		root['newWebAudioTtsImpl'] = factory(_req);

	} else {

		if (typeof define === 'function' && define.amd) {
				// AMD. Register as an anonymous module.
				define(['require'], function (require) {
						return factory(require);
				});
		} else if (typeof module === 'object' && module.exports) {
				// Node. Does not work with strict CommonJS, but
				// only CommonJS-like environments that support module.exports,
				// like Node.
				module.exports = factory(_req);
		}
	}

}(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : this, function (require) {

	
/**
 * Media Module: Implementation for Text-To-Speech via Nuance TTS over HTTPS/POST
 *
 * @requries util/ajax (jQuery.ajax like API)
 * @requires Cross-Domain access
 * @requires CSP for accessing the Nuance TTS server, e.g. "connect-src https://tts.nuancemobility.net" or "default-src https://tts.nuancemobility.net"
 * @requires CSP allowing blob: protocal as media-source, e.g. "media-src blob:" or "default-src blob:"
 *
 */


	
  var mediaManager = require('mmirf/mediaManager');
  var config = require('mmirf/configurationManager');
  var lang = require('mmirf/languageManager');
  var ajax = require('mmirf/util/loadFile');

  
    return (function(){
      {

	/**  @memberOf NuanceWebAudioTTSImpl# */
	var _pluginName = 'ttsNuanceXhr';

	/**
	 * separator char for language- / country-code (specific to Nuance language config / codes)
	 *
	 * @memberOf NuanceWebAudioTTSImpl#
	 */
	var _langSeparator = '-';

	/** @memberOf NuanceWebAudioTTSImpl# */
	var _getLangParam;
	/** @memberOf NuanceWebAudioTTSImpl# */
	var _getVoiceParam;

	/** @memberOf NuanceWebAudioTTSImpl# */
	var _langUtils = typeof WEBPACK_BUILD !== 'undefined' && WEBPACK_BUILD? require('mmir-plugin-speech-nuance-lang').languageSupport : cordova.require('mmir-plugin-speech-nuance-lang.languageSupport');

	/**
	 * HELPER retrieve language setting and apply impl. specific corrections/adjustments
	 * (i.e. deal with Nuance specific quirks for language/country codes)
	 *
	 * @memberOf NuanceWebAudioTTSImpl#
	 */
	var _getFixedLang = function(options){

		var locale = _getLangParam(options, _langSeparator, true);

		return lang.fixLang('nuance', locale);
	};


	/** @memberOf NuanceWebAudioTTSImpl#
	 * @see mmir.MediaManager#getSpeechLanguages
	 */
	var getLanguageList = function(callback, _onerror){

		if(callback) setTimeout(function(){callback(_langUtils.ttsLanguages())}, 0);
	};


	/** @memberOf NuanceWebAudioTTSImpl#
	 * @see mmir.MediaManager#getVoices
	 */
	var getVoiceList = function(options, callback, _onerror){

		var lang = options && options.language;
		var voices = options && options.details? langTools.ttsVoices(lang) : langTools.ttsVoiceNames(lang);
		if(callback) setTimeout(function(){callback(voices)}, 0);
	};

	/**  @memberOf NuanceWebAudioTTSImpl# */
	var generateTTSURL = function(_text, options, onerror){

		//get authentification info from configuration.json:
		// "<plugin name>": { "appId": ..., "appKey": ... }
		// -> see Nuance developer account for your app-ID and app-key
		var appId= options.appId || config.get([_pluginName, 'appId'], null);
		var appKey= options.appKey || config.get([_pluginName, 'appKey'], null);

		if(!appKey || !appId){
			var msg = 'Invalid or missing authentification information for appId "'+appId+'" and appKey "'+appKey+'"';
			mediaManager._log.error(msg);
			if(onerror){
				onerror(msg);
			}
			return;////////////////////////////// EARLY EXIT ////////////////////
		}

		var baseUrl = options.baseUrl || config.get([_pluginName, 'baseUrl']);

		//backwards-compatiblity: lookup config-value for serverBasePath, in addition to baseUrl
		if(!baseUrl){
			baseUrl = config.get(
					[_pluginName, 'serverBasePath'],
					'https://tts.nuancemobility.net:443/NMDPTTSCmdServlet/tts'	//<- default value
			);
		}

		var langParam;
		var voice = _getVoiceParam(options);
		if(voice){
			langParam = '&voice=' + voice;
		} else {
			langParam = '&ttsLang=' + _getFixedLang(options);
		}

		//NOTE: text is not set in URL string, but in POST body
//			text = encodeURIComponent(text);

		return baseUrl + '?appId=' + appId + '&appKey=' + appKey + langParam;
	};

	/**  @memberOf NuanceWebAudioTTSImpl# */
	var createAudio = function(sentence, options, onend, onerror, oninit){

		var emptyAudio = mediaManager.createEmptyAudio();

		sendRequest(sentence, emptyAudio, options, onend, onerror, oninit);

		return emptyAudio;

	};

	/**
	 * Creates a new Uint8Array based on two different ArrayBuffers
	 *
	 * @private
	 * @param {ArrayBuffers} buffer1 The first buffer.
	 * @param {ArrayBuffers} buffer2 The second buffer.
	 * @return {ArrayBuffers} The new ArrayBuffer created out of the two.
	 *
	 * @memberOf NuanceWebAudioTTSImpl#
	 */
	var appendArrayBuffer = function(buffer1, buffer2) {
	  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
	  tmp.set(new Uint8Array(buffer1), 0);
	  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
	  return tmp.buffer;
	};
	/**  @memberOf NuanceWebAudioTTSImpl# */
	function writeString(view, offset, string){
		  for (var i = 0; i < string.length; i++){
		    view.setUint8(offset + i, string.charCodeAt(i));
		  }
		}
	/**  @memberOf NuanceWebAudioTTSImpl# */
	var addWaveHeadder = function(wavebuffer, sampleRate) {
		  var header = new ArrayBuffer(44);
		  var view = new DataView(header);
		  var mono = true;

		  /* RIFF identifier */
		  writeString(view, 0, 'RIFF');
		  /* file length */
		  view.setUint32(4, 32 + wavebuffer.byteLength, true);
		  /* RIFF type */
		  writeString(view, 8, 'WAVE');
		  /* format chunk identifier */
		  writeString(view, 12, 'fmt ');
		  /* format chunk length */
		  view.setUint32(16, 16, true);
		  /* sample format (raw) */
		  view.setUint16(20, 1, true);
		  /* channel count */
		  view.setUint16(22, mono?1:2, true);
		  /* sample rate */
		  view.setUint32(24, sampleRate, true);
		  /* byte rate (sample rate * block align) */
		  view.setUint32(28, sampleRate * 4, true);
		  /* block align (channel count * bytes per sample) */
		  view.setUint16(32, 4, true);
		  /* bits per sample */
		  view.setUint16(34, 16, true);
		  /* data chunk identifier */
		  writeString(view, 36, 'data');
		  /* data chunk length */
		  view.setUint32(40, wavebuffer.byteLength, true);

		  return appendArrayBuffer(header,wavebuffer);

	};

	///////////////////////////////////// HELPER for POST REQ /////////////////////////////////////////

	/**  @memberOf NuanceWebAudioTTSImpl# */
	var sendRequest = function(currSentence, audioObj, options, onend, onerror, oninit){

		var reqUrl = generateTTSURL(null, options, onerror);//<- ignore text-argument: the TTS text will be included in the POST body, not the request URL

		if(!reqUrl){
			//error occured when creating the request URL (-> error callback was already called, so just return)
			return;////////////////////////////// EARLY EXIT ////////////////////
		}

		//supported audio formats: MP3, WAV/PCM
		//TODO add (JavaScript) decoders for other formats?
		var types = {
				'wav':   'audio/x-wav;codec=pcm;bit=16;rate=',
//					'speex': 'audio/x-speex;rate=', TODO add decoding for speex & amr
//					'amr':   'audio/amr',
				'mp3':   'audio/mpeg'
		};

		//from Nuance Python example code:
//			Accept = {
//				'mp3': {
//					'mimetype': 'audio/mpeg' // bit rate: 128kbps
//				},
//				'wav': {
//					'mimetype': 'audio/x-wav',
//					'codec': 'pcm',
//					'bit': 16,
//					'rate': [8000,16000,22000]
//				},
//				'speex': {
//					'mimetype': 'audio/x-speex',
//					'rate': [8000,16000]
//				},
//				'amr': {
//					'mimetype': 'audio/amr'
//				}
//			}


		//default format/settings
		var format = types.mp3;
		var samplerate = 8000;

		if(options && /wav|pcm/i.test(options.format)){
			format = types.wav;
		}

		if(options && options.sampleRate){
			//supported sample rates:
			// WAV:  [8000,16000,22000]
			// SPEX: [8000,16000]
			samplerate = options.sampleRate;
		}

		if(format === 'wav' || format === 'speex'){//<- append sample-rate, if required for the audio-format (currently only for WAV)
			format += samplerate;
		}

		//extend Audio's release()-function to cancel POST req. if one is set/active
		/** @memberOf mmir.env.media.NuanceWebAudio */
		audioObj.__release = audioObj.release;
		/** @memberOf mmir.env.media.NuanceWebAudio */
		audioObj._release = function(){
			//cancel POST request, if one is active:
			if(this.req){
				if(mediaManager._log.isDebug()) mediaManager._log.log('aborting POST request: '+this.req);
				this.req.abort();//<- this.req is set below when ajax is send
				this.req = null;
			}
			return this.__release();
		};
		/** @memberOf mmir.env.media.NuanceWebAudio */
		audioObj.release = audioObj._release;

		var ajaxSuccess = function(data, _textStatus, _jqXHR) {

			audioObj.req = null;

			//do not preceed, if audio was already canceled
			if(!audioObj.isEnabled()){
				return;///////////////// EARLY EXIT //////////////
			}

			//NOTE must use data arguement, since jqXHR does not contain appropriate response field for binary/non-text data
			var wav = addWaveHeadder(data, samplerate);

			var wavBlob = new Blob( [new DataView(wav)] );

//		if(mediaManager._log.isDebug()) mediaManager._log.log("Blob: "+wavBlob.size);

			mediaManager.getWAVAsAudio(wavBlob,
					null,//<- do not need on-created callback, since we already loaded the audio-data at this point
					onend, onerror, oninit,
					audioObj
			);


		};

		var ajaxFail = function(jqXHR, textStatus, errorThrown) {

			mediaManager._log.error('Error code ' + jqXHR.status + ' for POST request: ' + textStatus + ', '+errorThrown);

			//failurecallback:
			onerror && onerror(textStatus + errorThrown, errorThrown);
		};

		var options = {
			url: reqUrl,
			type: 'POST',
			dataType: 'binary',					//avoid any conversion attempts by jQuery (if responseType is set, jQuery will set the response as binary field)
			xhrFields: {
				responseType: 'arraybuffer'		//set response type to binary/arraybuffer (i.e. the audio/*)
			},
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Accept': format
			},
			processData: false,					//prevent jQuery from trying to process the (raw String) data
			data: currSentence,

			success: ajaxSuccess,
			error: ajaxFail
		};

		audioObj.req = ajax(options);
	};

	/**  @memberOf NuanceWebAudioTTSImpl# */
	return {
		/**
		 * @public
		 * @memberOf NuanceWebAudioTTSImpl.prototype
		 */
		getPluginName: function(){
			return _pluginName;
		},
		/**
		 * @public
		 * @memberOf NuanceWebAudioTTSImpl.prototype
		 */
		getCreateAudioFunc: function(){
			return createAudio;
		},
		/**
		 * @public
		 * @memberOf NuanceWebAudioTTSImpl.prototype
		 */
		getLanguageListFunc: function(){
			return getLanguageList;
		},
		/**
		 * @public
		 * @memberOf NuanceWebAudioTTSImpl.prototype
		 */
		getVoiceListFunc: function(){
			return getVoiceList;
		},
		/**
		 * @public
		 * @memberOf NuanceWebAudioTTSImpl.prototype
		 */
		setLangParamFunc: function(getLangParamFunc){
			_getLangParam = getLangParamFunc;
		},
		/**
		 * @public
		 * @memberOf NuanceWebAudioTTSImpl.prototype
		 */
		setVoiceParamFunc: function(getVoiceParamFunc){
			_getVoiceParam = getVoiceParamFunc;
		}
	};//END: return { ...

}
    })();
;


	//END define


}));
