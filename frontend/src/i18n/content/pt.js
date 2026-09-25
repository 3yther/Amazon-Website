// Portuguese words for the page copy (see ../content.js). Words only, in the
// same order as the English lists: icons, links, slugs and numbers come from
// the English files. null keeps the English, used for official qualification
// and grade names people will see on gov.uk and on their certificate.

export default {
  about: {
    ROUTE_STEPS: [
      { title: "Escolhe uma área", text: "Cerca de 20 à escolha. Dois anos, a tempo inteiro, numa escola ou college." },
      { title: "Aprende", text: "1100 a 1300 horas de aulas: primeiro as bases do teu setor, depois uma especialização." },
      { title: "Trabalha", text: "Pelo menos 315 horas numa empresa, cerca de 45 dias. É aqui que entra a Amazon." },
    ],
    TIME_SPLIT: [
      { label: "Aprendizagem", detail: "cerca de 80% do curso" },
      { label: "Estágio", detail: "pelo menos 315 horas" },
    ],
    PLACEMENT_FACTS: [
      { title: "Trabalho real", text: "Tarefas de que a empresa precisa. Não é só observar." },
      { title: "O teu horário", text: "Um ou dois dias por semana, um bloco de semanas, ou uma mistura." },
      { title: "Uma ou duas empresas", text: "Normalmente uma. Não mais de duas sem uma boa razão." },
      { title: "O pagamento varia", text: "Não é garantido. Algumas empresas pagam ou cobrem o transporte. Pergunta primeiro." },
    ],
    GRADES: [
      null,
      null,
      null,
      { grade: "Pass, com C ou mais no núcleo (core)" },
      { grade: "Pass, com D ou E no núcleo (core)" },
    ],
    AUDIENCE_POINTS: [
      { text: "Tens entre 16 e 19 anos e estás a acabar os GCSE, ou a mudar de curso." },
      { text: "Sabes mais ou menos em que setor queres trabalhar." },
      { text: "Aprendes melhor a fazer." },
      { text: "Queres uma qualificação em que as empresas confiam, e a universidade continua em aberto." },
      {
        text: "Não te importas de te focar numa só área durante dois anos. Preferes manter muitas disciplinas? Os A levels podem ser melhores para ti.",
      },
    ],
    BENEFITS: [
      { title: "Trabalho real", text: "Pelo menos 315 horas dentro de uma equipa de trabalho." },
      { title: "Equivale a três A levels", text: "Dá pontos UCAS, por isso a universidade continua em aberto." },
      { title: "Criado com empresas", text: "As empresas ajudaram a definir o que aprendes." },
      { title: "Três caminhos a seguir", text: "Um emprego qualificado, uma aprendizagem de nível superior, ou a universidade." },
    ],
    COST_POINTS: [
      { title: "O curso é grátis", text: "Se tiveres entre 16 e 18 anos e estiveres a estudar a tempo inteiro." },
      {
        title: "Ajuda com os custos",
        text: "A bolsa 16 to 19 Bursary pode cobrir transporte, livros, material e roupa especializada.",
      },
      {
        title: "Até £1200 por ano",
        text: "Para estudantes em acolhimento, jovens que saíram do acolhimento e alguns estudantes que recebem certos apoios sociais.",
      },
      {
        title: "Pergunta ao teu college",
        text: "Qualquer outra pessoa pode pedir uma bolsa discricionária. Não cobre renda nem contas.",
      },
    ],
    PATHWAYS: [
      {
        name: "Digital",
        summary: "Criar, gerir e dar apoio à tecnologia.",
        placement:
          "Trabalhas com uma equipa técnica em tarefas reais: escrever e rever código, testar, corrigir erros, ou manter sistemas e utilizadores a funcionar.",
        suits: "Pessoas que gostam de resolver um problema e de o ver funcionar logo.",
        amazonStatus: "Onde começou o programa de T-Level da Amazon.",
      },
      {
        name: "Negócios",
        summary: "Manter equipas e operações a funcionar.",
        placement:
          "Apoias o dia a dia de uma equipa: planear, coordenar, tratar dados e relatórios, e manter os processos no caminho certo.",
        suits: "Pessoas organizadas que gostam de pôr as coisas a funcionar bem.",
        amazonStatus: "Indicado pela Amazon como um percurso para onde está a expandir-se.",
      },
      {
        name: "Media",
        summary: "Planear, criar e publicar conteúdos.",
        placement:
          "Ajudas a planear e produzir conteúdos, desde filmar e editar até publicar, e vês como uma peça vai da ideia até ao público.",
        suits: "Pessoas que querem fazer coisas que outros vão ver ou ler.",
        amazonStatus: "Indicado pela Amazon como um percurso criativo para onde está a expandir-se.",
      },
      {
        name: "Finanças",
        summary: "Trabalhar com os números por trás das decisões.",
        tLevels: [null, "Finance, últimas inscrições em setembro de 2026"],
        placement:
          "Trabalhas com números reais: acompanhar despesas, verificar registos e ajudar a preparar os relatórios com que uma equipa toma decisões.",
        suits: "Pessoas à vontade com números e com olho para o que não bate certo.",
      },
      {
        name: "Engenharia",
        summary: "Conceber, construir e manter sistemas.",
        placement:
          "Trabalhas ao lado de engenheiros com equipamentos e sistemas: montar, manter, testar e melhorar o seu funcionamento.",
        suits: "Pessoas que querem perceber como funciona uma coisa física e depois pô-la a funcionar melhor.",
        amazonStatus: "Indicado pela Amazon como um percurso para onde está a expandir-se.",
      },
    ],
    FAQS: [
      {
        question: "Um T-Level é o mesmo que uma aprendizagem (apprenticeship)?",
        answer:
          "Não, é ao contrário. Uma aprendizagem é sobretudo trabalho pago com algum estudo. Um T-Level é sobretudo estudo, cerca de 80 por cento, e um estágio numa empresa de pelo menos 315 horas completa o resto.",
      },
      {
        question: "De que GCSE preciso?",
        answer:
          "Os requisitos de entrada são definidos por cada escola ou college, não a nível nacional. É comum pedirem quatro ou cinco GCSE com nota 4 ou superior, normalmente incluindo inglês e matemática. Confirma com a escola onde queres entrar.",
      },
      {
        question: "Que T-Levels posso escolher?",
        answer:
          "Cerca de 20, em áreas como digital, engenharia, construção, saúde, ciências, direito e contabilidade, media, marketing, agricultura, cuidados com animais, educação, e artesanato e design. Sport e Social Care chegam em setembro de 2028. O T-Level de Finance recebe as últimas inscrições em setembro de 2026, por isso o que continua é o de Accounting.",
      },
      {
        question: "Como sou avaliado?",
        answer:
          "Em duas partes. O núcleo (core) tem notas de A estrela a E e cobre os conhecimentos do teu setor. A especialização profissional (occupational specialism) tem as notas pass, merit ou distinction e é a parte prática. As duas aparecem no teu certificado, junto com uma nota final.",
      },
      {
        question: "Ainda posso ir para a universidade?",
        answer:
          "Sim. Uma Distinction estrela vale 168 pontos UCAS, uma Distinction 144, um Merit 120 e um Pass 72 ou 96, conforme a tua nota do núcleo. Mas nem todas as universidades usam os pontos UCAS, por isso confirma os requisitos de entrada do curso que queres.",
      },
      {
        question: "E se eu não passar em tudo?",
        answer:
          "Recebes uma declaração de resultados do T-Level (statement of achievement) em vez do certificado completo. Indica as partes que concluíste, por isso o trabalho não se perde.",
      },
      {
        question: "Quanto tempo dura o estágio numa empresa?",
        answer:
          "Pelo menos 315 horas, cerca de 45 dias. Pode ser um ou dois dias por semana, um bloco a tempo inteiro, ou uma mistura. A Amazon faz os seus estágios num bloco de nove semanas. A especialização Early Years Educator exige 750 horas.",
      },
      {
        question: "Sou pago no estágio?",
        answer:
          "A lei não obriga a que o estágio seja pago. Algumas empresas pagam, outras cobrem o transporte ou as refeições, e outras não fazem nenhuma das duas coisas. Pergunta à tua escola como funciona antes de começares.",
      },
      {
        question: "Posso ter ajuda com o transporte ou o material?",
        answer:
          "Sim, através do 16 to 19 Bursary Fund. Pode cobrir transporte, livros, material e roupa especializada. Candidata-te através da tua escola ou college.",
      },
      {
        question: "E se ainda não estiver preparado para um T-Level?",
        answer:
          "Existe o T-Level Foundation Year, um curso de um ano de nível 2 que primeiro reforça o teu inglês, a matemática, as competências digitais e a experiência de trabalho, e depois te leva para o T-Level.",
      },
      {
        question: "Posso fazer outras qualificações ao mesmo tempo?",
        answer:
          "Um T-Level é um programa a tempo inteiro, mais ou menos do tamanho de três A levels, por isso normalmente não se junta a muito mais. Algumas escolas permitem uma qualificação extra. Pergunta na tua.",
      },
    ],
    QUIZ_QUESTIONS: [
      {
        question: "Como aprendes melhor?",
        options: [
          { label: "A fazer, e depois a perguntar porquê" },
          { label: "Um pouco das duas coisas" },
          { label: "A ler, a passar a limpo e a rever" },
        ],
      },
      {
        question: "Sabes que tipo de trabalho queres?",
        options: [
          { label: "Tenho uma boa ideia do setor" },
          { label: "Uma área mais ou menos, não o emprego" },
          { label: "Ainda não faço ideia" },
        ],
      },
      {
        question: "O que achas de 45 dias num local de trabalho real?",
        options: [
          { label: "É a parte que eu quero" },
          { label: "Nervoso, mas alinho" },
          { label: "Preferia ficar na sala de aula" },
        ],
      },
      {
        question: "Que forma de avaliação combina contigo?",
        options: [
          { label: "Exames mais uma especialização prática com nota" },
          { label: "Tanto faz" },
          { label: "Só exames escritos" },
        ],
      },
      {
        question: "O que queres fazer depois do curso?",
        options: [
          { label: "Trabalho qualificado ou uma aprendizagem de licenciatura (degree apprenticeship)" },
          { label: "Deixar abertos tanto o trabalho como a universidade" },
          { label: "Uma licenciatura noutra área sem ligação a esta" },
        ],
      },
      {
        question: "Estás pronto para te dedicares a uma só área durante dois anos?",
        options: [{ label: "Sim" }, { label: "Acho que sim" }, { label: "Quero manter muitas opções em aberto" }],
      },
    ],
    QUIZ_RESULTS: [
      {
        heading: "Um T-Level parece encaixar muito bem",
        text: "Queres aprender a fazer, passar tempo num local de trabalho real e ter um caminho claro para um setor. É exatamente para isso que um T-Level existe. Próximo passo: vê qual dos cinco percursos combina contigo e regista o teu interesse junto da Amazon.",
      },
      {
        heading: "Vale a pena ver com atenção",
        text: "Algumas coisas combinam contigo e outras ainda estão em aberto, o que é normal nesta fase. Lê os percursos e as perguntas abaixo, e fala com um professor ou um orientador vocacional antes de decidires.",
      },
      {
        heading: "Outro caminho pode ser melhor para ti",
        text: "Pelas tuas respostas, preferes aprender na sala de aula e manter várias disciplinas em aberto, algo que os A levels fazem bem. É uma resposta perfeitamente válida. Se o estágio é o que te atrai, continua a valer a pena ler os percursos abaixo.",
      },
    ],
  },

  amazon: {
    PLACEMENT_SHAPE: [
      { title: "Nove semanas", text: "Juntas-te a uma equipa, aprendes as ferramentas e fazes trabalho real." },
      { title: "Centros de competências", text: "Uma parte decorre nos centros de competências (skills hubs) da Amazon, em blocos de 15 dias." },
      { title: "Projetos de grupo", text: "Trabalhas com outros estudantes em projetos para instituições de solidariedade." },
      { title: "Desafios de equipa", text: "Tarefas definidas pela tua equipa que usam as competências do teu T-Level." },
    ],
    SUPPORT: [
      { title: "Um colega de apoio (buddy)", text: "Para as perguntas pequenas." },
      { title: "Um mentor", text: "Orienta o teu trabalho e mostra-te o panorama geral." },
      { title: "Um gestor de estágio", text: "Mantém o estágio no caminho certo com a tua escola ou college." },
    ],
    ROUTE_IN: [
      { title: "Começa um T-Level", text: "Para jovens dos 16 aos 18 anos que já frequentam um T-Level." },
      {
        title: "O teu college entra em contacto",
        text: "A Amazon organiza os estágios com escolas e colleges, não diretamente com os estudantes.",
      },
      { title: "Regista o teu interesse", text: "Diz-nos o teu percurso e passamos à Amazon. Não é uma candidatura." },
    ],
    GROWTH: [
      { caption: "estudantes no primeiro ano" },
      { caption: "estudantes, quatro vezes mais" },
      { caption: "estágios previstos" },
    ],
  },

  help: {
    SERVICES: [
      {
        title: "Encontra um T-Level perto de ti",
        text: "Pesquisa por código postal e área.",
        linkText: "Encontrar um T-Level em tlevels.gov.uk",
      },
      {
        title: "Orientação vocacional gratuita",
        text: "Liga 0800 100 900 ou usa o chat online. Para qualquer pessoa a partir dos 13 anos.",
        linkText: "National Careers Service",
      },
      {
        title: "Ajuda com transporte e material",
        text: "A bolsa 16 to 19 Bursary. Candidata-te através da tua escola ou college.",
        linkText: "Orientações do 16 to 19 Bursary Fund",
      },
      {
        title: "Regras do estágio",
        text: "As orientações oficiais sobre o que um estágio tem de incluir.",
        linkText: "Orientações sobre estágios",
      },
    ],
    PROVIDER_QUESTIONS: [
      "Que T-Levels e especializações têm?",
      "São vocês que encontram o meu estágio, ou sou eu?",
      "Que empresas já receberam os vossos estudantes?",
      "O estágio é em bloco, um dia por semana, ou uma mistura?",
      "Quais são os vossos requisitos de entrada?",
      "Que apoio existe se eu tiver necessidades especiais?",
    ],
    SITE_ROUTES: [
      { label: "O que é um T-Level?", detail: "Sobre os T-Levels" },
      { label: "Quero ver todas as áreas", detail: "Todos os T-Levels" },
      { label: "Como é um estágio na Amazon?", detail: "T-Levels na Amazon" },
      { label: "Quero guias e materiais", detail: "Recursos de T-Level" },
      { label: "Quero registar o meu interesse", detail: "Registar interesse" },
      { label: "Já tenho uma conta", detail: "Iniciar sessão" },
    ],
  },

  interest: {
    NEXT_STEPS: [
      { text: "Dizes-nos o teu percurso. Demora cerca de um minuto." },
      { text: "A equipa Amazon Emerging Talent consegue ver quem está interessado." },
      { text: "Os estágios são organizados com a tua escola ou college, por isso podem contactá-los." },
    ],
    WHY_WE_ASK:
      "Só pedimos o que a equipa Amazon Emerging Talent precisa para saber que tens interesse. Nada de morada, data de nascimento ou escola.",
  },

  quiz: {
    KNOWLEDGE_QUESTIONS: [
      {
        question: "Quanto tempo dura um estágio de T-Level numa empresa?",
        options: ["Pelo menos 315 horas, cerca de 45 dias", "Duas semanas", "Um ano inteiro", "Não há estágio"],
        correctAnswer: "Pelo menos 315 horas, cerca de 45 dias",
        explanation: "Pelo menos 315 horas, cerca de 45 dias. A Amazon faz os seus estágios num bloco de nove semanas.",
      },
      {
        question: "Um T-Level tem mais ou menos o tamanho de quantos A levels?",
        options: ["Um", "Dois", "Três", "Cinco"],
        correctAnswer: "Três",
        explanation: "Três. Um T-Level também dá pontos UCAS, por isso a universidade continua em aberto para ti.",
      },
      {
        question: "Qual é a principal diferença entre um T-Level e uma aprendizagem (apprenticeship)?",
        options: [
          "Um T-Level é sobretudo estudo, uma aprendizagem é sobretudo trabalho pago",
          "São a mesma coisa",
          "Um T-Level é sobretudo trabalho pago, uma aprendizagem é sobretudo estudo",
          "Só a aprendizagem inclui tempo numa empresa",
        ],
        correctAnswer: "Um T-Level é sobretudo estudo, uma aprendizagem é sobretudo trabalho pago",
        explanation:
          "É ao contrário. Um T-Level é cerca de 80 por cento estudo, e um estágio numa empresa de pelo menos 315 horas completa o resto.",
      },
      {
        question: "Que percurso inclui o T-Level de Digital Software Development?",
        options: ["Digital", "Negócios", "Engenharia", "Media"],
        correctAnswer: "Digital",
        explanation: "Digital. Também inclui Digital Data Analytics e Digital Support and Security.",
      },
      {
        question: "Que percurso inclui o T-Level de Management and Administration?",
        options: ["Negócios", "Finanças", "Media", "Digital"],
        correctAnswer: "Negócios",
        explanation: "Negócios. O resumo no site é manter equipas e operações a funcionar.",
      },
      {
        question: "Quem cuida de ti num estágio na Amazon?",
        options: [
          "Um colega de apoio (buddy), um mentor e um gestor de estágio",
          "Ninguém, trabalhas sozinho",
          "Só o teu professor",
          "Um gestor diferente todos os dias",
        ],
        correctAnswer: "Um colega de apoio (buddy), um mentor e um gestor de estágio",
        explanation:
          "Todos os estudantes têm um colega de apoio (buddy), um mentor e um gestor de estágio, por isso há sempre alguém a quem perguntar.",
      },
      {
        question: "Precisas de uma conta para usar a biblioteca de recursos do T-SMILE?",
        options: [
          "Não, mas alguns recursos precisam de uma conta gratuita para abrir",
          "Sim, para tudo",
          "Não, está tudo aberto a toda a gente",
          "Só se fores professor",
        ],
        correctAnswer: "Não, está tudo aberto a toda a gente",
        explanation:
          "Qualquer pessoa pode navegar na biblioteca e abrir tudo o que lá está. Uma conta gratuita serve para perguntar e responder na Comunidade e guardar as tuas definições.",
      },
    ],
  },
  legal: {
    TERMS: {
      label: "Informação legal",
      title: "Termos de Serviço",
      updated: "setembro de 2026",
      intro: "O T-SMILE é um projeto de estudantes, feito para o programa Amazon Emerging Talent Digital T-Level. Não é um site oficial da Amazon.",
      sections: [
        {
          heading: "Usar o site",
          paragraphs: [
            "Qualquer pessoa pode ler todas as páginas, abrir todos os recursos, fazer os questionários e falar com o Smiley sem conta. Uma conta gratuita permite perguntar e responder na Comunidade.",
            "Tens de ter 16 anos ou mais para criar uma conta.",
          ],
        },
        {
          heading: "A tua conta",
          points: [
            "Não partilhes a tua palavra-passe.",
            "Dá dados verdadeiros quando criares conta ou registares o teu interesse.",
            "Podes desativar a tua conta a qualquer momento no teu Perfil.",
          ],
        },
        {
          heading: "Sê simpático",
          points: [
            "Não publiques nada ofensivo, que magoe ou ilegal nos formulários, no chat ou na Comunidade.",
            "Não tentes estragar o site nem aceder aos dados de outras pessoas.",
            "Podemos desativar contas que não cumpram estas regras.",
          ],
        },
        {
          heading: "A nossa informação",
          paragraphs: [
            "Confirmamos os factos no gov.uk, na UCAS e na Amazon, e indicamos as fontes em cada página. As coisas mudam, por isso confirma sempre com a tua escola ou colégio antes de decidires.",
            "O Smiley, o assistente, pode enganar-se. É uma ajuda, não um conselho.",
          ],
        },
        {
          heading: "O nome da Amazon",
          paragraphs: [
            "«Amazon» e o seu logótipo pertencem à Amazon.com, Inc. ou às suas afiliadas. Usamo-los para descrever os estágios de T-Level da Amazon.",
          ],
        },
      ],
    },
    PRIVACY: {
      label: "Informação legal",
      title: "Política de Privacidade",
      updated: "setembro de 2026",
      intro: "O T-SMILE é um projeto de estudantes, feito para o programa Amazon Emerging Talent Digital T-Level. Não é um site oficial da Amazon.",
      sections: [
        {
          heading: "Quem cuida dos teus dados",
          paragraphs: [
            "A equipa de estudantes do T-SMILE. Podes contactar-nos através da página Contacto.",
          ],
        },
        {
          heading: "O que recolhemos, e porquê",
          points: [
            "Registar interesse: o teu nome, email, se és estudante, pai, mãe ou professor, um percurso e uma mensagem opcional. Para que a equipa Amazon Emerging Talent veja que tens interesse e entre em contacto.",
            "Uma conta: um nome de utilizador, uma palavra-passe (guardada cifrada, nunca legível), o teu papel e percurso. Mais tarde, se os adicionares, o teu nome, email e número de telefone. Para poderes iniciar sessão, perguntar e responder na Comunidade e manter as tuas definições em qualquer dispositivo.",
            "Definições de acessibilidade: tamanho do texto, contraste, tema e escolhas semelhantes. Para que o site fique como o configuraste.",
            "Chat com o Smiley: as perguntas que o Smiley tem de consultar e as respostas dele. Para o Smiley conseguir acompanhar a conversa. As perguntas a que responde sozinho ficam no teu navegador.",
            "Publicações na Comunidade: as perguntas e respostas que publicas, mostradas com o teu nome de utilizador. Para que outros visitantes as possam ler e responder.",
            "Opiniões e mensagens de contacto: a tua mensagem e o teu email, se o deres. Para podermos corrigir coisas e responder.",
          ],
        },
        {
          heading: "Quem os vê",
          points: [
            "A equipa do T-SMILE e, nos formulários de interesse, a equipa da Amazon Emerging Talent.",
            "A Anthropic, a empresa cuja IA escreve algumas das respostas do Smiley. As perguntas a que o Smiley não consegue responder sozinho são-lhe enviadas para obter uma resposta.",
            "A empresa que aloja o site (Railway para a versão de teste, Amazon Web Services mais tarde).",
            "Mais ninguém. Não vendemos dados nem os usamos para publicidade.",
          ],
        },
        {
          heading: "Durante quanto tempo os guardamos",
          paragraphs: [
            "Ainda não definimos isto, e vamos fazê-lo antes de o site ficar público. Até lá, pede-nos e apagamos os teus dados.",
          ],
        },
        {
          heading: "Menores de 18 anos",
          paragraphs: [
            "Muitos dos nossos visitantes têm menos de 18 anos, por isso só pedimos o que precisamos. Nunca pedimos a tua morada, data de nascimento ou escola num formulário.",
          ],
        },
        {
          heading: "Os teus direitos",
          paragraphs: [
            "Podes ver, corrigir ou apagar os teus dados, e mais. A página dos Direitos sobre os dados explica como.",
          ],
        },
      ],
    },
    COOKIES: {
      label: "Informação legal",
      title: "Política de Cookies",
      updated: "setembro de 2026",
      intro: "Só usamos os cookies de que o site precisa para funcionar. Sem rastreio, sem publicidade, sem análises.",
      sections: [
        {
          heading: "Cookies",
          points: [
            "sessionid: mantém a tua sessão iniciada e deixa o Smiley lembrar-se do teu chat. Dura duas semanas, ou até terminares a sessão.",
            "csrftoken: impede outros sites de enviarem formulários em teu nome. Dura até um ano.",
          ],
          paragraphs: [
            "O site não funciona em segurança sem eles, por isso a lei não nos pede um aviso de cookies.",
          ],
        },
        {
          heading: "Guardado no teu navegador",
          paragraphs: [
            "Estes não são cookies e nunca saem do teu dispositivo.",
          ],
          points: [
            "As tuas definições de acessibilidade e o idioma que escolheste, para se manterem quando voltares.",
            "Se o Smiley já disse olá, até fechares o separador.",
          ],
        },
        {
          heading: "Apagá-los",
          paragraphs: [
            "Podes apagar os cookies e os dados guardados nas definições do navegador. A tua sessão termina e as tuas definições voltam ao normal.",
          ],
        },
      ],
    },
    DATA_RIGHTS: {
      label: "Informação legal",
      title: "RGPD e os teus direitos sobre os dados",
      updated: "setembro de 2026",
      intro: "A lei do Reino Unido (UK GDPR) dá-te direitos sobre os teus dados. Usá-los é gratuito.",
      sections: [
        {
          heading: "Os teus direitos",
          points: [
            "Ver: pede uma cópia dos dados que temos sobre ti.",
            "Corrigir: pede-nos para corrigir o que estiver errado.",
            "Apagar: pede-nos para eliminar os teus dados.",
            "Limitar: pede-nos para deixar de os usar durante algum tempo.",
            "Levar: pede os teus dados num ficheiro que possas usar noutro lado.",
            "Opor-te: diz-nos para deixarmos de os usar.",
          ],
        },
        {
          heading: "Como pedir",
          paragraphs: [
            "Usa o formulário de Contacto e diz que direito queres usar. Podemos pedir-te que confirmes que és tu. Respondemos no prazo de um mês.",
            "Também podes corrigir os teus dados, ou desativar a tua conta, tu mesmo no teu Perfil.",
          ],
        },
        {
          heading: "Não estás satisfeito?",
          paragraphs: [
            "Podes apresentar queixa ao Information Commissioner's Office (ICO), que trata da proteção de dados no Reino Unido.",
          ],
          link: {
            text: "Apresentar queixa ao ICO",
          },
        },
      ],
    },
  },
};
