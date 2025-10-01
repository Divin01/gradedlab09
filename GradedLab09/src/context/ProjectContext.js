import React, { createContext, useState } from 'react';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  
  const clearSelectedProject = () => {
    setSelectedProject(null);
  };

  return (
    <ProjectContext.Provider value={{ 
      selectedProject, 
      setSelectedProject,
      clearSelectedProject 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};