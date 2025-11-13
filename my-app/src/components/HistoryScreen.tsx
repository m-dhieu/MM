import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Modal,
    StyleSheet,
    SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome6";

type Transaction = {
    id: string;
    name: string;
    phone: string;
    amount: number;
    category: string;
    icon: string;
    statusIcon: string;
    status: string;
    date: string;
    time: string;
};

const mapCategoryAndIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case "deposit":
            return { category: "Income", icon: "hand-holding-dollar" };
        case "payment":
            return { category: "Merchant", icon: "store" };
        case "transfer":
            return { category: "Transfers", icon: "arrow-right-arrow-left" };
        case "other":
            return { category: "Others", icon: "circle-question" };
        case "utilities":
            return { category: "Utilities", icon: "bolt" };
        case "subscriptions":
            return { category: "Subscriptions", icon: "file-invoice-dollar" };
        case "loans":
            return { category: "Loans", icon: "money-bill-wave" };
        case "credit card":
            return { category: "Credit Card", icon: "credit-card" };
        case "insurance":
            return { category: "Insurance", icon: "shield-alt" };
        case "donations":
            return { category: "Donations", icon: "hand-holding-heart" };
        case "taxes":
            return { category: "Taxes", icon: "receipt" };
        case "memberships":
            return { category: "Memberships", icon: "users" };
        case "gym":
            return { category: "Gym", icon: "dumbbell" };
        default:
            return { category: "Unknown", icon: "question" };
    }
};

const normalizeTransactions = (rawData: any[]): Transaction[] => {
    return rawData.map((tx) => {
        const dateParts = tx.DateTime.split(" ")[0];
        const timeParts = tx.DateTime.split(" ")[1] + " " + (tx.DateTime.split(" ")[2] || "");
        const { category, icon } = mapCategoryAndIcon(tx.TransactionType);

        let participant = { Name: "Unknown", PhoneNumber: "" };
        if (tx.Participants && tx.Participants.length > 0) {
            participant = tx.Participants[0];
        }

        if (/your money account at/i.test(participant.Name)) participant.Name = "Bank Transfer";

        let messageText = (tx.MessageText || "").toLowerCase();
        let amount = tx.Amount;

        if (messageText.startsWith("you have received") || messageText.includes("deposit")) {
            amount = Math.abs(tx.Amount);
        } else if (
            messageText.startsWith("your payment of") ||
            messageText.startsWith("transferred to")
        ) {
            amount = -Math.abs(tx.Amount);
        } else {
            const outgoingCategories = [
                "bills",
                "bundles",
                "unknown",
                "other",
                "utilities",
                "subscriptions",
                "loans",
                "credit card",
                "insurance",
                "donations",
                "taxes",
                "memberships",
                "gym",
                "merchant",
            ];
            if (
                outgoingCategories.includes(category.toLowerCase()) ||
                participant.Name.toLowerCase().includes("linda")
            ) {
                amount = -Math.abs(tx.Amount);
            } else {
                amount = Math.abs(tx.Amount);
            }
        }

        return {
            id: "MPR" + dateParts.replace(/-/g, "") + String(tx.TransactionID).padStart(4, "0"),
            name: participant.Name,
            phone: participant.PhoneNumber,
            amount: amount,
            category: category,
            icon: icon,
            statusIcon: tx.Status.toLowerCase() === "confirmed" ? "circle-check" : "circle-xmark",
            status: tx.Status.toLowerCase() === "confirmed" ? "Completed" : tx.Status,
            date: dateParts,
            time: timeParts.trim(),
        };
    });
};

export default function HistoryScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchText, setSearchText] = useState("");
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [totalSent, setTotalSent] = useState(0);
    const [totalReceived, setTotalReceived] = useState(0);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [spendingBreakdown, setSpendingBreakdown] = useState(true);

    // ref for FlatList to scroll to end
    const flatListRef = useRef<FlatList>(null);

    // Simulate loading of data from local JSON database.js or API
    useEffect(() => {
        const rawData = window.transactionsDB || [];
        const normalized = normalizeTransactions(rawData);
        setTransactions(normalized);
    }, []);

    // Filter transactions by search text dynamically
    useEffect(() => {
        if (!searchText.trim()) {
            setFilteredTransactions(transactions);
        } else {
            const lowerSearch = searchText.toLowerCase();
            setFilteredTransactions(
                transactions.filter((tx) => {
                    return (
                        tx.name.toLowerCase().includes(lowerSearch) ||
                        tx.phone.includes(lowerSearch) ||
                        tx.category.toLowerCase().includes(lowerSearch)
                    );
                })
            );
        }
    }, [searchText, transactions]);

    // Compute sent/received totals based on filtered results
    useEffect(() => {
        let sent = 0,
            received = 0;
        filteredTransactions.forEach((tx) => {
            if (tx.amount > 0) received += tx.amount;
            else sent += Math.abs(tx.amount);
        });
        setTotalSent(sent);
        setTotalReceived(received);
    }, [filteredTransactions]);

    // Scroll to bottom when filtered transactions change
    useEffect(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, [filteredTransactions]);

    return (
        <SafeAreaView style={[styles.appContainer, darkMode && styles.appContainerDark]}>
            <View style={styles.topHeader}>
                <View style={styles.brandLabel}>
                    <Text style={styles.brandLabelText}>m-press</Text>
                </View>
                <TouchableOpacity style={styles.settingsBtn} onPress={() => setSettingsVisible(true)} accessibilityLabel="Settings">
                    <Icon name="cog" size={18} color="#1f2937" />
                </TouchableOpacity>
            </View>

            <View style={styles.titleRow}>
                <View style={styles.titleTextGroup}>
                    <Text style={[styles.screenIndicator, styles.active]}>Transactions</Text>
                    <Text style={styles.subTitleText}>All your MoMo Press activity</Text>
                </View>
                <TouchableOpacity style={styles.downloadBtn} onPress={() => alert("Download Statement feature coming soon")}>
                    <Icon name="download" size={16} color="#d99e07" />
                    <Text style={styles.downloadText}>Download Statement</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchbarWrap}>
                <Icon name="search" style={styles.searchbarIcon} />
                <TextInput
                    style={styles.searchbar}
                    placeholder="Search transactions..."
                    onChangeText={setSearchText}
                    value={searchText}
                />
            </View>

            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Received</Text>
                    <Text style={styles.summaryAmount}>RWF {totalReceived.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Sent</Text>
                    <Text style={styles.summaryAmount}>RWF {totalSent.toLocaleString()}</Text>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={filteredTransactions}
                keyExtractor={(item) => item.id}
                style={styles.transactionsList}
                renderItem={({ item }) => (
                    <View style={styles.transactionCard}>
                        <View style={styles.cardLeft}>
                            <View style={styles.cardTitle}>
                                <Icon
                                    name={item.icon}
                                    size={16}
                                    style={[
                                        styles.iconCircle,
                                        item.amount > 0 ? styles.iconPositive : styles.iconNegative,
                                    ]}
                                />
                                <Text style={styles.transactionName}>{item.name}</Text>
                            </View>
                            {item.phone ? <Text style={styles.cardPhone}>{item.phone}</Text> : null}
                            <Text style={styles.transactionDate}>{item.time}</Text>
                        </View>
                        <View style={styles.cardRight}>
                            <Text style={item.amount > 0 ? styles.amountPos : styles.amountNeg}>
                                {item.amount > 0 ? "+" : "-"} RWF {Math.abs(item.amount).toLocaleString()}
                            </Text>
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{item.category}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <Icon name={item.statusIcon} size={12} color="#047857" />
                                <Text style={styles.statusText}> {item.status}</Text>
                            </View>
                        </View>
                    </View>
                )}
            />

            {/* Settings Modal */}
            <Modal visible={settingsVisible} transparent animationType="slide">
                <View style={styles.settingsBackdrop}>
                    <View style={[styles.settingsModal, darkMode && styles.settingsModalDark]}>
                        <View style={styles.settingsHeader}>
                            <Text style={[styles.settingsTitle, darkMode && styles.settingsTitleDark]}>Settings</Text>
                            <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                                <Icon name="xmark" size={20} color={darkMode ? "#fbbf24" : "#000"} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.settingsBody}>
                            <View style={styles.featureGroup}>
                                <Text style={[styles.featureTitle, darkMode && styles.featureTitleDark]}>Spending Breakdown</Text>
                                <TouchableOpacity onPress={() => setSpendingBreakdown(!spendingBreakdown)}>
                                    <Text>{spendingBreakdown ? "On" : "Off"}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.featureGroup}>
                                <Text style={[styles.featureTitle, darkMode && styles.featureTitleDark]}>Dark Mode</Text>
                                <TouchableOpacity onPress={() => setDarkMode(!darkMode)}>
                                    <Text>{darkMode ? "On" : "Off"}</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.logoutBtn}
                                onPress={() => alert("Logout functionality to be implemented")}
                            >
                                <Icon name="right-from-bracket" size={16} color="#b91c1c" />
                                <Text style={styles.logoutText}>Log out</Text>
                            </TouchableOpacity>
                            <View style={styles.aboutMoMo}>
                                <Text style={styles.aboutMoMoText}>MoMo Press v1.0</Text>
                                <Text style={styles.aboutDesc}>Track your MoMo spending and manage your finances</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
        backgroundColor: "#fffbea",
    },
    appContainerDark: {
        backgroundColor: "#0f1624",
    },
    topHeader: {
        backgroundColor: "#fbbf24",
        paddingVertical: 1,
        paddingHorizontal: 18,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    brandLabel: {
        backgroundColor: "#1f1f1f",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 1,
    },
    brandLabelText: {
        color: "#fad02e",
        fontWeight: "900",
        fontSize: 12,
    },
    settingsBtn: {
        backgroundColor: "#fbbf24",
        borderRadius: 9,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 18,
        backgroundColor: "#fffbea",
    },
    titleTextGroup: {
        flexDirection: "column",
    },
    screenIndicator: {
        fontWeight: "600",
        fontSize: 16,
        color: "#000",
        lineHeight: 1.2,
        marginBottom: 4,
    },
    active: {},
    subTitleText: {
        fontSize: 14,
        color: "#b2b2b2",
        fontWeight: "600",
    },
    downloadBtn: {
        flexDirection: "row",
        backgroundColor: "transparent",
        borderColor: "#d99e07",
        borderWidth: 1,
        borderRadius: 9,
        paddingVertical: 7,
        paddingHorizontal: 14,
        fontWeight: "bold",
        fontSize: 14,
        alignItems: "center",
        gap: 4,
    },
    downloadText: {
        color: "#d99e07",
        fontWeight: "bold",
        fontSize: 14,
    },
    searchbarWrap: {
        position: "relative",
        marginVertical: 16,
        marginHorizontal: 18,
    },
    searchbarIcon: {
        position: "absolute",
        left: 15,
        top: "50%",
        transform: [{ translateY: -12 }],
        fontSize: 12,
        color: "#b2b2b2",
    },
    searchbar: {
        height: 36,
        borderRadius: 16,
        borderColor: "#fff",
        borderWidth: 1,
        paddingLeft: 38,
        paddingRight: 10,
        fontSize: 12,
        backgroundColor: "#fff",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 22,
        marginHorizontal: 8,
    },
    summaryCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 35,
        fontWeight: "bold",
        fontSize: 15,
        shadowColor: "#fad02e",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 2,
        alignItems: "center",
    },
    summaryLabel: {
        fontWeight: "600",
        fontSize: 14,
        color: "#b2b2b2",
        marginBottom: 8,
    },
    summaryAmount: {
        fontWeight: "600",
        fontSize: 18,
    },
    transactionsList: {
        marginTop: 22,
        marginHorizontal: 14,
        maxHeight: 420,
    },
    transactionCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 10,
        marginBottom: 10,
        shadowColor: "#fad02e",
        shadowOpacity: 0.14,
        shadowRadius: 10,
        elevation: 2,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cardLeft: {
        flex: 1,
    },
    cardTitle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        fontWeight: "600",
        fontSize: 14,
        color: "#1f2937",
    },
    iconCircle: {
        borderRadius: 10,
        padding: 4,
        width: 20,
        height: 20,
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
    },
    iconPositive: {
        backgroundColor: "#bbf7d0",
        color: "#059669",
        shadowColor: "#bbf7d0aa",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
    },
    iconNegative: {
        backgroundColor: "#fecaca",
        color: "#b91c1c",
        shadowColor: "#fecacaaa",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
    },
    transactionName: {
        color: "#1f2937",
    },
    cardPhone: {
        fontSize: 10,
        color: "#b2b2b2",
        marginLeft: 40,
    },
    transactionDate: {
        fontSize: 11,
        color: "#b2b2b2",
        marginTop: 4,
    },
    cardRight: {
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 6,
    },
    amountPos: {
        color: "#10b981",
        fontWeight: "600",
        fontSize: 12,
    },
    amountNeg: {
        color: "#ef4444",
        fontWeight: "600",
        fontSize: 12,
    },
    categoryBadge: {
        backgroundColor: "#faf3c7",
        color: "#eab308",
        borderRadius: 9,
        paddingHorizontal: 8,
        paddingVertical: 2,
        fontSize: 11,
        fontWeight: "600",
        minWidth: 55,
        textAlign: "center",
    },
    categoryText: {
        fontSize: 11,
        fontWeight: "600",
    },
    statusBadge: {
        backgroundColor: "#d1fae5",
        color: "#047857",
        borderRadius: 9,
        paddingHorizontal: 8,
        paddingVertical: 2,
        fontSize: 11,
        fontWeight: "600",
        flexDirection: "row",
        alignItems: "center",
    },
    statusText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#047857",
        marginLeft: 4,
    },
    settingsBackdrop: {
        flex: 1,
        backgroundColor: "#00000088",
        justifyContent: "center",
        alignItems: "center",
    },
    settingsModal: {
        backgroundColor: "#fff",
        borderRadius: 22,
        width: 410,
        maxWidth: "90%",
        minWidth: 305,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    settingsModalDark: {
        backgroundColor: "#0f1624",
    },
    settingsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    settingsTitle: {
        fontSize: 22,
        fontWeight: "700",
    },
    settingsTitleDark: {
        color: "#fbbf24",
    },
    settingsBody: {
        marginTop: 8,
    },
    featureGroup: {
        marginBottom: 30,
    },
    featureTitle: {
        fontWeight: "600",
        fontSize: 18,
        marginBottom: 10,
    },
    logoutBtn: {
        backgroundColor: "#fee2e2",
        color: "#b91c1c",
        borderRadius: 10,
        padding: 14,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
    },
    logoutText: {
        fontWeight: "700",
        fontSize: 16,
        color: "#b91c1c",
    },
    aboutMoMo: {
        marginTop: 24,
        alignItems: "center",
    },
    aboutMoMoText: {
        fontWeight: "700",
        fontSize: 14,
    },
    aboutDesc: {
        fontSize: 12,
        color: "#555",
        marginTop: 4,
        textAlign: "center",
    },
});
