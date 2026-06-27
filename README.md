# Bot Semper Vincere — Économie de pièces

Bot Discord avec système de pièces : les membres en gagnent en discutant, achètent un rôle « Pub Communautaire », et le perdent dès qu'ils postent.

---

## Installation

```bash
npm install
```

---

## Configuration

### 1. `.env` — Secrets (ne jamais committer)

```
DISCORD_TOKEN=ton_token_ici
CLIENT_ID=ton_client_id_ici
```

**Où les trouver :** [Discord Developer Portal](https://discord.com/developers/applications) → ton application → onglet **Bot** (token) et onglet **General Information** (Application ID = CLIENT_ID).

### 2. `config.json` — Paramètres du serveur

Active le **Mode développeur** dans Discord (Paramètres → Avancés), puis fais un clic droit sur chaque élément → « Copier l'identifiant » pour remplir ces champs :

| Champ | Description |
|---|---|
| `GUILD_ID` | ID du serveur |
| `EARN_CHANNEL_ID` | Salon où les membres gagnent des pièces |
| `AD_CHANNEL_ID` | Salon pub (où le rôle est retiré après le post) |
| `PUB_ROLE_ID` | ID du rôle « Pub Communautaire » |
| `INVITE_ROLE_ID` | ID du rôle invité (optionnel, voir `RESTRICT_EARN_TO_INVITE_ROLE`) |
| `COINS_PER_MESSAGE` | Pièces par message éligible (défaut : 5) |
| `EARN_COOLDOWN_MS` | Délai minimum entre deux gains en ms (défaut : 60000 = 1 min) |
| `PUB_PRICE` | Coût du rôle pub en pièces (défaut : 100) |
| `MIN_MESSAGE_LENGTH` | Longueur minimale d'un message pour rapporter des pièces (défaut : 4) |
| `RESTRICT_EARN_TO_INVITE_ROLE` | Si `true`, seuls les membres avec `INVITE_ROLE_ID` gagnent des pièces (défaut : false) |

---

## Intents à activer (Developer Portal → onglet Bot)

- ✅ **MESSAGE CONTENT INTENT**
- ✅ **SERVER MEMBERS INTENT**

---

## Permissions du bot (lien d'invitation)

Scopes : `bot` + `applications.commands`

Permissions :
- Voir les salons
- Envoyer des messages
- Lire l'historique des messages
- Gérer les rôles ← **indispensable**
- Utiliser les commandes d'application

> ⚠️ Le rôle du bot doit être **au-dessus** du rôle « Pub Communautaire » dans la liste des rôles du serveur.

---

## Configuration côté Discord (à faire manuellement)

1. Crée le rôle « Pub Communautaire » sur le serveur.
2. Configure le salon pub : retire « Envoyer des messages » à `@everyone`, autorise-le uniquement au rôle « Pub Communautaire ».
3. Fais inviter le bot par un admin (il lui faut « Gérer le serveur ») via le lien d'invitation.
4. Demande à l'admin de placer le rôle du bot **au-dessus** du rôle « Pub Communautaire ».

---

## Lancement

### 1. Enregistrer les commandes slash (une seule fois)

```bash
node deploy-commands.js
```

### 2. Démarrer le bot

```bash
node index.js
```

### 3. Avec pm2 (recommandé sur un VPS)

```bash
npm install -g pm2
pm2 start index.js --name bot-semper
pm2 save
pm2 startup   # pour démarrer automatiquement au boot
```

---

## Commandes slash

| Commande | Description |
|---|---|
| `/solde` | Affiche tes pièces et ton rang |
| `/solde @membre` | (Admin) Consulte le solde d'un membre |
| `/classement` | Top 10 des membres les plus riches |
| `/acheter-pub` | Achète le rôle Pub Communautaire |

---

## Équilibrage par défaut

**5 pièces / message · cooldown 1 min · rôle à 100 pièces · message min 4 caractères**

→ ~20 messages espacés ≈ 20 min d'activité réelle pour débloquer une pub.

---

## Sauvegarde

La base de données est dans `economy.db`. Pense à la sauvegarder régulièrement sur le VPS :

```bash
cp economy.db economy.db.bak
```
