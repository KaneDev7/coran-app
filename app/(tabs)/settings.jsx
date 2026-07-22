import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Share,
} from 'react-native'
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons'
import { ConfirmDialog } from 'react-native-simple-dialogs'
import { primary, secondary, secondary3 } from '@/style/variables'
import { useAuth } from '@/context/AuthContext'

// Liens externes : à remplacer par les vraies URLs quand elles existeront.
const LINKS = [
  {
    icon: 'share-variant',
    label: "Partager l'application",
    action: () =>
      Share.share({
        message: "Découvrez cette application d'écoute du Coran !",
      }),
  },
  {
    icon: 'star-outline',
    label: "Noter l'application",
    action: () => Linking.openURL('https://play.google.com/store'),
  },
  {
    icon: 'email-outline',
    label: 'Nous contacter',
    action: () => Linking.openURL('mailto:oumarkane455@gmail.com'),
  },
  {
    icon: 'shield-lock-outline',
    label: 'Politique de confidentialité',
    action: () => Linking.openURL('https://example.com/privacy'),
  },
  {
    icon: 'information-outline',
    label: 'À propos',
    action: () => Linking.openURL('https://example.com/about'),
  },
]

export default function Settings() {
  const { user, logout } = useAuth()
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ---- Profil ---- */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Feather name="user" size={30} color="#fff" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.fullName}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.planBadge}>
            <MaterialCommunityIcons
              name={user?.premium ? 'crown-outline' : 'account-outline'}
              size={13}
              color={secondary}
            />
            <Text style={styles.planBadgeText}>
              {user?.premium ? 'Compte Premium' : 'Compte gratuit'}
            </Text>
          </View>
        </View>
      </View>

      {/* ---- Premium (préparation) ---- */}
      <View style={styles.premiumCard}>
        <View style={styles.premiumHeader}>
          <MaterialCommunityIcons name="crown-outline" size={24} color="#b8860b" />
          <Text style={styles.premiumTitle}>Passer à Premium</Text>
        </View>
        <Text style={styles.premiumDesc}>
          Téléchargements hors ligne illimités et nouvelles fonctionnalités à
          venir.
        </Text>
        <View style={styles.premiumButton}>
          <Text style={styles.premiumButtonText}>Bientôt disponible</Text>
        </View>
      </View>

      {/* ---- Liens ---- */}
      <View style={styles.linksCard}>
        {LINKS.map((link, i) => (
          <Pressable
            key={link.label}
            style={[styles.linkRow, i < LINKS.length - 1 && styles.linkRowBorder]}
            onPress={link.action}
          >
            <MaterialCommunityIcons name={link.icon} size={22} color={primary} />
            <Text style={styles.linkLabel}>{link.label}</Text>
            <MaterialIcons name="chevron-right" size={22} color={secondary} />
          </Pressable>
        ))}
      </View>

      {/* ---- Déconnexion ---- */}
      <Pressable
        style={styles.logoutButton}
        onPress={() => setLogoutDialogVisible(true)}
      >
        <MaterialIcons name="logout" size={20} color="#dc3545" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </Pressable>

      <Text style={styles.version}>Version 1.0.0</Text>

      <ConfirmDialog
        title="Déconnexion"
        message="Voulez-vous vraiment vous déconnecter ?"
        visible={logoutDialogVisible}
        onTouchOutside={() => setLogoutDialogVisible(false)}
        positiveButton={{
          title: 'Se déconnecter',
          titleStyle: { color: '#dc3545' },
          onPress: () => {
            setLogoutDialogVisible(false)
            logout()
          },
        }}
        negativeButton={{
          title: 'Annuler',
          titleStyle: { color: primary },
          onPress: () => setLogoutDialogVisible(false),
        }}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: secondary3,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    gap: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: primary,
  },
  profileEmail: {
    fontSize: 13,
    color: secondary,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: secondary3,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  planBadgeText: {
    fontSize: 12,
    color: secondary,
  },
  premiumCard: {
    backgroundColor: '#fff8e7',
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#f0e2bb',
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b8860b',
  },
  premiumDesc: {
    fontSize: 13,
    color: secondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  premiumButton: {
    backgroundColor: '#b8860b',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    opacity: 0.55,
  },
  premiumButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  linksCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 14,
  },
  linkRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1ece5',
  },
  linkLabel: {
    flex: 1,
    fontSize: 15,
    color: primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.25)',
  },
  logoutText: {
    color: '#dc3545',
    fontSize: 15,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: secondary,
    fontSize: 12,
    marginTop: 24,
  },
})
