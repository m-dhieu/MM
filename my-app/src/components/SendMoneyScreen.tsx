import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    StyleSheet,
    Alert,
    Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';

type RecentTransaction = {
    recipient: string;
    type: string;
    name: string;
    date: string;
};

export default function SendMoneyScreen({ navigation }) {
    const [currentTab, setCurrentTab] = useState<'phone' | 'merchant'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [merchantCode, setMerchantCode] = useState('');
    const [amount, setAmount] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
    const [processing, setProcessing] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [transactionResult, setTransactionResult] = useState<any>(null);
    const [spendingBreakdown, setSpendingBreakdown] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('recentTransactions');
        if (stored) {
            setRecentTransactions(JSON.parse(stored));
        }
    }, []);

    const switchTab = (tab: 'phone' | 'merchant') => {
        setCurrentTab(tab);
        clearErrors();
    };

    const validatePhone = (phone: string) => /^\+?\d{10,15}$/.test(phone.replace(/\D/g, ''));

    const validateMerchantCode = (code: string) => code.length >= 4 && code.length <= 8 && /^\d+$/.test(code);

    const validateAmount = (value: string) => !isNaN(Number(value)) && Number(value) > 0;

    const clearErrors = () => {
        setErrors({});
    };

    const showError = (field: string, message: string) => {
        setErrors(prev => ({ ...prev, [field]: message }));
    };

    const setQuickAmount = (value: number) => {
        setAmount(value.toString());
        setErrors(prev => ({ ...prev, amount: '' }));
    };

    const clearForm = () => {
        setPhoneNumber('');
        setMerchantCode('');
        setAmount('');
        clearErrors();
    };

    const saveRecentTransaction = (recipient: string, type: string) => {
        const existingIndex = recentTransactions.findIndex(t => t.recipient === recipient);
        let updated = [...recentTransactions];
        if (existingIndex !== -1) {
            const [existing] = updated.splice(existingIndex, 1);
            updated.unshift(existing);
        } else {
            updated.unshift({
                recipient,
                type,
                name: type === 'Money Transfer' ? 'Phone Number' : 'Merchant',
                date: new Date().toISOString(),
            });
        }
        if (updated.length > 10) updated.pop();
        setRecentTransactions(updated);
        localStorage.setItem('recentTransactions', JSON.stringify(updated));
    };

    const handleSendMoney = async () => {
        clearErrors();
        let valid = true;
        let recipient = '';
        let type = '';

        if (currentTab === 'phone') {
            if (!phoneNumber) {
                showError('phone', 'Please enter a phone number');
                valid = false;
            } else if (!validatePhone(phoneNumber)) {
                showError('phone', 'Invalid phone number. Must be 10-15 digits');
                valid = false;
            } else {
                recipient = phoneNumber;
                type = 'Money Transfer';
            }
        } else {
            if (!merchantCode) {
                showError('merchant', 'Please enter a merchant code');
                valid = false;
            } else if (!validateMerchantCode(merchantCode)) {
                showError('merchant', 'Invalid merchant code. Must be 4-8 digits');
                valid = false;
            } else {
                recipient = merchantCode;
                type = 'Merchant Payment';
            }
        }

        if (!amount) {
            showError('amount', 'Please enter an amount');
            valid = false;
        } else if (!validateAmount(amount)) {
            showError('amount', 'Amount must be greater than 0');
            valid = false;
        }

        if (!valid) return;

        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            const result = {
                recipient,
                type,
                amount: Number(amount),
                transactionId: 'MPR' + Date.now(),
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                newBalance: 487350 - Number(amount),
            };
            setTransactionResult(result);
            setSuccessModalVisible(true);
            saveRecentTransaction(recipient, type);
            clearForm();
        }, 2000);
    };

    const closeSuccessModal = () => setSuccessModalVisible(false);

    const fillFromRecent = (t: RecentTransaction) => {
        if (t.type === 'Money Transfer') {
            switchTab('phone');
            setPhoneNumber(t.recipient);
        } else {
            switchTab('merchant');
            setMerchantCode(t.recipient);
        }
    };

    return (
        <View style={[styles.appContainer, darkMode && styles.appContainerDark]}>
            <View style={styles.header}>
                <View style={styles.mtnBadge}>
                    <Text style={styles.mtnBadgeText}>m-press</Text>
                </View>
                <TouchableOpacity onPress={() => setSettingsVisible(true)}>
                    <Icon name="gear" size={30} color={darkMode ? '#fbbf24' : '#1f2937'} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.pageHeader}>
                    <Text style={[styles.pageTitle, darkMode && styles.pageTitleDark]}>Send Money</Text>
                    <Text style={[styles.pageSubtitle, darkMode && styles.pageSubtitleDark]}>Quick & secure transfers</Text>
                </View>

                <View style={styles.tabButtons}>
                    <TouchableOpacity
                        style={[styles.tabBtn, currentTab === 'phone' && styles.tabBtnActive]}
                        onPress={() => switchTab('phone')}
                    >
                        <Icon name="phone" size={18} color={currentTab === 'phone' ? '#fff' : '#000'} />
                        <Text style={[styles.tabBtnText, currentTab === 'phone' && styles.tabBtnTextActive]}>Phone Number</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabBtn, currentTab === 'merchant' && styles.tabBtnActive]}
                        onPress={() => switchTab('merchant')}
                    >
                        <Icon name="building" size={18} color={currentTab === 'merchant' ? '#fff' : '#000'} />
                        <Text style={[styles.tabBtnText, currentTab === 'merchant' && styles.tabBtnTextActive]}>Merchant Code</Text>
                    </TouchableOpacity>
                </View>

                {currentTab === 'phone' && (
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, darkMode && styles.labelDark]}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, errors.phone && styles.inputError, darkMode && styles.inputDark]}
                            placeholder="078XXXXXXX or +250788XXXXXX"
                            placeholderTextColor={darkMode ? '#888' : '#999'}
                            keyboardType="phone-pad"
                            maxLength={20}
                            value={phoneNumber}
                            onChangeText={text => {
                                setPhoneNumber(text);
                                if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                            }}
                        />
                        {errors.phone ? <Text style={styles.errorMsg}>{errors.phone}</Text> : null}
                    </View>
                )}

                {currentTab === 'merchant' && (
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, darkMode && styles.labelDark]}>Merchant Code</Text>
                        <TextInput
                            style={[styles.input, errors.merchant && styles.inputError, darkMode && styles.inputDark]}
                            placeholder="Enter code"
                            placeholderTextColor={darkMode ? '#888' : '#999'}
                            value={merchantCode}
                            onChangeText={text => {
                                setMerchantCode(text);
                                if (errors.merchant) setErrors(prev => ({ ...prev, merchant: '' }));
                            }}
                        />
                        {errors.merchant ? <Text style={styles.errorMsg}>{errors.merchant}</Text> : null}
                    </View>
                )}

                <View style={styles.formGroup}>
                    <Text style={[styles.label, darkMode && styles.labelDark]}>Amount (RWF)</Text>
                    <TextInput
                        style={[styles.input, errors.amount && styles.inputError, darkMode && styles.inputDark]}
                        placeholder="0"
                        placeholderTextColor={darkMode ? '#888' : '#999'}
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={text => {
                            setAmount(text);
                            if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                        }}
                    />
                    {errors.amount ? <Text style={styles.errorMsg}>{errors.amount}</Text> : null}
                </View>

                <View style={styles.quickAmounts}>
                    {[500, 1000, 2000, 5000, 10000, 20000].map(val => (
                        <TouchableOpacity key={val} style={styles.amountBtn} onPress={() => setQuickAmount(val)}>
                            <Text style={styles.amountBtnText}>{val.toLocaleString()}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.sendBtn} onPress={handleSendMoney} disabled={processing}>
                    <Text style={styles.sendBtnText}>
                        {processing ? 'Sending...' : 'Send Money'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.recentSection}>
                    <Text style={[styles.recentHeader, darkMode && styles.recentHeaderDark]}>
                        Recent
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentList}>
                        {recentTransactions.length === 0 && (
                            <Text style={[styles.noRecent, darkMode && styles.noRecentDark]}>
                                No recent transactions
                            </Text>
                        )}
                        {recentTransactions.map((t, idx) => (
                            <TouchableOpacity key={idx} style={styles.recentItem} onPress={() => fillFromRecent(t)}>
                                <Text style={[styles.recentName, darkMode && styles.recentNameDark]}>{t.name}</Text>
                                <Text style={[styles.recentPhone, darkMode && styles.recentPhoneDark]}>{t.recipient}</Text>
                                <View style={styles.contactBadge}>
                                    <Text style={styles.contactBadgeText}>Contact</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <Modal visible={successModalVisible} transparent animationType="fade">
                    <View style={styles.modalBackdrop}>
                        <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
                            <TouchableOpacity style={styles.closeBtn} onPress={closeSuccessModal}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                            <View style={styles.successIcon}>
                                <Icon name="check" size={60} color="#fff" />
                            </View>
                            <Text style={styles.successTitle}>Transaction Successful!</Text>
                            <Text style={styles.successSubtitle}>Your money has been sent</Text>

                            <View style={styles.transactionDetails}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Amount Sent</Text>
                                    <Text style={styles.detailValue}>RWF {transactionResult?.amount.toLocaleString()}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Recipient</Text>
                                    <Text style={styles.detailValue}>{transactionResult?.recipient}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Type</Text>
                                    <Text style={styles.detailValue}>{transactionResult?.type}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Date & Time</Text>
                                    <Text style={styles.detailValue}>{transactionResult?.date} {transactionResult?.time}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>New Balance</Text>
                                    <Text style={styles.detailValue}>RWF {transactionResult?.newBalance.toLocaleString()}</Text>
                                </View>
                                <View style={styles.transactionId}>
                                    <Text style={styles.transactionIdLabel}>Transaction ID</Text>
                                    <Text style={styles.transactionIdValue}>{transactionResult?.transactionId}</Text>
                                </View>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.downloadBtn} onPress={() => Alert.alert('Download receipt functionality pending')}>
                                    <Icon name="download" size={20} color="#000" />
                                    <Text>Download</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.doneBtn} onPress={closeSuccessModal}>
                                    <Text style={styles.doneBtnText}>Done</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.footerText}>
                                Thank you for using MoMo Press{'\n'}
                                Powered by MTN Mobile Money
                            </Text>
                        </View>
                    </View>
                </Modal>

                <Modal visible={settingsVisible} transparent animationType="fade">
                    <View style={styles.settingsBackdrop}>
                        <View style={[styles.settingsModal, darkMode && styles.settingsModalDark]}>
                            <View style={styles.settingsHeader}>
                                <Text style={[styles.settingsTitle, darkMode && styles.settingsTitleDark]}>Settings</Text>
                                <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                                    <Icon name="xmark" size={24} color={darkMode ? '#fbbf24' : '#000'} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.settingsBody}>
                                <View style={styles.featureGroup}>
                                    <Text style={[styles.featureTitle, darkMode && styles.featureTitleDark]}>Spending Breakdown</Text>
                                    <Switch value={spendingBreakdown} onValueChange={setSpendingBreakdown} />
                                </View>
                                <View style={styles.featureGroup}>
                                    <Text style={[styles.featureTitle, darkMode && styles.featureTitleDark]}>Dark Mode</Text>
                                    <Switch value={darkMode} onValueChange={setDarkMode} />
                                </View>
                                <TouchableOpacity style={styles.logoutBtn} onPress={() => {
                                    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
                                        {text: "Cancel", style: "cancel"},
                                        {text: "Logout", onPress: () => navigation.navigate("Login")},
                                    ]);
                                }}>
                                    <Icon name="right-from-bracket" size={18} color="#b91c1c" />
                                    <Text style={styles.logoutBtnText}>Log out</Text>
                                </TouchableOpacity>
                                <View style={styles.aboutMoMo}>
                                    <Text style={styles.aboutMoMoText}>MoMo Press v1.0</Text>
                                    <Text style={styles.aboutDesc}>Track your MoMo spending and manage your finances</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    appContainer: { flex: 1, backgroundColor: '#f5f5f5' },
    appContainerDark: { backgroundColor: '#0f1624' },
    header: {
        flexDirection: 'row',
        padding: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fad02e',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    mtnBadge: {
        backgroundColor: '#1f1f1f',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
    },
    mtnBadgeText: { color: '#fad02e', fontWeight: '900', fontSize: 12 },
    container: { paddingHorizontal: 16, paddingBottom: 100 },
    pageHeader: { marginBottom: 20 },
    pageTitle: { fontSize: 24, fontWeight: '600', color: '#1a1a1a' },
    pageTitleDark: { color: '#ddd' },
    pageSubtitle: { fontSize: 14, color: '#999' },
    pageSubtitleDark: { color: '#bbb' },
    tabButtons: { flexDirection: 'row', marginBottom: 20, gap: 12 },
    tabBtn: {
        flex: 1,
        backgroundColor: '#eee',
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    tabBtnActive: { backgroundColor: '#FFC107' },
    tabBtnText: { fontSize: 15, fontWeight: '600', color: '#555' },
    tabBtnTextActive: { color: '#27272a' },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 14, color: '#555', marginBottom: 6 },
    labelDark: { color: '#ddd' },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#d4d4d8',
        paddingHorizontal: 12,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111',
    },
    inputDark: { backgroundColor: '#222', color: '#eee', borderColor: '#444' },
    inputError: { borderColor: '#dc2626' },
    errorMsg: { marginTop: 4, color: '#dc2626', fontSize: 12 },
    quickAmounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
    },
    amountBtn: {
        backgroundColor: '#FFC228',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,
    },
    amountBtnText: { fontWeight: '700', fontSize: 14, color: '#222' },
    sendBtn: {
        backgroundColor: '#1f1f1f',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 40,
    },
    sendBtnText: { color: '#FFC228', fontWeight: '700', fontSize: 18 },
    recentSection: { marginBottom: 40 },
    recentHeader: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 18 },
    recentHeaderDark: { color: '#ccc' },
    recentList: { flexDirection: 'row' },
    recentItem: {
        backgroundColor: '#eee',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 16,
        marginRight: 14,
        minWidth: 120,
    },
    recentName: { fontWeight: '600', color: '#444', marginBottom: 4 },
    recentNameDark: { color: '#ddd' },
    recentPhone: { fontSize: 12, color: '#666' },
    recentPhoneDark: { color: '#bbb' },
    contactBadge: {
        marginTop: 6,
        alignSelf: 'flex-start',
        backgroundColor: '#FFF9E6',
        border: '1px solid #FFC107',
        borderRadius: 20,
        color: '#333',
        fontSize: 12,
        fontWeight: '500',
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    modalBackdrop: { flex: 1, backgroundColor: '#000B', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#FFC228', padding: 24, borderRadius: 20, width: 300, alignItems: 'center' },
    modalContentDark: { backgroundColor: '#333' },
    closeBtn: { alignSelf: 'flex-end' },
    closeBtnText: { fontSize: 24, fontWeight: '700', color: '#222' },
    successIcon: { marginVertical: 16 },
    successTitle: { fontSize: 22, fontWeight: '700', color: '#222' },
    successSubtitle: { marginBottom: 24, fontSize: 16, color: '#222' },
    transactionDetails: { width: '100%' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    detailLabel: { fontWeight: '600', color: '#222' },
    detailValue: { color: '#222' },
    transactionId: { marginTop: 18, paddingTop: 14, borderTopColor: '#ccc', borderTopWidth: 1 },
    transactionIdLabel: { fontWeight: '600', color: '#222' },
    transactionIdValue: { color: '#222' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 24 },
    downloadBtn: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
    doneBtn: { backgroundColor: '#222', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 18 },
    doneBtnText: { color: '#FFC228', fontWeight: '700', fontSize: 16 },
    footerText: { marginTop: 18, fontWeight: '600', fontSize: 12, color: '#222', textAlign: 'center' },
    settingsBackdrop: { flex: 1, backgroundColor: '#000A', justifyContent: 'center', alignItems: 'center' },
    settingsModal: { backgroundColor: '#fff', borderRadius: 20, width: 300, padding: 24 },
    settingsModalDark: { backgroundColor: '#222' },
    settingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    settingsTitle: { fontSize: 22, fontWeight: '700', color: '#222' },
    settingsTitleDark: { color: '#fbbf24' },
    settingsBody: {},
    featureGroup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    featureTitle: { fontWeight: '600', fontSize: 16, color: '#222' },
    featureTitleDark: { color: '#fbbf24' },
    logoutBtn: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 14, marginTop: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    logoutBtnText: { color: '#b91c1c', fontWeight: '700', fontSize: 16 },
    aboutMoMo: { marginTop: 40, alignItems: 'center' },
    aboutMoMoText: { fontWeight: '700', fontSize: 14 },
    aboutDesc: { fontSize: 12, color: '#555', marginTop: 6, textAlign: 'center' },
});
