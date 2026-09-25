// Spanish words for the page copy (see ../content.js). Words only, in the same
// order as the English lists: icons, links, slugs and numbers come from the
// English files. null keeps the English, used for official qualification and
// grade names people will see on gov.uk and on their certificate.

export default {
  about: {
    ROUTE_STEPS: [
      { title: "Elige una materia", text: "Unas 20 para elegir. Dos años, a tiempo completo, en un instituto o college." },
      { title: "Apréndela", text: "Entre 1.100 y 1.300 horas de clase: primero lo básico de tu sector y después una especialidad." },
      { title: "Trabaja", text: "Al menos 315 horas con una empresa, unos 45 días. Aquí es donde entra Amazon." },
    ],
    TIME_SPLIT: [
      { label: "Aprendizaje", detail: "alrededor del 80 % del curso" },
      { label: "Prácticas", detail: "al menos 315 horas" },
    ],
    PLACEMENT_FACTS: [
      { title: "Trabajo real", text: "Tareas que la empresa necesita. No solo mirar." },
      { title: "Tu horario", text: "Uno o dos días a la semana, un bloque de semanas o una mezcla." },
      { title: "Una o dos empresas", text: "Normalmente una. No más de dos sin un buen motivo." },
      { title: "El sueldo varía", text: "No está garantizado. Algunas empresas pagan o cubren el transporte. Pregunta antes." },
    ],
    GRADES: [
      null,
      null,
      null,
      { grade: "Pass, con C o más en el núcleo (core)" },
      { grade: "Pass, con D o E en el núcleo (core)" },
    ],
    AUDIENCE_POINTS: [
      { text: "Tienes entre 16 y 19 años y estás terminando los GCSE, o quieres cambiar de estudios." },
      { text: "Sabes más o menos en qué sector quieres trabajar." },
      { text: "Aprendes mejor haciendo." },
      { text: "Quieres una titulación en la que confíen las empresas, sin cerrarte la puerta de la universidad." },
      {
        text: "No te importa centrarte en un área durante dos años. ¿Prefieres seguir con muchas materias? Puede que los A levels te encajen mejor.",
      },
    ],
    BENEFITS: [
      { title: "Trabajo real", text: "Al menos 315 horas dentro de un equipo de trabajo." },
      { title: "Equivale a tres A levels", text: "Da puntos UCAS, así que la universidad sigue abierta." },
      { title: "Creado con empresas", text: "Las empresas ayudaron a decidir lo que aprendes." },
      { title: "Tres caminos después", text: "Un empleo cualificado, un aprendizaje de nivel superior o la universidad." },
    ],
    COST_POINTS: [
      { title: "El curso es gratis", text: "Si tienes entre 16 y 18 años y estudias a tiempo completo." },
      {
        title: "Ayuda con los gastos",
        text: "La beca 16 to 19 Bursary puede cubrir transporte, libros, material y ropa especializada.",
      },
      {
        title: "Hasta 1.200 £ al año",
        text: "Para estudiantes en acogimiento, jóvenes que han salido del sistema de acogida y algunos estudiantes que reciben ciertas prestaciones.",
      },
      {
        title: "Pregunta en tu centro",
        text: "Cualquier otra persona puede pedir una beca discrecional. No cubre alquiler ni facturas.",
      },
    ],
    PATHWAYS: [
      {
        name: "Digital",
        summary: "Crear, gestionar y dar soporte a la tecnología.",
        placement:
          "Trabajas con un equipo técnico en tareas reales: escribir y revisar código, hacer pruebas, corregir errores o mantener en marcha los sistemas y a sus usuarios.",
        suits: "Personas a las que les gusta resolver un problema y verlo funcionar al momento.",
        amazonStatus: "Donde empezó el programa de T-Level de Amazon.",
      },
      {
        name: "Empresa",
        summary: "Mantener en marcha los equipos y las operaciones.",
        placement:
          "Apoyas el día a día de un equipo: planificar, coordinar, gestionar datos e informes y mantener los procesos en marcha.",
        suits: "Personas organizadas a las que les gusta que las cosas funcionen bien.",
        amazonStatus: "Amazon lo ha nombrado como un itinerario al que se está ampliando.",
      },
      {
        name: "Medios",
        summary: "Planificar, crear y publicar contenido.",
        placement:
          "Ayudas a planificar y producir contenido, desde grabar y editar hasta publicar, y ves cómo una pieza pasa de idea a público.",
        suits: "Personas que quieren crear cosas que otros verán o leerán.",
        amazonStatus: "Amazon lo ha nombrado como un itinerario creativo al que se está ampliando.",
      },
      {
        name: "Finanzas",
        summary: "Trabajar con los números detrás de las decisiones.",
        tLevels: [null, "Finance, últimas matrículas en septiembre de 2026"],
        placement:
          "Trabajas con cifras reales: controlar gastos, revisar registros y ayudar a preparar los informes con los que un equipo toma decisiones.",
        suits: "Personas a las que se les dan bien los números y detectar lo que no cuadra.",
      },
      {
        name: "Ingeniería",
        summary: "Diseñar, construir y mantener sistemas.",
        placement:
          "Trabajas junto a ingenieros con equipos y sistemas: instalar, mantener, probar y mejorar su funcionamiento.",
        suits: "Personas que quieren entender cómo funciona algo físico y después hacer que funcione mejor.",
        amazonStatus: "Amazon lo ha nombrado como un itinerario al que se está ampliando.",
      },
    ],
    FAQS: [
      {
        question: "¿Un T-Level es lo mismo que un aprendizaje (apprenticeship)?",
        answer:
          "No, es al revés. Un aprendizaje es sobre todo trabajo remunerado con algo de estudio. Un T-Level es sobre todo estudio, alrededor del 80 %, y unas prácticas en empresa de al menos 315 horas completan el resto.",
      },
      {
        question: "¿Qué GCSE necesito?",
        answer:
          "Cada instituto o college fija sus requisitos de acceso; no hay unos nacionales. Lo habitual es tener unos cuatro o cinco GCSE con nota 4 o superior, normalmente incluidos inglés y matemáticas. Consulta con el centro al que quieres ir.",
      },
      {
        question: "¿Qué T-Levels puedo elegir?",
        answer:
          "Unos 20, en áreas como digital, ingeniería, construcción, salud, ciencias, derecho y contabilidad, medios, marketing, agricultura, cuidado de animales, educación, y artesanía y diseño. Sport y Social Care llegan en septiembre de 2028. El T-Level de Finance acepta sus últimas matrículas en septiembre de 2026, así que el que continúa es Accounting.",
      },
      {
        question: "¿Cómo me evalúan?",
        answer:
          "En dos partes. El núcleo (core) se califica de A estrella a E y cubre los conocimientos de tu sector. La especialidad profesional (occupational specialism) se califica con pass, merit o distinction y es la parte práctica. Las dos aparecen en tu certificado, junto con una nota final.",
      },
      {
        question: "¿Puedo ir a la universidad después?",
        answer:
          "Sí. Una Distinction estrella vale 168 puntos UCAS, una Distinction 144, un Merit 120 y un Pass 72 o 96 según tu nota del núcleo. Aun así, no todas las universidades usan los puntos UCAS, así que consulta los requisitos de acceso del curso que quieres.",
      },
      {
        question: "¿Y si no apruebo todo?",
        answer:
          "Recibes una declaración de logros del T-Level (statement of achievement) en lugar del certificado completo. Recoge las partes que sí completaste, así que el trabajo no se pierde.",
      },
      {
        question: "¿Cuánto duran las prácticas en empresa?",
        answer:
          "Al menos 315 horas, unos 45 días. Pueden ser uno o dos días a la semana, un bloque a tiempo completo o una mezcla. Amazon organiza sus prácticas en un bloque de nueve semanas. La especialidad Early Years Educator exige 750 horas.",
      },
      {
        question: "¿Me pagan en las prácticas?",
        answer:
          "La ley no obliga a pagar las prácticas. Algunas empresas pagan, otras cubren el transporte o las comidas y otras no hacen ninguna de las dos cosas. Pregunta a tu centro cómo funciona antes de empezar.",
      },
      {
        question: "¿Puedo recibir ayuda para el transporte o el material?",
        answer:
          "Sí, a través del 16 to 19 Bursary Fund. Puede cubrir transporte, libros, material y ropa especializada. Solicítala a través de tu instituto o college.",
      },
      {
        question: "¿Y si todavía no estoy preparado para un T-Level?",
        answer:
          "Existe el T-Level Foundation Year, un curso de un año de nivel 2 que primero refuerza tu inglés, tus matemáticas, tus competencias digitales y tu experiencia laboral, y después te lleva al T-Level.",
      },
      {
        question: "¿Puedo hacer otras titulaciones a la vez?",
        answer:
          "Un T-Level es un programa a tiempo completo de un tamaño parecido a tres A levels, así que normalmente no se combina con mucho más. Algunos centros permiten una titulación extra. Pregunta en el tuyo.",
      },
    ],
    QUIZ_QUESTIONS: [
      {
        question: "¿Cómo aprendes mejor?",
        options: [
          { label: "Haciendo las cosas y luego preguntando por qué" },
          { label: "Un poco de las dos cosas" },
          { label: "Leyendo, tomando apuntes y repasando" },
        ],
      },
      {
        question: "¿Sabes qué tipo de trabajo quieres?",
        options: [
          { label: "Tengo bastante claro el sector" },
          { label: "Un área aproximada, no el puesto" },
          { label: "Todavía ni idea" },
        ],
      },
      {
        question: "¿Qué te parecen 45 días en un lugar de trabajo real?",
        options: [
          { label: "Es justo lo que quiero" },
          { label: "Me dan nervios, pero me animo" },
          { label: "Prefiero quedarme en el aula" },
        ],
      },
      {
        question: "¿Qué forma de evaluación te va mejor?",
        options: [
          { label: "Exámenes más una especialidad práctica con nota" },
          { label: "Me da igual" },
          { label: "Solo exámenes escritos" },
        ],
      },
      {
        question: "¿Qué quieres hacer después del curso?",
        options: [
          { label: "Un trabajo cualificado o un aprendizaje de grado (degree apprenticeship)" },
          { label: "Dejar abiertas tanto la vía laboral como la universidad" },
          { label: "Una carrera de algo que no tiene que ver con esta área" },
        ],
      },
      {
        question: "¿Estás listo para dedicarte a una sola área durante dos años?",
        options: [{ label: "Sí" }, { label: "Creo que sí" }, { label: "Quiero mantener muchas opciones abiertas" }],
      },
    ],
    QUIZ_RESULTS: [
      {
        heading: "Un T-Level parece encajar muy bien contigo",
        text: "Quieres aprender haciendo, pasar tiempo en un lugar de trabajo real y tener un camino claro hacia un sector. Justo para eso está pensado un T-Level. Siguiente paso: mira cuál de los cinco itinerarios encaja contigo y registra tu interés con Amazon.",
      },
      {
        heading: "Merece la pena mirarlo bien",
        text: "Parte de esto encaja contigo y otra parte aún está abierta, algo normal en este momento. Lee los itinerarios y las preguntas de abajo, y háblalo con un profesor o un orientador profesional antes de decidir.",
      },
      {
        heading: "Puede que otro camino te encaje mejor",
        text: "Por tus respuestas, te inclinas por aprender en el aula y mantener varias materias abiertas, algo que los A levels hacen bien. Es una respuesta perfectamente válida. Si lo que te atrae son las prácticas, aun así merece la pena leer los itinerarios de abajo.",
      },
    ],
  },

  amazon: {
    PLACEMENT_SHAPE: [
      { title: "Nueve semanas", text: "Te unes a un equipo, aprendes las herramientas y haces trabajo real." },
      { title: "Centros de formación", text: "Una parte se hace en los centros de formación (skills hubs) de Amazon, en bloques de 15 días." },
      { title: "Proyectos en grupo", text: "Trabajas con otros estudiantes en proyectos para organizaciones benéficas." },
      { title: "Retos de equipo", text: "Tareas que marca tu equipo y que usan tus competencias del T-Level." },
    ],
    SUPPORT: [
      { title: "Un compañero (buddy)", text: "Para las preguntas pequeñas." },
      { title: "Un mentor", text: "Guía tu trabajo y te enseña el panorama general." },
      { title: "Un responsable de prácticas", text: "Mantiene las prácticas en orden con tu instituto o college." },
    ],
    ROUTE_IN: [
      { title: "Empieza un T-Level", text: "Para jóvenes de 16 a 18 años que ya cursan un T-Level." },
      {
        title: "Tu centro se pone en contacto",
        text: "Amazon organiza las prácticas con institutos y colleges, no directamente con los estudiantes.",
      },
      { title: "Registra tu interés", text: "Dinos tu itinerario y se lo pasamos a Amazon. No es una solicitud." },
    ],
    GROWTH: [
      { caption: "estudiantes en el primer año" },
      { caption: "estudiantes, cuatro veces más" },
      { caption: "plazas previstas" },
    ],
  },

  help: {
    SERVICES: [
      {
        title: "Busca un T-Level cerca de ti",
        text: "Busca por código postal y materia.",
        linkText: "Buscar un T-Level en tlevels.gov.uk",
      },
      {
        title: "Orientación profesional gratuita",
        text: "Llama al 0800 100 900 o usa el chat web. Para cualquier persona a partir de 13 años.",
        linkText: "National Careers Service",
      },
      {
        title: "Ayuda para transporte y material",
        text: "La beca 16 to 19 Bursary. Solicítala a través de tu instituto o college.",
        linkText: "Guía del 16 to 19 Bursary Fund",
      },
      {
        title: "Normas de las prácticas",
        text: "La guía oficial sobre lo que deben incluir las prácticas.",
        linkText: "Guía de prácticas en empresa",
      },
    ],
    PROVIDER_QUESTIONS: [
      "¿Qué T-Levels y especialidades ofrecéis?",
      "¿Me buscáis vosotros las prácticas o las busco yo?",
      "¿Qué empresas han acogido a vuestros estudiantes?",
      "¿Las prácticas son en bloque, un día a la semana o una mezcla?",
      "¿Cuáles son vuestros requisitos de acceso?",
      "¿Qué apoyo hay si tengo necesidades adicionales?",
    ],
    SITE_ROUTES: [
      { label: "¿Qué es un T-Level?", detail: "Sobre los T-Levels" },
      { label: "Quiero ver todas las materias", detail: "Todos los T-Levels" },
      { label: "¿Cómo son unas prácticas en Amazon?", detail: "T-Levels en Amazon" },
      { label: "Quiero guías y materiales", detail: "Recursos de T-Level" },
      { label: "Quiero registrar mi interés", detail: "Registrar interés" },
      { label: "Ya tengo una cuenta", detail: "Iniciar sesión" },
    ],
  },

  interest: {
    NEXT_STEPS: [
      { text: "Nos dices tu itinerario. Se tarda un minuto más o menos." },
      { text: "El equipo de Amazon Emerging Talent puede ver quién está interesado." },
      { text: "Las prácticas se organizan con tu instituto o college, así que puede que se pongan en contacto con ellos." },
    ],
    WHY_WE_ASK:
      "Solo pedimos lo que el equipo de Amazon Emerging Talent necesita para saber que te interesa. Ni dirección, ni fecha de nacimiento, ni centro educativo.",
  },

  quiz: {
    KNOWLEDGE_QUESTIONS: [
      {
        question: "¿Cuánto duran unas prácticas en empresa de T-Level?",
        options: ["Al menos 315 horas, unos 45 días", "Dos semanas", "Un año entero", "No hay prácticas"],
        correctAnswer: "Al menos 315 horas, unos 45 días",
        explanation: "Al menos 315 horas, unos 45 días. Amazon organiza sus prácticas en un bloque de nueve semanas.",
      },
      {
        question: "Un T-Level tiene más o menos el tamaño de ¿cuántos A levels?",
        options: ["Uno", "Dos", "Tres", "Cinco"],
        correctAnswer: "Tres",
        explanation: "Tres. Un T-Level también da puntos UCAS, así que la universidad sigue abierta para ti.",
      },
      {
        question: "¿Cuál es la principal diferencia entre un T-Level y un aprendizaje (apprenticeship)?",
        options: [
          "Un T-Level es sobre todo estudio; un aprendizaje, sobre todo trabajo remunerado",
          "Son lo mismo",
          "Un T-Level es sobre todo trabajo remunerado; un aprendizaje, sobre todo estudio",
          "Solo el aprendizaje incluye tiempo con una empresa",
        ],
        correctAnswer: "Un T-Level es sobre todo estudio; un aprendizaje, sobre todo trabajo remunerado",
        explanation:
          "Es al revés. Un T-Level es alrededor de un 80 % estudio, y unas prácticas en empresa de al menos 315 horas completan el resto.",
      },
      {
        question: "¿Qué itinerario incluye el T-Level de Digital Software Development?",
        options: ["Digital", "Empresa", "Ingeniería", "Medios"],
        correctAnswer: "Digital",
        explanation: "Digital. También incluye Digital Data Analytics y Digital Support and Security.",
      },
      {
        question: "¿Qué itinerario incluye el T-Level de Management and Administration?",
        options: ["Empresa", "Finanzas", "Medios", "Digital"],
        correctAnswer: "Empresa",
        explanation: "Empresa. Su resumen en la web es mantener en marcha los equipos y las operaciones.",
      },
      {
        question: "¿Quién te cuida en unas prácticas en Amazon?",
        options: [
          "Un compañero (buddy), un mentor y un responsable de prácticas",
          "Nadie, trabajas por tu cuenta",
          "Solo tu profesor",
          "Un responsable distinto cada día",
        ],
        correctAnswer: "Un compañero (buddy), un mentor y un responsable de prácticas",
        explanation:
          "Cada estudiante tiene un compañero (buddy), un mentor y un responsable de prácticas, así que siempre hay alguien a quien preguntar.",
      },
      {
        question: "¿Necesitas una cuenta para usar la biblioteca de recursos de T-SMILE?",
        options: [
          "No, pero algunos recursos necesitan una cuenta gratuita para abrirse",
          "Sí, para todo",
          "No, todo está abierto para todo el mundo",
          "Solo si eres docente",
        ],
        correctAnswer: "No, todo está abierto para todo el mundo",
        explanation:
          "Cualquiera puede navegar por la biblioteca y abrir todo lo que hay en ella. Una cuenta gratuita sirve para preguntar y responder en la Comunidad y guardar tus ajustes.",
      },
    ],
  },
  legal: {
    TERMS: {
      label: "Aviso legal",
      title: "Condiciones del servicio",
      updated: "septiembre de 2026",
      intro: "T-SMILE es un proyecto de estudiantes, hecho para el programa Amazon Emerging Talent Digital T-Level. No es una web oficial de Amazon.",
      sections: [
        {
          heading: "Usar la web",
          paragraphs: [
            "Cualquiera puede leer todas las páginas, abrir todos los recursos, hacer los cuestionarios y hablar con Smiley sin cuenta. Una cuenta gratuita te permite preguntar y responder en la Comunidad.",
            "Necesitas tener 16 años o más para crear una cuenta.",
          ],
        },
        {
          heading: "Tu cuenta",
          points: [
            "No compartas tu contraseña.",
            "Da datos verdaderos cuando te registres o registres tu interés.",
            "Puedes desactivar tu cuenta en cualquier momento desde tu Perfil.",
          ],
        },
        {
          heading: "Sé amable",
          points: [
            "No publiques nada grosero, hiriente o ilegal en los formularios, en el chat o en la Comunidad.",
            "No intentes romper la web ni acceder a los datos de otras personas.",
            "Podemos desactivar las cuentas que incumplan estas normas.",
          ],
        },
        {
          heading: "Nuestra información",
          paragraphs: [
            "Comprobamos los datos en gov.uk, UCAS y Amazon, y citamos nuestras fuentes en cada página. Las cosas cambian, así que consulta siempre con tu centro educativo antes de decidir.",
            "Smiley, el asistente, puede equivocarse. Es una ayuda, no un consejo.",
          ],
        },
        {
          heading: "El nombre de Amazon",
          paragraphs: [
            "«Amazon» y su logotipo pertenecen a Amazon.com, Inc. o a sus filiales. Los usamos para describir las prácticas de T-Level en Amazon.",
          ],
        },
      ],
    },
    PRIVACY: {
      label: "Aviso legal",
      title: "Política de privacidad",
      updated: "septiembre de 2026",
      intro: "T-SMILE es un proyecto de estudiantes, hecho para el programa Amazon Emerging Talent Digital T-Level. No es una web oficial de Amazon.",
      sections: [
        {
          heading: "Quién cuida tus datos",
          paragraphs: [
            "El equipo de estudiantes de T-SMILE. Puedes contactarnos a través de la página de Contacto.",
          ],
        },
        {
          heading: "Qué recogemos y por qué",
          points: [
            "Registrar tu interés: tu nombre, correo electrónico, si eres estudiante, familia o docente, un itinerario y un mensaje opcional. Para que el equipo de Amazon Emerging Talent vea que te interesa y se ponga en contacto.",
            "Una cuenta: un nombre de usuario, una contraseña (guardada cifrada, nunca legible), tu rol y tu itinerario. Más adelante, si los añades, tu nombre, correo electrónico y teléfono. Para que puedas iniciar sesión, preguntar y responder en la Comunidad y tener tus ajustes en cualquier dispositivo.",
            "Ajustes de accesibilidad: tamaño del texto, contraste, tema y opciones parecidas. Para que la web se vea como la configuraste.",
            "Chat con Smiley: lo que escribes y las respuestas de Smiley. Para que Smiley pueda seguir la conversación.",
            "Publicaciones en la Comunidad: las preguntas y respuestas que publicas, con tu nombre de usuario. Para que otras personas puedan leerlas y responder.",
            "Comentarios y mensajes de contacto: tu mensaje y tu correo electrónico, si lo das. Para poder arreglar cosas y responderte.",
          ],
        },
        {
          heading: "Quién los ve",
          points: [
            "El equipo de T-SMILE y, en los formularios de interés, el personal de Amazon Emerging Talent.",
            "Anthropic, la empresa cuya IA escribe las respuestas de Smiley. Tus mensajes del chat se le envían para obtener una respuesta.",
            "La empresa que aloja la web (Railway para la versión de prueba, Amazon Web Services más adelante).",
            "Nadie más. No vendemos datos ni los usamos para publicidad.",
          ],
        },
        {
          heading: "Cuánto tiempo los guardamos",
          paragraphs: [
            "Todavía no lo hemos fijado, y lo haremos antes de que la web esté en marcha. Hasta entonces, pídenoslo y borraremos tus datos.",
          ],
        },
        {
          heading: "Menores de 18 años",
          paragraphs: [
            "Muchas de las personas que nos visitan tienen menos de 18 años, así que solo pedimos lo que necesitamos. Nunca pedimos tu dirección, fecha de nacimiento ni centro educativo en un formulario.",
          ],
        },
        {
          heading: "Tus derechos",
          paragraphs: [
            "Puedes ver, corregir o borrar tus datos, y más. La página de Derechos sobre tus datos explica cómo.",
          ],
        },
      ],
    },
    COOKIES: {
      label: "Aviso legal",
      title: "Política de cookies",
      updated: "septiembre de 2026",
      intro: "Solo usamos las cookies que la web necesita para funcionar. Sin seguimiento, sin publicidad, sin analítica.",
      sections: [
        {
          heading: "Cookies",
          points: [
            "sessionid: mantiene tu sesión iniciada y permite a Smiley recordar tu chat. Dura dos semanas, o hasta que cierres sesión.",
            "csrftoken: impide que otras webs envíen formularios en tu nombre. Dura hasta un año.",
          ],
          paragraphs: [
            "La web no puede funcionar de forma segura sin ellas, así que la ley no nos exige un aviso de cookies.",
          ],
        },
        {
          heading: "Guardado en tu navegador",
          paragraphs: [
            "Esto no son cookies y nunca sale de tu dispositivo.",
          ],
          points: [
            "Tus ajustes de accesibilidad, para que sigan ahí cuando vuelvas.",
            "Si Smiley ya te ha saludado, hasta que cierres la pestaña.",
          ],
        },
        {
          heading: "Borrarlas",
          paragraphs: [
            "Puedes borrar las cookies y los datos guardados en los ajustes de tu navegador. Se cerrará tu sesión y tus ajustes volverán a los normales.",
          ],
        },
      ],
    },
    DATA_RIGHTS: {
      label: "Aviso legal",
      title: "RGPD y tus derechos sobre tus datos",
      updated: "septiembre de 2026",
      intro: "La ley del Reino Unido (UK GDPR) te da derechos sobre tus datos. Usarlos es gratis.",
      sections: [
        {
          heading: "Tus derechos",
          points: [
            "Verlos: pide una copia de los datos que tenemos sobre ti.",
            "Corregirlos: pídenos que corrijamos lo que esté mal.",
            "Borrarlos: pídenos que eliminemos tus datos.",
            "Limitarlos: pídenos que dejemos de usarlos durante un tiempo.",
            "Llevártelos: pide tus datos en un archivo que puedas usar en otro sitio.",
            "Oponerte: dinos que dejemos de usarlos.",
          ],
        },
        {
          heading: "Cómo pedirlo",
          paragraphs: [
            "Usa el formulario de Contacto y di qué derecho quieres ejercer. Puede que te pidamos confirmar que eres tú. Te responderemos en un plazo de un mes.",
            "También puedes corregir tus datos, o desactivar tu cuenta, tú mismo desde tu Perfil.",
          ],
        },
        {
          heading: "¿No estás conforme?",
          paragraphs: [
            "Puedes reclamar ante la Information Commissioner's Office (ICO), que se encarga de la protección de datos en el Reino Unido.",
          ],
          link: {
            text: "Presentar una reclamación ante la ICO",
          },
        },
      ],
    },
  },
};
