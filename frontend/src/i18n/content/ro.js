// Romanian words for the page copy (see ../content.js). Words only, in the
// same order as the English lists: icons, links, slugs and numbers come from
// the English files. null keeps the English, used for official qualification
// and grade names people will see on gov.uk and on their certificate.

export default {
  about: {
    ROUTE_STEPS: [
      { title: "Alege un domeniu", text: "Circa 20 din care să alegi. Doi ani, cu normă întreagă, la o școală sau un colegiu." },
      { title: "Învață-l", text: "Între 1100 și 1300 de ore de curs: bazele domeniului tău, apoi o specializare." },
      { title: "Lucrează", text: "Cel puțin 315 ore la un angajator, cam 45 de zile. Aici intervine Amazon." },
    ],
    TIME_SPLIT: [
      { label: "Învățare", detail: "cam 80% din curs" },
      { label: "Stagiu", detail: "cel puțin 315 ore" },
    ],
    PLACEMENT_FACTS: [
      { title: "Muncă reală", text: "Sarcini de care angajatorul chiar are nevoie. Nu doar observare." },
      { title: "Programul tău", text: "O zi sau două pe săptămână, un bloc de săptămâni sau o combinație." },
      { title: "Unul sau doi angajatori", text: "De obicei unul. Nu mai mult de doi fără un motiv bun." },
      { title: "Plata diferă", text: "Nu este garantată. Unii angajatori plătesc sau acoperă transportul. Întreabă înainte." },
    ],
    GRADES: [
      null,
      null,
      null,
      { grade: "Pass, cu C sau mai mult la partea de bază (core)" },
      { grade: "Pass, cu D sau E la partea de bază (core)" },
    ],
    AUDIENCE_POINTS: [
      { text: "Ai între 16 și 19 ani și îți termini GCSE-urile sau schimbi cursul." },
      { text: "Știi în linii mari în ce domeniu vrei să lucrezi." },
      { text: "Înveți cel mai bine făcând." },
      { text: "Vrei o calificare în care angajatorii au încredere, cu drumul spre universitate deschis." },
      {
        text: "Nu te deranjează să te concentrezi pe un singur domeniu timp de doi ani. Vrei să păstrezi multe materii? A levels ți s-ar putea potrivi mai bine.",
      },
    ],
    BENEFITS: [
      { title: "Muncă reală", text: "Cel puțin 315 ore într-o echipă care lucrează cu adevărat." },
      { title: "Cât trei A levels", text: "Aduce puncte UCAS, deci drumul spre universitate rămâne deschis." },
      { title: "Creat împreună cu angajatorii", text: "Angajatorii au ajutat la stabilirea a ceea ce înveți." },
      { title: "Trei drumuri mai departe", text: "Un loc de muncă calificat, o ucenicie de nivel superior sau universitatea." },
    ],
    COST_POINTS: [
      { title: "Cursul este gratuit", text: "Dacă ai între 16 și 18 ani și ești la învățământ cu normă întreagă." },
      {
        title: "Ajutor pentru costuri",
        text: "Bursa 16 to 19 Bursary poate acoperi transportul, cărțile, echipamentul și îmbrăcămintea de specialitate.",
      },
      {
        title: "Până la £1200 pe an",
        text: "Pentru elevii aflați în plasament, tinerii care au ieșit din sistemul de protecție și unii elevi care primesc anumite ajutoare sociale.",
      },
      {
        title: "Întreabă la colegiu",
        text: "Oricine altcineva poate cere o bursă discreționară. Nu acoperă chiria sau facturile.",
      },
    ],
    PATHWAYS: [
      {
        name: "Digital",
        summary: "Creezi, administrezi și susții tehnologia.",
        placement:
          "Lucrezi cu o echipă tehnică la sarcini reale: scrii și verifici cod, testezi, repari erori sau ții sistemele și utilizatorii în funcțiune.",
        suits: "Oameni cărora le place să rezolve o problemă și să vadă imediat că merge.",
        amazonStatus: "Aici a început programul T-Level al Amazon.",
      },
      {
        name: "Afaceri",
        summary: "Ții echipele și operațiunile în funcțiune.",
        placement:
          "Sprijini activitatea zilnică a unei echipe: planificare, coordonare, lucrul cu date și rapoarte și menținerea proceselor pe drumul cel bun.",
        suits: "Oameni organizați cărora le place ca lucrurile să meargă cum trebuie.",
        amazonStatus: "Numit de Amazon drept un parcurs în care se extinde.",
      },
      {
        name: "Media",
        summary: "Planifici, creezi și publici conținut.",
        placement:
          "Ajuți la planificarea și producerea de conținut, de la filmare și montaj până la publicare, și vezi cum un material ajunge de la idee la public.",
        suits: "Oameni care vor să creeze lucruri pe care alții le vor vedea sau citi.",
        amazonStatus: "Numit de Amazon drept un parcurs creativ în care se extinde.",
      },
      {
        name: "Finanțe",
        summary: "Lucrezi cu cifrele din spatele deciziilor.",
        tLevels: [null, "Finance, ultimele înscrieri în septembrie 2026"],
        placement:
          "Lucrezi cu cifre reale: urmărești cheltuielile, verifici evidențele și ajuți la pregătirea rapoartelor pe baza cărora o echipă ia decizii.",
        suits: "Oameni care se simt bine cu cifrele și observă ce nu se potrivește.",
      },
      {
        name: "Inginerie",
        summary: "Proiectezi, construiești și întreții sisteme.",
        placement:
          "Lucrezi alături de ingineri cu echipamente și sisteme: le instalezi, le întreții, le testezi și le îmbunătățești funcționarea.",
        suits: "Oameni care vor să înțeleagă cum funcționează un lucru fizic, apoi să-l facă să meargă mai bine.",
        amazonStatus: "Numit de Amazon drept un parcurs în care se extinde.",
      },
    ],
    FAQS: [
      {
        question: "Un T-Level este același lucru cu o ucenicie (apprenticeship)?",
        answer:
          "Nu, e invers. O ucenicie înseamnă în mare parte muncă plătită, cu puțin studiu. Un T-Level înseamnă în mare parte studiu, cam 80 la sută, iar restul este un stagiu la un angajator de cel puțin 315 ore.",
      },
      {
        question: "De ce GCSE am nevoie?",
        answer:
          "Condițiile de admitere sunt stabilite de fiecare școală sau colegiu, nu la nivel național. Frecvent se cer patru sau cinci GCSE cu nota 4 sau mai mare, de obicei inclusiv engleză și matematică. Verifică la instituția unde vrei să mergi.",
      },
      {
        question: "Din ce T-Levels pot alege?",
        answer:
          "Circa 20, în domenii precum digital, inginerie, construcții, sănătate, științe, drept și contabilitate, media, marketing, agricultură, îngrijirea animalelor, educație, precum și meșteșuguri și design. Sport și Social Care vin în septembrie 2028. T-Level-ul Finance are ultimele înscrieri în septembrie 2026, așa că cel care continuă este Accounting.",
      },
      {
        question: "Cum sunt evaluat?",
        answer:
          "În două părți. Partea de bază (core) se notează de la A cu steluță la E și acoperă cunoștințele domeniului tău. Specializarea ocupațională (occupational specialism) se notează cu pass, merit sau distinction și este partea practică. Ambele apar pe certificat, împreună cu o notă finală.",
      },
      {
        question: "Mai pot merge la universitate?",
        answer:
          "Da. Un Distinction cu steluță valorează 168 de puncte UCAS, un Distinction 144, un Merit 120, iar un Pass 72 sau 96, în funcție de nota la partea de bază. Totuși, nu toate universitățile folosesc punctele UCAS, așa că verifică cerințele cursului care te interesează.",
      },
      {
        question: "Ce se întâmplă dacă nu promovez tot?",
        answer:
          "Primești o declarație de rezultate T-Level (statement of achievement) în locul certificatului complet. Ea arată părțile pe care le-ai terminat, așa că munca ta nu se pierde.",
      },
      {
        question: "Cât durează stagiul la angajator?",
        answer:
          "Cel puțin 315 ore, cam 45 de zile. Poate fi una sau două zile pe săptămână, un bloc cu normă întreagă sau o combinație. Amazon organizează stagiile ca un bloc de nouă săptămâni. Specializarea Early Years Educator cere în schimb 750 de ore.",
      },
      {
        question: "Sunt plătit în stagiu?",
        answer:
          "Legea nu obligă ca stagiul să fie plătit. Unii angajatori plătesc, alții acoperă transportul sau mesele, iar alții nu fac nici una, nici alta. Întreabă școala cum se procedează înainte să începi.",
      },
      {
        question: "Pot primi ajutor pentru transport sau echipament?",
        answer:
          "Da, prin 16 to 19 Bursary Fund. Poate acoperi transportul, cărțile, echipamentul și îmbrăcămintea de specialitate. Aplici prin școala sau colegiul tău.",
      },
      {
        question: "Ce fac dacă nu sunt încă pregătit pentru un T-Level?",
        answer:
          "Există T-Level Foundation Year, un curs de un an de nivel 2 care îți dezvoltă mai întâi engleza, matematica, abilitățile digitale și experiența de muncă, apoi te duce la T-Level.",
      },
      {
        question: "Pot face și alte calificări în paralel?",
        answer:
          "Un T-Level este un program cu normă întreagă, cam cât trei A levels, așa că de obicei nu se combină cu multe altele. Unele instituții permit o calificare în plus. Întreabă la a ta.",
      },
    ],
    QUIZ_QUESTIONS: [
      {
        question: "Cum înveți cel mai bine?",
        options: [
          { label: "Făcând lucrul respectiv, apoi întrebând de ce" },
          { label: "Câte puțin din amândouă" },
          { label: "Citind, scriind și recapitulând" },
        ],
      },
      {
        question: "Știi ce fel de muncă vrei?",
        options: [
          { label: "Am o idee destul de clară despre domeniu" },
          { label: "Un domeniu aproximativ, nu meseria" },
          { label: "Încă habar n-am" },
        ],
      },
      {
        question: "Ce părere ai despre 45 de zile într-un loc de muncă real?",
        options: [
          { label: "Asta e partea pe care o vreau" },
          { label: "Emoționat, dar pregătit" },
          { label: "Aș prefera să rămân în clasă" },
        ],
      },
      {
        question: "Ce fel de evaluare ți se potrivește?",
        options: [
          { label: "Examene plus o specializare practică notată" },
          { label: "Nu contează" },
          { label: "Doar examene scrise" },
        ],
      },
      {
        question: "Ce vrei să faci după curs?",
        options: [
          { label: "Muncă calificată sau o ucenicie de nivel universitar (degree apprenticeship)" },
          { label: "Să păstrez deschise și munca, și universitatea" },
          { label: "O facultate într-un domeniu fără legătură cu acesta" },
        ],
      },
      {
        question: "Ești gata să te dedici unui singur domeniu timp de doi ani?",
        options: [{ label: "Da" }, { label: "Cred că da" }, { label: "Vreau să-mi păstrez multe opțiuni" }],
      },
    ],
    QUIZ_RESULTS: [
      {
        heading: "Un T-Level pare foarte potrivit",
        text: "Vrei să înveți practic, să petreci timp într-un loc de muncă real și să ai un drum clar spre un domeniu. Exact pentru asta este gândit un T-Level. Următorul pas: vezi care dintre cele cinci parcursuri ți se potrivește, apoi înregistrează-ți interesul la Amazon.",
      },
      {
        heading: "Merită să te uiți cu atenție",
        text: "Unele lucruri ți se potrivesc, iar altele sunt încă deschise, ceea ce e normal în acest moment. Citește parcursurile și întrebările de mai jos și discută cu un profesor sau cu un consilier de carieră înainte să decizi.",
      },
      {
        heading: "Alt drum ți s-ar putea potrivi mai bine",
        text: "Din răspunsurile tale, înclini spre învățarea la clasă și spre a păstra mai multe materii deschise, lucru la care A levels sunt bune. E un răspuns foarte bun. Dacă stagiul este partea care te atrage, tot merită să citești parcursurile de mai jos.",
      },
    ],
  },

  amazon: {
    PLACEMENT_SHAPE: [
      { title: "Nouă săptămâni", text: "Te alături unei echipe, înveți instrumentele și faci muncă reală." },
      { title: "Centre de competențe", text: "O parte se desfășoară în centrele de competențe (skills hubs) ale Amazon, în blocuri de 15 zile." },
      { title: "Proiecte de grup", text: "Lucrezi cu alți elevi la proiecte pentru organizații caritabile." },
      { title: "Provocări de echipă", text: "Sarcini date de echipa ta, în care folosești abilitățile de la T-Level." },
    ],
    SUPPORT: [
      { title: "Un coleg de sprijin (buddy)", text: "Pentru întrebările mici." },
      { title: "Un mentor", text: "Îți îndrumă munca și îți arată imaginea de ansamblu." },
      { title: "Un coordonator de stagiu", text: "Ține stagiul pe drumul cel bun împreună cu școala sau colegiul tău." },
    ],
    ROUTE_IN: [
      { title: "Începe un T-Level", text: "Pentru tinerii de 16 până la 18 ani care urmează deja un curs T-Level." },
      {
        title: "Colegiul tău ia legătura",
        text: "Amazon organizează stagiile cu școlile și colegiile, nu direct cu elevii.",
      },
      { title: "Înregistrează-ți interesul", text: "Spune-ne parcursul tău și îl transmitem către Amazon. Nu este o aplicație." },
    ],
    GROWTH: [
      { caption: "elevi în primul an" },
      { caption: "elevi, de patru ori mai mulți" },
      { caption: "stagii planificate" },
    ],
  },

  help: {
    SERVICES: [
      {
        title: "Găsește un T-Level lângă tine",
        text: "Caută după cod poștal și domeniu.",
        linkText: "Găsește un T-Level pe tlevels.gov.uk",
      },
      {
        title: "Consiliere în carieră gratuită",
        text: "Sună la 0800 100 900 sau folosește chatul online. Pentru oricine are 13 ani sau mai mult.",
        linkText: "National Careers Service",
      },
      {
        title: "Ajutor pentru transport și echipament",
        text: "Bursa 16 to 19 Bursary. Aplici prin școala sau colegiul tău.",
        linkText: "Ghidul 16 to 19 Bursary Fund",
      },
      {
        title: "Regulile stagiului",
        text: "Ghidul oficial despre ce trebuie să includă un stagiu.",
        linkText: "Ghidul stagiilor la angajator",
      },
    ],
    PROVIDER_QUESTIONS: [
      "Ce T-Levels și specializări aveți?",
      "Voi îmi găsiți stagiul sau eu?",
      "Ce angajatori v-au primit elevii?",
      "Stagiul este în bloc, o zi pe săptămână sau o combinație?",
      "Care sunt condițiile voastre de admitere?",
      "Ce sprijin există dacă am nevoi suplimentare?",
    ],
    SITE_ROUTES: [
      { label: "Ce este un T-Level?", detail: "Despre T-Levels" },
      { label: "Vreau să văd toate domeniile", detail: "Toate T-Levels" },
      { label: "Cum e un stagiu la Amazon?", detail: "T-Levels la Amazon" },
      { label: "Vreau ghiduri și pachete", detail: "Resurse T-Level" },
      { label: "Vreau să-mi înregistrez interesul", detail: "Înregistrează interesul" },
      { label: "Am deja un cont", detail: "Autentificare" },
    ],
  },

  interest: {
    NEXT_STEPS: [
      { text: "Ne spui parcursul tău. Durează cam un minut." },
      { text: "Echipa Amazon Emerging Talent poate vedea cine este interesat." },
      { text: "Stagiile se organizează cu școala sau colegiul tău, așa că echipa i-ar putea contacta." },
    ],
    WHY_WE_ASK:
      "Cerem doar ce are nevoie echipa Amazon Emerging Talent ca să știe că ești interesat. Fără adresă, dată de naștere sau școală.",
  },

  quiz: {
    KNOWLEDGE_QUESTIONS: [
      {
        question: "Cât durează un stagiu T-Level la un angajator?",
        options: ["Cel puțin 315 ore, cam 45 de zile", "Două săptămâni", "Un an întreg", "Nu există stagiu"],
        correctAnswer: "Cel puțin 315 ore, cam 45 de zile",
        explanation: "Cel puțin 315 ore, cam 45 de zile. Amazon organizează stagiile ca un bloc de nouă săptămâni.",
      },
      {
        question: "Cu câte A levels este comparabil, ca volum, un T-Level?",
        options: ["Unul", "Două", "Trei", "Cinci"],
        correctAnswer: "Trei",
        explanation: "Trei. Un T-Level aduce și puncte UCAS, deci drumul spre universitate rămâne deschis.",
      },
      {
        question: "Care este principala diferență dintre un T-Level și o ucenicie (apprenticeship)?",
        options: [
          "Un T-Level este mai ales studiu, o ucenicie este mai ales muncă plătită",
          "Sunt același lucru",
          "Un T-Level este mai ales muncă plătită, o ucenicie este mai ales studiu",
          "Doar ucenicia include timp la un angajator",
        ],
        correctAnswer: "Un T-Level este mai ales studiu, o ucenicie este mai ales muncă plătită",
        explanation:
          "E invers. Un T-Level înseamnă cam 80 la sută studiu, iar restul este un stagiu la un angajator de cel puțin 315 ore.",
      },
      {
        question: "Ce parcurs include T-Level-ul Digital Software Development?",
        options: ["Digital", "Afaceri", "Inginerie", "Media"],
        correctAnswer: "Digital",
        explanation: "Digital. Include și Digital Data Analytics și Digital Support and Security.",
      },
      {
        question: "Ce parcurs include T-Level-ul Management and Administration?",
        options: ["Afaceri", "Finanțe", "Media", "Digital"],
        correctAnswer: "Afaceri",
        explanation: "Afaceri. Descrierea lui pe site este: ții echipele și operațiunile în funcțiune.",
      },
      {
        question: "Cine are grijă de tine într-un stagiu la Amazon?",
        options: [
          "Un coleg de sprijin (buddy), un mentor și un coordonator de stagiu",
          "Nimeni, lucrezi singur",
          "Doar profesorul tău",
          "Un alt șef în fiecare zi",
        ],
        correctAnswer: "Un coleg de sprijin (buddy), un mentor și un coordonator de stagiu",
        explanation:
          "Fiecare elev are un coleg de sprijin (buddy), un mentor și un coordonator de stagiu, așa că există mereu cineva pe care să-l întrebi.",
      },
      {
        question: "Ai nevoie de un cont ca să folosești biblioteca de resurse T-SMILE?",
        options: [
          "Nu, dar unele resurse au nevoie de un cont gratuit ca să se deschidă",
          "Da, pentru orice",
          "Nu, totul este deschis tuturor",
          "Doar dacă ești profesor",
        ],
        correctAnswer: "Nu, totul este deschis tuturor",
        explanation:
          "Oricine poate naviga prin bibliotecă și poate deschide tot ce e în ea. Un cont gratuit e pentru a pune întrebări și a răspunde în Comunitate și pentru a-ți păstra setările.",
      },
    ],
  },
  legal: {
    TERMS: {
      label: "Informații legale",
      title: "Termenii serviciului",
      updated: "septembrie 2026",
      intro: "T-SMILE este un proiect al elevilor, făcut pentru programul Amazon Emerging Talent Digital T-Level. Nu este un site oficial Amazon.",
      sections: [
        {
          heading: "Folosirea site-ului",
          paragraphs: [
            "Oricine poate citi fiecare pagină, deschide orice resursă, face quiz-urile și vorbi cu Smiley fără cont. Un cont gratuit îți permite să pui întrebări și să răspunzi în Comunitate.",
            "Trebuie să ai cel puțin 16 ani ca să îți faci cont.",
          ],
        },
        {
          heading: "Contul tău",
          points: [
            "Nu spune nimănui parola ta.",
            "Dă date adevărate când îți faci cont sau îți înregistrezi interesul.",
            "Îți poți dezactiva contul oricând din Profil.",
          ],
        },
        {
          heading: "Fii amabil",
          points: [
            "Nu posta nimic nepoliticos, jignitor sau ilegal în formulare, în chat sau în Comunitate.",
            "Nu încerca să strici site-ul sau să ajungi la datele altor oameni.",
            "Putem dezactiva conturile care încalcă aceste reguli.",
          ],
        },
        {
          heading: "Informațiile noastre",
          paragraphs: [
            "Verificăm faptele pe gov.uk, UCAS și Amazon și ne listăm sursele pe fiecare pagină. Lucrurile se schimbă, așa că verifică mereu cu școala sau colegiul tău înainte să decizi.",
            "Smiley, asistentul, poate greși. Este un ajutor, nu un sfat.",
          ],
        },
        {
          heading: "Numele Amazon",
          paragraphs: [
            "„Amazon” și logoul său aparțin Amazon.com, Inc. sau afiliaților săi. Le folosim ca să descriem stagiile T-Level de la Amazon.",
          ],
        },
      ],
    },
    PRIVACY: {
      label: "Informații legale",
      title: "Politica de confidențialitate",
      updated: "septembrie 2026",
      intro: "T-SMILE este un proiect al elevilor, făcut pentru programul Amazon Emerging Talent Digital T-Level. Nu este un site oficial Amazon.",
      sections: [
        {
          heading: "Cine are grijă de datele tale",
          paragraphs: [
            "Echipa de elevi T-SMILE. Ne poți contacta prin pagina Contact.",
          ],
        },
        {
          heading: "Ce colectăm și de ce",
          points: [
            "Înregistrarea interesului: numele, emailul, dacă ești elev, părinte sau profesor, un parcurs și un mesaj opțional. Ca echipa Amazon Emerging Talent să vadă că ești interesat și să te contacteze.",
            "Un cont: un nume de utilizator, o parolă (stocată criptat, niciodată lizibilă), rolul și parcursul tău. Mai târziu, dacă le adaugi, numele, emailul și numărul de telefon. Ca să te poți autentifica, să pui întrebări și să răspunzi în Comunitate și să îți păstrezi setările pe orice dispozitiv.",
            "Setările de accesibilitate: mărimea textului, contrastul, tema și alte alegeri asemănătoare. Ca site-ul să arate cum l-ai setat.",
            "Chatul cu Smiley: ce scrii și răspunsurile lui Smiley. Ca Smiley să poată urmări conversația.",
            "Postările din Comunitate: întrebările și răspunsurile pe care le postezi, afișate cu numele tău de utilizator. Ca alți vizitatori să le poată citi și să răspundă.",
            "Păreri și mesaje de contact: mesajul tău și emailul, dacă îl dai. Ca să putem repara lucrurile și să îți răspundem.",
          ],
        },
        {
          heading: "Cine le vede",
          points: [
            "Echipa T-SMILE și, pentru formularele de interes, personalul Amazon Emerging Talent.",
            "Anthropic, compania a cărei inteligență artificială scrie răspunsurile lui Smiley. Mesajele tale din chat sunt trimise la ei ca să primești un răspuns.",
            "Compania care găzduiește site-ul (Railway pentru versiunea de test, Amazon Web Services mai târziu).",
            "Nimeni altcineva. Nu vindem date și nu le folosim pentru reclame.",
          ],
        },
        {
          heading: "Cât timp le păstrăm",
          paragraphs: [
            "Nu am stabilit încă și o vom face înainte de lansarea site-ului. Până atunci, cere-ne și îți ștergem datele.",
          ],
        },
        {
          heading: "Sub 18 ani",
          paragraphs: [
            "Mulți dintre vizitatorii noștri au sub 18 ani, așa că cerem doar ce ne trebuie. Nu cerem niciodată într-un formular adresa, data nașterii sau școala.",
          ],
        },
        {
          heading: "Drepturile tale",
          paragraphs: [
            "Îți poți vedea, corecta sau șterge datele și nu numai. Pagina despre drepturile asupra datelor explică cum.",
          ],
        },
      ],
    },
    COOKIES: {
      label: "Informații legale",
      title: "Politica privind cookie-urile",
      updated: "septembrie 2026",
      intro: "Folosim doar cookie-urile de care site-ul are nevoie ca să funcționeze. Fără urmărire, fără reclame, fără analize.",
      sections: [
        {
          heading: "Cookie-uri",
          points: [
            "sessionid: te ține autentificat și îl lasă pe Smiley să îți țină minte chatul. Durează două săptămâni sau până te deconectezi.",
            "csrftoken: împiedică alte site-uri să trimită formulare în numele tău. Durează până la un an.",
          ],
          paragraphs: [
            "Site-ul nu poate funcționa în siguranță fără ele, așa că legea nu ne cere un banner pentru cookie-uri.",
          ],
        },
        {
          heading: "Salvate în browserul tău",
          paragraphs: [
            "Acestea nu sunt cookie-uri și nu părăsesc niciodată dispozitivul tău.",
          ],
          points: [
            "Setările tale de accesibilitate, ca să rămână când revii.",
            "Dacă Smiley te-a salutat deja, până închizi fila.",
          ],
        },
        {
          heading: "Ștergerea lor",
          paragraphs: [
            "Poți șterge cookie-urile și datele salvate din setările browserului. Vei fi deconectat, iar setările tale vor reveni la normal.",
          ],
        },
      ],
    },
    DATA_RIGHTS: {
      label: "Informații legale",
      title: "GDPR și drepturile tale asupra datelor",
      updated: "septembrie 2026",
      intro: "Legea din Regatul Unit (UK GDPR) îți dă drepturi asupra datelor tale. Le poți folosi gratuit.",
      sections: [
        {
          heading: "Drepturile tale",
          points: [
            "Să le vezi: cere o copie a datelor pe care le avem despre tine.",
            "Să le corectezi: cere-ne să corectăm orice e greșit.",
            "Să le ștergi: cere-ne să îți ștergem datele.",
            "Să le limitezi: cere-ne să nu le mai folosim o vreme.",
            "Să le iei: cere-ți datele într-un fișier pe care îl poți folosi în altă parte.",
            "Să te opui: spune-ne să nu le mai folosim.",
          ],
        },
        {
          heading: "Cum ceri",
          paragraphs: [
            "Folosește formularul de contact și spune ce drept vrei să folosești. Te putem ruga să confirmi că ești tu. Îți răspundem în cel mult o lună.",
            "Îți poți corecta singur datele sau îți poți dezactiva contul din Profil.",
          ],
        },
        {
          heading: "Nu ești mulțumit?",
          paragraphs: [
            "Poți face o plângere la Information Commissioner's Office (ICO), care se ocupă de protecția datelor în Regatul Unit.",
          ],
          link: {
            text: "Fă o plângere la ICO",
          },
        },
      ],
    },
  },
};
