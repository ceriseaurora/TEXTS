// 监听到期时间选择变化事件
document.getElementById('expiration-select').addEventListener('change', (e) => { 
    if (e.target.value === 'custom') {
        document.getElementById('custom-expiration').style.display = 'block';
    } else {
        document.getElementById('custom-expiration').style.display = 'none';
    }
});

// 提交按钮事件监听
document.getElementById('submit-button').addEventListener('click', async () => {
    // 获取并去除多余空格的文本
    const text = document.getElementById('text-input').value.trim();

    // 对输入的文本进行 URL 编码
    const encodedText = encodeURIComponent(text);

    const expirationSelect = document.getElementById('expiration-select').value;
    let expiration;

    if (!text) {
        alert('请输入文本');
        return;
    }

    // 处理自定义到期时间
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

    // 提交到服务器
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

// 复制分享码到剪切板
document.getElementById('copy-code-button').addEventListener('click', () => {
    const code = document.getElementById('code-display').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('分享码已复制到剪贴板');
    }).catch(err => {
        alert('复制分享码失败');
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

            // 对返回的编码文本进行解码
            const decodedText = decodeURIComponent(result.text);

            // 显示解码后的文本
            document.getElementById('text-display').textContent = decodedText;
            document.getElementById('text-card').classList.remove('hidden');

            // 根据设备类型设置卡片长度
            setCardHeight();
        } else if (response.status === 404) {
            document.getElementById('text-display').textContent = 'Text not found or expired';
            document.getElementById('text-card').classList.remove('hidden');
        } else {
            alert('无法获取文本，请稍后重试');
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

// 动态设置卡片长度
function setCardHeight() {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const textCard = document.getElementById('text-card');
    const copyButton = document.getElementById('copy-text-button');

    if (isMobile) {
        // 移动设备：默认长度设置，使按钮正好在屏幕底部
        textCard.style.height = 'calc(100vh - 300px)';
        copyButton.style.position = 'absolute';
        copyButton.style.bottom = '20px';
        copyButton.style.width = '90%';
    } else {
        // PC 浏览器：适当增加卡片的默认长度
        textCard.style.height = '400px';
    }
}
