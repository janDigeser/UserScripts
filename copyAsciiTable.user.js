// ==UserScript==
// @name         ALT + Table → ASCII Copier
// @namespace    de.rus1rius
// @version      1.1.0
// @updateURL    https://github.com/janDigeser/UserScripts/raw/refs/heads/main/copyAsciiTable.user.js
// @description  Hold ALT to show copy buttons on all tables and copy them as ASCII
// @match        *://*/*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    let buttons = [];
    let altPressed = false;

    function tableToAscii(table) {
        const rows = Array.from(table.querySelectorAll('tr')).map(tr =>
            Array.from(tr.querySelectorAll('th, td')).map(cell =>
                cell.innerText.trim()
            )
        );

        if (rows.length === 0) return '';

        const colCount = Math.max(...rows.map(r => r.length));

        const colWidths = Array.from({ length: colCount }, (_, i) =>
            Math.max(...rows.map(r => (r[i] || '').length))
        );

        const border = () =>
            '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';

        const rowLine = row =>
            '| ' + colWidths.map((w, i) =>
                (row[i] || '').padEnd(w, ' ')
            ).join(' | ') + ' |';

        let out = [];
        out.push(border());
        out.push(rowLine(rows[0]));
        out.push(border());

        for (let i = 1; i < rows.length; i++) {
            out.push(rowLine(rows[i]));
        }

        out.push(border());
        return out.join('\n');
    }

    function addButtons() {
        document.querySelectorAll('table').forEach(table => {
            const rect = table.getBoundingClientRect();

            const btn = document.createElement('button');
            btn.textContent = 'Copy ASCII';
            btn.style.position = 'absolute';
            btn.style.top = `${window.scrollY + rect.top + 4}px`;
            btn.style.left = `${window.scrollX + rect.left + 4}px`;
            btn.style.zIndex = '99999';
            btn.style.fontSize = '11px';
            btn.style.padding = '2px 6px';
            btn.style.cursor = 'pointer';

            btn.addEventListener('click', e => {
                e.stopPropagation();
                const ascii = tableToAscii(table);
                GM_setClipboard(ascii);
            });

            document.body.appendChild(btn);
            buttons.push(btn);
        });
    }

    function removeButtons() {
        buttons.forEach(b => b.remove());
        buttons = [];
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Alt' && !altPressed) {
            altPressed = true;
            addButtons();
        }
    });

    document.addEventListener('keyup', e => {
        if (e.key === 'Alt') {
            altPressed = false;
            removeButtons();
        }
    });
})();
