// ==UserScript==
// @name         Kenjo Gleitzeitanzeige
// @namespace    de.rus1rius
// @updateURL    https://github.com/janDigeser/UserScripts/raw/refs/heads/main/kenjoGleitzeit.user.js
// @version      1.0
// @match        https://app.kenjo.io/cloud/attendance/my-attendance
// ==/UserScript==
(function () {
    'use strict';
    const style = document.createElement('style');
    style.textContent = `
        .us-gleitzeit-positiv, .us-gleitzeit-negativ {
            margin-left: 0.5em;
        }
        .us-gleitzeit-positiv { color: #2e7d32; }
        .us-gleitzeit-negativ { color: #c62828; }
    `;
    document.head.appendChild(style);
    function parseMinutes(text) {
        const h = parseInt(text.match(/(\d+)h/)?.[1] ?? 0);
        const m = parseInt(text.match(/(\d+)min/)?.[1] ?? 0);
        return h * 60 + m;
    }
    function formatDiff(totalMinutes) {
        const abs = Math.abs(totalMinutes);
        const h = Math.floor(abs / 60);
        const m = abs % 60;
        const sign = totalMinutes >= 0 ? '+' : '-';
        return `${sign}${h}:${String(m).padStart(2, '0')}`;
    }
    function isMonatlichActive() {
        const activeTab = document.querySelector('orgos-people-detail-attendance .mat-tab-label.mat-tab-label-active .mat-tab-label-content');
        return activeTab?.textContent?.trim().startsWith('MONATLICH') ?? false;
    }
    function run() {
        if (!isMonatlichActive()) return;
        const dayContainers = document.querySelectorAll(
            'div.pdap-day-container.before:not(.non-working-day)'
        );
        if (!dayContainers.length) return;
        document.querySelectorAll('.us-gleitzeit-positiv, .us-gleitzeit-negativ').forEach(el => el.remove());
        let cumulativeMinutes = 0;
        dayContainers.forEach(container => {
            const workedEl = container.querySelector('div.pdap-working-time');
            const expectedEl = container.querySelector('orgos-column.pdap-day-cell div:nth-child(2)');
            if (!workedEl || !expectedEl) return;
            const workedMin = parseMinutes(workedEl.childNodes[0]?.textContent ?? '');
            const expectedMin = parseMinutes(expectedEl.textContent ?? '');
            cumulativeMinutes += workedMin - expectedMin;
            const cls = cumulativeMinutes >= 0 ? 'us-gleitzeit-positiv' : 'us-gleitzeit-negativ';
            const div = document.createElement('div');
            div.className = cls;
            div.textContent = formatDiff(cumulativeMinutes);
            workedEl.appendChild(div);
        });
    }
    let debounceTimer = null;
    const observer = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(run, 300);
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
