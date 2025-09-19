import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import FloatingChat from '../components/FloatingChat'; // Asegúrate de la ruta correcta

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de Inicio</Text>
      
      <Button
        title="Ir a Perfil"
        onPress={() => navigation.navigate('Profile')}
      />
      <Button
        title="Ir a Configuración"
        onPress={() => navigation.navigate('Settings')}
      />
      <Button
        title="Ir a Loggear"
        onPress={() => navigation.navigate('Login')}
      />

      {/* Floating chat: siempre al final */}
      <FloatingChat visible={true} fullScreen={false} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default HomeScreen;
