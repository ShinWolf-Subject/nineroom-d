// Initialize Pusher
const pusher = new Pusher(process.env.PUSHER_KEY || 'eb678b79e8ee6857232c', {
    cluster: process.env.PUSHER_CLUSTER || 'mt1',
    forceTLS: true
});

const channel = pusher.subscribe('chat-channel');

// Get DOM elements
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messagesList = document.getElementById('messages');
const usernameInput = document.getElementById('usernameInput');
const typingIndicator = document.getElementById('typing-indicator');

let username = '';
let typingTimer;

// Set username and enable chat
usernameInput.addEventListener('change', function() {
    username = this.value.trim();
    if (username) {
        messageInput.disabled = false;
        messageForm.querySelector('button').disabled = false;
        messageInput.focus();
        addSystemMessage(`Welcome, ${username}! Start chatting.`);
    }
});

// Handle message form submission
messageForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (message && username) {
        // Send message to our API route
        try {
            await fetch('/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    message: message
                })
            });
            
            // Add message locally immediately for better UX
            addMessage(username, message, new Date().toLocaleTimeString(), true);
            
            // Clear input
            messageInput.value = '';
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
});

// Listen for new messages
channel.bind('chat-message', function(data) {
    // Don't show our own messages twice (they're already shown locally)
    if (data.username !== username) {
        addMessage(data.username, data.message, data.timestamp, false);
    }
});

// Add a message to the chat
function addMessage(sender, text, timestamp, isOwn = false) {
    const li = document.createElement('li');
    li.className = 'message';
    
    if (isOwn) {
        li.classList.add('own-message');
        sender = 'You';
    }
    
    li.innerHTML = `
        <div class="message-header">
            <strong>${sender}</strong>
            <span>${timestamp}</span>
        </div>
        <div class="message-text">${text}</div>
    `;
    
    messagesList.appendChild(li);
    
    // Scroll to bottom
    messagesList.parentElement.scrollTop = messagesList.parentElement.scrollHeight;
}

// Add system messages
function addSystemMessage(text) {
    const li = document.createElement('li');
    li.className = 'system-message';
    li.textContent = text;
    messagesList.appendChild(li);
    
    // Scroll to bottom
    messagesList.parentElement.scrollTop = messagesList.parentElement.scrollHeight;
}
