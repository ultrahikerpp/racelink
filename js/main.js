console.log('RaceLink Taiwan Loaded');

// Theme Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.querySelector('.theme-toggle-btn');
    const html = document.documentElement;

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Initial Setup
    if (savedTheme === 'light') {
        applyTheme('light');
    } else if (savedTheme === 'dark') {
        applyTheme('dark');
    } else {
        // Default to Dark
        applyTheme('dark');
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        });
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            html.setAttribute('data-theme', 'light');
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            updateIcon(false);
        } else {
            html.removeAttribute('data-theme');
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            updateIcon(true);
        }

        // Broadcast change to iframes
        const frames = document.getElementsByTagName('iframe');
        for (let i = 0; i < frames.length; i++) {
            frames[i].contentWindow.postMessage({ type: 'theme-change', theme: theme }, '*');
        }
    }

    function updateIcon(isDark) {
        if (!themeBtn) return;
        themeBtn.innerHTML = isDark ? '🌙' : '☀️';
        themeBtn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        themeBtn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');

        // Sync button style if needed
        themeBtn.style.color = isDark ? '#fff' : '#1e293b';
        themeBtn.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1';
    }
});
