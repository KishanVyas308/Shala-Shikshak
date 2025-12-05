import express from 'express';
import { PushNotificationService } from '../services/pushNotificationService';

const router = express.Router();

// Register push token
router.post('/register', async (req, res) => {
  try {
    const { token, deviceId, platform } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Push token is required' });
    }

    const pushToken = await PushNotificationService.registerToken(
      token,
      deviceId,
      platform || 'android'
    );

    res.json({ success: true, data: pushToken });
  } catch (error: any) {
    console.error('Register push token error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Deactivate push token
router.post('/deactivate', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Push token is required' });
    }

    await PushNotificationService.deactivateToken(token);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Deactivate push token error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
