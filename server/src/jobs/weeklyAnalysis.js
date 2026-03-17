const cron = require('node-cron');
const { runWeeklyAnalysis } = require('../routes/admin');

// Run every Sunday at 2:00 AM IST (UTC+5:30 => 20:30 UTC Saturday)
const startWeeklyJob = () => {
  cron.schedule('30 20 * * 6', async () => {
    console.log('[Cron] Starting weekly AI analysis...');
    try {
      await runWeeklyAnalysis();
      console.log('[Cron] Weekly AI analysis completed.');
    } catch (err) {
      console.error('[Cron] Weekly AI analysis failed:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log('[Cron] Weekly analysis job scheduled (every Sunday 2:00 AM IST)');
};

module.exports = { startWeeklyJob };
