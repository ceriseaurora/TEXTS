document.getElementById('text-share-button').addEventListener('click', () => {
    toggleShareOptions('text');
});

document.getElementById('file-share-button').addEventListener('click', () => {
    toggleShareOptions('file');
});

function toggleShareOptions(option) {
    const textCard = document.getElementById('text-share-card');
    const fileCard = document.getElementById('file-share-card');
    const textButton = document.getElementById('text-share-button');
    const fileButton = document.getElementById('file-share-button');

    if (option === 'text') {
        textCard.classList.remove('hidden');
        fileCard.classList.add('hidden');
        textButton.classList.add('active');
        fileButton.classList.remove('active');
    } else {
        textCard.classList.add('hidden');
        fileCard.classList.remove('hidden');
        textButton.classList.remove('active');
        fileButton.classList.add('active');
    }
}

// 监听文本分享的到期时间选择变化事件
document.getElementById('expiration-select').addEventListener('change', (e) => {
    document.getElementById('custom-expiration').style.display = e.target.value === 'custom' ? 'block' : 'none';
});

// 监听文件分享的到期时间选择变化事件
document.getElementById('expiration-select-file').addEventListener('change', (e) => {
    document.getElementById('custom-expiration-file').style.display = e.target.value === 'custom' ? 'block' : 'none';
});

// 文本分享交互逻辑（如原代码）
// 文件分享交互逻辑（类似文本分享）

// 文件分享生成分享码的逻辑
document.getElementById('submit-file-button').addEventListener('click', async () => {
    const file = document.getElementById('file-input').files[0];
    if (!file) {
        alert('请选择一个文件');
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

    // 提交到服务器
    try {
        const response = await fetch('https://paste-backened.aquariushho.asia/file', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            const result = await response.json();
            document.getElementById('file-code-display').textContent = result.code;
            document.getElementById('file-code-card').classList.remove('hidden');
        } else {
            alert('生成分享码失败，请稍后重试');
        }
    } catch (error) {
        alert('网络错误，请稍后重试');
    }
});
