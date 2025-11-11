// Initialize Pusher
const pusher = new Pusher('eb678b79e8ee6857232c', {
    cluster: 'mt1', // Change to your actual cluster
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
let isConnected = false;

// Enable chat when username is entered
usernameInput.addEventListener('input', function() {
    username = this.value.trim();
    const hasUsername = username.length > 0;
    
    messageInput.disabled = !hasUsername;
    messageForm.querySelector('button').disabled = !hasUsername;
    
    if (hasUsername && !isConnected) {
        isConnected = true;
        addSystemMessage(`Welcome, ${username}! Start chatting.`);
        messageInput.focus();
    }
});

// Handle message form submission
messageForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (message && username) {
        try {
            // Show message immediately for better UX
            addMessage(username, message, new Date().toLocaleTimeString(), true);
            
            // Clear input
            messageInput.value = '';
            
            // Send to server
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    message: message
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            
            console.log('Message sent successfully');
            
        } catch (error) {
            console.error('Error sending message:', error);
            addSystemMessage('Failed to send message. Please check connection.');
        }
    }
});

// Listen for new messages from other users
channel.bind('chat-message', function(data) {
    console.log('Received message:', data);
    // Only add message if it's from another user
    if (data.username !== username) {
        addMessage(data.username, data.message, data.timestamp, false);
    }
});

// Connection events for debugging
pusher.connection.bind('connected', function() {
    console.log('Pusher connected successfully');
    addSystemMessage('Connected to chat!');
});

pusher.connection.bind('error', function(err) {
    console.error('Pusher connection error:', err);
    addSystemMessage('Connection error. Please refresh.');
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
    
    messagesList.parentElement.scrollTop = messagesList.parentElement.scrollHeight;
}

// Debug info
console.log('Chat client loaded');
console.log('Pusher instance:', pusher);    li.className = 'system-message';
    li.textContent = text;
    messagesList.appendChild(li);
    
    // Scroll to bottom
    messagesList.parentElement.scrollTop = messagesList.parentElement.scrollHeight;
}
