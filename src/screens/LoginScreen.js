// src/screens/LoginScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar
} from 'react-native';
import { globalStyles, colors, typography } from '../styles/global';
import { loginUser, onAuthStateChanged } from '../services/authService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; // 👈 Adicionado Ionicons

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Verificar se usuário já está logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        console.log("Usuário logado: " + (user.email || 'UID: ' + user.id));
        navigation.replace('Home');
      }
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    
    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        // A navegação será tratada pelo onAuthStateChanged para evitar duplicidade
        console.log('Login bem-sucedido via service');
        console.log("resultado do login: " + result)
      } else {
        setLoading(false);
        Alert.alert('Falha no Acesso', result.error);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Erro', 'Ocorreu um erro inesperado ao fazer login');
    }
  };

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 15, color: colors.secondary, fontFamily: 'Manrope_600SemiBold' }}>Verificando acesso...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Branding Section (Hero) */}
        <LinearGradient
          colors={[colors.primary, colors.primaryVariant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Ionicons name="cube" size={24} color={colors.primary} />
              </View>
              <Text style={styles.logoText}>Almoxarifado Pro</Text>
            </View>
            
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Almoxarifado{"\n"}Inteligente.</Text>
              <Text style={styles.heroSubtitle}>
                Controle total do seu estoque e logística em tempo real, com a precisão que sua operação exige.
              </Text>
            </View>
          </View>
          
        </LinearGradient>

        {/* Login Form Section */}
        <View style={styles.formSection}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Bem-vindo de volta</Text>
            <Text style={styles.formSubtitle}>Acesse sua conta para gerenciar seu estoque.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-MAIL CORPORATIVO</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.secondary} style={{ marginRight: 12 }} />
              <TextInput
                style={styles.input}
                placeholder="exemplo@empresa.com.br"
                placeholderTextColor={colors.secondary + '80'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>SENHA</Text>
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.secondary} style={{ marginRight: 12 }} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.secondary + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={22} 
                  color={colors.secondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && { opacity: 0.8 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Acessar Painel</Text>
                <Text style={{ color: colors.onPrimary, fontSize: 18, marginLeft: 8 }}>→</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Novo na plataforma? <Text style={styles.footerLink}>Solicite acesso ao seu gerente</Text>
            </Text>
            
            <View style={styles.footerLinksRow}>
              <Text style={styles.footerSubLink}>SEGURANÇA</Text>
              <Text style={styles.footerSubLink}>TERMOS</Text>
              <Text style={styles.footerSubLink}>SUPORTE</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    padding: 32,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    minHeight: 340,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroContent: {
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    ...typography.headline,
    fontSize: 22,
    color: '#ffffff',
  },
  heroTextContainer: {
    marginBottom: 32,
  },
  heroTitle: {
    ...typography.headline,
    fontSize: 42,
    color: '#ffffff',
    lineHeight: 46,
    marginBottom: 16,
  },
  heroSubtitle: {
    ...typography.body,
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    maxWidth: 280,
    lineHeight: 22,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  trustText: {
    ...typography.label,
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
  },
  decoCircle1: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decoCircle2: {
    position: 'absolute',
    top: '20%',
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  formSection: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 32,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  formHeader: {
    marginBottom: 32,
  },
  formTitle: {
    ...typography.title,
    fontSize: 28,
    color: colors.onSurface,
    marginBottom: 8,
  },
  formSubtitle: {
    ...typography.body,
    color: colors.secondary,
    fontSize: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    ...typography.label,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginLeft: 4,
  },
  forgotPassword: {
    ...typography.label,
    fontSize: 11,
    color: colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    ...typography.body,
    fontSize: 16,
    color: colors.onSurface,
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 60,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonText: {
    ...typography.title,
    fontSize: 18,
    color: colors.onPrimary,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    fontSize: 14,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  footerLink: {
    color: colors.primary,
    fontFamily: 'Manrope_700Bold',
  },
  footerLinksRow: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    width: '100%',
    justifyContent: 'center',
  },
  footerSubLink: {
    ...typography.label,
    fontSize: 10,
    color: colors.gray,
  }
});

export default LoginScreen;
