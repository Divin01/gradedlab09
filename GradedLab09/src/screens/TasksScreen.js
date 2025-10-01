import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  FlatList, 
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { db } from '../services/firebase';
import {
  doc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { ProjectContext } from '../context/ProjectContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function TasksScreen() {
  const { selectedProject, setSelectedProject } = useContext(ProjectContext);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!selectedProject || !isFocused) return;

    const projectRef = doc(db, 'projects', selectedProject.id);
    setLoading(true);

    const unsub = onSnapshot(
      projectRef,
      snapshot => {
        setLoading(false);
        if (!snapshot.exists()) {
          // Project was deleted - navigate back to Projects
          Alert.alert(
            'Project Deleted',
            'The project you were viewing has been deleted.',
            [{ text: 'OK', onPress: () => navigation.navigate('Projects') }]
          );
          setSelectedProject(null);
          return;
        }
        
        const data = snapshot.data();
        setTasks(data.tasks || []);
      },
      error => {
        setLoading(false);
        console.error('Error fetching tasks:', error);
        Alert.alert('Error', 'Failed to load tasks');
      }
    );

    return () => unsub();
  }, [selectedProject, isFocused]);

  const addTask = async () => {
    if (!newTask.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    if (!selectedProject) {
      Alert.alert('Error', 'No project selected');
      return;
    }

    try {
      const projectRef = doc(db, 'projects', selectedProject.id);
      await updateDoc(projectRef, {
        tasks: arrayUnion({
          id: Date.now().toString(),
          name: newTask.trim(),
          createdAt: new Date().toISOString(),
        }),
      });
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const deleteTask = async (task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const projectRef = doc(db, 'projects', selectedProject.id);
              await updateDoc(projectRef, {
                tasks: arrayRemove(task),
              });
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  if (!selectedProject) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Select a project first.</Text>
        <Button 
          title="Go to Projects" 
          onPress={() => navigation.navigate('Projects')} 
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.projectName}>{selectedProject.name}</Text>
        <Text style={styles.taskCount}>{tasks.length} task(s)</Text>
      </View>

      <View style={styles.addTaskContainer}>
        <TextInput
          placeholder="Enter new task..."
          value={newTask}
          onChangeText={setNewTask}
          style={styles.textInput}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="list-outline" size={64} color="#CCCCCC" />
          <Text style={styles.messageText}>No tasks found for this project.</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <Text style={styles.taskName}>{item.name}</Text>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteTask(item)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
          style={styles.taskList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  projectName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskCount: {
    fontSize: 14,
    color: '#666',
  },
  addTaskContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  taskList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  taskName: {
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});