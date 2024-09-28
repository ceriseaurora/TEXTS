// 切换按钮逻辑
const textButton = document.getElementById('text-button');
const fileButton = document.getElementById('file-button');
const textCard = document.getElementById('text-card');
const fileCard = document.getElementById('file-card');

textButton.addEventListener('click', () => {
    textButton.classList.add('active');
    fileButton.classList.remove('active');
    textCard.classList.remove('hidden');
    fileCard.classList.add('hidden');
});

fileButton.addEventListener('click', () => {
    fileButton.classList.add('active');
    textButton.classList.remove('active');
    fileCard.classList.remove('hidden');
    textCard.classList.add('hidden');
});

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

    if (!text) {
        alert('请输入文本');
        return;
    }

    // 对输入的文本进行 URL 编码
    const encodedText = encodeURIComponent(text);

    const expirationSelect = document.getElementById('expiration-select').value;
    let expiration;

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
            document.getElementById('copy-text-button').classList.remove('hidden'); // 显示复制文本按钮

            // 根据设备类型设置卡片长度
            setCardHeight();
        } else if (response.status === 404) {
            document.getElementById('text-display').textContent = 'Text not found or expired';
            document.getElementById('text-card').classList.remove('hidden');
            document.getElementById('copy-text-button').classList.add('hidden'); // 隐藏复制文本按钮
        } else {
            alert('无法获取文本，请稍后重试');
        }
    } catch (error) {
        alert('网络错误，请稍后重试');
    }
});

// 文件分享逻辑
const fileInput = document.getElementById('file-input');
const fileExpirationSelect = document.getElementById('file-expiration-select');
const fileCustomExpiration = document.getElementById('file-custom-expiration');
const submitFileButton = document.getElementById('submit-file-button');
const fileCodeCard = document.getElementById('file-code-card');
const fileCodeDisplay = document.getElementById('file-code-display');
const copyFileCodeButton = document.getElementById('copy-file-code-button');
const fileCodeInput = document.getElementById('file-code-input');
const fetchFileButton = document.getElementById('fetch-file-button');
const fileProgress = document.getElementById('file-progress');
const fileProgressBar = document.getElementById('file-progress-bar');
const fileProgressText = document.getElementById('file-progress-text');

// 文件分片大小 (20MB)
const CHUNK_SIZE = 20 * 1024 * 1024;

// 监听到期时间选择变化事件 (文件)
fileExpirationSelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        fileCustomExpiration.style.display = 'block';
    } else {
        fileCustomExpiration.style.display = 'none';
    }
});

// 提交文件按钮事件监听
submitFileButton.addEventListener('click', async () => {
    const file = fileInput.files[0];

    if (!file) {
        alert('请选择文件');
        return;
    }

    // 获取过期时间
    const expirationSelect = fileExpirationSelect.value;
    let expiration;
    if (expirationSelect === 'custom') {
        const customDate = document.getElementById('file-custom-date').value;
        const customTime = document.getElementById('file-custom-time').value;
        if (!customDate || !customTime) {
            alert('请输入有效的自定义日期和时间');
            return;
        }
        expiration = `${customDate}T${customTime}:00`;
    } else {
        // ... (与文本分享逻辑相同)
    }

    // 生成分享码
    const code = generateSecureCode();

    // 分片上传文件
    try {
        let chunkIndex = 0;
        while (chunkIndex * CHUNK_SIZE < file.size) {
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min((chunkIndex + 1) * CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            const response = await fetch(`https://paste-backened.aquariushho.asia/upload?code=${code}&chunkIndex=${chunkIndex}&totalChunks=${Math.ceil(file.size / CHUNK_SIZE)}&filename=${encodeURIComponent(file.name)}&expiration=${expiration}`, {
                method: 'POST',
                body: chunk
            });

            if (!response.ok) {
                throw new Error(`上传分片 ${chunkIndex} 失败`);
            }

            chunkIndex++;
        }

        // 上传完成
        fileCodeDisplay.textContent = code;
        fileCodeCard.classList.remove('hidden');

    } catch (error) {
        alert(`文件上传失败: ${error.message}`);
    }
});


// 复制文件分享码
copyFileCodeButton.addEventListener('click', () => {
    const code = fileCodeDisplay.textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('分享码已复制到剪贴板');
    }).catch(err => {
        alert('复制分享码失败');
    });
});

// 下载文件
fetchFileButton.addEventListener('click', async () => {
    const code = fileCodeInput.value.trim();
    if (!code) {
        alert('请输入分享码');
        return;
    }

    try {
        // 获取文件信息
        const infoResponse = await fetch(`https://paste-backened.aquariushho.asia/info?code=${code}`);
        if (!infoResponse.ok) {
            throw new Error('获取文件信息失败');
        }
        const fileInfo = await infoResponse.json();

        // 下载所有分片
        const fileChunks = [];
        fileProgress.classList.remove('hidden');
        for (let i = 0; i < fileInfo.totalChunks; i++) {
            const response = await fetch(`https://paste-backened.aquariushho.asia/download?code=${code}&chunkIndex=${i}`);
            if (!response.ok) {
                throw new Error(`下载分片 ${i} 失败`);
            }
            fileChunks.push(await response.blob());

            // 更新进度条
            const progress = Math.round((i + 1) / fileInfo.totalChunks * 100);
            fileProgressBar.value = progress;
            fileProgressText.textContent = `${progress}%`;
        }

        // 合并分片并下载
        const file = new Blob(fileChunks);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = decodeURIComponent(fileInfo.filename);
        link.click();

        // 下载完成后隐藏进度条
        fileProgress.classList.add('hidden');

    } catch (error) {
        alert(`文件下载失败: ${error.message}`);
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
