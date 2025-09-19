import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  KeyboardAvoidingView, Platform, Animated, Easing
} from 'react-native';
import ChatService from '../services/ChatService';

const FloatingChat = ({ visible = true, fullScreen = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const flatListRef = useRef();

  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    checkConnection();
  }, [visible]);

  const checkConnection = async () => {
    try {
      const health = await ChatService.checkHealth();
      setConnected(health.status === 'OK');
      if (health.status === 'OK') {
        addMessage('¡Hola! Soy tu asistente gamer. ¿En qué puedo ayudarte?', 'bot');
      }
    } catch (error) {
      setConnected(false);
    }
  };

  const addMessage = (text, sender) => {
    const newMessage = { id: Date.now().toString(), text, sender, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;
    const userMessage = inputText.trim();
    setInputText('');
    setLoading(true);
    addMessage(userMessage, 'user');

    try {
      const response = await ChatService.sendMessage(userMessage);
      addMessage(response.response, 'bot');
    } catch (error) {
      addMessage('Lo siento, hubo un error. Intenta de nuevo.', 'bot');
    }

    setLoading(false);
  };

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    Animated.timing(animation, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true, // usar transform evita scroll flash
    }).start();
  };

  if (!visible) return null;

  const scaleY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
      <Text style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.botText]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <>
      {!isOpen && (
        <TouchableOpacity style={styles.floatingButton} onPress={toggleChat}>
          <Text style={styles.floatingButtonText}>💬</Text>
        </TouchableOpacity>
      )}

      <Animated.View
        style={[
          styles.chatContainer,
          { transform: [{ scaleY }], height: fullScreen ? 600 : 500, width: fullScreen ? 360 : 350 }
        ]}
      >
        <KeyboardAvoidingView 
          style={styles.innerContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.chatHeader}>
            <Text style={styles.headerText}>Gaming Assistant</Text>
            <TouchableOpacity onPress={toggleChat}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.messagesList}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Pregunta sobre videojuegos..."
              placeholderTextColor="#9aa0a6"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              editable={!loading && connected}
            />
            <TouchableOpacity
              style={[styles.sendButton, { opacity: (!inputText.trim() || loading || !connected) ? 0.5 : 1 }]}
              onPress={sendMessage}
              disabled={!inputText.trim() || loading || !connected}
            >
              <Text style={styles.sendButtonText}>{loading ? '...' : 'Enviar'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: "#875ff5",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 6,
  },
  floatingButtonText: { color: '#fff', fontSize: 28 },
  chatContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(20,22,28,0.95)',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  innerContainer: { flex: 1 },
  chatHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'rgba(135,95,245,0.8)', 
    padding: 12 
  },
  headerText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  closeText: { color: '#fff', fontSize: 18 },
  messagesList: { flex: 1, paddingHorizontal: 8, paddingVertical: 6 },
  messageContainer: { marginVertical: 4, padding: 10, borderRadius: 20, maxWidth: '80%' },
  userMessage: { backgroundColor: 'rgba(137,197,244,0.2)', alignSelf: 'flex-end', borderTopRightRadius: 0 },
  botMessage: { backgroundColor: 'rgba(255,255,255,0.05)', alignSelf: 'flex-start', borderTopLeftRadius: 0, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  messageText: { fontSize: 16 },
  userText: { color: '#dbe6ee' },
  botText: { color: '#fff' },
  inputContainer: { flexDirection: 'row', padding: 8, backgroundColor: 'rgba(255,255,255,0.02)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.03)' },
  textInput: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 6, color: '#dbe6ee', fontSize: 14 },
  sendButton: { backgroundColor: '#875ff5', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { color: '#fff', fontWeight: '700' },
});

export default FloatingChat;
