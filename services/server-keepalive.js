// server-keepalive.js - Add this to your Node.js email server
// This keeps the Render.com server awake by pinging itself every 14 minutes

const cron = require('node-cron');
const axios = require('axios');

class ServerKeepAlive {
  constructor() {
    this.serverUrl = process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';
    this.enabled = process.env.NODE_ENV === 'production';
    this.stats = {
      totalPings: 0,
      successfulPings: 0,
      failedPings: 0,
      lastPingTime: null,
      startTime: new Date(),
    };
  }
  
  start() {
    if (!this.enabled) {
      console.log('🏠 Keep-alive disabled (not in production)');
      return;
    }
    
    console.log('🚀 Starting server keep-alive service');
    console.log(`📡 Will ping ${this.serverUrl}/health every 14 minutes`);
    
    // Schedule ping every 14 minutes (before 15-minute timeout)
    cron.schedule('*/14 * * * *', async () => {
      await this.performSelfPing();
    });
    
    // Initial ping after 5 seconds
    setTimeout(() => {
      this.performSelfPing();
    }, 5000);
  }
  
  async performSelfPing() {
    this.stats.totalPings++;
    this.stats.lastPingTime = new Date();
    
    console.log('🏥 Performing self-ping to stay awake...');
    
    try {
      const response = await axios.get(`${this.serverUrl}/health`, {
        timeout: 30000,
        headers: {
          'User-Agent': 'KeepAlive/1.0',
          'X-Keep-Alive': 'true',
        },
      });
      
      if (response.status === 200) {
        this.stats.successfulPings++;
        console.log('✅ Self-ping successful');
        console.log(`📊 Stats: ${this.stats.successfulPings}/${this.stats.totalPings} successful`);
      }
    } catch (error) {
      this.stats.failedPings++;
      console.log('❌ Self-ping failed:', error.message);
      console.log(`📊 Stats: ${this.stats.successfulPings}/${this.stats.totalPings} successful`);
    }
  }
  
  getStats() {
    const uptime = Date.now() - this.stats.startTime.getTime();
    return {
      ...this.stats,
      uptime: Math.floor(uptime / 1000), // seconds
      enabled: this.enabled,
      successRate: this.stats.totalPings > 0 
        ? ((this.stats.successfulPings / this.stats.totalPings) * 100).toFixed(1)
        : '0.0',
    };
  }
}

// Create singleton instance
const keepAlive = new ServerKeepAlive();

module.exports = { keepAlive };

// Auto-start if this file is run directly
if (require.main === module) {
  keepAlive.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down keep-alive service...');
    process.exit(0);
  });
}