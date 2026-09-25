// Polish words for the page copy (see ../content.js). Words only, in the same
// order as the English lists: icons, links, slugs and numbers come from the
// English files. null keeps the English, used for official qualification and
// grade names people will see on gov.uk and on their certificate.

export default {
  about: {
    ROUTE_STEPS: [
      { title: "Wybierz kierunek", text: "Około 20 do wyboru. Dwa lata, w pełnym wymiarze, w szkole lub college'u." },
      { title: "Ucz się", text: "Od 1100 do 1300 godzin lekcji: najpierw podstawy branży, potem specjalizacja." },
      { title: "Pracuj", text: "Co najmniej 315 godzin u pracodawcy, czyli około 45 dni. Tu pojawia się Amazon." },
    ],
    TIME_SPLIT: [
      { label: "Nauka", detail: "około 80% kursu" },
      { label: "Praktyki", detail: "co najmniej 315 godzin" },
    ],
    PLACEMENT_FACTS: [
      { title: "Prawdziwa praca", text: "Zadania, których pracodawca naprawdę potrzebuje. Nie tylko obserwowanie." },
      { title: "Twój grafik", text: "Dzień lub dwa w tygodniu, kilka tygodni z rzędu albo połączenie obu." },
      { title: "Jeden lub dwóch pracodawców", text: "Zwykle jeden. Nie więcej niż dwóch bez ważnego powodu." },
      { title: "Wynagrodzenie bywa różne", text: "Nie jest gwarantowane. Niektórzy pracodawcy płacą lub pokrywają dojazdy. Zapytaj wcześniej." },
    ],
    GRADES: [
      null,
      null,
      null,
      { grade: "Pass, z oceną C lub wyższą z części głównej (core)" },
      { grade: "Pass, z oceną D lub E z części głównej (core)" },
    ],
    AUDIENCE_POINTS: [
      { text: "Masz od 16 do 19 lat i kończysz GCSE albo zmieniasz kierunek." },
      { text: "Wiesz mniej więcej, w jakiej branży chcesz pracować." },
      { text: "Najlepiej uczysz się w praktyce." },
      { text: "Chcesz kwalifikacji, której ufają pracodawcy, i otwartej drogi na studia." },
      {
        text: "Nie przeszkadza ci skupienie się na jednej dziedzinie przez dwa lata. Wolisz mieć wiele przedmiotów? Wtedy A levels mogą pasować lepiej.",
      },
    ],
    BENEFITS: [
      { title: "Prawdziwa praca", text: "Co najmniej 315 godzin w zespole, który naprawdę pracuje." },
      { title: "Tyle co trzy A levels", text: "Daje punkty UCAS, więc droga na studia zostaje otwarta." },
      { title: "Tworzony z pracodawcami", text: "Pracodawcy pomogli ustalić, czego się uczysz." },
      { title: "Trzy drogi dalej", text: "Wykwalifikowana praca, wyższy poziom apprenticeship albo studia." },
    ],
    COST_POINTS: [
      { title: "Kurs jest bezpłatny", text: "Jeśli masz od 16 do 18 lat i uczysz się w pełnym wymiarze." },
      {
        title: "Pomoc w kosztach",
        text: "Stypendium 16 to 19 Bursary może pokryć dojazdy, książki, sprzęt i specjalistyczną odzież.",
      },
      {
        title: "Do £1200 rocznie",
        text: "Dla uczniów w pieczy zastępczej, osób, które ją opuściły, i niektórych uczniów pobierających określone świadczenia.",
      },
      {
        title: "Zapytaj w college'u",
        text: "Każdy inny może poprosić o stypendium uznaniowe. Nie pokrywa czynszu ani rachunków.",
      },
    ],
    PATHWAYS: [
      {
        name: "Cyfrowa",
        summary: "Tworzenie, obsługa i wsparcie technologii.",
        placement:
          "Pracujesz z zespołem technicznym przy prawdziwych zadaniach: piszesz i sprawdzasz kod, testujesz, naprawiasz błędy albo dbasz o działanie systemów i wsparcie użytkowników.",
        suits: "Dla osób, które lubią rozwiązać problem i od razu zobaczyć efekt.",
        amazonStatus: "Od tej ścieżki zaczął się program T-Level w Amazon.",
      },
      {
        name: "Biznes",
        summary: "Dbanie o sprawne działanie zespołów i firmy.",
        placement:
          "Wspierasz codzienną pracę zespołu: planowanie, koordynację, pracę z danymi i raportami oraz pilnowanie procesów.",
        suits: "Dla osób zorganizowanych, które lubią, gdy wszystko działa jak należy.",
        amazonStatus: "Amazon wymienił ją jako ścieżkę, w którą się rozwija.",
      },
      {
        name: "Media",
        summary: "Planowanie, tworzenie i publikowanie treści.",
        placement:
          "Pomagasz planować i tworzyć treści, od filmowania i montażu po publikację, i widzisz, jak materiał przechodzi od pomysłu do odbiorców.",
        suits: "Dla osób, które chcą tworzyć rzeczy, które inni obejrzą lub przeczytają.",
        amazonStatus: "Amazon wymienił ją jako kreatywną ścieżkę, w którą się rozwija.",
      },
      {
        name: "Finanse",
        summary: "Praca z liczbami, na podstawie których zapadają decyzje.",
        tLevels: [null, "Finance, ostatni nabór we wrześniu 2026"],
        placement:
          "Pracujesz na prawdziwych danych: śledzisz wydatki, sprawdzasz dokumenty i pomagasz przygotować raporty, na podstawie których zespół podejmuje decyzje.",
        suits: "Dla osób, które dobrze czują się z liczbami i wyłapują, co się nie zgadza.",
      },
      {
        name: "Inżynieria",
        summary: "Projektowanie, budowa i utrzymanie systemów.",
        placement:
          "Pracujesz z inżynierami przy urządzeniach i systemach: instalujesz, konserwujesz, testujesz i ulepszasz ich działanie.",
        suits: "Dla osób, które chcą zrozumieć, jak działa fizyczna rzecz, a potem sprawić, by działała lepiej.",
        amazonStatus: "Amazon wymienił ją jako ścieżkę, w którą się rozwija.",
      },
    ],
    FAQS: [
      {
        question: "Czy T-Level to to samo co apprenticeship (nauka zawodu)?",
        answer:
          "Nie, to odwrotnie. Apprenticeship to głównie płatna praca z odrobiną nauki. T-Level to głównie nauka, około 80 procent, a resztę stanowią praktyki u pracodawcy trwające co najmniej 315 godzin.",
      },
      {
        question: "Jakich GCSE potrzebuję?",
        answer:
          "Wymagania wstępne ustala każda szkoła lub college, a nie przepisy krajowe. Często wymaga się czterech lub pięciu GCSE z oceną 4 lub wyższą, zwykle w tym angielskiego i matematyki. Sprawdź w placówce, do której chcesz iść.",
      },
      {
        question: "Spośród jakich T-Levels mogę wybierać?",
        answer:
          "Około 20, w dziedzinach takich jak technologie cyfrowe, inżynieria, budownictwo, zdrowie, nauki ścisłe, prawo i księgowość, media, marketing, rolnictwo, opieka nad zwierzętami, edukacja oraz rzemiosło i design. Sport i Social Care pojawią się we wrześniu 2028. Na T-Level Finance ostatni nabór jest we wrześniu 2026, więc kontynuowany jest Accounting.",
      },
      {
        question: "Jak jestem oceniany?",
        answer:
          "W dwóch częściach. Część główna (core) jest oceniana od A z gwiazdką do E i obejmuje wiedzę o twojej branży. Specjalizacja zawodowa (occupational specialism) jest oceniana jako pass, merit lub distinction i jest częścią praktyczną. Obie znajdą się na świadectwie, razem z jedną oceną końcową.",
      },
      {
        question: "Czy nadal mogę iść na studia?",
        answer:
          "Tak. Distinction z gwiazdką jest warte 168 punktów UCAS, Distinction 144, Merit 120, a Pass 72 lub 96, zależnie od oceny z części głównej. Nie każda uczelnia korzysta jednak z punktów UCAS, więc sprawdź wymagania kierunku, który cię interesuje.",
      },
      {
        question: "Co, jeśli nie zaliczę wszystkiego?",
        answer:
          "Zamiast pełnego świadectwa dostajesz zaświadczenie o osiągnięciach T-Level (statement of achievement). Wymienia części, które ukończyłeś, więc twoja praca nie przepada.",
      },
      {
        question: "Ile trwają praktyki u pracodawcy?",
        answer:
          "Co najmniej 315 godzin, czyli około 45 dni. Mogą to być jeden lub dwa dni w tygodniu, blok w pełnym wymiarze albo połączenie obu. Amazon prowadzi praktyki jako dziewięciotygodniowy blok. Specjalizacja Early Years Educator wymaga zamiast tego 750 godzin.",
      },
      {
        question: "Czy praktyki są płatne?",
        answer:
          "Prawo nie wymaga, żeby praktyki były płatne. Niektórzy pracodawcy płacą, inni pokrywają dojazdy lub posiłki, a jeszcze inni nie robią żadnej z tych rzeczy. Zanim zaczniesz, zapytaj w swojej szkole, jak to wygląda.",
      },
      {
        question: "Czy mogę dostać pomoc na dojazdy lub sprzęt?",
        answer:
          "Tak, z 16 to 19 Bursary Fund. Może pokryć dojazdy, książki, sprzęt i specjalistyczną odzież. Wniosek składa się przez szkołę lub college.",
      },
      {
        question: "Co, jeśli nie jestem jeszcze gotowy na T-Level?",
        answer:
          "Istnieje T-Level Foundation Year, roczny kurs na poziomie 2, który najpierw wzmacnia angielski, matematykę, umiejętności cyfrowe i doświadczenie zawodowe, a potem prowadzi do T-Level.",
      },
      {
        question: "Czy mogę robić inne kwalifikacje równolegle?",
        answer:
          "T-Level to program w pełnym wymiarze, mniej więcej wielkości trzech A levels, więc zwykle nie łączy się go z wieloma innymi. Niektóre placówki pozwalają na jedną dodatkową kwalifikację. Zapytaj u siebie.",
      },
    ],
    QUIZ_QUESTIONS: [
      {
        question: "Jak najlepiej się uczysz?",
        options: [
          { label: "Robiąc coś, a potem pytając dlaczego" },
          { label: "Trochę tak, trochę tak" },
          { label: "Czytając, robiąc notatki i powtarzając" },
        ],
      },
      {
        question: "Czy wiesz, jaką pracę chcesz wykonywać?",
        options: [
          { label: "Mam dość dobre pojęcie o branży" },
          { label: "Ogólną dziedzinę, ale nie zawód" },
          { label: "Jeszcze nie mam pojęcia" },
        ],
      },
      {
        question: "Co myślisz o 45 dniach w prawdziwym miejscu pracy?",
        options: [
          { label: "Właśnie na tym mi zależy" },
          { label: "Trochę się stresuję, ale chętnie" },
          { label: "Wolałbym zostać w klasie" },
        ],
      },
      {
        question: "Jaki sposób oceniania ci odpowiada?",
        options: [
          { label: "Egzaminy plus oceniana praktyczna specjalizacja" },
          { label: "Jest mi wszystko jedno" },
          { label: "Tylko egzaminy pisemne" },
        ],
      },
      {
        question: "Co chcesz robić po kursie?",
        options: [
          { label: "Wykwalifikowana praca albo degree apprenticeship" },
          { label: "Zostawić otwartą zarówno pracę, jak i studia" },
          { label: "Studia z czegoś niezwiązanego z tą dziedziną" },
        ],
      },
      {
        question: "Czy jesteś gotowy poświęcić dwa lata jednej dziedzinie?",
        options: [{ label: "Tak" }, { label: "Chyba tak" }, { label: "Chcę mieć szeroki wybór" }],
      },
    ],
    QUIZ_RESULTS: [
      {
        heading: "T-Level wygląda na bardzo dobry wybór",
        text: "Chcesz uczyć się w praktyce, spędzać czas w prawdziwym miejscu pracy i mieć jasną drogę do branży. Właśnie do tego stworzono T-Level. Następny krok: sprawdź, która z pięciu ścieżek ci pasuje, a potem zgłoś zainteresowanie w Amazon.",
      },
      {
        heading: "Warto się temu przyjrzeć",
        text: "Część z tego ci pasuje, a część jest jeszcze otwarta, co na tym etapie jest normalne. Przeczytaj o ścieżkach i pytaniach poniżej i porozmawiaj z nauczycielem lub doradcą zawodowym, zanim zdecydujesz.",
      },
      {
        heading: "Inna droga może pasować lepiej",
        text: "Z twoich odpowiedzi wynika, że wolisz naukę w klasie i kilka otwartych przedmiotów, w czym dobrze sprawdzają się A levels. To w pełni dobra odpowiedź. Jeśli najbardziej ciągnie cię do praktyk, i tak warto przeczytać o ścieżkach poniżej.",
      },
    ],
  },

  amazon: {
    PLACEMENT_SHAPE: [
      { title: "Dziewięć tygodni", text: "Dołączasz do zespołu, uczysz się narzędzi i wykonujesz prawdziwą pracę." },
      { title: "Centra umiejętności", text: "Część odbywa się w centrach umiejętności (skills hubs) Amazon, w blokach po 15 dni." },
      { title: "Projekty grupowe", text: "Pracujesz z innymi uczniami nad projektami dla organizacji charytatywnych." },
      { title: "Zadania zespołowe", text: "Zadania od twojego zespołu, w których wykorzystujesz umiejętności z T-Level." },
    ],
    SUPPORT: [
      { title: "Kolega do pomocy (buddy)", text: "Od drobnych pytań." },
      { title: "Mentor", text: "Kieruje twoją pracą i pokazuje szerszy obraz." },
      { title: "Opiekun praktyk", text: "Czuwa nad przebiegiem praktyk razem z twoją szkołą lub college'em." },
    ],
    ROUTE_IN: [
      { title: "Zacznij T-Level", text: "Dla osób w wieku od 16 do 18 lat, które już uczą się na T-Level." },
      {
        title: "Twój college się odzywa",
        text: "Amazon organizuje praktyki ze szkołami i college'ami, a nie bezpośrednio z uczniami.",
      },
      { title: "Zgłoś zainteresowanie", text: "Podaj swoją ścieżkę, a przekażemy ją do Amazon. To nie jest aplikacja." },
    ],
    GROWTH: [
      { caption: "uczniów w pierwszym roku" },
      { caption: "uczniów, cztery razy więcej" },
      { caption: "zaplanowanych miejsc na praktykach" },
    ],
  },

  help: {
    SERVICES: [
      {
        title: "Znajdź T-Level w pobliżu",
        text: "Szukaj według kodu pocztowego i kierunku.",
        linkText: "Znajdź T-Level na tlevels.gov.uk",
      },
      {
        title: "Bezpłatne doradztwo zawodowe",
        text: "Zadzwoń pod 0800 100 900 albo skorzystaj z czatu. Dla każdego od 13 roku życia.",
        linkText: "National Careers Service",
      },
      {
        title: "Pomoc z dojazdami i sprzętem",
        text: "Stypendium 16 to 19 Bursary. Wniosek składasz przez szkołę lub college.",
        linkText: "Wytyczne 16 to 19 Bursary Fund",
      },
      {
        title: "Zasady praktyk",
        text: "Oficjalne wytyczne o tym, co muszą obejmować praktyki.",
        linkText: "Wytyczne dotyczące praktyk",
      },
    ],
    PROVIDER_QUESTIONS: [
      "Jakie T-Levels i specjalizacje prowadzicie?",
      "Czy to wy znajdujecie mi praktyki, czy ja?",
      "Którzy pracodawcy przyjmowali waszych uczniów?",
      "Czy praktyki są blokiem, jednym dniem w tygodniu, czy połączeniem?",
      "Jakie macie wymagania wstępne?",
      "Jakie jest wsparcie, jeśli mam dodatkowe potrzeby?",
    ],
    SITE_ROUTES: [
      { label: "Czym jest T-Level?", detail: "O T-Levels" },
      { label: "Chcę zobaczyć wszystkie kierunki", detail: "Wszystkie T-Levels" },
      { label: "Jak wyglądają praktyki w Amazon?", detail: "T-Levels w Amazon" },
      { label: "Chcę poradniki i materiały", detail: "Materiały o T-Levels" },
      { label: "Chcę zgłosić zainteresowanie", detail: "Zgłoś zainteresowanie" },
      { label: "Mam już konto", detail: "Logowanie" },
    ],
  },

  interest: {
    NEXT_STEPS: [
      { text: "Podajesz swoją ścieżkę. Zajmuje to około minuty." },
      { text: "Zespół Amazon Emerging Talent widzi, kto jest zainteresowany." },
      { text: "Praktyki są organizowane z twoją szkołą lub college'em, więc zespół może się z nimi skontaktować." },
    ],
    WHY_WE_ASK:
      "Pytamy tylko o to, czego zespół Amazon Emerging Talent potrzebuje, żeby wiedzieć, że jesteś zainteresowany. Bez adresu, daty urodzenia i szkoły.",
  },

  quiz: {
    KNOWLEDGE_QUESTIONS: [
      {
        question: "Ile trwają praktyki u pracodawcy na T-Level?",
        options: ["Co najmniej 315 godzin, około 45 dni", "Dwa tygodnie", "Cały rok", "Nie ma praktyk"],
        correctAnswer: "Co najmniej 315 godzin, około 45 dni",
        explanation: "Co najmniej 315 godzin, około 45 dni. Amazon prowadzi praktyki jako dziewięciotygodniowy blok.",
      },
      {
        question: "Ilu A levels odpowiada mniej więcej T-Level?",
        options: ["Jednemu", "Dwóm", "Trzem", "Pięciu"],
        correctAnswer: "Trzem",
        explanation: "Trzem. T-Level też daje punkty UCAS, więc droga na studia zostaje otwarta.",
      },
      {
        question: "Jaka jest główna różnica między T-Level a apprenticeship?",
        options: [
          "T-Level to głównie nauka, apprenticeship to głównie płatna praca",
          "To jest to samo",
          "T-Level to głównie płatna praca, apprenticeship to głównie nauka",
          "Tylko apprenticeship obejmuje czas u pracodawcy",
        ],
        correctAnswer: "T-Level to głównie nauka, apprenticeship to głównie płatna praca",
        explanation:
          "To odwrotnie. T-Level to w około 80 procentach nauka, a resztę stanowią praktyki u pracodawcy trwające co najmniej 315 godzin.",
      },
      {
        question: "Która ścieżka obejmuje T-Level Digital Software Development?",
        options: ["Cyfrowa", "Biznes", "Inżynieria", "Media"],
        correctAnswer: "Cyfrowa",
        explanation: "Cyfrowa. Obejmuje też Digital Data Analytics oraz Digital Support and Security.",
      },
      {
        question: "Która ścieżka obejmuje T-Level Management and Administration?",
        options: ["Biznes", "Finanse", "Media", "Cyfrowa"],
        correctAnswer: "Biznes",
        explanation: "Biznes. Na stronie opisano ją jako dbanie o sprawne działanie zespołów i firmy.",
      },
      {
        question: "Kto się tobą opiekuje na praktykach w Amazon?",
        options: [
          "Kolega do pomocy (buddy), mentor i opiekun praktyk",
          "Nikt, pracujesz sam",
          "Tylko twój nauczyciel",
          "Codziennie inny kierownik",
        ],
        correctAnswer: "Kolega do pomocy (buddy), mentor i opiekun praktyk",
        explanation:
          "Każdy uczeń ma kolegę do pomocy (buddy), mentora i opiekuna praktyk, więc zawsze jest kogo zapytać.",
      },
      {
        question: "Czy potrzebujesz konta, żeby korzystać z biblioteki materiałów T-SMILE?",
        options: [
          "Nie, ale niektóre materiały wymagają darmowego konta",
          "Tak, do wszystkiego",
          "Nie, wszystko jest dostępne dla wszystkich",
          "Tylko jeśli jesteś nauczycielem",
        ],
        correctAnswer: "Nie, wszystko jest dostępne dla wszystkich",
        explanation:
          "Każdy może przeglądać bibliotekę i otwierać wszystko, co w niej jest. Darmowe konto służy do zadawania pytań i odpowiadania w Społeczności oraz do zachowania ustawień.",
      },
    ],
  },
  legal: {
    TERMS: {
      label: "Informacje prawne",
      title: "Warunki korzystania",
      updated: "wrzesień 2026",
      intro: "T-SMILE to projekt uczniowski, stworzony dla programu Amazon Emerging Talent Digital T-Level. Nie jest oficjalną stroną Amazon.",
      sections: [
        {
          heading: "Korzystanie ze strony",
          paragraphs: [
            "Każdy może czytać wszystkie strony, otwierać wszystkie materiały, rozwiązywać quizy i rozmawiać ze Smileyem bez konta. Darmowe konto pozwala zadawać pytania i odpowiadać w Społeczności.",
            "Aby założyć konto, musisz mieć co najmniej 16 lat.",
          ],
        },
        {
          heading: "Twoje konto",
          points: [
            "Nie zdradzaj nikomu swojego hasła.",
            "Podawaj prawdziwe dane, gdy się rejestrujesz lub zgłaszasz zainteresowanie.",
            "W każdej chwili możesz wyłączyć swoje konto w Profilu.",
          ],
        },
        {
          heading: "Bądź miły",
          points: [
            "Nie publikuj niczego niegrzecznego, krzywdzącego ani nielegalnego w formularzach, na czacie ani w Społeczności.",
            "Nie próbuj psuć strony ani dostawać się do danych innych osób.",
            "Możemy wyłączyć konta, które łamią te zasady.",
          ],
        },
        {
          heading: "Nasze informacje",
          paragraphs: [
            "Sprawdzamy fakty w gov.uk, UCAS i Amazon, a źródła podajemy na każdej stronie. Wszystko się zmienia, więc zanim podejmiesz decyzję, zawsze sprawdź to w swojej szkole lub college'u.",
            "Smiley, asystent, może się mylić. To pomocnik, a nie porada.",
          ],
        },
        {
          heading: "Nazwa Amazon",
          paragraphs: [
            "„Amazon” i jego logo należą do Amazon.com, Inc. lub jej spółek powiązanych. Używamy ich, aby opisać praktyki T-Level w Amazon.",
          ],
        },
      ],
    },
    PRIVACY: {
      label: "Informacje prawne",
      title: "Polityka prywatności",
      updated: "wrzesień 2026",
      intro: "T-SMILE to projekt uczniowski, stworzony dla programu Amazon Emerging Talent Digital T-Level. Nie jest oficjalną stroną Amazon.",
      sections: [
        {
          heading: "Kto odpowiada za Twoje dane",
          paragraphs: [
            "Uczniowski zespół T-SMILE. Możesz się z nami skontaktować przez stronę Kontakt.",
          ],
        },
        {
          heading: "Co zbieramy i dlaczego",
          points: [
            "Zgłoszenie zainteresowania: Twoje imię i nazwisko, e-mail, to, czy jesteś uczniem, rodzicem czy nauczycielem, ścieżka i opcjonalna wiadomość. Aby zespół Amazon Emerging Talent widział, że jesteś zainteresowany, i mógł się odezwać.",
            "Konto: nazwa użytkownika, hasło (zapisane w zaszyfrowanej postaci, nigdy do odczytania), Twoja rola i ścieżka. Później, jeśli je dodasz, imię i nazwisko, e-mail i numer telefonu. Abyś mógł się zalogować, zadawać pytania i odpowiadać w Społeczności oraz mieć swoje ustawienia na każdym urządzeniu.",
            "Ustawienia dostępności: rozmiar tekstu, kontrast, motyw i podobne wybory. Aby strona wyglądała tak, jak ją ustawisz.",
            "Czat ze Smileyem: to, co piszesz, i odpowiedzi Smileya. Aby Smiley mógł śledzić rozmowę.",
            "Wpisy w Społeczności: pytania i odpowiedzi, które publikujesz, widoczne z Twoją nazwą użytkownika. Aby inni odwiedzający mogli je czytać i odpowiadać.",
            "Opinie i wiadomości kontaktowe: Twoja wiadomość i e-mail, jeśli go podasz. Abyśmy mogli coś naprawić i odpowiedzieć.",
          ],
        },
        {
          heading: "Kto je widzi",
          points: [
            "Zespół T-SMILE, a w przypadku formularzy zainteresowania pracownicy Amazon Emerging Talent.",
            "Anthropic, firma, której AI pisze odpowiedzi Smileya. Twoje wiadomości z czatu są do niej wysyłane, aby uzyskać odpowiedź.",
            "Firma, która hostuje stronę (Railway dla wersji testowej, później Amazon Web Services).",
            "Nikt inny. Nie sprzedajemy danych ani nie używamy ich do reklam.",
          ],
        },
        {
          heading: "Jak długo je przechowujemy",
          paragraphs: [
            "Jeszcze tego nie ustaliliśmy i zrobimy to przed uruchomieniem strony. Do tego czasu poproś nas, a usuniemy Twoje dane.",
          ],
        },
        {
          heading: "Poniżej 18 lat",
          paragraphs: [
            "Wielu naszych odwiedzających ma mniej niż 18 lat, więc prosimy tylko o to, czego potrzebujemy. W formularzach nigdy nie pytamy o adres, datę urodzenia ani szkołę.",
          ],
        },
        {
          heading: "Twoje prawa",
          paragraphs: [
            "Możesz zobaczyć, poprawić lub usunąć swoje dane i nie tylko. Strona o prawach do danych wyjaśnia, jak to zrobić.",
          ],
        },
      ],
    },
    COOKIES: {
      label: "Informacje prawne",
      title: "Polityka plików cookie",
      updated: "wrzesień 2026",
      intro: "Używamy tylko plików cookie, których strona potrzebuje do działania. Bez śledzenia, bez reklam, bez analityki.",
      sections: [
        {
          heading: "Pliki cookie",
          points: [
            "sessionid: utrzymuje Cię zalogowanym i pozwala Smileyowi pamiętać Twój czat. Działa dwa tygodnie albo do wylogowania.",
            "csrftoken: nie pozwala innym stronom wysyłać formularzy w Twoim imieniu. Działa do roku.",
          ],
          paragraphs: [
            "Bez nich strona nie może działać bezpiecznie, więc prawo nie wymaga od nas banera o plikach cookie.",
          ],
        },
        {
          heading: "Zapisane w Twojej przeglądarce",
          paragraphs: [
            "To nie są pliki cookie i nigdy nie opuszczają Twojego urządzenia.",
          ],
          points: [
            "Twoje ustawienia dostępności, aby zostały, gdy wrócisz.",
            "Czy Smiley już się przywitał, do zamknięcia karty.",
          ],
        },
        {
          heading: "Usuwanie",
          paragraphs: [
            "Pliki cookie i zapisane dane możesz usunąć w ustawieniach przeglądarki. Zostaniesz wylogowany, a Twoje ustawienia wrócą do domyślnych.",
          ],
        },
      ],
    },
    DATA_RIGHTS: {
      label: "Informacje prawne",
      title: "RODO i Twoje prawa do danych",
      updated: "wrzesień 2026",
      intro: "Prawo brytyjskie (UK GDPR) daje Ci prawa do Twoich danych. Korzystanie z nich jest bezpłatne.",
      sections: [
        {
          heading: "Twoje prawa",
          points: [
            "Zobacz je: poproś o kopię danych, które o Tobie mamy.",
            "Popraw je: poproś nas o poprawienie czegoś, co jest błędne.",
            "Usuń je: poproś nas o usunięcie Twoich danych.",
            "Ogranicz je: poproś, abyśmy na jakiś czas przestali ich używać.",
            "Zabierz je: poproś o swoje dane w pliku, którego możesz użyć gdzie indziej.",
            "Sprzeciw: powiedz nam, abyśmy przestali ich używać.",
          ],
        },
        {
          heading: "Jak poprosić",
          paragraphs: [
            "Użyj formularza Kontakt i napisz, z którego prawa chcesz skorzystać. Możemy poprosić o potwierdzenie, że to Ty. Odpowiemy w ciągu miesiąca.",
            "Możesz też sam poprawić swoje dane albo wyłączyć konto w Profilu.",
          ],
        },
        {
          heading: "Nie jesteś zadowolony?",
          paragraphs: [
            "Możesz złożyć skargę do Information Commissioner's Office (ICO), urzędu, który dba o ochronę danych w Wielkiej Brytanii.",
          ],
          link: {
            text: "Złóż skargę do ICO",
          },
        },
      ],
    },
  },
};
