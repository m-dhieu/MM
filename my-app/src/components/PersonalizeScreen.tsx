import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Switch,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STEP_KEY = 'momo_onboard_step';
const MSG_TOGGLE_KEY = 'momo_custom_messages_enabled';
const MONTHLY_LIMIT_KEY = 'momo_monthly_limit';
const WEEKLY_CHECKS_KEY = 'momo_weekly_checks_enabled';
const THEME_KEY = 'momo_theme';

const stepsData = [
    {
        title: 'Welcome to MoMo Press',
        subtitle: "Let's personalize your experience",
    },
    {
        title: 'Monthly Spending Limit',
        subtitle: "Set a monthly spending cap. You'll receive an alert when you exceed this limit.",
    },
    {
        title: 'Weekly Spending Checks',
        subtitle:
            'Get notified when a transaction exceeds your weekly average spending. Helps identify unusual activity.',
    },
];

export default function PersonalizeScreen({ navigation }) {
    const [step, setStep] = useState<number>(0);
    const [customMessagesEnabled, setCustomMessagesEnabled] = useState(false);
    const [monthlyLimit, setMonthlyLimit] = useState('');
    const [weeklyChecksEnabled, setWeeklyChecksEnabled] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const loadSettings = async () => {
            const savedStep = parseInt((await AsyncStorage.getItem(STEP_KEY)) || '0', 10);
            setStep(isNaN(savedStep) ? 0 : savedStep);

            const savedMessages = (await AsyncStorage.getItem(MSG_TOGGLE_KEY)) === 'true';
            setCustomMessagesEnabled(savedMessages);

            const savedLimit = (await AsyncStorage.getItem(MONTHLY_LIMIT_KEY)) || '';
            setMonthlyLimit(savedLimit);

            const savedWeekly = (await AsyncStorage.getItem(WEEKLY_CHECKS_KEY)) === 'true';
            setWeeklyChecksEnabled(savedWeekly);

            const savedTheme = (await AsyncStorage.getItem(THEME_KEY)) || 'dark';
            setTheme(savedTheme === 'light' ? 'light' : 'dark');
        };

        loadSettings();
    }, []);

    const saveStep = async (newStep: number) => {
        setStep(newStep);
        await AsyncStorage.setItem(STEP_KEY, newStep.toString());
    };

    const onNext = async () => {
        if (step === 1) {
            // Save monthly limit
            await AsyncStorage.setItem(MONTHLY_LIMIT_KEY, monthlyLimit || '0');
        }
        if (step === 2) {
            // Finish onboarding and go to Home screen
            await AsyncStorage.setItem(STEP_KEY, '0');
            navigation.navigate('Home');
        } else {
            saveStep(step + 1);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        await AsyncStorage.setItem(THEME_KEY, newTheme);
    };

    const toggleCustomMessages = async (value: boolean) => {
        setCustomMessagesEnabled(value);
        await AsyncStorage.setItem(MSG_TOGGLE_KEY, value.toString());
    };

    const toggleWeeklyChecks = async (value: boolean) => {
        setWeeklyChecksEnabled(value);
        await AsyncStorage.setItem(WEEKLY_CHECKS_KEY, value.toString());
    };

    const progressDots = stepsData.map((_, idx) => (
        <View
            key={idx}
            style={[styles.progressDot, step === idx && styles.progressDotActive]}
        />
    ));

    return (
        <ScrollView contentContainerStyle={[styles.container, theme === 'light' && styles.containerLight]}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={toggleTheme} accessibilityLabel="Toggle theme" style={styles.themeToggleBtn}>
                    <Text style={styles.themeText}>{theme === 'dark' ? '🌙' : '☀️'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.logoWrap}>
                <View style={styles.logoRing}>
                    <Text style={[styles.logoMomo, theme === 'light' && styles.logoMomoLight]}>MoMo</Text>
                    <Text style={[styles.logoPress, theme === 'light' && styles.logoPressLight]}>Press</Text>
                </View>
            </View>

            <Text style={[styles.title, theme === 'light' && styles.titleLight]}>{stepsData[step].title}</Text>
            <Text style={[styles.subtitle, theme === 'light' && styles.subtitleLight]}>{stepsData[step].subtitle}</Text>

            <View style={styles.progressBar}>{progressDots}</View>

            {step === 0 && (
                <View style={styles.card}>
                    <Text style={[styles.cardTitle, theme === 'light' && styles.titleLight]}>Transaction Messages</Text>
                    <Text style={[styles.cardDesc, theme === 'light' && styles.subtitleLight]}>
                        Add custom notes to your transactions for better tracking. Messages are stored locally and don't modify MoMo SMS.
                    </Text>
                    <View style={styles.toggleRow}>
                        <Text style={[styles.toggleLabel, theme === 'light' && styles.subtitleLight]}>
                            Enable custom messages
                        </Text>
                        <Switch value={customMessagesEnabled} onValueChange={toggleCustomMessages} />
                    </View>
                </View>
            )}

            {step === 1 && (
                <View style={styles.card}>
                    <Text style={[styles.cardTitle, theme === 'light' && styles.titleLight]}>Monthly Spending Limit</Text>
                    <Text style={[styles.cardDesc, theme === 'light' && styles.subtitleLight]}>
                        Set a monthly spending cap. You'll receive an alert when you exceed this limit.
                    </Text>
                    <TextInput
                        style={[styles.input, theme === 'light' && styles.inputLight]}
                        keyboardType="numeric"
                        value={monthlyLimit}
                        onChangeText={setMonthlyLimit}
                        placeholder="0"
                        placeholderTextColor={theme === 'light' ? '#999' : '#666'}
                    />
                    <Text style={[styles.inputNote, theme === 'light' && styles.inputNoteLight]}>
                        Set to 0 to disable monthly limit alerts
                    </Text>
                </View>
            )}

            {step === 2 && (
                <View style={styles.card}>
                    <Text style={[styles.cardTitle, theme === 'light' && styles.titleLight]}>Weekly Spending Checks</Text>
                    <Text style={[styles.cardDesc, theme === 'light' && styles.subtitleLight]}>
                        Get notified when a transaction exceeds your weekly average spending. Helps identify unusual activity.
                    </Text>
                    <View style={styles.toggleRow}>
                        <Text style={[styles.toggleLabel, theme === 'light' && styles.subtitleLight]}>Enable weekly checks</Text>
                        <Switch value={weeklyChecksEnabled} onValueChange={toggleWeeklyChecks} />
                    </View>
                    {weeklyChecksEnabled && (
                        <Text style={[styles.confirmText, theme === 'light' && styles.confirmTextLight]}>
                            You're all set! You can change these settings anytime from the Settings menu.
                        </Text>
                    )}
                </View>
            )}

            <View style={styles.buttonRow}>
                {step > 0 && (
                    <TouchableOpacity
                        style={[styles.button, styles.offButton]}
                        onPress={() => saveStep(step - 1)}
                        disabled={step === 0}
                    >
                        <Text style={[styles.buttonText, styles.offButtonText]}>Back</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={onNext}>
                    <Text style={styles.buttonText}>
                        {step < stepsData.length - 1 ? 'Next' : 'Get Started'} {step < stepsData.length - 1 ? '→' : '✔'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#0f1624',
        paddingVertical: 24,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerLight: {
        backgroundColor: '#fffbea',
    },
    topBar: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    themeToggleBtn: {
        padding: 10,
    },
    themeText: {
        fontSize: 22,
        color: '#FFC228',
    },
    logoWrap: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoRing: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#161819',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 0 20px #FFC228, 0 0 0 6px rgba(255,194,40,0.12)',
    },
    logoMomo: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -1,
        color: '#FFC228',
    },
    logoMomoLight: {
        color: '#0f2d57',
    },
    logoPress: {
        fontSize: 18,
        fontWeight: '400',
        color: '#e4e4e4',
    },
    logoPressLight: {
        color: '#fba524',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    titleLight: {
        color: '#0f2d57',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#9ca3af',
        textAlign: 'center',
        marginBottom: 24,
    },
    subtitleLight: {
        color: '#39485c',
    },
    progressBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 26,
        gap: 10,
    },
    progressDot: {
        width: 19,
        height: 6,
        borderRadius: 6,
        backgroundColor: '#23294b',
        opacity: 0.88,
    },
    progressDotActive: {
        backgroundColor: '#FFC228',
        width: 38,
        shadowColor: '#FFC228',
        shadowRadius: 6,
        shadowOpacity: 1,
    },
    card: {
        width: '85%',
        backgroundColor: '#1a2030',
        borderRadius: 14,
        paddingVertical: 22,
        paddingHorizontal: 18,
        alignItems: 'flex-start',
        marginBottom: 38,
        shadowColor: '#201f3615',
        shadowOpacity: 1,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#373f52',
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    cardDesc: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 18,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: '#2b3045',
        padding: 7,
        borderRadius: 10,
    },
    toggleLabel: {
        fontSize: 16,
        color: '#d1d5db',
    },
    input: {
        width: '100%',
        backgroundColor: '#0f1624',
        borderRadius: 8,
        borderColor: '#373f52',
        borderWidth: 1.5,
        padding: 7,
        fontSize: 16,
        color: '#fff',
    },
    inputLight: {
        backgroundColor: '#fffbea',
        color: '#222',
        borderColor: '#dbb829',
    },
    inputNote: {
        color: '#9ca3af',
        fontSize: 11,
        marginTop: 4,
    },
    inputNoteLight: {
        color: '#39485c',
    },
    confirmText: {
        marginTop: 12,
        color: '#33ac6a',
        fontWeight: '500',
        fontSize: 14,
    },
    confirmTextLight: {
        color: '#0f5424',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '70%',
        paddingHorizontal: 20,
        gap: 12,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    offButton: {
        backgroundColor: '#fff',
        shadowColor: '#00000022',
        shadowOpacity: 1,
        shadowRadius: 6,
    },
    offButtonText: {
        fontWeight: '600',
        color: '#888',
        fontSize: 16,
    },
    nextButton: {
        backgroundColor: '#FFC228',
        shadowColor: '#fbdc5c',
        shadowOpacity: 1,
        shadowRadius: 13,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#181d27',
    },
});
