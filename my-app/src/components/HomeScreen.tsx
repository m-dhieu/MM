import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome6";

type Transaction = {
    id: string;
    name: string;
    phone: string;
    amount: number;
    category: string;
    date: string;
    time: string;
    status: string;
};

export default function HomeScreen({ navigation }) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Summary stats
    const [balance, setBalance] = useState<number>(0);
    const [monthAmount, setMonthAmount] = useState<number>(0);
    const [totals, setTotals] = useState({
        Transfers: 0,
        Airtime: 0,
        Merchants: 0,
        Utilities: 0,
    });
    const [counts, setCounts] = useState({ sent: 0, received: 0, total: 0 });

    // Fetch transactions from backend API
    useEffect(() => {
        fetch("http://localhost:3000/api/updateTransactions?year=2025&month=11")
            .then((res) => res.json())
            .then((data) => {
                // data assumed to be array of transaction objects
                if (data.success) {
                    const txs: Transaction[] = data.transactions;
                    setTransactions(txs);
                    processData(txs);
                } else {
                    console.warn("Failed to fetch transactions");
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Fetch error:", error);
                setLoading(false);
            });
    }, []);

    // Process transactions to compute stats
    const processData = (txs: Transaction[]) => {
        let bal = 0;
        let monthAmt = 0;
        let totalSent = 0;
        let totalReceived = 0;
        const categoryTotals = {
            Transfers: 0,
            Airtime: 0,
            Merchants: 0,
            Utilities: 0,
        };

        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        txs.forEach((tx) => {
            bal += tx.amount;

            const txDate = new Date(tx.date);
            if (txDate >= last7Days && txDate <= now) {
                monthAmt += tx.amount;
            }

            if (tx.amount < 0) {
                totalSent++;
            }
            if (tx.amount > 0) {
                totalReceived++;
            }

            const cat = tx.category.toLowerCase();
            if (cat.includes("transfer")) {
                categoryTotals.Transfers += Math.abs(tx.amount);
            } else if (cat.includes("airtime")) {
                categoryTotals.Airtime += Math.abs(tx.amount);
            } else if (cat.includes("merchant")) {
                categoryTotals.Merchants += Math.abs(tx.amount);
            } else if (cat.includes("utility")) {
                categoryTotals.Utilities += Math.abs(tx.amount);
            }
        });

        setBalance(bal);
        setMonthAmount(monthAmt);
        setTotals(categoryTotals);
        setCounts({
            sent: totalSent,
            received: totalReceived,
            total: txs.length,
        });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#FFC107" />
                <Text style={{ marginTop: 12, color: "#FFC107" }}>Loading...</Text>
            </View>
        );
    }

    // Helper to compute percentage for chart segments
    const totalSpending = Object.values(totals).reduce((a, b) => a + b, 0);
    const getPercent = (val: number) =>
        totalSpending ? ((val / totalSpending) * 100).toFixed(0) : "0";

    return (
        <View style={styles.appContainer}>
            <View style={styles.header}>
                <View style={styles.mtnBadge}>
                    <Text style={styles.mtnBadgeText}>m-press</Text>
                </View>
                <TouchableOpacity onPress={() => alert("Settings pressed")}>
                    <Icon name="gear" size={30} color="#1f2937" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.welcome}>
                    <Text style={styles.welcomeTitle}>MoMo Press</Text>
                    <Text style={styles.welcomeSubtitle}>Welcome back!</Text>
                </View>

                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Available Balance</Text>
                    <Text style={styles.balanceAmount}>RWF {balance.toFixed(2)}</Text>
                    <Text style={styles.thisMonth}>This Month (Last 7 Days)</Text>
                    <Text style={styles.monthAmount}>RWF {monthAmount.toFixed(2)}</Text>
                    <TouchableOpacity
                        style={styles.mtnMomoBtn}
                        onPress={() => alert("M-Press MoMo clicked")}
                    >
                        <Text style={styles.mtnMomoBtnText}>M-Press MoMo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate("Send")}
                    >
                        <View style={[styles.actionIcon, styles.sendIcon]}>
                            <Icon name="paper-plane" size={24} color="#fff" />
                        </View>
                        <Text style={styles.actionLabel}>Send Money</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn}>
                        <View style={[styles.actionIcon, styles.cashoutIcon]}>
                            <Icon name="wallet" size={24} color="#fff" />
                        </View>
                        <Text style={styles.actionLabel}>Cash Out</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn}>
                        <View style={[styles.actionIcon, styles.airtimeIcon]}>
                            <Icon name="mobile" size={24} color="#fff" />
                        </View>
                        <Text style={styles.actionLabel}>Buy Airtime</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn}>
                        <View style={[styles.actionIcon, styles.paybillIcon]}>
                            <Icon name="file-invoice-dollar" size={24} color="#fff" />
                        </View>
                        <Text style={styles.actionLabel}>Pay Bill</Text>
                    </TouchableOpacity>
                </View>

                {/* Spending Section - donut chart segments data display as colored dots and percentages */}
                <View style={styles.spendingSection}>
                    <Text style={styles.sectionTitle}>Spending This Week</Text>
                    <View style={styles.spendingContent}>
                        <View style={styles.donutChart}>
                            <View
                                style={[
                                    styles.donutSegment,
                                    styles.segmentTransfers,
                                    { height: `${getPercent(totals.Transfers)}%` },
                                ]}
                            />
                            <View
                                style={[
                                    styles.donutSegment,
                                    styles.segmentAirtime,
                                    { height: `${getPercent(totals.Airtime)}%` },
                                ]}
                            />
                            <View
                                style={[
                                    styles.donutSegment,
                                    styles.segmentMerchants,
                                    { height: `${getPercent(totals.Merchants)}%` },
                                ]}
                            />
                            <View
                                style={[
                                    styles.donutSegment,
                                    styles.segmentUtilities,
                                    { height: `${getPercent(totals.Utilities)}%` },
                                ]}
                            />
                            <View style={styles.donutCenter}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalAmount}>{totalSpending.toFixed(0)}</Text>
                            </View>
                        </View>
                        <View style={styles.spendingLegend}>
                            {Object.entries(totals).map(([key, val]) => (
                                <View key={key} style={styles.legendItem}>
                                    <View style={styles.legendLabel}>
                                        <View style={[styles.legendDot, styles[`dot${key}`]]} />
                                        <Text style={styles.legendText}>{key}</Text>
                                    </View>
                                    <Text style={styles.legendPercentage}>{getPercent(val)}%</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{counts.total}</Text>
                        <Text style={styles.statLabel}>Transactions</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{counts.sent}</Text>
                        <Text style={styles.statLabel}>Sent</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{counts.received}</Text>
                        <Text style={styles.statLabel}>Received</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={[styles.bottomNavLink, styles.activeNav]}>
                    <Icon name="house" size={20} color="#facc15" />
                    <Text style={styles.bottomNavTextActive}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.bottomNavLink}
                    onPress={() => navigation.navigate("Send")}
                >
                    <Icon name="paper-plane" size={20} color="#666" />
                    <Text style={styles.bottomNavText}>Send</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.bottomNavLink}
                    onPress={() => navigation.navigate("Spending")}
                >
                    <Icon name="chart-pie" size={20} color="#666" />
                    <Text style={styles.bottomNavText}>Spending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.bottomNavLink}
                    onPress={() => navigation.navigate("History")}
                >
                    <Icon name="clock-rotate-left" size={20} color="#666" />
                    <Text style={styles.bottomNavText}>History</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    appContainer: { flex: 1, backgroundColor: "#f5f5f5" },
    header: {
        flexDirection: "row",
        padding: 16,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fad02e",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    mtnBadge: {
        backgroundColor: "#1f1f1f",
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
    },
    mtnBadgeText: { color: "#fad02e", fontWeight: "900", fontSize: 12 },
    container: { padding: 16 },
    welcome: { marginBottom: 20 },
    welcomeTitle: { fontSize: 20, fontWeight: "600", color: "#1a1a1a" },
    welcomeSubtitle: { fontSize: 14, color: "#999" },
    balanceCard: {
        backgroundColor: "#FFC107",
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        shadowColor: "#FFC307",
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
    },
    balanceLabel: { fontSize: 14, color: "#664d00", marginBottom: 8 },
    balanceAmount: { fontSize: 32, fontWeight: "700", color: "#000", marginBottom: 20 },
    thisMonth: { fontSize: 13, color: "#664d00", marginBottom: 4 },
    monthAmount: { fontSize: 16, fontWeight: "600", color: "#000" },
    mtnMomoBtn: {
        position: "absolute",
        right: 24,
        bottom: 24,
        backgroundColor: "#1f1f1f",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    mtnMomoBtnText: { color: "#FFC107", fontSize: 12, fontWeight: "600" },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 32,
    },
    actionBtn: {
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 16,
        flex: 1,
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginBottom: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    sendIcon: { backgroundColor: "#FFC107" },
    cashoutIcon: { backgroundColor: "#FF6B35" },
    airtimeIcon: { backgroundColor: "#4285F4" },
    paybillIcon: { backgroundColor: "#00D084" },
    actionLabel: { fontSize: 12, color: "#666", textAlign: "center" },
    spendingSection: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        marginBottom: 80,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 24 },
    spendingContent: { flexDirection: "row", gap: 24, alignItems: "center", marginBottom: 24 },
    donutChart: {
        position: "relative",
        width: 120,
        height: 120,
        flexShrink: 0,
        backgroundColor: "#eee0",
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
    },
    donutSegment: {
        position: "absolute",
        width: 20,
        borderRadius: 10,
        bottom: 0,
    },
    segmentTransfers: { backgroundColor: "#FFC107", left: 10 },
    segmentAirtime: { backgroundColor: "#FFD54F", left: 35 },
    segmentMerchants: { backgroundColor: "#FFE082", right: 35 },
    segmentUtilities: { backgroundColor: "#FFECB3", right: 10 },
    donutCenter: {
        position: "absolute",
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
    },
    totalLabel: { fontSize: 11, color: "#999" },
    totalAmount: { fontSize: 20, fontWeight: "700", color: "#333" },
    spendingLegend: { flex: 1 },
    legendItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    legendLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    dotTransfers: { backgroundColor: "#FFC107" },
    dotAirtime: { backgroundColor: "#FFD54F" },
    dotMerchants: { backgroundColor: "#FFE082" },
    dotUtilities: { backgroundColor: "#FFECB3" },
    legendText: { fontSize: 13, color: "#666" },
    legendPercentage: { fontSize: 13, fontWeight: "600", color: "#333" },
    statsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
    },
    statItem: {
        flex: 1,
        backgroundColor: "#f8f8f8",
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
        marginHorizontal: 5,
    },
    statNumber: { fontSize: 32, fontWeight: "700", color: "#333", marginBottom: 8 },
    statLabel: { fontSize: 13, color: "#666", fontWeight: "500" },
    bottomNav: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        backgroundColor: "#fff",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    bottomNavLink: { alignItems: "center" },
    activeNav: { color: "#FACC15" },
    bottomNavText: { fontSize: 12, color: "#666" },
    bottomNavTextActive: { fontSize: 12, color: "#facc15", fontWeight: "600" },
});
