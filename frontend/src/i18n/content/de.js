// German words for the page copy (see ../content.js). Words only, in the same
// order as the English lists: icons, links, slugs and numbers come from the
// English files. null keeps the English, used for official qualification and
// grade names people will see on gov.uk and on their certificate.

export default {
  about: {
    ROUTE_STEPS: [
      { title: "Ein Fach wählen", text: "Rund 20 zur Auswahl. Zwei Jahre, in Vollzeit, an einer Schule oder einem College." },
      { title: "Es lernen", text: "1100 bis 1300 Unterrichtsstunden: die Grundlagen Ihrer Branche, dann eine Spezialisierung." },
      { title: "Arbeiten", text: "Mindestens 315 Stunden bei einem Arbeitgeber, etwa 45 Tage. Hier kommt Amazon ins Spiel." },
    ],
    TIME_SPLIT: [
      { label: "Lernen", detail: "etwa 80% des Kurses" },
      { label: "Praktikum", detail: "mindestens 315 Stunden" },
    ],
    PLACEMENT_FACTS: [
      { title: "Echte Arbeit", text: "Aufgaben, die der Arbeitgeber erledigt haben muss. Kein bloßes Zuschauen." },
      { title: "Ihr Zeitplan", text: "Ein oder zwei Tage pro Woche, ein Block von mehreren Wochen oder eine Mischung." },
      { title: "Ein oder zwei Arbeitgeber", text: "Meist einer. Mehr als zwei nur mit gutem Grund." },
      { title: "Bezahlung unterschiedlich", text: "Nicht garantiert. Manche Arbeitgeber zahlen oder übernehmen die Fahrtkosten. Fragen Sie vorher nach." },
    ],
    GRADES: [
      null,
      null,
      null,
      { grade: "Pass, mit C oder besser im Kernbereich" },
      { grade: "Pass, mit D oder E im Kernbereich" },
    ],
    AUDIENCE_POINTS: [
      { text: "Sie sind 16 bis 19 Jahre alt und machen gerade Ihre GCSEs oder wechseln den Kurs." },
      { text: "Sie wissen ungefähr, in welcher Branche Sie arbeiten möchten." },
      { text: "Sie lernen am besten, indem Sie etwas tun." },
      { text: "Sie möchten eine Qualifikation, der Arbeitgeber vertrauen, und sich das Studium offenhalten." },
      { text: "Sie konzentrieren sich gern zwei Jahre lang auf einen Bereich. Möchten Sie viele Fächer behalten? Dann passen A-Levels vielleicht besser zu Ihnen." },
    ],
    BENEFITS: [
      { title: "Echte Arbeit", text: "Mindestens 315 Stunden in einem arbeitenden Team." },
      { title: "So umfangreich wie drei A-Levels", text: "Es bringt UCAS-Punkte, das Studium bleibt also offen." },
      { title: "Mit Arbeitgebern entwickelt", text: "Arbeitgeber haben mitgeschrieben, was Sie lernen." },
      { title: "Drei Wege danach", text: "Eine Fachkraftstelle, eine höhere Ausbildung oder ein Studium." },
    ],
    COST_POINTS: [
      { title: "Der Kurs ist kostenlos", text: "Wenn Sie 16 bis 18 Jahre alt sind und in Vollzeit zur Schule gehen." },
      { title: "Hilfe bei den Kosten", text: "Die 16 to 19 Bursary kann Fahrten, Bücher, Ausstattung und Fachkleidung abdecken." },
      { title: "Bis zu £1200 pro Jahr", text: "Für Schülerinnen und Schüler in Pflege, Care Leaver und manche, die bestimmte Leistungen beziehen." },
      { title: "Fragen Sie Ihr College", text: "Alle anderen können einen Ermessenszuschuss beantragen. Er deckt keine Miete und keine Rechnungen." },
    ],
    PATHWAYS: [
      {
        name: "Digital",
        summary: "Technologie entwickeln, betreiben und unterstützen.",
        placement: "Sie sitzen bei einem technischen Team und arbeiten an echten Aufgaben: Code schreiben und prüfen, testen, Fehler beheben oder Systeme und Nutzer am Laufen halten.",
        suits: "Menschen, die gern ein Problem lösen und sofort sehen, dass es funktioniert.",
        amazonStatus: "Hier hat das T-Level-Programm von Amazon angefangen.",
      },
      {
        name: "Wirtschaft",
        summary: "Teams und Abläufe am Laufen halten.",
        placement: "Sie unterstützen den Alltag eines Teams: planen, koordinieren, mit Daten und Berichten arbeiten und Abläufe auf Kurs halten.",
        suits: "Menschen, die organisiert sind und gern dafür sorgen, dass alles richtig läuft.",
        amazonStatus: "Von Amazon als Fachrichtung genannt, in die es expandiert.",
      },
      {
        name: "Medien",
        summary: "Inhalte planen, gestalten und veröffentlichen.",
        placement: "Sie helfen, Inhalte zu planen und zu produzieren, vom Filmen und Schneiden bis zur Veröffentlichung, und sehen, wie ein Beitrag von der Idee zum Publikum kommt.",
        suits: "Menschen, die Dinge machen möchten, die andere ansehen oder lesen.",
        amazonStatus: "Von Amazon als kreative Fachrichtung genannt, in die es expandiert.",
      },
      {
        name: "Finanzen",
        summary: "Mit den Zahlen hinter Entscheidungen arbeiten.",
        tLevels: [null, "Finance, letzte Einschreibungen im September 2026"],
        placement: "Sie arbeiten mit echten Zahlen: Ausgaben verfolgen, Unterlagen prüfen und bei den Berichten helfen, auf deren Grundlage ein Team entscheidet.",
        suits: "Menschen, die mit Zahlen gut zurechtkommen und merken, wenn etwas nicht stimmt.",
      },
      {
        name: "Technik",
        summary: "Systeme entwerfen, bauen und warten.",
        placement: "Sie arbeiten mit Ingenieurinnen und Ingenieuren an Anlagen und Systemen: einrichten, warten, testen und verbessern, wie sie laufen.",
        suits: "Menschen, die verstehen möchten, wie etwas Physisches funktioniert, und es dann besser machen wollen.",
        amazonStatus: "Von Amazon als Fachrichtung genannt, in die es expandiert.",
      },
    ],
    FAQS: [
      {
        question: "Ist ein T-Level dasselbe wie eine Ausbildung?",
        answer: "Nein, es ist umgekehrt. Eine Ausbildung ist überwiegend bezahlte Arbeit mit etwas Lernen. Ein T-Level ist überwiegend Lernen, etwa 80 Prozent, und ein Praktikum im Betrieb von mindestens 315 Stunden macht den Rest aus.",
      },
      {
        question: "Welche GCSEs brauche ich?",
        answer: "Die Zugangsvoraussetzungen legt jede Schule oder jedes College selbst fest, nicht der Staat. Üblich sind etwa vier oder fünf GCSEs mit Note 4 oder besser, meist mit Englisch und Mathematik. Fragen Sie beim Bildungsanbieter nach, zu dem Sie möchten.",
      },
      {
        question: "Zwischen welchen T-Level-Fächern kann ich wählen?",
        answer: "Rund 20, in Bereichen wie Digitales, Technik, Bauwesen, Gesundheit, Naturwissenschaften, Recht und Rechnungswesen, Medien, Marketing, Landwirtschaft, Tierpflege, Bildung sowie Handwerk und Design. Sport und Sozialpflege kommen im September 2028. Das T-Level Finance nimmt im September 2026 die letzten Einschreibungen an, weiter geht es also mit Accounting.",
      },
      {
        question: "Wie werde ich bewertet?",
        answer: "In zwei Teilen. Der Kernbereich wird von A Stern bis E benotet und umfasst das Wissen für Ihre Branche. Die berufliche Spezialisierung wird mit pass, merit oder distinction bewertet und ist der praktische Teil. Beides steht auf Ihrem Zeugnis, zusammen mit einer Gesamtnote. Zum Kernbereich gehört auch ein von einem Arbeitgeber gestelltes Projekt (ESP), und die berufliche Spezialisierung wird oft mit OS abgekürzt.",
      },
      {
        question: "Kann ich trotzdem studieren?",
        answer: "Ja. Ein Distinction Stern ist 168 UCAS-Punkte wert, ein Distinction 144, ein Merit 120 und ein Pass 72 oder 96, je nach Ihrer Note im Kernbereich. Nicht jede Universität verwendet UCAS-Punkte, prüfen Sie also die Zugangsvoraussetzungen des Studiengangs, der Sie interessiert.",
      },
      {
        question: "Was, wenn ich nicht alles bestehe?",
        answer: "Sie erhalten statt des vollständigen Zeugnisses eine T-Level-Leistungsbescheinigung. Darin stehen die Teile, die Sie abgeschlossen haben, die Arbeit geht also nicht verloren.",
      },
      {
        question: "Wie lange dauert das Praktikum im Betrieb?",
        answer: "Mindestens 315 Stunden, ungefähr 45 Tage. Es kann an ein oder zwei Tagen pro Woche stattfinden, als Vollzeitblock oder gemischt. Amazon führt seine Praktika als Block von neun Wochen durch. Die Spezialisierung Early Years Educator erfordert stattdessen 750 Stunden.",
      },
      {
        question: "Werde ich im Praktikum bezahlt?",
        answer: "Es gibt keine gesetzliche Pflicht, ein Praktikum zu bezahlen. Manche Arbeitgeber zahlen, manche übernehmen Fahrten oder Mahlzeiten, manche nichts davon. Fragen Sie Ihren Bildungsanbieter, wie es geregelt ist, bevor Sie anfangen.",
      },
      {
        question: "Kann ich Hilfe bei Fahrtkosten oder Ausstattung bekommen?",
        answer: "Ja, über den 16 to 19 Bursary Fund. Er kann Fahrten, Bücher, Ausstattung und Fachkleidung abdecken. Beantragen Sie ihn über Ihre Schule oder Ihr College.",
      },
      {
        question: "Was, wenn ich für ein T-Level noch nicht so weit bin?",
        answer: "Es gibt ein T-Level Foundation Year, einen einjährigen Kurs auf Level 2, der zuerst Ihr Englisch, Ihre Mathematik, Ihre digitalen Fähigkeiten und Ihre Berufserfahrung stärkt und Sie dann ins T-Level bringt.",
      },
      {
        question: "Kann ich nebenbei andere Qualifikationen machen?",
        answer: "Ein T-Level ist ein Vollzeitprogramm, ungefähr so umfangreich wie drei A-Levels, daher wird es selten mit viel anderem kombiniert. Manche Bildungsanbieter erlauben eine zusätzliche Qualifikation. Fragen Sie bei Ihrem nach.",
      },
    ],
    QUIZ_QUESTIONS: [
      {
        question: "Wie lernen Sie am besten?",
        options: [
          { label: "Indem ich etwas mache und dann nach dem Warum frage" },
          { label: "Ein bisschen von beidem" },
          { label: "Indem ich lese, es aufschreibe und wiederhole" },
        ],
      },
      {
        question: "Wissen Sie, welche Art von Arbeit Sie möchten?",
        options: [
          { label: "Ich habe eine ziemlich klare Vorstellung von der Branche" },
          { label: "Einen groben Bereich, nicht den Beruf" },
          { label: "Noch keine Ahnung" },
        ],
      },
      {
        question: "Wie finden Sie 45 Tage an einem echten Arbeitsplatz?",
        options: [
          { label: "Genau das will ich" },
          { label: "Aufgeregt, aber bereit" },
          { label: "Ich bleibe lieber im Klassenzimmer" },
        ],
      },
      {
        question: "Welche Art der Bewertung passt zu Ihnen?",
        options: [
          { label: "Prüfungen plus eine benotete praktische Spezialisierung" },
          { label: "Beides ist mir recht" },
          { label: "Nur schriftliche Prüfungen" },
        ],
      },
      {
        question: "Was möchten Sie nach dem Kurs machen?",
        options: [
          { label: "Eine Fachkraftstelle oder ein duales Studium" },
          { label: "Arbeit und Studium beide offenhalten" },
          { label: "Ein Studium in einem ganz anderen Bereich" },
        ],
      },
      {
        question: "Sind Sie bereit, sich zwei Jahre lang auf einen Fachbereich festzulegen?",
        options: [
          { label: "Ja" },
          { label: "Ich glaube schon" },
          { label: "Ich möchte mir viele Möglichkeiten offenhalten" },
        ],
      },
    ],
    QUIZ_RESULTS: [
      {
        heading: "Ein T-Level scheint sehr gut zu passen",
        text: "Sie möchten praktisch lernen, echte Zeit am Arbeitsplatz verbringen und einen klaren Weg in eine Branche haben. Genau dafür ist ein T-Level gemacht. Nächster Schritt: Sehen Sie nach, welche der fünf Fachrichtungen zu Ihnen passt, und bekunden Sie dann Ihr Interesse bei Amazon.",
      },
      {
        heading: "Einen genaueren Blick wert",
        text: "Manches passt zu Ihnen, und manches ist noch offen, was in dieser Phase normal ist. Lesen Sie die Fachrichtungen und die Fragen unten, und sprechen Sie mit einer Lehrkraft oder Berufsberatung darüber, bevor Sie sich entscheiden.",
      },
      {
        heading: "Ein anderer Weg passt vielleicht besser",
        text: "Nach Ihren Antworten neigen Sie zum Lernen im Klassenzimmer und dazu, mehrere Fächer offenzuhalten, was A-Levels gut leisten. Das ist eine gute Antwort. Wenn Sie das Praktikum reizt, lohnt es sich trotzdem, die Fachrichtungen unten zu lesen.",
      },
    ],
  },
  amazon: {
    PLACEMENT_SHAPE: [
      { title: "Neun Wochen", text: "Sie kommen in ein Team, lernen die Werkzeuge kennen und leisten echte Arbeit." },
      { title: "Skills Hubs", text: "Ein Teil findet in den Skills Hubs von Amazon statt, in Blöcken von 15 Tagen." },
      { title: "Gruppenprojekte", text: "Arbeiten Sie mit anderen Schülerinnen und Schülern an Projekten für gemeinnützige Organisationen." },
      { title: "Teamaufgaben", text: "Aufgaben, die Ihr Team stellt und für die Sie Ihre T-Level-Fähigkeiten nutzen." },
    ],
    SUPPORT: [
      { title: "Eine Ansprechperson im Team", text: "Für die kleinen Fragen." },
      { title: "Ein Mentor", text: "Leitet Ihre Arbeit an und zeigt Ihnen das große Ganze." },
      { title: "Eine Praktikumsleitung", text: "Hält das Praktikum gemeinsam mit Ihrer Schule oder Ihrem College auf Kurs." },
    ],
    ROUTE_IN: [
      { title: "Ein T-Level beginnen", text: "Für 16- bis 18-Jährige, die schon ein T-Level machen." },
      { title: "Ihr College nimmt Kontakt auf", text: "Amazon vereinbart Praktika mit Schulen und Colleges, nicht direkt mit Schülerinnen und Schülern." },
      { title: "Interesse bekunden", text: "Nennen Sie uns Ihre Fachrichtung, und wir geben sie an Amazon weiter. Das ist keine Bewerbung." },
    ],
    GROWTH: [
      { caption: "Schülerinnen und Schüler im ersten Jahr" },
      { caption: "Schülerinnen und Schüler, viermal so viele" },
      { caption: "Praktikumsplätze geplant" },
    ],
  },
  help: {
    SERVICES: [
      { title: "Ein T-Level in Ihrer Nähe finden", text: "Suchen Sie nach Postleitzahl und Fach.", linkText: "Ein T-Level auf tlevels.gov.uk finden" },
      { title: "Kostenlose Berufsberatung", text: "Rufen Sie 0800 100 900 an oder nutzen Sie den Webchat. Für alle ab 13 Jahren.", linkText: "National Careers Service" },
      { title: "Hilfe bei Fahrten und Ausstattung", text: "Die 16 to 19 Bursary. Beantragen Sie sie über Ihre Schule oder Ihr College.", linkText: "Leitfaden zum 16 to 19 Bursary Fund" },
      { title: "Regeln für Praktika", text: "Die offiziellen Leitlinien dazu, was ein Praktikum enthalten muss.", linkText: "Leitlinien zu Praktika im Betrieb" },
    ],
    PROVIDER_QUESTIONS: [
      "Welche T-Levels und Spezialisierungen bieten Sie an?",
      "Finden Sie mein Praktikum, oder muss ich das selbst tun?",
      "Welche Arbeitgeber haben Ihre Schülerinnen und Schüler aufgenommen?",
      "Ist das Praktikum ein Block, ein Tag pro Woche oder eine Mischung?",
      "Was sind Ihre Zugangsvoraussetzungen?",
      "Welche Unterstützung gibt es, wenn ich besonderen Förderbedarf habe?",
    ],
    SITE_ROUTES: [
      { label: "Was ist ein T-Level?", detail: "Über T-Levels" },
      { label: "Ich möchte alle Fächer sehen", detail: "Alle T-Levels" },
      { label: "Wie ist ein Praktikum bei Amazon?", detail: "T-Levels bei Amazon" },
      { label: "Ich möchte Leitfäden und Materialpakete", detail: "T-Level-Materialien" },
      { label: "Ich möchte mein Interesse bekunden", detail: "Interesse bekunden" },
      { label: "Ich habe schon ein Konto", detail: "Anmelden" },
    ],
  },
  interest: {
    NEXT_STEPS: [
      { text: "Sie setzen ein Häkchen. Das dauert nur einen Moment." },
      { text: "Das Team von Amazon Emerging Talent sieht, wer interessiert ist." },
      { text: "Praktika werden mit Ihrer Schule oder Ihrem College vereinbart, daher kann das Team dort Kontakt aufnehmen." },
    ],
    WHY_WE_ASK: "Wir senden nur, was das Team von Amazon Emerging Talent braucht, um zu wissen, dass Sie interessiert sind: den Namen, die E-Mail-Adresse und die Fachrichtung, die bereits in Ihrem Konto stehen. Keine Adresse, kein Geburtsdatum, keine Schule.",
  },
  quiz: {
    KNOWLEDGE_QUESTIONS: [
      {
        question: "Wie lange dauert das Praktikum im Betrieb bei einem T-Level?",
        options: ["Mindestens 315 Stunden, ungefähr 45 Tage", "Zwei Wochen", "Ein ganzes Jahr", "Es gibt keines"],
        correctAnswer: "Mindestens 315 Stunden, ungefähr 45 Tage",
        explanation: "Mindestens 315 Stunden, ungefähr 45 Tage. Amazon führt seine Praktika als Block von neun Wochen durch.",
      },
      {
        question: "Wie vielen A-Levels entspricht ein T-Level ungefähr im Umfang?",
        options: ["Einem", "Zwei", "Drei", "Fünf"],
        correctAnswer: "Drei",
        explanation: "Drei. Ein T-Level bringt auch UCAS-Punkte, das Studium bleibt Ihnen also offen.",
      },
      {
        question: "Was ist der Hauptunterschied zwischen einem T-Level und einer Ausbildung?",
        options: [
          "Ein T-Level ist überwiegend Lernen, eine Ausbildung überwiegend bezahlte Arbeit",
          "Das ist dasselbe",
          "Ein T-Level ist überwiegend bezahlte Arbeit, eine Ausbildung überwiegend Lernen",
          "Nur eine Ausbildung umfasst Zeit bei einem Arbeitgeber",
        ],
        correctAnswer: "Ein T-Level ist überwiegend Lernen, eine Ausbildung überwiegend bezahlte Arbeit",
        explanation: "Es ist umgekehrt. Ein T-Level besteht zu etwa 80 Prozent aus Lernen, und ein Praktikum im Betrieb von mindestens 315 Stunden macht den Rest aus.",
      },
      {
        question: "Zu welcher Fachrichtung gehört das T-Level Digital Software Development?",
        options: ["Digital", "Wirtschaft", "Technik", "Medien"],
        correctAnswer: "Digital",
        explanation: "Digital. Dazu gehören auch Digital Data Analytics und Digital Support and Security.",
      },
      {
        question: "Zu welcher Fachrichtung gehört das T-Level Management and Administration?",
        options: ["Wirtschaft", "Finanzen", "Medien", "Digital"],
        correctAnswer: "Wirtschaft",
        explanation: "Wirtschaft. Auf der Website ist sie so zusammengefasst: Teams und Abläufe am Laufen halten.",
      },
      {
        question: "Wer kümmert sich bei einem Praktikum bei Amazon um Sie?",
        options: [
          "Eine Ansprechperson im Team, ein Mentor und eine Praktikumsleitung",
          "Niemand, Sie arbeiten allein",
          "Nur Ihre Lehrkraft",
          "Jeden Tag eine andere Führungskraft",
        ],
        correctAnswer: "Eine Ansprechperson im Team, ein Mentor und eine Praktikumsleitung",
        explanation: "Alle Schülerinnen und Schüler bekommen eine Ansprechperson im Team, einen Mentor und eine Praktikumsleitung, es gibt also immer jemanden, den man fragen kann.",
      },
      {
        question: "Brauchen Sie ein Konto, um die Materialsammlung von T-SMILE zu nutzen?",
        options: [
          "Nein, aber manche Materialien brauchen zum Öffnen ein kostenloses Konto",
          "Ja, für alles",
          "Nein, alles ist für alle offen",
          "Nur wenn Sie Lehrkraft sind",
        ],
        correctAnswer: "Nein, aber manche Materialien brauchen zum Öffnen ein kostenloses Konto",
        explanation: "Alle können die Materialsammlung durchsehen und die verlinkten Materialien öffnen. Ein kostenloses Konto brauchen Sie, um Dateien herunterzuladen, in der Community zu fragen und zu antworten und Ihre Einstellungen zu behalten.",
      },
    ],
  },
  legal: {
    TERMS: {
      label: "Rechtliches",
      title: "Nutzungsbedingungen",
      updated: "September 2026",
      intro: "T-SMILE ist ein Schülerprojekt, erstellt für das Digital-T-Level-Programm von Amazon Emerging Talent. Es ist keine offizielle Website von Amazon.",
      sections: [
        {
          heading: "Die Website nutzen",
          paragraphs: [
            "Alle können jede Seite lesen, die verlinkten Materialien öffnen, die Quiz machen und ohne Konto mit Smiley sprechen. Mit einem kostenlosen Konto können Sie Dateien von der Seite Materialien herunterladen sowie in der Community fragen und antworten.",
            "Sie müssen 16 Jahre oder älter sein, um ein Konto zu erstellen.",
          ],
        },
        {
          heading: "Ihr Konto",
          points: [
            "Behalten Sie Ihr Passwort für sich.",
            "Machen Sie wahre Angaben, wenn Sie sich registrieren oder Ihr Interesse bekunden.",
            "Sie können Ihr Konto jederzeit in Ihrem Profil abschalten.",
          ],
        },
        {
          heading: "Seien Sie freundlich",
          points: [
            "Veröffentlichen Sie nichts Unhöfliches, Verletzendes oder Illegales in Formularen, im Chat oder in der Community.",
            "Versuchen Sie nicht, die Website lahmzulegen oder an die Daten anderer zu gelangen.",
            "Wir können Konten abschalten, die gegen diese Regeln verstoßen.",
          ],
        },
        {
          heading: "Unsere Informationen",
          paragraphs: [
            "Wir prüfen Fakten anhand von gov.uk, UCAS und Amazon und nennen unsere Quellen auf jeder Seite. Dinge ändern sich, fragen Sie also immer bei Ihrer Schule oder Ihrem College nach, bevor Sie sich entscheiden.",
            "Smiley, der Assistent, kann Fehler machen. Er ist eine Hilfe, keine Beratung.",
          ],
        },
        {
          heading: "Der Name Amazon",
          paragraphs: [
            "„Amazon“ und das Logo gehören Amazon.com, Inc. oder seinen verbundenen Unternehmen. Wir verwenden sie, um die T-Level-Praktika von Amazon zu beschreiben.",
          ],
        },
      ],
    },
    PRIVACY: {
      label: "Rechtliches",
      title: "Datenschutzerklärung",
      updated: "September 2026",
      intro: "T-SMILE ist ein Schülerprojekt, erstellt für das Digital-T-Level-Programm von Amazon Emerging Talent. Es ist keine offizielle Website von Amazon.",
      sections: [
        {
          heading: "Wer sich um Ihre Daten kümmert",
          paragraphs: ["Das Schülerteam von T-SMILE. Sie erreichen uns über die Seite Kontakt."],
        },
        {
          heading: "Was wir erheben und warum",
          points: [
            "Interesse bekunden: Ihr Name, Ihre E-Mail-Adresse, ob Sie Schüler/in, Elternteil oder Lehrkraft sind, eine Fachrichtung und eine freiwillige Nachricht. Damit das Team von Amazon Emerging Talent sieht, dass Sie interessiert sind, und Kontakt aufnehmen kann.",
            "Ein Konto: ein Benutzername, ein Passwort (verschlüsselt gespeichert, nie lesbar), Ihre Rolle und Fachrichtung. Später, wenn Sie sie hinzufügen, Ihr Name, Ihre E-Mail-Adresse und Telefonnummer. Damit Sie sich anmelden, in der Community fragen und antworten und Ihre Einstellungen auf jedem Gerät behalten können.",
            "Einstellungen zur Barrierefreiheit: Textgröße, Kontrast, Design und ähnliche Auswahl. Damit die Website so aussieht, wie Sie es eingestellt haben.",
            "Chat mit Smiley: Fragen, die Smiley nachschlagen muss, und seine Antworten. Damit Smiley der Unterhaltung folgen kann. Fragen, die er selbst beantwortet, bleiben in Ihrem Browser.",
            "Beiträge in der Community: die Fragen und Antworten, die Sie veröffentlichen, mit Ihrem Benutzernamen angezeigt. Damit andere Besucher sie lesen und antworten können.",
            "Feedback und Kontaktnachrichten: Ihre Nachricht und Ihre E-Mail-Adresse, wenn Sie sie angeben. Damit wir Dinge beheben und antworten können.",
          ],
        },
        {
          heading: "Wer sie sieht",
          points: [
            "Das T-SMILE-Team und die Mitarbeitenden von Amazon Emerging Talent bei Interessenbekundungen.",
            "Anthropic, das Unternehmen, dessen KI einige Antworten von Smiley schreibt. Fragen, die Smiley nicht selbst beantworten kann, werden dorthin geschickt, um eine Antwort zu erhalten.",
            "Das Unternehmen, das die Website hostet (Railway für die Vorschau, später Amazon Web Services).",
            "Sonst niemand. Wir verkaufen keine Daten und nutzen sie nicht für Werbung.",
          ],
        },
        {
          heading: "Wie lange wir sie aufbewahren",
          paragraphs: [
            "Chatnachrichten mit Smiley: 90 Tage.",
            "Interessenbekundungen und Feedback: 12 Monate.",
            "Ihr Konto und Ihre Beiträge in der Community: bis Sie sie löschen.",
            "Sie können uns bitten, alles früher zu löschen.",
          ],
        },
        {
          heading: "Unter 18",
          paragraphs: [
            "Viele unserer Besucher sind unter 18, daher fragen wir nur nach dem, was wir brauchen. In keinem Formular fragen wir nach Ihrer Adresse, Ihrem Geburtsdatum oder Ihrer Schule.",
          ],
        },
        {
          heading: "Ihre Rechte",
          paragraphs: ["Sie können Ihre Daten einsehen, berichtigen oder löschen, und mehr. Die Seite Datenrechte erklärt, wie."],
        },
      ],
    },
    COOKIES: {
      label: "Rechtliches",
      title: "Cookie-Richtlinie",
      updated: "September 2026",
      intro: "Wir verwenden nur die Cookies, die die Website zum Funktionieren braucht. Kein Tracking, keine Werbung, keine Analyse.",
      sections: [
        {
          heading: "Cookies",
          points: [
            "sessionid: hält Sie angemeldet und lässt Smiley sich an Ihren Chat erinnern. Gilt zwei Wochen oder bis Sie sich abmelden.",
            "csrftoken: verhindert, dass andere Websites in Ihrem Namen Formulare senden. Gilt bis zu einem Jahr.",
          ],
          paragraphs: ["Ohne diese kann die Website nicht sicher funktionieren, daher verlangt das Gesetz von uns kein Cookie-Banner."],
        },
        {
          heading: "In Ihrem Browser gespeichert",
          paragraphs: ["Das sind keine Cookies, und sie verlassen nie Ihr Gerät."],
          points: [
            "Ihre Einstellungen zur Barrierefreiheit und die gewählte Sprache, damit sie erhalten bleiben, wenn Sie wiederkommen.",
            "Ob Smiley schon Hallo gesagt hat und wer Sie laut Ihrer Angabe sind, bis Sie den Tab schließen.",
            "Ob Sie den Cookie-Hinweis geschlossen haben.",
          ],
        },
        {
          heading: "Sie löschen",
          paragraphs: [
            "Sie können Cookies und gespeicherte Daten in den Einstellungen Ihres Browsers löschen. Sie werden dann abgemeldet, und Ihre Einstellungen werden zurückgesetzt.",
          ],
        },
      ],
    },
    DATA_RIGHTS: {
      label: "Rechtliches",
      title: "DSGVO und Ihre Datenrechte",
      updated: "September 2026",
      intro: "Das britische Recht (UK GDPR) gibt Ihnen Rechte an Ihren Daten. Sie können sie kostenlos nutzen.",
      sections: [
        {
          heading: "Ihre Rechte",
          points: [
            "Einsehen: Fordern Sie eine Kopie der Daten an, die wir über Sie speichern.",
            "Berichtigen: Bitten Sie uns, Falsches zu korrigieren.",
            "Löschen: Bitten Sie uns, Ihre Daten zu entfernen.",
            "Einschränken: Bitten Sie uns, sie eine Zeit lang nicht zu nutzen.",
            "Mitnehmen: Fordern Sie Ihre Daten in einer Datei an, die Sie anderswo nutzen können.",
            "Widersprechen: Sagen Sie uns, dass wir sie nicht mehr nutzen sollen.",
          ],
        },
        {
          heading: "So stellen Sie eine Anfrage",
          paragraphs: [
            "Nutzen Sie das Kontaktformular und nennen Sie das Recht, das Sie nutzen möchten. Wir bitten Sie vielleicht, zu bestätigen, dass Sie es sind. Wir antworten innerhalb eines Monats.",
            "Sie können Ihre Angaben auch selbst in Ihrem Profil berichtigen oder Ihr Konto abschalten.",
          ],
        },
        {
          heading: "Nicht zufrieden?",
          paragraphs: [
            "Sie können sich beim Information Commissioner's Office (ICO) beschweren, das im Vereinigten Königreich für den Datenschutz zuständig ist.",
          ],
          link: { text: "Beim ICO Beschwerde einreichen" },
        },
      ],
    },
  },
};
