import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './SignUpScreen.styles';

export default function SignUpScreen({ navigation }) {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [phoneValid, setPhoneValid] = useState(false);
    const [confirmPasswordMatch, setConfirmPasswordMatch] = useState(false);

    const validateRwandanPhone = (phone) => {
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        const rwandaRegex = /^(\+?250|0)?(78|79)\d{7}$/;
        return rwandaRegex.test(cleanPhone);
    };

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        return strength;
    };

    const handlePhoneChange = (value) => {
        setPhone(value);
        setPhoneValid(validateRwandanPhone(value));
    };

    const handleConfirmPasswordChange = (value) => {
        setConfirmPassword(value);
        setConfirmPasswordMatch(value === password);
    };

    const normalizePhone = (phone) => {
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        if (cleanPhone.startsWith('+250')) return cleanPhone;
        if (cleanPhone.startsWith('250')) return '+' + cleanPhone;
        if (cleanPhone.startsWith('0')) return '+250' + cleanPhone.substring(1);
        return '+250' + cleanPhone;
    };

    const handleSignUp = async () => {
        let validationErrors = {};

        if (!fullName.trim()) {
            validationErrors.fullName = 'Full name is required';
        }
        if (!validateRwandanPhone(phone)) {
            validationErrors.phone = 'Please enter a valid Rwandan MTN number (078/079...)';
        }
        if (password.length < 6) {
            validationErrors.password = 'Password must be at least 6 characters';
        }
        if (confirmPassword !== password) {
            validationErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Check if user exists
        const usersJSON = await AsyncStorage.getItem('momopress_users');
        let users = usersJSON ? JSON.parse(usersJSON) : [];
        const normalizedPhone = normalizePhone(phone);
        const existingUser = users.find(u => u.phone === normalizedPhone);
        if (existingUser) {
            setErrors({ phone: 'This phone number is already registered' });
            return;
        }

        // Save new user
        const newUser = {
            fullName: fullName.trim(),
            phone: normalizedPhone,
            password,
            createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        await AsyncStorage.setItem('momopress_users', JSON.stringify(users));

        Alert.alert('Success', 'Account created successfully! Please sign in.');
        navigation.navigate('Login');
    };

    // Render password strength bar color
    const passwordStrengthLevel = checkPasswordStrength(password);
    const strengthColors = ['#ef4444', '#f59e0b', '#f59e0b', '#10b981', '#10b981'];
    const strengthTexts = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthWidthPercent = (passwordStrengthLevel / 5) * 100;

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.logoSection}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoText}>MoMo</Text>
                    <Text style={styles.logoText2}> Press</Text>
                </View>
                <Text style={styles.welcomeTitle}>Create Account</Text>
                <Text style={styles.welcomeSubtitle}>Sign up to start managing your finances</Text>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name</Text>
                <TextInput
                    style={[styles.formInput, errors.fullName ? styles.inputError : null]}
                    placeholder="John Doe"
                    value={fullName}
                    onChangeText={setFullName}
                />
                {errors.fullName && <Text style={styles.errorMessage}>{errors.fullName}</Text>}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number</Text>
                <TextInput
                    style={[
                        styles.formInput,
                        errors.phone ? styles.inputError : phoneValid ? styles.inputSuccess : null,
                    ]}
                    placeholder="+250 78X XXX XXX"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={handlePhoneChange}
                />
                {errors.phone && <Text style={styles.errorMessage}>{errors.phone}</Text>}
                {phoneValid && !errors.phone && (
                    <Text style={styles.successMessage}>Valid phone number</Text>
                )}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={[styles.formInput, errors.password ? styles.inputError : null, { flex: 1 }]}
                        placeholder="At least 6 characters"
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
                <View style={[styles.passwordStrength, password ? styles.passwordStrengthShow : null]}>
                    <View style={styles.strengthBar}>
                        <View
                            style={[
                                styles.strengthFill,
                                {
                                    width: `${strengthWidthPercent}%`,
                                    backgroundColor: strengthColors[passwordStrengthLevel - 1] || '#ef4444',
                                },
                            ]}
                        />
                    </View>
                    <Text style={styles.strengthText}>
                        {password ? strengthTexts[passwordStrengthLevel - 1] : ''}
                    </Text>
                </View>
                {errors.password && <Text style={styles.errorMessage}>{errors.password}</Text>}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={[
                            styles.formInput,
                            errors.confirmPassword ? styles.inputError : confirmPasswordMatch ? styles.inputSuccess : null,
                            { flex: 1 },
                        ]}
                        placeholder="Re-enter your password"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={handleConfirmPasswordChange}
                    />
                    <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.passwordToggle}
                        accessibilityLabel="Toggle confirm password visibility"
                    >
                        <Icon name={showConfirmPassword ? 'eye-slash' : 'eye'} size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                    <Text style={styles.errorMessage}>{errors.confirmPassword}</Text>
                )}
                {confirmPasswordMatch && !errors.confirmPassword && (
                    <Text style={styles.successMessage}>Passwords match</Text>
                )}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSignUp}>
                <Text style={styles.submitBtnText}>Sign Up</Text>
            </TouchableOpacity>

            <View style={styles.signinLink}>
                <Text style={styles.signinText}>
                    Already have an account?{' '}
                    <Text style={styles.signinLinkText} onPress={() => navigation.navigate('Login')}>
                        Sign In
                    </Text>
                </Text>
            </View>
        </ScrollView>
    );
}
