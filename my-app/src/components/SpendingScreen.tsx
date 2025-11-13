import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    Switch,
    StyleSheet,
    Animated,
    Alert,
} from 'react-native';
import Svg, { G, Circle } from 'react-native-svg'; // For donut chart
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useFocusEffect } from '@react-navigation/native';

// Sample categories & colors matching your design
const categories = [
    { key: 'Transfers', label: 'Money Transfers', color: '#FFD600' },
    { key: 'Airtime', label: 'Airtime & Data', color: '#00D48E' },
    { key: 'Merchant', label: 'Merchant Payments', color: '#FFA600' },
    { key: 'Utilities', label: 'Utilities & Bills', color: '#6FC1FF' },
    { key: 'CashOut', label: 'Cash Out', color: '#6b7280' },
    { key: 'Others', label: 'Others', color: '#9ca3af' },
];

// Props type omitted for simplicity

export default function SpendingScreen() {
    const [transactions, setTransactions] = useState([]);
    const [categorySums, setCategorySums] = useState({});
    const [totalSpent, setTotalSpent] = useState(0);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [budgetVisible, setBudgetVisible] = useState(false);
    const [spendingBreakdown, setSpendingBreakdown] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [budgetSettings, setBudgetSettings] = useState({});

    // Animated value for main progress bar
    const progressAnim = new Animated.Value(0);

    // Fetch or load transactions data, here simulate or fetch from API/local db
    useEffect(() => {
        // Fetch or load transactions DB here (simulate for now)
        const loadTransactions = async () => {
            // This would be replaced with real data fetching
            // For example, fetch('/api/transactions') or load local JSON data
            // Here, simulate with empty array or local variable
            const dummyTransactions = window.transactionsDB || []; // Replace as necessary
            setTransactions(dummyTransactions);
        };
        loadTransactions();
    }, []);

    // Calculate spending per category and total
    useEffect(() => {
        if (!transactions.length) {
            setCategorySums({});
            setTotalSpent(0);
            return;
        }

        const sums = {};
        categories.forEach(cat => {
            sums[cat.key] = 0;
        });

        transactions.forEach(tx => {
            if (tx.amount < 0) {
                const catKey = categories.find(c => tx.category.toLowerCase() === c.key.toLowerCase())
                    ? tx.category
                    : 'Others';
                sums[catKey] = (sums[catKey] || 0) + Math.abs(tx.amount);
            }
        });

        const total = Object.values(sums).reduce((a, b) => a + b, 0);

        setCategorySums(sums);
        setTotalSpent(total);

        // Animate progress bar for total spending
        const totalBudget = 1000000; // Replace or fetch real budget
        const progress = Math.min((total / totalBudget) * 100, 100);
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [transactions]);

    // Render donut chart using SVG arcs
    const DonutChart = () => {
        const radius = 80;
        const strokeWidth = 25;
        const center = radius + strokeWidth / 2;
        const circumference = 2 * Math.PI * radius;

        let startOffset = 0;

        return (
            <Svg width={2 * (radius + strokeWidth)} height={2 * (radius + strokeWidth)}>
                <G rotation={-90} origin={`${center}, ${center}`}>
                    {categories.map(({ key, color }) => {
                        const value = categorySums[key] || 0;
                        const percent = totalSpent ? value / totalSpent : 0;
                        const strokeDashoffset = circumference * (1 - percent);
                        const arc = (
                            <Circle
                                key={key}
                                cx={center}
                                cy={center}
                                r={radius}
                                stroke={color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${circumference} ${circumference}`}
                                strokeDashoffset={strokeDashoffset}
                                fill="transparent"
                            />
                        );
                        startOffset += percent;
                        return arc;
                    })}
                </G>
                <Text
                    x={center}
                    y={center}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="24"
                    fontWeight="bold"
                    fill={darkMode ? '#eee' : '#555'}
                >
                    {(totalSpent / 1000).toFixed(0)}k
                </Text>
                <Text
                    x={center}
                    y={center + 20}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14"
                    fill={darkMode ? '#aaa' : '#888'}
                >
                    Total spent
                </Text>
            </Svg>
        );
    };

    // Render budget modal etc omitted for brevity - can be designed similarly to send / history modals

    // Return full JSX structure matching your HTML but in React Native components

    return (
        <View style={[styles.appContainer, darkMode && styles.appContainerDark]}>
            {/* Header */}
            <View style={styles.topHeader}>
                <Text style={styles.brandLabel}>m-press</Text>
                <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.settingsBtn}>
                    <Icon name="cog" size={20} color={darkMode ? '#222' : '#000'} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.appContentWrapper}>
                {/* Title row */}
                <View style={styles.titleRow}>
                    <View style={styles.titleTextGroup}>
                        <Text style={[styles.screenIndicator, styles.activeScreenIndicator]}>
                            Spending Breakdown
                        </Text>
                        <Text style={styles.subTitleText}>Where your money goes</Text>
                    </View>
                    <TouchableOpacity onPress={() => alert('Download analytics feature coming soon')} style={styles.downloadBtn}>
                        <Icon name="download" size={16} color="#d99e07" />
                        <Text style={styles.downloadBtnText}>Download Analytics</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setBudgetVisible(true)} style={styles.settingsBtn2}>
                        <Icon name="cog" size={20} color="#d99e07" />
                    </TouchableOpacity>
                </View>

                {/* Total spent summary */}
                <View style={styles.spentCard}>
                    <Text style={styles.spentLabel}>Total Spent This Month</Text>
                    <Text style={styles.spentAmount}>RWF {totalSpent.toLocaleString()}</Text>
                    <Text style={styles.progressDesc}>Track your MoMo spending</Text>
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%'],
                                    }),
                                },
                            ]}
                        />
                    </View>
                </View>

                {/* Donut chart */}
                <View style={styles.donutCard}>
                    <DonutChart />
                    <View style={styles.donutLegendRow}>
                        {categories.map(cat => (
                            <View key={cat.key} style={styles.legendRow}>
                                <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                                <Text>{cat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Category details */}
                <View style={styles.categoryDetailsContainer}>
                    <Text style={styles.categoryDetailsTitle}>Category Details</Text>
                    {/* Category breakdown cards */}
                    {categories.map(cat => {
                        const val = categorySums[cat.key] || 0;
                        const percent = totalSpent ? Math.round((val / totalSpent) * 100) : 0;
                        return (
                            <View key={cat.key} style={styles.breakdownCard}>
                                <View style={[styles.breakdownIcon, { backgroundColor: cat.color }]}>
                                    <Icon name="circle-dot" size={18} color="#fff" />
                                </View>
                                <View style={styles.breakdownMain}>
                                    <View style={styles.breakdownTitleRow}>
                                        <Text style={styles.breakdownCat}>{cat.label}</Text>
                                        <Text style={styles.breakdownPercent}>{percent}% of spending</Text>
                                    </View>
                                    <View style={styles.breakdownBarBg}>
                                        <View style={[styles.breakdownBarFill, { width: `${percent}%`, backgroundColor: cat.color }]} />
                                    </View>
                                </View>
                                <Text style={styles.breakdownAmount}>RWF {val.toLocaleString()}</Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Settings Modal */}
            <Modal visible={settingsVisible} animationType="slide" transparent={true}>
                {/* Modal content omitted for brevity */}
            </Modal>

            {/* Budget Modal */}
            <Modal visible={budgetVisible} animationType="slide" transparent={true}>
                {/* Modal content omitted for brevity */}
            </Modal>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity /* navigation props omitted */>
                    <Icon name="house" size={18} color="#facc15" />
                    <Text style={styles.bottomNavTextActive}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Icon name="paper-plane" size={18} color="#666" />
                    <Text style={styles.bottomNavText}>Send</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Icon name="chart-pie" size={18} color="#666" />
                    <Text style={styles.bottomNavText}>Spending</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Icon name="clock-rotate-left" size={18} color="#666" />
                    <Text style={styles.bottomNavText}>History</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Define styles here mapping from your CSS to RN StyleSheet
    appContainer: {
        flex: 1,
        backgroundColor: '#fffbea',
        maxWidth: 420,
        marginHorizontal: 'auto',
        borderRadius: 22,
        shadowColor: '#818181',
        shadowOpacity: 0.96,
        shadowRadius: 32,
        paddingBottom: 30,
    },
    appContainerDark: {
        backgroundColor: '#0f1624',
    },
    topHeader:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        backgroundColor:'#fbbf24',
        borderTopLeftRadius:22,
        borderTopRightRadius:22,
        paddingHorizontal:18,
        paddingVertical:1,
    },
    brandLabel: {
        backgroundColor:'#1f1f1f',
        color:'#fad02e',
        fontWeight: '900',
        borderRadius: 20,
        paddingHorizontal:15,
        paddingVertical:1,
        fontSize:12,
        shadowColor: '#ffc02d80',
        shadowOpacity:1,
        shadowRadius: 3,
    },
    settingsBtn: {
        backgroundColor: '#fbbf24',
        width: 30,
        height: 30,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appContentWrapper: {
        paddingHorizontal: 10,
    },
    titleRow: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingVertical: 12,
    },
    titleTextGroup: {
        flexDirection:'column',
    },
    screenIndicator: {
        fontWeight: '600',
        fontSize: 16,
        color: '#000',
        lineHeight: 19,
        marginBottom: 4,
    },
    activeScreenIndicator: {},
    subTitleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#b2b2b2',
    },
    downloadBtn: {
        flexDirection:'row',
        borderWidth: 1,
        borderColor: '#d99e07',
        borderRadius: 9,
        paddingHorizontal: 10,
        paddingVertical: 7,
        alignItems: 'center',
        gap: 5,
    },
    downloadBtnText: {
        color: '#d99e07',
        fontWeight: 'bold',
        fontSize: 14,
    },
    settingsBtn2: {
        backgroundColor:'#fbbf24',
        width: 30,
        height: 30,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    spentCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 10,
        marginVertical: 15,
        alignItems:'center',
    },
    spentLabel: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 5,
        color: '#000',
    },
    spentAmount: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    progressDesc: {
        fontSize: 12,
        color: '#999',
        marginBottom: 10,
    },
    progressBar: {
        width: '90%',
        height: 14,
        backgroundColor: '#e0e0e0',
        borderRadius: 7,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fbbf24',
    },
    donutCard: {
        flexDirection: 'column',
        alignItems:'center',
    },
    donutLegendRow: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 20,
        justifyContent: 'space-around',
        width: '95%',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems:'center',
        gap: 6,
    },
    legendDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
    },
    categoryDetailsContainer: {
        paddingVertical: 12,
        width: '100%',
    },
    categoryDetailsTitle: {
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 12,
        color: '#333',
    },
    breakdownCard: {
        flexDirection:'row',
        alignItems:'center',
        marginVertical: 4,
        marginHorizontal: 10,
    },
    breakdownIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent:'center',
        alignItems:'center',
        marginRight: 10,
    },
    breakdownMain: {
        flex: 1,
    },
    breakdownTitleRow: {
        flexDirection: 'row',
        justifyContent:'space-between',
    },
    breakdownCat: {
        fontWeight: '700',
        fontSize: 14,
        color: '#111',
    },
    breakdownPercent: {
        fontWeight: '600',
        fontSize: 12,
        color: '#777',
    },
    breakdownBarBg: {
        backgroundColor:'#eee',
        borderRadius: 10,
        height: 8,
        marginTop: 6,
    },
    breakdownBarFill: {
        height: 8,
        borderRadius: 10,
    },
    breakdownAmount: {
        fontWeight: '700',
        fontSize: 14,
        marginLeft: 10,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: '#fffbea',
    },
    bottomNavText: {
        fontSize: 12,
        color: '#bbaa1e',
        fontWeight: '600',
    },
    bottomNavTextActive: {
        fontSize: 12,
        color: '#facc15',
        fontWeight: '600',
    }
});
