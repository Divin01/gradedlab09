import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ProjectsScreen from './src/screens/ProjectsScreen';
import TasksScreen from './src/screens/TasksScreen';
import { ProjectProvider } from './src/context/ProjectContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TasksStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Tasks" 
      component={TasksScreen}
      options={{ title: 'Project Tasks' }}
    />
  </Stack.Navigator>
);

export default function App() {
  return (
    <ProjectProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Projects') {
                iconName = focused ? 'folder' : 'folder-outline';
              } else if (route.name === 'Tasks') {
                iconName = focused ? 'list' : 'list-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen 
            name="Projects" 
            component={ProjectsScreen}
            options={{ title: 'My Projects' }}
          />
          <Tab.Screen 
            name="Tasks" 
            component={TasksStack}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ProjectProvider>
  );
}