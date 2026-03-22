////////////////////////////////////////////////////////////////////////
// file: ui-utils.js
// to: JavaScript
// moddatetime: 21.03.2026, 15h03
// credatetime: 21.03.2026, 14h50
// author: Stefan Witzgall, Germany, Jean-Paul-Gymnasium Hof
// description:
//	used in, e.g.,
//	horloge_parlante_wit_v092.html
//	horloge_parlante_wit_digital_v092.html
//	horloge_parlante_wit_teaching_clock_v092.html
////////////////////////////////////////////////////////////////////////
// let isDarkMode = true;

// Hilfsfunktion für führende Nullen (z.B. für 09:05:02)
function leadingZero(number) {
    return number < 10 ? "0" + number : number;
}

// Dark Mode Umschalter
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark);
    const darkBtn = document.getElementById('darkToggle');
    if (darkBtn) darkBtn.innerText = isDark ? '☀️' : '🌙';
}

// Initialisierung des Themes (Standard: Dark Mode)
function applyInitialTheme() {
    // Prüfen, ob der User schon mal was anderes gewählt hat, sonst Standard 'true'
    const savedDarkMode = localStorage.getItem('darkMode');

    // Wenn nichts gespeichert ist (null), erzwingen wir den Dark Mode
    if (savedDarkMode === null || savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
        const darkBtn = document.getElementById('darkToggle');
        if (darkBtn) darkBtn.innerText = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        const darkBtn = document.getElementById('darkToggle');
        if (darkBtn) darkBtn.innerText = '🌙';
    }
}

// iPad Fokus-Bremse
function setupFocusBrakes() {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', () => {
            select.blur();
        });
    });
}
