import { DEFAULT_LOCALE, isValidLocale, type AppLocale } from "@/lib/i18n/locales";

const SUPPORT_EMAIL = "info@algarveofficial.com";

export interface CookiePolicySection {
  id: string;
  title: string;
  icon: string;
  content: string;
}

export interface CookiePolicyContent {
  pageTitle: string;
  introduction: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  lastUpdated: string;
  metaDescription: string;
  sections: CookiePolicySection[];
}

interface LabelledText {
  label: string;
  text: string;
}

interface CookiePolicyCopy {
  pageTitle: string;
  introduction: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  metaDescription: string;
  labels: {
    type: string;
    purpose: string;
    duration: string;
    email: string;
  };
  sections: {
    whatAreCookies: {
      title: string;
      paragraphs: string[];
    };
    types: {
      title: string;
      rows: Array<[string, string, string]>;
    };
    essential: {
      title: string;
      body: string;
      items: string[];
      note: string;
    };
    analytics: {
      title: string;
      paragraphs: string[];
      dataTitle: string;
      dataItems: string[];
    };
    managing: {
      title: string;
      body: string;
      items: LabelledText[];
      note: string;
    };
    contact: {
      title: string;
      body: string;
    };
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function paragraph(text: string): string {
  return `<p>${escapeHtml(text)}</p>`;
}

function paragraphs(items: string[]): string {
  return items.map((item) => paragraph(item)).join("");
}

function simpleList(items: string[], className = "list-disc pl-5 space-y-2"): string {
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function labelledList(items: LabelledText[]): string {
  return `<ul class="list-disc pl-5 space-y-2">${items
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.text)}</li>`,
    )
    .join("")}</ul>`;
}

function threeColumnTable(
  headers: [string, string, string],
  rows: Array<[string, string, string]>,
): string {
  return `<div class="bg-card border border-border rounded-lg overflow-hidden"><table class="w-full text-sm"><thead class="bg-muted/50"><tr><th class="text-left p-3 font-semibold text-foreground">${escapeHtml(headers[0])}</th><th class="text-left p-3 font-semibold text-foreground">${escapeHtml(headers[1])}</th><th class="text-left p-3 font-semibold text-foreground">${escapeHtml(headers[2])}</th></tr></thead><tbody>${rows
    .map(
      ([type, purpose, duration]) =>
        `<tr class="border-t border-border"><td class="p-3 font-medium">${escapeHtml(type)}</td><td class="p-3">${escapeHtml(purpose)}</td><td class="p-3">${escapeHtml(duration)}</td></tr>`,
    )
    .join("")}</tbody></table></div>`;
}

function noteBox(text: string, className = "bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4"): string {
  return `<div class="${className}"><p class="text-sm">${escapeHtml(text)}</p></div>`;
}

function dataBox(title: string, items: string[]): string {
  return `<div class="bg-muted/50 border border-border rounded-lg p-4"><p class="text-sm font-medium text-foreground mb-2">${escapeHtml(title)}</p>${simpleList(items, "list-disc pl-5 space-y-1 text-sm")}</div>`;
}

function detailCard(label: string, value: string): string {
  return `<div class="bg-card border border-border rounded-lg p-4"><p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p></div>`;
}

function buildSections(copy: CookiePolicyCopy): CookiePolicySection[] {
  const { labels, sections } = copy;

  return [
    {
      id: "what-are-cookies",
      title: sections.whatAreCookies.title,
      icon: "Cookie",
      content: paragraphs(sections.whatAreCookies.paragraphs),
    },
    {
      id: "types-of-cookies",
      title: sections.types.title,
      icon: "Database",
      content: threeColumnTable(
        [labels.type, labels.purpose, labels.duration],
        sections.types.rows,
      ),
    },
    {
      id: "essential-cookies",
      title: sections.essential.title,
      icon: "Shield",
      content: [
        paragraph(sections.essential.body),
        simpleList(sections.essential.items),
        noteBox(sections.essential.note),
      ].join(""),
    },
    {
      id: "analytics-cookies",
      title: sections.analytics.title,
      icon: "Info",
      content: [
        paragraphs(sections.analytics.paragraphs),
        dataBox(sections.analytics.dataTitle, sections.analytics.dataItems),
      ].join(""),
    },
    {
      id: "managing-cookie-preferences",
      title: sections.managing.title,
      icon: "Settings",
      content: [
        paragraph(sections.managing.body),
        labelledList(sections.managing.items),
        paragraph(sections.managing.note),
      ].join(""),
    },
    {
      id: "contact-us",
      title: sections.contact.title,
      icon: "Globe",
      content: [paragraph(sections.contact.body), detailCard(labels.email, SUPPORT_EMAIL)].join(""),
    },
  ];
}

function buildCookiePolicyContent(copy: CookiePolicyCopy): CookiePolicyContent {
  return {
    pageTitle: copy.pageTitle,
    introduction: copy.introduction,
    lastUpdatedLabel: copy.lastUpdatedLabel,
    lastUpdatedDate: copy.lastUpdatedDate,
    lastUpdated: `${copy.lastUpdatedLabel}: ${copy.lastUpdatedDate}`,
    metaDescription: copy.metaDescription,
    sections: buildSections(copy),
  };
}

const COOKIE_COPY = {
  en: {
    pageTitle: "Cookie Policy",
    introduction:
      "This Cookie Policy explains how AlgarveOfficial uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are, why we use them, and your rights to control our use of them.",
    lastUpdatedLabel: "Last updated",
    lastUpdatedDate: "January 21, 2026",
    metaDescription:
      "Read how AlgarveOfficial uses cookies and similar technologies, and how you can manage your preferences.",
    labels: {
      type: "Type",
      purpose: "Purpose",
      duration: "Duration",
      email: "Email",
    },
    sections: {
      whatAreCookies: {
        title: "1. What Are Cookies",
        paragraphs: [
          "Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.",
          "Cookies set by the website owner (in this case, AlgarveOfficial) are called \"first-party cookies.\" Cookies set by parties other than the website owner are called \"third-party cookies.\"",
        ],
      },
      types: {
        title: "2. Types of Cookies We Use",
        rows: [
          ["Essential", "Authentication, security, language preferences", "Session / 1 year"],
          ["Functional", "Theme preferences, user settings", "1 year"],
          ["Analytics", "Page views, session tracking (with consent)", "90 days"],
        ],
      },
      essential: {
        title: "3. Essential Cookies",
        body: "These cookies are strictly necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as:",
        items: [
          "Setting your privacy preferences",
          "Logging in to your account",
          "Filling in forms",
          "Maintaining security",
        ],
        note: "You can set your browser to block or alert you about these cookies, but some parts of the site will not function properly without them.",
      },
      analytics: {
        title: "4. Analytics Cookies",
        paragraphs: [
          "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site.",
          "All information these cookies collect is aggregated and anonymous. We only set these cookies after you have given us your explicit consent through our cookie consent banner.",
        ],
        dataTitle: "Data we collect with your consent:",
        dataItems: [
          "Pages visited and time spent",
          "Anonymized IP address (last two octets masked)",
          "Browser and device type",
          "Referral source",
        ],
      },
      managing: {
        title: "5. Managing Your Cookie Preferences",
        body: "You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by:",
        items: [
          { label: "Cookie Consent Banner", text: "When you first visit our site, you can accept or reject non-essential cookies" },
          { label: "Browser Settings", text: "You can set your browser to refuse all or some cookies" },
          { label: "Local Storage", text: "Clear your browser's local storage to reset your preferences" },
        ],
        note: "Please note that if you choose to reject cookies, you may still use our website though your access to some functionality and areas may be restricted.",
      },
      contact: {
        title: "6. Contact Us",
        body: "If you have any questions about our use of cookies, please contact us:",
      },
    },
  },
  "pt-pt": {
    pageTitle: "Política de Cookies",
    introduction:
      "Esta Política de Cookies explica como a AlgarveOfficial utiliza cookies e tecnologias semelhantes para o reconhecer quando visita o nosso website. Explica o que são estas tecnologias, por que as utilizamos e os seus direitos para controlar a nossa utilização das mesmas.",
    lastUpdatedLabel: "Última atualização",
    lastUpdatedDate: "21 de janeiro de 2026",
    metaDescription:
      "Saiba como a AlgarveOfficial utiliza cookies e tecnologias semelhantes, e como pode gerir as suas preferências.",
    labels: {
      type: "Tipo",
      purpose: "Finalidade",
      duration: "Duração",
      email: "Email",
    },
    sections: {
      whatAreCookies: {
        title: "1. O Que São Cookies",
        paragraphs: [
          "Cookies são pequenos ficheiros de dados colocados no seu computador ou dispositivo móvel quando visita um website. São amplamente utilizados pelos proprietários de websites para fazer com que os seus sites funcionem, ou funcionem de forma mais eficiente, bem como para fornecer informações de relatório.",
          "Os cookies definidos pelo proprietário do website (neste caso, a AlgarveOfficial) são chamados \"cookies próprios\". Os cookies definidos por entidades que não o proprietário do website são chamados \"cookies de terceiros\".",
        ],
      },
      types: {
        title: "2. Tipos de Cookies que Utilizamos",
        rows: [
          ["Essenciais", "Autenticação, segurança, preferências de idioma", "Sessão / 1 ano"],
          ["Funcionais", "Preferências de tema, definições do utilizador", "1 ano"],
          ["Analíticos", "Visualizações de páginas, rastreamento de sessão (com consentimento)", "90 dias"],
        ],
      },
      essential: {
        title: "3. Cookies Essenciais",
        body: "Estes cookies são estritamente necessários para o funcionamento do website e não podem ser desativados nos nossos sistemas. Normalmente são definidos apenas em resposta a ações suas que correspondem a um pedido de serviços, tais como:",
        items: [
          "Definir as suas preferências de privacidade",
          "Iniciar sessão na sua conta",
          "Preencher formulários",
          "Manter a segurança",
        ],
        note: "Pode configurar o seu navegador para bloquear ou alertá-lo sobre estes cookies, mas algumas partes do site não funcionarão corretamente sem eles.",
      },
      analytics: {
        title: "4. Cookies Analíticos",
        paragraphs: [
          "Estes cookies permitem-nos contar visitas e fontes de tráfego para medir e melhorar o desempenho do nosso site. Ajudam-nos a saber quais são as páginas mais e menos populares e a ver como os visitantes se movem pelo site.",
          "Todas as informações recolhidas por estes cookies são agregadas e anónimas. Só definimos estes cookies depois de nos dar o seu consentimento explícito através da nossa faixa de consentimento de cookies.",
        ],
        dataTitle: "Dados que recolhemos com o seu consentimento:",
        dataItems: [
          "Páginas visitadas e tempo despendido",
          "Endereço IP anonimizado (os dois últimos octetos são mascarados)",
          "Tipo de navegador e dispositivo",
          "Fonte de referência",
        ],
      },
      managing: {
        title: "5. Gerir as Suas Preferências de Cookies",
        body: "Tem o direito de decidir se aceita ou rejeita cookies. Pode exercer as suas preferências de cookies através de:",
        items: [
          { label: "Faixa de consentimento de cookies", text: "Quando visita o nosso site pela primeira vez, pode aceitar ou rejeitar cookies não essenciais" },
          { label: "Definições do navegador", text: "Pode configurar o seu navegador para recusar todos ou alguns cookies" },
          { label: "Armazenamento local", text: "Limpe o armazenamento local do seu navegador para repor as suas preferências" },
        ],
        note: "Tenha em atenção que, se optar por rejeitar cookies, poderá continuar a utilizar o nosso website, embora o acesso a algumas funcionalidades e áreas possa ficar limitado.",
      },
      contact: {
        title: "6. Contacte-nos",
        body: "Se tiver alguma questão sobre a nossa utilização de cookies, contacte-nos:",
      },
    },
  },
  fr: {
    pageTitle: "Politique relative aux cookies",
    introduction:
      "Cette Politique relative aux cookies explique comment AlgarveOfficial utilise des cookies et technologies similaires pour vous reconnaître lorsque vous visitez notre site web. Elle explique ce que sont ces technologies, pourquoi nous les utilisons et vos droits pour contrôler leur utilisation.",
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdatedDate: "21 janvier 2026",
    metaDescription:
      "Découvrez comment AlgarveOfficial utilise les cookies et technologies similaires, et comment gérer vos préférences.",
    labels: {
      type: "Type",
      purpose: "Finalité",
      duration: "Durée",
      email: "E-mail",
    },
    sections: {
      whatAreCookies: {
        title: "1. Que sont les cookies",
        paragraphs: [
          "Les cookies sont de petits fichiers de données placés sur votre ordinateur ou appareil mobile lorsque vous visitez un site web. Ils sont largement utilisés par les propriétaires de sites pour faire fonctionner leurs sites, les rendre plus efficaces et fournir des informations de reporting.",
          "Les cookies définis par le propriétaire du site web (dans ce cas, AlgarveOfficial) sont appelés \"cookies internes\". Les cookies définis par des parties autres que le propriétaire du site sont appelés \"cookies tiers\".",
        ],
      },
      types: {
        title: "2. Types de cookies que nous utilisons",
        rows: [
          ["Essentiels", "Authentification, sécurité, préférences linguistiques", "Session / 1 an"],
          ["Fonctionnels", "Préférences de thème, paramètres utilisateur", "1 an"],
          ["Analytiques", "Pages vues, suivi de session (avec consentement)", "90 jours"],
        ],
      },
      essential: {
        title: "3. Cookies essentiels",
        body: "Ces cookies sont strictement nécessaires au fonctionnement du site web et ne peuvent pas être désactivés dans nos systèmes. Ils sont généralement définis uniquement en réponse à des actions de votre part correspondant à une demande de services, telles que :",
        items: [
          "Définir vos préférences de confidentialité",
          "Vous connecter à votre compte",
          "Remplir des formulaires",
          "Maintenir la sécurité",
        ],
        note: "Vous pouvez configurer votre navigateur pour bloquer ces cookies ou vous en avertir, mais certaines parties du site ne fonctionneront pas correctement sans eux.",
      },
      analytics: {
        title: "4. Cookies analytiques",
        paragraphs: [
          "Ces cookies nous permettent de compter les visites et les sources de trafic afin de mesurer et d'améliorer les performances de notre site. Ils nous aident à savoir quelles pages sont les plus et les moins populaires et à comprendre comment les visiteurs naviguent sur le site.",
          "Toutes les informations collectées par ces cookies sont agrégées et anonymes. Nous ne les définissons qu'après avoir reçu votre consentement explicite via notre bannière de consentement aux cookies.",
        ],
        dataTitle: "Données que nous collectons avec votre consentement :",
        dataItems: [
          "Pages visitées et temps passé",
          "Adresse IP anonymisée (les deux derniers octets sont masqués)",
          "Type de navigateur et d'appareil",
          "Source de référence",
        ],
      },
      managing: {
        title: "5. Gérer vos préférences de cookies",
        body: "Vous avez le droit de décider d'accepter ou de refuser les cookies. Vous pouvez exercer vos préférences de cookies par :",
        items: [
          { label: "Bannière de consentement aux cookies", text: "Lors de votre première visite, vous pouvez accepter ou refuser les cookies non essentiels" },
          { label: "Paramètres du navigateur", text: "Vous pouvez configurer votre navigateur pour refuser tout ou partie des cookies" },
          { label: "Stockage local", text: "Effacez le stockage local de votre navigateur pour réinitialiser vos préférences" },
        ],
        note: "Veuillez noter que si vous choisissez de refuser les cookies, vous pourrez toujours utiliser notre site web, mais l'accès à certaines fonctionnalités et zones pourra être limité.",
      },
      contact: {
        title: "6. Nous contacter",
        body: "Si vous avez des questions concernant notre utilisation des cookies, veuillez nous contacter :",
      },
    },
  },
  de: {
    pageTitle: "Cookie-Richtlinie",
    introduction:
      "Diese Cookie-Richtlinie erklärt, wie AlgarveOfficial Cookies und ähnliche Technologien verwendet, um Sie zu erkennen, wenn Sie unsere Website besuchen. Sie erläutert, was diese Technologien sind, warum wir sie verwenden und welche Rechte Sie haben, ihre Nutzung zu steuern.",
    lastUpdatedLabel: "Zuletzt aktualisiert",
    lastUpdatedDate: "21. Januar 2026",
    metaDescription:
      "Erfahren Sie, wie AlgarveOfficial Cookies und ähnliche Technologien verwendet und wie Sie Ihre Einstellungen verwalten können.",
    labels: {
      type: "Art",
      purpose: "Zweck",
      duration: "Dauer",
      email: "E-Mail",
    },
    sections: {
      whatAreCookies: {
        title: "1. Was sind Cookies",
        paragraphs: [
          "Cookies sind kleine Datendateien, die auf Ihrem Computer oder Mobilgerät abgelegt werden, wenn Sie eine Website besuchen. Sie werden von Website-Betreibern häufig verwendet, damit Websites funktionieren, effizienter arbeiten und Berichtsinformationen bereitstellen können.",
          "Cookies, die vom Website-Betreiber gesetzt werden (in diesem Fall AlgarveOfficial), heißen \"First-Party-Cookies\". Cookies, die von anderen Parteien als dem Website-Betreiber gesetzt werden, heißen \"Drittanbieter-Cookies\".",
        ],
      },
      types: {
        title: "2. Arten von Cookies, die wir verwenden",
        rows: [
          ["Erforderlich", "Authentifizierung, Sicherheit, Spracheinstellungen", "Sitzung / 1 Jahr"],
          ["Funktional", "Theme-Präferenzen, Benutzereinstellungen", "1 Jahr"],
          ["Analyse", "Seitenaufrufe, Sitzungsverfolgung (mit Einwilligung)", "90 Tage"],
        ],
      },
      essential: {
        title: "3. Erforderliche Cookies",
        body: "Diese Cookies sind für das Funktionieren der Website unbedingt erforderlich und können in unseren Systemen nicht deaktiviert werden. Sie werden normalerweise nur als Reaktion auf Aktionen gesetzt, die einer Dienstanfrage entsprechen, zum Beispiel:",
        items: [
          "Festlegen Ihrer Datenschutzeinstellungen",
          "Einloggen in Ihr Konto",
          "Ausfüllen von Formularen",
          "Aufrechterhaltung der Sicherheit",
        ],
        note: "Sie können Ihren Browser so einstellen, dass diese Cookies blockiert werden oder Sie darüber informiert werden, aber einige Teile der Website funktionieren ohne sie nicht richtig.",
      },
      analytics: {
        title: "4. Analyse-Cookies",
        paragraphs: [
          "Diese Cookies ermöglichen es uns, Besuche und Traffic-Quellen zu zählen, damit wir die Leistung unserer Website messen und verbessern können. Sie helfen uns zu erkennen, welche Seiten am beliebtesten oder am wenigsten beliebt sind und wie Besucher sich auf der Website bewegen.",
          "Alle von diesen Cookies erfassten Informationen sind aggregiert und anonym. Wir setzen diese Cookies erst, nachdem Sie uns über unser Cookie-Einwilligungsbanner Ihre ausdrückliche Einwilligung gegeben haben.",
        ],
        dataTitle: "Daten, die wir mit Ihrer Einwilligung erfassen:",
        dataItems: [
          "Besuchte Seiten und Verweildauer",
          "Anonymisierte IP-Adresse (die letzten zwei Oktette werden maskiert)",
          "Browser- und Gerätetyp",
          "Verweisquelle",
        ],
      },
      managing: {
        title: "5. Verwaltung Ihrer Cookie-Einstellungen",
        body: "Sie haben das Recht zu entscheiden, ob Sie Cookies akzeptieren oder ablehnen. Sie können Ihre Cookie-Einstellungen ausüben über:",
        items: [
          { label: "Cookie-Einwilligungsbanner", text: "Wenn Sie unsere Website zum ersten Mal besuchen, können Sie nicht erforderliche Cookies akzeptieren oder ablehnen" },
          { label: "Browsereinstellungen", text: "Sie können Ihren Browser so einstellen, dass alle oder einige Cookies abgelehnt werden" },
          { label: "Lokaler Speicher", text: "Löschen Sie den lokalen Speicher Ihres Browsers, um Ihre Einstellungen zurückzusetzen" },
        ],
        note: "Bitte beachten Sie, dass Sie unsere Website auch dann nutzen können, wenn Sie Cookies ablehnen, wobei der Zugriff auf einige Funktionen und Bereiche eingeschränkt sein kann.",
      },
      contact: {
        title: "6. Kontakt",
        body: "Wenn Sie Fragen zu unserer Verwendung von Cookies haben, kontaktieren Sie uns bitte:",
      },
    },
  },
  es: {
    pageTitle: "Política de cookies",
    introduction:
      "Esta Política de cookies explica cómo AlgarveOfficial utiliza cookies y tecnologías similares para reconocerle cuando visita nuestro sitio web. Explica qué son estas tecnologías, por qué las utilizamos y sus derechos para controlar nuestro uso de ellas.",
    lastUpdatedLabel: "Última actualización",
    lastUpdatedDate: "21 de enero de 2026",
    metaDescription:
      "Lea cómo AlgarveOfficial utiliza cookies y tecnologías similares, y cómo puede gestionar sus preferencias.",
    labels: {
      type: "Tipo",
      purpose: "Finalidad",
      duration: "Duración",
      email: "Correo electrónico",
    },
    sections: {
      whatAreCookies: {
        title: "1. Qué son las cookies",
        paragraphs: [
          "Las cookies son pequeños archivos de datos que se colocan en su ordenador o dispositivo móvil cuando visita un sitio web. Los propietarios de sitios web las utilizan ampliamente para hacer que sus sitios funcionen, funcionen de forma más eficiente y proporcionen información de informes.",
          "Las cookies establecidas por el propietario del sitio web (en este caso, AlgarveOfficial) se denominan \"cookies propias\". Las cookies establecidas por terceros distintos del propietario del sitio web se denominan \"cookies de terceros\".",
        ],
      },
      types: {
        title: "2. Tipos de cookies que utilizamos",
        rows: [
          ["Esenciales", "Autenticación, seguridad, preferencias de idioma", "Sesión / 1 año"],
          ["Funcionales", "Preferencias de tema, configuración del usuario", "1 año"],
          ["Analíticas", "Vistas de página, seguimiento de sesión (con consentimiento)", "90 días"],
        ],
      },
      essential: {
        title: "3. Cookies esenciales",
        body: "Estas cookies son estrictamente necesarias para que el sitio web funcione y no pueden desactivarse en nuestros sistemas. Normalmente solo se establecen en respuesta a acciones realizadas por usted que equivalen a una solicitud de servicios, como:",
        items: [
          "Configurar sus preferencias de privacidad",
          "Iniciar sesión en su cuenta",
          "Rellenar formularios",
          "Mantener la seguridad",
        ],
        note: "Puede configurar su navegador para bloquear estas cookies o avisarle sobre ellas, pero algunas partes del sitio no funcionarán correctamente sin ellas.",
      },
      analytics: {
        title: "4. Cookies analíticas",
        paragraphs: [
          "Estas cookies nos permiten contar visitas y fuentes de tráfico para medir y mejorar el rendimiento de nuestro sitio. Nos ayudan a saber qué páginas son las más y menos populares y cómo se mueven los visitantes por el sitio.",
          "Toda la información que recopilan estas cookies es agregada y anónima. Solo las establecemos después de que nos haya dado su consentimiento explícito mediante nuestro banner de consentimiento de cookies.",
        ],
        dataTitle: "Datos que recopilamos con su consentimiento:",
        dataItems: [
          "Páginas visitadas y tiempo empleado",
          "Dirección IP anonimizada (los dos últimos octetos se enmascaran)",
          "Tipo de navegador y dispositivo",
          "Fuente de referencia",
        ],
      },
      managing: {
        title: "5. Gestión de sus preferencias de cookies",
        body: "Tiene derecho a decidir si acepta o rechaza cookies. Puede ejercer sus preferencias de cookies mediante:",
        items: [
          { label: "Banner de consentimiento de cookies", text: "Cuando visita nuestro sitio por primera vez, puede aceptar o rechazar cookies no esenciales" },
          { label: "Configuración del navegador", text: "Puede configurar su navegador para rechazar todas o algunas cookies" },
          { label: "Almacenamiento local", text: "Borre el almacenamiento local de su navegador para restablecer sus preferencias" },
        ],
        note: "Tenga en cuenta que si decide rechazar cookies, aún podrá utilizar nuestro sitio web, aunque el acceso a algunas funcionalidades y áreas puede verse restringido.",
      },
      contact: {
        title: "6. Contacto",
        body: "Si tiene alguna pregunta sobre nuestro uso de cookies, contáctenos:",
      },
    },
  },
  it: {
    pageTitle: "Informativa sui cookie",
    introduction:
      "Questa Informativa sui cookie spiega come AlgarveOfficial utilizza cookie e tecnologie simili per riconoscerti quando visiti il nostro sito web. Spiega cosa sono queste tecnologie, perché le utilizziamo e i tuoi diritti per controllarne l'uso.",
    lastUpdatedLabel: "Ultimo aggiornamento",
    lastUpdatedDate: "21 gennaio 2026",
    metaDescription:
      "Scopri come AlgarveOfficial utilizza cookie e tecnologie simili e come puoi gestire le tue preferenze.",
    labels: {
      type: "Tipo",
      purpose: "Finalità",
      duration: "Durata",
      email: "Email",
    },
    sections: {
      whatAreCookies: {
        title: "1. Cosa sono i cookie",
        paragraphs: [
          "I cookie sono piccoli file di dati collocati sul tuo computer o dispositivo mobile quando visiti un sito web. Sono ampiamente utilizzati dai proprietari dei siti per far funzionare i siti, renderli più efficienti e fornire informazioni di reportistica.",
          "I cookie impostati dal proprietario del sito web (in questo caso, AlgarveOfficial) sono chiamati \"cookie di prima parte\". I cookie impostati da soggetti diversi dal proprietario del sito sono chiamati \"cookie di terze parti\".",
        ],
      },
      types: {
        title: "2. Tipi di cookie che utilizziamo",
        rows: [
          ["Essenziali", "Autenticazione, sicurezza, preferenze linguistiche", "Sessione / 1 anno"],
          ["Funzionali", "Preferenze del tema, impostazioni utente", "1 anno"],
          ["Analitici", "Visualizzazioni di pagina, tracciamento della sessione (con consenso)", "90 giorni"],
        ],
      },
      essential: {
        title: "3. Cookie essenziali",
        body: "Questi cookie sono strettamente necessari al funzionamento del sito web e non possono essere disattivati nei nostri sistemi. Di solito vengono impostati solo in risposta ad azioni da te compiute che equivalgono a una richiesta di servizi, come:",
        items: [
          "Impostare le tue preferenze sulla privacy",
          "Accedere al tuo account",
          "Compilare moduli",
          "Mantenere la sicurezza",
        ],
        note: "Puoi impostare il browser per bloccare o avvisarti riguardo a questi cookie, ma alcune parti del sito non funzioneranno correttamente senza di essi.",
      },
      analytics: {
        title: "4. Cookie analitici",
        paragraphs: [
          "Questi cookie ci consentono di contare visite e fonti di traffico per misurare e migliorare le prestazioni del nostro sito. Ci aiutano a sapere quali pagine sono più o meno popolari e a vedere come i visitatori si muovono nel sito.",
          "Tutte le informazioni raccolte da questi cookie sono aggregate e anonime. Impostiamo questi cookie solo dopo che ci hai dato il tuo consenso esplicito tramite il nostro banner di consenso ai cookie.",
        ],
        dataTitle: "Dati che raccogliamo con il tuo consenso:",
        dataItems: [
          "Pagine visitate e tempo trascorso",
          "Indirizzo IP anonimizzato (gli ultimi due ottetti sono mascherati)",
          "Tipo di browser e dispositivo",
          "Fonte di riferimento",
        ],
      },
      managing: {
        title: "5. Gestione delle preferenze sui cookie",
        body: "Hai il diritto di decidere se accettare o rifiutare i cookie. Puoi esercitare le tue preferenze sui cookie tramite:",
        items: [
          { label: "Banner di consenso ai cookie", text: "Quando visiti il nostro sito per la prima volta, puoi accettare o rifiutare i cookie non essenziali" },
          { label: "Impostazioni del browser", text: "Puoi impostare il browser per rifiutare tutti o alcuni cookie" },
          { label: "Archiviazione locale", text: "Cancella l'archiviazione locale del browser per reimpostare le preferenze" },
        ],
        note: "Tieni presente che se scegli di rifiutare i cookie, potrai comunque utilizzare il nostro sito web, anche se l'accesso ad alcune funzionalità e aree potrebbe essere limitato.",
      },
      contact: {
        title: "6. Contattaci",
        body: "Se hai domande sul nostro uso dei cookie, contattaci:",
      },
    },
  },
  nl: {
    pageTitle: "Cookiebeleid",
    introduction:
      "Dit Cookiebeleid legt uit hoe AlgarveOfficial cookies en vergelijkbare technologieën gebruikt om u te herkennen wanneer u onze website bezoekt. Het legt uit wat deze technologieën zijn, waarom wij ze gebruiken en welke rechten u heeft om ons gebruik ervan te beheren.",
    lastUpdatedLabel: "Laatst bijgewerkt",
    lastUpdatedDate: "21 januari 2026",
    metaDescription:
      "Lees hoe AlgarveOfficial cookies en vergelijkbare technologieën gebruikt en hoe u uw voorkeuren kunt beheren.",
    labels: {
      type: "Type",
      purpose: "Doel",
      duration: "Duur",
      email: "E-mail",
    },
    sections: {
      whatAreCookies: {
        title: "1. Wat zijn cookies",
        paragraphs: [
          "Cookies zijn kleine gegevensbestanden die op uw computer of mobiele apparaat worden geplaatst wanneer u een website bezoekt. Website-eigenaren gebruiken cookies veel om hun websites te laten werken, efficiënter te laten werken en rapportage-informatie te leveren.",
          "Cookies die door de eigenaar van de website worden geplaatst (in dit geval AlgarveOfficial) worden \"first-party cookies\" genoemd. Cookies die door andere partijen dan de website-eigenaar worden geplaatst, worden \"third-party cookies\" genoemd.",
        ],
      },
      types: {
        title: "2. Soorten cookies die wij gebruiken",
        rows: [
          ["Essentieel", "Authenticatie, beveiliging, taalvoorkeuren", "Sessie / 1 jaar"],
          ["Functioneel", "Thema-voorkeuren, gebruikersinstellingen", "1 jaar"],
          ["Analyse", "Paginaweergaven, sessietracking (met toestemming)", "90 dagen"],
        ],
      },
      essential: {
        title: "3. Essentiële cookies",
        body: "Deze cookies zijn strikt noodzakelijk voor het functioneren van de website en kunnen niet in onze systemen worden uitgeschakeld. Ze worden meestal alleen ingesteld als reactie op acties van u die neerkomen op een verzoek om diensten, zoals:",
        items: [
          "Uw privacyvoorkeuren instellen",
          "Inloggen op uw account",
          "Formulieren invullen",
          "Beveiliging handhaven",
        ],
        note: "U kunt uw browser instellen om deze cookies te blokkeren of u ervoor te waarschuwen, maar sommige delen van de site zullen zonder deze cookies niet goed functioneren.",
      },
      analytics: {
        title: "4. Analyse-cookies",
        paragraphs: [
          "Deze cookies stellen ons in staat bezoeken en verkeersbronnen te tellen, zodat wij de prestaties van onze site kunnen meten en verbeteren. Ze helpen ons te weten welke pagina's het meest en minst populair zijn en hoe bezoekers zich door de site bewegen.",
          "Alle informatie die deze cookies verzamelen is geaggregeerd en anoniem. Wij plaatsen deze cookies pas nadat u ons uitdrukkelijke toestemming heeft gegeven via onze cookie-toestemmingsbanner.",
        ],
        dataTitle: "Gegevens die wij met uw toestemming verzamelen:",
        dataItems: [
          "Bezochte pagina's en bestede tijd",
          "Geanonimiseerd IP-adres (de laatste twee octetten worden gemaskeerd)",
          "Browser- en apparaattype",
          "Verwijzingsbron",
        ],
      },
      managing: {
        title: "5. Uw cookievoorkeuren beheren",
        body: "U heeft het recht om te beslissen of u cookies accepteert of weigert. U kunt uw cookievoorkeuren uitoefenen via:",
        items: [
          { label: "Cookie-toestemmingsbanner", text: "Wanneer u onze site voor het eerst bezoekt, kunt u niet-essentiële cookies accepteren of weigeren" },
          { label: "Browserinstellingen", text: "U kunt uw browser instellen om alle of sommige cookies te weigeren" },
          { label: "Lokale opslag", text: "Wis de lokale opslag van uw browser om uw voorkeuren opnieuw in te stellen" },
        ],
        note: "Houd er rekening mee dat als u cookies weigert, u onze website nog steeds kunt gebruiken, hoewel toegang tot sommige functies en gebieden beperkt kan zijn.",
      },
      contact: {
        title: "6. Contact",
        body: "Als u vragen heeft over ons gebruik van cookies, neem dan contact met ons op:",
      },
    },
  },
  sv: {
    pageTitle: "Cookiepolicy",
    introduction:
      "Denna Cookiepolicy förklarar hur AlgarveOfficial använder cookies och liknande tekniker för att känna igen dig när du besöker vår webbplats. Den förklarar vad dessa tekniker är, varför vi använder dem och dina rättigheter att kontrollera vår användning av dem.",
    lastUpdatedLabel: "Senast uppdaterad",
    lastUpdatedDate: "21 januari 2026",
    metaDescription:
      "Läs hur AlgarveOfficial använder cookies och liknande tekniker, och hur du kan hantera dina inställningar.",
    labels: {
      type: "Typ",
      purpose: "Syfte",
      duration: "Varaktighet",
      email: "E-post",
    },
    sections: {
      whatAreCookies: {
        title: "1. Vad är cookies",
        paragraphs: [
          "Cookies är små datafiler som placeras på din dator eller mobila enhet när du besöker en webbplats. De används ofta av webbplatsägare för att deras webbplatser ska fungera, fungera mer effektivt och ge rapporteringsinformation.",
          "Cookies som ställs in av webbplatsägaren (i detta fall AlgarveOfficial) kallas \"förstapartscookies\". Cookies som ställs in av andra parter än webbplatsägaren kallas \"tredjepartscookies\".",
        ],
      },
      types: {
        title: "2. Typer av cookies vi använder",
        rows: [
          ["Nödvändiga", "Autentisering, säkerhet, språkinställningar", "Session / 1 år"],
          ["Funktionella", "Temainställningar, användarinställningar", "1 år"],
          ["Analys", "Sidvisningar, sessionsspårning (med samtycke)", "90 dagar"],
        ],
      },
      essential: {
        title: "3. Nödvändiga cookies",
        body: "Dessa cookies är strikt nödvändiga för att webbplatsen ska fungera och kan inte stängas av i våra system. De ställs vanligtvis bara in som svar på åtgärder du gör som motsvarar en begäran om tjänster, såsom:",
        items: [
          "Ställa in dina integritetsinställningar",
          "Logga in på ditt konto",
          "Fylla i formulär",
          "Upprätthålla säkerhet",
        ],
        note: "Du kan ställa in din webbläsare så att den blockerar eller varnar dig om dessa cookies, men vissa delar av webbplatsen fungerar inte korrekt utan dem.",
      },
      analytics: {
        title: "4. Analyscookies",
        paragraphs: [
          "Dessa cookies gör det möjligt för oss att räkna besök och trafikkällor så att vi kan mäta och förbättra webbplatsens prestanda. De hjälper oss att veta vilka sidor som är mest och minst populära och hur besökare rör sig på webbplatsen.",
          "All information som dessa cookies samlar in är aggregerad och anonym. Vi ställer endast in dessa cookies efter att du har gett oss ditt uttryckliga samtycke via vår cookie-samtyckesbanner.",
        ],
        dataTitle: "Data vi samlar in med ditt samtycke:",
        dataItems: [
          "Besökta sidor och tid som spenderats",
          "Anonymiserad IP-adress (de två sista oktetterna maskeras)",
          "Webbläsar- och enhetstyp",
          "Hänvisningskälla",
        ],
      },
      managing: {
        title: "5. Hantera dina cookie-inställningar",
        body: "Du har rätt att bestämma om du vill acceptera eller avvisa cookies. Du kan utöva dina cookie-inställningar genom:",
        items: [
          { label: "Cookie-samtyckesbanner", text: "När du först besöker vår webbplats kan du acceptera eller avvisa icke-nödvändiga cookies" },
          { label: "Webbläsarinställningar", text: "Du kan ställa in din webbläsare så att den vägrar alla eller vissa cookies" },
          { label: "Lokal lagring", text: "Rensa webbläsarens lokala lagring för att återställa dina inställningar" },
        ],
        note: "Observera att om du väljer att avvisa cookies kan du fortfarande använda vår webbplats, men åtkomsten till vissa funktioner och områden kan vara begränsad.",
      },
      contact: {
        title: "6. Kontakta oss",
        body: "Om du har frågor om vår användning av cookies, kontakta oss:",
      },
    },
  },
  no: {
    pageTitle: "Informasjonskapselpolicy",
    introduction:
      "Denne Informasjonskapselpolicyen forklarer hvordan AlgarveOfficial bruker informasjonskapsler og lignende teknologier for å kjenne deg igjen når du besøker nettstedet vårt. Den forklarer hva disse teknologiene er, hvorfor vi bruker dem og dine rettigheter til å kontrollere vår bruk av dem.",
    lastUpdatedLabel: "Sist oppdatert",
    lastUpdatedDate: "21. januar 2026",
    metaDescription:
      "Les hvordan AlgarveOfficial bruker informasjonskapsler og lignende teknologier, og hvordan du kan administrere preferansene dine.",
    labels: {
      type: "Type",
      purpose: "Formål",
      duration: "Varighet",
      email: "E-post",
    },
    sections: {
      whatAreCookies: {
        title: "1. Hva er informasjonskapsler",
        paragraphs: [
          "Informasjonskapsler er små datafiler som plasseres på datamaskinen eller mobilenheten din når du besøker et nettsted. De brukes mye av nettstedseiere for å få nettsteder til å fungere, fungere mer effektivt og gi rapporteringsinformasjon.",
          "Informasjonskapsler satt av nettstedseieren (i dette tilfellet AlgarveOfficial) kalles \"førsteparts informasjonskapsler\". Informasjonskapsler satt av andre parter enn nettstedseieren kalles \"tredjeparts informasjonskapsler\".",
        ],
      },
      types: {
        title: "2. Typer informasjonskapsler vi bruker",
        rows: [
          ["Nødvendige", "Autentisering, sikkerhet, språkinnstillinger", "Økt / 1 år"],
          ["Funksjonelle", "Temainnstillinger, brukerinnstillinger", "1 år"],
          ["Analyse", "Sidevisninger, øktsporing (med samtykke)", "90 dager"],
        ],
      },
      essential: {
        title: "3. Nødvendige informasjonskapsler",
        body: "Disse informasjonskapslene er strengt nødvendige for at nettstedet skal fungere og kan ikke slås av i systemene våre. De settes vanligvis bare som svar på handlinger du gjør som utgjør en forespørsel om tjenester, for eksempel:",
        items: [
          "Angi personvernpreferansene dine",
          "Logge inn på kontoen din",
          "Fylle ut skjemaer",
          "Opprettholde sikkerhet",
        ],
        note: "Du kan stille inn nettleseren din til å blokkere eller varsle deg om disse informasjonskapslene, men noen deler av nettstedet vil ikke fungere riktig uten dem.",
      },
      analytics: {
        title: "4. Analyse-informasjonskapsler",
        paragraphs: [
          "Disse informasjonskapslene lar oss telle besøk og trafikkilder slik at vi kan måle og forbedre ytelsen til nettstedet vårt. De hjelper oss å vite hvilke sider som er mest og minst populære og hvordan besøkende beveger seg rundt på nettstedet.",
          "All informasjon disse informasjonskapslene samler inn er aggregert og anonym. Vi setter bare disse informasjonskapslene etter at du har gitt oss ditt uttrykkelige samtykke via samtykkebanneret vårt.",
        ],
        dataTitle: "Data vi samler inn med ditt samtykke:",
        dataItems: [
          "Besøkte sider og tidsbruk",
          "Anonymisert IP-adresse (de to siste oktettene maskeres)",
          "Nettleser- og enhetstype",
          "Henvisningskilde",
        ],
      },
      managing: {
        title: "5. Administrere dine informasjonskapselpreferanser",
        body: "Du har rett til å bestemme om du vil godta eller avvise informasjonskapsler. Du kan utøve preferansene dine ved hjelp av:",
        items: [
          { label: "Samtykkebanner for informasjonskapsler", text: "Når du først besøker nettstedet vårt, kan du godta eller avvise ikke-nødvendige informasjonskapsler" },
          { label: "Nettleserinnstillinger", text: "Du kan stille inn nettleseren til å avvise alle eller noen informasjonskapsler" },
          { label: "Lokal lagring", text: "Tøm nettleserens lokale lagring for å tilbakestille preferansene dine" },
        ],
        note: "Vær oppmerksom på at hvis du velger å avvise informasjonskapsler, kan du fortsatt bruke nettstedet vårt, men tilgangen til enkelte funksjoner og områder kan være begrenset.",
      },
      contact: {
        title: "6. Kontakt oss",
        body: "Hvis du har spørsmål om vår bruk av informasjonskapsler, kan du kontakte oss:",
      },
    },
  },
  da: {
    pageTitle: "Cookiepolitik",
    introduction:
      "Denne Cookiepolitik forklarer, hvordan AlgarveOfficial bruger cookies og lignende teknologier til at genkende dig, når du besøger vores website. Den forklarer, hvad disse teknologier er, hvorfor vi bruger dem, og dine rettigheder til at kontrollere vores brug af dem.",
    lastUpdatedLabel: "Sidst opdateret",
    lastUpdatedDate: "21. januar 2026",
    metaDescription:
      "Læs hvordan AlgarveOfficial bruger cookies og lignende teknologier, og hvordan du kan administrere dine præferencer.",
    labels: {
      type: "Type",
      purpose: "Formål",
      duration: "Varighed",
      email: "E-mail",
    },
    sections: {
      whatAreCookies: {
        title: "1. Hvad er cookies",
        paragraphs: [
          "Cookies er små datafiler, der placeres på din computer eller mobile enhed, når du besøger et website. De bruges bredt af websiteejere til at få websites til at fungere, fungere mere effektivt og give rapporteringsoplysninger.",
          "Cookies sat af websiteejeren (i dette tilfælde AlgarveOfficial) kaldes \"førstepartscookies\". Cookies sat af andre parter end websiteejeren kaldes \"tredjepartscookies\".",
        ],
      },
      types: {
        title: "2. Typer af cookies vi bruger",
        rows: [
          ["Nødvendige", "Godkendelse, sikkerhed, sprogpræferencer", "Session / 1 år"],
          ["Funktionelle", "Temapræferencer, brugerindstillinger", "1 år"],
          ["Analyse", "Sidevisninger, sessionssporing (med samtykke)", "90 dage"],
        ],
      },
      essential: {
        title: "3. Nødvendige cookies",
        body: "Disse cookies er strengt nødvendige for, at websitet kan fungere, og kan ikke slås fra i vores systemer. De sættes normalt kun som reaktion på handlinger, du foretager, som svarer til en anmodning om tjenester, såsom:",
        items: [
          "Indstilling af dine privatlivspræferencer",
          "Login på din konto",
          "Udfyldning af formularer",
          "Opretholdelse af sikkerhed",
        ],
        note: "Du kan indstille din browser til at blokere eller advare dig om disse cookies, men nogle dele af sitet vil ikke fungere korrekt uden dem.",
      },
      analytics: {
        title: "4. Analysecookies",
        paragraphs: [
          "Disse cookies gør det muligt for os at tælle besøg og trafikkilder, så vi kan måle og forbedre vores sites ydeevne. De hjælper os med at vide, hvilke sider der er mest og mindst populære, og hvordan besøgende bevæger sig rundt på sitet.",
          "Alle oplysninger, disse cookies indsamler, er aggregerede og anonyme. Vi sætter kun disse cookies, efter at du har givet os dit udtrykkelige samtykke via vores cookie-samtykkebanner.",
        ],
        dataTitle: "Data vi indsamler med dit samtykke:",
        dataItems: [
          "Besøgte sider og tidsforbrug",
          "Anonymiseret IP-adresse (de sidste to oktetter maskeres)",
          "Browser- og enhedstype",
          "Henvisningskilde",
        ],
      },
      managing: {
        title: "5. Administration af dine cookiepræferencer",
        body: "Du har ret til at beslutte, om du vil acceptere eller afvise cookies. Du kan udøve dine cookiepræferencer via:",
        items: [
          { label: "Cookie-samtykkebanner", text: "Når du først besøger vores site, kan du acceptere eller afvise ikke-nødvendige cookies" },
          { label: "Browserindstillinger", text: "Du kan indstille din browser til at afvise alle eller nogle cookies" },
          { label: "Lokal lagring", text: "Ryd browserens lokale lagring for at nulstille dine præferencer" },
        ],
        note: "Bemærk, at hvis du vælger at afvise cookies, kan du stadig bruge vores website, men adgang til visse funktioner og områder kan være begrænset.",
      },
      contact: {
        title: "6. Kontakt os",
        body: "Hvis du har spørgsmål om vores brug af cookies, bedes du kontakte os:",
      },
    },
  },
} satisfies Record<AppLocale, CookiePolicyCopy>;

export const COOKIE_POLICY_CONTENT: Record<AppLocale, CookiePolicyContent> = {
  en: buildCookiePolicyContent(COOKIE_COPY.en),
  "pt-pt": buildCookiePolicyContent(COOKIE_COPY["pt-pt"]),
  fr: buildCookiePolicyContent(COOKIE_COPY.fr),
  de: buildCookiePolicyContent(COOKIE_COPY.de),
  es: buildCookiePolicyContent(COOKIE_COPY.es),
  it: buildCookiePolicyContent(COOKIE_COPY.it),
  nl: buildCookiePolicyContent(COOKIE_COPY.nl),
  sv: buildCookiePolicyContent(COOKIE_COPY.sv),
  no: buildCookiePolicyContent(COOKIE_COPY.no),
  da: buildCookiePolicyContent(COOKIE_COPY.da),
};

export function resolveCookiePolicyLocale(locale?: string | null): AppLocale {
  const normalized = String(locale ?? "").trim().toLowerCase().replace("_", "-");
  if (isValidLocale(normalized)) return normalized;

  if (normalized === "pt" || normalized.startsWith("pt-")) return "pt-pt";
  if (normalized.startsWith("fr")) return "fr";
  if (normalized.startsWith("de")) return "de";
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("it")) return "it";
  if (normalized.startsWith("nl")) return "nl";
  if (normalized.startsWith("sv")) return "sv";
  if (normalized.startsWith("no") || normalized.startsWith("nb") || normalized.startsWith("nn")) {
    return "no";
  }
  if (normalized.startsWith("da")) return "da";

  return DEFAULT_LOCALE;
}

export function getCookiePolicyContent(locale?: string | null): CookiePolicyContent {
  return COOKIE_POLICY_CONTENT[resolveCookiePolicyLocale(locale)];
}
