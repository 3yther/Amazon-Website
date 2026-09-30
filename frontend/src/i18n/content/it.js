// Italian words for the page copy (see ../content.js). Words only, in the same
// order as the English lists: icons, links, slugs and numbers come from the
// English files. null keeps the English, used for official qualification and
// grade names people will see on gov.uk and on their certificate.

export default {
  about: {
    ROUTE_STEPS: [
      { title: "Scelga una materia", text: "Circa 20 tra cui scegliere. Due anni, a tempo pieno, in una scuola o in un college." },
      { title: "La studi", text: "Da 1100 a 1300 ore di lezione: le basi del Suo settore, poi una specializzazione." },
      { title: "Lavori", text: "Almeno 315 ore presso un datore di lavoro, circa 45 giorni. È qui che entra in gioco Amazon." },
    ],
    TIME_SPLIT: [
      { label: "Studio", detail: "circa l'80% del corso" },
      { label: "Tirocinio", detail: "almeno 315 ore" },
    ],
    PLACEMENT_FACTS: [
      { title: "Lavoro vero", text: "Compiti di cui il datore di lavoro ha bisogno. Non semplice osservazione." },
      { title: "Il Suo orario", text: "Uno o due giorni a settimana, un blocco di settimane, oppure un misto." },
      { title: "Uno o due datori di lavoro", text: "Di solito uno. Non più di due senza un buon motivo." },
      { title: "La retribuzione varia", text: "Non è garantita. Alcuni datori di lavoro pagano o coprono le spese di viaggio. Chieda prima." },
    ],
    GRADES: [
      null,
      null,
      null,
      { grade: "Pass, con C o superiore nella parte comune" },
      { grade: "Pass, con D o E nella parte comune" },
    ],
    AUDIENCE_POINTS: [
      { text: "Ha tra i 16 e i 19 anni e sta finendo i GCSE, oppure sta cambiando corso." },
      { text: "Sa più o meno in quale settore vuole lavorare." },
      { text: "Impara meglio facendo." },
      { text: "Vuole una qualifica di cui i datori di lavoro si fidano, lasciando aperta l'università." },
      { text: "Le va bene concentrarsi su un solo ambito per due anni. Vuole tenere molte materie? Gli A level potrebbero fare più al caso Suo." },
    ],
    BENEFITS: [
      { title: "Lavoro vero", text: "Almeno 315 ore all'interno di un team al lavoro." },
      { title: "Come tre A level", text: "Dà punti UCAS, quindi l'università resta aperta." },
      { title: "Creato con i datori di lavoro", text: "I datori di lavoro hanno contribuito a scrivere ciò che studia." },
      { title: "Tre strade dopo", text: "Un lavoro qualificato, un apprendistato di livello superiore o l'università." },
    ],
    COST_POINTS: [
      { title: "Il corso è gratuito", text: "Se ha tra i 16 e i 18 anni ed è iscritto a tempo pieno." },
      { title: "Aiuti per le spese", text: "La 16 to 19 Bursary può coprire viaggi, libri, attrezzatura e abbigliamento specifico." },
      { title: "Fino a £1200 l'anno", text: "Per studenti in affidamento, giovani usciti dall'affidamento e alcuni studenti che ricevono determinati sussidi." },
      { title: "Chieda al Suo college", text: "Chiunque altro può chiedere una borsa discrezionale. Non può coprire affitto o bollette." },
    ],
    PATHWAYS: [
      {
        name: "Digitale",
        summary: "Creare, gestire e supportare la tecnologia.",
        placement: "Lavora con un team tecnico su attività reali: scrivere e rivedere codice, fare test, correggere bug, o mantenere in funzione sistemi e assistere gli utenti.",
        suits: "Persone a cui piace risolvere un problema e vederlo funzionare subito.",
        amazonStatus: "È qui che è iniziato il programma T-Level di Amazon.",
      },
      {
        name: "Business",
        summary: "Far funzionare team e attività.",
        placement: "Supporta la gestione quotidiana di un team: pianificare, coordinare, gestire dati e report, e mantenere i processi in carreggiata.",
        suits: "Persone organizzate a cui piace che le cose funzionino come si deve.",
        amazonStatus: "Indicato da Amazon come un percorso in cui si sta espandendo.",
      },
      {
        name: "Media",
        summary: "Pianificare, realizzare e pubblicare contenuti.",
        placement: "Aiuta a pianificare e produrre contenuti, dalle riprese e dal montaggio fino alla pubblicazione, e vede come un contenuto passa dall'idea al pubblico.",
        suits: "Persone che vogliono creare cose che altri guarderanno o leggeranno.",
        amazonStatus: "Indicato da Amazon come un percorso creativo in cui si sta espandendo.",
      },
      {
        name: "Finanza",
        summary: "Lavorare con i numeri dietro le decisioni.",
        tLevels: [null, "Finance, ultime iscrizioni a settembre 2026"],
        placement: "Lavora con cifre reali: monitorare le spese, controllare i registri e aiutare a preparare i report su cui un team basa le proprie decisioni.",
        suits: "Persone a proprio agio con i numeri e capaci di notare ciò che non torna.",
      },
      {
        name: "Ingegneria",
        summary: "Progettare, costruire e mantenere sistemi.",
        placement: "Lavora accanto agli ingegneri su apparecchiature e sistemi: installarli, mantenerli, testarli e migliorarne il funzionamento.",
        suits: "Persone che vogliono capire come funziona un oggetto fisico, e poi farlo funzionare meglio.",
        amazonStatus: "Indicato da Amazon come un percorso in cui si sta espandendo.",
      },
    ],
    FAQS: [
      {
        question: "Un T-Level è la stessa cosa di un apprendistato?",
        answer: "No, è il contrario. Un apprendistato è per lo più lavoro retribuito con un po' di studio. Un T-Level è per lo più studio, circa l'80 per cento, e il resto è un tirocinio in azienda di almeno 315 ore.",
      },
      {
        question: "Di quali GCSE ho bisogno?",
        answer: "I requisiti di ammissione li stabilisce ogni scuola o college, non lo Stato. È comune chiedere circa quattro o cinque GCSE con voto 4 o superiore, di solito compresi inglese e matematica. Verifichi con l'istituto di formazione che Le interessa.",
      },
      {
        question: "Tra quali materie T-Level posso scegliere?",
        answer: "Circa 20, in ambiti che comprendono digitale, ingegneria, edilizia, sanità, scienze, diritto e contabilità, media, marketing, agricoltura, cura degli animali, istruzione, artigianato e design. Sport e Assistenza sociale arriveranno a settembre 2028. Il T-Level Finance accetta le ultime iscrizioni a settembre 2026, quindi quello che continua è Accounting.",
      },
      {
        question: "Come vengo valutato?",
        answer: "In due parti. La parte comune è valutata da A stella a E e riguarda le conoscenze del Suo settore. La specializzazione professionale è valutata pass, merit o distinction ed è la parte pratica. Entrambe compaiono sul Suo certificato, insieme a un voto complessivo. La parte comune include anche un progetto assegnato da un datore di lavoro (ESP), e la specializzazione professionale viene spesso abbreviata in OS.",
      },
      {
        question: "Posso comunque andare all'università?",
        answer: "Sì. Una Distinction stella vale 168 punti UCAS, una Distinction 144, un Merit 120 e un Pass 72 o 96 a seconda del voto nella parte comune. Non tutte le università usano i punti UCAS, quindi verifichi i requisiti di ammissione del corso che Le interessa.",
      },
      {
        question: "E se non supero tutto?",
        answer: "Riceve un attestato dei risultati T-Level al posto del certificato completo. Elenca le parti che ha completato, quindi il lavoro non va perso.",
      },
      {
        question: "Quanto dura il tirocinio in azienda?",
        answer: "Almeno 315 ore, circa 45 giorni. Può svolgersi uno o due giorni a settimana, in un blocco a tempo pieno o in modo misto. Amazon organizza i suoi tirocini in un blocco di nove settimane. La specializzazione Early Years Educator richiede invece 750 ore.",
      },
      {
        question: "Sarò pagato durante il tirocinio?",
        answer: "Non c'è alcun obbligo di legge di retribuire un tirocinio. Alcuni datori di lavoro pagano, alcuni coprono viaggi o pasti, altri nessuna delle due cose. Chieda al Suo istituto di formazione come funziona prima di iniziare.",
      },
      {
        question: "Posso ricevere aiuti per viaggi o attrezzatura?",
        answer: "Sì, tramite il 16 to 19 Bursary Fund. Può coprire viaggi, libri, attrezzatura e abbigliamento specifico. Faccia domanda tramite la Sua scuola o il Suo college.",
      },
      {
        question: "E se non sono ancora pronto per un T-Level?",
        answer: "Esiste un T-Level Foundation Year, un corso di un anno di livello 2 che rafforza prima il Suo inglese, la matematica, le competenze digitali e l'esperienza di lavoro, e poi La porta al T-Level.",
      },
      {
        question: "Posso conseguire altre qualifiche insieme?",
        answer: "Un T-Level è un programma a tempo pieno, più o meno equivalente a tre A level, quindi di solito non si abbina a molto altro. Alcuni istituti di formazione consentono una qualifica in più. Chieda al Suo.",
      },
    ],
    QUIZ_QUESTIONS: [
      {
        question: "Come impara meglio?",
        options: [
          { label: "Facendo le cose, poi chiedendo perché" },
          { label: "Un po' tutte e due" },
          { label: "Leggendo, scrivendo e ripassando" },
        ],
      },
      {
        question: "Sa che tipo di lavoro vuole fare?",
        options: [
          { label: "Ho un'idea abbastanza chiara del settore" },
          { label: "Un ambito generico, non il mestiere" },
          { label: "Ancora nessuna idea" },
        ],
      },
      {
        question: "Che cosa pensa di 45 giorni in un vero luogo di lavoro?",
        options: [
          { label: "È proprio la parte che voglio" },
          { label: "Un po' agitato, ma ci sto" },
          { label: "Preferirei restare in aula" },
        ],
      },
      {
        question: "Quale modo di essere valutato fa per Lei?",
        options: [
          { label: "Esami più una specializzazione pratica con voto" },
          { label: "Per me è indifferente" },
          { label: "Solo esami scritti" },
        ],
      },
      {
        question: "Che cosa vuole fare dopo il corso?",
        options: [
          { label: "Un lavoro qualificato o un apprendistato di livello universitario" },
          { label: "Tenere aperti sia il lavoro sia l'università" },
          { label: "Una laurea in un ambito diverso da questo" },
        ],
      },
      {
        question: "È pronto a dedicarsi a un solo ambito per due anni?",
        options: [
          { label: "Sì" },
          { label: "Credo di sì" },
          { label: "Voglio tenermi aperte molte possibilità" },
        ],
      },
    ],
    QUIZ_RESULTS: [
      {
        heading: "Un T-Level sembra fare proprio per Lei",
        text: "Vuole imparare facendo, passare tempo in un vero luogo di lavoro e avere una strada chiara verso un settore. È esattamente ciò per cui è pensato un T-Level. Prossimo passo: veda quale dei cinque percorsi fa per Lei, poi manifesti il Suo interesse ad Amazon.",
      },
      {
        heading: "Vale la pena approfondire",
        text: "Alcune cose fanno per Lei e altre sono ancora aperte, il che è normale in questa fase. Legga i percorsi e le domande qui sotto, e ne parli con un insegnante o un consulente di orientamento prima di decidere.",
      },
      {
        heading: "Un'altra strada potrebbe fare più al caso Suo",
        text: "Dalle Sue risposte, preferisce studiare in aula e tenere aperte diverse materie, cosa che gli A level fanno bene. È un'ottima risposta. Se è il tirocinio ad attirarLa, vale comunque la pena leggere i percorsi qui sotto.",
      },
    ],
  },
  amazon: {
    PLACEMENT_SHAPE: [
      { title: "Nove settimane", text: "Entra in un team, impara gli strumenti e fa un lavoro vero." },
      { title: "Skills hub", text: "Una parte si svolge negli skills hub di Amazon, in blocchi di 15 giorni." },
      { title: "Progetti di gruppo", text: "Lavora con altri studenti a progetti per enti di beneficenza." },
      { title: "Sfide di team", text: "Compiti assegnati dal Suo team che mettono in pratica le Sue competenze T-Level." },
    ],
    SUPPORT: [
      { title: "Un compagno di riferimento", text: "Per le domande più piccole." },
      { title: "Un mentore", text: "Guida il Suo lavoro e Le mostra il quadro generale." },
      { title: "Un responsabile del tirocinio", text: "Tiene il tirocinio in carreggiata insieme alla Sua scuola o al Suo college." },
    ],
    ROUTE_IN: [
      { title: "Inizi un T-Level", text: "Per ragazzi dai 16 ai 18 anni già iscritti a un T-Level." },
      { title: "Il Suo college prende contatto", text: "Amazon organizza i tirocini con scuole e college, non direttamente con gli studenti." },
      { title: "Manifesti il Suo interesse", text: "Ci indichi il Suo percorso e lo trasmetteremo ad Amazon. Non è una candidatura." },
    ],
    GROWTH: [
      { caption: "studenti nel primo anno" },
      { caption: "studenti, quattro volte tanti" },
      { caption: "tirocini previsti" },
    ],
  },
  help: {
    SERVICES: [
      { title: "Trovare un T-Level nelle vicinanze", text: "Cerchi per codice postale e materia.", linkText: "Trova un T-Level su tlevels.gov.uk" },
      { title: "Orientamento gratuito", text: "Chiami lo 0800 100 900 o usi la chat online. Per chiunque abbia almeno 13 anni.", linkText: "National Careers Service" },
      { title: "Aiuti per viaggi e attrezzatura", text: "La 16 to 19 Bursary. Faccia domanda tramite la Sua scuola o il Suo college.", linkText: "Guida al 16 to 19 Bursary Fund" },
      { title: "Regole sui tirocini", text: "Le linee guida ufficiali su che cosa deve includere un tirocinio.", linkText: "Linee guida sui tirocini in azienda" },
    ],
    PROVIDER_QUESTIONS: [
      "Quali T-Level e specializzazioni offrite?",
      "Il tirocinio lo trovate voi o devo trovarlo io?",
      "Quali datori di lavoro hanno accolto i vostri studenti?",
      "Il tirocinio è un blocco, un giorno a settimana o un misto?",
      "Quali sono i vostri requisiti di ammissione?",
      "Che supporto c'è se ho bisogni particolari?",
    ],
    SITE_ROUTES: [
      { label: "Che cos'è un T-Level?", detail: "Informazioni sui T-Level" },
      { label: "Voglio vedere tutte le materie", detail: "Tutti i T-Level" },
      { label: "Com'è un tirocinio in Amazon?", detail: "I T-Level in Amazon" },
      { label: "Voglio guide e pacchetti", detail: "Risorse sui T-Level" },
      { label: "Voglio manifestare il mio interesse", detail: "Manifesta interesse" },
      { label: "Ho già un account", detail: "Accedi" },
    ],
  },
  interest: {
    NEXT_STEPS: [
      { text: "Spunta una casella. Ci vuole un attimo." },
      { text: "Il team di Amazon Emerging Talent può vedere chi è interessato." },
      { text: "I tirocini si organizzano con la Sua scuola o il Suo college, quindi potrebbero contattare loro." },
    ],
    WHY_WE_ASK: "Inviamo solo ciò che serve al team di Amazon Emerging Talent per sapere che Lei è interessato: il nome, l'e-mail e il percorso già presenti nel Suo account. Niente indirizzo, data di nascita o scuola.",
  },
  quiz: {
    KNOWLEDGE_QUESTIONS: [
      {
        question: "Quanto dura il tirocinio in azienda di un T-Level?",
        options: ["Almeno 315 ore, circa 45 giorni", "Due settimane", "Un anno intero", "Non c'è"],
        correctAnswer: "Almeno 315 ore, circa 45 giorni",
        explanation: "Almeno 315 ore, circa 45 giorni. Amazon organizza i suoi tirocini in un blocco di nove settimane.",
      },
      {
        question: "Un T-Level equivale più o meno a quanti A level?",
        options: ["Uno", "Due", "Tre", "Cinque"],
        correctAnswer: "Tre",
        explanation: "Tre. Un T-Level dà anche punti UCAS, quindi l'università Le resta aperta.",
      },
      {
        question: "Qual è la differenza principale tra un T-Level e un apprendistato?",
        options: [
          "Un T-Level è per lo più studio, un apprendistato per lo più lavoro retribuito",
          "Sono la stessa cosa",
          "Un T-Level è per lo più lavoro retribuito, un apprendistato per lo più studio",
          "Solo l'apprendistato include tempo presso un datore di lavoro",
        ],
        correctAnswer: "Un T-Level è per lo più studio, un apprendistato per lo più lavoro retribuito",
        explanation: "È il contrario. Un T-Level è studio per circa l'80 per cento, e il resto è un tirocinio in azienda di almeno 315 ore.",
      },
      {
        question: "Quale percorso comprende il T-Level Digital Software Development?",
        options: ["Digitale", "Business", "Ingegneria", "Media"],
        correctAnswer: "Digitale",
        explanation: "Digitale. Comprende anche Digital Data Analytics e Digital Support and Security.",
      },
      {
        question: "Quale percorso comprende il T-Level Management and Administration?",
        options: ["Business", "Finanza", "Media", "Digitale"],
        correctAnswer: "Business",
        explanation: "Business. Sul sito è riassunto così: far funzionare team e attività.",
      },
      {
        question: "Chi si occupa di Lei durante un tirocinio in Amazon?",
        options: [
          "Un compagno di riferimento, un mentore e un responsabile del tirocinio",
          "Nessuno, lavora da solo",
          "Solo il Suo insegnante",
          "Un responsabile diverso ogni giorno",
        ],
        correctAnswer: "Un compagno di riferimento, un mentore e un responsabile del tirocinio",
        explanation: "Ogni studente ha un compagno di riferimento, un mentore e un responsabile del tirocinio, quindi c'è sempre qualcuno a cui chiedere.",
      },
      {
        question: "Serve un account per usare la raccolta di risorse di T-SMILE?",
        options: [
          "No, ma alcune risorse richiedono un account gratuito per essere aperte",
          "Sì, per tutto",
          "No, tutto è aperto a tutti",
          "Solo se è un insegnante",
        ],
        correctAnswer: "No, ma alcune risorse richiedono un account gratuito per essere aperte",
        explanation: "Chiunque può sfogliare la raccolta e aprire le risorse collegate. Un account gratuito serve per scaricare file, fare domande e rispondere nella Community, e per conservare le Sue impostazioni.",
      },
    ],
  },
  legal: {
    TERMS: {
      label: "Note legali",
      title: "Termini di servizio",
      updated: "Settembre 2026",
      intro: "T-SMILE è un progetto studentesco, realizzato per il programma Digital T-Level di Amazon Emerging Talent. Non è un sito ufficiale di Amazon.",
      sections: [
        {
          heading: "Usare il sito",
          paragraphs: [
            "Chiunque può leggere ogni pagina, aprire le risorse collegate, fare i quiz e parlare con Smiley senza account. Un account gratuito Le permette di scaricare file dalla pagina Risorse, e di fare domande e rispondere nella Community.",
            "Per creare un account deve avere almeno 16 anni.",
          ],
        },
        {
          heading: "Il Suo account",
          points: [
            "Tenga la password per sé.",
            "Fornisca dati veri quando si registra o manifesta il Suo interesse.",
            "Può disattivare il Suo account in qualsiasi momento dal Suo Profilo.",
          ],
        },
        {
          heading: "Sia gentile",
          points: [
            "Non pubblichi nulla di scortese, offensivo o illegale nei moduli, nella chat o nella Community.",
            "Non cerchi di danneggiare il sito o di accedere ai dati di altre persone.",
            "Possiamo disattivare gli account che violano queste regole.",
          ],
        },
        {
          heading: "Le nostre informazioni",
          paragraphs: [
            "Verifichiamo i fatti su gov.uk, UCAS e Amazon, e indichiamo le fonti su ogni pagina. Le cose cambiano, quindi verifichi sempre con la Sua scuola o il Suo college prima di decidere.",
            "Smiley, l'assistente, può sbagliare. È un aiuto, non un consiglio.",
          ],
        },
        {
          heading: "Il nome di Amazon",
          paragraphs: [
            "«Amazon» e il suo logo appartengono ad Amazon.com, Inc. o alle sue affiliate. Li usiamo per descrivere i tirocini T-Level di Amazon.",
          ],
        },
      ],
    },
    PRIVACY: {
      label: "Note legali",
      title: "Informativa sulla privacy",
      updated: "Settembre 2026",
      intro: "T-SMILE è un progetto studentesco, realizzato per il programma Digital T-Level di Amazon Emerging Talent. Non è un sito ufficiale di Amazon.",
      sections: [
        {
          heading: "Chi si occupa dei Suoi dati",
          paragraphs: ["Il team studentesco di T-SMILE. Può contattarci tramite la pagina Contattaci."],
        },
        {
          heading: "Che cosa raccogliamo e perché",
          points: [
            "Manifestazione di interesse: nome, e-mail, se è studente, genitore o insegnante, un percorso e un messaggio facoltativo. Così il team di Amazon Emerging Talent può vedere che è interessato e contattarLa.",
            "Un account: nome utente, password (salvata in forma cifrata, mai leggibile), il Suo ruolo e percorso. In seguito, se li aggiunge, nome, e-mail e numero di telefono. Così può accedere, fare domande e rispondere nella Community, e conservare le Sue impostazioni su ogni dispositivo.",
            "Impostazioni di accessibilità: dimensione del testo, contrasto, tema e scelte simili. Così il sito appare come lo ha impostato.",
            "Chat con Smiley: le domande che Smiley deve cercare, e le sue risposte. Così Smiley può seguire la conversazione. Le domande a cui risponde da solo restano nel Suo browser.",
            "Post nella Community: le domande e le risposte che pubblica, mostrate con il Suo nome utente. Così gli altri visitatori possono leggerle e rispondere.",
            "Feedback e messaggi di contatto: il Suo messaggio, e la Sua e-mail se la indica. Così possiamo sistemare le cose e risponderLe.",
          ],
        },
        {
          heading: "Chi li vede",
          points: [
            "Il team T-SMILE, e il personale di Amazon Emerging Talent per i moduli di interesse.",
            "Anthropic, l'azienda la cui IA scrive alcune risposte di Smiley. Le domande a cui Smiley non sa rispondere da solo vengono inviate lì per ottenere una risposta.",
            "L'azienda che ospita il sito (Railway per l'anteprima, Amazon Web Services in seguito).",
            "Nessun altro. Non vendiamo dati e non li usiamo per la pubblicità.",
          ],
        },
        {
          heading: "Per quanto tempo li conserviamo",
          paragraphs: [
            "Messaggi della chat con Smiley: 90 giorni.",
            "Moduli di interesse e feedback: 12 mesi.",
            "Il Suo account e i post nella Community: finché non li elimina.",
            "Può chiederci di eliminare qualsiasi cosa prima.",
          ],
        },
        {
          heading: "Minori di 18 anni",
          paragraphs: [
            "Molti dei nostri visitatori hanno meno di 18 anni, quindi chiediamo solo ciò che ci serve. Non chiediamo mai indirizzo, data di nascita o scuola in un modulo.",
          ],
        },
        {
          heading: "I Suoi diritti",
          paragraphs: ["Può consultare, correggere o eliminare i Suoi dati, e altro. La pagina Diritti sui dati spiega come."],
        },
      ],
    },
    COOKIES: {
      label: "Note legali",
      title: "Informativa sui cookie",
      updated: "Settembre 2026",
      intro: "Usiamo solo i cookie di cui il sito ha bisogno per funzionare. Nessun tracciamento, nessuna pubblicità, nessuna analisi statistica.",
      sections: [
        {
          heading: "Cookie",
          points: [
            "sessionid: mantiene l'accesso e permette a Smiley di ricordare la Sua chat. Dura due settimane, o finché non esce.",
            "csrftoken: impedisce ad altri siti di inviare moduli a Suo nome. Dura fino a un anno.",
          ],
          paragraphs: ["Il sito non può funzionare in modo sicuro senza questi cookie, quindi la legge non ci chiede un banner sui cookie."],
        },
        {
          heading: "Salvato nel Suo browser",
          paragraphs: ["Non sono cookie e non lasciano mai il Suo dispositivo."],
          points: [
            "Le Sue impostazioni di accessibilità e la lingua scelta, così restano quando torna.",
            "Se Smiley L'ha già salutata, e chi ha detto di essere, finché non chiude la scheda.",
            "Se ha chiuso l'avviso sui cookie.",
          ],
        },
        {
          heading: "Cancellarli",
          paragraphs: [
            "Può eliminare cookie e dati salvati nelle impostazioni del browser. Verrà disconnesso, e le Sue impostazioni torneranno a quelle predefinite.",
          ],
        },
      ],
    },
    DATA_RIGHTS: {
      label: "Note legali",
      title: "GDPR e i Suoi diritti sui dati",
      updated: "Settembre 2026",
      intro: "La legge britannica (UK GDPR) Le riconosce diritti sui Suoi dati. Esercitarli è gratuito.",
      sections: [
        {
          heading: "I Suoi diritti",
          points: [
            "Consultarli: chieda una copia dei dati che conserviamo su di Lei.",
            "Correggerli: ci chieda di correggere ciò che è sbagliato.",
            "Cancellarli: ci chieda di rimuovere i Suoi dati.",
            "Limitarli: ci chieda di smettere di usarli per un certo periodo.",
            "Portarli con sé: chieda i Suoi dati in un file utilizzabile altrove.",
            "Opporsi: ci dica di smettere di usarli.",
          ],
        },
        {
          heading: "Come fare richiesta",
          paragraphs: [
            "Usi il modulo Contattaci e indichi quale diritto vuole esercitare. Potremmo chiederLe di confermare la Sua identità. Risponderemo entro un mese.",
            "Può anche correggere i Suoi dati, o disattivare il Suo account, da solo dal Suo Profilo.",
          ],
        },
        {
          heading: "Non è soddisfatto?",
          paragraphs: [
            "Può presentare un reclamo all'Information Commissioner's Office (ICO), che si occupa della protezione dei dati nel Regno Unito.",
          ],
          link: { text: "Presenta un reclamo all'ICO" },
        },
      ],
    },
  },
};
