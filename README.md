# Retour École API

API serveur du projet Retour École.

## Endpoints

### Santé du service

GET /api/health

### Réception d'une position

POST /api/location

Exemple :

```json
{
  "deviceId": "enfant-01",
  "latitude": 45.4397,
  "longitude": 4.3872,
  "timestamp": 1790000000000,
  "battery": 82,
  "tracking": true
}
```

La première version valide les données et renvoie un accusé de réception. Le stockage persistant des positions sera ajouté dans l'étape suivante.

## Développement

```bash
npm install
npm run build
```

Le projet est prévu pour Vercel Functions.
