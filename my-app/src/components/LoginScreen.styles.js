import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2b3547',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        flexDirection: 'row',
        width: 100,
        height: 100,
        borderRadius: 60,
        borderWidth: 5,
        borderColor: '#FFC107',
        backgroundColor: '#1a1a2e',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: 'rgba(255, 193, 7, 0.3)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
    },
    logoText: {
        color: '#FFC107',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
        textTransform: 'capitalize',
        textShadowColor: 'rgba(255, 193, 7, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    logoText2: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'capitalize',
    },
    welcomeTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        color: '#9ca3af',
        fontSize: 14,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        color: '#d1d5db',
        fontSize: 13,
        marginBottom: 8,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    formInput: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#1f2937',
        borderWidth: 2,
        borderColor: '#374151',
        borderRadius: 12,
        color: '#fff',
        fontSize: 14,
    },
    inputError: {
        borderColor: '#ef4444',
    },
    passwordToggle: {
        position: 'absolute',
        right: 16,
        padding: 5,
    },
    errorMessage: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 6,
    },
    rememberForgot: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    rememberMe: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rememberText: {
        color: '#d1d5db',
        fontSize: 13,
        marginLeft: 8,
    },
    forgotLink: {
        color: '#FFC107',
        fontSize: 13,
        fontWeight: '500',
    },
    submitBtn: {
        width: '100%',
        paddingVertical: 16,
        backgroundColor: '#FFC107',
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    submitBtnText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 16,
    },
    signupLink: {
        alignItems: 'center',
    },
    signupLinkText: {
        color: '#FFC107',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default styles;
