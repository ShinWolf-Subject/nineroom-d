// Initialize Pusher with YOUR actual credentials
const pusher = new Pusher('eb678b79e8ee6857232c', {
    cluster: 'mt1',
    forceTLS: true
});

const channel = pusher.subscribe('chat-channel');

// Get DOM elements
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messagesList = document.getElementById('messages');
const usernameInput = document.getElementById('usernameInput');
const sendButton = document.querySelector('#messageForm button');

let username = '';

// SIMPLE FIX: Remove all disabled attributes on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - removing all disabled attributes');
    
    // Remove disabled attributes completely
    messageInput.removeAttribute('disabled');
    sendButton.removeAttribute('disabled');
    
    // Focus on username field
    usernameInput.focus();
    
    console.log('Inputs should now be enabled');
});

// Update UI when username is entered
usernameInput.addEventListener('input', function() {
    username = this.value.trim();
    
    if (username) {
        console.log('Username set to:', username);
        addSystemMessage(`Welcome, ${username}! You can now chat.`);
        messageInput.focus();
    }
});

// Handle message form submission
messageForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (message) {
        // If no username, use "Anonymous"
        const displayUsername = username || 'Anonymous';
        
        try {
            console.log('Sending message as:', displayUsername);
            
            // Show message immediately
            addMessage(displayUsername, message, new Date().toLocaleTimeString(), true);
            messageInput.value = '';
            
            // Send to server
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: displayUsername,
                    message: message
                })
            });
            
            if (!response.ok) {
                throw new Error('Server error: ' + response.status);
            }
            
            console.log('✅ Message sent successfully');
            
        } catch (error) {
            console.error('❌ Error sending message:', error);
            addSystemMessage('Failed to send message. Please check console.');
        }
    }
});

// Listen for new messages from Pusher
channel.bind('chat-message', function(data) {
    console.log('📨 Received message:', data);
    
    // Don't show our own messages twice
    const currentUsername = username || 'Anonymous';
    if (data.username !== currentUsername) {
        addMessage(data.username, data.message, data.timestamp, false);
    }
});

// Pusher connection events
pusher.connection.bind('connected', function() {
    console.log('✅ Connected to Pusher');
    addSystemMessage('Connected to chat! Start messaging.');
});

pusher.connection.bind('error', function(err) {
    console.error('❌ Pusher error:', err);
    addSystemMessage('Connection issue - trying to reconnect...');
});

// Add message to chat
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
    messagesList.parentElement.scrollTop = messagesList.parentElement.scrollHeight;
}

// Add system message
function addSystemMessage(text) {
    const li = document.createElement('li');
    li.className = 'system-message';
    li.textContent = text;
    messagesList.appendChild(li);
    messagesList.parentElement.scrollTop = messagesList.parentElement.scrollHeight;
}

// Force enable after 2 seconds as backup
setTimeout(() => {
    if (messageInput.disabled) {
        console.log('🔄 Backup: Force-enabling inputs');
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.placeholder = "Type your message here...";
    }
}, 2000);
