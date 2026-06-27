/**
 * Script à exécuter une seule fois pour générer le hash du mot de passe admin.
 * Usage : node scripts/hash-admin-password.js MonMotDePasse123!
 * Copier la valeur générée dans .env → ADMIN_PASSWORD_HASH=...
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-admin-password.js <mot_de_passe>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Le mot de passe doit faire au moins 8 caractères.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log("\nAjoutez cette ligne dans votre fichier .env :\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
