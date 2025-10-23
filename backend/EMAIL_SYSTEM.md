# Système Email - Pharmacie.tn

Ce document décrit le système d'email complet de Pharmacie.tn, incluant les templates, les traductions françaises, et la gestion des comptes.

## Vue d'ensemble

Le système d'email utilise :
- **Langue** : Français uniquement (formel et poli)
- **Template de base** : `base.html` avec logo centré
- **Génération de mots de passe** : Sécurisée et aléatoire
- **Audit logging** : Tous les emails sont tracés

## Template de Base

### Structure
- Logo centré : "Pharmacy" en vert (#2ECC71) et ".tn" en noir
- Contenu dynamique via `{{content}}`
- Footer avec copyright
- Design responsive pour clients email

### Utilisation
Tous les emails utilisent le template de base :
```typescript
const htmlContent = this.baseTemplate.replace('{{content}}', emailBody);
```

## Types d'Emails

### 1. Email de Bienvenue (Nouveau Compte)

**Déclencheur** : Création de compte par un administrateur
**Template** : `sendWelcomeEmail()`

**Contenu** :
- Salutation personnalisée
- Identifiants de connexion (email + mot de passe généré)
- Note sur la modification du mot de passe
- Lien d'accès à la plateforme
- Contact support

**Exemple** :
```
Bonjour [Nom],
Votre compte [Rôle] a été créé avec succès sur la plateforme Pharmacie.tn.

Vos identifiants de connexion :
- Identifiant : [email]
- Mot de passe : [mot de passe généré]

Note importante : Vous pouvez conserver ce mot de passe ou le modifier à tout moment depuis vos paramètres de profil.
```

### 2. Réinitialisation de Mot de Passe

**Déclencheur** : Demande de réinitialisation
**Template** : `sendPasswordResetEmail()`

**Contenu** :
- Lien sécurisé de réinitialisation
- Expiration (1 heure)
- Instructions de sécurité

### 3. Confirmation de Changement de Mot de Passe

**Déclencheur** : Mot de passe modifié avec succès
**Template** : `sendPasswordResetConfirmation()`

**Contenu** :
- Confirmation de mise à jour
- Alerte de sécurité si non autorisé

### 4. Rappel de Fin d'Essai

**Déclencheur** : 5 jours avant la fin de l'essai
**Template** : `sendTrialEndingReminder()`

**Contenu** :
- Date de fin d'essai
- Contact support pour renouvellement
- **Pas de lien de paiement** (Tunisie)

### 5. Notification d'Abonnement Expiré

**Déclencheur** : Abonnement expiré
**Template** : `sendSubscriptionExpired()`

**Contenu** :
- Notification d'expiration
- Contact support pour renouvellement
- **Pas de lien de paiement** (Tunisie)

### 6. Confirmation de Ticket de Support

**Déclencheur** : Création de ticket
**Template** : `sendSupportTicketConfirmation()`

**Contenu** :
- Numéro de ticket
- Sujet
- Délai de réponse

### 7. Réponse à Ticket de Support

**Déclencheur** : Nouvelle réponse admin
**Template** : `sendSupportTicketReply()`

**Contenu** :
- Numéro de ticket
- Message de réponse
- Formatage spécial

### 8. Notification Importante

**Déclencheur** : Événements système importants
**Template** : `sendImportantNotification()`

**Contenu** :
- Titre personnalisé
- Message formaté
- Style spécial

## Génération de Mots de Passe

### Caractéristiques
- **Longueur** : 12-16 caractères
- **Complexité** : Majuscules, minuscules, chiffres, symboles
- **Sécurité** : Utilise `crypto.randomInt()` pour la cryptographie
- **Exemple** : `G7x!qP9bZ2d@`

### Implémentation
```typescript
const password = PasswordGenerator.generatePassword();
// Génère un mot de passe sécurisé de 12-16 caractères
```

## Audit Logging

### Événements Traces
1. **EMAIL_SENT** - Email envoyé avec succès
2. **EMAIL_FAILED** - Échec d'envoi d'email
3. **ACCOUNT_CREATED** - Compte créé par admin
4. **WELCOME_EMAIL_SENT** - Email de bienvenue envoyé

### Détails Loggés
- Destinataire
- Sujet
- Message ID
- Erreurs (si échec)
- Timestamp

## Configuration

### Variables d'Environnement
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Pharmacie.tn <your-email@gmail.com>
FRONTEND_URL=https://pharmacie.tn
```

### Configuration Gmail (Recommandé)

#### 1. Activer l'Authentification à 2 Facteurs
- Allez sur https://myaccount.google.com/security
- Activez "Validation en 2 étapes"

#### 2. Générer un Mot de Passe d'Application
- Allez sur https://myaccount.google.com/apppasswords
- Sélectionnez "Mail" dans "Sélectionner l'application"
- Sélectionnez votre appareil ou "Autre (nom personnalisé)"
- Copiez le mot de passe généré (16 caractères)
- Utilisez ce mot de passe dans `EMAIL_PASS`

#### 3. Vérification
- Le mot de passe d'application commence généralement par 4 lettres
- Il est différent de votre mot de passe Gmail normal
- Il expire si vous désactivez l'authentification à 2 facteurs

### Initialisation
```typescript
await EmailService.initialize();
// Charge le template de base
// Vérifie la connexion SMTP
```

## Gestion des Erreurs

### Stratégies
1. **Fallback Template** : Template de base en cas d'échec de chargement
2. **Logging d'Erreurs** : Toutes les erreurs sont tracées
3. **Non-Bloquant** : Les échecs d'email n'interrompent pas le flux principal
4. **Retry Logic** : Possibilité d'ajouter une logique de retry

### Messages d'Erreur
- Tous en français
- Messages d'erreur clairs
- Suggestions de résolution

## Sécurité

### Bonnes Pratiques
1. **Mots de passe sécurisés** : Génération cryptographique
2. **Expiration des liens** : 1 heure pour réinitialisation
3. **Validation d'email** : Format et unicité
4. **Audit complet** : Toutes les actions tracées
5. **Pas de données sensibles** : Mots de passe jamais stockés en clair

### Conformité
- **RGPD** : Consentement et droit à l'oubli
- **Tunisie** : Pas de liens de paiement automatique
- **Sécurité** : Chiffrement des communications

## Tests

### Scénarios de Test
1. **Création de compte** : Email de bienvenue avec identifiants
2. **Réinitialisation** : Lien sécurisé et confirmation
3. **Notifications** : Rappels et alertes
4. **Support** : Tickets et réponses
5. **Erreurs** : Gestion des échecs SMTP

### Validation
- Format des emails
- Contenu en français
- Template de base
- Audit logging
- Sécurité des mots de passe

## Maintenance

### Monitoring
- Logs d'envoi d'emails
- Taux de succès/échec
- Temps de livraison
- Quotas SMTP

### Mise à Jour
- Templates HTML
- Traductions françaises
- Configuration SMTP
- Sécurité des mots de passe

## Support

### Problèmes Courants
1. **Échec SMTP** : Vérifier les credentials
2. **Template manquant** : Vérifier le fichier base.html
3. **Mots de passe faibles** : Vérifier la génération
4. **Audit manquant** : Vérifier les logs

### Contact
- Équipe technique : support@pharmacie.tn
- Documentation : Voir AUDIT_LOGGING.md
- API : Voir API.md 