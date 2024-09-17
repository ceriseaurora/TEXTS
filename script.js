document.getElementById('expiration-select').addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        document.getElementById('custom-expiration').style.display = 'block';
    } else {
        document.getElementById('custom-expiration').style.display = 'none';
    }
});

document.getElementById('submit-button').addEventListener('click', async() => {
    const text = document.getElementById('text-input').value.trim();
    const expirationSelect = document.getElementById('expiration-select').value;
    let expiration;

    if (!text) {
        alert('Please enter some text');
        return;
    }

    if (expirationSelect === 'custom') {
        const customDate = document.getElementById('custom-date').value;
        const customTime = document.getElementById('custom-time').value;
        if (!customDate || !customTime) {
            alert('Please enter a valid custom date and time');
            return;
        }
        expiration = `${customDate}T${customTime}:00`;
    } else {
        const now = new Date();
        switch (expirationSelect) {
            case '1d':
                expiration = new Date(now.getTime() + 86400000).toISOString();
                break;
            case '3d':
                expiration = new Date(now.getTime() + 3 * 86400000).toISOString();
                break;
            case '7d':
                expiration = new Date(now.getTime() + 7 * 86400000).toISOString();
                break;
            case '30d':
                expiration = new Date(now.getTime() + 30 * 86400000).toISOString();
                break;
            default:
                expiration = new Date(now.getTime() + 86400000).toISOString();
                break;
        }
    }

    try {
        const response = await fetch('https://paste-backened.aquariushho.asia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, expiration })
        });
        if (response.ok) {
            const result = await response.json();
            document.getElementById('code-display').textContent = `Share code: ${result.code}`;
        } else {
            alert('Failed to generate the share code, please try again later');
        }
    } catch (error) {
        alert('Network error, please try again later');
    }
});

document.getElementById('fetch-button').addEventListener('click', async() => {
    const code = document.getElementById('code-input').value.trim();
    if (!code) {
        alert('Please enter the share code');
        return;
    }

    try {
        const response = await fetch(`https://paste-backened.aquariushho.asia?code=${code}`);
        if (response.ok) {
            const result = await response.json();
            document.getElementById('text-display').textContent = result.text;
        } else if (response.status === 404) {
            document.getElementById('text-display').textContent = 'Text not found or expired';
        } else {
            alert('Failed to retrieve the text, please try again later');
        }
    } catch (error) {
        alert('Network error, please try again later');
    }
});