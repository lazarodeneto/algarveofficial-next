import { DEFAULT_LOCALE, isValidLocale, type AppLocale } from "@/lib/i18n/locales";

const SUPPORT_EMAIL = "info@algarveofficial.com";

export interface PrivacyPolicySection {
  id: string;
  title: string;
  icon: string;
  content: string;
}

export interface PrivacyPolicyContent {
  pageTitle: string;
  introduction: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  lastUpdated: string;
  metaDescription: string;
  sections: PrivacyPolicySection[];
}

interface LabelledText {
  label: string;
  text: string;
}

interface RightsCard {
  title: string;
  text: string;
}

interface PrivacyPolicyCopy {
  pageTitle: string;
  introduction: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  metaDescription: string;
  labels: {
    email: string;
    address: string;
    responseTime: string;
    dataType: string;
    retentionPeriod: string;
    type: string;
    purpose: string;
    consentRequired: string;
    no: string;
    yes: string;
  };
  sections: {
    dataController: {
      title: string;
      body: string;
      address: string;
    };
    dataWeCollect: {
      title: string;
      providedTitle: string;
      providedItems: LabelledText[];
      automaticTitle: string;
      consentStrong: string;
      consentRest: string;
      automaticItems: LabelledText[];
      importantLabel: string;
      importantText: string;
    };
    legalBasis: {
      title: string;
      body: string;
      items: LabelledText[];
    };
    useData: {
      title: string;
      items: string[];
    };
    retention: {
      title: string;
      body: string;
      rows: Array<[string, string]>;
    };
    rights: {
      title: string;
      body: string;
      cards: RightsCard[];
      exercisePrefix: string;
    };
    security: {
      title: string;
      body: string;
      items: string[];
    };
    cookies: {
      title: string;
      body: string;
      rows: Array<[string, string, string]>;
      manageText: string;
    };
    thirdParties: {
      title: string;
      body: string;
      items: LabelledText[];
      processorText: string;
    };
    transfers: {
      title: string;
      body: string;
      items: string[];
    };
    contact: {
      title: string;
      body: string;
      responseTime: string;
      authorityText: string;
    };
    changes: {
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

function detailCard(rows: LabelledText[]): string {
  return `<div class="bg-card border border-border rounded-lg p-4">${rows
    .map(
      (row) =>
        `<p><strong>${escapeHtml(row.label)}:</strong> ${escapeHtml(row.text)}</p>`,
    )
    .join("")}</div>`;
}

function twoColumnTable(headers: [string, string], rows: Array<[string, string]>): string {
  return `<div class="bg-card border border-border rounded-lg overflow-hidden"><table class="w-full text-sm"><thead class="bg-muted/50"><tr><th class="text-left p-3 font-semibold text-foreground">${escapeHtml(headers[0])}</th><th class="text-left p-3 font-semibold text-foreground">${escapeHtml(headers[1])}</th></tr></thead><tbody>${rows
    .map(
      ([first, second]) =>
        `<tr class="border-t border-border"><td class="p-3">${escapeHtml(first)}</td><td class="p-3">${escapeHtml(second)}</td></tr>`,
    )
    .join("")}</tbody></table></div>`;
}

function threeColumnTable(
  headers: [string, string, string],
  rows: Array<[string, string, string]>,
): string {
  return `<div class="bg-card border border-border rounded-lg overflow-hidden"><table class="w-full text-sm"><thead class="bg-muted/50"><tr><th class="text-left p-3 font-semibold text-foreground">${escapeHtml(headers[0])}</th><th class="text-left p-3 font-semibold text-foreground">${escapeHtml(headers[1])}</th><th class="text-left p-3 font-semibold text-foreground">${escapeHtml(headers[2])}</th></tr></thead><tbody>${rows
    .map(
      ([first, second, third]) =>
        `<tr class="border-t border-border"><td class="p-3">${escapeHtml(first)}</td><td class="p-3">${escapeHtml(second)}</td><td class="p-3">${escapeHtml(third)}</td></tr>`,
    )
    .join("")}</tbody></table></div>`;
}

function importantBox(label: string, text: string): string {
  return `<div class="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4"><p class="text-sm"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(text)}</p></div>`;
}

function rightsGrid(cards: RightsCard[]): string {
  return `<div class="grid gap-4 md:grid-cols-2">${cards
    .map((card, index) => {
      const spanClass = index === cards.length - 1 ? " md:col-span-2" : "";
      return `<div class="bg-card border border-border rounded-lg p-4${spanClass}"><h4 class="font-semibold text-foreground mb-2">${escapeHtml(card.title)}</h4><p class="text-sm">${escapeHtml(card.text)}</p></div>`;
    })
    .join("")}</div>`;
}

function emailParagraph(prefix: string): string {
  return `<p class="mt-4">${escapeHtml(prefix)} <a href="mailto:${SUPPORT_EMAIL}" class="text-primary hover:underline">${SUPPORT_EMAIL}</a></p>`;
}

function buildSections(copy: PrivacyPolicyCopy): PrivacyPolicySection[] {
  const { labels, sections } = copy;

  return [
    {
      id: "data-controller",
      title: sections.dataController.title,
      icon: "FileText",
      content: [
        paragraph(sections.dataController.body),
        detailCard([
          { label: labels.email, text: SUPPORT_EMAIL },
          { label: labels.address, text: sections.dataController.address },
        ]),
      ].join(""),
    },
    {
      id: "data-we-collect",
      title: sections.dataWeCollect.title,
      icon: "Database",
      content: [
        `<div><h3 class="text-lg font-semibold text-foreground mb-2">${escapeHtml(sections.dataWeCollect.providedTitle)}</h3>${labelledList(sections.dataWeCollect.providedItems)}</div>`,
        `<div><h3 class="text-lg font-semibold text-foreground mb-2">${escapeHtml(sections.dataWeCollect.automaticTitle)}</h3><p class="mb-3"><strong>${escapeHtml(sections.dataWeCollect.consentStrong)}</strong>, ${escapeHtml(sections.dataWeCollect.consentRest)}</p>${labelledList(sections.dataWeCollect.automaticItems)}${importantBox(sections.dataWeCollect.importantLabel, sections.dataWeCollect.importantText)}</div>`,
      ].join(""),
    },
    {
      id: "legal-basis",
      title: sections.legalBasis.title,
      icon: "UserCheck",
      content: [paragraph(sections.legalBasis.body), labelledList(sections.legalBasis.items)].join(""),
    },
    {
      id: "how-we-use-data",
      title: sections.useData.title,
      icon: "Database",
      content: simpleList(sections.useData.items),
    },
    {
      id: "data-retention",
      title: sections.retention.title,
      icon: "Clock",
      content: [
        paragraph(sections.retention.body),
        twoColumnTable([labels.dataType, labels.retentionPeriod], sections.retention.rows),
      ].join(""),
    },
    {
      id: "gdpr-rights",
      title: sections.rights.title,
      icon: "UserCheck",
      content: [
        paragraph(sections.rights.body),
        rightsGrid(sections.rights.cards),
        emailParagraph(sections.rights.exercisePrefix),
      ].join(""),
    },
    {
      id: "data-security",
      title: sections.security.title,
      icon: "Shield",
      content: [paragraph(sections.security.body), simpleList(sections.security.items)].join(""),
    },
    {
      id: "cookies-tracking",
      title: sections.cookies.title,
      icon: "Database",
      content: [
        paragraph(sections.cookies.body),
        threeColumnTable(
          [labels.type, labels.purpose, labels.consentRequired],
          sections.cookies.rows,
        ),
        paragraph(sections.cookies.manageText),
      ].join(""),
    },
    {
      id: "third-party-services",
      title: sections.thirdParties.title,
      icon: "UserCheck",
      content: [
        paragraph(sections.thirdParties.body),
        labelledList(sections.thirdParties.items),
        paragraph(sections.thirdParties.processorText),
      ].join(""),
    },
    {
      id: "international-transfers",
      title: sections.transfers.title,
      icon: "Database",
      content: [paragraph(sections.transfers.body), simpleList(sections.transfers.items)].join(""),
    },
    {
      id: "contact-us",
      title: sections.contact.title,
      icon: "Mail",
      content: [
        paragraph(sections.contact.body),
        detailCard([
          { label: labels.email, text: SUPPORT_EMAIL },
          { label: labels.responseTime, text: sections.contact.responseTime },
        ]),
        paragraph(sections.contact.authorityText),
      ].join(""),
    },
    {
      id: "changes-to-policy",
      title: sections.changes.title,
      icon: "FileText",
      content: paragraph(sections.changes.body),
    },
  ];
}

function buildPrivacyPolicyContent(copy: PrivacyPolicyCopy): PrivacyPolicyContent {
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

const COPY = {
  en: {
    pageTitle: "Privacy Policy",
    introduction:
      "AlgarveOfficial (\"we\", \"our\", or \"us\") is committed to protecting your privacy and ensuring compliance with the General Data Protection Regulation (GDPR) and other applicable data protection laws. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our website and services.",
    lastUpdatedLabel: "Last updated",
    lastUpdatedDate: "January 21, 2026",
    metaDescription:
      "Review how AlgarveOfficial collects, uses, stores, and protects personal data under GDPR and applicable data protection laws.",
    labels: {
      email: "Email",
      address: "Address",
      responseTime: "Response Time",
      dataType: "Data Type",
      retentionPeriod: "Retention Period",
      type: "Type",
      purpose: "Purpose",
      consentRequired: "Consent Required",
      no: "No",
      yes: "Yes",
    },
    sections: {
      dataController: {
        title: "1. Data Controller",
        body: "AlgarveOfficial is the data controller responsible for your personal data. If you have any questions about this Privacy Policy or our data practices, please contact us at:",
        address: "Algarve, District of Faro, Portugal",
      },
      dataWeCollect: {
        title: "2. Data We Collect",
        providedTitle: "2.1 Information You Provide",
        providedItems: [
          { label: "Account Data", text: "Name, email address, and password when you create an account" },
          { label: "Profile Data", text: "Optional information such as phone number, bio, and profile picture" },
          { label: "Communication Data", text: "Messages you send through our platform to listing owners" },
          { label: "Listing Data", text: "Information provided by business owners for their listings" },
        ],
        automaticTitle: "2.2 Automatically Collected Data",
        consentStrong: "Only with your explicit consent",
        consentRest: "we may collect:",
        automaticItems: [
          { label: "Analytics Data", text: "Page views, session duration, and interaction patterns" },
          { label: "Technical Data", text: "Browser type, device type, and anonymized IP address (last two octets masked)" },
          { label: "Session Identifiers", text: "Anonymous session IDs for view deduplication" },
        ],
        importantLabel: "Important",
        importantText:
          "We do not collect any analytics data without your explicit consent. You can manage your preferences through our cookie consent banner at any time.",
      },
      legalBasis: {
        title: "3. Legal Basis for Processing",
        body: "We process your personal data based on the following legal grounds:",
        items: [
          { label: "Consent", text: "For analytics and marketing communications (you can withdraw at any time)" },
          { label: "Contract", text: "To provide our services when you create an account or use our platform" },
          { label: "Legitimate Interest", text: "For security, fraud prevention, and service improvement" },
          { label: "Legal Obligation", text: "To comply with applicable laws and regulations" },
        ],
      },
      useData: {
        title: "4. How We Use Your Data",
        items: [
          "To provide and maintain our services",
          "To process your account registration and manage your profile",
          "To facilitate communication between users and listing owners",
          "To improve our website and user experience (with consent)",
          "To send service-related notifications",
          "To detect and prevent fraud and security threats",
          "To comply with legal obligations",
        ],
      },
      retention: {
        title: "5. Data Retention",
        body: "We retain your personal data only for as long as necessary:",
        rows: [
          ["Account Data", "Until account deletion + 30 days"],
          ["Analytics Events", "90 days (automatically purged)"],
          ["View Tracking Data", "90 days (automatically purged)"],
          ["Messages", "Until conversation deletion"],
          ["Security Audit Logs", "1 year (for security purposes)"],
        ],
      },
      rights: {
        title: "6. Your Rights Under GDPR",
        body: "As a data subject, you have the following rights:",
        cards: [
          { title: "Right of Access", text: "Request a copy of your personal data we hold" },
          { title: "Right to Rectification", text: "Request correction of inaccurate or incomplete data" },
          { title: "Right to Erasure", text: "Request deletion of your personal data (\"right to be forgotten\")" },
          { title: "Right to Restrict Processing", text: "Request limitation of how we use your data" },
          { title: "Right to Data Portability", text: "Receive your data in a structured, machine-readable format" },
          { title: "Right to Object", text: "Object to processing based on legitimate interests" },
          { title: "Right to Withdraw Consent", text: "Withdraw your consent at any time for consent-based processing (e.g., analytics)" },
        ],
        exercisePrefix: "To exercise any of these rights, please contact us at",
      },
      security: {
        title: "7. Data Security",
        body: "We implement appropriate technical and organizational measures to protect your data:",
        items: [
          "Encryption of data in transit (TLS/SSL) and at rest",
          "Row-Level Security (RLS) policies ensuring users can only access their own data",
          "Automatic IP address anonymization at the database level",
          "Regular security audits and access logging",
          "Strict access controls for administrative functions",
        ],
      },
      cookies: {
        title: "8. Cookies and Tracking",
        body: "We use the following types of cookies:",
        rows: [
          ["Essential", "Authentication, security, language preferences", "No"],
          ["Analytics", "Page views, session tracking, usage patterns", "Yes"],
        ],
        manageText:
          "You can manage your cookie preferences at any time through the cookie consent banner or by clearing your browser's local storage.",
      },
      thirdParties: {
        title: "9. Third-Party Services",
        body: "We use the following third-party services that may process your data:",
        items: [
          { label: "Supabase", text: "Database and authentication services (EU-based infrastructure available)" },
          { label: "Google", text: "Optional OAuth authentication (if you choose to sign in with Google)" },
        ],
        processorText:
          "All third-party processors are bound by data processing agreements ensuring GDPR compliance.",
      },
      transfers: {
        title: "10. International Data Transfers",
        body: "Your data may be transferred to and processed in countries outside the European Economic Area (EEA). When this occurs, we ensure appropriate safeguards are in place, such as:",
        items: [
          "Standard Contractual Clauses (SCCs) approved by the European Commission",
          "Adequacy decisions for countries with equivalent data protection",
          "Binding corporate rules for group companies",
        ],
      },
      contact: {
        title: "11. Contact Us",
        body: "If you have any questions about this Privacy Policy, wish to exercise your rights, or have a complaint, please contact us:",
        responseTime: "Within 30 days as required by GDPR",
        authorityText:
          "You also have the right to lodge a complaint with your local data protection authority. In Portugal, this is the Comissão Nacional de Proteção de Dados (CNPD).",
      },
      changes: {
        title: "12. Changes to This Policy",
        body: "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the \"Last updated\" date. We encourage you to review this Privacy Policy periodically.",
      },
    },
  },
  "pt-pt": {
    pageTitle: "Política de Privacidade",
    introduction:
      "A AlgarveOfficial (\"nós\", \"nosso\" ou \"nos\") está empenhada em proteger a sua privacidade e em garantir o cumprimento do Regulamento Geral sobre a Proteção de Dados (RGPD) e de outras leis de proteção de dados aplicáveis. Esta Política de Privacidade explica como recolhemos, utilizamos, conservamos e protegemos os seus dados pessoais quando utiliza o nosso website e serviços.",
    lastUpdatedLabel: "Última atualização",
    lastUpdatedDate: "21 de janeiro de 2026",
    metaDescription:
      "Saiba como a AlgarveOfficial recolhe, utiliza, conserva e protege dados pessoais ao abrigo do RGPD e das leis de proteção de dados aplicáveis.",
    labels: {
      email: "Email",
      address: "Morada",
      responseTime: "Tempo de resposta",
      dataType: "Tipo de dados",
      retentionPeriod: "Prazo de conservação",
      type: "Tipo",
      purpose: "Finalidade",
      consentRequired: "Consentimento necessário",
      no: "Não",
      yes: "Sim",
    },
    sections: {
      dataController: {
        title: "1. Responsável pelo Tratamento dos Dados",
        body: "A AlgarveOfficial é a responsável pelo tratamento dos seus dados pessoais. Se tiver alguma questão sobre esta Política de Privacidade ou sobre as nossas práticas de dados, contacte-nos através de:",
        address: "Algarve, distrito de Faro, Portugal",
      },
      dataWeCollect: {
        title: "2. Dados que Recolhemos",
        providedTitle: "2.1 Informações que fornece",
        providedItems: [
          { label: "Dados da conta", text: "Nome, endereço de email e palavra-passe quando cria uma conta" },
          { label: "Dados de perfil", text: "Informações opcionais, como número de telefone, biografia e fotografia de perfil" },
          { label: "Dados de comunicação", text: "Mensagens que envia através da nossa plataforma aos proprietários de anúncios" },
          { label: "Dados dos anúncios", text: "Informações fornecidas por proprietários de negócios para os seus anúncios" },
        ],
        automaticTitle: "2.2 Dados recolhidos automaticamente",
        consentStrong: "Apenas com o seu consentimento explícito",
        consentRest: "podemos recolher:",
        automaticItems: [
          { label: "Dados analíticos", text: "Visualizações de páginas, duração da sessão e padrões de interação" },
          { label: "Dados técnicos", text: "Tipo de navegador, tipo de dispositivo e endereço IP anonimizado (os dois últimos octetos são mascarados)" },
          { label: "Identificadores de sessão", text: "IDs de sessão anónimos para evitar duplicação de visualizações" },
        ],
        importantLabel: "Importante",
        importantText:
          "Não recolhemos quaisquer dados analíticos sem o seu consentimento explícito. Pode gerir as suas preferências a qualquer momento através da nossa faixa de consentimento de cookies.",
      },
      legalBasis: {
        title: "3. Fundamento Jurídico do Tratamento",
        body: "Tratamos os seus dados pessoais com base nos seguintes fundamentos jurídicos:",
        items: [
          { label: "Consentimento", text: "Para análises e comunicações de marketing (pode retirar o consentimento a qualquer momento)" },
          { label: "Contrato", text: "Para prestar os nossos serviços quando cria uma conta ou utiliza a nossa plataforma" },
          { label: "Interesse legítimo", text: "Para segurança, prevenção de fraude e melhoria do serviço" },
          { label: "Obrigação legal", text: "Para cumprir leis e regulamentos aplicáveis" },
        ],
      },
      useData: {
        title: "4. Como Utilizamos os Seus Dados",
        items: [
          "Para prestar e manter os nossos serviços",
          "Para processar o registo da sua conta e gerir o seu perfil",
          "Para facilitar a comunicação entre utilizadores e proprietários de anúncios",
          "Para melhorar o nosso website e a experiência do utilizador (com consentimento)",
          "Para enviar notificações relacionadas com o serviço",
          "Para detetar e prevenir fraude e ameaças de segurança",
          "Para cumprir obrigações legais",
        ],
      },
      retention: {
        title: "5. Conservação de Dados",
        body: "Conservamos os seus dados pessoais apenas durante o tempo necessário:",
        rows: [
          ["Dados da conta", "Até à eliminação da conta + 30 dias"],
          ["Eventos analíticos", "90 dias (eliminados automaticamente)"],
          ["Dados de rastreamento de visualizações", "90 dias (eliminados automaticamente)"],
          ["Mensagens", "Até à eliminação da conversa"],
          ["Registos de auditoria de segurança", "1 ano (para fins de segurança)"],
        ],
      },
      rights: {
        title: "6. Os Seus Direitos ao Abrigo do RGPD",
        body: "Enquanto titular dos dados, tem os seguintes direitos:",
        cards: [
          { title: "Direito de acesso", text: "Solicitar uma cópia dos dados pessoais que mantemos sobre si" },
          { title: "Direito de retificação", text: "Solicitar a correção de dados inexatos ou incompletos" },
          { title: "Direito ao apagamento", text: "Solicitar a eliminação dos seus dados pessoais (\"direito a ser esquecido\")" },
          { title: "Direito à limitação do tratamento", text: "Solicitar a limitação da forma como utilizamos os seus dados" },
          { title: "Direito à portabilidade dos dados", text: "Receber os seus dados num formato estruturado e legível por máquina" },
          { title: "Direito de oposição", text: "Opor-se ao tratamento baseado em interesses legítimos" },
          { title: "Direito de retirar o consentimento", text: "Retirar o seu consentimento a qualquer momento para tratamentos baseados em consentimento (por exemplo, análises)" },
        ],
        exercisePrefix: "Para exercer qualquer um destes direitos, contacte-nos através de",
      },
      security: {
        title: "7. Segurança dos Dados",
        body: "Implementamos medidas técnicas e organizativas adequadas para proteger os seus dados:",
        items: [
          "Encriptação dos dados em trânsito (TLS/SSL) e em repouso",
          "Políticas de segurança ao nível da linha (RLS) que garantem que os utilizadores só acedem aos seus próprios dados",
          "Anonimização automática de endereços IP ao nível da base de dados",
          "Auditorias de segurança regulares e registo de acessos",
          "Controlos de acesso rigorosos para funções administrativas",
        ],
      },
      cookies: {
        title: "8. Cookies e Rastreamento",
        body: "Utilizamos os seguintes tipos de cookies:",
        rows: [
          ["Essenciais", "Autenticação, segurança, preferências de idioma", "Não"],
          ["Analíticos", "Visualizações de páginas, rastreamento de sessão, padrões de utilização", "Sim"],
        ],
        manageText:
          "Pode gerir as suas preferências de cookies a qualquer momento através da faixa de consentimento de cookies ou limpando o armazenamento local do seu navegador.",
      },
      thirdParties: {
        title: "9. Serviços de Terceiros",
        body: "Utilizamos os seguintes serviços de terceiros que podem tratar os seus dados:",
        items: [
          { label: "Supabase", text: "Serviços de base de dados e autenticação (infraestrutura baseada na UE disponível)" },
          { label: "Google", text: "Autenticação OAuth opcional (se optar por iniciar sessão com o Google)" },
        ],
        processorText:
          "Todos os subcontratantes terceiros estão vinculados por acordos de tratamento de dados que garantem a conformidade com o RGPD.",
      },
      transfers: {
        title: "10. Transferências Internacionais de Dados",
        body: "Os seus dados podem ser transferidos para e tratados em países fora do Espaço Económico Europeu (EEE). Quando isso acontece, garantimos salvaguardas adequadas, tais como:",
        items: [
          "Cláusulas Contratuais-Tipo (CCT) aprovadas pela Comissão Europeia",
          "Decisões de adequação para países com proteção de dados equivalente",
          "Regras vinculativas aplicáveis a empresas do grupo",
        ],
      },
      contact: {
        title: "11. Contacte-nos",
        body: "Se tiver perguntas sobre esta Política de Privacidade, quiser exercer os seus direitos ou apresentar uma reclamação, contacte-nos:",
        responseTime: "No prazo de 30 dias, conforme exigido pelo RGPD",
        authorityText:
          "Também tem o direito de apresentar reclamação junto da sua autoridade local de proteção de dados. Em Portugal, esta autoridade é a Comissão Nacional de Proteção de Dados (CNPD).",
      },
      changes: {
        title: "12. Alterações a Esta Política",
        body: "Podemos atualizar esta Política de Privacidade periodicamente. Iremos notificá-lo de alterações materiais publicando a nova Política de Privacidade nesta página e atualizando a data de \"Última atualização\". Recomendamos que reveja esta Política de Privacidade regularmente.",
      },
    },
  },
  fr: {
    pageTitle: "Politique de confidentialité",
    introduction:
      "AlgarveOfficial (\"nous\", \"notre\" ou \"nos\") s'engage à protéger votre vie privée et à respecter le Règlement général sur la protection des données (RGPD) ainsi que les autres lois applicables en matière de protection des données. Cette Politique de confidentialité explique comment nous collectons, utilisons, conservons et protégeons vos données personnelles lorsque vous utilisez notre site web et nos services.",
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdatedDate: "21 janvier 2026",
    metaDescription:
      "Découvrez comment AlgarveOfficial collecte, utilise, conserve et protège les données personnelles conformément au RGPD et aux lois applicables.",
    labels: {
      email: "E-mail",
      address: "Adresse",
      responseTime: "Délai de réponse",
      dataType: "Type de données",
      retentionPeriod: "Durée de conservation",
      type: "Type",
      purpose: "Finalité",
      consentRequired: "Consentement requis",
      no: "Non",
      yes: "Oui",
    },
    sections: {
      dataController: {
        title: "1. Responsable du traitement",
        body: "AlgarveOfficial est le responsable du traitement de vos données personnelles. Pour toute question concernant cette Politique de confidentialité ou nos pratiques en matière de données, vous pouvez nous contacter à :",
        address: "Algarve, district de Faro, Portugal",
      },
      dataWeCollect: {
        title: "2. Données que nous collectons",
        providedTitle: "2.1 Informations que vous fournissez",
        providedItems: [
          { label: "Données de compte", text: "Nom, adresse e-mail et mot de passe lorsque vous créez un compte" },
          { label: "Données de profil", text: "Informations facultatives telles que numéro de téléphone, biographie et photo de profil" },
          { label: "Données de communication", text: "Messages que vous envoyez aux propriétaires d'annonces via notre plateforme" },
          { label: "Données d'annonce", text: "Informations fournies par les propriétaires d'entreprises pour leurs annonces" },
        ],
        automaticTitle: "2.2 Données collectées automatiquement",
        consentStrong: "Uniquement avec votre consentement explicite",
        consentRest: "nous pouvons collecter :",
        automaticItems: [
          { label: "Données analytiques", text: "Pages vues, durée de session et schémas d'interaction" },
          { label: "Données techniques", text: "Type de navigateur, type d'appareil et adresse IP anonymisée (les deux derniers octets sont masqués)" },
          { label: "Identifiants de session", text: "Identifiants de session anonymes pour éviter le double comptage des vues" },
        ],
        importantLabel: "Important",
        importantText:
          "Nous ne collectons aucune donnée analytique sans votre consentement explicite. Vous pouvez gérer vos préférences à tout moment via notre bannière de consentement aux cookies.",
      },
      legalBasis: {
        title: "3. Base juridique du traitement",
        body: "Nous traitons vos données personnelles sur les bases juridiques suivantes :",
        items: [
          { label: "Consentement", text: "Pour les analyses et les communications marketing (vous pouvez le retirer à tout moment)" },
          { label: "Contrat", text: "Pour fournir nos services lorsque vous créez un compte ou utilisez notre plateforme" },
          { label: "Intérêt légitime", text: "Pour la sécurité, la prévention de la fraude et l'amélioration du service" },
          { label: "Obligation légale", text: "Pour respecter les lois et règlements applicables" },
        ],
      },
      useData: {
        title: "4. Comment nous utilisons vos données",
        items: [
          "Fournir et maintenir nos services",
          "Traiter l'inscription de votre compte et gérer votre profil",
          "Faciliter la communication entre les utilisateurs et les propriétaires d'annonces",
          "Améliorer notre site web et l'expérience utilisateur (avec consentement)",
          "Envoyer des notifications liées au service",
          "Détecter et prévenir la fraude et les menaces de sécurité",
          "Respecter nos obligations légales",
        ],
      },
      retention: {
        title: "5. Conservation des données",
        body: "Nous conservons vos données personnelles uniquement pendant la durée nécessaire :",
        rows: [
          ["Données de compte", "Jusqu'à la suppression du compte + 30 jours"],
          ["Événements analytiques", "90 jours (suppression automatique)"],
          ["Données de suivi des vues", "90 jours (suppression automatique)"],
          ["Messages", "Jusqu'à la suppression de la conversation"],
          ["Journaux d'audit de sécurité", "1 an (à des fins de sécurité)"],
        ],
      },
      rights: {
        title: "6. Vos droits au titre du RGPD",
        body: "En tant que personne concernée, vous disposez des droits suivants :",
        cards: [
          { title: "Droit d'accès", text: "Demander une copie des données personnelles que nous détenons à votre sujet" },
          { title: "Droit de rectification", text: "Demander la correction de données inexactes ou incomplètes" },
          { title: "Droit à l'effacement", text: "Demander la suppression de vos données personnelles (\"droit à l'oubli\")" },
          { title: "Droit à la limitation du traitement", text: "Demander la limitation de la manière dont nous utilisons vos données" },
          { title: "Droit à la portabilité des données", text: "Recevoir vos données dans un format structuré et lisible par machine" },
          { title: "Droit d'opposition", text: "Vous opposer au traitement fondé sur des intérêts légitimes" },
          { title: "Droit de retirer le consentement", text: "Retirer votre consentement à tout moment pour les traitements fondés sur le consentement (par exemple les analyses)" },
        ],
        exercisePrefix: "Pour exercer l'un de ces droits, contactez-nous à",
      },
      security: {
        title: "7. Sécurité des données",
        body: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :",
        items: [
          "Chiffrement des données en transit (TLS/SSL) et au repos",
          "Politiques de sécurité au niveau des lignes (RLS) garantissant que les utilisateurs n'accèdent qu'à leurs propres données",
          "Anonymisation automatique des adresses IP au niveau de la base de données",
          "Audits de sécurité réguliers et journalisation des accès",
          "Contrôles d'accès stricts pour les fonctions administratives",
        ],
      },
      cookies: {
        title: "8. Cookies et suivi",
        body: "Nous utilisons les types de cookies suivants :",
        rows: [
          ["Essentiels", "Authentification, sécurité, préférences linguistiques", "Non"],
          ["Analytiques", "Pages vues, suivi de session, habitudes d'utilisation", "Oui"],
        ],
        manageText:
          "Vous pouvez gérer vos préférences de cookies à tout moment via la bannière de consentement aux cookies ou en effaçant le stockage local de votre navigateur.",
      },
      thirdParties: {
        title: "9. Services tiers",
        body: "Nous utilisons les services tiers suivants, qui peuvent traiter vos données :",
        items: [
          { label: "Supabase", text: "Services de base de données et d'authentification (infrastructure basée dans l'UE disponible)" },
          { label: "Google", text: "Authentification OAuth facultative (si vous choisissez de vous connecter avec Google)" },
        ],
        processorText:
          "Tous les sous-traitants tiers sont liés par des accords de traitement des données garantissant la conformité au RGPD.",
      },
      transfers: {
        title: "10. Transferts internationaux de données",
        body: "Vos données peuvent être transférées vers et traitées dans des pays situés en dehors de l'Espace économique européen (EEE). Dans ce cas, nous veillons à ce que des garanties appropriées soient en place, notamment :",
        items: [
          "Clauses contractuelles types (CCT) approuvées par la Commission européenne",
          "Décisions d'adéquation pour les pays offrant une protection équivalente des données",
          "Règles d'entreprise contraignantes pour les sociétés du groupe",
        ],
      },
      contact: {
        title: "11. Nous contacter",
        body: "Si vous avez des questions concernant cette Politique de confidentialité, souhaitez exercer vos droits ou déposer une réclamation, contactez-nous :",
        responseTime: "Dans les 30 jours, comme l'exige le RGPD",
        authorityText:
          "Vous avez également le droit de déposer une réclamation auprès de votre autorité locale de protection des données. Au Portugal, il s'agit de la Comissão Nacional de Proteção de Dados (CNPD).",
      },
      changes: {
        title: "12. Modifications de cette politique",
        body: "Nous pouvons mettre à jour cette Politique de confidentialité de temps à autre. Nous vous informerons de toute modification importante en publiant la nouvelle Politique de confidentialité sur cette page et en mettant à jour la date de \"Dernière mise à jour\". Nous vous encourageons à la consulter régulièrement.",
      },
    },
  },
  de: {
    pageTitle: "Datenschutzerklärung",
    introduction:
      "AlgarveOfficial (\"wir\", \"uns\" oder \"unser\") verpflichtet sich, Ihre Privatsphäre zu schützen und die Datenschutz-Grundverordnung (DSGVO) sowie andere geltende Datenschutzgesetze einzuhalten. Diese Datenschutzerklärung erläutert, wie wir Ihre personenbezogenen Daten erheben, nutzen, speichern und schützen, wenn Sie unsere Website und Dienste verwenden.",
    lastUpdatedLabel: "Zuletzt aktualisiert",
    lastUpdatedDate: "21. Januar 2026",
    metaDescription:
      "Erfahren Sie, wie AlgarveOfficial personenbezogene Daten gemäß DSGVO und geltenden Datenschutzgesetzen erhebt, nutzt, speichert und schützt.",
    labels: {
      email: "E-Mail",
      address: "Adresse",
      responseTime: "Antwortzeit",
      dataType: "Datenart",
      retentionPeriod: "Aufbewahrungsfrist",
      type: "Art",
      purpose: "Zweck",
      consentRequired: "Einwilligung erforderlich",
      no: "Nein",
      yes: "Ja",
    },
    sections: {
      dataController: {
        title: "1. Verantwortlicher",
        body: "AlgarveOfficial ist der für Ihre personenbezogenen Daten Verantwortliche. Wenn Sie Fragen zu dieser Datenschutzerklärung oder zu unseren Datenpraktiken haben, kontaktieren Sie uns bitte unter:",
        address: "Algarve, Distrikt Faro, Portugal",
      },
      dataWeCollect: {
        title: "2. Daten, die wir erheben",
        providedTitle: "2.1 Informationen, die Sie bereitstellen",
        providedItems: [
          { label: "Kontodaten", text: "Name, E-Mail-Adresse und Passwort, wenn Sie ein Konto erstellen" },
          { label: "Profildaten", text: "Optionale Informationen wie Telefonnummer, Biografie und Profilbild" },
          { label: "Kommunikationsdaten", text: "Nachrichten, die Sie über unsere Plattform an Anbieter von Einträgen senden" },
          { label: "Eintragsdaten", text: "Informationen, die Geschäftsinhaber für ihre Einträge bereitstellen" },
        ],
        automaticTitle: "2.2 Automatisch erhobene Daten",
        consentStrong: "Nur mit Ihrer ausdrücklichen Einwilligung",
        consentRest: "erheben wir möglicherweise:",
        automaticItems: [
          { label: "Analysedaten", text: "Seitenaufrufe, Sitzungsdauer und Interaktionsmuster" },
          { label: "Technische Daten", text: "Browsertyp, Gerätetyp und anonymisierte IP-Adresse (die letzten zwei Oktette werden maskiert)" },
          { label: "Sitzungskennungen", text: "Anonyme Sitzungs-IDs zur Vermeidung doppelter Aufrufe" },
        ],
        importantLabel: "Wichtig",
        importantText:
          "Wir erheben keine Analysedaten ohne Ihre ausdrückliche Einwilligung. Sie können Ihre Präferenzen jederzeit über unser Cookie-Einwilligungsbanner verwalten.",
      },
      legalBasis: {
        title: "3. Rechtsgrundlage der Verarbeitung",
        body: "Wir verarbeiten Ihre personenbezogenen Daten auf Grundlage der folgenden Rechtsgrundlagen:",
        items: [
          { label: "Einwilligung", text: "Für Analysen und Marketingkommunikation (Sie können sie jederzeit widerrufen)" },
          { label: "Vertrag", text: "Zur Bereitstellung unserer Dienste, wenn Sie ein Konto erstellen oder unsere Plattform nutzen" },
          { label: "Berechtigtes Interesse", text: "Für Sicherheit, Betrugsprävention und Verbesserung des Dienstes" },
          { label: "Rechtliche Verpflichtung", text: "Zur Einhaltung geltender Gesetze und Vorschriften" },
        ],
      },
      useData: {
        title: "4. Wie wir Ihre Daten verwenden",
        items: [
          "Zur Bereitstellung und Aufrechterhaltung unserer Dienste",
          "Zur Verarbeitung Ihrer Kontoregistrierung und Verwaltung Ihres Profils",
          "Zur Erleichterung der Kommunikation zwischen Nutzern und Anbietern von Einträgen",
          "Zur Verbesserung unserer Website und Nutzererfahrung (mit Einwilligung)",
          "Zum Versand dienstbezogener Benachrichtigungen",
          "Zur Erkennung und Verhinderung von Betrug und Sicherheitsbedrohungen",
          "Zur Erfüllung gesetzlicher Verpflichtungen",
        ],
      },
      retention: {
        title: "5. Datenspeicherung",
        body: "Wir speichern Ihre personenbezogenen Daten nur so lange, wie es erforderlich ist:",
        rows: [
          ["Kontodaten", "Bis zur Kontolöschung + 30 Tage"],
          ["Analyseereignisse", "90 Tage (automatisch gelöscht)"],
          ["Aufruf-Tracking-Daten", "90 Tage (automatisch gelöscht)"],
          ["Nachrichten", "Bis zur Löschung der Unterhaltung"],
          ["Sicherheitsaudit-Protokolle", "1 Jahr (zu Sicherheitszwecken)"],
        ],
      },
      rights: {
        title: "6. Ihre Rechte nach der DSGVO",
        body: "Als betroffene Person haben Sie die folgenden Rechte:",
        cards: [
          { title: "Auskunftsrecht", text: "Eine Kopie der personenbezogenen Daten anfordern, die wir über Sie speichern" },
          { title: "Recht auf Berichtigung", text: "Die Korrektur unrichtiger oder unvollständiger Daten verlangen" },
          { title: "Recht auf Löschung", text: "Die Löschung Ihrer personenbezogenen Daten verlangen (\"Recht auf Vergessenwerden\")" },
          { title: "Recht auf Einschränkung der Verarbeitung", text: "Eine Einschränkung der Nutzung Ihrer Daten verlangen" },
          { title: "Recht auf Datenübertragbarkeit", text: "Ihre Daten in einem strukturierten, maschinenlesbaren Format erhalten" },
          { title: "Widerspruchsrecht", text: "Der Verarbeitung auf Grundlage berechtigter Interessen widersprechen" },
          { title: "Recht auf Widerruf der Einwilligung", text: "Ihre Einwilligung für einwilligungsbasierte Verarbeitung jederzeit widerrufen (z. B. Analysen)" },
        ],
        exercisePrefix: "Zur Ausübung dieser Rechte kontaktieren Sie uns bitte unter",
      },
      security: {
        title: "7. Datensicherheit",
        body: "Wir setzen geeignete technische und organisatorische Maßnahmen ein, um Ihre Daten zu schützen:",
        items: [
          "Verschlüsselung von Daten bei der Übertragung (TLS/SSL) und im Ruhezustand",
          "Row-Level-Security-Richtlinien (RLS), die sicherstellen, dass Nutzer nur auf ihre eigenen Daten zugreifen können",
          "Automatische Anonymisierung von IP-Adressen auf Datenbankebene",
          "Regelmäßige Sicherheitsaudits und Zugriffsprotokollierung",
          "Strenge Zugriffskontrollen für administrative Funktionen",
        ],
      },
      cookies: {
        title: "8. Cookies und Tracking",
        body: "Wir verwenden die folgenden Arten von Cookies:",
        rows: [
          ["Erforderlich", "Authentifizierung, Sicherheit, Spracheinstellungen", "Nein"],
          ["Analyse", "Seitenaufrufe, Sitzungsverfolgung, Nutzungsmuster", "Ja"],
        ],
        manageText:
          "Sie können Ihre Cookie-Einstellungen jederzeit über das Cookie-Einwilligungsbanner verwalten oder den lokalen Speicher Ihres Browsers löschen.",
      },
      thirdParties: {
        title: "9. Dienste Dritter",
        body: "Wir nutzen die folgenden Drittanbieterdienste, die Ihre Daten verarbeiten können:",
        items: [
          { label: "Supabase", text: "Datenbank- und Authentifizierungsdienste (EU-basierte Infrastruktur verfügbar)" },
          { label: "Google", text: "Optionale OAuth-Authentifizierung (wenn Sie sich mit Google anmelden)" },
        ],
        processorText:
          "Alle Drittverarbeiter sind durch Datenverarbeitungsvereinbarungen gebunden, die die Einhaltung der DSGVO sicherstellen.",
      },
      transfers: {
        title: "10. Internationale Datenübermittlungen",
        body: "Ihre Daten können in Länder außerhalb des Europäischen Wirtschaftsraums (EWR) übermittelt und dort verarbeitet werden. In diesem Fall stellen wir sicher, dass geeignete Garantien bestehen, darunter:",
        items: [
          "Von der Europäischen Kommission genehmigte Standardvertragsklauseln (SCCs)",
          "Angemessenheitsbeschlüsse für Länder mit gleichwertigem Datenschutz",
          "Verbindliche interne Datenschutzvorschriften für Konzernunternehmen",
        ],
      },
      contact: {
        title: "11. Kontakt",
        body: "Wenn Sie Fragen zu dieser Datenschutzerklärung haben, Ihre Rechte ausüben möchten oder eine Beschwerde haben, kontaktieren Sie uns bitte:",
        responseTime: "Innerhalb von 30 Tagen, wie von der DSGVO vorgeschrieben",
        authorityText:
          "Sie haben außerdem das Recht, Beschwerde bei Ihrer lokalen Datenschutzaufsichtsbehörde einzulegen. In Portugal ist dies die Comissão Nacional de Proteção de Dados (CNPD).",
      },
      changes: {
        title: "12. Änderungen dieser Erklärung",
        body: "Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Über wesentliche Änderungen informieren wir Sie, indem wir die neue Datenschutzerklärung auf dieser Seite veröffentlichen und das Datum der \"Zuletzt aktualisiert\"-Angabe ändern. Wir empfehlen Ihnen, diese Datenschutzerklärung regelmäßig zu überprüfen.",
      },
    },
  },
  es: {
    pageTitle: "Política de privacidad",
    introduction:
      "AlgarveOfficial (\"nosotros\", \"nuestro\" o \"nos\") se compromete a proteger su privacidad y a garantizar el cumplimiento del Reglamento General de Protección de Datos (RGPD) y otras leyes de protección de datos aplicables. Esta Política de privacidad explica cómo recopilamos, usamos, conservamos y protegemos sus datos personales cuando utiliza nuestro sitio web y nuestros servicios.",
    lastUpdatedLabel: "Última actualización",
    lastUpdatedDate: "21 de enero de 2026",
    metaDescription:
      "Revise cómo AlgarveOfficial recopila, utiliza, conserva y protege datos personales conforme al RGPD y las leyes de protección de datos aplicables.",
    labels: {
      email: "Correo electrónico",
      address: "Dirección",
      responseTime: "Tiempo de respuesta",
      dataType: "Tipo de datos",
      retentionPeriod: "Periodo de conservación",
      type: "Tipo",
      purpose: "Finalidad",
      consentRequired: "Consentimiento requerido",
      no: "No",
      yes: "Sí",
    },
    sections: {
      dataController: {
        title: "1. Responsable del tratamiento",
        body: "AlgarveOfficial es el responsable del tratamiento de sus datos personales. Si tiene alguna pregunta sobre esta Política de privacidad o sobre nuestras prácticas de datos, puede contactarnos en:",
        address: "Algarve, distrito de Faro, Portugal",
      },
      dataWeCollect: {
        title: "2. Datos que recopilamos",
        providedTitle: "2.1 Información que usted proporciona",
        providedItems: [
          { label: "Datos de cuenta", text: "Nombre, dirección de correo electrónico y contraseña cuando crea una cuenta" },
          { label: "Datos de perfil", text: "Información opcional como número de teléfono, biografía y foto de perfil" },
          { label: "Datos de comunicación", text: "Mensajes que envía a propietarios de anuncios a través de nuestra plataforma" },
          { label: "Datos de anuncios", text: "Información proporcionada por propietarios de negocios para sus anuncios" },
        ],
        automaticTitle: "2.2 Datos recopilados automáticamente",
        consentStrong: "Solo con su consentimiento explícito",
        consentRest: "podemos recopilar:",
        automaticItems: [
          { label: "Datos analíticos", text: "Vistas de página, duración de la sesión y patrones de interacción" },
          { label: "Datos técnicos", text: "Tipo de navegador, tipo de dispositivo y dirección IP anonimizada (los dos últimos octetos se enmascaran)" },
          { label: "Identificadores de sesión", text: "ID de sesión anónimos para evitar el recuento duplicado de vistas" },
        ],
        importantLabel: "Importante",
        importantText:
          "No recopilamos ningún dato analítico sin su consentimiento explícito. Puede gestionar sus preferencias en cualquier momento mediante nuestro banner de consentimiento de cookies.",
      },
      legalBasis: {
        title: "3. Base jurídica del tratamiento",
        body: "Tratamos sus datos personales sobre las siguientes bases jurídicas:",
        items: [
          { label: "Consentimiento", text: "Para analítica y comunicaciones de marketing (puede retirarlo en cualquier momento)" },
          { label: "Contrato", text: "Para prestar nuestros servicios cuando crea una cuenta o utiliza nuestra plataforma" },
          { label: "Interés legítimo", text: "Para seguridad, prevención del fraude y mejora del servicio" },
          { label: "Obligación legal", text: "Para cumplir leyes y normativas aplicables" },
        ],
      },
      useData: {
        title: "4. Cómo usamos sus datos",
        items: [
          "Para prestar y mantener nuestros servicios",
          "Para procesar el registro de su cuenta y gestionar su perfil",
          "Para facilitar la comunicación entre usuarios y propietarios de anuncios",
          "Para mejorar nuestro sitio web y la experiencia del usuario (con consentimiento)",
          "Para enviar notificaciones relacionadas con el servicio",
          "Para detectar y prevenir el fraude y las amenazas de seguridad",
          "Para cumplir obligaciones legales",
        ],
      },
      retention: {
        title: "5. Conservación de datos",
        body: "Conservamos sus datos personales solo durante el tiempo necesario:",
        rows: [
          ["Datos de cuenta", "Hasta la eliminación de la cuenta + 30 días"],
          ["Eventos analíticos", "90 días (eliminados automáticamente)"],
          ["Datos de seguimiento de vistas", "90 días (eliminados automáticamente)"],
          ["Mensajes", "Hasta la eliminación de la conversación"],
          ["Registros de auditoría de seguridad", "1 año (por motivos de seguridad)"],
        ],
      },
      rights: {
        title: "6. Sus derechos conforme al RGPD",
        body: "Como interesado, tiene los siguientes derechos:",
        cards: [
          { title: "Derecho de acceso", text: "Solicitar una copia de los datos personales que conservamos sobre usted" },
          { title: "Derecho de rectificación", text: "Solicitar la corrección de datos inexactos o incompletos" },
          { title: "Derecho de supresión", text: "Solicitar la eliminación de sus datos personales (\"derecho al olvido\")" },
          { title: "Derecho a limitar el tratamiento", text: "Solicitar la limitación de cómo usamos sus datos" },
          { title: "Derecho a la portabilidad de los datos", text: "Recibir sus datos en un formato estructurado y legible por máquina" },
          { title: "Derecho de oposición", text: "Oponerse al tratamiento basado en intereses legítimos" },
          { title: "Derecho a retirar el consentimiento", text: "Retirar su consentimiento en cualquier momento para tratamientos basados en el consentimiento (por ejemplo, analítica)" },
        ],
        exercisePrefix: "Para ejercer cualquiera de estos derechos, contáctenos en",
      },
      security: {
        title: "7. Seguridad de los datos",
        body: "Aplicamos medidas técnicas y organizativas adecuadas para proteger sus datos:",
        items: [
          "Cifrado de datos en tránsito (TLS/SSL) y en reposo",
          "Políticas de seguridad a nivel de fila (RLS) que garantizan que los usuarios solo accedan a sus propios datos",
          "Anonimización automática de direcciones IP a nivel de base de datos",
          "Auditorías de seguridad periódicas y registro de accesos",
          "Controles de acceso estrictos para funciones administrativas",
        ],
      },
      cookies: {
        title: "8. Cookies y seguimiento",
        body: "Utilizamos los siguientes tipos de cookies:",
        rows: [
          ["Esenciales", "Autenticación, seguridad, preferencias de idioma", "No"],
          ["Analíticas", "Vistas de página, seguimiento de sesión, patrones de uso", "Sí"],
        ],
        manageText:
          "Puede gestionar sus preferencias de cookies en cualquier momento mediante el banner de consentimiento de cookies o borrando el almacenamiento local de su navegador.",
      },
      thirdParties: {
        title: "9. Servicios de terceros",
        body: "Utilizamos los siguientes servicios de terceros que pueden tratar sus datos:",
        items: [
          { label: "Supabase", text: "Servicios de base de datos y autenticación (infraestructura basada en la UE disponible)" },
          { label: "Google", text: "Autenticación OAuth opcional (si decide iniciar sesión con Google)" },
        ],
        processorText:
          "Todos los encargados del tratamiento de terceros están sujetos a acuerdos de tratamiento de datos que garantizan el cumplimiento del RGPD.",
      },
      transfers: {
        title: "10. Transferencias internacionales de datos",
        body: "Sus datos pueden transferirse y tratarse en países fuera del Espacio Económico Europeo (EEE). Cuando esto ocurra, nos aseguramos de que existan garantías adecuadas, como:",
        items: [
          "Cláusulas Contractuales Tipo (CCT) aprobadas por la Comisión Europea",
          "Decisiones de adecuación para países con protección de datos equivalente",
          "Normas corporativas vinculantes para empresas del grupo",
        ],
      },
      contact: {
        title: "11. Contacto",
        body: "Si tiene preguntas sobre esta Política de privacidad, desea ejercer sus derechos o presentar una reclamación, contáctenos:",
        responseTime: "Dentro de los 30 días, según exige el RGPD",
        authorityText:
          "También tiene derecho a presentar una reclamación ante su autoridad local de protección de datos. En Portugal, esta es la Comissão Nacional de Proteção de Dados (CNPD).",
      },
      changes: {
        title: "12. Cambios en esta política",
        body: "Podemos actualizar esta Política de privacidad ocasionalmente. Le notificaremos cualquier cambio material publicando la nueva Política de privacidad en esta página y actualizando la fecha de \"Última actualización\". Le recomendamos revisar esta Política de privacidad periódicamente.",
      },
    },
  },
  it: {
    pageTitle: "Informativa sulla privacy",
    introduction:
      "AlgarveOfficial (\"noi\", \"nostro\" o \"ci\") si impegna a proteggere la tua privacy e a garantire il rispetto del Regolamento generale sulla protezione dei dati (GDPR) e delle altre leggi applicabili in materia di protezione dei dati. La presente Informativa sulla privacy spiega come raccogliamo, utilizziamo, conserviamo e proteggiamo i tuoi dati personali quando utilizzi il nostro sito web e i nostri servizi.",
    lastUpdatedLabel: "Ultimo aggiornamento",
    lastUpdatedDate: "21 gennaio 2026",
    metaDescription:
      "Scopri come AlgarveOfficial raccoglie, utilizza, conserva e protegge i dati personali ai sensi del GDPR e delle leggi applicabili.",
    labels: {
      email: "Email",
      address: "Indirizzo",
      responseTime: "Tempo di risposta",
      dataType: "Tipo di dati",
      retentionPeriod: "Periodo di conservazione",
      type: "Tipo",
      purpose: "Finalità",
      consentRequired: "Consenso richiesto",
      no: "No",
      yes: "Sì",
    },
    sections: {
      dataController: {
        title: "1. Titolare del trattamento",
        body: "AlgarveOfficial è il titolare del trattamento responsabile dei tuoi dati personali. Per domande sulla presente Informativa sulla privacy o sulle nostre pratiche relative ai dati, contattaci a:",
        address: "Algarve, distretto di Faro, Portogallo",
      },
      dataWeCollect: {
        title: "2. Dati che raccogliamo",
        providedTitle: "2.1 Informazioni che fornisci",
        providedItems: [
          { label: "Dati dell'account", text: "Nome, indirizzo email e password quando crei un account" },
          { label: "Dati del profilo", text: "Informazioni facoltative come numero di telefono, biografia e foto del profilo" },
          { label: "Dati di comunicazione", text: "Messaggi che invii tramite la nostra piattaforma ai proprietari degli annunci" },
          { label: "Dati degli annunci", text: "Informazioni fornite dai titolari di attività per i loro annunci" },
        ],
        automaticTitle: "2.2 Dati raccolti automaticamente",
        consentStrong: "Solo con il tuo consenso esplicito",
        consentRest: "possiamo raccogliere:",
        automaticItems: [
          { label: "Dati analitici", text: "Visualizzazioni di pagina, durata della sessione e modelli di interazione" },
          { label: "Dati tecnici", text: "Tipo di browser, tipo di dispositivo e indirizzo IP anonimizzato (gli ultimi due ottetti sono mascherati)" },
          { label: "Identificatori di sessione", text: "ID di sessione anonimi per evitare il conteggio duplicato delle visualizzazioni" },
        ],
        importantLabel: "Importante",
        importantText:
          "Non raccogliamo dati analitici senza il tuo consenso esplicito. Puoi gestire le tue preferenze in qualsiasi momento tramite il nostro banner di consenso ai cookie.",
      },
      legalBasis: {
        title: "3. Base giuridica del trattamento",
        body: "Trattiamo i tuoi dati personali sulla base delle seguenti basi giuridiche:",
        items: [
          { label: "Consenso", text: "Per analisi e comunicazioni di marketing (puoi revocarlo in qualsiasi momento)" },
          { label: "Contratto", text: "Per fornire i nostri servizi quando crei un account o utilizzi la nostra piattaforma" },
          { label: "Legittimo interesse", text: "Per sicurezza, prevenzione delle frodi e miglioramento del servizio" },
          { label: "Obbligo legale", text: "Per rispettare leggi e regolamenti applicabili" },
        ],
      },
      useData: {
        title: "4. Come utilizziamo i tuoi dati",
        items: [
          "Per fornire e mantenere i nostri servizi",
          "Per elaborare la registrazione del tuo account e gestire il tuo profilo",
          "Per facilitare la comunicazione tra utenti e proprietari degli annunci",
          "Per migliorare il nostro sito web e l'esperienza utente (con consenso)",
          "Per inviare notifiche relative al servizio",
          "Per rilevare e prevenire frodi e minacce alla sicurezza",
          "Per adempiere a obblighi legali",
        ],
      },
      retention: {
        title: "5. Conservazione dei dati",
        body: "Conserviamo i tuoi dati personali solo per il tempo necessario:",
        rows: [
          ["Dati dell'account", "Fino all'eliminazione dell'account + 30 giorni"],
          ["Eventi analitici", "90 giorni (eliminati automaticamente)"],
          ["Dati di tracciamento delle visualizzazioni", "90 giorni (eliminati automaticamente)"],
          ["Messaggi", "Fino all'eliminazione della conversazione"],
          ["Log di audit di sicurezza", "1 anno (per finalità di sicurezza)"],
        ],
      },
      rights: {
        title: "6. I tuoi diritti ai sensi del GDPR",
        body: "In qualità di interessato, hai i seguenti diritti:",
        cards: [
          { title: "Diritto di accesso", text: "Richiedere una copia dei dati personali che conserviamo su di te" },
          { title: "Diritto di rettifica", text: "Richiedere la correzione di dati inesatti o incompleti" },
          { title: "Diritto alla cancellazione", text: "Richiedere la cancellazione dei tuoi dati personali (\"diritto all'oblio\")" },
          { title: "Diritto di limitazione del trattamento", text: "Richiedere la limitazione del modo in cui utilizziamo i tuoi dati" },
          { title: "Diritto alla portabilità dei dati", text: "Ricevere i tuoi dati in un formato strutturato e leggibile da macchina" },
          { title: "Diritto di opposizione", text: "Opporti al trattamento basato su legittimi interessi" },
          { title: "Diritto di revoca del consenso", text: "Revocare il consenso in qualsiasi momento per trattamenti basati sul consenso (ad esempio, analisi)" },
        ],
        exercisePrefix: "Per esercitare uno qualsiasi di questi diritti, contattaci a",
      },
      security: {
        title: "7. Sicurezza dei dati",
        body: "Implementiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati:",
        items: [
          "Crittografia dei dati in transito (TLS/SSL) e a riposo",
          "Policy di Row-Level Security (RLS) che garantiscono agli utenti l'accesso solo ai propri dati",
          "Anonimizzazione automatica degli indirizzi IP a livello di database",
          "Audit di sicurezza regolari e registrazione degli accessi",
          "Controlli di accesso rigorosi per le funzioni amministrative",
        ],
      },
      cookies: {
        title: "8. Cookie e tracciamento",
        body: "Utilizziamo i seguenti tipi di cookie:",
        rows: [
          ["Essenziali", "Autenticazione, sicurezza, preferenze linguistiche", "No"],
          ["Analitici", "Visualizzazioni di pagina, tracciamento della sessione, modelli di utilizzo", "Sì"],
        ],
        manageText:
          "Puoi gestire le preferenze sui cookie in qualsiasi momento tramite il banner di consenso ai cookie o cancellando l'archiviazione locale del browser.",
      },
      thirdParties: {
        title: "9. Servizi di terze parti",
        body: "Utilizziamo i seguenti servizi di terze parti che possono trattare i tuoi dati:",
        items: [
          { label: "Supabase", text: "Servizi di database e autenticazione (infrastruttura basata nell'UE disponibile)" },
          { label: "Google", text: "Autenticazione OAuth facoltativa (se scegli di accedere con Google)" },
        ],
        processorText:
          "Tutti i responsabili del trattamento di terze parti sono vincolati da accordi sul trattamento dei dati che garantiscono la conformità al GDPR.",
      },
      transfers: {
        title: "10. Trasferimenti internazionali di dati",
        body: "I tuoi dati possono essere trasferiti e trattati in paesi al di fuori dello Spazio economico europeo (SEE). In tal caso, garantiamo l'adozione di adeguate misure di salvaguardia, quali:",
        items: [
          "Clausole contrattuali standard (SCC) approvate dalla Commissione europea",
          "Decisioni di adeguatezza per paesi con protezione dei dati equivalente",
          "Norme vincolanti d'impresa per le società del gruppo",
        ],
      },
      contact: {
        title: "11. Contattaci",
        body: "Se hai domande sulla presente Informativa sulla privacy, desideri esercitare i tuoi diritti o presentare un reclamo, contattaci:",
        responseTime: "Entro 30 giorni come richiesto dal GDPR",
        authorityText:
          "Hai inoltre il diritto di presentare reclamo alla tua autorità locale per la protezione dei dati. In Portogallo, questa autorità è la Comissão Nacional de Proteção de Dados (CNPD).",
      },
      changes: {
        title: "12. Modifiche alla presente informativa",
        body: "Potremmo aggiornare periodicamente la presente Informativa sulla privacy. Ti informeremo di eventuali modifiche rilevanti pubblicando la nuova Informativa sulla privacy su questa pagina e aggiornando la data di \"Ultimo aggiornamento\". Ti invitiamo a consultarla periodicamente.",
      },
    },
  },
  nl: {
    pageTitle: "Privacybeleid",
    introduction:
      "AlgarveOfficial (\"wij\", \"ons\" of \"onze\") zet zich in om uw privacy te beschermen en te voldoen aan de Algemene verordening gegevensbescherming (AVG) en andere toepasselijke wetgeving inzake gegevensbescherming. Dit Privacybeleid legt uit hoe wij uw persoonsgegevens verzamelen, gebruiken, bewaren en beschermen wanneer u onze website en diensten gebruikt.",
    lastUpdatedLabel: "Laatst bijgewerkt",
    lastUpdatedDate: "21 januari 2026",
    metaDescription:
      "Lees hoe AlgarveOfficial persoonsgegevens verzamelt, gebruikt, bewaart en beschermt volgens de AVG en toepasselijke privacywetgeving.",
    labels: {
      email: "E-mail",
      address: "Adres",
      responseTime: "Reactietermijn",
      dataType: "Gegevenstype",
      retentionPeriod: "Bewaartermijn",
      type: "Type",
      purpose: "Doel",
      consentRequired: "Toestemming vereist",
      no: "Nee",
      yes: "Ja",
    },
    sections: {
      dataController: {
        title: "1. Verwerkingsverantwoordelijke",
        body: "AlgarveOfficial is de verwerkingsverantwoordelijke voor uw persoonsgegevens. Als u vragen heeft over dit Privacybeleid of over onze gegevenspraktijken, neem dan contact met ons op via:",
        address: "Algarve, district Faro, Portugal",
      },
      dataWeCollect: {
        title: "2. Gegevens die wij verzamelen",
        providedTitle: "2.1 Informatie die u verstrekt",
        providedItems: [
          { label: "Accountgegevens", text: "Naam, e-mailadres en wachtwoord wanneer u een account aanmaakt" },
          { label: "Profielgegevens", text: "Optionele informatie zoals telefoonnummer, biografie en profielfoto" },
          { label: "Communicatiegegevens", text: "Berichten die u via ons platform naar eigenaren van vermeldingen stuurt" },
          { label: "Vermeldingsgegevens", text: "Informatie die ondernemers voor hun vermeldingen verstrekken" },
        ],
        automaticTitle: "2.2 Automatisch verzamelde gegevens",
        consentStrong: "Alleen met uw uitdrukkelijke toestemming",
        consentRest: "kunnen wij verzamelen:",
        automaticItems: [
          { label: "Analysegegevens", text: "Paginaweergaven, sessieduur en interactiepatronen" },
          { label: "Technische gegevens", text: "Browsertype, apparaattype en geanonimiseerd IP-adres (de laatste twee octetten worden gemaskeerd)" },
          { label: "Sessie-identificatoren", text: "Anonieme sessie-ID's om dubbele telling van weergaven te voorkomen" },
        ],
        importantLabel: "Belangrijk",
        importantText:
          "Wij verzamelen geen analysegegevens zonder uw uitdrukkelijke toestemming. U kunt uw voorkeuren op elk moment beheren via onze cookie-toestemmingsbanner.",
      },
      legalBasis: {
        title: "3. Rechtsgrond voor verwerking",
        body: "Wij verwerken uw persoonsgegevens op basis van de volgende rechtsgronden:",
        items: [
          { label: "Toestemming", text: "Voor analyses en marketingcommunicatie (u kunt deze op elk moment intrekken)" },
          { label: "Overeenkomst", text: "Om onze diensten te leveren wanneer u een account aanmaakt of ons platform gebruikt" },
          { label: "Gerechtvaardigd belang", text: "Voor beveiliging, fraudepreventie en verbetering van de dienst" },
          { label: "Wettelijke verplichting", text: "Om te voldoen aan toepasselijke wet- en regelgeving" },
        ],
      },
      useData: {
        title: "4. Hoe wij uw gegevens gebruiken",
        items: [
          "Om onze diensten te leveren en te onderhouden",
          "Om uw accountregistratie te verwerken en uw profiel te beheren",
          "Om communicatie tussen gebruikers en eigenaren van vermeldingen mogelijk te maken",
          "Om onze website en gebruikerservaring te verbeteren (met toestemming)",
          "Om dienstgerelateerde meldingen te verzenden",
          "Om fraude en beveiligingsdreigingen te detecteren en te voorkomen",
          "Om aan wettelijke verplichtingen te voldoen",
        ],
      },
      retention: {
        title: "5. Bewaren van gegevens",
        body: "Wij bewaren uw persoonsgegevens alleen zolang als nodig is:",
        rows: [
          ["Accountgegevens", "Tot verwijdering van het account + 30 dagen"],
          ["Analysegebeurtenissen", "90 dagen (automatisch verwijderd)"],
          ["Weergave-trackinggegevens", "90 dagen (automatisch verwijderd)"],
          ["Berichten", "Tot verwijdering van het gesprek"],
          ["Beveiligingsauditlogs", "1 jaar (voor beveiligingsdoeleinden)"],
        ],
      },
      rights: {
        title: "6. Uw rechten onder de AVG",
        body: "Als betrokkene heeft u de volgende rechten:",
        cards: [
          { title: "Recht op inzage", text: "Een kopie vragen van de persoonsgegevens die wij over u bewaren" },
          { title: "Recht op rectificatie", text: "Correctie vragen van onjuiste of onvolledige gegevens" },
          { title: "Recht op wissing", text: "Verwijdering vragen van uw persoonsgegevens (\"recht om vergeten te worden\")" },
          { title: "Recht op beperking van verwerking", text: "Beperking vragen van hoe wij uw gegevens gebruiken" },
          { title: "Recht op gegevensoverdraagbaarheid", text: "Uw gegevens ontvangen in een gestructureerd, machineleesbaar formaat" },
          { title: "Recht van bezwaar", text: "Bezwaar maken tegen verwerking op basis van gerechtvaardigde belangen" },
          { title: "Recht om toestemming in te trekken", text: "Uw toestemming op elk moment intrekken voor verwerking op basis van toestemming (bijv. analyses)" },
        ],
        exercisePrefix: "Om een van deze rechten uit te oefenen, kunt u contact met ons opnemen via",
      },
      security: {
        title: "7. Gegevensbeveiliging",
        body: "Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen:",
        items: [
          "Versleuteling van gegevens tijdens overdracht (TLS/SSL) en in rust",
          "Row-Level Security (RLS)-beleid dat ervoor zorgt dat gebruikers alleen toegang hebben tot hun eigen gegevens",
          "Automatische anonimisering van IP-adressen op databaseniveau",
          "Regelmatige beveiligingsaudits en toegangsregistratie",
          "Strikte toegangscontroles voor administratieve functies",
        ],
      },
      cookies: {
        title: "8. Cookies en tracking",
        body: "Wij gebruiken de volgende typen cookies:",
        rows: [
          ["Essentieel", "Authenticatie, beveiliging, taalvoorkeuren", "Nee"],
          ["Analyse", "Paginaweergaven, sessietracking, gebruikspatronen", "Ja"],
        ],
        manageText:
          "U kunt uw cookievoorkeuren op elk moment beheren via de cookie-toestemmingsbanner of door de lokale opslag van uw browser te wissen.",
      },
      thirdParties: {
        title: "9. Diensten van derden",
        body: "Wij gebruiken de volgende diensten van derden die uw gegevens kunnen verwerken:",
        items: [
          { label: "Supabase", text: "Database- en authenticatiediensten (EU-gebaseerde infrastructuur beschikbaar)" },
          { label: "Google", text: "Optionele OAuth-authenticatie (als u ervoor kiest in te loggen met Google)" },
        ],
        processorText:
          "Alle externe verwerkers zijn gebonden aan verwerkersovereenkomsten die naleving van de AVG waarborgen.",
      },
      transfers: {
        title: "10. Internationale gegevensdoorgiften",
        body: "Uw gegevens kunnen worden overgedragen naar en verwerkt in landen buiten de Europese Economische Ruimte (EER). Wanneer dit gebeurt, zorgen wij voor passende waarborgen, zoals:",
        items: [
          "Standaardcontractbepalingen (SCC's) goedgekeurd door de Europese Commissie",
          "Adequaatheidsbesluiten voor landen met gelijkwaardige gegevensbescherming",
          "Bindende bedrijfsvoorschriften voor groepsmaatschappijen",
        ],
      },
      contact: {
        title: "11. Contact",
        body: "Als u vragen heeft over dit Privacybeleid, uw rechten wilt uitoefenen of een klacht heeft, neem dan contact met ons op:",
        responseTime: "Binnen 30 dagen zoals vereist door de AVG",
        authorityText:
          "U heeft ook het recht om een klacht in te dienen bij uw lokale gegevensbeschermingsautoriteit. In Portugal is dit de Comissão Nacional de Proteção de Dados (CNPD).",
      },
      changes: {
        title: "12. Wijzigingen in dit beleid",
        body: "Wij kunnen dit Privacybeleid van tijd tot tijd bijwerken. Wij stellen u op de hoogte van wezenlijke wijzigingen door het nieuwe Privacybeleid op deze pagina te plaatsen en de datum \"Laatst bijgewerkt\" aan te passen. Wij raden u aan dit Privacybeleid regelmatig te bekijken.",
      },
    },
  },
  sv: {
    pageTitle: "Integritetspolicy",
    introduction:
      "AlgarveOfficial (\"vi\", \"oss\" eller \"vår\") åtar sig att skydda din integritet och säkerställa efterlevnad av den allmänna dataskyddsförordningen (GDPR) och annan tillämplig dataskyddslagstiftning. Denna Integritetspolicy förklarar hur vi samlar in, använder, lagrar och skyddar dina personuppgifter när du använder vår webbplats och våra tjänster.",
    lastUpdatedLabel: "Senast uppdaterad",
    lastUpdatedDate: "21 januari 2026",
    metaDescription:
      "Se hur AlgarveOfficial samlar in, använder, lagrar och skyddar personuppgifter enligt GDPR och tillämplig dataskyddslagstiftning.",
    labels: {
      email: "E-post",
      address: "Adress",
      responseTime: "Svarstid",
      dataType: "Datatyp",
      retentionPeriod: "Lagringsperiod",
      type: "Typ",
      purpose: "Syfte",
      consentRequired: "Samtycke krävs",
      no: "Nej",
      yes: "Ja",
    },
    sections: {
      dataController: {
        title: "1. Personuppgiftsansvarig",
        body: "AlgarveOfficial är personuppgiftsansvarig för dina personuppgifter. Om du har frågor om denna Integritetspolicy eller våra rutiner för personuppgifter kan du kontakta oss på:",
        address: "Algarve, Faro-distriktet, Portugal",
      },
      dataWeCollect: {
        title: "2. Uppgifter vi samlar in",
        providedTitle: "2.1 Information du lämnar",
        providedItems: [
          { label: "Kontouppgifter", text: "Namn, e-postadress och lösenord när du skapar ett konto" },
          { label: "Profiluppgifter", text: "Valfri information som telefonnummer, biografi och profilbild" },
          { label: "Kommunikationsuppgifter", text: "Meddelanden som du skickar via vår plattform till annonsägare" },
          { label: "Annonsuppgifter", text: "Information som företagsägare lämnar för sina annonser" },
        ],
        automaticTitle: "2.2 Automatiskt insamlade uppgifter",
        consentStrong: "Endast med ditt uttryckliga samtycke",
        consentRest: "kan vi samla in:",
        automaticItems: [
          { label: "Analysuppgifter", text: "Sidvisningar, sessionslängd och interaktionsmönster" },
          { label: "Tekniska uppgifter", text: "Webbläsartyp, enhetstyp och anonymiserad IP-adress (de två sista oktetterna maskeras)" },
          { label: "Sessionsidentifierare", text: "Anonyma sessions-ID:n för att undvika dubbla visningsräkningar" },
        ],
        importantLabel: "Viktigt",
        importantText:
          "Vi samlar inte in några analysuppgifter utan ditt uttryckliga samtycke. Du kan när som helst hantera dina inställningar via vår cookie-samtyckesbanner.",
      },
      legalBasis: {
        title: "3. Rättslig grund för behandling",
        body: "Vi behandlar dina personuppgifter med stöd av följande rättsliga grunder:",
        items: [
          { label: "Samtycke", text: "För analyser och marknadskommunikation (du kan återkalla det när som helst)" },
          { label: "Avtal", text: "För att tillhandahålla våra tjänster när du skapar ett konto eller använder vår plattform" },
          { label: "Berättigat intresse", text: "För säkerhet, bedrägeriförebyggande och förbättring av tjänsten" },
          { label: "Rättslig skyldighet", text: "För att följa tillämpliga lagar och regler" },
        ],
      },
      useData: {
        title: "4. Hur vi använder dina uppgifter",
        items: [
          "För att tillhandahålla och underhålla våra tjänster",
          "För att behandla din kontoregistrering och hantera din profil",
          "För att underlätta kommunikation mellan användare och annonsägare",
          "För att förbättra vår webbplats och användarupplevelse (med samtycke)",
          "För att skicka tjänsterelaterade meddelanden",
          "För att upptäcka och förebygga bedrägerier och säkerhetshot",
          "För att uppfylla rättsliga skyldigheter",
        ],
      },
      retention: {
        title: "5. Lagring av uppgifter",
        body: "Vi sparar dina personuppgifter endast så länge det är nödvändigt:",
        rows: [
          ["Kontouppgifter", "Tills kontot raderas + 30 dagar"],
          ["Analyshändelser", "90 dagar (rensas automatiskt)"],
          ["Visningsspårningsdata", "90 dagar (rensas automatiskt)"],
          ["Meddelanden", "Tills konversationen raderas"],
          ["Säkerhetsrevisionsloggar", "1 år (för säkerhetsändamål)"],
        ],
      },
      rights: {
        title: "6. Dina rättigheter enligt GDPR",
        body: "Som registrerad har du följande rättigheter:",
        cards: [
          { title: "Rätt till tillgång", text: "Begära en kopia av de personuppgifter vi har om dig" },
          { title: "Rätt till rättelse", text: "Begära rättelse av felaktiga eller ofullständiga uppgifter" },
          { title: "Rätt till radering", text: "Begära radering av dina personuppgifter (\"rätten att bli bortglömd\")" },
          { title: "Rätt till begränsning av behandling", text: "Begära begränsning av hur vi använder dina uppgifter" },
          { title: "Rätt till dataportabilitet", text: "Få dina uppgifter i ett strukturerat, maskinläsbart format" },
          { title: "Rätt att invända", text: "Invända mot behandling som grundas på berättigade intressen" },
          { title: "Rätt att återkalla samtycke", text: "Återkalla ditt samtycke när som helst för samtyckesbaserad behandling (t.ex. analyser)" },
        ],
        exercisePrefix: "För att utöva någon av dessa rättigheter, kontakta oss på",
      },
      security: {
        title: "7. Datasäkerhet",
        body: "Vi genomför lämpliga tekniska och organisatoriska åtgärder för att skydda dina uppgifter:",
        items: [
          "Kryptering av data under överföring (TLS/SSL) och i vila",
          "Row-Level Security-policyer (RLS) som säkerställer att användare endast kan komma åt sina egna uppgifter",
          "Automatisk anonymisering av IP-adresser på databasnivå",
          "Regelbundna säkerhetsrevisioner och åtkomstloggning",
          "Strikta åtkomstkontroller för administrativa funktioner",
        ],
      },
      cookies: {
        title: "8. Cookies och spårning",
        body: "Vi använder följande typer av cookies:",
        rows: [
          ["Nödvändiga", "Autentisering, säkerhet, språkinställningar", "Nej"],
          ["Analys", "Sidvisningar, sessionsspårning, användningsmönster", "Ja"],
        ],
        manageText:
          "Du kan när som helst hantera dina cookie-inställningar via cookie-samtyckesbannern eller genom att rensa webbläsarens lokala lagring.",
      },
      thirdParties: {
        title: "9. Tredjepartstjänster",
        body: "Vi använder följande tredjepartstjänster som kan behandla dina uppgifter:",
        items: [
          { label: "Supabase", text: "Databas- och autentiseringstjänster (EU-baserad infrastruktur tillgänglig)" },
          { label: "Google", text: "Valfri OAuth-autentisering (om du väljer att logga in med Google)" },
        ],
        processorText:
          "Alla tredjepartsbiträden omfattas av personuppgiftsbiträdesavtal som säkerställer efterlevnad av GDPR.",
      },
      transfers: {
        title: "10. Internationella dataöverföringar",
        body: "Dina uppgifter kan överföras till och behandlas i länder utanför Europeiska ekonomiska samarbetsområdet (EES). När detta sker säkerställer vi att lämpliga skyddsåtgärder finns, såsom:",
        items: [
          "Standardavtalsklausuler (SCC) godkända av Europeiska kommissionen",
          "Beslut om adekvat skyddsnivå för länder med likvärdigt dataskydd",
          "Bindande företagsbestämmelser för koncernbolag",
        ],
      },
      contact: {
        title: "11. Kontakta oss",
        body: "Om du har frågor om denna Integritetspolicy, vill utöva dina rättigheter eller har ett klagomål, kontakta oss:",
        responseTime: "Inom 30 dagar enligt GDPR",
        authorityText:
          "Du har också rätt att lämna klagomål till din lokala dataskyddsmyndighet. I Portugal är detta Comissão Nacional de Proteção de Dados (CNPD).",
      },
      changes: {
        title: "12. Ändringar av denna policy",
        body: "Vi kan uppdatera denna Integritetspolicy från tid till annan. Vi meddelar dig om väsentliga ändringar genom att publicera den nya Integritetspolicyn på denna sida och uppdatera datumet \"Senast uppdaterad\". Vi uppmuntrar dig att granska denna Integritetspolicy regelbundet.",
      },
    },
  },
  no: {
    pageTitle: "Personvernerklæring",
    introduction:
      "AlgarveOfficial (\"vi\", \"oss\" eller \"vår\") er opptatt av å beskytte personvernet ditt og sikre etterlevelse av personvernforordningen (GDPR) og annen gjeldende personvernlovgivning. Denne Personvernerklæringen forklarer hvordan vi samler inn, bruker, lagrer og beskytter personopplysningene dine når du bruker nettstedet og tjenestene våre.",
    lastUpdatedLabel: "Sist oppdatert",
    lastUpdatedDate: "21. januar 2026",
    metaDescription:
      "Se hvordan AlgarveOfficial samler inn, bruker, lagrer og beskytter personopplysninger i tråd med GDPR og gjeldende personvernlovgivning.",
    labels: {
      email: "E-post",
      address: "Adresse",
      responseTime: "Svartid",
      dataType: "Datatype",
      retentionPeriod: "Lagringsperiode",
      type: "Type",
      purpose: "Formål",
      consentRequired: "Samtykke kreves",
      no: "Nei",
      yes: "Ja",
    },
    sections: {
      dataController: {
        title: "1. Behandlingsansvarlig",
        body: "AlgarveOfficial er behandlingsansvarlig for personopplysningene dine. Hvis du har spørsmål om denne Personvernerklæringen eller vår behandling av data, kan du kontakte oss på:",
        address: "Algarve, Faro-distriktet, Portugal",
      },
      dataWeCollect: {
        title: "2. Opplysninger vi samler inn",
        providedTitle: "2.1 Informasjon du gir oss",
        providedItems: [
          { label: "Kontodata", text: "Navn, e-postadresse og passord når du oppretter en konto" },
          { label: "Profildata", text: "Valgfri informasjon som telefonnummer, biografi og profilbilde" },
          { label: "Kommunikasjonsdata", text: "Meldinger du sender via plattformen vår til eiere av oppføringer" },
          { label: "Oppføringsdata", text: "Informasjon som bedriftseiere gir for sine oppføringer" },
        ],
        automaticTitle: "2.2 Automatisk innsamlede opplysninger",
        consentStrong: "Bare med ditt uttrykkelige samtykke",
        consentRest: "kan vi samle inn:",
        automaticItems: [
          { label: "Analysedata", text: "Sidevisninger, øktvarighet og interaksjonsmønstre" },
          { label: "Tekniske data", text: "Nettlesertype, enhetstype og anonymisert IP-adresse (de to siste oktettene maskeres)" },
          { label: "Øktidentifikatorer", text: "Anonyme økt-ID-er for å unngå dobbelttelling av visninger" },
        ],
        importantLabel: "Viktig",
        importantText:
          "Vi samler ikke inn analysedata uten ditt uttrykkelige samtykke. Du kan når som helst administrere preferansene dine via vårt banner for samtykke til informasjonskapsler.",
      },
      legalBasis: {
        title: "3. Rettslig grunnlag for behandling",
        body: "Vi behandler personopplysningene dine basert på følgende rettslige grunnlag:",
        items: [
          { label: "Samtykke", text: "For analyse og markedsføringskommunikasjon (du kan trekke det tilbake når som helst)" },
          { label: "Avtale", text: "For å levere tjenestene våre når du oppretter en konto eller bruker plattformen vår" },
          { label: "Berettiget interesse", text: "For sikkerhet, svindelforebygging og forbedring av tjenesten" },
          { label: "Rettslig forpliktelse", text: "For å overholde gjeldende lover og regler" },
        ],
      },
      useData: {
        title: "4. Hvordan vi bruker opplysningene dine",
        items: [
          "For å levere og vedlikeholde tjenestene våre",
          "For å behandle kontoregistreringen din og administrere profilen din",
          "For å legge til rette for kommunikasjon mellom brukere og eiere av oppføringer",
          "For å forbedre nettstedet vårt og brukeropplevelsen (med samtykke)",
          "For å sende tjenesterelaterte varsler",
          "For å oppdage og forhindre svindel og sikkerhetstrusler",
          "For å oppfylle rettslige forpliktelser",
        ],
      },
      retention: {
        title: "5. Lagring av data",
        body: "Vi lagrer personopplysningene dine bare så lenge det er nødvendig:",
        rows: [
          ["Kontodata", "Til kontoen slettes + 30 dager"],
          ["Analysehendelser", "90 dager (slettes automatisk)"],
          ["Visningssporingsdata", "90 dager (slettes automatisk)"],
          ["Meldinger", "Til samtalen slettes"],
          ["Sikkerhetsrevisjonslogger", "1 år (for sikkerhetsformål)"],
        ],
      },
      rights: {
        title: "6. Dine rettigheter etter GDPR",
        body: "Som registrert har du følgende rettigheter:",
        cards: [
          { title: "Rett til innsyn", text: "Be om en kopi av personopplysningene vi har om deg" },
          { title: "Rett til retting", text: "Be om retting av uriktige eller ufullstendige opplysninger" },
          { title: "Rett til sletting", text: "Be om sletting av personopplysningene dine (\"retten til å bli glemt\")" },
          { title: "Rett til begrensning av behandling", text: "Be om begrensning av hvordan vi bruker opplysningene dine" },
          { title: "Rett til dataportabilitet", text: "Motta opplysningene dine i et strukturert, maskinlesbart format" },
          { title: "Rett til å protestere", text: "Protestere mot behandling basert på berettigede interesser" },
          { title: "Rett til å trekke tilbake samtykke", text: "Trekke tilbake samtykket ditt når som helst for samtykkebasert behandling (f.eks. analyse)" },
        ],
        exercisePrefix: "For å utøve noen av disse rettighetene, kontakt oss på",
      },
      security: {
        title: "7. Datasikkerhet",
        body: "Vi iverksetter egnede tekniske og organisatoriske tiltak for å beskytte opplysningene dine:",
        items: [
          "Kryptering av data under overføring (TLS/SSL) og i hvile",
          "Row-Level Security-regler (RLS) som sikrer at brukere bare får tilgang til egne data",
          "Automatisk anonymisering av IP-adresser på databasenivå",
          "Regelmessige sikkerhetsrevisjoner og tilgangslogging",
          "Strenge tilgangskontroller for administrative funksjoner",
        ],
      },
      cookies: {
        title: "8. Informasjonskapsler og sporing",
        body: "Vi bruker følgende typer informasjonskapsler:",
        rows: [
          ["Nødvendige", "Autentisering, sikkerhet, språkinnstillinger", "Nei"],
          ["Analyse", "Sidevisninger, øktsporing, bruksmønstre", "Ja"],
        ],
        manageText:
          "Du kan administrere preferansene dine for informasjonskapsler når som helst via samtykkebanneret eller ved å tømme nettleserens lokale lagring.",
      },
      thirdParties: {
        title: "9. Tredjepartstjenester",
        body: "Vi bruker følgende tredjepartstjenester som kan behandle opplysningene dine:",
        items: [
          { label: "Supabase", text: "Database- og autentiseringstjenester (EU-basert infrastruktur tilgjengelig)" },
          { label: "Google", text: "Valgfri OAuth-autentisering (hvis du velger å logge inn med Google)" },
        ],
        processorText:
          "Alle tredjeparts databehandlere er bundet av databehandleravtaler som sikrer etterlevelse av GDPR.",
      },
      transfers: {
        title: "10. Internasjonale dataoverføringer",
        body: "Opplysningene dine kan overføres til og behandles i land utenfor Det europeiske økonomiske samarbeidsområdet (EØS). Når dette skjer, sørger vi for at egnede garantier er på plass, for eksempel:",
        items: [
          "Standard kontraktsklausuler (SCC) godkjent av Europakommisjonen",
          "Beslutninger om tilstrekkelig beskyttelsesnivå for land med tilsvarende personvern",
          "Bindende virksomhetsregler for konsernselskaper",
        ],
      },
      contact: {
        title: "11. Kontakt oss",
        body: "Hvis du har spørsmål om denne Personvernerklæringen, ønsker å utøve rettighetene dine eller har en klage, kan du kontakte oss:",
        responseTime: "Innen 30 dager, som krevd av GDPR",
        authorityText:
          "Du har også rett til å klage til din lokale datatilsynsmyndighet. I Portugal er dette Comissão Nacional de Proteção de Dados (CNPD).",
      },
      changes: {
        title: "12. Endringer i denne erklæringen",
        body: "Vi kan oppdatere denne Personvernerklæringen fra tid til annen. Vi vil varsle deg om vesentlige endringer ved å publisere den nye Personvernerklæringen på denne siden og oppdatere datoen for \"Sist oppdatert\". Vi anbefaler at du gjennomgår denne Personvernerklæringen regelmessig.",
      },
    },
  },
  da: {
    pageTitle: "Privatlivspolitik",
    introduction:
      "AlgarveOfficial (\"vi\", \"os\" eller \"vores\") er forpligtet til at beskytte dit privatliv og sikre overholdelse af databeskyttelsesforordningen (GDPR) og anden gældende databeskyttelseslovgivning. Denne Privatlivspolitik forklarer, hvordan vi indsamler, bruger, opbevarer og beskytter dine personoplysninger, når du bruger vores website og tjenester.",
    lastUpdatedLabel: "Sidst opdateret",
    lastUpdatedDate: "21. januar 2026",
    metaDescription:
      "Læs hvordan AlgarveOfficial indsamler, bruger, opbevarer og beskytter personoplysninger i henhold til GDPR og gældende databeskyttelseslovgivning.",
    labels: {
      email: "E-mail",
      address: "Adresse",
      responseTime: "Svartid",
      dataType: "Datatype",
      retentionPeriod: "Opbevaringsperiode",
      type: "Type",
      purpose: "Formål",
      consentRequired: "Samtykke kræves",
      no: "Nej",
      yes: "Ja",
    },
    sections: {
      dataController: {
        title: "1. Dataansvarlig",
        body: "AlgarveOfficial er dataansvarlig for dine personoplysninger. Hvis du har spørgsmål om denne Privatlivspolitik eller vores datapraksis, kan du kontakte os på:",
        address: "Algarve, Faro-distriktet, Portugal",
      },
      dataWeCollect: {
        title: "2. Data vi indsamler",
        providedTitle: "2.1 Oplysninger du giver os",
        providedItems: [
          { label: "Kontodata", text: "Navn, e-mailadresse og adgangskode, når du opretter en konto" },
          { label: "Profildata", text: "Valgfrie oplysninger såsom telefonnummer, biografi og profilbillede" },
          { label: "Kommunikationsdata", text: "Beskeder du sender via vores platform til ejere af opslag" },
          { label: "Opslagsdata", text: "Oplysninger som virksomhedsejere giver til deres opslag" },
        ],
        automaticTitle: "2.2 Automatisk indsamlede data",
        consentStrong: "Kun med dit udtrykkelige samtykke",
        consentRest: "kan vi indsamle:",
        automaticItems: [
          { label: "Analysedata", text: "Sidevisninger, sessionsvarighed og interaktionsmønstre" },
          { label: "Tekniske data", text: "Browsertype, enhedstype og anonymiseret IP-adresse (de sidste to oktetter maskeres)" },
          { label: "Sessionsidentifikatorer", text: "Anonyme sessions-ID'er til at undgå dobbelttælling af visninger" },
        ],
        importantLabel: "Vigtigt",
        importantText:
          "Vi indsamler ingen analysedata uden dit udtrykkelige samtykke. Du kan til enhver tid administrere dine præferencer via vores cookie-samtykkebanner.",
      },
      legalBasis: {
        title: "3. Retsgrundlag for behandling",
        body: "Vi behandler dine personoplysninger på følgende retsgrundlag:",
        items: [
          { label: "Samtykke", text: "Til analyse og markedsføringskommunikation (du kan trække det tilbage når som helst)" },
          { label: "Kontrakt", text: "For at levere vores tjenester, når du opretter en konto eller bruger vores platform" },
          { label: "Legitim interesse", text: "Til sikkerhed, forebyggelse af svig og forbedring af tjenesten" },
          { label: "Retlig forpligtelse", text: "For at overholde gældende love og regler" },
        ],
      },
      useData: {
        title: "4. Hvordan vi bruger dine data",
        items: [
          "For at levere og vedligeholde vores tjenester",
          "For at behandle din kontoregistrering og administrere din profil",
          "For at lette kommunikation mellem brugere og ejere af opslag",
          "For at forbedre vores website og brugeroplevelse (med samtykke)",
          "For at sende tjenesterelaterede meddelelser",
          "For at opdage og forhindre svig og sikkerhedstrusler",
          "For at opfylde retlige forpligtelser",
        ],
      },
      retention: {
        title: "5. Opbevaring af data",
        body: "Vi opbevarer kun dine personoplysninger så længe, det er nødvendigt:",
        rows: [
          ["Kontodata", "Indtil kontosletning + 30 dage"],
          ["Analysehændelser", "90 dage (slettes automatisk)"],
          ["Visningssporingsdata", "90 dage (slettes automatisk)"],
          ["Beskeder", "Indtil samtalen slettes"],
          ["Sikkerhedsrevisionslogfiler", "1 år (til sikkerhedsformål)"],
        ],
      },
      rights: {
        title: "6. Dine rettigheder efter GDPR",
        body: "Som registreret har du følgende rettigheder:",
        cards: [
          { title: "Ret til indsigt", text: "Anmode om en kopi af de personoplysninger, vi har om dig" },
          { title: "Ret til berigtigelse", text: "Anmode om rettelse af urigtige eller ufuldstændige data" },
          { title: "Ret til sletning", text: "Anmode om sletning af dine personoplysninger (\"retten til at blive glemt\")" },
          { title: "Ret til begrænsning af behandling", text: "Anmode om begrænsning af, hvordan vi bruger dine data" },
          { title: "Ret til dataportabilitet", text: "Modtage dine data i et struktureret, maskinlæsbart format" },
          { title: "Ret til indsigelse", text: "Gøre indsigelse mod behandling baseret på legitime interesser" },
          { title: "Ret til at trække samtykke tilbage", text: "Trække dit samtykke tilbage når som helst for samtykkebaseret behandling (f.eks. analyse)" },
        ],
        exercisePrefix: "For at udøve nogen af disse rettigheder kan du kontakte os på",
      },
      security: {
        title: "7. Datasikkerhed",
        body: "Vi gennemfører passende tekniske og organisatoriske foranstaltninger for at beskytte dine data:",
        items: [
          "Kryptering af data under overførsel (TLS/SSL) og i hvile",
          "Row-Level Security-politikker (RLS), der sikrer, at brugere kun kan få adgang til deres egne data",
          "Automatisk anonymisering af IP-adresser på databaseniveau",
          "Regelmæssige sikkerhedsrevisioner og adgangslogning",
          "Strenge adgangskontroller for administrative funktioner",
        ],
      },
      cookies: {
        title: "8. Cookies og sporing",
        body: "Vi bruger følgende typer cookies:",
        rows: [
          ["Nødvendige", "Godkendelse, sikkerhed, sprogpræferencer", "Nej"],
          ["Analyse", "Sidevisninger, sessionssporing, brugsmønstre", "Ja"],
        ],
        manageText:
          "Du kan administrere dine cookiepræferencer når som helst via cookie-samtykkebanneret eller ved at rydde din browsers lokale lager.",
      },
      thirdParties: {
        title: "9. Tredjepartstjenester",
        body: "Vi bruger følgende tredjepartstjenester, som kan behandle dine data:",
        items: [
          { label: "Supabase", text: "Database- og autentificeringstjenester (EU-baseret infrastruktur tilgængelig)" },
          { label: "Google", text: "Valgfri OAuth-godkendelse (hvis du vælger at logge ind med Google)" },
        ],
        processorText:
          "Alle tredjepartsdatabehandlere er bundet af databehandleraftaler, der sikrer overholdelse af GDPR.",
      },
      transfers: {
        title: "10. Internationale dataoverførsler",
        body: "Dine data kan blive overført til og behandlet i lande uden for Det Europæiske Økonomiske Samarbejdsområde (EØS). Når dette sker, sikrer vi, at passende garantier er på plads, såsom:",
        items: [
          "Standardkontraktbestemmelser (SCC'er) godkendt af Europa-Kommissionen",
          "Afgørelser om tilstrækkelighed for lande med tilsvarende databeskyttelse",
          "Bindende virksomhedsregler for koncernselskaber",
        ],
      },
      contact: {
        title: "11. Kontakt os",
        body: "Hvis du har spørgsmål om denne Privatlivspolitik, ønsker at udøve dine rettigheder eller har en klage, kan du kontakte os:",
        responseTime: "Inden for 30 dage som krævet af GDPR",
        authorityText:
          "Du har også ret til at indgive en klage til din lokale databeskyttelsesmyndighed. I Portugal er dette Comissão Nacional de Proteção de Dados (CNPD).",
      },
      changes: {
        title: "12. Ændringer af denne politik",
        body: "Vi kan opdatere denne Privatlivspolitik fra tid til anden. Vi vil underrette dig om væsentlige ændringer ved at offentliggøre den nye Privatlivspolitik på denne side og opdatere datoen for \"Sidst opdateret\". Vi opfordrer dig til regelmæssigt at gennemgå denne Privatlivspolitik.",
      },
    },
  },
} satisfies Record<AppLocale, PrivacyPolicyCopy>;

export const PRIVACY_POLICY_CONTENT: Record<AppLocale, PrivacyPolicyContent> = {
  en: buildPrivacyPolicyContent(COPY.en),
  "pt-pt": buildPrivacyPolicyContent(COPY["pt-pt"]),
  fr: buildPrivacyPolicyContent(COPY.fr),
  de: buildPrivacyPolicyContent(COPY.de),
  es: buildPrivacyPolicyContent(COPY.es),
  it: buildPrivacyPolicyContent(COPY.it),
  nl: buildPrivacyPolicyContent(COPY.nl),
  sv: buildPrivacyPolicyContent(COPY.sv),
  no: buildPrivacyPolicyContent(COPY.no),
  da: buildPrivacyPolicyContent(COPY.da),
};

export function resolvePrivacyPolicyLocale(locale?: string | null): AppLocale {
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

export function getPrivacyPolicyContent(locale?: string | null): PrivacyPolicyContent {
  return PRIVACY_POLICY_CONTENT[resolvePrivacyPolicyLocale(locale)];
}
