console.log('RaceLink Taiwan Loaded');

// Theme Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.querySelector('.theme-toggle-btn');
    const html = document.documentElement;
    const body = document.body; // Fallback if data-theme is on body

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'light') {
        html.setAttribute('data-theme', 'light');
        updateIcon(false);
    } else if (savedTheme === 'dark') {
        html.removeAttribute('data-theme');
        updateIcon(true);
    } else {
        // Default to dark for this specific design if no preference, 
        // or follow system. Here we default to our Dark design.
        html.removeAttribute('data-theme');
        updateIcon(true);
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = !html.hasAttribute('data-theme'); // Currently dark (default)

            if (isDark) {
                // Switch to Light
                html.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                updateIcon(false);
            } else {
                // Switch to Dark
                html.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
                updateIcon(true);
            }
        });
    }

    function updateIcon(isDark) {
        if (!themeBtn) return;
        themeBtn.innerHTML = isDark ? '🌙' : '☀️';
        themeBtn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        themeBtn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
});
