// 切换文本分享和文件分享
document.getElementById('text-toggle').addEventListener('click', () => {
    document.getElementById('text-toggle').classList.add('active');
    document.getElementById('file-toggle').classList.remove('active');
    document.getElementById('text-share').classList.remove('hidden');
    document.getElementById('file-share').classList.add('hidden');
});

document.getElementById('file-toggle').addEventListener('click', () => {
    document.getElementById('file-toggle').classList.add('active');
    document.getElementById('text-toggle').classList.remove('active');
    document.getElementById('file-share').classList.remove('hidden');
    document.getElementById('text-share').classList.add('hidden');
});

// 监听到期时间选择变化事件（文本）
document.getElementById('expiration-select').addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        document.getElementById('custom-expiration').style.display = 'block';
    } else {
        document.getElementById('custom-expiration').style.display = 'none';
    }
});

// 监听到期时间选择变化事件（文件）
document.getElementById('expiration-select-file').addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        document.getElementById('custom-expiration-file').style.display = 'block';
    } else {
        document.getElementById('custom-expiration-file').style.display = 'none';
    }
});

// 提交按钮事件监听（文本）
document.getElementById('submit-button').addEventListener('click', async () => {
    const text = document.getElementById('text-input').value.trim();

    if (!text) {
        alert('请输入文本');
        return;
    }

    const encodedText = encodeURIComponent(text);
    const expirationSelect = document.getElementById('expiration-select').value;
    let expiration;

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
            body: JSON.stringify({ text: encodedText, expiration })
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

// 提交按钮事件监听（文件）
document.getElementById('submit-file-button').addEventListener('click', async () => {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (!file) {
        alert('请选择文件');
        return;
    }

    const expirationSelect = document.getElementById('expiration-select-file').value;
    let expiration;

    if (expirationSelect === 'custom') {
        const customDate = document.getElementById('custom-date-file').value;
        const customTime = document.getElementById('custom-time-file').value;
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

    const formData = new FormData();
    formData.append('file', file);
    formData.append('expiration', expiration);

    try {
        const response = await fetch('https://paste-backened.aquariushho.asia/upload', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            const result = await response.json();
            document.getElementById('file-code-display').textContent = result.code;
            document.getElementById('file-code-card').classList.remove('hidden');
        } else {
            alert('生成文件分享码失败，请稍后重试');
        }
    } catch (error) {
        alert('网络错误，请稍后重试');
    }
});

// 复制分享码到剪切板（文本）
document.getElementById('copy-code-button').addEventListener('click', () => {
    const code = document.getElementById('code-display').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('分享码已复制到剪贴板');
    }).catch(err => {
        alert('复制分享码失败');
    });
});

// 复制分享码到剪切板（文件）
document.getElementById('copy-file-code-button').addEventListener('click', () => {
    const code = document.getElementById('file-code-display').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('文件分享码已复制到剪贴板');
    }).catch(err => {
        alert('复制文件分享码失败');
    });
});

// 获取文本按钮事件监听
document.getElementById('fetch-button').addEventListener('click', async () => {
    const code = document.getElementById('code-input').value.trim();
    if (!code) {
        alert('请输入分享码');
        return;
    }

    try {
        const response = await fetch(`https://paste-backened.aquariushho.asia?code=${code}`);
        if (response.ok) {
            const result = await response.json();
            const decodedText = decodeURIComponent(result.text);
            document.getElementById('text-display').textContent = decodedText;
            document.getElementById('text-card').classList.remove('hidden');
            document.getElementById('copy-text-button').classList.remove('hidden');
            setCardHeight();
        } else if (response.status === 404) {
            document.getElementById('text-display').textContent = 'Text not found or expired';
            document.getElementById('text-card').classList.remove('hidden');
            document.getElementById('copy-text-button').classList.add('hidden');
        } else {
            alert('无法获取文本，请稍后重试');
        }
    } catch (error) {
        alert('网络错误，请稍后重试');
    }
});

// 获取文件按钮事件监听
document.getElementById('fetch-file-button').addEventListener('click', async () => {
    const code = document.getElementById('file-code-input').value.trim();
    if (!code) {
        alert('请输入文件分享码');
        return;
    }

    try {
        const response = await fetch(`https://paste-backened.aquariushho.asia/download?code=${code}`);
        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            document.getElementById('file-link').href = url;
            document.getElementById('file-card').classList.remove('hidden');
        } else {
            alert('无法获取文件，请稍后重试');
        }
    } catch (error) {
        alert('网络错误，请稍后重试');
    }
});

// 复制获取到的文本到剪切板
document.getElementById('copy-text-button').addEventListener('click', () => {
    const text = document.getElementById('text-display').textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('文本已复制到剪贴板');
    }).catch(err => {
        alert('复制文本失败');
    });
});
