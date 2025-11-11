const Pusher = require('pusher');

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER || 'mt1',  // Make sure this is 'mt1'
  useTLS: true
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { username, message } = req.body;
      
      console.log('Sending message via Pusher:', { username, message });
      
      await pusher.trigger('chat-channel', 'chat-message', {
        username: username || 'Anonymous',
        message,
        timestamp: new Date().toLocaleTimeString()
      });
      
      console.log('✅ Message broadcast via Pusher');
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Pusher error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
