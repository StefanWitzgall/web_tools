////////////////////////////////////////////////////////////////////////
// file: audio-engine.js
// to: JavaScript
// moddatetime: 21.03.2026, 14h45
// credatetime: 21.03.2026, 14h30
// author: Stefan Witzgall, Germany, Jean-Paul-Gymnasium Hof
// description:
//	used in, e.g.,
//	horloge_parlante_wit_v092.html
//	horloge_parlante_wit_digital_v092.html
//	horloge_parlante_wit_teaching_clock_v092.html
////////////////////////////////////////////////////////////////////////
const BEEP_FREQ = 1000;
const BEEP_LENGTH = 0.5;

let audioCtx = null;

function playBeep() {
	if (!isSpeakingEnabled) return;

	// 1. Initialisierung
	if (!audioCtx) {
		audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	}

	// 2. Deine ursprüngliche Sound-Logik in eine Funktion verpackt
	const startBeep = () => {
		const osc = audioCtx.createOscillator();
		const gain = audioCtx.createGain();

		osc.connect(gain);
		gain.connect(audioCtx.destination);

		// Nutzt deine globalen Variablen BEEP_FREQ und BEEP_LENGTH
		osc.frequency.value = typeof BEEP_FREQ !== 'undefined' ? BEEP_FREQ : 880;
		const duration = typeof BEEP_LENGTH !== 'undefined' ? BEEP_LENGTH : 0.2;

		const now = audioCtx.currentTime;

		// Dein exakter Lautstärke-Verlauf (ADSR-Kurve)
		gain.gain.setValueAtTime(0, now);
		gain.gain.linearRampToValueAtTime(0.4, now + 0.02);
		gain.gain.setValueAtTime(0.4, now + duration - 0.05);
		gain.gain.linearRampToValueAtTime(0, now + duration);

		osc.start(now);
		osc.stop(now + duration);
	};

	// 3. If the process was suspended temporarily:
	if (audioCtx.state === 'suspended') {
		audioCtx.resume().then(startNoise);
	} else {
		startBeep();
	}
}

function handleAudioToggle() {
	isSpeakingEnabled = !isSpeakingEnabled;
	const btn = document.getElementById('audioBtn');
	const status = document.getElementById('audioStatus');

	if (isSpeakingEnabled) {
		if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

		// --- DER IPAD FIX: Sprachausgabe "entsperren" ---
		window.speechSynthesis.cancel();
		const unlockUtterance = new SpeechSynthesisUtterance(" "); // Leere Phrase
		unlockUtterance.volume = .01; // Doppeltes Netz: nahezu lautlos (0 wird machmal zu default Wert ne 0)
		if (selectedVoice) unlockUtterance.voice = selectedVoice;
		window.speechSynthesis.speak(unlockUtterance);
		// -----------------------------------------------

		btn.innerText = "Audio AUS"; btn.className = "btn-green";
		status.innerText = "Status: Audio EIN"; status.style.color = "#27ae60";
	} else {
		window.speechSynthesis.cancel();
		btn.innerText = "Audio EIN"; btn.className = "btn-red";
		status.innerText = "Status: Audio AUS"; status.style.color = "#e74c3c";
	}
}
