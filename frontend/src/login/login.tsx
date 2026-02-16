import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// API Configuration
const API_BASE_URL = 'http://10.0.2.2:8080/api/auth'; // Change this to your actual backend URL
// For Android emulator use: http://10.0.2.2:8080/api/auth
// For iOS simulator use: http://localhost:8080/api/auth
// For physical device use: http://<YOUR_IP>:8080/api/auth

interface LoginScreenProps {
  navigation?: any; // Add navigation prop if using React Navigation
  onLoginScreen?: (token: string, email: string) => void;
}

interface LoginResponse {
  token: string | null;
  email: string | null;
  message: string;
  success: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);

  const validateEmail = (email: string): boolean => {
    // Check if email ends with .edu
    return email.toLowerCase().endsWith('.edu.in');
  };

  const handleAuth = async (): Promise<void> => {
    // Validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Only .edu email addresses are allowed');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLoginMode ? '/login' : '/register';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (data.success === true) {
        if (isLoginMode) {
          // Save token to AsyncStorage
          if (data.token) {
            await AsyncStorage.setItem('authToken', data.token);
            await AsyncStorage.setItem('userEmail', data.email || '');
          }

          Alert.alert('Success', data.message, [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to home screen
                // navigation.navigate('Home');
                console.log('Login successful, token:', data.token);
              },
            },
          ]);
        } else {
          // Registration successful
          Alert.alert('Success', data.message, [
            {
              text: 'OK',
              onPress: () => setIsLoginMode(true),
            },
          ]);
        }
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert(
        'Connection Error',
        'Could not connect to the server. Please make sure the backend is running.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = (): void => {
    if (!password) {
      // If no password entered, this is the first step - just validate email
      if (!email) {
        Alert.alert('Error', 'Please enter your email');
        return;
      }
      if (!validateEmail(email)) {
        Alert.alert('Error', 'Only .edu email addresses are allowed');
        return;
      }
      // Email is valid, user can now enter password
      // You might want to show password field here or navigate to next screen
    } else {
      // Both email and password are entered, proceed with auth
      handleAuth();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background with gradient mesh effect */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.gradientCircle, styles.circle1]} />
        <View style={[styles.gradientCircle, styles.circle2]} />
        <View style={[styles.gradientCircle, styles.circle3]} />
        <View style={[styles.gradientCircle, styles.circle4]} />
        <View style={[styles.gradientCircle, styles.circle5]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>
              Connect{'\n'}
              <Text style={styles.headerBold}>Privately.</Text>
            </Text>
            <Text style={styles.subHeaderText}>
              {isLoginMode
                ? 'Enter your campus email to login.'
                : 'Create your account with campus email.'}
            </Text>
          </View>

          {/* Spacer to push card to bottom */}
          <View style={styles.spacer} />

          {/* Glass Card */}
          <View style={styles.glassCard}>
            <View style={styles.cardContent}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="University Email"
                  placeholderTextColor="rgba(100, 116, 139, 0.5)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                />

                {/* Password Input */}
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(100, 116, 139, 0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />

                <Text style={styles.exclusiveText}>
                  EXCLUSIVE TO .EDU DOMAINS
                </Text>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                activeOpacity={0.8}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#1e293b', '#0f172a']}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {isLoginMode ? 'Login' : 'Register'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Toggle Login/Register */}
              <TouchableOpacity
                onPress={() => setIsLoginMode(!isLoginMode)}
                disabled={loading}
              >
                <Text style={styles.toggleText}>
                  {isLoginMode
                    ? "Don't have an account? Register"
                    : 'Already have an account? Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.shieldContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.shieldIcon}>🛡️</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.footerText}>
              Access is restricted to verified students and faculty members.
            </Text>

            <View style={styles.linksContainer}>
              <TouchableOpacity>
                <Text style={styles.linkText}>Privacy</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.linkText}>Terms</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backgroundContainer: {
    position: 'absolute',
    width: width,
    height: height,
    overflow: 'hidden',
  },
  gradientCircle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.6,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(224, 231, 255, 1)',
    top: '10%',
    left: '5%',
  },
  circle2: {
    width: 280,
    height: 280,
    backgroundColor: 'rgba(255, 237, 213, 1)',
    top: '5%',
    right: '5%',
  },
  circle3: {
    width: 320,
    height: 320,
    backgroundColor: 'rgba(245, 243, 255, 1)',
    top: '40%',
    left: '25%',
  },
  circle4: {
    width: 260,
    height: 260,
    backgroundColor: 'rgba(254, 226, 226, 1)',
    bottom: '5%',
    right: '10%',
  },
  circle5: {
    width: 240,
    height: 240,
    backgroundColor: 'rgba(236, 252, 247, 1)',
    bottom: '15%',
    left: '5%',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 48,
  },
  headerText: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '300',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  headerBold: {
    fontWeight: '700',
    color: '#0f172a',
  },
  subHeaderText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '300',
    color: '#64748b',
    maxWidth: 280,
    lineHeight: 26,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  glassCard: {
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.6)', // translucent white
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 12,
  },
  cardContent: {
    padding: 32,
    gap: 24,
  },
  inputContainer: {
    gap: 16,
  },
  input: {
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 24,
    fontSize: 18,
    color: '#1e293b',
    borderWidth: 0,
  },
  exclusiveText: {
    fontSize: 12,
    color: 'rgba(148, 163, 184, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  continueButton: {
    height: 64,
    borderRadius: 9999,
    overflow: 'hidden',
    shadowColor: '#195de6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  toggleText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
    gap: 24,
  },
  shieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    width: 32,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  shieldIcon: {
    fontSize: 20,
    opacity: 0.3,
  },
  footerText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 280,
  },
  linksContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  linkText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
    textDecorationColor: '#e2e8f0',
  },
});

export default LoginScreen;
