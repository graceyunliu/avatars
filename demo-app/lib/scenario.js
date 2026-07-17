// Scenario content for the prep screen — source of truth: Scenario_Spec_Municipal_Registration.md
// (Section 6.1 template). German pending partner review.

export const SCENARIO = {
  title: "Register your arrival in Switzerland",
  mission:
    "You just moved to Zurich for work. Visit the residents' office (Personenmeldeamt), tell the clerk you want to register, answer their questions, and find out which documents you still need.",
  avatarName: "Matteo",
  avatarRole: "Clerk at the Zurich residents' office",

  // The questions the learner should RECOGNIZE when they hear them
  listeningCues: [
    { de: "Haben Sie einen Termin?", en: "Do you have an appointment?" },
    { de: "Wie ist Ihr Name?", en: "What is your name?" },
    { de: "Wie ist Ihre Adresse in Zürich?", en: "What is your address in Zurich?" },
    { de: "Wann sind Sie angekommen?", en: "When did you arrive?" },
  ],

  // Phrases the learner can SAY — practice each aloud before starting
  phrases: [
    { de: "Ich möchte mich anmelden.", en: "I would like to register." },
    { de: "Ich habe einen Termin.", en: "I have an appointment." },
    { de: "Ich heisse …", en: "My name is …" },
    { de: "Ich wohne im Hotel.", en: "I'm staying at a hotel." },
    { de: "Ich bin am 13. Juli angekommen.", en: "I arrived on July 13th." },
    { de: "Ich arbeite bei …", en: "I work at …" },
    { de: "Ich habe meinen Pass und meinen Arbeitsvertrag.", en: "I have my passport and my employment contract." },
    { de: "Welche Dokumente brauche ich noch?", en: "Which documents do I still need?" },
    { de: "Wie viel kostet das?", en: "How much does that cost?" },
    { de: "Können Sie das bitte wiederholen?", en: "Could you please repeat that?" },
    { de: "Können Sie bitte langsamer sprechen?", en: "Could you please speak more slowly?" },
  ],

  // Words worth recognizing (collapsible on the prep screen)
  vocabulary: [
    { de: "die Anmeldung", en: "registration" },
    { de: "der Pass / der Ausweis", en: "passport / ID" },
    { de: "der Arbeitsvertrag", en: "employment contract" },
    { de: "der Mietvertrag", en: "rental contract" },
    { de: "die Adresse", en: "address" },
    { de: "das Formular", en: "form" },
    { de: "die Gebühr", en: "fee" },
    { de: "die Krankenkasse", en: "health insurance" },
    { de: "das Passfoto", en: "passport photo" },
    { de: "die Aufenthaltsbewilligung", en: "residence permit" },
    { de: "ledig / verheiratet", en: "single / married" },
    { de: "der Termin", en: "appointment" },
    { de: "das Visum", en: "visa" },
  ],
};
