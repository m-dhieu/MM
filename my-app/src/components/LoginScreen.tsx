import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    Switch,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
// @ts-ignore
import styles from "./LoginScreen.styles"; // import the separate styles
import AsyncStorage from '@react-native-async-storage/async-storage';

// @ts-ignore
export default function LoginScreen({ navigation }) {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({ phone: '', password: '' });

    useEffect(() => {
        (async () => {
            try {
                const rememberedPhone = await AsyncStorage.getItem('momopress_remembered_phone');
                if (rememberedPhone) {
                    setPhone(rememberedPhone);
                    setRememberMe(true);
                }
            } catch {}
        })();
    }, []);

    // @ts-ignore
    const validateRwandanPhone = (input) => {
        const cleanPhone = input.replace(/[\s\-(\)]/g, '');
        const rwandaRegex = /^(\+?250|0)?(78|79)\d{7}$/;
        return rwandaRegex.test(cleanPhone);
    };

    // @ts-ignore
    const normalizePhone = (input) => {
        const cleanPhone = input.replace(/[\s\-(\)]/g, '');
        if (cleanPhone.startsWith('+250')) return cleanPhone;
        if (cleanPhone.startsWith('250')) return '+' + cleanPhone;
        if (cleanPhone.startsWith('0')) return '+250' + cleanPhone.substring(1);
        return '+250' + cleanPhone;
    };

    const handleSubmit = async () => {
        setErrors({ phone: '', password: '' });
        let valid = true;
        if (!validateRwandanPhone(phone)) {
            setErrors((e) => ({ ...e, phone: 'Please enter a valid Rwandan MTN number (078/079...)' }));
            valid = false;
        }

        if (!password.length) {
            setErrors((e) => ({ ...e, password: 'Password is required' }));
            valid = false;
        }

        if (!valid) return;

        const normalizedPhone = normalizePhone(phone);

        try {
            const usersJSON = await AsyncStorage.getItem('momopress_users');
            const users = usersJSON ? JSON.parse(usersJSON) : [];
            const user = users.find((u: { phone: any; }) => u.phone === normalizedPhone);

            if (!user) {
                setErrors((e) => ({ ...e, phone: 'Account not found. Please sign up.' }));
                return;
            }

            if (user.password !== password) {
                setErrors((e) => ({ ...e, password: 'Incorrect password' }));
                return;
            }

            if (rememberMe) {
                await AsyncStorage.setItem('momopress_remembered_phone', normalizedPhone);
            } else {
                await AsyncStorage.removeItem('momopress_remembered_phone');
            }

            await AsyncStorage.setItem(
                'momopress_current_user',
                JSON.stringify({
                    fullName: user.fullName,
                    phone: user.phone,
                    loginTime: new Date().toISOString(),
                })
            );

            Alert.alert('Login successful!');
            navigation.navigate('Personalize');
        } catch (_) {
            Alert.alert('Error', 'An error occurred during login');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>MoMo</Text>
                        <Text style={styles.logoText2}> Press</Text>
                    </View>
                    <Text style={styles.welcomeTitle}>Welcome Back</Text>
                    <Text style={styles.welcomeSubtitle}>Sign in to manage your MoMo finances</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Phone Number</Text>
                    <TextInput
                        style={[styles.formInput, errors.phone ? styles.inputError : null]}
                        placeholder="+250 78X XXX XXX"
                        placeholderTextColor="#6b7280"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />
                    {errors.phone.length > 0 && <Text style={styles.errorMessage}>{errors.phone}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Password</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={[styles.formInput, errors.password ? styles.inputError : null, { flex: 1 }]}
                            placeholder="Enter your password"
                            placeholderTextColor="#6b7280"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.passwordToggle}
                            accessibilityLabel="Toggle password visibility"
                        >
                            <Icon name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>
                    {errors.password.length > 0 && <Text style={styles.errorMessage}>{errors.password}</Text>}
                </View>

                <View style={styles.rememberForgot}>
                    <View style={styles.rememberMe}>
                        <Switch
                            value={rememberMe}
                            onValueChange={setRememberMe}
                            thumbColor={rememberMe ? '#FFC107' : '#f4f3f4'}
                            trackColor={{ false: '#767577', true: '#facc15' }}
                        />
                        <Text style={styles.rememberText}>Remember me</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text style={styles.forgotLink}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitBtnText}>Sign In</Text>
                </TouchableOpacity>

                <View style={styles.signupLink}>
                    <Text style={{ color: '#9ca3af' }}>
                        Need an account?{' '}
                        <Text onPress={() => navigation.navigate('SignUp')} style={styles.signupLinkText}>
                            Sign Up
                        </Text>
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
