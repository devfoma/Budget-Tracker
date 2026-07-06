import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { BarChart3, LayoutDashboard, PiggyBank, Plus, ReceiptText } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../styles';
import { colors } from '../theme';
import type { RootTabParamList } from '../types';
import { ActivityScreen, AddScreen, BudgetsScreen, DashboardScreen, ReportsScreen } from '../screens';
import { hapticTap } from '../utils/haptics';

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabIcon({
  route,
  focused,
}: {
  route: RouteProp<RootTabParamList, keyof RootTabParamList>;
  focused: boolean;
}) {
  const iconColor = focused ? colors.primary : '#d7dfeb';
  const iconSize = route.name === 'Add' ? 26 : 22;
  switch (route.name) {
    case 'Dashboard':
      return <LayoutDashboard color={iconColor} size={iconSize} />;
    case 'Activity':
      return <ReceiptText color={iconColor} size={iconSize} />;
    case 'Add':
      return <Plus color="#06251a" size={iconSize} />;
    case 'Budgets':
      return <PiggyBank color={iconColor} size={iconSize} />;
    case 'Reports':
      return <BarChart3 color={iconColor} size={iconSize} />;
    default:
      return <LayoutDashboard color={iconColor} size={iconSize} />;
  }
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: route.name === 'Add' ? styles.addTabItem : styles.tabItem,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#d7dfeb',
        tabBarIconStyle: styles.tabBarIconSlot,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => (
          <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive, route.name === 'Add' && styles.addIconWrap]}>
            <TabIcon route={route} focused={focused} />
          </View>
        ),
      })}
      screenListeners={{
        tabPress: () => hapticTap(),
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Add" component={AddScreen} />
      <Tab.Screen name="Budgets" component={BudgetsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
}
