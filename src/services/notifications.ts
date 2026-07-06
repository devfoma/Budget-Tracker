import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationChannelId } from '../constants';
import { colors } from '../theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function prepareDeviceNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(notificationChannelId, {
      name: 'Budget alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: colors.warning,
    });
  }

  const existingPermission = await Notifications.getPermissionsAsync();
  if (existingPermission.granted) {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();
  return requestedPermission.granted;
}

export async function scheduleBudgetAlertNotification({
  title,
  body,
  count,
}: {
  title: string;
  body: string;
  count: number;
}) {
  const canNotify = await prepareDeviceNotifications();
  if (!canNotify) {
    return;
  }

  await Notifications.setBadgeCountAsync(count);
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      badge: count,
      color: colors.warning,
      data: { screen: 'Dashboard', type: 'budget-alert' },
    },
    trigger: null,
  });
}
