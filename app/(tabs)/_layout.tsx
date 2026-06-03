import { Tabs } from "expo-router";

// 这里保留 Tabs 路由能力，但视觉上的底部栏由首页 FAB/页面跳转承担，所以隐藏原生 tabBar。
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "none",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
