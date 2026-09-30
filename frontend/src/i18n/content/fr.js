// French words for the page copy (see ../content.js). Words only, in the same
// order as the English lists: icons, links, slugs and numbers come from the
// English files. null keeps the English, used for official qualification and
// grade names people will see on gov.uk and on their certificate.

export default {
  about: {
    ROUTE_STEPS: [
      { title: "Choisir une matière", text: "Environ 20 au choix. Deux ans, à temps plein, dans un établissement scolaire." },
      { title: "L'apprendre", text: "De 1100 à 1300 heures de cours : les bases de votre secteur, puis une spécialité." },
      { title: "Travailler", text: "Au moins 315 heures chez un employeur, soit environ 45 jours. C'est là qu'Amazon intervient." },
    ],
    TIME_SPLIT: [
      { label: "Formation", detail: "environ 80% de la formation" },
      { label: "Stage", detail: "au moins 315 heures" },
    ],
    PLACEMENT_FACTS: [
      { title: "Un vrai travail", text: "Des tâches dont l'employeur a besoin. Pas de simple observation." },
      { title: "Votre emploi du temps", text: "Un ou deux jours par semaine, un bloc de semaines, ou un mélange des deux." },
      { title: "Un ou deux employeurs", text: "En général un seul. Pas plus de deux sans une bonne raison." },
      { title: "La rémunération varie", text: "Elle n'est pas garantie. Certains employeurs paient ou prennent en charge les transports. Renseignez-vous d'abord." },
    ],
    GRADES: [
      null,
      null,
      null,
      { grade: "Pass, avec C ou plus dans le tronc commun" },
      { grade: "Pass, avec D ou E dans le tronc commun" },
    ],
    AUDIENCE_POINTS: [
      { text: "Vous avez entre 16 et 19 ans et terminez vos GCSE, ou vous changez d'orientation." },
      { text: "Vous savez à peu près dans quel secteur vous voulez travailler." },
      { text: "Vous apprenez mieux en faisant." },
      { text: "Vous voulez une qualification reconnue par les employeurs, tout en gardant l'université possible." },
      { text: "Vous êtes prêt à vous concentrer sur un domaine pendant deux ans. Vous voulez garder beaucoup de matières ? Les A levels vous conviendront peut-être mieux." },
    ],
    BENEFITS: [
      { title: "Un vrai travail", text: "Au moins 315 heures au sein d'une équipe en activité." },
      { title: "L'équivalent de trois A levels", text: "Il rapporte des points UCAS, l'université reste donc possible." },
      { title: "Conçu avec des employeurs", text: "Des employeurs ont participé à l'écriture de ce que vous apprenez." },
      { title: "Trois suites possibles", text: "Un emploi qualifié, un apprentissage de niveau supérieur ou l'université." },
    ],
    COST_POINTS: [
      { title: "La formation est gratuite", text: "Si vous avez entre 16 et 18 ans et suivez une formation à temps plein." },
      { title: "Une aide pour les frais", text: "La 16 to 19 Bursary peut couvrir les transports, les livres, l'équipement et les vêtements spécialisés." },
      { title: "Jusqu'à £1200 par an", text: "Pour les élèves placés, les jeunes sortant de l'aide sociale à l'enfance et certains élèves percevant certaines prestations." },
      { title: "Demandez à votre établissement", text: "Toute autre personne peut demander une bourse discrétionnaire. Elle ne peut pas couvrir le loyer ni les factures." },
    ],
    PATHWAYS: [
      {
        name: "Numérique",
        summary: "Concevoir, faire fonctionner et assister la technologie.",
        placement: "Vous travaillez avec une équipe technique sur des tâches réelles : écrire et relire du code, tester, corriger des bugs, ou assurer le bon fonctionnement des systèmes et l'assistance aux utilisateurs.",
        suits: "Aux personnes qui aiment résoudre un problème et voir le résultat fonctionner tout de suite.",
        amazonStatus: "Là où le programme T-Level d'Amazon a commencé.",
      },
      {
        name: "Commerce",
        summary: "Faire tourner les équipes et les opérations.",
        placement: "Vous aidez au fonctionnement quotidien d'une équipe : planifier, coordonner, gérer des données et des rapports, et veiller au bon déroulement des processus.",
        suits: "Aux personnes organisées qui aiment que les choses fonctionnent bien.",
        amazonStatus: "Citée par Amazon comme une filière dans laquelle il se développe.",
      },
      {
        name: "Médias",
        summary: "Planifier, créer et publier du contenu.",
        placement: "Vous aidez à planifier et à produire du contenu, du tournage et du montage jusqu'à la publication, et voyez comment une idée arrive jusqu'à son public.",
        suits: "Aux personnes qui veulent créer des choses que d'autres regarderont ou liront.",
        amazonStatus: "Citée par Amazon comme une filière créative dans laquelle il se développe.",
      },
      {
        name: "Finance",
        summary: "Travailler avec les chiffres derrière les décisions.",
        tLevels: [null, "Finance, dernières inscriptions en septembre 2026"],
        placement: "Vous travaillez sur de vrais chiffres : suivre les dépenses, vérifier des registres et aider à préparer les rapports sur lesquels une équipe s'appuie pour décider.",
        suits: "Aux personnes à l'aise avec les chiffres et capables de repérer ce qui cloche.",
      },
      {
        name: "Ingénierie",
        summary: "Concevoir, construire et entretenir des systèmes.",
        placement: "Vous travaillez aux côtés d'ingénieurs sur des équipements et des systèmes : installation, maintenance, essais et amélioration de leur fonctionnement.",
        suits: "Aux personnes qui veulent comprendre comment fonctionne un objet physique, puis le faire mieux fonctionner.",
        amazonStatus: "Citée par Amazon comme une filière dans laquelle il se développe.",
      },
    ],
    FAQS: [
      {
        question: "Un T-Level est-il la même chose qu'un apprentissage ?",
        answer: "Non, c'est l'inverse. Un apprentissage est surtout un travail rémunéré avec un peu de formation. Un T-Level est surtout de la formation, environ 80 pour cent, avec un stage en entreprise d'au moins 315 heures pour le reste.",
      },
      {
        question: "De quels GCSE ai-je besoin ?",
        answer: "Les conditions d'admission sont fixées par chaque établissement scolaire, pas au niveau national. Quatre ou cinq GCSE avec une note de 4 ou plus, en général dont l'anglais et les mathématiques, c'est courant. Renseignez-vous auprès de l'établissement qui vous intéresse.",
      },
      {
        question: "Parmi quelles matières T-Level puis-je choisir ?",
        answer: "Environ 20, dans des domaines comme le numérique, l'ingénierie, le bâtiment, la santé, les sciences, le droit et la comptabilité, les médias, le marketing, l'agriculture, les soins aux animaux, l'éducation, et l'artisanat et le design. Le sport et l'aide sociale arrivent en septembre 2028. Le T-Level Finance accueille ses dernières inscriptions en septembre 2026, c'est donc Accounting qui continue.",
      },
      {
        question: "Comment suis-je évalué ?",
        answer: "En deux parties. Le tronc commun est noté de A étoile à E et couvre les connaissances de votre secteur. La spécialité professionnelle est notée pass, merit ou distinction et correspond à la partie pratique. Les deux figurent sur votre certificat, avec une note globale. Le tronc commun comprend aussi un projet défini par un employeur (ESP), et la spécialité professionnelle est souvent abrégée en OS.",
      },
      {
        question: "Puis-je quand même aller à l'université ?",
        answer: "Oui. Une Distinction étoile vaut 168 points UCAS, une Distinction 144, un Merit 120 et un Pass 72 ou 96 selon votre note du tronc commun. Toutes les universités n'utilisent pas les points UCAS, vérifiez donc les conditions d'admission de la formation qui vous intéresse.",
      },
      {
        question: "Et si je ne réussis pas tout ?",
        answer: "Vous recevez une attestation de réussite T-Level au lieu du certificat complet. Elle indique les parties que vous avez terminées, votre travail n'est donc pas perdu.",
      },
      {
        question: "Combien de temps dure le stage en entreprise ?",
        answer: "Au moins 315 heures, soit environ 45 jours. Il peut se faire à raison d'un ou deux jours par semaine, en un bloc à temps plein, ou en mélangeant les deux. Amazon organise ses stages en un bloc de neuf semaines. La spécialité Early Years Educator exige 750 heures.",
      },
      {
        question: "Suis-je payé pendant le stage ?",
        answer: "Aucune loi n'oblige à rémunérer un stage. Certains employeurs paient, d'autres prennent en charge les transports ou les repas, d'autres rien du tout. Demandez à votre établissement comment cela se passe avant de commencer.",
      },
      {
        question: "Puis-je obtenir une aide pour les transports ou l'équipement ?",
        answer: "Oui, grâce au 16 to 19 Bursary Fund. Il peut couvrir les transports, les livres, l'équipement et les vêtements spécialisés. Faites la demande auprès de votre établissement scolaire.",
      },
      {
        question: "Et si je ne suis pas encore prêt pour un T-Level ?",
        answer: "Il existe une T-Level Foundation Year, une formation d'un an de niveau 2 qui renforce d'abord votre anglais, vos mathématiques, vos compétences numériques et votre expérience professionnelle, puis vous fait passer au T-Level.",
      },
      {
        question: "Puis-je préparer d'autres qualifications en même temps ?",
        answer: "Un T-Level est une formation à temps plein équivalant en gros à trois A levels, on le combine donc rarement avec beaucoup d'autres choses. Certains établissements autorisent une qualification supplémentaire. Renseignez-vous auprès du vôtre.",
      },
    ],
    QUIZ_QUESTIONS: [
      {
        question: "Comment apprenez-vous le mieux ?",
        options: [
          { label: "En faisant les choses, puis en demandant pourquoi" },
          { label: "Un peu des deux" },
          { label: "En lisant, en rédigeant et en révisant" },
        ],
      },
      {
        question: "Savez-vous quel type de travail vous voulez ?",
        options: [
          { label: "J'ai une assez bonne idée du secteur" },
          { label: "Un domaine approximatif, pas le métier" },
          { label: "Aucune idée pour l'instant" },
        ],
      },
      {
        question: "Que pensez-vous de 45 jours dans un vrai lieu de travail ?",
        options: [
          { label: "C'est la partie qui m'intéresse" },
          { label: "Un peu stressé, mais partant" },
          { label: "Je préférerais rester en classe" },
        ],
      },
      {
        question: "Quel mode d'évaluation vous convient ?",
        options: [
          { label: "Des examens plus une spécialité pratique notée" },
          { label: "Peu m'importe" },
          { label: "Uniquement des examens écrits" },
        ],
      },
      {
        question: "Que voulez-vous faire après la formation ?",
        options: [
          { label: "Un emploi qualifié ou un apprentissage de niveau licence" },
          { label: "Garder le travail et l'université ouverts" },
          { label: "Un diplôme dans un tout autre domaine" },
        ],
      },
      {
        question: "Êtes-vous prêt à vous engager dans un seul domaine pendant deux ans ?",
        options: [
          { label: "Oui" },
          { label: "Je pense que oui" },
          { label: "Je veux garder mes options ouvertes" },
        ],
      },
    ],
    QUIZ_RESULTS: [
      {
        heading: "Un T-Level semble très bien vous convenir",
        text: "Vous voulez apprendre en pratiquant, passer du temps dans un vrai lieu de travail et avoir un parcours clair vers un secteur. C'est exactement ce pour quoi un T-Level est conçu. Prochaine étape : voyez laquelle des cinq filières vous correspond, puis manifestez votre intérêt auprès d'Amazon.",
      },
      {
        heading: "Cela mérite qu'on s'y intéresse",
        text: "Certaines choses vous conviennent et d'autres restent ouvertes, ce qui est normal à ce stade. Lisez les filières et les questions ci-dessous, et parlez-en à un enseignant ou à un conseiller d'orientation avant de décider.",
      },
      {
        heading: "Une autre voie pourrait mieux vous convenir",
        text: "D'après vos réponses, vous préférez apprendre en classe et garder plusieurs matières, ce que les A levels font bien. C'est une très bonne réponse. Si c'est le stage qui vous attire, les filières ci-dessous valent quand même la peine d'être lues.",
      },
    ],
  },
  amazon: {
    PLACEMENT_SHAPE: [
      { title: "Neuf semaines", text: "Vous rejoignez une équipe, apprenez les outils et faites un vrai travail." },
      { title: "Centres de compétences", text: "Une partie se déroule dans les centres de compétences d'Amazon, par blocs de 15 jours." },
      { title: "Projets de groupe", text: "Travaillez avec d'autres élèves sur des projets pour des associations caritatives." },
      { title: "Défis d'équipe", text: "Des tâches fixées par votre équipe qui mobilisent vos compétences T-Level." },
    ],
    SUPPORT: [
      { title: "Un binôme", text: "Pour les petites questions." },
      { title: "Un mentor", text: "Guide votre travail et vous montre la vue d'ensemble." },
      { title: "Un responsable de stage", text: "Assure le bon déroulement du stage avec votre établissement scolaire." },
    ],
    ROUTE_IN: [
      { title: "Commencer un T-Level", text: "Pour les jeunes de 16 à 18 ans déjà inscrits en T-Level." },
      { title: "Votre établissement prend contact", text: "Amazon organise les stages avec les établissements scolaires, pas directement avec les élèves." },
      { title: "Manifester votre intérêt", text: "Indiquez-nous votre filière et nous la transmettons à Amazon. Ce n'est pas une candidature." },
    ],
    GROWTH: [
      { caption: "élèves la première année" },
      { caption: "élèves, quatre fois plus" },
      { caption: "stages prévus" },
    ],
  },
  help: {
    SERVICES: [
      { title: "Trouver un T-Level près de chez vous", text: "Recherchez par code postal et par matière.", linkText: "Trouver un T-Level sur tlevels.gov.uk" },
      { title: "Conseils d'orientation gratuits", text: "Appelez le 0800 100 900 ou utilisez le chat en ligne. Pour toute personne de 13 ans et plus.", linkText: "National Careers Service" },
      { title: "Aide pour les transports et l'équipement", text: "La 16 to 19 Bursary. Faites la demande auprès de votre établissement scolaire.", linkText: "Recommandations sur le 16 to 19 Bursary Fund" },
      { title: "Règles des stages", text: "Les recommandations officielles sur ce qu'un stage doit comprendre.", linkText: "Recommandations sur les stages en entreprise" },
    ],
    PROVIDER_QUESTIONS: [
      "Quels T-Levels et quelles spécialités proposez-vous ?",
      "Est-ce vous qui trouvez mon stage, ou moi ?",
      "Quels employeurs ont accueilli vos élèves ?",
      "Le stage se fait-il en bloc, un jour par semaine, ou un mélange des deux ?",
      "Quelles sont vos conditions d'admission ?",
      "Quel accompagnement proposez-vous si j'ai des besoins particuliers ?",
    ],
    SITE_ROUTES: [
      { label: "Qu'est-ce qu'un T-Level ?", detail: "À propos des T-Levels" },
      { label: "Je veux voir toutes les matières", detail: "Tous les T-Levels" },
      { label: "À quoi ressemble un stage chez Amazon ?", detail: "Les T-Levels chez Amazon" },
      { label: "Je veux des guides et des dossiers", detail: "Ressources T-Level" },
      { label: "Je veux manifester mon intérêt", detail: "Manifester son intérêt" },
      { label: "J'ai déjà un compte", detail: "Connexion" },
    ],
  },
  interest: {
    NEXT_STEPS: [
      { text: "Vous cochez une case. Cela ne prend qu'un instant." },
      { text: "L'équipe Amazon Emerging Talent peut voir qui est intéressé." },
      { text: "Les stages sont organisés avec votre établissement scolaire, qui pourra donc être contacté." },
    ],
    WHY_WE_ASK: "Nous envoyons seulement ce dont l'équipe Amazon Emerging Talent a besoin pour savoir que vous êtes intéressé : le nom, l'e-mail et la filière déjà enregistrés sur votre compte. Pas d'adresse, de date de naissance ni d'établissement.",
  },
  quiz: {
    KNOWLEDGE_QUESTIONS: [
      {
        question: "Combien de temps dure le stage en entreprise d'un T-Level ?",
        options: ["Au moins 315 heures, soit environ 45 jours", "Deux semaines", "Une année entière", "Il n'y en a pas"],
        correctAnswer: "Au moins 315 heures, soit environ 45 jours",
        explanation: "Au moins 315 heures, soit environ 45 jours. Amazon organise ses stages en un bloc de neuf semaines.",
      },
      {
        question: "Un T-Level équivaut en gros à combien d'A levels ?",
        options: ["Un", "Deux", "Trois", "Cinq"],
        correctAnswer: "Trois",
        explanation: "Trois. Un T-Level rapporte aussi des points UCAS, l'université vous reste donc ouverte.",
      },
      {
        question: "Quelle est la principale différence entre un T-Level et un apprentissage ?",
        options: [
          "Un T-Level est surtout de la formation, un apprentissage surtout un travail rémunéré",
          "C'est la même chose",
          "Un T-Level est surtout un travail rémunéré, un apprentissage surtout de la formation",
          "Seul l'apprentissage comprend du temps chez un employeur",
        ],
        correctAnswer: "Un T-Level est surtout de la formation, un apprentissage surtout un travail rémunéré",
        explanation: "C'est l'inverse. Un T-Level, c'est environ 80 pour cent de formation, avec un stage en entreprise d'au moins 315 heures pour le reste.",
      },
      {
        question: "Quelle filière comprend le T-Level Digital Software Development ?",
        options: ["Numérique", "Commerce", "Ingénierie", "Médias"],
        correctAnswer: "Numérique",
        explanation: "Numérique. Elle comprend aussi Digital Data Analytics et Digital Support and Security.",
      },
      {
        question: "Quelle filière comprend le T-Level Management and Administration ?",
        options: ["Commerce", "Finance", "Médias", "Numérique"],
        correctAnswer: "Commerce",
        explanation: "Commerce. Sur le site, elle est résumée ainsi : faire tourner les équipes et les opérations.",
      },
      {
        question: "Qui s'occupe de vous pendant un stage chez Amazon ?",
        options: [
          "Un binôme, un mentor et un responsable de stage",
          "Personne, vous travaillez seul",
          "Seulement votre enseignant",
          "Un responsable différent chaque jour",
        ],
        correctAnswer: "Un binôme, un mentor et un responsable de stage",
        explanation: "Chaque élève a un binôme, un mentor et un responsable de stage, il y a donc toujours quelqu'un à qui demander.",
      },
      {
        question: "Faut-il un compte pour utiliser la bibliothèque de ressources de T-SMILE ?",
        options: [
          "Non, mais certaines ressources nécessitent un compte gratuit",
          "Oui, pour tout",
          "Non, tout est ouvert à tous",
          "Seulement si vous êtes enseignant",
        ],
        correctAnswer: "Non, tout est ouvert à tous",
        explanation: "Tout le monde peut parcourir la bibliothèque et tout y ouvrir. Un compte gratuit sert à poser des questions et à répondre dans la Communauté, et à garder vos réglages.",
      },
    ],
  },
  legal: {
    TERMS: {
      label: "Mentions légales",
      title: "Conditions d'utilisation",
      updated: "septembre 2026",
      intro: "T-SMILE est un projet d'élèves, réalisé pour le programme Digital T-Level d'Amazon Emerging Talent. Ce n'est pas un site officiel d'Amazon.",
      sections: [
        {
          heading: "Utiliser le site",
          paragraphs: [
            "Tout le monde peut lire toutes les pages, ouvrir toutes les ressources, faire les quiz et parler à Smiley sans compte. Un compte gratuit vous permet de poser des questions et de répondre dans la Communauté.",
            "Vous devez avoir 16 ans ou plus pour créer un compte.",
          ],
        },
        {
          heading: "Votre compte",
          points: [
            "Gardez votre mot de passe pour vous.",
            "Donnez des informations exactes lorsque vous vous inscrivez ou manifestez votre intérêt.",
            "Vous pouvez désactiver votre compte à tout moment depuis votre Profil.",
          ],
        },
        {
          heading: "Soyez bienveillant",
          points: [
            "Ne publiez rien de grossier, de blessant ou d'illégal dans les formulaires, dans le chat ou dans la Communauté.",
            "N'essayez pas de casser le site ni d'accéder aux données des autres.",
            "Nous pouvons désactiver les comptes qui enfreignent ces règles.",
          ],
        },
        {
          heading: "Nos informations",
          paragraphs: [
            "Nous vérifions les faits auprès de gov.uk, UCAS et Amazon, et indiquons nos sources sur chaque page. Les choses changent, alors vérifiez toujours auprès de votre établissement scolaire avant de décider.",
            "Smiley, l'assistant, peut se tromper. C'est une aide, pas un conseil.",
          ],
        },
        {
          heading: "Le nom d'Amazon",
          paragraphs: [
            "« Amazon » et son logo appartiennent à Amazon.com, Inc. ou à ses filiales. Nous les utilisons pour décrire les stages T-Level d'Amazon.",
          ],
        },
      ],
    },
    PRIVACY: {
      label: "Mentions légales",
      title: "Politique de confidentialité",
      updated: "septembre 2026",
      intro: "T-SMILE est un projet d'élèves, réalisé pour le programme Digital T-Level d'Amazon Emerging Talent. Ce n'est pas un site officiel d'Amazon.",
      sections: [
        {
          heading: "Qui s'occupe de vos données",
          paragraphs: ["L'équipe d'élèves de T-SMILE. Vous pouvez nous joindre via la page Nous contacter."],
        },
        {
          heading: "Ce que nous collectons, et pourquoi",
          points: [
            "Manifestation d'intérêt : votre nom, votre e-mail, si vous êtes élève, parent ou enseignant, une filière et un message facultatif. Pour que l'équipe Amazon Emerging Talent sache que vous êtes intéressé et puisse vous contacter.",
            "Un compte : un nom d'utilisateur, un mot de passe (enregistré sous forme chiffrée, jamais lisible), votre rôle et votre filière. Plus tard, si vous les ajoutez, votre nom, votre e-mail et votre numéro de téléphone. Pour que vous puissiez vous connecter, poser des questions et répondre dans la Communauté, et garder vos réglages sur tous vos appareils.",
            "Paramètres d'accessibilité : taille du texte, contraste, thème et choix similaires. Pour que le site s'affiche comme vous l'avez réglé.",
            "Conversation avec Smiley : les questions que Smiley doit chercher, et ses réponses. Pour que Smiley puisse suivre la conversation. Les questions auxquelles il répond lui-même restent dans votre navigateur.",
            "Messages dans la Communauté : les questions et réponses que vous publiez, affichées avec votre nom d'utilisateur. Pour que les autres visiteurs puissent les lire et y répondre.",
            "Avis et messages de contact : votre message, et votre e-mail si vous le donnez. Pour que nous puissions corriger les problèmes et vous répondre.",
          ],
        },
        {
          heading: "Qui les voit",
          points: [
            "L'équipe T-SMILE, et le personnel d'Amazon Emerging Talent pour les manifestations d'intérêt.",
            "Anthropic, l'entreprise dont l'IA rédige certaines réponses de Smiley. Les questions auxquelles Smiley ne peut pas répondre lui-même lui sont envoyées pour obtenir une réponse.",
            "L'entreprise qui héberge le site (Railway pour la version de démonstration, Amazon Web Services plus tard).",
            "Personne d'autre. Nous ne vendons pas de données et ne les utilisons pas pour de la publicité.",
          ],
        },
        {
          heading: "Combien de temps nous les gardons",
          paragraphs: [
            "Conversations avec Smiley : 90 jours.",
            "Manifestations d'intérêt et avis : 12 mois.",
            "Votre compte et vos messages dans la Communauté : jusqu'à ce que vous les supprimiez.",
            "Vous pouvez nous demander de tout supprimer plus tôt.",
          ],
        },
        {
          heading: "Moins de 18 ans",
          paragraphs: [
            "Beaucoup de nos visiteurs ont moins de 18 ans, nous ne demandons donc que le nécessaire. Nous ne demandons jamais votre adresse, votre date de naissance ni votre établissement dans un formulaire.",
          ],
        },
        {
          heading: "Vos droits",
          paragraphs: ["Vous pouvez consulter, corriger ou supprimer vos données, et plus encore. La page Droits sur les données explique comment."],
        },
      ],
    },
    COOKIES: {
      label: "Mentions légales",
      title: "Politique relative aux cookies",
      updated: "septembre 2026",
      intro: "Nous utilisons uniquement les cookies nécessaires au fonctionnement du site. Pas de suivi, pas de publicité, pas de statistiques.",
      sections: [
        {
          heading: "Cookies",
          points: [
            "sessionid : vous garde connecté, et permet à Smiley de se souvenir de votre conversation. Dure deux semaines, ou jusqu'à votre déconnexion.",
            "csrftoken : empêche d'autres sites d'envoyer des formulaires en votre nom. Dure jusqu'à un an.",
          ],
          paragraphs: ["Le site ne peut pas fonctionner en toute sécurité sans eux, la loi ne nous demande donc pas de bannière de cookies."],
        },
        {
          heading: "Enregistré dans votre navigateur",
          paragraphs: ["Ce ne sont pas des cookies, et ils ne quittent jamais votre appareil."],
          points: [
            "Vos paramètres d'accessibilité et la langue choisie, pour qu'ils restent à votre retour.",
            "Si Smiley vous a dit bonjour, et qui vous lui avez dit être, jusqu'à la fermeture de l'onglet.",
            "Si vous avez fermé l'avis sur les cookies.",
          ],
        },
        {
          heading: "Les effacer",
          paragraphs: [
            "Vous pouvez supprimer les cookies et les données enregistrées dans les paramètres de votre navigateur. Vous serez déconnecté, et vos réglages reviendront à la normale.",
          ],
        },
      ],
    },
    DATA_RIGHTS: {
      label: "Mentions légales",
      title: "RGPD et vos droits sur les données",
      updated: "septembre 2026",
      intro: "La loi britannique (UK GDPR) vous donne des droits sur vos données. Leur exercice est gratuit.",
      sections: [
        {
          heading: "Vos droits",
          points: [
            "Consulter : demandez une copie des données que nous détenons sur vous.",
            "Corriger : demandez-nous de rectifier ce qui est faux.",
            "Supprimer : demandez-nous d'effacer vos données.",
            "Limiter : demandez-nous d'arrêter de les utiliser pendant un temps.",
            "Récupérer : demandez vos données dans un fichier utilisable ailleurs.",
            "Vous opposer : dites-nous d'arrêter de les utiliser.",
          ],
        },
        {
          heading: "Comment faire une demande",
          paragraphs: [
            "Utilisez le formulaire Nous contacter et indiquez quel droit vous voulez exercer. Nous pouvons vous demander de confirmer votre identité. Nous répondrons dans un délai d'un mois.",
            "Vous pouvez aussi corriger vos informations, ou désactiver votre compte, vous-même depuis votre Profil.",
          ],
        },
        {
          heading: "Pas satisfait ?",
          paragraphs: [
            "Vous pouvez déposer une plainte auprès de l'Information Commissioner's Office (ICO), qui veille à la protection des données au Royaume-Uni.",
          ],
          link: { text: "Déposer une plainte auprès de l'ICO" },
        },
      ],
    },
  },
};
