import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { API_BASE_URL } from "@/lib/api";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  // Function to register token with backend
  const registerTokenWithBackend = async (token: string) => {
    try {
      const deviceId = Constants.deviceId || Constants.sessionId;
      const platform = Platform.OS;

      const response = await fetch(`${API_BASE_URL}/push-notifications/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          deviceId,
          platform,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register token');
      }

      console.log('✅ Push token registered with backend:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to register push token with backend:', error);
      throw error;
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      async (token) => {
        setExpoPushToken(token ?? null);
        
        // Register token with backend
        if (token) {
          try {
            await registerTokenWithBackend(token);
          } catch (error) {
            console.error('Error registering token with backend:', error);
          }
        }
      },
      (error) => setError(error)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification Received: ", notification);
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "🔔 Notification Response: ",
          JSON.stringify(response, null, 2),
          JSON.stringify(response.notification.request.content.data, null, 2)
        );
        // Handle the notification response here
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};