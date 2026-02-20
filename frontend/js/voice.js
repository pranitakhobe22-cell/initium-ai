/**
 * js/voice.js — Web Speech API wrapper for Initium.AI
 *
 * Features:
 *   speak(text)          → reads text aloud via speechSynthesis
 *   startListening(cb)   → starts SpeechRecognition, calls cb(transcript)
 *   stopListening()      → stops recognition
 *   isVoiceSupported()   → feature-detection check
 *
 * Falls back gracefully when API is unavailable.
 */

const voice = (() => {
  // ── Feature detection ─────────────────────────────────────────────────────
  const synth   = window.speechSynthesis;
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  let recognition = null;
  let _listening  = false;

  const isSynthSupported = !!synth;
  const isRecogSupported = !!SpeechRecognition;

  /** Returns true only if BOTH speak + listen are supported */
  const isVoiceSupported = () => isSynthSupported && isRecogSupported;

  // ── Speak ──────────────────────────────────────────────────────────────────
  /**
   * @param {string} text       - Text to speak
   * @param {object} [opts]
   * @param {number} [opts.rate=0.95]
   * @param {number} [opts.pitch=1]
   * @param {string} [opts.lang='en-US']
   * @param {Function} [opts.onEnd]   - Callback when speech ends
   */
  const speak = (text, opts = {}) => {
    if (!isSynthSupported) {
      console.warn('[Voice] speechSynthesis not supported — skipping TTS');
      opts.onEnd?.();
      return;
    }

    // Cancel any ongoing speech first
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = opts.lang  || 'en-US';
    utter.rate  = opts.rate  ?? 0.95;
    utter.pitch = opts.pitch ?? 1;

    // Pick a natural English voice if available
    const voices = synth.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && v.localService && !v.name.includes('Google')
    ) || voices.find((v) => v.lang.startsWith('en')) || null;
    if (preferred) utter.voice = preferred;

    utter.onend   = () => opts.onEnd?.();
    utter.onerror = (e) => {
      console.error('[Voice] Speech synthesis error:', e.error);
      opts.onEnd?.();
    };

    synth.speak(utter);
  };

  /** Stop any ongoing speech immediately */
  const stopSpeaking = () => { if (isSynthSupported) synth.cancel(); };

  // ── Listen ─────────────────────────────────────────────────────────────────
  /**
   * Start speech recognition and stream interim + final transcripts.
   * @param {Function} onResult(transcript, isFinal) - Called on each result
   * @param {Function} [onError(msg)]
   */
  const startListening = (onResult, onError) => {
    if (!isRecogSupported) {
      console.warn('[Voice] SpeechRecognition not supported — use text input');
      onError?.('Speech recognition is not supported in this browser. Please type your answer.');
      return;
    }
    if (_listening) stopListening();

    recognition = new SpeechRecognition();
    recognition.lang            = 'en-US';
    recognition.continuous      = true;   // keep listening across pauses
    recognition.interimResults  = true;   // show partial transcripts while speaking
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let final   = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t + ' ';
        else                         interim += t;
      }
      if (final)   onResult(final.trim(),   true);
      if (interim) onResult(interim.trim(), false);
    };

    recognition.onerror = (e) => {
      const msg = {
        'no-speech':    'No speech detected. Please try again.',
        'not-allowed':  'Microphone access denied. Please enable it in your browser.',
        'audio-capture':'No microphone found.',
        'network':      'Network error during recognition.',
      }[e.error] || `Speech error: ${e.error}`;
      console.error('[Voice] Recognition error:', e.error);
      _listening = false;
      onError?.(msg);
    };

    recognition.onend = () => {
      _listening = false;
    };

    recognition.start();
    _listening = true;
    console.log('[Voice] Listening started');
  };

  /** Stop microphone / recognition */
  const stopListening = () => {
    if (recognition && _listening) {
      recognition.stop();
      _listening = false;
      console.log('[Voice] Listening stopped');
    }
  };

  const isListening = () => _listening;

  return { speak, stopSpeaking, startListening, stopListening, isListening, isVoiceSupported, isSynthSupported, isRecogSupported };
})();
