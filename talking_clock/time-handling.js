////////////////////////////////////////////////////////////////////////
// file: time-handling.js
// to: JavaScript
// moddatetime: 21.03.2026, 19h23
// credatetime: 21.03.2026, 19h15
// author: Stefan Witzgall, Germany, Jean-Paul-Gymnasium Hof
// description:
//	used in, e.g.,
//	horloge_parlante_wit_v092.html
//	horloge_parlante_wit_digital_v092.html
//	horloge_parlante_wit_teaching_clock_v092.html
////////////////////////////////////////////////////////////////////////
let useNetworkTime = false;
let timeOffset = 0; // Millisekunden-Abweichung zur Systemzeit
let currentTimeZone = "SYSTEM"; // Aktuell gewählte Zone
let localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Erkennt z.B. "Europe/Berlin"
let displayZoneName = "Systemzeit";
let syncInterval = null;
let isSyncActive = false;

async function toggleSync(onlyUpdate = false) {
	const btn = document.getElementById('syncBtn');
	const statusEl = document.getElementById('syncStatus');
	const offsetEl = document.getElementById('offsetDisplay');

	if (!useNetworkTime || onlyUpdate) {
		try {
			statusEl.innerText = "Synchronisiere...";

			// LOGIK: Wenn SYSTEM gewählt, nimm die echte lokale Zone für den Drift-Check
			const zoneToFetch = (currentTimeZone === "SYSTEM") ? localTimeZone : currentTimeZone;

			const start = Date.now();
			const response = await fetch(`https://www.timeapi.io/api/time/current/zone?timeZone=${encodeURIComponent(zoneToFetch)}`);
			const data = await response.json();
			const end = Date.now();

			if (data && data.dateTime) {
				const networkMs = new Date(data.dateTime).getTime();
				const latency = (end - start) / 2;

				// Der Offset ist nun entweder (Zonendifferenz + Drift) oder nur (Drift)
				timeOffset = networkMs + latency - end;

				useNetworkTime = true;
				btn.innerText = "Netz-Sync AUS";
				btn.className = "btn-orange";
				statusEl.innerText = (currentTimeZone === "SYSTEM") ? "Status: Drift-Korrektur" : "Status: Netz-Zeit";

				if (Math.abs(timeOffset) > 60000) {
					const hours = (timeOffset / 3600000).toFixed(1);
					offsetEl.innerHTML = `Verschiebung: ${hours}h`;
				} else {
					offsetEl.innerHTML = `Drift: ${Math.round(timeOffset)}ms`;
				}
			}
		} catch (e) {
			console.error("Sync-Fehler:", e);
			statusEl.innerText = "Status: Sync Fehler";
			if (!onlyUpdate) alert("Netz-Zeit konnte nicht geladen werden.");
			useNetworkTime = false; // Reset bei Fehler
		}
	} else {
		// AUSSCHALTEN
		useNetworkTime = false;
		btn.innerText = "Netz-Sync EIN";
		btn.className = "btn-blue";
		calculateOfflineOffset(); // Setzt alles sauber zurück
	}
}

function calculateOfflineOffset() {
	if (currentTimeZone === "SYSTEM") {
		timeOffset = 0;
		displayZoneName = "Systemzeit";
		document.getElementById('syncStatus').innerText = "Status: Systemzeit";
		document.getElementById('offsetDisplay').innerHTML = "Offset: &mdash;";
		return;
	}

	try {
		const now = new Date();
		const zoneString = now.toLocaleString("en-US", { timeZone: currentTimeZone });
		const localString = now.toLocaleString("en-US");
		timeOffset = new Date(zoneString).getTime() - new Date(localString).getTime();

		displayZoneName = currentTimeZone;
		document.getElementById('syncStatus').innerText = "Status: Lokal berechnet";
		document.getElementById('offsetDisplay').innerHTML = `Zone: ${timeOffset / 3600000}h`;
	} catch (e) {
		timeOffset = 0;
		document.getElementById('syncStatus').innerText = "Status: Fehler";
	}
}

async function handleZoneChange() {
	const selector = document.getElementById('zoneSelector');
	currentTimeZone = selector.value;

	// Falls wir auf Systemzeit schalten, beenden wir den Netz-Sync Modus erst mal
	if (currentTimeZone === "SYSTEM") {
		useNetworkTime = false;
		const btn = document.getElementById('syncBtn');
		btn.innerText = "Netz-Sync EIN";
		btn.className = "btn-blue";
	}

	if (useNetworkTime) {
		await toggleSync(onlyUpdate = true);
	} else {
		calculateOfflineOffset();
	}
}
