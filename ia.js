/**
 * Module simulé pour l'IA. 
 * À terme, vous pouvez connecter l'API OpenAI ou Gemini ici.
 */
module.exports = {
  getSummary: async (text) => {
    // Simulation d'un appel API
    const shortText = text.substring(0, 100) + "...";
    return `Ceci est un résumé généré par l'IA pour le texte suivant : ${shortText}`;
  }
};