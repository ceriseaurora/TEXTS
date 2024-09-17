document.getElementById('submit-button').addEventListener('click', async() => {
    const text = document.getElementById('text-input').value;
    if (text) {
        const response = await fetch('https://your-worker-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const result = await response.json();
        document.getElementById('code-display').textContent = `提取码: ${result.code}`;
    }
});

document.getElementById('fetch-button').addEventListener('click', async() => {
    const code = document.getElementById('code-input').value;
    if (code) {
        const response = await fetch(`https://your-worker-url?code=${code}`);
        if (response.status === 200) {
            const result = await response.json();
            document.getElementById('text-display').textContent = result.text;
        } else {
            document.getElementById('text-display').textContent = '未找到文字';
        }
    }
});