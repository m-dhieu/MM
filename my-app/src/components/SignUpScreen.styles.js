import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2b3547',
        paddingVertical: 12,
        paddingHorizontal: 32,
        flexGrow: 1,
        justifyContent: 'center',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
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
        marginBottom: 16,
        shadowColor: 'rgba(255, 193, 7, 0.3)',
        shadowOpacity: 1,
        shadowRadius: 20,
    },
    logoText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFC107',
        letterSpacing: 0.5,
        textTransform: 'capitalize',
        textShadowColor: 'rgba(255, 193, 7, 0.5)',
        textShadowRadius: 10,
    },
    logoText2: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
        textTransform: 'capitalize',
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
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#1f2937',
        borderColor: '#374151',
        borderWidth: 2,
        borderRadius: 12,
        color: '#fff',
        fontSize: 14,
    },
    inputError: {
        borderColor: '#ef4444',
    },
    inputSuccess: {
        borderColor: '#10b981',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    passwordToggle: {
        position: 'absolute',
        right: 16,
        padding: 5,
    },
    errorMessage: {
        fontSize: 12,
        marginTop: 6,
        color: '#ef4444',
    },
    successMessage: {
        fontSize: 12,
        marginTop: 6,
        color: '#10b981',
    },
    passwordStrength: {
        marginTop: 8,
        display: 'none',
    },
    passwordStrengthShow: {
        display: 'flex',
    },
    strengthBar: {
        height: 4,
        borderRadius: 2,
        backgroundColor: '#374151',
        overflow: 'hidden',
        marginBottom: 4,
    },
    strengthFill: {
        height: '100%',
        width: '0%',
        transitionProperty: 'all',
        transitionDuration: '0.3s',
    },
    strengthText: {
        fontSize: 11,
        color: '#9ca3af',
    },
    submitBtn: {
        backgroundColor: '#FFC107',
        borderRadius: 12,
        paddingVertical: 16,
        marginTop: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    submitBtnText: {
        fontWeight: '700',
        fontSize: 16,
        color: '#000',
    },
    signinLink: {
        alignItems: 'center',
    },
    signinText: {
        fontSize: 14,
        color: '#9ca3af',
    },
    signinLinkText: {
        fontWeight: '600',
        color: '#FFC107',
        textDecorationLine: 'underline',
    },
});

export default styles;
