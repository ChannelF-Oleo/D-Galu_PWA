import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto del tema
const ThemeContext = createContext();

// Hook personalizado para usar el contexto del tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

// Proveedor del contexto del tema
export const ThemeProvider = ({ children }) => {
  // Estado del tema (light/dark)
  const [theme, setTheme] = useState(() => {
    // Intentar obtener el tema guardado del localStorage
    const savedTheme = localStorage.getItem('dgalu-theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Si no hay tema guardado, usar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Por defecto, tema claro
    return 'light';
  });

  // Función para alternar entre temas
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Función para establecer un tema específico
  const setSpecificTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  // Efecto para aplicar el tema al DOM y guardarlo en localStorage
  useEffect(() => {
    // Guardar en localStorage
    localStorage.setItem('dgalu-theme', theme);
    
    // Aplicar clase al elemento raíz para variables CSS globales
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }

    // Aplicar clase específica para el layout del admin
    const adminLayout = document.querySelector('.admin-layout');
    if (adminLayout) {
      if (theme === 'dark') {
        adminLayout.classList.add('dark-theme');
        adminLayout.classList.remove('light-theme');
      } else {
        adminLayout.classList.add('light-theme');
        adminLayout.classList.remove('dark-theme');
      }
    }
  }, [theme]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Solo cambiar automáticamente si no hay preferencia guardada
      const savedTheme = localStorage.getItem('dgalu-theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Valor del contexto
  const contextValue = {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;