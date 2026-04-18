# 📚 Multi-Source Book Downloader

Script pour télécharger 5GB de livres du domaine public depuis plusieurs sources.

## 🎯 Sources

1. **Project Gutenberg** (5 miroirs)
   - gutenberg.org
   - gutenberg.pglaf.org
   - gutenberg.readingroo.ms
   - Formats: .txt, -0.txt

2. **Internet Archive**
   - archive.org
   - Langues: English, French, Spanish, Arabic, German
   - Format: .txt

3. **Gutenberg Extended**
   - IDs 1-2000
   - Livres classiques et populaires

## 🚀 Utilisation

### Prérequis

1. Cloner le repo `novela-books` dans le dossier parent:
```bash
cd ..
git clone https://github.com/novela-library/novela-books.git
cd novela
```

2. Lancer le téléchargement:
```bash
node download_5gb_books.js
```

## ⚙️ Configuration

Dans le fichier `download_5gb_books.js`:

```javascript
const BOOKS_DIR = '../novela-books';  // Dossier de destination
const MAX_SIZE = 5 * 1024 * 1024 * 1024;  // 5GB
const RETRY_ATTEMPTS = 3;  // Nombre de tentatives
const TIMEOUT = 30000;  // Timeout en ms
```

## 📊 Fonctionnalités

✅ **Retry automatique** - 3 tentatives par livre
✅ **Multiple sources** - 5 URLs différentes par livre Gutenberg
✅ **Progress tracking** - Affichage en temps réel
✅ **Rate limiting** - Respect des serveurs
✅ **Resume support** - Skip les fichiers déjà téléchargés
✅ **Error handling** - Continue même en cas d'erreur

## 📈 Statistiques attendues

- **Livres**: ~2000-3000 livres
- **Taille**: 5GB
- **Durée**: 2-4 heures (selon connexion)
- **Langues**: EN, FR, ES, AR, DE

## 🔧 Dépannage

### Le dossier n'existe pas
```bash
mkdir -p ../novela-books
```

### Timeout trop court
Augmenter `TIMEOUT` à 60000 (60s)

### Trop d'erreurs réseau
Augmenter `RETRY_ATTEMPTS` à 5

### Arrêt et reprise
Le script skip automatiquement les fichiers existants. Relancer simplement:
```bash
node download_5gb_books.js
```

## 📝 Format des fichiers

- Gutenberg: `{id}.txt` (ex: `1342.txt`)
- Archive: `ia_{identifier}.txt` (ex: `ia_moby_dick.txt`)

## 🎯 Livres populaires inclus

- Pride and Prejudice (1342)
- Alice in Wonderland (11)
- Frankenstein (84)
- Sherlock Holmes (1661)
- Dracula (345)
- Les Misérables (135)
- Don Quixote (2000)
- Et 2000+ autres...

## 📤 Push vers GitHub

Après téléchargement:

```bash
cd ../novela-books
git add *.txt
git commit -m "Add 5GB of public domain books"
git push origin main
```

⚠️ **Note**: GitHub a une limite de 100MB par fichier. Les fichiers plus gros seront rejetés.

## 🔗 Liens utiles

- [Project Gutenberg](https://www.gutenberg.org)
- [Internet Archive](https://archive.org)
- [Standard Ebooks](https://standardebooks.org)
