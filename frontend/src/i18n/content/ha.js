// Hausa words for the page copy (see ../content.js). Words only, in the same
// order as the English lists: icons, links, slugs and numbers come from the
// English files. null keeps the English, used for official qualification and
// grade names people will see on gov.uk and on their certificate. Needs a
// native speaker's review.

export default {
  about: {
    ROUTE_STEPS: [
      { title: "Zaɓi darasi", text: "Kusan 20 da za a zaɓa. Shekaru biyu, cikakken lokaci, a makaranta ko kwaleji." },
      { title: "Ku koye shi", text: "Awanni 1100 zuwa 1300 na darussa: tushen masana'antarku, sannan ƙwarewa ta musamman." },
      { title: "Ku yi aiki", text: "Aƙalla awanni 315 tare da mai ɗaukar aiki, kusan kwanaki 45. A nan ne Amazon yake shigowa." },
    ],
    TIME_SPLIT: [
      { label: "Karatu", detail: "kusan 80% na kwas ɗin" },
      { label: "Horon aiki", detail: "aƙalla awanni 315" },
    ],
    PLACEMENT_FACTS: [
      { title: "Ainihin aiki", text: "Ayyukan da mai ɗaukar aiki yake buƙatar a yi. Ba kallo kawai ba." },
      { title: "Jadawalinku", text: "Kwana ɗaya ko biyu a mako, makonni a jere, ko haɗin biyun." },
      { title: "Mai ɗaukar aiki ɗaya ko biyu", text: "Galibi ɗaya. Ba fiye da biyu ba sai da dalili mai kyau." },
      { title: "Biya ya bambanta", text: "Ba tabbas ba ne. Wasu masu ɗaukar aiki suna biya ko suna ɗaukar kuɗin sufuri. Ku fara tambaya." },
    ],
    GRADES: [
      null,
      null,
      null,
      { grade: "Pass, da C ko sama a babban ɓangare" },
      { grade: "Pass, da D ko E a babban ɓangare" },
    ],
    AUDIENCE_POINTS: [
      { text: "Shekarunku 16 zuwa 19 ne kuma kuna kammala GCSEs, ko kuna canza kwas." },
      { text: "Kun san kusan masana'antar da kuke son yin aiki a ciki." },
      { text: "Kun fi koyo ta hanyar aikatawa." },
      { text: "Kuna son shaidar karatu da masu ɗaukar aiki suka amince da ita, kuma hanyar jami'a ta kasance a buɗe." },
      { text: "Ba damuwa ku mai da hankali kan fanni ɗaya na shekaru biyu. Kuna son riƙe darussa da yawa? A levels na iya fi dacewa da ku." },
    ],
    BENEFITS: [
      { title: "Ainihin aiki", text: "Aƙalla awanni 315 a cikin ƙungiyar da take aiki." },
      { title: "Girmansa kamar A levels uku", text: "Yana ba da makin UCAS, don haka hanyar jami'a tana buɗe." },
      { title: "An gina shi tare da masu ɗaukar aiki", text: "Masu ɗaukar aiki sun taimaka wajen rubuta abin da kuke koyo." },
      { title: "Hanyoyi uku bayan haka", text: "Aikin ƙwararru, koyon sana'a mai girma, ko jami'a." },
    ],
    COST_POINTS: [
      { title: "Kwas ɗin kyauta ne", text: "Idan shekarunku 16 zuwa 18 ne kuma kuna karatu na cikakken lokaci." },
      { title: "Taimako da kuɗaɗe", text: "16 to 19 Bursary zai iya biyan sufuri, littattafai, kayan aiki da tufafi na musamman." },
      { title: "Har zuwa £1200 a shekara", text: "Don ɗaliban da ke ƙarƙashin kulawar hukuma, waɗanda suka bar kulawa da wasu ɗaliban da ke karɓar wasu tallafi." },
      { title: "Ku tambayi kwalejinku", text: "Kowa kuma zai iya neman tallafin da aka bayar bisa ra'ayi. Ba zai iya biyan haya ko kuɗaɗen lissafi ba." },
    ],
    PATHWAYS: [
      {
        name: "Fasahar zamani",
        summary: "Gina fasaha, gudanar da ita da tallafa mata.",
        placement: "Kuna zama tare da ƙungiyar fasaha kuna aiki kan ainihin ayyuka: rubuta da duba lambar kwamfuta, gwaji, gyara kurakurai, ko sa tsare-tsare da masu amfani su ci gaba da aiki.",
        suits: "Mutanen da suke son warware matsala su ga tana aiki nan take.",
        amazonStatus: "A nan ne shirin T-Level na Amazon ya fara.",
      },
      {
        name: "Kasuwanci",
        summary: "Sa ƙungiyoyi da ayyuka su tafi daidai.",
        placement: "Kuna tallafa wa gudanar da ƙungiya na yau da kullum: tsarawa, haɗa kai, sarrafa bayanai da rahotanni, da sa matakai su tafi daidai.",
        suits: "Mutane masu tsari waɗanda suke son abubuwa su tafi yadda ya kamata.",
        amazonStatus: "Amazon ya ambace shi a matsayin fannin da yake faɗaɗa zuwa gare shi.",
      },
      {
        name: "Kafofin yaɗa labarai",
        summary: "Tsara abun ciki, ƙirƙira shi kuma wallafa shi.",
        placement: "Kuna taimakawa wajen tsarawa da samar da abun ciki, daga ɗaukar hoto da gyara zuwa wallafawa, kuma kuna ganin yadda abu yake tafiya daga tunani zuwa masu kallo.",
        suits: "Mutanen da suke son ƙirƙirar abubuwan da wasu za su kalla ko karanta.",
        amazonStatus: "Amazon ya ambace shi a matsayin fannin fasahar ƙirƙira da yake faɗaɗa zuwa gare shi.",
      },
      {
        name: "Harkokin kuɗi",
        summary: "Aiki da alƙaluman da ke bayan yanke shawara.",
        tLevels: [null, "Finance, karɓar ɗalibai na ƙarshe a Satumba 2026"],
        placement: "Kuna aiki da ainihin alƙaluma: bibiyar kashe kuɗi, duba bayanai, da taimakawa wajen haɗa rahotannin da ƙungiya take yanke shawara da su.",
        suits: "Mutanen da suka saba da lambobi kuma suke gane abin da ba daidai ba.",
      },
      {
        name: "Injiniyanci",
        summary: "Ƙira, gini da kula da tsare-tsare.",
        placement: "Kuna aiki tare da injiniyoyi kan kayan aiki da tsare-tsare: kafawa, kulawa, gwaji da inganta yadda suke aiki.",
        suits: "Mutanen da suke son fahimtar yadda abu na zahiri yake aiki, sannan su sa ya fi aiki da kyau.",
        amazonStatus: "Amazon ya ambace shi a matsayin fannin da yake faɗaɗa zuwa gare shi.",
      },
    ],
    FAQS: [
      {
        question: "Shin T-Level ɗaya yake da koyon sana'a?",
        answer: "A'a, akasin haka ne. Koyon sana'a galibi aiki ne da ake biya tare da ɗan karatu. T-Level galibi karatu ne, kusan kashi 80 cikin ɗari, tare da horon aiki a masana'anta na aƙalla awanni 315 a matsayin sauran.",
      },
      {
        question: "Wadanne GCSEs nake buƙata?",
        answer: "Kowace makaranta ko kwaleji ce take tsara sharuɗɗan shiga, ba ƙasa baki ɗaya ba. Kusan GCSEs huɗu ko biyar a maki 4 ko sama, galibi har da Turanci da lissafi, abu ne da aka saba. Ku duba da cibiyar ilimin da kuke son zuwa.",
      },
      {
        question: "Wadanne darussan T-Level zan iya zaɓa?",
        answer: "Kusan 20, a fannoni da suka haɗa da fasahar zamani, injiniyanci, gine-gine, lafiya, kimiyya, shari'a da lissafin kuɗi, kafofin yaɗa labarai, tallace-tallace, noma, kula da dabbobi, ilimi, da sana'ar hannu da zane. Wasanni da kula da jin daɗin jama'a za su zo a Satumba 2028. T-Level na Finance yana karɓar ɗalibai na ƙarshe a Satumba 2026, don haka Accounting ne zai ci gaba.",
      },
      {
        question: "Yaya ake tantance ni?",
        answer: "Sassa biyu. Babban ɓangare ana ba shi maki daga A tauraro zuwa E kuma ya ƙunshi ilimin masana'antarku. Ƙwarewar sana'a ana ba ta pass, merit ko distinction kuma ita ce ɓangaren aikatawa. Dukansu suna bayyana a takardar shaidarku, tare da jimillar maki ɗaya. Babban ɓangare ya haɗa da aikin da mai ɗaukar aiki ya tsara (ESP), kuma ana yawan taƙaita ƙwarewar sana'a da OS.",
      },
      {
        question: "Zan iya zuwa jami'a har yanzu?",
        answer: "E. Distinction tauraro yana da makin UCAS 168, Distinction 144, Merit 120 kuma Pass 72 ko 96 gwargwadon makin babban ɓangarenku. Amma ba kowace jami'a ce ke amfani da makin UCAS ba, don haka ku duba sharuɗɗan shiga na kwas ɗin da kuke so.",
      },
      {
        question: "Idan ban ci komai ba fa?",
        answer: "Za ku sami takardar bayanin nasarar T-Level maimakon cikakkiyar takardar shaida. Tana lissafa sassan da kuka kammala, don haka aikin bai ɓata ba.",
      },
      {
        question: "Tsawon wane lokaci horon aiki a masana'anta yake?",
        answer: "Aƙalla awanni 315, kusan kwanaki 45. Zai iya zama kwana ɗaya ko biyu a mako, cikakken lokaci a jere, ko haɗin biyun. Amazon yana gudanar da horon aikinsa na makonni tara a jere. Ƙwarewar Early Years Educator tana buƙatar awanni 750 maimakon haka.",
      },
      {
        question: "Za a biya ni a lokacin horon aiki?",
        answer: "Babu dokar da ta tilasta a biya horon aiki. Wasu masu ɗaukar aiki suna biya, wasu suna ɗaukar kuɗin sufuri ko abinci, wasu kuma ba sa yin ko ɗaya. Ku tambayi cibiyar ilimin ku yadda tsarin yake kafin ku fara.",
      },
      {
        question: "Zan iya samun taimako da sufuri ko kayan aiki?",
        answer: "E, ta hanyar 16 to 19 Bursary Fund. Zai iya biyan sufuri, littattafai, kayan aiki da tufafi na musamman. Ku nema ta makarantarku ko kwalejinku.",
      },
      {
        question: "Idan ban shirya don T-Level ba tukuna fa?",
        answer: "Akwai T-Level Foundation Year, kwas na shekara ɗaya a mataki na 2 wanda yake ƙarfafa Turancinku, lissafi, ƙwarewar fasahar zamani da ƙwarewar aiki da farko, sannan ya kai ku zuwa T-Level.",
      },
      {
        question: "Zan iya yin wasu shaidar karatu tare da shi?",
        answer: "T-Level shiri ne na cikakken lokaci mai girma kusan kamar A levels uku, don haka ba a cika haɗa shi da wasu abubuwa da yawa ba. Wasu cibiyoyin ilimi suna ba da damar ƙarin shaidar karatu ɗaya. Ku tambayi taku.",
      },
    ],
    QUIZ_QUESTIONS: [
      {
        question: "Yaya kuka fi koyo?",
        options: [
          { label: "Ta hanyar aikata abin, sannan in tambayi dalili" },
          { label: "Kaɗan daga duka biyun" },
          { label: "Ta hanyar karantawa, rubutawa da maimaitawa" },
        ],
      },
      {
        question: "Kun san irin aikin da kuke so?",
        options: [
          { label: "Ina da kyakkyawar fahimtar masana'antar" },
          { label: "Fanni gaba ɗaya, ba takamaiman aiki ba" },
          { label: "Ban sani ba tukuna" },
        ],
      },
      {
        question: "Me kuke tunani game da kwanaki 45 a ainihin wurin aiki?",
        options: [
          { label: "Wannan ne ɓangaren da nake so" },
          { label: "Ina ɗan tsoro, amma a shirye nake" },
          { label: "Na fi son in zauna a aji" },
        ],
      },
      {
        question: "Wace hanyar tantancewa ta dace da ku?",
        options: [
          { label: "Jarrabawa tare da ƙwarewar aikatawa da ake ba maki" },
          { label: "Ba damuwa ko wace" },
          { label: "Jarrabawar rubutu kawai" },
        ],
      },
      {
        question: "Me kuke son yi bayan kwas ɗin?",
        options: [
          { label: "Aikin ƙwararru ko koyon sana'a na digiri" },
          { label: "In riƙe aiki da jami'a duka a buɗe" },
          { label: "Digiri a wani abu da bai shafi wannan fanni ba" },
        ],
      },
      {
        question: "Kun shirya ku sadaukar da kanku ga fanni ɗaya na shekaru biyu?",
        options: [
          { label: "E" },
          { label: "Ina tsammanin haka" },
          { label: "Ina son in riƙe zaɓuɓɓuka da yawa" },
        ],
      },
    ],
    QUIZ_RESULTS: [
      {
        heading: "T-Level yana kama da ya dace da ku sosai",
        text: "Kuna son koyo ta hanyar aikatawa, lokaci a ainihin wurin aiki da hanya madaidaiciya zuwa masana'anta. Wannan shi ne ainihin abin da aka gina T-Level don shi. Mataki na gaba: ku duba wanne daga cikin fannoni biyar ya dace da ku, sannan ku nuna sha'awarku ga Amazon.",
      },
      {
        heading: "Ya cancanci a duba sosai",
        text: "Wasu daga cikin wannan sun dace da ku, wasu kuma har yanzu a buɗe suke, wanda abu ne na al'ada a wannan mataki. Ku karanta fannonin da tambayoyin da ke ƙasa, kuma ku tattauna da malami ko mai ba da shawarar sana'a kafin ku yanke shawara.",
      },
      {
        heading: "Wata hanya na iya fi dacewa da ku",
        text: "Daga amsoshinku, kun fi karkata zuwa koyo a aji da riƙe darussa da yawa a buɗe, abin da A levels suke yi da kyau. Wannan amsa ce mai kyau. Idan horon aikin ne ya burge ku, har yanzu ya dace ku karanta fannonin da ke ƙasa.",
      },
    ],
  },
  amazon: {
    PLACEMENT_SHAPE: [
      { title: "Makonni tara", text: "Kuna shiga ƙungiya, ku koyi kayan aiki kuma ku yi ainihin aiki." },
      { title: "Cibiyoyin ƙwarewa", text: "Wani ɓangare yana gudana a cibiyoyin ƙwarewa na Amazon, a jere na kwanaki 15." },
      { title: "Ayyukan rukuni", text: "Ku yi aiki tare da wasu ɗalibai kan ayyuka don ƙungiyoyin agaji." },
      { title: "Ƙalubalen ƙungiya", text: "Ayyukan da ƙungiyarku ta tsara waɗanda suke amfani da ƙwarewarku ta T-Level." },
    ],
    SUPPORT: [
      { title: "Abokin aiki", text: "Don ƙananan tambayoyi." },
      { title: "Mai ba da jagora", text: "Yana jagorantar aikinku kuma yana nuna muku babban hoto." },
      { title: "Manajan horon aiki", text: "Yana sa horon aikin ya tafi daidai tare da makarantarku ko kwalejinku." },
    ],
    ROUTE_IN: [
      { title: "Fara T-Level", text: "Don matasa masu shekaru 16 zuwa 18 da suke kan kwas ɗin T-Level tuni." },
      { title: "Kwalejinku ta tuntuɓe su", text: "Amazon yana shirya horon aiki tare da makarantu da kwalejoji, ba kai tsaye da ɗalibai ba." },
      { title: "Nuna sha'awarku", text: "Ku faɗa mana fanninku kuma za mu isar da shi ga Amazon. Wannan ba neman aiki ba ne." },
    ],
    GROWTH: [
      { caption: "ɗalibai a shekarar farko" },
      { caption: "ɗalibai, ninki huɗu" },
      { caption: "wuraren horon aiki da aka tsara" },
    ],
  },
  help: {
    SERVICES: [
      { title: "Nemo T-Level kusa da ku", text: "Nema ta lambar gidan waya da darasi.", linkText: "Nemo T-Level a tlevels.gov.uk" },
      { title: "Shawarar sana'a kyauta", text: "Ku kira 0800 100 900 ko ku yi amfani da hira ta intanet. Don kowa mai shekaru 13 zuwa sama.", linkText: "National Careers Service" },
      { title: "Taimako da sufuri da kayan aiki", text: "16 to 19 Bursary. Ku nema ta makarantarku ko kwalejinku.", linkText: "Jagorar 16 to 19 Bursary Fund" },
      { title: "Dokokin horon aiki", text: "Jagorar hukuma kan abin da horon aiki dole ya ƙunsa.", linkText: "Jagorar horon aiki a masana'anta" },
    ],
    PROVIDER_QUESTIONS: [
      "Wadanne T-Levels da ƙwarewa kuke bayarwa?",
      "Ku ne za ku nemo min horon aiki, ko ni ne?",
      "Wadanne masu ɗaukar aiki ne suka ɗauki ɗalibanku?",
      "Horon aikin a jere yake, kwana ɗaya a mako, ko haɗin biyun?",
      "Menene sharuɗɗan shigarku?",
      "Wane tallafi ake da shi idan ina da buƙatu na musamman?",
    ],
    SITE_ROUTES: [
      { label: "Menene T-Level?", detail: "Game da T-Levels" },
      { label: "Ina son ganin kowane darasi", detail: "Dukkan T-Levels" },
      { label: "Yaya horon aiki a Amazon yake?", detail: "T-Levels a Amazon" },
      { label: "Ina son jagorori da fakiti", detail: "Kayan karatun T-Level" },
      { label: "Ina son nuna sha'awata", detail: "Nuna sha'awa" },
      { label: "Ina da asusu tuni", detail: "Shiga" },
    ],
  },
  interest: {
    NEXT_STEPS: [
      { text: "Kuna yin alama a akwati ɗaya. Yana ɗaukar ɗan lokaci kaɗan." },
      { text: "Ƙungiyar Amazon Emerging Talent za ta iya ganin wanda yake da sha'awa." },
      { text: "Ana shirya horon aiki tare da makarantarku ko kwalejinku, don haka za su iya tuntuɓar su." },
    ],
    WHY_WE_ASK: "Muna aika abin da ƙungiyar Amazon Emerging Talent take buƙata ne kawai don sanin kuna da sha'awa: suna, imel da fannin da suke cikin asusunku tuni. Babu adireshi, ranar haihuwa ko makaranta.",
  },
  quiz: {
    KNOWLEDGE_QUESTIONS: [
      {
        question: "Tsawon wane lokaci horon aiki a masana'anta na T-Level yake?",
        options: ["Aƙalla awanni 315, kusan kwanaki 45", "Makonni biyu", "Shekara guda cikakke", "Babu shi"],
        correctAnswer: "Aƙalla awanni 315, kusan kwanaki 45",
        explanation: "Aƙalla awanni 315, kusan kwanaki 45. Amazon yana gudanar da horon aikinsa na makonni tara a jere.",
      },
      {
        question: "T-Level ya kai girman A levels nawa?",
        options: ["Ɗaya", "Biyu", "Uku", "Biyar"],
        correctAnswer: "Uku",
        explanation: "Uku. T-Level yana ba da makin UCAS ma, don haka hanyar jami'a tana buɗe a gare ku.",
      },
      {
        question: "Menene babban bambanci tsakanin T-Level da koyon sana'a?",
        options: [
          "T-Level galibi karatu ne, koyon sana'a galibi aiki ne da ake biya",
          "Abu ɗaya ne",
          "T-Level galibi aiki ne da ake biya, koyon sana'a galibi karatu ne",
          "Koyon sana'a ne kawai yake da lokaci tare da mai ɗaukar aiki",
        ],
        correctAnswer: "T-Level galibi karatu ne, koyon sana'a galibi aiki ne da ake biya",
        explanation: "Akasin haka ne. T-Level kusan kashi 80 cikin ɗari karatu ne, tare da horon aiki a masana'anta na aƙalla awanni 315 a matsayin sauran.",
      },
      {
        question: "Wane fanni ne ya ƙunshi T-Level na Digital Software Development?",
        options: ["Fasahar zamani", "Kasuwanci", "Injiniyanci", "Kafofin yaɗa labarai"],
        correctAnswer: "Fasahar zamani",
        explanation: "Fasahar zamani. Ya kuma ƙunshi Digital Data Analytics da Digital Support and Security.",
      },
      {
        question: "Wane fanni ne ya ƙunshi T-Level na Management and Administration?",
        options: ["Kasuwanci", "Harkokin kuɗi", "Kafofin yaɗa labarai", "Fasahar zamani"],
        correctAnswer: "Kasuwanci",
        explanation: "Kasuwanci. Taƙaitaccen bayaninsa a shafin shi ne sa ƙungiyoyi da ayyuka su tafi daidai.",
      },
      {
        question: "Wa yake kula da ku a horon aiki a Amazon?",
        options: [
          "Abokin aiki, mai ba da jagora da manajan horon aiki",
          "Babu kowa, kuna aiki ku kaɗai",
          "Malaminku kawai",
          "Manaja daban kowace rana",
        ],
        correctAnswer: "Abokin aiki, mai ba da jagora da manajan horon aiki",
        explanation: "Kowane ɗalibi yana samun abokin aiki, mai ba da jagora da manajan horon aiki, don haka koyaushe akwai wanda za a tambaya.",
      },
      {
        question: "Kuna buƙatar asusu don amfani da ɗakin kayan karatu na T-SMILE?",
        options: [
          "A'a, amma wasu kayan karatu suna buƙatar asusu na kyauta don buɗewa",
          "E, don komai",
          "A'a, komai a buɗe yake ga kowa",
          "Sai dai idan ku malami ne",
        ],
        correctAnswer: "A'a, komai a buɗe yake ga kowa",
        explanation: "Kowa zai iya duba ɗakin kuma ya buɗe komai da ke ciki. Asusu na kyauta don tambaya da amsawa a cikin al'umma ne, da adana saitunanku.",
      },
    ],
  },
  legal: {
    TERMS: {
      label: "Doka",
      title: "Sharuɗɗan amfani",
      updated: "Satumba 2026",
      intro: "T-SMILE aikin ɗalibai ne, wanda aka yi don shirin Digital T-Level na Amazon Emerging Talent. Ba shafin Amazon na hukuma ba ne.",
      sections: [
        {
          heading: "Amfani da shafin",
          paragraphs: [
            "Kowa zai iya karanta kowane shafi, buɗe kowane kayan karatu, yin gwaje-gwajen da magana da Smiley ba tare da asusu ba. Asusu na kyauta yana ba ku damar tambaya da amsawa a cikin al'umma.",
            "Dole ne shekarunku su kai 16 ko sama don ƙirƙirar asusu.",
          ],
        },
        {
          heading: "Asusunku",
          points: [
            "Ku riƙe kalmar sirrinku a wurinku.",
            "Ku ba da bayanai na gaskiya lokacin da kuke yin rajista ko nuna sha'awa.",
            "Za ku iya kashe asusunku a kowane lokaci daga Bayanan kanku.",
          ],
        },
        {
          heading: "Ku kasance masu kirki",
          points: [
            "Kada ku wallafa wani abu na rashin ladabi, mai cutarwa ko wanda ya saɓa wa doka a cikin fom, hira ko al'umma.",
            "Kada ku yi ƙoƙarin lalata shafin ko samun bayanan wasu mutane.",
            "Za mu iya kashe asusun da suka karya waɗannan dokoki.",
          ],
        },
        {
          heading: "Bayananmu",
          paragraphs: [
            "Muna duba gaskiya da gov.uk, UCAS da Amazon, kuma muna lissafa majiyoyinmu a kowane shafi. Abubuwa suna canzawa, don haka koyaushe ku duba da makarantarku ko kwalejinku kafin ku yanke shawara.",
            "Smiley, mataimakin, zai iya yin kuskure. Mataimaki ne, ba shawara ba.",
          ],
        },
        {
          heading: "Sunan Amazon",
          paragraphs: [
            "“Amazon” da tambarinsa mallakar Amazon.com, Inc. ne ko kamfanoninsa masu alaƙa. Muna amfani da su don bayyana horon aiki na T-Level a Amazon.",
          ],
        },
      ],
    },
    PRIVACY: {
      label: "Doka",
      title: "Manufar sirri",
      updated: "Satumba 2026",
      intro: "T-SMILE aikin ɗalibai ne, wanda aka yi don shirin Digital T-Level na Amazon Emerging Talent. Ba shafin Amazon na hukuma ba ne.",
      sections: [
        {
          heading: "Wa yake kula da bayananku",
          paragraphs: ["Ƙungiyar ɗaliban T-SMILE. Za ku iya tuntuɓar mu ta shafin Tuntuɓe mu."],
        },
        {
          heading: "Abin da muke tattarawa, da dalili",
          points: [
            "Nuna sha'awa: sunanku, imel, ko ku ɗalibi ne, mahaifi ko malami, fanni da saƙo na zaɓi. Don ƙungiyar Amazon Emerging Talent ta ga kuna da sha'awa kuma ta tuntuɓe ku.",
            "Asusu: sunan mai amfani, kalmar sirri (an adana ta a ɓoye, ba za a iya karanta ta ba), matsayinku da fanninku. Daga baya, idan kun ƙara su, sunanku, imel da lambar waya. Don ku iya shiga, tambaya da amsawa a cikin al'umma, da adana saitunanku a kowace na'ura.",
            "Saitunan sauƙin amfani: girman rubutu, bambancin launi, jigo da zaɓuɓɓuka makamantan haka. Don shafin ya bayyana yadda kuka saita shi.",
            "Hira da Smiley: tambayoyin da Smiley yake buƙatar dubawa, da amsoshinsa. Don Smiley ya bi tattaunawar. Tambayoyin da yake amsawa da kansa suna zama a burauzarku.",
            "Rubuce-rubucen al'umma: tambayoyi da amsoshin da kuke wallafawa, tare da sunan mai amfaninku. Don sauran baƙi su karanta su kuma su amsa.",
            "Ra'ayi da saƙonnin tuntuɓa: saƙonku, da imel ɗinku idan kun ba da shi. Don mu gyara abubuwa kuma mu amsa.",
          ],
        },
        {
          heading: "Wa yake gani",
          points: [
            "Ƙungiyar T-SMILE, da ma'aikatan Amazon Emerging Talent don fom na sha'awa.",
            "Anthropic, kamfanin da AI ɗinsa yake rubuta wasu amsoshin Smiley. Ana aika musu tambayoyin da Smiley ba zai iya amsawa da kansa ba don a sami amsa.",
            "Kamfanin da yake ɗaukar nauyin shafin (Railway don samfoti, Amazon Web Services daga baya).",
            "Babu wani kuma. Ba ma sayar da bayanai ko amfani da su don talla.",
          ],
        },
        {
          heading: "Tsawon lokacin da muke riƙe su",
          paragraphs: [
            "Saƙonnin hira da Smiley: kwanaki 90.",
            "Fom na sha'awa da ra'ayi: watanni 12.",
            "Asusunku da rubuce-rubucen al'umma: har sai kun goge su.",
            "Za ku iya neman mu goge komai kafin lokacin.",
          ],
        },
        {
          heading: "Ƙasa da 18",
          paragraphs: [
            "Yawancin baƙinmu ba su kai shekaru 18 ba, don haka abin da muke buƙata ne kawai muke nema. Ba ma taɓa tambayar adireshinku, ranar haihuwa ko makaranta a cikin fom.",
          ],
        },
        {
          heading: "Haƙƙoƙinku",
          paragraphs: ["Za ku iya gani, gyara ko goge bayananku, da ƙari. Shafin Haƙƙoƙin bayanai yana bayyana yadda."],
        },
      ],
    },
    COOKIES: {
      label: "Doka",
      title: "Manufar kukis",
      updated: "Satumba 2026",
      intro: "Muna amfani ne kawai da kukis ɗin da shafin yake buƙata don ya yi aiki. Babu bibiya, babu talla, babu nazarin ƙididdiga.",
      sections: [
        {
          heading: "Kukis",
          points: [
            "sessionid: yana riƙe ku a cikin shafin, kuma yana ba Smiley damar tuna hirarku. Yana ɗaukar makonni biyu, ko har sai kun fita.",
            "csrftoken: yana hana wasu shafukan intanet aika fom a madadinku. Yana ɗaukar har zuwa shekara ɗaya.",
          ],
          paragraphs: ["Shafin ba zai iya aiki lafiya ba tare da waɗannan ba, don haka doka ba ta buƙatar mu sa tutar kukis."],
        },
        {
          heading: "An adana a burauzarku",
          paragraphs: ["Waɗannan ba kukis ba ne, kuma ba sa taɓa barin na'urarku."],
          points: [
            "Saitunan sauƙin amfani da harshen da kuka zaɓa, don su zauna idan kun dawo.",
            "Ko Smiley ya gaishe ku, da ko ku wane ne kuka faɗa masa, har sai kun rufe shafin.",
            "Ko kun rufe sanarwar kukis.",
          ],
        },
        {
          heading: "Share su",
          paragraphs: [
            "Za ku iya goge kukis da bayanan da aka adana a cikin saitunan burauzarku. Za a fitar da ku, kuma saitunanku za su koma na al'ada.",
          ],
        },
      ],
    },
    DATA_RIGHTS: {
      label: "Doka",
      title: "GDPR da haƙƙoƙin bayananku",
      updated: "Satumba 2026",
      intro: "Dokar UK (UK GDPR) tana ba ku haƙƙoƙi kan bayananku. Amfani da su kyauta ne.",
      sections: [
        {
          heading: "Haƙƙoƙinku",
          points: [
            "Gani: ku nemi kwafin bayanan da muke riƙe da su game da ku.",
            "Gyara: ku nemi mu gyara duk abin da ba daidai ba.",
            "Gogewa: ku nemi mu cire bayananku.",
            "Takaitawa: ku nemi mu daina amfani da su na ɗan lokaci.",
            "Ɗauka: ku nemi bayananku a cikin fayil da za ku iya amfani da shi a wani wuri.",
            "Ƙin yarda: ku faɗa mana mu daina amfani da su.",
          ],
        },
        {
          heading: "Yadda ake nema",
          paragraphs: [
            "Ku yi amfani da fom ɗin Tuntuɓe mu kuma ku faɗi haƙƙin da kuke son amfani da shi. Za mu iya tambayar ku ku tabbatar cewa ku ne. Za mu amsa cikin wata ɗaya.",
            "Hakanan za ku iya gyara bayananku, ko kashe asusunku, da kanku daga Bayanan kanku.",
          ],
        },
        {
          heading: "Ba ku gamsu ba?",
          paragraphs: [
            "Za ku iya kai ƙara ga Information Commissioner's Office (ICO), wanda yake kula da kariyar bayanai a UK.",
          ],
          link: { text: "Kai ƙara ga ICO" },
        },
      ],
    },
  },
};
