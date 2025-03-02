const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatList = document.getElementById('chat-list');
const safetySettingsContainer = document.getElementById('safety-settings-container');
const toggleSafetySettingsButton = document.getElementById('toggle-safety-settings');
const saveSettingsButton = document.getElementById('save-settings');
const closeSafetySettingsButton = document.getElementById('close-safety-settings');
const hateSpeechSelect = document.getElementById('hate-speech');
const dangerousContentSelect = document.getElementById('dangerous-content');
const harassmentSelect = document.getElementById('harassment');
const sexuallyExplicitSelect = document.getElementById('sexually-explicit');
const deleteAllChatsButton = document.getElementById('delete-all-chats');
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');
const newPromptButton = document.getElementById('new-prompt-button');
const toggleSidebarButton = document.getElementById('toggle-sidebar');
const sidebar = document.querySelector('.sidebar');
const toggleInstructionButton = document.getElementById('toggle-instruction');
const systemInstructionContainer = document.querySelector('.system-instruction-container');
const systemInstructionInput = document.getElementById('system-instruction-input');
const saveSystemInstructionButton = document.getElementById('save-system-instruction');
const placeholder = document.getElementById('placeholder');

sidebar.classList.add('collapsed');
document.querySelector('.main-content').classList.add('sidebar-collapsed');

let currentChatId = null;
let uploadedFiles = [];

loadChats();
loadSafetySettings();
loadSystemInstruction();
loadPromptButtons();

sendButton.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = `${messageInput.scrollHeight}px`;
});

toggleSidebarButton.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('sidebar-collapsed');
});

toggleSafetySettingsButton.addEventListener('click', () => {
    safetySettingsContainer.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.querySelector('.main-content').classList.add('safety-open');
});

closeSafetySettingsButton.addEventListener('click', () => {
    safetySettingsContainer.classList.remove('open');
    document.body.style.overflow = '';
    document.querySelector('.main-content').classList.remove('safety-open');
});

saveSettingsButton.addEventListener('click', saveSafetySettings);

uploadButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', uploadFiles);

newPromptButton.addEventListener('click', async () => {
    currentChatId = null;
    const messages = chatMessages.querySelectorAll('.chat-message');
    messages.forEach(message => message.remove());

    await loadChats();
    checkMessagesAndTogglePlaceholder();
});

toggleInstructionButton.addEventListener('click', () => {
    systemInstructionContainer.classList.toggle('collapsed');
});

async function uploadFiles() {
    const files = fileInput.files;
    if (files.length === 0) return;

    const formData = new FormData();
    for (let file of files) {
        formData.append('files', file);
    }

    try {
        const response = await fetch('/upload', { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) {
            return alert(`Lỗi: ${data.error}`);
        }
        alert(data.message);
        fileInput.value = '';
        if (data.filenames) {
            uploadedFiles = uploadedFiles.concat(data.filenames);
            data.filenames.forEach(filename => displayMessage('model', [{text:`File đã tải lên: ${filename}`}]));
        }
    } catch (error) {
        console.error('Lỗi khi tải lên file:', error);
        alert('Có lỗi xảy ra khi tải lên file.');
    }
}

async function loadSafetySettings() {
    const response = await fetch('/get_safety_settings');
    const data = await response.json();

    hateSpeechSelect.value = data.HARM_CATEGORY_HATE_SPEECH || 'HARM_BLOCK_THRESHOLD_UNSPECIFIED';
    dangerousContentSelect.value = data.HARM_CATEGORY_DANGEROUS_CONTENT || 'HARM_BLOCK_THRESHOLD_UNSPECIFIED';
    harassmentSelect.value = data.HARM_CATEGORY_HARASSMENT || 'HARM_BLOCK_THRESHOLD_UNSPECIFIED';
    sexuallyExplicitSelect.value = data.HARM_CATEGORY_SEXUALLY_EXPLICIT || 'HARM_BLOCK_THRESHOLD_UNSPECIFIED';
}

async function saveSafetySettings() {
    const safetySettings = {
        "HARM_CATEGORY_HATE_SPEECH": hateSpeechSelect.value,
        "HARM_CATEGORY_DANGEROUS_CONTENT": dangerousContentSelect.value,
        "HARM_CATEGORY_HARASSMENT": harassmentSelect.value,
        "HARM_CATEGORY_SEXUALLY_EXPLICIT": sexuallyExplicitSelect.value
    };

    try {
        const response = await fetch('/save_safety_settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(safetySettings)
        });

        if (!response.ok) {
            return alert('Có lỗi xảy ra khi lưu cài đặt.');
        }

        alert('Đã lưu cài đặt!');
        safetySettingsContainer.classList.remove('open');
        document.body.style.overflow = '';
    } catch (error) {
        console.error('Lỗi khi lưu cài đặt:', error);
        alert('Có lỗi xảy ra khi lưu cài đặt.');
    }
}

async function handleSendMessage() {
    const message = messageInput.value;
    if (!message.trim()) return;

    displayMessage('user', [{text:message}]);
    messageInput.value = '';
    await getBotResponse(message, currentChatId);
}

async function getBotResponse(message, chatId) {
    const typingIndicator = displayTypingIndicator();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message, chat_id: chatId, uploaded_filenames: uploadedFiles })
        });

        const data = await response.json();
        removeTypingIndicator(typingIndicator);
        if (!response.ok) {
            return displayMessage('model', [{text:`Lỗi: ${data.error || 'Có lỗi xảy ra khi kết nối với máy chủ.'}`}] );
        }

        if (data.response) {
            displayMessage('model', [{text:data.response}]);
        }
        if (data.file_responses) {
            data.file_responses.forEach(file_response => {
                displayMessage('model', [{text:`Phản hồi cho file ${file_response.filename}: ${file_response.response}`}]);
            });
        }

        if (!currentChatId) currentChatId = data.chat_id;
        loadChats();
        uploadedFiles = [];
        checkMessagesAndTogglePlaceholder();
    } catch (error) {
        console.error('Lỗi khi lấy phản hồi từ bot:', error);
        removeTypingIndicator(typingIndicator);
        displayMessage('model', [{text:'Có lỗi xảy ra khi kết nối với máy chủ.'}]);
        checkMessagesAndTogglePlaceholder();
    }
}

marked.setOptions({
    highlight: function (code, lang) {
        const validLanguage = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language: validLanguage }).value;
    },
    breaks: true // Thêm tùy chọn breaks: true
});
U

function displayMessage(role, messageParts) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', `${role}-message`);
    messageElement.style.animation = 'none';
    messageElement.offsetHeight;
    messageElement.style.animation = null;

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');

    const messageText = document.createElement('div');
    messageText.classList.add('message-text');

    // Xử lý tin nhắn dựa theo định dạng mới
    let messageHtml = '';
    messageParts.forEach(part => {
        if (part.text) {
            if (role === 'user'){
                messageHtml += part.text;
            } else {
                messageHtml += marked.parse(part.text);
            }
        } else if (part.code) {
            messageHtml += part.code;
        }
    });

    messageText.innerHTML = messageHtml;


    // Move messageOptions outside of messageText
    const messageOptions = document.createElement('div');
    messageOptions.classList.add('message-options');
    messageOptions.innerHTML = `
        <button class="rerun-button hidden"><i class="fas fa-star"></i></button>
        <button class="more-options-button"><i class="fas fa-ellipsis-v"></i></button>
    `;

    messageContent.appendChild(messageText);
    messageContent.appendChild(messageOptions); // Append options after messageText

    // Process code blocks and copy buttons
    const codeBlocks = messageText.querySelectorAll('pre > code');
    codeBlocks.forEach((codeBlock, index) => {
        const pre = codeBlock.parentNode;

        // Lưu trữ nội dung code block nguyên bản vào thuộc tính data-original-code
        pre.setAttribute('data-original-code', codeBlock.innerHTML);

        const codeContainer = document.createElement('div');
        codeContainer.classList.add('code-container');

        pre.parentNode.insertBefore(codeContainer, pre);
        codeContainer.appendChild(pre);

        hljs.lineNumbersBlock(codeBlock);

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.classList.add('copy-button');
        copyButton.setAttribute('data-clipboard-target', `#code-${index}`);
        codeBlock.parentNode.id = `code-${index}`;
        codeContainer.appendChild(copyButton);

        // Highlight code block
        hljs.highlightElement(codeBlock);

        // Thêm codeContainer vào messageText
        messageText.appendChild(codeContainer);
    });

    // Initialize ClipboardJS after code blocks are processed
    const clipboard = new ClipboardJS('.copy-button');

    clipboard.on('success', (e) => {
        const triggerButton = e.trigger;
        triggerButton.textContent = 'Copied!';
        triggerButton.classList.add('copied');
        setTimeout(() => {
            triggerButton.textContent = 'Copy';
            triggerButton.classList.remove('copied');
        }, 2000);
        e.clearSelection();
    });

    clipboard.on('error', (e) => {
        console.error('Action:', e.action);
        console.error('Trigger:', e.trigger);
        alert('Lỗi: Không thể copy vào clipboard!');
    });

    messageElement.appendChild(messageContent);
    chatMessages.insertBefore(messageElement, placeholder);
    scrollToBottom();
    checkMessagesAndTogglePlaceholder();
}


function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function loadChats() {
    try {
        const response = await fetch('/get_chats');
        const chats = await response.json();

        chatList.innerHTML = '';
        chats.forEach(chat => {
            const listItem = document.createElement('li');
            listItem.innerHTML = '<i class="fas fa-comment-dots chat-list-icon"></i>';
            listItem.append(chat.last_message.length > 25 ? chat.last_message.substring(0, 25) + "..." : chat.last_message);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.classList.add('delete-chat-button');
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteChat(chat.chat_id);
            });

            listItem.appendChild(deleteButton);
            listItem.addEventListener('click', () => {
                loadChatHistory(chat.chat_id);
                currentChatId = chat.chat_id;
            });
            chatList.appendChild(listItem);
        });
        checkMessagesAndTogglePlaceholder();
    } catch (error) {
        console.error('Lỗi khi tải danh sách chat:', error);
        alert('Có lỗi xảy ra khi tải danh sách chat.');
    }
}

async function loadChatHistory(chatId) {
    try {
        const response = await fetch(`/get_chat_history?chat_id=${chatId}`);
         if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
         }
        const history = await response.json();

        const messages = chatMessages.querySelectorAll('.chat-message');
        messages.forEach(message => message.remove());

        history.forEach(message => {
            // Truyền trực tiếp mảng parts cho displayMessage
            displayMessage(message.role, message.parts);
        });
        checkMessagesAndTogglePlaceholder();
    } catch (error) {
        console.error('Lỗi khi tải lịch sử chat:', error);
        alert('Có lỗi xảy ra khi tải lịch sử chat.');
    }
}

async function deleteChat(chatId) {
    if (!confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này?')) return;
    try {
        const response = await fetch('/delete_chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId })
        });

        if (!response.ok) {
            return alert('Có lỗi xảy ra khi xóa cuộc trò chuyện.');
        }

        await loadChats();
        if (currentChatId === chatId) {
            const messages = chatMessages.querySelectorAll('.chat-message');
            messages.forEach(message => message.remove());
            currentChatId = null;
            checkMessagesAndTogglePlaceholder();
        }
    } catch (error) {
        console.error('Lỗi khi xóa chat:', error);
        alert('Có lỗi xảy ra khi xóa cuộc trò chuyện.');
    }
}

deleteAllChatsButton.addEventListener('click', async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa tất cả cuộc trò chuyện?')) return;

    try {
        const response = await fetch('/delete_all_chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            return alert('Có lỗi xảy ra khi xóa tất cả cuộc trò chuyện.');
        }
        await loadChats();
        const messages = chatMessages.querySelectorAll('.chat-message');
        messages.forEach(message => message.remove());
        currentChatId = null;
        checkMessagesAndTogglePlaceholder()
    } catch (error) {
        console.error('Lỗi khi xóa tất cả chat:', error);
        alert('Có lỗi xảy ra khi xóa tất cả cuộc trò chuyện.');
    }
});

function displayTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.classList.add('chat-message', 'model-message', 'typing-indicator');
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

    typingElement.appendChild(messageContent);
    chatMessages.insertBefore(typingElement, placeholder);
    scrollToBottom();
    return typingElement;
}

function removeTypingIndicator(typingElement) {
    if (typingElement) {
        typingElement.remove();
    }
}

async function loadSystemInstruction() {
    try {
        const response = await fetch('/get_system_instruction');
        const data = await response.json();
        systemInstructionInput.value = data.system_instruction || '';
    } catch (error) {
        console.error('Lỗi khi tải system instruction:', error);
        systemInstructionInput.value = "Bạn là Rin";
    }
}

async function saveSystemInstruction() {
    const newInstruction = systemInstructionInput.value;
    try {
        const response = await fetch('/save_system_instruction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ system_instruction: newInstruction })
        });

        if (!response.ok) {
            return alert('Có lỗi xảy ra khi lưu system instruction.');
        }

        alert('Đã lưu system instruction!');

    } catch (error) {
        console.error('Lỗi khi lưu system instruction:', error);
        alert('Có lỗi xảy ra khi lưu system instruction.');
    }
}

saveSystemInstructionButton.addEventListener('click', saveSystemInstruction);

async function loadPromptButtons() {
    const promptButtonsContainer = document.getElementById('prompt-buttons');
    promptButtonsContainer.innerHTML = '';

    try {
        const response = await fetch('/get_random_prompts');
        const prompts = await response.json();

        prompts.forEach(promptData => {
            const button = document.createElement('button');
            button.classList.add('prompt-button');
            button.dataset.prompt = promptData.prompt;

            const icon = document.createElement('i');
            icon.classList.add('fas', promptData.icon);
            button.appendChild(icon);

            button.append(promptData.prompt);

            button.addEventListener('click', () => {
                messageInput.value = promptData.prompt;
                messageInput.focus();
            });

            promptButtonsContainer.appendChild(button);
        });
    } catch (error) {
        console.error('Lỗi khi tải prompt mẫu:', error);
    }
}

function checkMessagesAndTogglePlaceholder() {
    if (!placeholder) return;

    const hasMessages = chatMessages.querySelector('.chat-message');

    if (hasMessages) {
        placeholder.style.display = 'none';
    } else {
        placeholder.style.display = 'flex';
    }
}