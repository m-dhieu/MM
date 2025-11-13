import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ForgotPasswordScreen({ navigation }) {
    const [step, setStep] = useState<number>(1);
    const [phone, setPhone] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
    const [generatedCode, setGeneratedCode] = useState('');
    const [timer, setTimer] = useState(0);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const codeInputs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];

    useEffect(() => {
        let interval: NodeJS.Timer;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const validateRwandanPhone = (input: string) => {
        const cleanPhone = input.replace(/[\s\-\(\)]/g, '');
        const rwandaRegex = /^(\+?250|0)?(78|79)\d{7}$/;
        return rwandaRegex.test(cleanPhone);
    };

    const normalizePhone = (input: string) => {
        const cleanPhone = input.replace(/[\s\-\(\)]/g, '');
        if (cleanPhone.startsWith('+250')) return cleanPhone;
        if (cleanPhone.startsWith('250')) return '+' + cleanPhone;
        if (cleanPhone.startsWith('0')) return '+250' + cleanPhone.substring(1);
        return '+250' + cleanPhone;
    };

    const generateVerificationCode = () => {
        return Math.floor(1000 + Math.random() * 9000).toString();
    };

    const sendCode = async () => {
        setErrors({});
        if (!validateRwandanPhone(phone)) {
            setErrors({ phone: 'Please enter a valid Rwandan MTN number (078/079...)' });
            return;
        }
        const norm = normalizePhone(phone);
        const usersJSON = await AsyncStorage.getItem('momopress_users');
        const users = usersJSON ? JSON.parse(usersJSON) : [];
        const user = users.find((u: any) => u.phone === norm);
        if (!user) {
            setErrors({ phone: 'No account found with this phone number' });
            return;
        }
        const code = generateVerificationCode();
        setGeneratedCode(code);
        Alert.alert('Verification code sent', `For demo: ${code}`);
        setStep(2);
        setTimer(60);
        setVerificationCode(['', '', '', '']);
        codeInputs[0].current?.focus();
    };

    const resendCode = () => {
        const code = generateVerificationCode();
        setGeneratedCode(code);
        Alert.alert('New verification code sent', `For demo: ${code}`);
        setTimer(60);
        setVerificationCode(['', '', '', '']);
        codeInputs[0].current?.focus();
    };

    const verifyCode = () => {
        const enteredCode = verificationCode.join('');
        if (enteredCode.length < 4) {
            setErrors({ code: 'Please enter the full 4-digit code.' });
            return;
        }
        if (enteredCode !== generatedCode) {
            setErrors({ code: 'Invalid verification code. Please try again.' });
            setVerificationCode(['', '', '', '']);
            codeInputs[0].current?.focus();
            return;
        }
        setErrors({});
        setStep(3);
    };

    const resetPassword = async () => {
        let valid = true;
        let newErrors: { [key: string]: string } = {};

        if (newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
            valid = false;
        }
        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            valid = false;
        }
        if (!valid) {
            setErrors(newErrors);
            return;
        }

        const norm = normalizePhone(phone);
        const usersJSON = await AsyncStorage.getItem('momopress_users');
        let users = usersJSON ? JSON.parse(usersJSON) : [];
        const userIndex = users.findIndex((u: any) => u.phone === norm);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            await AsyncStorage.setItem('momopress_users', JSON.stringify(users));
            setStep(4);
            setTimeout(() => navigation.navigate('Login'), 2000);
        }
    };

    const onChangeCode = (text: string, index: number) => {
        if (text.length > 1) text = text.charAt(text.length - 1);
        const newCode = [...verificationCode];
        newCode[index] = text;
        setVerificationCode(newCode);
        if (text.length === 1 && index < codeInputs.length - 1) {
            codeInputs[index + 1].current?.focus();
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.logoSection}>
                    {step === 1 && (
                        <>
                            <Text style={styles.welcomeTitle}>Forgot Password?</Text>
                            <Text style={styles.welcomeSubtitle}>Enter your phone number and we'll send you a verification code</Text>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <Text style={styles.welcomeTitle}>Verify Code</Text>
                            <Text style={styles.welcomeSubtitle}>Enter the 4-digit code sent to {phone}</Text>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <Text style={styles.welcomeTitle}>Reset Password</Text>
                            <Text style={styles.welcomeSubtitle}>Enter your new password</Text>
                        </>
                    )}
                    {step === 4 && (
                        <Text style={styles.welcomeTitle}>Password Reset Successful!</Text>
                    )}
                </View>

                {step === 1 && (
                    <>
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
                            {errors.phone ? <Text style={styles.errorMessage}>{errors.phone}</Text> : null}
                        </View>
                        <TouchableOpacity style={styles.submitBtn} onPress={sendCode}>
                            <Text style={styles.submitBtnText}>Send Verification Code</Text>
                        </TouchableOpacity>
                    </>
                )}

                {step === 2 && (
                    <>
                        <View style={styles.codeInputContainer}>
                            {verificationCode.map((digit, i) => (
                                <TextInput
                                    key={i}
                                    ref={codeInputs[i]}
                                    style={[styles.codeInput, errors.code ? styles.inputError : null]}
                                    maxLength={1}
                                    keyboardType="number-pad"
                                    value={digit}
                                    onChangeText={text => onChangeCode(text, i)}
                                    autoFocus={i === 0}
                                />
                            ))}
                        </View>
                        {errors.code ? <Text style={styles.errorMessage}>{errors.code}</Text> : null}
                        <View style={styles.resendCodeContainer}>
                            <Text style={styles.resendCodeText}>Didn't receive code?</Text>
                            <TouchableOpacity disabled={timer > 0} onPress={resendCode}>
                                <Text style={[styles.resendButton, timer > 0 ? styles.disabled : null]}>
                                    Resend{timer > 0 ? ` (${timer}s)` : ''}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.submitBtn} onPress={verifyCode}>
                            <Text style={styles.submitBtnText}>Verify Code</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setStep(1)}>
                            <Text style={styles.backLink}>Change Phone Number</Text>
                        </TouchableOpacity>
                    </>
                )}

                {step === 3 && (
                    <>
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>New Password</Text>
                            <TextInput
                                style={[styles.formInput, errors.newPassword ? styles.inputError : null]}
                                placeholder="At least 6 characters"
                                placeholderTextColor="#6b7280"
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            {errors.newPassword ? <Text style={styles.errorMessage}>{errors.newPassword}</Text> : null}
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Confirm New Password</Text>
                            <TextInput
                                style={[styles.formInput, errors.confirmPassword ? styles.inputError : null]}
                                placeholder="Re-enter your password"
                                placeholderTextColor="#6b7280"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            {errors.confirmPassword ? <Text style={styles.errorMessage}>{errors.confirmPassword}</Text> : null}
                        </View>
                        <TouchableOpacity style={styles.submitBtn} onPress={resetPassword}>
                            <Text style={styles.submitBtnText}>Reset Password</Text>
                        </TouchableOpacity>
                    </>
                )}

                {step === 4 && (
                    <View style={styles.successContainer}>
                        <Text style={styles.successText}>Your password has been reset successfully!</Text>
                        <TouchableOpacity style={styles.submitBtn} onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.submitBtnText}>Back to Sign In</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2b3547',
        padding: 24,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#d1d5db',
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: '#1f2937',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        color: '#fff',
        fontSize: 14,
        borderWidth: 2,
        borderColor: '#374151',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorMessage: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 6,
    },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    codeInput: {
        backgroundColor: '#1f2937',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#374151',
        width: 50,
        height: 56,
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    resendCodeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
        alignItems: 'center',
        gap: 8,
    },
    resendCodeText: {
        color: '#9ca3af',
        fontSize: 13,
    },
    resendButton: {
        color: '#FFC107',
        fontSize: 13,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    disabled: {
        opacity: 0.5,
    },
    submitBtn: {
        backgroundColor: '#FFC107',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 20,
    },
    submitBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    backLink: {
        textAlign: 'center',
        color: '#FFC107',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
        marginBottom: 24,
    },
    successContainer: {
        alignItems: 'center',
    },
    successText: {
        fontSize: 18,
        color: '#10b981',
        marginBottom: 24,
    },
});
