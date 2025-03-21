# Utiliser une image Node officielle
FROM node:18

# Définir le dossier de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du projet
COPY . .

# Exposer le port 3333 (port par défaut d'AdonisJS)
EXPOSE 3333

# Lancer l’application
CMD ["node", "ace", "serve", "--watch"]
