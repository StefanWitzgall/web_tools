////////////////////////////////////////////////////////////////////////
// file: analog-clock-drawing.js
// to: JavaScript
// moddatetime: 21.03.2026, 19h35
// credatetime: 21.03.2026, 19h33
// author: Stefan Witzgall, Germany, Jean-Paul-Gymnasium Hof
// description:
//	used in, e.g.,
//	horloge_parlante_wit_v092.html
//	horloge_parlante_wit_digital_v092.html
//	horloge_parlante_wit_teaching_clock_v092.html
////////////////////////////////////////////////////////////////////////
function drawClock(date, hasSeconds = true) {
	const canvas = document.getElementById('analogClock');
	const container = canvas.parentElement;

	// Wir nehmen die Breite des Containers, aber maximal 500px
	const size = Math.min(container.offsetWidth, 500);

	// Nur neu setzen, wenn sich die Größe wirklich geändert hat
	if (canvas.width !== size) {
		canvas.width = size;
		canvas.height = size;
	}

	const h = date.getHours();
	const m = date.getMinutes();
	const s = date.getSeconds();

	const isDark = document.body.classList.contains('dark-mode');
	const mainColor = isDark ? "#FFFFFF" : "#000000";
	const radius = canvas.height / 2;
	const innerRadius = radius * 0.92;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Digitale Zeit in der unteren Hälfte
	ctx.save();
	ctx.translate(radius, radius);
	ctx.fillStyle = isDark ? "rgba(0, 255, 0, 1)" : "rgba(0, 0, 190, 1)";

	let fontSize = Math.round(radius * 0.18); // Schriftgröße berechnen
	ctx.font = `bold ${fontSize}px 'Segoe UI', Arial`;
	ctx.fillStyle = isDark ? "rgba(0, 255, 0, 1)" : "rgba(0, 0, 190, 1)";
	ctx.textAlign = "center";

	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const seconds = date.getSeconds().toString().padStart(2, '0');
	let timeStr = `${hours}:${minutes}`;
	if (hasSeconds) timeStr += `:${seconds}`;

	ctx.fillText(timeStr, 0, radius * 0.40);
	// ctx.fillText(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`, 0, radius * 0.40);
	ctx.restore();

	// Datum in der oberen Hälfte
	// -------------------- ctx.save --------------------
	ctx.save();
	ctx.translate(radius, radius);
	ctx.fillStyle = isDark ? "rgba(0, 255, 0, 1)" : "rgba(0, 0, 190, 1)";
	fontSize = Math.round(radius * 0.15);
	ctx.font = `bold ${fontSize}px 'Segoe UI', Arial`;

	ctx.textAlign = "center";

	// Formatiert das Datum (z.B. "13.02.2026")
	const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

	// Positioniert in der oberen Hälfte (negativer Wert für Y)
	ctx.fillText(dateStr, 0, -radius * 0.25);
	ctx.restore();
	// -------------------- ctx.restore --------------------

	// Zeitzoneninfo in der unteren Hälfte
	// -------------------- ctx.save --------------------
	ctx.save();
	ctx.translate(radius, radius);
	ctx.fillStyle = isDark ? "rgba(0, 255, 0, 1)" : "rgba(0, 0, 190, 1)";
	fontSize = Math.round(radius * 0.07);
	ctx.font = `bold ${fontSize}px 'Segoe UI', Arial`;
	ctx.textAlign = "center";
	const timeZoneStr = displayZoneName;

	// 1. Unterstriche durch Leerzeichen ersetzen
	// 2. Nur den Teil nach dem "/" nehmen (aus "America/New_York" wird "New York")
	let cleanZoneName = currentTimeZone.replace(/_/g, ' ');
	if (cleanZoneName.includes('/')) { cleanZoneName = cleanZoneName.split('/').pop(); }
	if (cleanZoneName === "SYSTEM") cleanZoneName = "Systemzeit";
	ctx.fillText(cleanZoneName, 0, radius * 0.17);
	// ctx.fillText(currentTimeZone, 0, radius * 0.17);
	ctx.restore();
	// -------------------- ctx.restore --------------------

	// Markierungen
	ctx.save();
	ctx.translate(radius, radius);
	for (let i = 0; i < 60; i++) {
		const isHour = i % 5 === 0;
		ctx.beginPath();
		ctx.lineWidth = isHour ? 6 : 2;
		ctx.strokeStyle = mainColor;
		ctx.moveTo(0, -innerRadius);
		ctx.lineTo(0, -(innerRadius - (isHour ? 20 : 10)));
		ctx.stroke();
		ctx.rotate(Math.PI / 30);
	}
	ctx.restore();

	// Innerhalb von drawClock, nach den Markierungen:
	ctx.save();
	ctx.translate(radius, radius);
	ctx.fillStyle = mainColor;
	fontSize = Math.round(radius * 0.15);
	ctx.font = `bold ${fontSize}px 'Segoe UI', Arial`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	for (let n = 1; n <= 12; n++) {
		const angle = n * Math.PI / 6;
		const dist = innerRadius - fontSize * 1.5; // - 55 war auch gut
		const x = dist * Math.sin(angle);
		const y = -dist * Math.cos(angle);
		ctx.fillText(n.toString(), x, y);
	}
	ctx.restore();

	// Zeiger
	drawHand(radius, (h % 12 + m / 60) * 30, radius * 0.55, 15, mainColor);
	drawHand(radius, (m + s / 60) * 6, radius * 0.77, 8, mainColor);

	if (hasSeconds) {
		drawHand(radius, s * 6, radius * 0.90, 2, "#FF0000");
		ctx.beginPath();
		ctx.arc(radius, radius, 5, 0, 2 * Math.PI);
		ctx.fillStyle = "#FF0000";
		ctx.fill();
	}
}

function drawHand(radius, angle, length, width, color) {
	ctx.save();
	ctx.translate(radius, radius);
	ctx.rotate(angle * Math.PI / 180);
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.lineCap = "butt";
	ctx.moveTo(0, 10); // Kleiner Überhang nach hinten
	ctx.lineTo(0, -length);
	ctx.stroke();
	ctx.restore();
}
