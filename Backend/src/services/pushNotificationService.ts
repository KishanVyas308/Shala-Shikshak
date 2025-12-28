import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { prisma } from '../lib/prisma';

const expo = new Expo();

export class PushNotificationService {
  /**
   * Register a new push token
   */
  static async registerToken(token: string, deviceId?: string, platform: string = 'android') {
    try {
      // Validate token format
      if (!Expo.isExpoPushToken(token)) {
        throw new Error('Invalid Expo push token format');
      }

      // Upsert token (update if exists, create if not)
      const pushToken = await prisma.pushToken.upsert({
        where: { token },
        update: {
          isActive: true,
          platform,
          deviceId,
          updatedAt: new Date(),
        },
        create: {
          token,
          deviceId,
          platform,
          isActive: true,
        },
      });

      return pushToken;
    } catch (error) {
      console.error('Error registering push token:', error);
      throw error;
    }
  }

  /**
   * Deactivate a push token
   */
  static async deactivateToken(token: string) {
    try {
      await prisma.pushToken.update({
        where: { token },
        data: { isActive: false },
      });
    } catch (error) {
      console.error('Error deactivating push token:', error);
      throw error;
    }
  }

  /**
   * Send push notification to all active tokens
   */
  static async sendToAll(title: string, body: string, data?: any) {
    try {
      // Get all active tokens
      const pushTokens = await prisma.pushToken.findMany({
        where: { isActive: true },
        select: { token: true, id: true },
      });

      if (pushTokens.length === 0) {

        return { success: 0, failed: 0 };
      }

      // Create messages
      const messages: ExpoPushMessage[] = pushTokens.map(({ token }) => ({
        to: token,
        sound: 'default',
        title,
        body,
        data: data || {},
      }));

      // Send in chunks
      const chunks = expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];
      
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
        }
      }

      // Count successful and failed
      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const tokenId = pushTokens[i]?.id;

        if (ticket.status === 'error') {
          failedCount++;
          
          // If token is invalid, deactivate it
          if (
            ticket.details?.error === 'DeviceNotRegistered' ||
            ticket.details?.error === 'InvalidCredentials'
          ) {
            if (tokenId) {
              await prisma.pushToken.update({
                where: { id: tokenId },
                data: { isActive: false },
              });
            }
          }
          
          console.error('Push notification error:', ticket.message);
        } else {
          successCount++;
        }
      }


      return { success: successCount, failed: failedCount };
    } catch (error) {
      console.error('Error sending push notifications:', error);
      throw error;
    }
  }

  /**
   * Send notification when new content is added
   */
  static async sendNewContentNotification(
    standardName: string,
    subjectName: string,
    chapterName: string,
    resourceType: 'svadhyay' | 'svadhyay_pothi' | 'other',
    contentType: 'pdf' | 'video'
  ) {
    try {
      // Map resource types to Gujarati
      const resourceTypeGujarati: Record<string, string> = {
        svadhyay: 'સ્વાધ્યાય',
        svadhyay_pothi: 'સ્વાધ્યાય પોથી',
        other: 'અન્ય',
      };

      // Map content types to Gujarati
      const contentTypeGujarati: Record<string, string> = {
        pdf: 'PDF',
        video: 'વિડિયો',
      };

      const title = standardName;
      const body = `${subjectName} - ${chapterName} - ${resourceTypeGujarati[resourceType]} - ${contentTypeGujarati[contentType]} ${contentType === 'pdf' ? 'ઉમેરાઈ છે.' : 'ઉમેરાયો છે.'}`;

      const data = {
        type: 'new_content',
        resourceType,
        contentType,
        subjectName,
        chapterName,
      };

      return await this.sendToAll(title, body, data);
    } catch (error) {
      console.error('Error sending new content notification:', error);
      throw error;
    }
  }
}
