document.addEventListener('DOMContentLoaded', async () => {
    const apiInput = document.getElementById('api-url');
    const tokenInput = document.getElementById('token');
    const saveBtn = document.getElementById('save-settings');
    const resetBtn = document.getElementById('reset-settings');
    const authSection = document.getElementById('auth-section');
    const readySection = document.getElementById('ready-section');

    // Load existing settings
    const settings = await chrome.storage.local.get(['apiUrl', 'token']);
    if (settings.apiUrl && settings.token) {
        showReady();
    }

    saveBtn.addEventListener('click', async () => {
        const apiUrl = apiInput.value.trim().replace(/\/$/, ""); // Remove trailing slash
        const token = tokenInput.value.trim();

        if (!apiUrl || !token) {
            showError('PROTOCOL_ERROR: MISSING_TELEMETRY');
            return;
        }

        await chrome.storage.local.set({ apiUrl, token });
        showReady();
    });

    resetBtn.addEventListener('click', async () => {
        await chrome.storage.local.remove(['apiUrl', 'token']);
        showAuth();
    });

    function showReady() {
        authSection.classList.add('hidden');
        readySection.classList.remove('hidden');
    }

    function showAuth() {
        authSection.classList.remove('hidden');
        readySection.classList.add('hidden');
        apiInput.value = settings.apiUrl || 'http://localhost:5000';
    }

    function showError(msg) {
        const errBox = document.getElementById('error-message');
        errBox.querySelector('.error-text').textContent = msg;
        errBox.classList.remove('hidden');
        setTimeout(() => errBox.classList.add('hidden'), 3000);
    }
});
