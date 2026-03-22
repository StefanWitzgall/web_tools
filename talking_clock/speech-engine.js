////////////////////////////////////////////////////////////////////////
// file: speech-engine.js
// to: JavaScript
// moddatetime: 22.03.2026, 07h43
// credatetime: 21.03.2026, 18h50
// author: Stefan Witzgall, Germany, Jean-Paul-Gymnasium Hof
// description:
//	used in, e.g.,
//	horloge_parlante_wit_v092.html
//	horloge_parlante_wit_digital_v092.html
//	horloge_parlante_wit_teaching_clock_v092.html
////////////////////////////////////////////////////////////////////////
let allVoices = [];
let selectedVoice = null;
let isSpeakingEnabled = false;
let favoriteVoices = JSON.parse(localStorage.getItem('clockFavorites') || '[]');
const LEAD_TIME = 8;

function loadVoices() {
	let rawVoices = window.speechSynthesis.getVoices();
	if (rawVoices.length === 0) return;

	allVoices = rawVoices.filter(v => ['de', 'en', 'fr', 'es'].some(l => v.lang.toLowerCase().startsWith(l)));
	allVoices.sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name));

	const selectElement = document.getElementById('voiceSelect');
	selectElement.innerHTML = '';

	// Gruppe 1: Favoriten
	const favVoices = allVoices.filter(v => favoriteVoices.includes(v.name));
	if (favVoices.length > 0) {
		const favGroup = document.createElement('optgroup');
		favGroup.label = "⭐ Deine Favoriten";
		allVoices.forEach((v, i) => {
			if (favoriteVoices.includes(v.name)) {
				let opt = new Option(`${v.lang.toUpperCase()} - ${v.name}`, i);
				favGroup.appendChild(opt);
			}
		});
		selectElement.add(favGroup);
	}

	// Gruppe 2: Alle Stimmen
	const allGroup = document.createElement('optgroup');
	allGroup.label = "Alle verfügbaren Stimmen";
	allVoices.forEach((v, i) => {
		let opt = new Option(`${v.lang.toUpperCase()} - ${v.name}`, i);
		allGroup.appendChild(opt);
	});
	selectElement.add(allGroup);

	// WICHTIG: Sicherstellen, dass eine Auswahl existiert
	if (allVoices.length > 0) {
		// Falls noch nichts gewählt wurde, nimm die erste verfügbare Stimme
		if (selectElement.selectedIndex === -1) {
			selectElement.selectedIndex = 0;
		}
		selectVoice(); // Variable synchronisieren
	}

	// --- ENTSCHEIDENDER TEIL (FIXED) ---
	// const selectElement = document.getElementById('voiceSelect');
	if (selectElement && selectElement.value !== "") {
		// Wir holen den Namen der aktuell im Menü gewählten Stimme
		const currentVoiceName = selectElement.options[selectElement.selectedIndex].text;

		// Wir suchen die Stimme in unserem Array allVoices
		// Da wir den Index (i) als value im HTML haben, ist es noch einfacher:
		const idx = parseInt(selectElement.value);
		selectedVoice = allVoices[idx];
	}

	/*
	// Falls immer noch nichts gewählt ist (erster Start), Fallback auf die erste Stimme
	if (!selectedVoice && allVoices.length > 0) {
		selectedVoice = allVoices[0];
	}
	*/

	const savedVoiceName = localStorage.getItem('lastSelectedVoiceName');
	if (savedVoiceName) {
		const found = allVoices.find(v => v.name === savedVoiceName);
		if (found) {
			selectedVoice = found;
			selectElement.value = allVoices.indexOf(found);
		}
	}
}


function selectVoice() {
	const selectElement = document.getElementById('voiceSelect');
	if (selectElement.value !== "") {
		const idx = parseInt(selectElement.value);
		selectedVoice = allVoices[idx];
		// Speichern!
		localStorage.setItem('lastSelectedVoiceName', selectedVoice.name);
	}
}


function toggleFavorite() {
	if (!selectedVoice) return;
	const index = favoriteVoices.indexOf(selectedVoice.name);
	index > -1 ? favoriteVoices.splice(index, 1) : favoriteVoices.push(selectedVoice.name);
	localStorage.setItem('clockFavorites', JSON.stringify(favoriteVoices));
	loadVoices();
}


function getAnnouncementText(date, options = {}) {
	const h = date.getHours();
	const m = date.getMinutes();
	const s = date.getSeconds();

	const lang = options.lang || 'de';
	const hasSeconds = options.hasSeconds || false;
	const isLive = (options.mode === 'LIVE');


	// Hilfsfunktion für die deutsche Grammatik
	const formatDe = (val, unit) => {
		if (val === 1) {
			if (unit === "Uhr") return "ein Uhr";
			if (unit === "Minute") return "eine Minute";
			if (unit === "Sekunde") return "eine Sekunde";
		}
		return `${val} ${unit}${unit === "Uhr" ? "" : "n"}`;
	};

	// Fremdsprachen mit Intro-Unterscheidung
	if (lang.startsWith('fr')) {
		let intro = isLive ? "Au prochain signal sonore, il sera" : "Il est";
		let base = `${intro} ${h} heures, ${m}`;
		return hasSeconds ? `${base} et ${s} secondes.` : `${base}.`;
	}
	if (lang.startsWith('en')) {
		let intro = isLive ? "At the next signal, the time will be" : "It is now";
		let base = `${intro} ${h} hours, ${m} minutes`;
		return hasSeconds ? `${base} and ${s} seconds.` : `${base}.`;
	}
	if (lang.startsWith('es')) {
		let intro = isLive ? "Al siguiente tono serán las" : "Son las";
		let base = `${intro} ${h} horas, ${m}`;
		return hasSeconds ? `${base} y ${s} segundos.` : `${base}.`;
	}

	// DEUTSCH-Logik mit Intro-Unterscheidung
	const hh = formatDe(h, "Uhr");
	const intro = isLive ? "Beim nächsten Biep ist es" : "Es ist jetzt";

	// Check für volle Stunde
	const isFullHour = (m === 0 && (!hasSeconds || s === 0));

	if (isFullHour) {
		return `${intro} genau ${hh}.`;
	}

	// Normale Ansage
	const mm = formatDe(m, "Minute");
	const ss = formatDe(s, "Sekunde");

	let announcement = `${intro} ${hh}, ${mm}`;

	if (hasSeconds && s !== 0) {
		announcement += ` und ${ss}.`;
	} else {
		announcement += ".";
	}

	return announcement;
}
