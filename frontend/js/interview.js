// interview.js — with Web Speech API voice support
if (!requireAuth('candidate')) { /* redirected */ }

// ── State ─────────────────────────────────────────────────────────────────────
let interviewId    = sessionStorage.getItem('interviewId');
let totalQuestions = parseInt(sessionStorage.getItem('totalQuestions') || '5');
let currentIndex   = parseInt(sessionStorage.getItem('currentIndex')   || '0');
let jobRole        = sessionStorage.getItem('jobRole') || '';
let currentQText   = sessionStorage.getItem('currentQuestion') || '';
let timerInterval;
let elapsed      = 0;
let micActive    = false;
let voiceEnabled = false;   // set after feature detection

if (!interviewId) { window.location.href = 'profile.html'; }

// ── DOM refs ──────────────────────────────────────────────────────────────────
const questionBox  = document.getElementById('questionBox');
const qCounter     = document.getElementById('qCounter');
const progressBar  = document.getElementById('progressBar');
const answerInput  = document.getElementById('answerInput');
const submitBtn    = document.getElementById('submitAnswerBtn');
const endBtn       = document.getElementById('endBtn');
const feedbackBox  = document.getElementById('feedbackBox');
const loader       = document.getElementById('loader');
const micBtn       = document.getElementById('micBtn');
const voiceBar     = document.getElementById('voiceBar');
const voiceHint    = document.getElementById('voiceHint');
const voiceStatus  = document.getElementById('voiceStatus');
const speakBtn     = document.getElementById('speakBtn');
const noVoiceBanner = document.getElementById('noVoiceBanner');

// ── Voice setup ───────────────────────────────────────────────────────────────
function initVoice() {
  if (voice.isRecogSupported) {
    voiceEnabled = true;
    voiceBar.style.display = 'flex';
    noVoiceBanner.style.display = 'none';
    document.getElementById('inputMode').textContent = '(type or speak)';
  } else {
    // Fallback: show banner, hide mic, keep textarea
    voiceBar.style.display = 'none';
    noVoiceBanner.style.display = 'block';
    document.getElementById('inputMode').textContent = '(type your answer)';
  }

  // TTS: always show speak button if synthesis is available
  speakBtn.style.display = voice.isSynthSupported ? 'inline-block' : 'none';
}

// ── Speak current question (TTS) ──────────────────────────────────────────────
function speakQuestion() {
  speakBtn.textContent = '🔊 Speaking...';
  speakBtn.disabled = true;
  voice.speak(currentQText, {
    onEnd: () => {
      speakBtn.textContent = '🔊 Read question aloud';
      speakBtn.disabled = false;
    }
  });
}

// ── Mic toggle ─────────────────────────────────────────────────────────────────
function toggleMic() {
  if (!voiceEnabled) return;

  if (micActive) {
    // Stop listening — keep whatever was typed/spoken
    voice.stopListening();
    micActive = false;
    micBtn.textContent = '🎙️';
    micBtn.classList.remove('listening');
    voiceHint.textContent   = 'Click mic to speak, or type below';
    voiceStatus.textContent = '';
  } else {
    // Clear textarea and start fresh recording
    answerInput.value       = '';
    micActive               = true;
    micBtn.textContent      = '⏹';
    micBtn.classList.add('listening');
    voiceHint.textContent   = 'Listening… speak your answer';
    voiceStatus.textContent = '';

    voice.startListening(
      (transcript, isFinal) => {
        answerInput.value = transcript;
        voiceStatus.textContent = isFinal ? '✓ Captured' : '...';
      },
      (errMsg) => {
        // Voice failed — stay in text mode with error hint
        micActive = false;
        micBtn.classList.remove('listening');
        micBtn.textContent    = '🎙️';
        voiceHint.textContent = errMsg;
        voiceStatus.textContent = '';
        console.warn('[Interview] Voice input failed:', errMsg);
      }
    );
  }
}

// ── Render question ───────────────────────────────────────────────────────────
function renderQuestion(text) {
  currentQText          = text;
  questionBox.textContent = text;
  qCounter.textContent  = `Question ${currentIndex + 1} of ${totalQuestions}`;
  progressBar.style.width = `${Math.round((currentIndex / totalQuestions) * 100)}%`;
  answerInput.value     = '';
  feedbackBox.classList.remove('show');
  submitBtn.style.display = 'inline-flex';
  endBtn.style.display    = 'none';

  // Stop mic & speech from previous question
  voice.stopListening();
  voice.stopSpeaking();
  micActive = false;
  micBtn?.classList.remove('listening');
  if (micBtn) micBtn.textContent = '🎙️';
  if (voiceHint) voiceHint.textContent = 'Click mic to speak, or type below';
  if (voiceStatus) voiceStatus.textContent = '';

  // Auto-speak question if TTS is supported
  if (voice.isSynthSupported) {
    setTimeout(() => speakQuestion(), 300); // small delay for page settle
  }
}

// ── Timer ─────────────────────────────────────────────────────────────────────
function startTimer() {
  timerInterval = setInterval(() => {
    elapsed++;
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${m}:${s}`;
  }, 1000);
}

// ── Submit answer ─────────────────────────────────────────────────────────────
async function submitAnswer() {
  // Stop mic before submitting
  if (micActive) { voice.stopListening(); micActive = false; }
  voice.stopSpeaking();

  const answer = answerInput.value.trim();
  if (!answer) {
    answerInput.style.borderColor = 'var(--danger)';
    answerInput.placeholder = 'Please provide an answer (type or speak)';
    return;
  }
  answerInput.style.borderColor = '';

  submitBtn.disabled    = true;
  submitBtn.textContent = '⏳ Evaluating...';
  loader.classList.add('show');

  try {
    const data = await api.post('/interview/answer', { interviewId, answerText: answer });

    showFeedback(data.evaluation);
    currentIndex++;
    sessionStorage.setItem('currentIndex', currentIndex);

    if (data.allAnswered) {
      qCounter.textContent    = `All ${totalQuestions} questions answered ✅`;
      progressBar.style.width = '100%';
      submitBtn.style.display = 'none';
      endBtn.style.display    = 'inline-flex';
      clearInterval(timerInterval);
      // Read out a completion message
      voice.speak('Well done! You have answered all questions. Click Get Final Results when ready.');
    } else {
      sessionStorage.setItem('currentQuestion', data.currentQuestion.text);
      // Show feedback for 4s, then advance
      setTimeout(() => {
        renderQuestion(data.currentQuestion.text);
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Submit Answer →';
      }, 4000);
    }
  } catch (err) {
    alert('Error: ' + err.message);
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Submit Answer →';
  } finally {
    loader.classList.remove('show');
  }
}

// ── Show per-question feedback ────────────────────────────────────────────────
function showFeedback(ev) {
  if (!ev) return;
  document.getElementById('fbScore').textContent   = `Score: ${ev.score}/10`;
  document.getElementById('fbSummary').textContent = ev.summary || '';
  document.getElementById('fbStrengths').innerHTML    = (ev.strengths    || []).map(s => `<li>${s}</li>`).join('');
  document.getElementById('fbImprovements').innerHTML = (ev.improvements || []).map(s => `<li>${s}</li>`).join('');
  feedbackBox.classList.add('show');

  // Read feedback aloud
  if (voice.isSynthSupported && ev.summary) {
    voice.speak(`Score: ${ev.score} out of 10. ${ev.summary}`, { rate: 1 });
  }
}

// ── End interview ─────────────────────────────────────────────────────────────
async function finishInterview() {
  endBtn.disabled    = true;
  endBtn.textContent = '⏳ Generating report...';
  loader.classList.add('show');
  voice.stopSpeaking();
  try {
    const data = await api.post('/interview/end', { interviewId });
    sessionStorage.setItem('interviewResult', JSON.stringify(data.result));
    window.location.href = 'summary.html';
  } catch (err) {
    alert('Error: ' + err.message);
    endBtn.disabled    = false;
    endBtn.textContent = '🏁 Get Final Results';
  } finally {
    loader.classList.remove('show');
  }
}

function confirmEnd() {
  if (confirm('End the interview now? Unanswered questions will be skipped.')) {
    finishInterview();
  }
}

// ── Boot ──────────────────────────────────────────────────────────────────────
document.getElementById('jobRoleLabel').textContent = jobRole;
initVoice();
renderQuestion(currentQText);
startTimer();
