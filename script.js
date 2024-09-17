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
        alert('请输入文本');
        return;
    }

    if (expirationSelect === 'custom') {
        const customDate = document.getElementById('custom-date').value;
        const customTime = document.getElementById('custom-time').value;
        if (!customDate || !customTime) {
            alert('请输入有效的自定义日期和时间');
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
            document.getElementById('code-display').textContent = result.code;
            document.getElementById('code-card').classList.remove('hidden');
        } else {
            alert('生成分享码失败，请稍后重试');
        }
    } catch (error) {
        alert('网络错误，请稍后重试');
    }
});

// 复制分享码到剪切板
document.getElementById('copy-button').addEventListener('click', () => {
    const code = document.getElementById('code-display').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('分享码已复制到剪贴板');
    }).catch(err => {
        alert('复制失败');
    });
});

document.getElementById('fetch-button').addEventListener('click', async() => {
    const code = document.getElementById('code-input').value.trim();
    if (!code) {
        alert('请输入分享码');
        return;
    }

    try {
        const response = await fetch(`https://paste-backened.aquariushho.asia?code=${code}`);
        if (response.ok) {
            const result = await response.json();
            document.getElementById('text-display').textContent = result.text;
        } else if (response.status === 404) {
            document.getElementById('text-display').textContent = '文本不存在或已过期';
        } else {
            alert('无法获取文本，请稍后重试');
        }
    } catch (error) {
        alert('网络错误，请稍后重试');
    }
});