import React, { useEffect, useState, useContext } from 'react';
import { 
  FlatList, 
  Text, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { db } from '../services/firebase.js';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { ProjectContext } from '../context/ProjectContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setSelectedProject, selectedProject } = useContext(ProjectContext);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'projects'),
      snapshot => {
        setLoading(false);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(data);
      },
      error => {
        setLoading(false);
        console.error('Error fetching projects:', error);
        Alert.alert('Error', 'Failed to load projects');
      }
    );
    
    return () => unsub();
  }, []);

  const createNewProject = async () => {
    try {
      await addDoc(collection(db, 'projects'), {
        name: `New Project ${projects.length + 1}`,
        tasks: [],
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project');
    }
  };

  const handleProjectPress = (project) => {
    setSelectedProject(project);
    navigation.navigate('Tasks');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={createNewProject}>
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add New Project</Text>
      </TouchableOpacity>

      {projects.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="folder-outline" size={64} color="#CCCCCC" />
          <Text style={styles.messageText}>No projects found.</Text>
          <Text style={styles.subMessageText}>Create your first project to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleProjectPress(item)}
              style={[
                styles.projectItem,
                selectedProject?.id === item.id && styles.selectedProject
              ]}
            >
              <View style={styles.projectContent}>
                <Text style={styles.projectName}>{item.name}</Text>
                <Text style={styles.taskCount}>
                  {item.tasks?.length || 0} task(s)
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          )}
          style={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  list: {
    flex: 1,
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedProject: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  projectContent: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskCount: {
    fontSize: 14,
    color: '#666',
  },
  messageText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  subMessageText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});