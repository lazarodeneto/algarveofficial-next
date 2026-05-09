import { DEFAULT_LOCALE, isValidLocale, type AppLocale } from "@/lib/i18n/locales";

const SUPPORT_EMAIL = "info@algarveofficial.com";
const ODR_URL = "https://ec.europa.eu/consumers/odr";

export interface TermsSection {
  id: string;
  title: string;
  icon: string;
  content: string;
}

export interface TermsContent {
  pageTitle: string;
  introduction: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  lastUpdated: string;
  metaDescription: string;
  sections: TermsSection[];
}

interface Definition {
  term: string;
  text: string;
}

interface TableRow {
  name: string;
  description: string;
}

interface TermsCopy {
  pageTitle: string;
  introduction: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  metaDescription: string;
  labels: {
    email: string;
    address: string;
    accountType: string;
    description: string;
    tier: string;
  };
  sections: {
    definitions: {
      title: string;
      items: Definition[];
    };
    account: {
      title: string;
      creationTitle: string;
      creationBody: string;
      creationItems: string[];
      accountTypesTitle: string;
      accountTypes: TableRow[];
      ageTitle: string;
      ageBody: string;
    };
    acceptableUse: {
      title: string;
      body: string;
      items: string[];
    };
    prohibited: {
      title: string;
      body: string;
      items: string[];
    };
    listings: {
      title: string;
      contentTitle: string;
      contentItems: string[];
      reviewTitle: string;
      reviewBody: string;
      reviewItems: string[];
      tiersTitle: string;
      tiers: TableRow[];
    };
    payments: {
      title: string;
      paidTitle: string;
      paidBody: string;
      paidItems: string[];
      refundTitle: string;
      refundBody: string;
      refundItems: string[];
      priceTitle: string;
      priceBody: string;
    };
    intellectualProperty: {
      title: string;
      ourContentTitle: string;
      ourContentBody: string;
      userContentTitle: string;
      userContentBody: string;
      dmcaTitle: string;
      dmcaPrefix: string;
      dmcaSuffix: string;
    };
    disclaimers: {
      title: string;
      availabilityTitle: string;
      availabilityBody: string;
      thirdPartyTitle: string;
      thirdPartyBody: string;
      liabilityTitle: string;
      liabilityBody: string;
      indemnificationTitle: string;
      indemnificationBody: string;
    };
    termination: {
      title: string;
      body: string;
      items: string[];
      afterBody: string;
    };
    governingLaw: {
      title: string;
      body: string;
      odrText: string;
    };
    changes: {
      title: string;
      body: string;
    };
    contact: {
      title: string;
      body: string;
      address: string;
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

function paragraph(text: string, className?: string): string {
  const classAttribute = className ? ` class="${className}"` : "";
  return `<p${classAttribute}>${escapeHtml(text)}</p>`;
}

function simpleList(items: string[], className = "list-disc pl-5 space-y-2"): string {
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function definitionsList(items: Definition[]): string {
  return `<ul class="list-disc pl-5 space-y-2">${items
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.term)}</strong> ${escapeHtml(item.text)}</li>`,
    )
    .join("")}</ul>`;
}

function twoColumnTable(headers: [string, string], rows: TableRow[]): string {
  return `<div class="bg-card border border-border rounded-lg overflow-hidden"><table class="w-full text-sm"><thead class="bg-muted/50"><tr><th class="text-left p-3 font-semibold text-foreground">${escapeHtml(headers[0])}</th><th class="text-left p-3 font-semibold text-foreground">${escapeHtml(headers[1])}</th></tr></thead><tbody>${rows
    .map(
      (row) =>
        `<tr class="border-t border-border"><td class="p-3 font-medium">${escapeHtml(row.name)}</td><td class="p-3">${escapeHtml(row.description)}</td></tr>`,
    )
    .join("")}</tbody></table></div>`;
}

function detailCard(rows: Array<[string, string]>): string {
  return `<div class="bg-card border border-border rounded-lg p-4">${rows
    .map(
      ([label, value]) =>
        `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`,
    )
    .join("")}</div>`;
}

function alertList(items: string[]): string {
  return `<div class="bg-destructive/5 border border-destructive/20 rounded-lg p-4">${simpleList(items)}</div>`;
}

function mutedBox(text: string): string {
  return `<div class="bg-muted/50 border border-border rounded-lg p-4"><p class="text-sm">${escapeHtml(text)}</p></div>`;
}

function emailInline(prefix: string, suffix: string): string {
  return `<p>${escapeHtml(prefix)} <a href="mailto:${SUPPORT_EMAIL}" class="text-primary hover:underline">${SUPPORT_EMAIL}</a> ${escapeHtml(suffix)}</p>`;
}

function odrParagraph(text: string): string {
  return `<p>${escapeHtml(text)} <a href="${ODR_URL}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${ODR_URL}</a></p>`;
}

function subsection(title: string, body: string | string[]): string {
  const content = Array.isArray(body) ? body.join("") : paragraph(body);
  return `<div><h3 class="text-lg font-semibold text-foreground mb-2">${escapeHtml(title)}</h3>${content}</div>`;
}

function buildSections(copy: TermsCopy): TermsSection[] {
  const { labels, sections } = copy;

  return [
    {
      id: "definitions",
      title: sections.definitions.title,
      icon: "FileText",
      content: definitionsList(sections.definitions.items),
    },
    {
      id: "account-registration",
      title: sections.account.title,
      icon: "Users",
      content: [
        subsection(sections.account.creationTitle, [
          paragraph(sections.account.creationBody),
          simpleList(sections.account.creationItems, "list-disc pl-5 space-y-2 mt-2"),
        ]),
        subsection(
          sections.account.accountTypesTitle,
          twoColumnTable(
            [labels.accountType, labels.description],
            sections.account.accountTypes,
          ),
        ),
        subsection(sections.account.ageTitle, sections.account.ageBody),
      ].join(""),
    },
    {
      id: "acceptable-use",
      title: sections.acceptableUse.title,
      icon: "ShieldCheck",
      content: [paragraph(sections.acceptableUse.body), simpleList(sections.acceptableUse.items)].join(""),
    },
    {
      id: "prohibited-activities",
      title: sections.prohibited.title,
      icon: "Ban",
      content: [paragraph(sections.prohibited.body), alertList(sections.prohibited.items)].join(""),
    },
    {
      id: "listing-guidelines",
      title: sections.listings.title,
      icon: "FileText",
      content: [
        subsection(sections.listings.contentTitle, simpleList(sections.listings.contentItems)),
        subsection(sections.listings.reviewTitle, [
          paragraph(sections.listings.reviewBody),
          simpleList(sections.listings.reviewItems, "list-disc pl-5 space-y-2 mt-2"),
        ]),
        subsection(
          sections.listings.tiersTitle,
          twoColumnTable([labels.tier, labels.description], sections.listings.tiers),
        ),
      ].join(""),
    },
    {
      id: "payments-subscriptions",
      title: sections.payments.title,
      icon: "CreditCard",
      content: [
        subsection(sections.payments.paidTitle, [
          paragraph(sections.payments.paidBody),
          simpleList(sections.payments.paidItems, "list-disc pl-5 space-y-2 mt-2"),
        ]),
        subsection(sections.payments.refundTitle, [
          paragraph(sections.payments.refundBody),
          simpleList(sections.payments.refundItems, "list-disc pl-5 space-y-2 mt-2"),
        ]),
        subsection(sections.payments.priceTitle, sections.payments.priceBody),
      ].join(""),
    },
    {
      id: "intellectual-property",
      title: sections.intellectualProperty.title,
      icon: "ShieldCheck",
      content: [
        subsection(
          sections.intellectualProperty.ourContentTitle,
          sections.intellectualProperty.ourContentBody,
        ),
        subsection(
          sections.intellectualProperty.userContentTitle,
          sections.intellectualProperty.userContentBody,
        ),
        subsection(
          sections.intellectualProperty.dmcaTitle,
          emailInline(
            sections.intellectualProperty.dmcaPrefix,
            sections.intellectualProperty.dmcaSuffix,
          ),
        ),
      ].join(""),
    },
    {
      id: "disclaimers-limitations",
      title: sections.disclaimers.title,
      icon: "AlertTriangle",
      content: [
        subsection(sections.disclaimers.availabilityTitle, sections.disclaimers.availabilityBody),
        subsection(sections.disclaimers.thirdPartyTitle, sections.disclaimers.thirdPartyBody),
        subsection(sections.disclaimers.liabilityTitle, mutedBox(sections.disclaimers.liabilityBody)),
        subsection(
          sections.disclaimers.indemnificationTitle,
          sections.disclaimers.indemnificationBody,
        ),
      ].join(""),
    },
    {
      id: "termination",
      title: sections.termination.title,
      icon: "Ban",
      content: [
        paragraph(sections.termination.body),
        simpleList(sections.termination.items),
        paragraph(sections.termination.afterBody, "mt-4"),
      ].join(""),
    },
    {
      id: "governing-law",
      title: sections.governingLaw.title,
      icon: "Globe",
      content: [paragraph(sections.governingLaw.body), odrParagraph(sections.governingLaw.odrText)].join(""),
    },
    {
      id: "changes-to-terms",
      title: sections.changes.title,
      icon: "FileText",
      content: paragraph(sections.changes.body),
    },
    {
      id: "contact-us",
      title: sections.contact.title,
      icon: "Users",
      content: [
        paragraph(sections.contact.body),
        detailCard([
          [labels.email, SUPPORT_EMAIL],
          [labels.address, sections.contact.address],
        ]),
      ].join(""),
    },
  ];
}

function buildTermsContent(copy: TermsCopy): TermsContent {
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
    pageTitle: "Terms of Service",
    introduction:
      "Welcome to AlgarveOfficial. These Terms of Service (\"Terms\") govern your access to and use of the AlgarveOfficial website, services, and platform (collectively, the \"Service\"). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.",
    lastUpdatedLabel: "Last updated",
    lastUpdatedDate: "January 21, 2026",
    metaDescription:
      "Review AlgarveOfficial's terms governing platform access, listings, content, payments, and user responsibilities.",
    labels: {
      email: "Email",
      address: "Address",
      accountType: "Account Type",
      description: "Description",
      tier: "Tier",
    },
    sections: {
      definitions: {
        title: "1. Definitions",
        items: [
          { term: "\"Platform\"", text: "refers to the AlgarveOfficial website and all related services" },
          { term: "\"User\"", text: "refers to any individual who accesses or uses the Platform" },
          { term: "\"Viewer\"", text: "refers to Users who browse listings and content" },
          { term: "\"Owner\"", text: "refers to Users who create and manage business listings" },
          { term: "\"Listing\"", text: "refers to business profiles and content submitted by Owners" },
          { term: "\"Content\"", text: "refers to all text, images, data, and materials on the Platform" },
          { term: "\"We\", \"Us\", \"Our\"", text: "refers to AlgarveOfficial" },
        ],
      },
      account: {
        title: "2. Account Registration",
        creationTitle: "2.1 Account Creation",
        creationBody:
          "To access certain features of the Service, you must register for an account. When registering, you agree to:",
        creationItems: [
          "Provide accurate, current, and complete information",
          "Maintain and promptly update your account information",
          "Maintain the security and confidentiality of your login credentials",
          "Accept responsibility for all activities under your account",
          "Notify us immediately of any unauthorized use of your account",
        ],
        accountTypesTitle: "2.2 Account Types",
        accountTypes: [
          { name: "Viewer", description: "Browse listings, save favorites, contact owners" },
          { name: "Owner", description: "Create and manage business listings" },
          { name: "Editor", description: "Manage content and moderate listings" },
          { name: "Admin", description: "Full platform administration access" },
        ],
        ageTitle: "2.3 Age Requirement",
        ageBody:
          "You must be at least 18 years old to create an account and use our Service. By creating an account, you represent and warrant that you are at least 18 years of age.",
      },
      acceptableUse: {
        title: "3. Acceptable Use",
        body: "When using our Service, you agree to:",
        items: [
          "Comply with all applicable laws and regulations",
          "Respect the intellectual property rights of others",
          "Provide accurate and truthful information in listings",
          "Communicate respectfully with other users",
          "Use the Service only for its intended purposes",
        ],
      },
      prohibited: {
        title: "4. Prohibited Activities",
        body: "You may not use the Service to:",
        items: [
          "Post false, misleading, or fraudulent content",
          "Impersonate any person or entity",
          "Harass, abuse, or threaten other users",
          "Upload malicious code, viruses, or harmful content",
          "Scrape, crawl, or collect data without authorization",
          "Circumvent security measures or access restrictions",
          "Use automated systems to access the Service without permission",
          "Promote illegal activities or services",
          "Violate intellectual property rights",
          "Spam or send unsolicited commercial messages",
          "Manipulate ratings, reviews, or engagement metrics",
        ],
      },
      listings: {
        title: "5. Listing Guidelines (For Owners)",
        contentTitle: "5.1 Content Requirements",
        contentItems: [
          "All listing information must be accurate and up-to-date",
          "Images must be authentic representations of your business",
          "Contact information must be valid and operational",
          "Pricing information (if displayed) must reflect actual rates",
        ],
        reviewTitle: "5.2 Review Process",
        reviewBody:
          "All listings are subject to review before publication. We reserve the right to:",
        reviewItems: [
          "Approve, reject, or request modifications to listings",
          "Remove listings that violate our guidelines",
          "Suspend or terminate accounts for repeated violations",
        ],
        tiersTitle: "5.3 Listing Tiers",
        tiers: [
          { name: "Unverified", description: "Free basic listing (no verification badge)" },
          { name: "Verified", description: "Paid tier with verified business badge" },
          { name: "Signature", description: "Premium tier with signature badge and VIP placement" },
        ],
      },
      payments: {
        title: "6. Payments and Subscriptions",
        paidTitle: "6.1 Paid Services",
        paidBody:
          "Certain features and listing tiers require payment. By purchasing paid services, you agree to:",
        paidItems: [
          "Pay all applicable fees and charges",
          "Provide accurate billing information",
          "Authorize recurring charges for subscriptions",
        ],
        refundTitle: "6.2 Refund Policy",
        refundBody: "Refunds may be issued at our discretion. Generally:",
        refundItems: [
          "Subscription fees are non-refundable after the first 14 days",
          "Pro-rated refunds may be available for annual plans",
          "Refunds will not be issued for policy violations",
        ],
        priceTitle: "6.3 Price Changes",
        priceBody:
          "We reserve the right to modify pricing with 30 days' advance notice. Existing subscriptions will be honored until the end of their current billing period.",
      },
      intellectualProperty: {
        title: "7. Intellectual Property",
        ourContentTitle: "7.1 Our Content",
        ourContentBody:
          "The Service and its original content (excluding user-submitted content), features, and functionality are owned by AlgarveOfficial and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.",
        userContentTitle: "7.2 User Content",
        userContentBody:
          "You retain ownership of content you submit. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content in connection with the Service.",
        dmcaTitle: "7.3 DMCA Compliance",
        dmcaPrefix: "If you believe your copyrighted work has been infringed, please contact us at",
        dmcaSuffix: "with the required DMCA notice information.",
      },
      disclaimers: {
        title: "8. Disclaimers and Limitations",
        availabilityTitle: "8.1 Service Availability",
        availabilityBody:
          "The Service is provided \"as is\" and \"as available\" without warranties of any kind. We do not guarantee uninterrupted, secure, or error-free operation.",
        thirdPartyTitle: "8.2 Third-Party Content",
        thirdPartyBody:
          "We are not responsible for the accuracy, quality, or legality of listings or content submitted by Owners. Users interact with businesses at their own risk.",
        liabilityTitle: "8.3 Limitation of Liability",
        liabilityBody:
          "TO THE MAXIMUM EXTENT PERMITTED BY LAW, ALGARVEOFFICIAL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE.",
        indemnificationTitle: "8.4 Indemnification",
        indemnificationBody:
          "You agree to indemnify and hold harmless AlgarveOfficial from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.",
      },
      termination: {
        title: "9. Termination",
        body: "We may suspend or terminate your account if you:",
        items: [
          "Violate these Terms of Service",
          "Engage in prohibited activities",
          "Provide false or misleading information",
          "Fail to pay for services when due",
        ],
        afterBody:
          "You may terminate your account at any time by contacting us. Upon termination, your right to use the Service will immediately cease.",
      },
      governingLaw: {
        title: "10. Governing Law",
        body:
          "These Terms shall be governed by and construed in accordance with the laws of Portugal, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be resolved in the courts of Faro, Portugal.",
        odrText:
          "For EU consumers: You may also be entitled to use the European Commission's Online Dispute Resolution platform at",
      },
      changes: {
        title: "11. Changes to Terms",
        body:
          "We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms and updating the \"Last updated\" date. Your continued use of the Service after changes constitutes acceptance of the new Terms.",
      },
      contact: {
        title: "12. Contact Us",
        body: "If you have any questions about these Terms, please contact us:",
        address: "Algarve, District of Faro, Portugal",
      },
    },
  },
} satisfies Partial<Record<AppLocale, TermsCopy>>;

const LOCALIZED_COPY = {
  "pt-pt": {
    pageTitle: "Termos de Serviço",
    introduction:
      "Bem-vindo à AlgarveOfficial. Estes Termos de Serviço (\"Termos\") regem o seu acesso e utilização do website, serviços e plataforma da AlgarveOfficial (coletivamente, o \"Serviço\"). Ao aceder ou utilizar o nosso Serviço, aceita ficar vinculado a estes Termos. Se não concordar com estes Termos, não utilize o nosso Serviço.",
    lastUpdatedLabel: "Última atualização",
    lastUpdatedDate: "21 de janeiro de 2026",
    metaDescription:
      "Consulte os Termos de Serviço da AlgarveOfficial sobre acesso à plataforma, anúncios, conteúdo, pagamentos e responsabilidades dos utilizadores.",
    labels: {
      email: "Email",
      address: "Morada",
      accountType: "Tipo de conta",
      description: "Descrição",
      tier: "Nível",
    },
    sections: {
      definitions: {
        title: "1. Definições",
        items: [
          { term: "\"Plataforma\"", text: "refere-se ao website da AlgarveOfficial e a todos os serviços relacionados" },
          { term: "\"Utilizador\"", text: "refere-se a qualquer pessoa que aceda ou utilize a Plataforma" },
          { term: "\"Visitante\"", text: "refere-se aos Utilizadores que consultam anúncios e conteúdos" },
          { term: "\"Proprietário\"", text: "refere-se aos Utilizadores que criam e gerem anúncios de negócios" },
          { term: "\"Anúncio\"", text: "refere-se a perfis comerciais e conteúdos submetidos por Proprietários" },
          { term: "\"Conteúdo\"", text: "refere-se a todos os textos, imagens, dados e materiais na Plataforma" },
          { term: "\"Nós\", \"nos\" ou \"nosso\"", text: "refere-se à AlgarveOfficial" },
        ],
      },
      account: {
        title: "2. Registo de Conta",
        creationTitle: "2.1 Criação de conta",
        creationBody:
          "Para aceder a determinadas funcionalidades do Serviço, deve registar uma conta. Ao registar-se, aceita:",
        creationItems: [
          "Fornecer informações exatas, atuais e completas",
          "Manter e atualizar prontamente as informações da sua conta",
          "Manter a segurança e confidencialidade das suas credenciais de acesso",
          "Aceitar responsabilidade por todas as atividades realizadas na sua conta",
          "Notificar-nos imediatamente sobre qualquer utilização não autorizada da sua conta",
        ],
        accountTypesTitle: "2.2 Tipos de conta",
        accountTypes: [
          { name: "Visitante", description: "Consultar anúncios, guardar favoritos e contactar proprietários" },
          { name: "Proprietário", description: "Criar e gerir anúncios de negócios" },
          { name: "Editor", description: "Gerir conteúdo e moderar anúncios" },
          { name: "Administrador", description: "Acesso total à administração da plataforma" },
        ],
        ageTitle: "2.3 Requisito de idade",
        ageBody:
          "Deve ter pelo menos 18 anos para criar uma conta e utilizar o nosso Serviço. Ao criar uma conta, declara e garante que tem pelo menos 18 anos de idade.",
      },
      acceptableUse: {
        title: "3. Utilização Aceitável",
        body: "Ao utilizar o nosso Serviço, aceita:",
        items: [
          "Cumprir todas as leis e regulamentos aplicáveis",
          "Respeitar os direitos de propriedade intelectual de terceiros",
          "Fornecer informações exatas e verdadeiras nos anúncios",
          "Comunicar respeitosamente com outros utilizadores",
          "Utilizar o Serviço apenas para os fins a que se destina",
        ],
      },
      prohibited: {
        title: "4. Atividades Proibidas",
        body: "Não pode utilizar o Serviço para:",
        items: [
          "Publicar conteúdo falso, enganoso ou fraudulento",
          "Fazer-se passar por qualquer pessoa ou entidade",
          "Assediar, abusar ou ameaçar outros utilizadores",
          "Carregar código malicioso, vírus ou conteúdo nocivo",
          "Extrair, rastrear ou recolher dados sem autorização",
          "Contornar medidas de segurança ou restrições de acesso",
          "Utilizar sistemas automatizados para aceder ao Serviço sem permissão",
          "Promover atividades ou serviços ilegais",
          "Violar direitos de propriedade intelectual",
          "Enviar spam ou mensagens comerciais não solicitadas",
          "Manipular classificações, avaliações ou métricas de envolvimento",
        ],
      },
      listings: {
        title: "5. Diretrizes para Anúncios (para Proprietários)",
        contentTitle: "5.1 Requisitos de conteúdo",
        contentItems: [
          "Todas as informações dos anúncios devem ser exatas e estar atualizadas",
          "As imagens devem representar autenticamente o seu negócio",
          "As informações de contacto devem ser válidas e operacionais",
          "As informações de preços (quando apresentadas) devem refletir valores reais",
        ],
        reviewTitle: "5.2 Processo de revisão",
        reviewBody:
          "Todos os anúncios estão sujeitos a revisão antes da publicação. Reservamo-nos o direito de:",
        reviewItems: [
          "Aprovar, rejeitar ou solicitar alterações aos anúncios",
          "Remover anúncios que violem as nossas diretrizes",
          "Suspender ou encerrar contas por violações repetidas",
        ],
        tiersTitle: "5.3 Níveis de anúncio",
        tiers: [
          { name: "Não verificado", description: "Anúncio básico gratuito (sem selo de verificação)" },
          { name: "Verificado", description: "Nível pago com selo de negócio verificado" },
          { name: "Signature", description: "Nível premium com selo signature e colocação VIP" },
        ],
      },
      payments: {
        title: "6. Pagamentos e Subscrições",
        paidTitle: "6.1 Serviços pagos",
        paidBody:
          "Algumas funcionalidades e níveis de anúncio requerem pagamento. Ao adquirir serviços pagos, aceita:",
        paidItems: [
          "Pagar todas as taxas e encargos aplicáveis",
          "Fornecer informações de faturação exatas",
          "Autorizar cobranças recorrentes para subscrições",
        ],
        refundTitle: "6.2 Política de reembolso",
        refundBody: "Os reembolsos podem ser emitidos a nosso critério. Em geral:",
        refundItems: [
          "As taxas de subscrição não são reembolsáveis após os primeiros 14 dias",
          "Podem estar disponíveis reembolsos proporcionais para planos anuais",
          "Não serão emitidos reembolsos por violações das políticas",
        ],
        priceTitle: "6.3 Alterações de preços",
        priceBody:
          "Reservamo-nos o direito de alterar preços mediante aviso prévio de 30 dias. As subscrições existentes serão honradas até ao final do respetivo período de faturação atual.",
      },
      intellectualProperty: {
        title: "7. Propriedade Intelectual",
        ourContentTitle: "7.1 O nosso conteúdo",
        ourContentBody:
          "O Serviço e o seu conteúdo original (excluindo conteúdo submetido por utilizadores), funcionalidades e funcionamento são propriedade da AlgarveOfficial e estão protegidos por leis internacionais de direitos de autor, marcas, patentes, segredos comerciais e outras leis de propriedade intelectual.",
        userContentTitle: "7.2 Conteúdo do utilizador",
        userContentBody:
          "Mantém a titularidade do conteúdo que submete. Ao publicar conteúdo, concede-nos uma licença não exclusiva, mundial e isenta de royalties para usar, apresentar, reproduzir e distribuir o seu conteúdo em ligação com o Serviço.",
        dmcaTitle: "7.3 Conformidade com DMCA",
        dmcaPrefix: "Se acredita que a sua obra protegida por direitos de autor foi infringida, contacte-nos através de",
        dmcaSuffix: "com as informações exigidas para a notificação DMCA.",
      },
      disclaimers: {
        title: "8. Isenções e Limitações",
        availabilityTitle: "8.1 Disponibilidade do Serviço",
        availabilityBody:
          "O Serviço é disponibilizado \"tal como está\" e \"conforme disponível\", sem garantias de qualquer tipo. Não garantimos funcionamento ininterrupto, seguro ou sem erros.",
        thirdPartyTitle: "8.2 Conteúdo de terceiros",
        thirdPartyBody:
          "Não somos responsáveis pela exatidão, qualidade ou legalidade dos anúncios ou conteúdos submetidos por Proprietários. Os utilizadores interagem com empresas por sua conta e risco.",
        liabilityTitle: "8.3 Limitação de responsabilidade",
        liabilityBody:
          "NA MÁXIMA MEDIDA PERMITIDA POR LEI, A ALGARVEOFFICIAL NÃO SERÁ RESPONSÁVEL POR QUAISQUER DANOS INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENCIAIS OU PUNITIVOS, INCLUINDO PERDA DE LUCROS, DADOS OU OPORTUNIDADES DE NEGÓCIO, DECORRENTES DA SUA UTILIZAÇÃO DO SERVIÇO.",
        indemnificationTitle: "8.4 Indemnização",
        indemnificationBody:
          "Aceita indemnizar e isentar a AlgarveOfficial de quaisquer reclamações, danos ou despesas decorrentes da sua utilização do Serviço ou da violação destes Termos.",
      },
      termination: {
        title: "9. Encerramento",
        body: "Podemos suspender ou encerrar a sua conta se:",
        items: [
          "Violar estes Termos de Serviço",
          "Participar em atividades proibidas",
          "Fornecer informações falsas ou enganosas",
          "Não pagar serviços quando devidos",
        ],
        afterBody:
          "Pode encerrar a sua conta a qualquer momento contactando-nos. Após o encerramento, o seu direito de utilizar o Serviço cessará imediatamente.",
      },
      governingLaw: {
        title: "10. Lei Aplicável",
        body:
          "Estes Termos serão regidos e interpretados de acordo com as leis de Portugal, sem considerar as suas normas de conflito de leis. Qualquer litígio decorrente destes Termos ou da sua utilização do Serviço será resolvido nos tribunais de Faro, Portugal.",
        odrText:
          "Para consumidores da UE: também poderá ter direito a utilizar a plataforma de Resolução de Litígios em Linha da Comissão Europeia em",
      },
      changes: {
        title: "11. Alterações aos Termos",
        body:
          "Reservamo-nos o direito de alterar estes Termos a qualquer momento. Notificá-lo-emos de alterações materiais publicando os Termos atualizados e atualizando a data de \"Última atualização\". A continuação da utilização do Serviço após alterações constitui aceitação dos novos Termos.",
      },
      contact: {
        title: "12. Contacte-nos",
        body: "Se tiver perguntas sobre estes Termos, contacte-nos:",
        address: "Algarve, distrito de Faro, Portugal",
      },
    },
  },
} satisfies Partial<Record<AppLocale, TermsCopy>>;

const MORE_COPY = {
  fr: {
    pageTitle: "Conditions d'utilisation",
    introduction:
      "Bienvenue sur AlgarveOfficial. Les présentes Conditions d'utilisation (\"Conditions\") régissent votre accès au site web, aux services et à la plateforme AlgarveOfficial (collectivement, le \"Service\") ainsi que leur utilisation. En accédant à notre Service ou en l'utilisant, vous acceptez d'être lié par ces Conditions. Si vous n'acceptez pas ces Conditions, veuillez ne pas utiliser notre Service.",
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdatedDate: "21 janvier 2026",
    metaDescription:
      "Consultez les Conditions d'utilisation d'AlgarveOfficial concernant l'accès à la plateforme, les annonces, le contenu, les paiements et les responsabilités des utilisateurs.",
    labels: {
      email: "E-mail",
      address: "Adresse",
      accountType: "Type de compte",
      description: "Description",
      tier: "Niveau",
    },
    sections: {
      definitions: {
        title: "1. Définitions",
        items: [
          { term: "\"Plateforme\"", text: "désigne le site web AlgarveOfficial et tous les services associés" },
          { term: "\"Utilisateur\"", text: "désigne toute personne qui accède à la Plateforme ou l'utilise" },
          { term: "\"Visiteur\"", text: "désigne les Utilisateurs qui consultent les annonces et le contenu" },
          { term: "\"Propriétaire\"", text: "désigne les Utilisateurs qui créent et gèrent des annonces commerciales" },
          { term: "\"Annonce\"", text: "désigne les profils d'entreprises et le contenu soumis par les Propriétaires" },
          { term: "\"Contenu\"", text: "désigne tous les textes, images, données et supports présents sur la Plateforme" },
          { term: "\"Nous\", \"notre\" ou \"nos\"", text: "désigne AlgarveOfficial" },
        ],
      },
      account: {
        title: "2. Inscription au compte",
        creationTitle: "2.1 Création de compte",
        creationBody:
          "Pour accéder à certaines fonctionnalités du Service, vous devez créer un compte. Lors de votre inscription, vous acceptez de :",
        creationItems: [
          "Fournir des informations exactes, actuelles et complètes",
          "Maintenir et mettre rapidement à jour les informations de votre compte",
          "Préserver la sécurité et la confidentialité de vos identifiants de connexion",
          "Assumer la responsabilité de toutes les activités effectuées avec votre compte",
          "Nous informer immédiatement de toute utilisation non autorisée de votre compte",
        ],
        accountTypesTitle: "2.2 Types de compte",
        accountTypes: [
          { name: "Visiteur", description: "Consulter des annonces, enregistrer des favoris et contacter les propriétaires" },
          { name: "Propriétaire", description: "Créer et gérer des annonces commerciales" },
          { name: "Éditeur", description: "Gérer le contenu et modérer les annonces" },
          { name: "Administrateur", description: "Accès complet à l'administration de la plateforme" },
        ],
        ageTitle: "2.3 Condition d'âge",
        ageBody:
          "Vous devez avoir au moins 18 ans pour créer un compte et utiliser notre Service. En créant un compte, vous déclarez et garantissez avoir au moins 18 ans.",
      },
      acceptableUse: {
        title: "3. Utilisation acceptable",
        body: "Lorsque vous utilisez notre Service, vous acceptez de :",
        items: [
          "Respecter toutes les lois et réglementations applicables",
          "Respecter les droits de propriété intellectuelle d'autrui",
          "Fournir des informations exactes et véridiques dans les annonces",
          "Communiquer avec respect avec les autres utilisateurs",
          "Utiliser le Service uniquement aux fins prévues",
        ],
      },
      prohibited: {
        title: "4. Activités interdites",
        body: "Vous ne pouvez pas utiliser le Service pour :",
        items: [
          "Publier du contenu faux, trompeur ou frauduleux",
          "Usurper l'identité d'une personne ou d'une entité",
          "Harceler, maltraiter ou menacer d'autres utilisateurs",
          "Téléverser du code malveillant, des virus ou du contenu nuisible",
          "Extraire, explorer ou collecter des données sans autorisation",
          "Contourner les mesures de sécurité ou les restrictions d'accès",
          "Utiliser des systèmes automatisés pour accéder au Service sans autorisation",
          "Promouvoir des activités ou services illégaux",
          "Violer des droits de propriété intellectuelle",
          "Envoyer du spam ou des messages commerciaux non sollicités",
          "Manipuler les notes, les avis ou les indicateurs d'engagement",
        ],
      },
      listings: {
        title: "5. Directives relatives aux annonces (pour les Propriétaires)",
        contentTitle: "5.1 Exigences relatives au contenu",
        contentItems: [
          "Toutes les informations des annonces doivent être exactes et à jour",
          "Les images doivent représenter fidèlement votre entreprise",
          "Les coordonnées doivent être valides et opérationnelles",
          "Les informations tarifaires (si affichées) doivent refléter les prix réels",
        ],
        reviewTitle: "5.2 Processus de vérification",
        reviewBody:
          "Toutes les annonces sont soumises à vérification avant publication. Nous nous réservons le droit de :",
        reviewItems: [
          "Approuver, rejeter ou demander des modifications aux annonces",
          "Supprimer les annonces qui enfreignent nos directives",
          "Suspendre ou résilier les comptes en cas de violations répétées",
        ],
        tiersTitle: "5.3 Niveaux d'annonce",
        tiers: [
          { name: "Non vérifié", description: "Annonce de base gratuite (sans badge de vérification)" },
          { name: "Vérifié", description: "Niveau payant avec badge d'entreprise vérifiée" },
          { name: "Signature", description: "Niveau premium avec badge signature et placement VIP" },
        ],
      },
      payments: {
        title: "6. Paiements et abonnements",
        paidTitle: "6.1 Services payants",
        paidBody:
          "Certaines fonctionnalités et certains niveaux d'annonce nécessitent un paiement. En achetant des services payants, vous acceptez de :",
        paidItems: [
          "Payer tous les frais et charges applicables",
          "Fournir des informations de facturation exactes",
          "Autoriser les paiements récurrents pour les abonnements",
        ],
        refundTitle: "6.2 Politique de remboursement",
        refundBody: "Les remboursements peuvent être accordés à notre discrétion. En général :",
        refundItems: [
          "Les frais d'abonnement ne sont pas remboursables après les 14 premiers jours",
          "Des remboursements au prorata peuvent être disponibles pour les forfaits annuels",
          "Aucun remboursement ne sera accordé en cas de violation des politiques",
        ],
        priceTitle: "6.3 Modifications de prix",
        priceBody:
          "Nous nous réservons le droit de modifier les prix avec un préavis de 30 jours. Les abonnements existants seront honorés jusqu'à la fin de leur période de facturation en cours.",
      },
      intellectualProperty: {
        title: "7. Propriété intellectuelle",
        ourContentTitle: "7.1 Notre contenu",
        ourContentBody:
          "Le Service et son contenu original (à l'exclusion du contenu soumis par les utilisateurs), ses fonctionnalités et son fonctionnement appartiennent à AlgarveOfficial et sont protégés par les lois internationales relatives au droit d'auteur, aux marques, aux brevets, aux secrets commerciaux et aux autres droits de propriété intellectuelle.",
        userContentTitle: "7.2 Contenu utilisateur",
        userContentBody:
          "Vous conservez la propriété du contenu que vous soumettez. En publiant du contenu, vous nous accordez une licence non exclusive, mondiale et libre de redevances pour utiliser, afficher, reproduire et distribuer votre contenu dans le cadre du Service.",
        dmcaTitle: "7.3 Conformité DMCA",
        dmcaPrefix: "Si vous pensez que votre œuvre protégée par le droit d'auteur a été violée, veuillez nous contacter à",
        dmcaSuffix: "avec les informations requises pour l'avis DMCA.",
      },
      disclaimers: {
        title: "8. Exclusions et limitations",
        availabilityTitle: "8.1 Disponibilité du Service",
        availabilityBody:
          "Le Service est fourni \"tel quel\" et \"selon disponibilité\", sans garantie d'aucune sorte. Nous ne garantissons pas un fonctionnement ininterrompu, sécurisé ou exempt d'erreurs.",
        thirdPartyTitle: "8.2 Contenu de tiers",
        thirdPartyBody:
          "Nous ne sommes pas responsables de l'exactitude, de la qualité ou de la légalité des annonces ou contenus soumis par les Propriétaires. Les utilisateurs interagissent avec les entreprises à leurs propres risques.",
        liabilityTitle: "8.3 Limitation de responsabilité",
        liabilityBody:
          "DANS LA MESURE MAXIMALE PERMISE PAR LA LOI, ALGARVEOFFICIAL NE SERA PAS RESPONSABLE DES DOMMAGES INDIRECTS, ACCESSOIRES, SPÉCIAUX, CONSÉCUTIFS OU PUNITIFS, Y COMPRIS LA PERTE DE PROFITS, DE DONNÉES OU D'OPPORTUNITÉS COMMERCIALES, DÉCOULANT DE VOTRE UTILISATION DU SERVICE.",
        indemnificationTitle: "8.4 Indemnisation",
        indemnificationBody:
          "Vous acceptez d'indemniser et de dégager AlgarveOfficial de toute responsabilité pour toute réclamation, tout dommage ou toute dépense découlant de votre utilisation du Service ou de votre violation des présentes Conditions.",
      },
      termination: {
        title: "9. Résiliation",
        body: "Nous pouvons suspendre ou résilier votre compte si vous :",
        items: [
          "Enfreignez les présentes Conditions d'utilisation",
          "Participez à des activités interdites",
          "Fournissez des informations fausses ou trompeuses",
          "Ne payez pas les services à leur échéance",
        ],
        afterBody:
          "Vous pouvez résilier votre compte à tout moment en nous contactant. Après résiliation, votre droit d'utiliser le Service cessera immédiatement.",
      },
      governingLaw: {
        title: "10. Droit applicable",
        body:
          "Les présentes Conditions sont régies et interprétées conformément aux lois du Portugal, sans égard à ses règles de conflit de lois. Tout litige découlant des présentes Conditions ou de votre utilisation du Service sera résolu devant les tribunaux de Faro, Portugal.",
        odrText:
          "Pour les consommateurs de l'UE : vous pouvez également être autorisé à utiliser la plateforme de règlement en ligne des litiges de la Commission européenne à l'adresse",
      },
      changes: {
        title: "11. Modifications des Conditions",
        body:
          "Nous nous réservons le droit de modifier ces Conditions à tout moment. Nous vous informerons des changements importants en publiant les Conditions mises à jour et en modifiant la date de \"Dernière mise à jour\". Votre utilisation continue du Service après les changements vaut acceptation des nouvelles Conditions.",
      },
      contact: {
        title: "12. Nous contacter",
        body: "Si vous avez des questions concernant ces Conditions, veuillez nous contacter :",
        address: "Algarve, district de Faro, Portugal",
      },
    },
  },
  de: {
    pageTitle: "Nutzungsbedingungen",
    introduction:
      "Willkommen bei AlgarveOfficial. Diese Nutzungsbedingungen (\"Bedingungen\") regeln Ihren Zugang zur AlgarveOfficial-Website, den Diensten und der Plattform (zusammen der \"Dienst\") sowie deren Nutzung. Durch den Zugriff auf unseren Dienst oder dessen Nutzung erklären Sie sich mit diesen Bedingungen einverstanden. Wenn Sie diesen Bedingungen nicht zustimmen, nutzen Sie unseren Dienst bitte nicht.",
    lastUpdatedLabel: "Zuletzt aktualisiert",
    lastUpdatedDate: "21. Januar 2026",
    metaDescription:
      "Lesen Sie die Nutzungsbedingungen von AlgarveOfficial zu Plattformzugang, Einträgen, Inhalten, Zahlungen und Nutzerpflichten.",
    labels: {
      email: "E-Mail",
      address: "Adresse",
      accountType: "Kontotyp",
      description: "Beschreibung",
      tier: "Stufe",
    },
    sections: {
      definitions: {
        title: "1. Definitionen",
        items: [
          { term: "\"Plattform\"", text: "bezeichnet die AlgarveOfficial-Website und alle zugehörigen Dienste" },
          { term: "\"Nutzer\"", text: "bezeichnet jede Person, die auf die Plattform zugreift oder sie nutzt" },
          { term: "\"Besucher\"", text: "bezeichnet Nutzer, die Einträge und Inhalte ansehen" },
          { term: "\"Inhaber\"", text: "bezeichnet Nutzer, die Geschäftseinträge erstellen und verwalten" },
          { term: "\"Eintrag\"", text: "bezeichnet Unternehmensprofile und Inhalte, die von Inhabern eingereicht werden" },
          { term: "\"Inhalt\"", text: "bezeichnet alle Texte, Bilder, Daten und Materialien auf der Plattform" },
          { term: "\"Wir\", \"uns\" oder \"unser\"", text: "bezieht sich auf AlgarveOfficial" },
        ],
      },
      account: {
        title: "2. Kontoregistrierung",
        creationTitle: "2.1 Kontoerstellung",
        creationBody:
          "Um auf bestimmte Funktionen des Dienstes zugreifen zu können, müssen Sie ein Konto registrieren. Bei der Registrierung erklären Sie sich damit einverstanden:",
        creationItems: [
          "Genaue, aktuelle und vollständige Informationen bereitzustellen",
          "Ihre Kontoinformationen zu pflegen und zeitnah zu aktualisieren",
          "Die Sicherheit und Vertraulichkeit Ihrer Zugangsdaten zu wahren",
          "Die Verantwortung für alle Aktivitäten unter Ihrem Konto zu übernehmen",
          "Uns unverzüglich über jede unbefugte Nutzung Ihres Kontos zu informieren",
        ],
        accountTypesTitle: "2.2 Kontotypen",
        accountTypes: [
          { name: "Besucher", description: "Einträge ansehen, Favoriten speichern und Inhaber kontaktieren" },
          { name: "Inhaber", description: "Geschäftseinträge erstellen und verwalten" },
          { name: "Editor", description: "Inhalte verwalten und Einträge moderieren" },
          { name: "Admin", description: "Vollständiger administrativer Zugriff auf die Plattform" },
        ],
        ageTitle: "2.3 Altersanforderung",
        ageBody:
          "Sie müssen mindestens 18 Jahre alt sein, um ein Konto zu erstellen und unseren Dienst zu nutzen. Mit der Erstellung eines Kontos erklären und garantieren Sie, dass Sie mindestens 18 Jahre alt sind.",
      },
      acceptableUse: {
        title: "3. Zulässige Nutzung",
        body: "Bei der Nutzung unseres Dienstes verpflichten Sie sich:",
        items: [
          "Alle anwendbaren Gesetze und Vorschriften einzuhalten",
          "Die geistigen Eigentumsrechte anderer zu respektieren",
          "Genaue und wahrheitsgemäße Informationen in Einträgen bereitzustellen",
          "Respektvoll mit anderen Nutzern zu kommunizieren",
          "Den Dienst nur für seine vorgesehenen Zwecke zu nutzen",
        ],
      },
      prohibited: {
        title: "4. Verbotene Aktivitäten",
        body: "Sie dürfen den Dienst nicht nutzen, um:",
        items: [
          "Falsche, irreführende oder betrügerische Inhalte zu veröffentlichen",
          "Sich als eine andere Person oder Organisation auszugeben",
          "Andere Nutzer zu belästigen, zu missbrauchen oder zu bedrohen",
          "Schädlichen Code, Viren oder schädliche Inhalte hochzuladen",
          "Daten ohne Genehmigung zu scrapen, zu crawlen oder zu sammeln",
          "Sicherheitsmaßnahmen oder Zugriffsbeschränkungen zu umgehen",
          "Automatisierte Systeme ohne Erlaubnis für den Zugriff auf den Dienst zu verwenden",
          "Illegale Aktivitäten oder Dienste zu fördern",
          "Geistige Eigentumsrechte zu verletzen",
          "Spam oder unerwünschte kommerzielle Nachrichten zu senden",
          "Bewertungen, Rezensionen oder Engagement-Metriken zu manipulieren",
        ],
      },
      listings: {
        title: "5. Richtlinien für Einträge (für Inhaber)",
        contentTitle: "5.1 Inhaltsanforderungen",
        contentItems: [
          "Alle Informationen in Einträgen müssen korrekt und aktuell sein",
          "Bilder müssen Ihr Unternehmen authentisch darstellen",
          "Kontaktinformationen müssen gültig und funktionsfähig sein",
          "Preisinformationen (falls angezeigt) müssen die tatsächlichen Preise widerspiegeln",
        ],
        reviewTitle: "5.2 Prüfprozess",
        reviewBody:
          "Alle Einträge unterliegen vor der Veröffentlichung einer Prüfung. Wir behalten uns das Recht vor:",
        reviewItems: [
          "Einträge zu genehmigen, abzulehnen oder Änderungen anzufordern",
          "Einträge zu entfernen, die gegen unsere Richtlinien verstoßen",
          "Konten bei wiederholten Verstößen zu sperren oder zu kündigen",
        ],
        tiersTitle: "5.3 Eintragsstufen",
        tiers: [
          { name: "Nicht verifiziert", description: "Kostenloser Basiseintrag (ohne Verifizierungsabzeichen)" },
          { name: "Verifiziert", description: "Bezahlte Stufe mit Abzeichen für verifiziertes Unternehmen" },
          { name: "Signature", description: "Premium-Stufe mit Signature-Abzeichen und VIP-Platzierung" },
        ],
      },
      payments: {
        title: "6. Zahlungen und Abonnements",
        paidTitle: "6.1 Kostenpflichtige Dienste",
        paidBody:
          "Bestimmte Funktionen und Eintragsstufen erfordern eine Zahlung. Durch den Kauf kostenpflichtiger Dienste erklären Sie sich damit einverstanden:",
        paidItems: [
          "Alle anwendbaren Gebühren und Kosten zu zahlen",
          "Genaue Rechnungsinformationen bereitzustellen",
          "Wiederkehrende Abbuchungen für Abonnements zu autorisieren",
        ],
        refundTitle: "6.2 Rückerstattungsrichtlinie",
        refundBody: "Rückerstattungen können nach unserem Ermessen gewährt werden. Im Allgemeinen gilt:",
        refundItems: [
          "Abonnementgebühren sind nach den ersten 14 Tagen nicht erstattungsfähig",
          "Anteilige Rückerstattungen können für Jahrespläne verfügbar sein",
          "Bei Richtlinienverstößen werden keine Rückerstattungen gewährt",
        ],
        priceTitle: "6.3 Preisänderungen",
        priceBody:
          "Wir behalten uns das Recht vor, Preise mit einer Vorankündigung von 30 Tagen zu ändern. Bestehende Abonnements werden bis zum Ende des aktuellen Abrechnungszeitraums erfüllt.",
      },
      intellectualProperty: {
        title: "7. Geistiges Eigentum",
        ourContentTitle: "7.1 Unsere Inhalte",
        ourContentBody:
          "Der Dienst und seine ursprünglichen Inhalte (mit Ausnahme von nutzergenerierten Inhalten), Funktionen und Funktionalitäten sind Eigentum von AlgarveOfficial und durch internationale Urheberrechts-, Marken-, Patent-, Geschäftsgeheimnis- und andere Gesetze zum geistigen Eigentum geschützt.",
        userContentTitle: "7.2 Nutzerinhalte",
        userContentBody:
          "Sie behalten das Eigentum an den von Ihnen eingereichten Inhalten. Durch das Veröffentlichen von Inhalten gewähren Sie uns eine nicht exklusive, weltweite, gebührenfreie Lizenz zur Nutzung, Anzeige, Vervielfältigung und Verbreitung Ihrer Inhalte im Zusammenhang mit dem Dienst.",
        dmcaTitle: "7.3 DMCA-Konformität",
        dmcaPrefix: "Wenn Sie glauben, dass Ihr urheberrechtlich geschütztes Werk verletzt wurde, kontaktieren Sie uns bitte unter",
        dmcaSuffix: "mit den erforderlichen Informationen für eine DMCA-Mitteilung.",
      },
      disclaimers: {
        title: "8. Haftungsausschlüsse und Beschränkungen",
        availabilityTitle: "8.1 Verfügbarkeit des Dienstes",
        availabilityBody:
          "Der Dienst wird \"wie besehen\" und \"wie verfügbar\" ohne Gewährleistungen jeglicher Art bereitgestellt. Wir garantieren keinen unterbrechungsfreien, sicheren oder fehlerfreien Betrieb.",
        thirdPartyTitle: "8.2 Inhalte Dritter",
        thirdPartyBody:
          "Wir sind nicht verantwortlich für die Genauigkeit, Qualität oder Rechtmäßigkeit von Einträgen oder Inhalten, die von Inhabern eingereicht werden. Nutzer interagieren mit Unternehmen auf eigenes Risiko.",
        liabilityTitle: "8.3 Haftungsbeschränkung",
        liabilityBody:
          "SOWEIT GESETZLICH ZULÄSSIG, HAFTET ALGARVEOFFICIAL NICHT FÜR INDIREKTE, ZUFÄLLIGE, BESONDERE, FOLGE- ODER STRAFSCHÄDEN, EINSCHLIESSLICH ENTGANGENER GEWINNE, DATEN ODER GESCHÄFTSCHANCEN, DIE AUS IHRER NUTZUNG DES DIENSTES ENTSTEHEN.",
        indemnificationTitle: "8.4 Freistellung",
        indemnificationBody:
          "Sie erklären sich damit einverstanden, AlgarveOfficial von allen Ansprüchen, Schäden oder Kosten freizustellen und schadlos zu halten, die aus Ihrer Nutzung des Dienstes oder der Verletzung dieser Bedingungen entstehen.",
      },
      termination: {
        title: "9. Kündigung",
        body: "Wir können Ihr Konto sperren oder kündigen, wenn Sie:",
        items: [
          "Gegen diese Nutzungsbedingungen verstoßen",
          "An verbotenen Aktivitäten teilnehmen",
          "Falsche oder irreführende Informationen bereitstellen",
          "Fällige Zahlungen für Dienste nicht leisten",
        ],
        afterBody:
          "Sie können Ihr Konto jederzeit kündigen, indem Sie uns kontaktieren. Nach der Kündigung endet Ihr Recht zur Nutzung des Dienstes sofort.",
      },
      governingLaw: {
        title: "10. Anwendbares Recht",
        body:
          "Diese Bedingungen unterliegen den Gesetzen Portugals und werden in Übereinstimmung mit diesen ausgelegt, ohne Berücksichtigung kollisionsrechtlicher Bestimmungen. Alle Streitigkeiten aus diesen Bedingungen oder Ihrer Nutzung des Dienstes werden vor den Gerichten von Faro, Portugal, beigelegt.",
        odrText:
          "Für Verbraucher in der EU: Sie können außerdem berechtigt sein, die Online-Streitbeilegungsplattform der Europäischen Kommission zu nutzen unter",
      },
      changes: {
        title: "11. Änderungen der Bedingungen",
        body:
          "Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern. Wir informieren Sie über wesentliche Änderungen, indem wir die aktualisierten Bedingungen veröffentlichen und das Datum \"Zuletzt aktualisiert\" ändern. Ihre fortgesetzte Nutzung des Dienstes nach Änderungen gilt als Annahme der neuen Bedingungen.",
      },
      contact: {
        title: "12. Kontakt",
        body: "Wenn Sie Fragen zu diesen Bedingungen haben, kontaktieren Sie uns bitte:",
        address: "Algarve, Distrikt Faro, Portugal",
      },
    },
  },
  es: {
    pageTitle: "Términos de servicio",
    introduction:
      "Bienvenido a AlgarveOfficial. Estos Términos de servicio (\"Términos\") regulan su acceso y uso del sitio web, los servicios y la plataforma de AlgarveOfficial (colectivamente, el \"Servicio\"). Al acceder o utilizar nuestro Servicio, acepta quedar vinculado por estos Términos. Si no está de acuerdo con estos Términos, no utilice nuestro Servicio.",
    lastUpdatedLabel: "Última actualización",
    lastUpdatedDate: "21 de enero de 2026",
    metaDescription:
      "Revise los Términos de servicio de AlgarveOfficial sobre acceso a la plataforma, anuncios, contenido, pagos y responsabilidades de los usuarios.",
    labels: {
      email: "Correo electrónico",
      address: "Dirección",
      accountType: "Tipo de cuenta",
      description: "Descripción",
      tier: "Nivel",
    },
    sections: {
      definitions: {
        title: "1. Definiciones",
        items: [
          { term: "\"Plataforma\"", text: "se refiere al sitio web de AlgarveOfficial y a todos los servicios relacionados" },
          { term: "\"Usuario\"", text: "se refiere a cualquier persona que acceda a la Plataforma o la utilice" },
          { term: "\"Visitante\"", text: "se refiere a los Usuarios que navegan por anuncios y contenido" },
          { term: "\"Propietario\"", text: "se refiere a los Usuarios que crean y gestionan anuncios comerciales" },
          { term: "\"Anuncio\"", text: "se refiere a perfiles comerciales y contenido enviado por Propietarios" },
          { term: "\"Contenido\"", text: "se refiere a todos los textos, imágenes, datos y materiales de la Plataforma" },
          { term: "\"Nosotros\", \"nos\" o \"nuestro\"", text: "se refiere a AlgarveOfficial" },
        ],
      },
      account: {
        title: "2. Registro de cuenta",
        creationTitle: "2.1 Creación de cuenta",
        creationBody:
          "Para acceder a determinadas funciones del Servicio, debe registrar una cuenta. Al registrarse, acepta:",
        creationItems: [
          "Proporcionar información exacta, actual y completa",
          "Mantener y actualizar puntualmente la información de su cuenta",
          "Mantener la seguridad y confidencialidad de sus credenciales de acceso",
          "Aceptar la responsabilidad de todas las actividades realizadas con su cuenta",
          "Notificarnos inmediatamente cualquier uso no autorizado de su cuenta",
        ],
        accountTypesTitle: "2.2 Tipos de cuenta",
        accountTypes: [
          { name: "Visitante", description: "Navegar por anuncios, guardar favoritos y contactar con propietarios" },
          { name: "Propietario", description: "Crear y gestionar anuncios comerciales" },
          { name: "Editor", description: "Gestionar contenido y moderar anuncios" },
          { name: "Administrador", description: "Acceso completo a la administración de la plataforma" },
        ],
        ageTitle: "2.3 Requisito de edad",
        ageBody:
          "Debe tener al menos 18 años para crear una cuenta y utilizar nuestro Servicio. Al crear una cuenta, declara y garantiza que tiene al menos 18 años.",
      },
      acceptableUse: {
        title: "3. Uso aceptable",
        body: "Al utilizar nuestro Servicio, acepta:",
        items: [
          "Cumplir todas las leyes y normativas aplicables",
          "Respetar los derechos de propiedad intelectual de terceros",
          "Proporcionar información exacta y veraz en los anuncios",
          "Comunicarse respetuosamente con otros usuarios",
          "Utilizar el Servicio únicamente para los fines previstos",
        ],
      },
      prohibited: {
        title: "4. Actividades prohibidas",
        body: "No puede utilizar el Servicio para:",
        items: [
          "Publicar contenido falso, engañoso o fraudulento",
          "Suplantar a cualquier persona o entidad",
          "Acosar, abusar o amenazar a otros usuarios",
          "Cargar código malicioso, virus o contenido dañino",
          "Extraer, rastrear o recopilar datos sin autorización",
          "Eludir medidas de seguridad o restricciones de acceso",
          "Utilizar sistemas automatizados para acceder al Servicio sin permiso",
          "Promover actividades o servicios ilegales",
          "Violar derechos de propiedad intelectual",
          "Enviar spam o mensajes comerciales no solicitados",
          "Manipular calificaciones, reseñas o métricas de interacción",
        ],
      },
      listings: {
        title: "5. Directrices de anuncios (para Propietarios)",
        contentTitle: "5.1 Requisitos de contenido",
        contentItems: [
          "Toda la información del anuncio debe ser exacta y estar actualizada",
          "Las imágenes deben representar auténticamente su negocio",
          "La información de contacto debe ser válida y operativa",
          "La información de precios (si se muestra) debe reflejar tarifas reales",
        ],
        reviewTitle: "5.2 Proceso de revisión",
        reviewBody:
          "Todos los anuncios están sujetos a revisión antes de su publicación. Nos reservamos el derecho a:",
        reviewItems: [
          "Aprobar, rechazar o solicitar modificaciones de anuncios",
          "Eliminar anuncios que infrinjan nuestras directrices",
          "Suspender o cancelar cuentas por infracciones repetidas",
        ],
        tiersTitle: "5.3 Niveles de anuncio",
        tiers: [
          { name: "No verificado", description: "Anuncio básico gratuito (sin insignia de verificación)" },
          { name: "Verificado", description: "Nivel de pago con insignia de negocio verificado" },
          { name: "Signature", description: "Nivel premium con insignia signature y ubicación VIP" },
        ],
      },
      payments: {
        title: "6. Pagos y suscripciones",
        paidTitle: "6.1 Servicios de pago",
        paidBody:
          "Algunas funciones y niveles de anuncio requieren pago. Al contratar servicios de pago, acepta:",
        paidItems: [
          "Pagar todas las tarifas y cargos aplicables",
          "Proporcionar información de facturación exacta",
          "Autorizar cargos recurrentes para suscripciones",
        ],
        refundTitle: "6.2 Política de reembolso",
        refundBody: "Los reembolsos pueden concederse a nuestra discreción. En general:",
        refundItems: [
          "Las cuotas de suscripción no son reembolsables después de los primeros 14 días",
          "Puede haber reembolsos prorrateados para planes anuales",
          "No se emitirán reembolsos por infracciones de políticas",
        ],
        priceTitle: "6.3 Cambios de precio",
        priceBody:
          "Nos reservamos el derecho de modificar los precios con 30 días de aviso previo. Las suscripciones existentes se respetarán hasta el final del periodo de facturación actual.",
      },
      intellectualProperty: {
        title: "7. Propiedad intelectual",
        ourContentTitle: "7.1 Nuestro contenido",
        ourContentBody:
          "El Servicio y su contenido original (excluido el contenido enviado por usuarios), sus funciones y funcionalidad son propiedad de AlgarveOfficial y están protegidos por leyes internacionales de derechos de autor, marcas, patentes, secretos comerciales y otras leyes de propiedad intelectual.",
        userContentTitle: "7.2 Contenido del usuario",
        userContentBody:
          "Usted conserva la titularidad del contenido que envía. Al publicar contenido, nos concede una licencia no exclusiva, mundial y libre de regalías para usar, mostrar, reproducir y distribuir su contenido en relación con el Servicio.",
        dmcaTitle: "7.3 Cumplimiento de la DMCA",
        dmcaPrefix: "Si cree que se han infringido sus derechos de autor, contáctenos en",
        dmcaSuffix: "con la información requerida para la notificación DMCA.",
      },
      disclaimers: {
        title: "8. Exenciones y limitaciones",
        availabilityTitle: "8.1 Disponibilidad del Servicio",
        availabilityBody:
          "El Servicio se proporciona \"tal cual\" y \"según disponibilidad\", sin garantías de ningún tipo. No garantizamos un funcionamiento ininterrumpido, seguro o libre de errores.",
        thirdPartyTitle: "8.2 Contenido de terceros",
        thirdPartyBody:
          "No somos responsables de la exactitud, calidad o legalidad de los anuncios o contenidos enviados por Propietarios. Los usuarios interactúan con negocios bajo su propio riesgo.",
        liabilityTitle: "8.3 Limitación de responsabilidad",
        liabilityBody:
          "EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY, ALGARVEOFFICIAL NO SERÁ RESPONSABLE DE NINGÚN DAÑO INDIRECTO, INCIDENTAL, ESPECIAL, CONSECUENTE O PUNITIVO, INCLUIDA LA PÉRDIDA DE BENEFICIOS, DATOS U OPORTUNIDADES DE NEGOCIO, DERIVADO DE SU USO DEL SERVICIO.",
        indemnificationTitle: "8.4 Indemnización",
        indemnificationBody:
          "Usted acepta indemnizar y mantener indemne a AlgarveOfficial frente a cualquier reclamación, daño o gasto derivado de su uso del Servicio o de la violación de estos Términos.",
      },
      termination: {
        title: "9. Terminación",
        body: "Podemos suspender o cancelar su cuenta si usted:",
        items: [
          "Infringe estos Términos de servicio",
          "Participa en actividades prohibidas",
          "Proporciona información falsa o engañosa",
          "No paga los servicios cuando vencen",
        ],
        afterBody:
          "Puede cancelar su cuenta en cualquier momento contactándonos. Tras la cancelación, su derecho a utilizar el Servicio cesará inmediatamente.",
      },
      governingLaw: {
        title: "10. Ley aplicable",
        body:
          "Estos Términos se regirán e interpretarán de conformidad con las leyes de Portugal, sin tener en cuenta sus normas de conflicto de leyes. Cualquier disputa derivada de estos Términos o de su uso del Servicio se resolverá en los tribunales de Faro, Portugal.",
        odrText:
          "Para consumidores de la UE: también puede tener derecho a utilizar la plataforma de resolución de litigios en línea de la Comisión Europea en",
      },
      changes: {
        title: "11. Cambios en los Términos",
        body:
          "Nos reservamos el derecho de modificar estos Términos en cualquier momento. Le notificaremos los cambios importantes publicando los Términos actualizados y actualizando la fecha de \"Última actualización\". Su uso continuado del Servicio después de los cambios constituye la aceptación de los nuevos Términos.",
      },
      contact: {
        title: "12. Contacto",
        body: "Si tiene alguna pregunta sobre estos Términos, contáctenos:",
        address: "Algarve, distrito de Faro, Portugal",
      },
    },
  },
  it: {
    pageTitle: "Termini di servizio",
    introduction:
      "Benvenuto su AlgarveOfficial. I presenti Termini di servizio (\"Termini\") regolano l'accesso e l'utilizzo del sito web, dei servizi e della piattaforma AlgarveOfficial (collettivamente, il \"Servizio\"). Accedendo o utilizzando il nostro Servizio, accetti di essere vincolato da questi Termini. Se non accetti questi Termini, ti preghiamo di non utilizzare il nostro Servizio.",
    lastUpdatedLabel: "Ultimo aggiornamento",
    lastUpdatedDate: "21 gennaio 2026",
    metaDescription:
      "Consulta i Termini di servizio di AlgarveOfficial relativi ad accesso alla piattaforma, annunci, contenuti, pagamenti e responsabilità degli utenti.",
    labels: {
      email: "Email",
      address: "Indirizzo",
      accountType: "Tipo di account",
      description: "Descrizione",
      tier: "Livello",
    },
    sections: {
      definitions: {
        title: "1. Definizioni",
        items: [
          { term: "\"Piattaforma\"", text: "indica il sito web AlgarveOfficial e tutti i servizi correlati" },
          { term: "\"Utente\"", text: "indica qualsiasi persona che accede alla Piattaforma o la utilizza" },
          { term: "\"Visitatore\"", text: "indica gli Utenti che consultano annunci e contenuti" },
          { term: "\"Proprietario\"", text: "indica gli Utenti che creano e gestiscono annunci commerciali" },
          { term: "\"Annuncio\"", text: "indica profili aziendali e contenuti inviati dai Proprietari" },
          { term: "\"Contenuto\"", text: "indica tutti i testi, immagini, dati e materiali presenti sulla Piattaforma" },
          { term: "\"Noi\", \"ci\" o \"nostro\"", text: "si riferisce ad AlgarveOfficial" },
        ],
      },
      account: {
        title: "2. Registrazione dell'account",
        creationTitle: "2.1 Creazione dell'account",
        creationBody:
          "Per accedere ad alcune funzionalità del Servizio, devi registrare un account. Al momento della registrazione, accetti di:",
        creationItems: [
          "Fornire informazioni accurate, aggiornate e complete",
          "Mantenere e aggiornare tempestivamente le informazioni del tuo account",
          "Mantenere la sicurezza e la riservatezza delle tue credenziali di accesso",
          "Accettare la responsabilità di tutte le attività svolte tramite il tuo account",
          "Avvisarci immediatamente di qualsiasi uso non autorizzato del tuo account",
        ],
        accountTypesTitle: "2.2 Tipi di account",
        accountTypes: [
          { name: "Visitatore", description: "Consultare annunci, salvare preferiti e contattare proprietari" },
          { name: "Proprietario", description: "Creare e gestire annunci commerciali" },
          { name: "Editor", description: "Gestire contenuti e moderare annunci" },
          { name: "Admin", description: "Accesso completo all'amministrazione della piattaforma" },
        ],
        ageTitle: "2.3 Requisito di età",
        ageBody:
          "Devi avere almeno 18 anni per creare un account e utilizzare il nostro Servizio. Creando un account, dichiari e garantisci di avere almeno 18 anni.",
      },
      acceptableUse: {
        title: "3. Uso accettabile",
        body: "Quando utilizzi il nostro Servizio, accetti di:",
        items: [
          "Rispettare tutte le leggi e i regolamenti applicabili",
          "Rispettare i diritti di proprietà intellettuale altrui",
          "Fornire informazioni accurate e veritiere negli annunci",
          "Comunicare rispettosamente con gli altri utenti",
          "Utilizzare il Servizio solo per gli scopi previsti",
        ],
      },
      prohibited: {
        title: "4. Attività vietate",
        body: "Non puoi utilizzare il Servizio per:",
        items: [
          "Pubblicare contenuti falsi, fuorvianti o fraudolenti",
          "Impersonare qualsiasi persona o entità",
          "Molestare, abusare o minacciare altri utenti",
          "Caricare codice dannoso, virus o contenuti nocivi",
          "Estrarre, scansionare o raccogliere dati senza autorizzazione",
          "Eludere misure di sicurezza o restrizioni di accesso",
          "Utilizzare sistemi automatizzati per accedere al Servizio senza permesso",
          "Promuovere attività o servizi illegali",
          "Violare diritti di proprietà intellettuale",
          "Inviare spam o messaggi commerciali non richiesti",
          "Manipolare valutazioni, recensioni o metriche di coinvolgimento",
        ],
      },
      listings: {
        title: "5. Linee guida per gli annunci (per Proprietari)",
        contentTitle: "5.1 Requisiti dei contenuti",
        contentItems: [
          "Tutte le informazioni dell'annuncio devono essere accurate e aggiornate",
          "Le immagini devono rappresentare autenticamente la tua attività",
          "Le informazioni di contatto devono essere valide e operative",
          "Le informazioni sui prezzi (se visualizzate) devono riflettere tariffe reali",
        ],
        reviewTitle: "5.2 Processo di revisione",
        reviewBody:
          "Tutti gli annunci sono soggetti a revisione prima della pubblicazione. Ci riserviamo il diritto di:",
        reviewItems: [
          "Approvare, rifiutare o richiedere modifiche agli annunci",
          "Rimuovere annunci che violano le nostre linee guida",
          "Sospendere o chiudere account per violazioni ripetute",
        ],
        tiersTitle: "5.3 Livelli di annuncio",
        tiers: [
          { name: "Non verificato", description: "Annuncio base gratuito (senza badge di verifica)" },
          { name: "Verificato", description: "Livello a pagamento con badge di attività verificata" },
          { name: "Signature", description: "Livello premium con badge signature e posizionamento VIP" },
        ],
      },
      payments: {
        title: "6. Pagamenti e abbonamenti",
        paidTitle: "6.1 Servizi a pagamento",
        paidBody:
          "Alcune funzionalità e livelli di annuncio richiedono un pagamento. Acquistando servizi a pagamento, accetti di:",
        paidItems: [
          "Pagare tutte le commissioni e gli addebiti applicabili",
          "Fornire informazioni di fatturazione accurate",
          "Autorizzare addebiti ricorrenti per gli abbonamenti",
        ],
        refundTitle: "6.2 Politica di rimborso",
        refundBody: "I rimborsi possono essere concessi a nostra discrezione. In generale:",
        refundItems: [
          "Le quote di abbonamento non sono rimborsabili dopo i primi 14 giorni",
          "Potrebbero essere disponibili rimborsi proporzionali per piani annuali",
          "Non saranno emessi rimborsi per violazioni delle policy",
        ],
        priceTitle: "6.3 Modifiche dei prezzi",
        priceBody:
          "Ci riserviamo il diritto di modificare i prezzi con un preavviso di 30 giorni. Gli abbonamenti esistenti saranno rispettati fino alla fine del periodo di fatturazione corrente.",
      },
      intellectualProperty: {
        title: "7. Proprietà intellettuale",
        ourContentTitle: "7.1 I nostri contenuti",
        ourContentBody:
          "Il Servizio e i suoi contenuti originali (esclusi i contenuti inviati dagli utenti), le funzionalità e il funzionamento sono di proprietà di AlgarveOfficial e sono protetti dalle leggi internazionali su copyright, marchi, brevetti, segreti commerciali e altre norme sulla proprietà intellettuale.",
        userContentTitle: "7.2 Contenuti dell'utente",
        userContentBody:
          "Mantieni la proprietà dei contenuti che invii. Pubblicando contenuti, ci concedi una licenza non esclusiva, mondiale e gratuita per usare, mostrare, riprodurre e distribuire i tuoi contenuti in relazione al Servizio.",
        dmcaTitle: "7.3 Conformità DMCA",
        dmcaPrefix: "Se ritieni che una tua opera protetta da copyright sia stata violata, contattaci a",
        dmcaSuffix: "con le informazioni richieste per la notifica DMCA.",
      },
      disclaimers: {
        title: "8. Esclusioni e limitazioni",
        availabilityTitle: "8.1 Disponibilità del Servizio",
        availabilityBody:
          "Il Servizio è fornito \"così com'è\" e \"come disponibile\", senza garanzie di alcun tipo. Non garantiamo un funzionamento ininterrotto, sicuro o privo di errori.",
        thirdPartyTitle: "8.2 Contenuti di terzi",
        thirdPartyBody:
          "Non siamo responsabili dell'accuratezza, qualità o legalità degli annunci o dei contenuti inviati dai Proprietari. Gli utenti interagiscono con le attività a proprio rischio.",
        liabilityTitle: "8.3 Limitazione di responsabilità",
        liabilityBody:
          "NELLA MISURA MASSIMA CONSENTITA DALLA LEGGE, ALGARVEOFFICIAL NON SARÀ RESPONSABILE DI DANNI INDIRETTI, INCIDENTALI, SPECIALI, CONSEQUENZIALI O PUNITIVI, INCLUSA LA PERDITA DI PROFITTI, DATI O OPPORTUNITÀ COMMERCIALI, DERIVANTI DAL TUO UTILIZZO DEL SERVIZIO.",
        indemnificationTitle: "8.4 Indennizzo",
        indemnificationBody:
          "Accetti di indennizzare e tenere indenne AlgarveOfficial da qualsiasi reclamo, danno o spesa derivante dal tuo utilizzo del Servizio o dalla violazione dei presenti Termini.",
      },
      termination: {
        title: "9. Risoluzione",
        body: "Possiamo sospendere o chiudere il tuo account se:",
        items: [
          "Violi questi Termini di servizio",
          "Svolgi attività vietate",
          "Fornisci informazioni false o fuorvianti",
          "Non paghi i servizi alla scadenza",
        ],
        afterBody:
          "Puoi chiudere il tuo account in qualsiasi momento contattandoci. Dopo la chiusura, il tuo diritto di utilizzare il Servizio cesserà immediatamente.",
      },
      governingLaw: {
        title: "10. Legge applicabile",
        body:
          "I presenti Termini saranno regolati e interpretati secondo le leggi del Portogallo, senza riguardo alle norme sul conflitto di leggi. Qualsiasi controversia derivante da questi Termini o dal tuo utilizzo del Servizio sarà risolta nei tribunali di Faro, Portogallo.",
        odrText:
          "Per i consumatori dell'UE: potresti anche avere diritto a utilizzare la piattaforma di risoluzione online delle controversie della Commissione europea all'indirizzo",
      },
      changes: {
        title: "11. Modifiche ai Termini",
        body:
          "Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. Ti informeremo delle modifiche sostanziali pubblicando i Termini aggiornati e aggiornando la data di \"Ultimo aggiornamento\". L'uso continuato del Servizio dopo le modifiche costituisce accettazione dei nuovi Termini.",
      },
      contact: {
        title: "12. Contattaci",
        body: "Se hai domande su questi Termini, contattaci:",
        address: "Algarve, distretto di Faro, Portogallo",
      },
    },
  },
  nl: {
    pageTitle: "Servicevoorwaarden",
    introduction:
      "Welkom bij AlgarveOfficial. Deze Servicevoorwaarden (\"Voorwaarden\") regelen uw toegang tot en gebruik van de website, diensten en het platform van AlgarveOfficial (gezamenlijk de \"Dienst\"). Door onze Dienst te openen of te gebruiken, stemt u ermee in aan deze Voorwaarden gebonden te zijn. Als u niet akkoord gaat met deze Voorwaarden, gebruik onze Dienst dan niet.",
    lastUpdatedLabel: "Laatst bijgewerkt",
    lastUpdatedDate: "21 januari 2026",
    metaDescription:
      "Bekijk de Servicevoorwaarden van AlgarveOfficial over platformtoegang, vermeldingen, inhoud, betalingen en gebruikersverantwoordelijkheden.",
    labels: {
      email: "E-mail",
      address: "Adres",
      accountType: "Accounttype",
      description: "Beschrijving",
      tier: "Niveau",
    },
    sections: {
      definitions: {
        title: "1. Definities",
        items: [
          { term: "\"Platform\"", text: "verwijst naar de website van AlgarveOfficial en alle gerelateerde diensten" },
          { term: "\"Gebruiker\"", text: "verwijst naar iedere persoon die toegang heeft tot het Platform of het gebruikt" },
          { term: "\"Bezoeker\"", text: "verwijst naar Gebruikers die vermeldingen en inhoud bekijken" },
          { term: "\"Eigenaar\"", text: "verwijst naar Gebruikers die bedrijfsvermeldingen maken en beheren" },
          { term: "\"Vermelding\"", text: "verwijst naar bedrijfsprofielen en inhoud die door Eigenaren zijn ingediend" },
          { term: "\"Inhoud\"", text: "verwijst naar alle tekst, afbeeldingen, gegevens en materialen op het Platform" },
          { term: "\"Wij\", \"ons\" of \"onze\"", text: "verwijst naar AlgarveOfficial" },
        ],
      },
      account: {
        title: "2. Accountregistratie",
        creationTitle: "2.1 Account aanmaken",
        creationBody:
          "Om toegang te krijgen tot bepaalde functies van de Dienst, moet u een account registreren. Bij registratie stemt u ermee in om:",
        creationItems: [
          "Nauwkeurige, actuele en volledige informatie te verstrekken",
          "Uw accountgegevens te onderhouden en tijdig bij te werken",
          "De veiligheid en vertrouwelijkheid van uw inloggegevens te bewaren",
          "Verantwoordelijkheid te aanvaarden voor alle activiteiten onder uw account",
          "Ons onmiddellijk op de hoogte te stellen van ongeoorloofd gebruik van uw account",
        ],
        accountTypesTitle: "2.2 Accounttypen",
        accountTypes: [
          { name: "Bezoeker", description: "Vermeldingen bekijken, favorieten opslaan en eigenaren contacteren" },
          { name: "Eigenaar", description: "Bedrijfsvermeldingen maken en beheren" },
          { name: "Editor", description: "Inhoud beheren en vermeldingen modereren" },
          { name: "Admin", description: "Volledige administratieve toegang tot het platform" },
        ],
        ageTitle: "2.3 Leeftijdsvereiste",
        ageBody:
          "U moet minimaal 18 jaar oud zijn om een account aan te maken en onze Dienst te gebruiken. Door een account aan te maken, verklaart en garandeert u dat u minimaal 18 jaar oud bent.",
      },
      acceptableUse: {
        title: "3. Aanvaardbaar gebruik",
        body: "Wanneer u onze Dienst gebruikt, stemt u ermee in om:",
        items: [
          "Alle toepasselijke wetten en regels na te leven",
          "De intellectuele eigendomsrechten van anderen te respecteren",
          "Nauwkeurige en waarheidsgetrouwe informatie in vermeldingen te verstrekken",
          "Respectvol met andere gebruikers te communiceren",
          "De Dienst uitsluitend voor het beoogde doel te gebruiken",
        ],
      },
      prohibited: {
        title: "4. Verboden activiteiten",
        body: "U mag de Dienst niet gebruiken om:",
        items: [
          "Valse, misleidende of frauduleuze inhoud te plaatsen",
          "Zich voor te doen als een andere persoon of entiteit",
          "Andere gebruikers lastig te vallen, te misbruiken of te bedreigen",
          "Kwaadaardige code, virussen of schadelijke inhoud te uploaden",
          "Gegevens zonder toestemming te scrapen, crawlen of verzamelen",
          "Beveiligingsmaatregelen of toegangsbeperkingen te omzeilen",
          "Geautomatiseerde systemen zonder toestemming toegang tot de Dienst te laten krijgen",
          "Illegale activiteiten of diensten te promoten",
          "Intellectuele eigendomsrechten te schenden",
          "Spam of ongevraagde commerciële berichten te verzenden",
          "Beoordelingen, recensies of betrokkenheidsstatistieken te manipuleren",
        ],
      },
      listings: {
        title: "5. Richtlijnen voor vermeldingen (voor Eigenaren)",
        contentTitle: "5.1 Inhoudsvereisten",
        contentItems: [
          "Alle informatie in vermeldingen moet nauwkeurig en actueel zijn",
          "Afbeeldingen moeten een authentieke weergave van uw bedrijf zijn",
          "Contactgegevens moeten geldig en operationeel zijn",
          "Prijsinformatie (indien weergegeven) moet werkelijke tarieven weerspiegelen",
        ],
        reviewTitle: "5.2 Beoordelingsproces",
        reviewBody:
          "Alle vermeldingen worden vóór publicatie beoordeeld. Wij behouden ons het recht voor om:",
        reviewItems: [
          "Vermeldingen goed te keuren, af te wijzen of wijzigingen te vragen",
          "Vermeldingen te verwijderen die onze richtlijnen schenden",
          "Accounts te schorsen of te beëindigen bij herhaalde overtredingen",
        ],
        tiersTitle: "5.3 Vermeldingsniveaus",
        tiers: [
          { name: "Niet geverifieerd", description: "Gratis basisvermelding (zonder verificatiebadge)" },
          { name: "Geverifieerd", description: "Betaald niveau met badge voor geverifieerd bedrijf" },
          { name: "Signature", description: "Premium niveau met signature-badge en VIP-plaatsing" },
        ],
      },
      payments: {
        title: "6. Betalingen en abonnementen",
        paidTitle: "6.1 Betaalde diensten",
        paidBody:
          "Bepaalde functies en vermeldingsniveaus vereisen betaling. Door betaalde diensten aan te schaffen, stemt u ermee in om:",
        paidItems: [
          "Alle toepasselijke vergoedingen en kosten te betalen",
          "Nauwkeurige factuurgegevens te verstrekken",
          "Terugkerende kosten voor abonnementen te autoriseren",
        ],
        refundTitle: "6.2 Restitutiebeleid",
        refundBody: "Restituties kunnen naar ons oordeel worden verleend. In het algemeen:",
        refundItems: [
          "Abonnementskosten zijn na de eerste 14 dagen niet restitueerbaar",
          "Pro-rato restituties kunnen beschikbaar zijn voor jaarplannen",
          "Er worden geen restituties verleend bij beleidsovertredingen",
        ],
        priceTitle: "6.3 Prijswijzigingen",
        priceBody:
          "Wij behouden ons het recht voor prijzen te wijzigen met een voorafgaande kennisgeving van 30 dagen. Bestaande abonnementen worden gehonoreerd tot het einde van de huidige factureringsperiode.",
      },
      intellectualProperty: {
        title: "7. Intellectuele eigendom",
        ourContentTitle: "7.1 Onze inhoud",
        ourContentBody:
          "De Dienst en de originele inhoud daarvan (met uitzondering van door gebruikers ingediende inhoud), functies en functionaliteit zijn eigendom van AlgarveOfficial en worden beschermd door internationale auteursrecht-, handelsmerk-, octrooi-, handelsgeheim- en andere intellectuele eigendomswetten.",
        userContentTitle: "7.2 Gebruikersinhoud",
        userContentBody:
          "U behoudt het eigendom van de inhoud die u indient. Door inhoud te plaatsen, verleent u ons een niet-exclusieve, wereldwijde, royaltyvrije licentie om uw inhoud te gebruiken, weer te geven, te reproduceren en te verspreiden in verband met de Dienst.",
        dmcaTitle: "7.3 DMCA-naleving",
        dmcaPrefix: "Als u denkt dat uw auteursrechtelijk beschermd werk is geschonden, neem dan contact met ons op via",
        dmcaSuffix: "met de vereiste informatie voor de DMCA-kennisgeving.",
      },
      disclaimers: {
        title: "8. Vrijwaringen en beperkingen",
        availabilityTitle: "8.1 Beschikbaarheid van de Dienst",
        availabilityBody:
          "De Dienst wordt geleverd \"zoals deze is\" en \"zoals beschikbaar\", zonder enige garantie. Wij garanderen geen ononderbroken, veilige of foutloze werking.",
        thirdPartyTitle: "8.2 Inhoud van derden",
        thirdPartyBody:
          "Wij zijn niet verantwoordelijk voor de juistheid, kwaliteit of rechtmatigheid van vermeldingen of inhoud die door Eigenaren worden ingediend. Gebruikers gaan op eigen risico met bedrijven om.",
        liabilityTitle: "8.3 Beperking van aansprakelijkheid",
        liabilityBody:
          "VOOR ZOVER WETTELIJK TOEGESTAAN, IS ALGARVEOFFICIAL NIET AANSPRAKELIJK VOOR ENIGE INDIRECTE, INCIDENTELE, BIJZONDERE, GEVOLG- OF PUNITIEVE SCHADE, WAARONDER VERLIES VAN WINST, GEGEVENS OF ZAKELIJKE KANSEN, VOORTVLOEIEND UIT UW GEBRUIK VAN DE DIENST.",
        indemnificationTitle: "8.4 Schadeloosstelling",
        indemnificationBody:
          "U stemt ermee in AlgarveOfficial te vrijwaren en schadeloos te stellen voor alle claims, schade of kosten die voortvloeien uit uw gebruik van de Dienst of schending van deze Voorwaarden.",
      },
      termination: {
        title: "9. Beëindiging",
        body: "Wij kunnen uw account schorsen of beëindigen als u:",
        items: [
          "Deze Servicevoorwaarden schendt",
          "Deelneemt aan verboden activiteiten",
          "Valse of misleidende informatie verstrekt",
          "Niet betaalt voor diensten wanneer betaling verschuldigd is",
        ],
        afterBody:
          "U kunt uw account op elk moment beëindigen door contact met ons op te nemen. Na beëindiging eindigt uw recht om de Dienst te gebruiken onmiddellijk.",
      },
      governingLaw: {
        title: "10. Toepasselijk recht",
        body:
          "Deze Voorwaarden worden beheerst door en geïnterpreteerd volgens de wetten van Portugal, zonder rekening te houden met conflictrechtelijke bepalingen. Geschillen die voortvloeien uit deze Voorwaarden of uw gebruik van de Dienst worden beslecht door de rechtbanken van Faro, Portugal.",
        odrText:
          "Voor EU-consumenten: u kunt ook gerechtigd zijn gebruik te maken van het onlinegeschillenbeslechtingsplatform van de Europese Commissie op",
      },
      changes: {
        title: "11. Wijzigingen in de Voorwaarden",
        body:
          "Wij behouden ons het recht voor deze Voorwaarden op elk moment te wijzigen. Wij stellen u op de hoogte van wezenlijke wijzigingen door de bijgewerkte Voorwaarden te plaatsen en de datum \"Laatst bijgewerkt\" aan te passen. Uw voortgezette gebruik van de Dienst na wijzigingen betekent dat u de nieuwe Voorwaarden accepteert.",
      },
      contact: {
        title: "12. Contact",
        body: "Als u vragen heeft over deze Voorwaarden, neem dan contact met ons op:",
        address: "Algarve, district Faro, Portugal",
      },
    },
  },
  sv: {
    pageTitle: "Användarvillkor",
    introduction:
      "Välkommen till AlgarveOfficial. Dessa Användarvillkor (\"Villkor\") reglerar din åtkomst till och användning av AlgarveOfficials webbplats, tjänster och plattform (gemensamt \"Tjänsten\"). Genom att komma åt eller använda vår Tjänst godkänner du att vara bunden av dessa Villkor. Om du inte godkänner Villkoren ska du inte använda vår Tjänst.",
    lastUpdatedLabel: "Senast uppdaterad",
    lastUpdatedDate: "21 januari 2026",
    metaDescription:
      "Läs AlgarveOfficials användarvillkor för plattformsåtkomst, annonser, innehåll, betalningar och användaransvar.",
    labels: {
      email: "E-post",
      address: "Adress",
      accountType: "Kontotyp",
      description: "Beskrivning",
      tier: "Nivå",
    },
    sections: {
      definitions: {
        title: "1. Definitioner",
        items: [
          { term: "\"Plattform\"", text: "avser AlgarveOfficials webbplats och alla relaterade tjänster" },
          { term: "\"Användare\"", text: "avser varje person som får åtkomst till eller använder Plattformen" },
          { term: "\"Besökare\"", text: "avser Användare som bläddrar bland annonser och innehåll" },
          { term: "\"Ägare\"", text: "avser Användare som skapar och hanterar företagsannonser" },
          { term: "\"Annons\"", text: "avser företagsprofiler och innehåll som skickas in av Ägare" },
          { term: "\"Innehåll\"", text: "avser all text, bilder, data och material på Plattformen" },
          { term: "\"Vi\", \"oss\" eller \"vår\"", text: "avser AlgarveOfficial" },
        ],
      },
      account: {
        title: "2. Kontoregistrering",
        creationTitle: "2.1 Skapa konto",
        creationBody:
          "För att få åtkomst till vissa funktioner i Tjänsten måste du registrera ett konto. Vid registrering godkänner du att:",
        creationItems: [
          "Lämna korrekta, aktuella och fullständiga uppgifter",
          "Underhålla och snabbt uppdatera dina kontouppgifter",
          "Upprätthålla säkerheten och sekretessen för dina inloggningsuppgifter",
          "Acceptera ansvar för alla aktiviteter under ditt konto",
          "Omedelbart meddela oss om obehörig användning av ditt konto",
        ],
        accountTypesTitle: "2.2 Kontotyper",
        accountTypes: [
          { name: "Besökare", description: "Bläddra bland annonser, spara favoriter och kontakta ägare" },
          { name: "Ägare", description: "Skapa och hantera företagsannonser" },
          { name: "Redaktör", description: "Hantera innehåll och moderera annonser" },
          { name: "Admin", description: "Full administrativ åtkomst till plattformen" },
        ],
        ageTitle: "2.3 Ålderskrav",
        ageBody:
          "Du måste vara minst 18 år för att skapa ett konto och använda vår Tjänst. Genom att skapa ett konto intygar och garanterar du att du är minst 18 år.",
      },
      acceptableUse: {
        title: "3. Godtagbar användning",
        body: "När du använder vår Tjänst godkänner du att:",
        items: [
          "Följa alla tillämpliga lagar och regler",
          "Respektera andras immateriella rättigheter",
          "Lämna korrekta och sanningsenliga uppgifter i annonser",
          "Kommunicera respektfullt med andra användare",
          "Endast använda Tjänsten för dess avsedda ändamål",
        ],
      },
      prohibited: {
        title: "4. Förbjudna aktiviteter",
        body: "Du får inte använda Tjänsten för att:",
        items: [
          "Publicera falskt, vilseledande eller bedrägligt innehåll",
          "Utge dig för att vara någon person eller enhet",
          "Trakassera, missbruka eller hota andra användare",
          "Ladda upp skadlig kod, virus eller skadligt innehåll",
          "Skrapa, crawla eller samla in data utan tillstånd",
          "Kringgå säkerhetsåtgärder eller åtkomstbegränsningar",
          "Använda automatiserade system för att komma åt Tjänsten utan tillstånd",
          "Främja olagliga aktiviteter eller tjänster",
          "Kränka immateriella rättigheter",
          "Skicka spam eller oönskade kommersiella meddelanden",
          "Manipulera betyg, recensioner eller engagemangsmått",
        ],
      },
      listings: {
        title: "5. Riktlinjer för annonser (för Ägare)",
        contentTitle: "5.1 Innehållskrav",
        contentItems: [
          "All annonsinformation måste vara korrekt och uppdaterad",
          "Bilder måste vara autentiska representationer av ditt företag",
          "Kontaktuppgifter måste vara giltiga och fungerande",
          "Prisinformation (om den visas) måste återspegla faktiska priser",
        ],
        reviewTitle: "5.2 Granskningsprocess",
        reviewBody:
          "Alla annonser granskas före publicering. Vi förbehåller oss rätten att:",
        reviewItems: [
          "Godkänna, avvisa eller begära ändringar av annonser",
          "Ta bort annonser som bryter mot våra riktlinjer",
          "Stänga av eller avsluta konton vid upprepade överträdelser",
        ],
        tiersTitle: "5.3 Annonsnivåer",
        tiers: [
          { name: "Overifierad", description: "Gratis basannons (utan verifieringsmärke)" },
          { name: "Verifierad", description: "Betald nivå med verifierat företagsmärke" },
          { name: "Signature", description: "Premiumnivå med signature-märke och VIP-placering" },
        ],
      },
      payments: {
        title: "6. Betalningar och abonnemang",
        paidTitle: "6.1 Betalda tjänster",
        paidBody:
          "Vissa funktioner och annonsnivåer kräver betalning. Genom att köpa betalda tjänster godkänner du att:",
        paidItems: [
          "Betala alla tillämpliga avgifter och kostnader",
          "Lämna korrekt faktureringsinformation",
          "Godkänna återkommande debiteringar för abonnemang",
        ],
        refundTitle: "6.2 Återbetalningspolicy",
        refundBody: "Återbetalningar kan beviljas efter vårt gottfinnande. Generellt:",
        refundItems: [
          "Abonnemangsavgifter återbetalas inte efter de första 14 dagarna",
          "Proportionella återbetalningar kan vara tillgängliga för årsplaner",
          "Återbetalningar ges inte vid policyöverträdelser",
        ],
        priceTitle: "6.3 Prisändringar",
        priceBody:
          "Vi förbehåller oss rätten att ändra priser med 30 dagars varsel. Befintliga abonnemang respekteras till slutet av den aktuella faktureringsperioden.",
      },
      intellectualProperty: {
        title: "7. Immateriella rättigheter",
        ourContentTitle: "7.1 Vårt innehåll",
        ourContentBody:
          "Tjänsten och dess ursprungliga innehåll (exklusive användarinlämnat innehåll), funktioner och funktionalitet ägs av AlgarveOfficial och skyddas av internationella lagar om upphovsrätt, varumärken, patent, företagshemligheter och andra immateriella rättigheter.",
        userContentTitle: "7.2 Användarinnehåll",
        userContentBody:
          "Du behåller äganderätten till innehåll du skickar in. Genom att publicera innehåll ger du oss en icke-exklusiv, global, royaltyfri licens att använda, visa, reproducera och distribuera ditt innehåll i samband med Tjänsten.",
        dmcaTitle: "7.3 DMCA-efterlevnad",
        dmcaPrefix: "Om du anser att ditt upphovsrättsskyddade verk har kränkts, kontakta oss på",
        dmcaSuffix: "med den information som krävs för en DMCA-anmälan.",
      },
      disclaimers: {
        title: "8. Ansvarsfriskrivningar och begränsningar",
        availabilityTitle: "8.1 Tjänstens tillgänglighet",
        availabilityBody:
          "Tjänsten tillhandahålls \"i befintligt skick\" och \"i mån av tillgänglighet\" utan garantier av något slag. Vi garanterar inte oavbruten, säker eller felfri drift.",
        thirdPartyTitle: "8.2 Innehåll från tredje part",
        thirdPartyBody:
          "Vi ansvarar inte för riktighet, kvalitet eller laglighet i annonser eller innehåll som skickas in av Ägare. Användare interagerar med företag på egen risk.",
        liabilityTitle: "8.3 Ansvarsbegränsning",
        liabilityBody:
          "I DEN UTSTRÄCKNING LAGEN TILLÅTER SKA ALGARVEOFFICIAL INTE VARA ANSVARIGT FÖR INDIREKTA, TILLFÄLLIGA, SÄRSKILDA, FÖLJDSKADOR ELLER STRAFFSKADOR, INKLUSIVE FÖRLUST AV VINST, DATA ELLER AFFÄRSMÖJLIGHETER, SOM UPPSTÅR GENOM DIN ANVÄNDNING AV TJÄNSTEN.",
        indemnificationTitle: "8.4 Skadeslöshet",
        indemnificationBody:
          "Du samtycker till att hålla AlgarveOfficial skadeslöst från alla anspråk, skador eller kostnader som uppstår genom din användning av Tjänsten eller överträdelse av dessa Villkor.",
      },
      termination: {
        title: "9. Uppsägning",
        body: "Vi kan stänga av eller säga upp ditt konto om du:",
        items: [
          "Bryter mot dessa Användarvillkor",
          "Deltar i förbjudna aktiviteter",
          "Lämnar falsk eller vilseledande information",
          "Inte betalar för tjänster när betalning förfaller",
        ],
        afterBody:
          "Du kan säga upp ditt konto när som helst genom att kontakta oss. Efter uppsägning upphör din rätt att använda Tjänsten omedelbart.",
      },
      governingLaw: {
        title: "10. Tillämplig lag",
        body:
          "Dessa Villkor ska regleras av och tolkas enligt Portugals lagar, utan hänsyn till dess lagvalsregler. Tvister som uppstår ur dessa Villkor eller din användning av Tjänsten ska avgöras vid domstolarna i Faro, Portugal.",
        odrText:
          "För EU-konsumenter: du kan även ha rätt att använda Europeiska kommissionens plattform för tvistlösning online på",
      },
      changes: {
        title: "11. Ändringar av Villkoren",
        body:
          "Vi förbehåller oss rätten att ändra dessa Villkor när som helst. Vi meddelar dig om väsentliga ändringar genom att publicera de uppdaterade Villkoren och uppdatera datumet \"Senast uppdaterad\". Fortsatt användning av Tjänsten efter ändringar innebär godkännande av de nya Villkoren.",
      },
      contact: {
        title: "12. Kontakta oss",
        body: "Om du har frågor om dessa Villkor, kontakta oss:",
        address: "Algarve, Faro-distriktet, Portugal",
      },
    },
  },
  no: {
    pageTitle: "Vilkår for bruk",
    introduction:
      "Velkommen til AlgarveOfficial. Disse Vilkårene for bruk (\"Vilkår\") regulerer din tilgang til og bruk av AlgarveOfficials nettsted, tjenester og plattform (samlet kalt \"Tjenesten\"). Ved å få tilgang til eller bruke Tjenesten samtykker du i å være bundet av disse Vilkårene. Hvis du ikke godtar Vilkårene, må du ikke bruke Tjenesten.",
    lastUpdatedLabel: "Sist oppdatert",
    lastUpdatedDate: "21. januar 2026",
    metaDescription:
      "Les AlgarveOfficials vilkår for plattformtilgang, oppføringer, innhold, betalinger og brukeransvar.",
    labels: {
      email: "E-post",
      address: "Adresse",
      accountType: "Kontotype",
      description: "Beskrivelse",
      tier: "Nivå",
    },
    sections: {
      definitions: {
        title: "1. Definisjoner",
        items: [
          { term: "\"Plattform\"", text: "viser til AlgarveOfficial-nettstedet og alle relaterte tjenester" },
          { term: "\"Bruker\"", text: "viser til enhver person som får tilgang til eller bruker Plattformen" },
          { term: "\"Besøkende\"", text: "viser til Brukere som blar gjennom oppføringer og innhold" },
          { term: "\"Eier\"", text: "viser til Brukere som oppretter og administrerer bedriftsoppføringer" },
          { term: "\"Oppføring\"", text: "viser til bedriftsprofiler og innhold sendt inn av Eiere" },
          { term: "\"Innhold\"", text: "viser til all tekst, bilder, data og materiale på Plattformen" },
          { term: "\"Vi\", \"oss\" eller \"vår\"", text: "viser til AlgarveOfficial" },
        ],
      },
      account: {
        title: "2. Kontoregistrering",
        creationTitle: "2.1 Opprettelse av konto",
        creationBody:
          "For å få tilgang til enkelte funksjoner i Tjenesten må du registrere en konto. Ved registrering samtykker du i å:",
        creationItems: [
          "Gi nøyaktig, oppdatert og fullstendig informasjon",
          "Vedlikeholde og raskt oppdatere kontoinformasjonen din",
          "Opprettholde sikkerheten og konfidensialiteten til innloggingsopplysningene dine",
          "Akseptere ansvar for all aktivitet under kontoen din",
          "Varsle oss umiddelbart om uautorisert bruk av kontoen din",
        ],
        accountTypesTitle: "2.2 Kontotyper",
        accountTypes: [
          { name: "Besøkende", description: "Bla gjennom oppføringer, lagre favoritter og kontakte eiere" },
          { name: "Eier", description: "Opprette og administrere bedriftsoppføringer" },
          { name: "Redaktør", description: "Administrere innhold og moderere oppføringer" },
          { name: "Admin", description: "Full administrativ tilgang til plattformen" },
        ],
        ageTitle: "2.3 Alderskrav",
        ageBody:
          "Du må være minst 18 år for å opprette en konto og bruke Tjenesten. Ved å opprette en konto erklærer og garanterer du at du er minst 18 år.",
      },
      acceptableUse: {
        title: "3. Akseptabel bruk",
        body: "Når du bruker Tjenesten, samtykker du i å:",
        items: [
          "Overholde alle gjeldende lover og regler",
          "Respektere andres immaterielle rettigheter",
          "Gi nøyaktig og sannferdig informasjon i oppføringer",
          "Kommunisere respektfullt med andre brukere",
          "Bruke Tjenesten kun til dens tiltenkte formål",
        ],
      },
      prohibited: {
        title: "4. Forbudte aktiviteter",
        body: "Du kan ikke bruke Tjenesten til å:",
        items: [
          "Publisere falskt, villedende eller uredelig innhold",
          "Utgi deg for å være en annen person eller enhet",
          "Trakassere, misbruke eller true andre brukere",
          "Laste opp skadelig kode, virus eller skadelig innhold",
          "Skrape, crawle eller samle inn data uten autorisasjon",
          "Omgå sikkerhetstiltak eller tilgangsbegrensninger",
          "Bruke automatiserte systemer til å få tilgang til Tjenesten uten tillatelse",
          "Fremme ulovlige aktiviteter eller tjenester",
          "Krenke immaterielle rettigheter",
          "Sende spam eller uønskede kommersielle meldinger",
          "Manipulere vurderinger, anmeldelser eller engasjementsmålinger",
        ],
      },
      listings: {
        title: "5. Retningslinjer for oppføringer (for Eiere)",
        contentTitle: "5.1 Innholdskrav",
        contentItems: [
          "All informasjon i oppføringer må være nøyaktig og oppdatert",
          "Bilder må være autentiske representasjoner av virksomheten din",
          "Kontaktinformasjon må være gyldig og fungere",
          "Prisinformasjon (hvis vist) må gjenspeile faktiske priser",
        ],
        reviewTitle: "5.2 Gjennomgangsprosess",
        reviewBody:
          "Alle oppføringer er underlagt gjennomgang før publisering. Vi forbeholder oss retten til å:",
        reviewItems: [
          "Godkjenne, avvise eller be om endringer i oppføringer",
          "Fjerne oppføringer som bryter retningslinjene våre",
          "Suspendere eller avslutte kontoer ved gjentatte brudd",
        ],
        tiersTitle: "5.3 Oppføringsnivåer",
        tiers: [
          { name: "Ikke verifisert", description: "Gratis grunnoppføring (uten verifiseringsmerke)" },
          { name: "Verifisert", description: "Betalt nivå med verifisert bedriftsmerke" },
          { name: "Signature", description: "Premiumnivå med signature-merke og VIP-plassering" },
        ],
      },
      payments: {
        title: "6. Betalinger og abonnementer",
        paidTitle: "6.1 Betalte tjenester",
        paidBody:
          "Enkelte funksjoner og oppføringsnivåer krever betaling. Ved å kjøpe betalte tjenester samtykker du i å:",
        paidItems: [
          "Betale alle gjeldende gebyrer og kostnader",
          "Gi nøyaktig faktureringsinformasjon",
          "Autorisere gjentakende belastninger for abonnementer",
        ],
        refundTitle: "6.2 Refusjonspolicy",
        refundBody: "Refusjoner kan gis etter vårt skjønn. Generelt:",
        refundItems: [
          "Abonnementsavgifter refunderes ikke etter de første 14 dagene",
          "Forholdsmessige refusjoner kan være tilgjengelige for årsplaner",
          "Refusjoner gis ikke ved brudd på retningslinjer",
        ],
        priceTitle: "6.3 Prisendringer",
        priceBody:
          "Vi forbeholder oss retten til å endre priser med 30 dagers forhåndsvarsel. Eksisterende abonnementer vil bli respektert til slutten av inneværende faktureringsperiode.",
      },
      intellectualProperty: {
        title: "7. Immaterielle rettigheter",
        ourContentTitle: "7.1 Vårt innhold",
        ourContentBody:
          "Tjenesten og dens opprinnelige innhold (unntatt brukerinnsendt innhold), funksjoner og funksjonalitet eies av AlgarveOfficial og er beskyttet av internasjonale lover om opphavsrett, varemerker, patenter, forretningshemmeligheter og andre immaterielle rettigheter.",
        userContentTitle: "7.2 Brukerinnhold",
        userContentBody:
          "Du beholder eierskapet til innhold du sender inn. Ved å publisere innhold gir du oss en ikke-eksklusiv, verdensomspennende, royaltyfri lisens til å bruke, vise, reprodusere og distribuere innholdet ditt i forbindelse med Tjenesten.",
        dmcaTitle: "7.3 DMCA-overholdelse",
        dmcaPrefix: "Hvis du mener at ditt opphavsrettsbeskyttede verk er krenket, kan du kontakte oss på",
        dmcaSuffix: "med nødvendig informasjon for DMCA-varselet.",
      },
      disclaimers: {
        title: "8. Ansvarsfraskrivelser og begrensninger",
        availabilityTitle: "8.1 Tjenestens tilgjengelighet",
        availabilityBody:
          "Tjenesten leveres \"som den er\" og \"som tilgjengelig\" uten garantier av noe slag. Vi garanterer ikke uavbrutt, sikker eller feilfri drift.",
        thirdPartyTitle: "8.2 Tredjepartsinnhold",
        thirdPartyBody:
          "Vi er ikke ansvarlige for nøyaktigheten, kvaliteten eller lovligheten av oppføringer eller innhold sendt inn av Eiere. Brukere samhandler med virksomheter på egen risiko.",
        liabilityTitle: "8.3 Ansvarsbegrensning",
        liabilityBody:
          "I DEN GRAD LOVEN TILLATER DET, SKAL ALGARVEOFFICIAL IKKE VÆRE ANSVARLIG FOR INDIREKTE, TILFELDIGE, SPESIELLE, FØLGESKADER ELLER STRAFFESKADER, INKLUDERT TAP AV FORTJENESTE, DATA ELLER FORRETNINGSMULIGHETER, SOM OPPSTÅR FRA DIN BRUK AV TJENESTEN.",
        indemnificationTitle: "8.4 Skadesløsholdelse",
        indemnificationBody:
          "Du samtykker i å holde AlgarveOfficial skadesløs fra alle krav, skader eller utgifter som oppstår fra din bruk av Tjenesten eller brudd på disse Vilkårene.",
      },
      termination: {
        title: "9. Oppsigelse",
        body: "Vi kan suspendere eller avslutte kontoen din hvis du:",
        items: [
          "Bryter disse Vilkårene for bruk",
          "Deltar i forbudte aktiviteter",
          "Gir falsk eller villedende informasjon",
          "Unnlater å betale for tjenester når betaling forfaller",
        ],
        afterBody:
          "Du kan avslutte kontoen din når som helst ved å kontakte oss. Ved avslutning opphører retten din til å bruke Tjenesten umiddelbart.",
      },
      governingLaw: {
        title: "10. Gjeldende lov",
        body:
          "Disse Vilkårene skal reguleres av og tolkes i samsvar med lovene i Portugal, uten hensyn til lovvalgsreglene. Eventuelle tvister som oppstår fra disse Vilkårene eller din bruk av Tjenesten, skal løses i domstolene i Faro, Portugal.",
        odrText:
          "For EU-forbrukere: du kan også ha rett til å bruke Europakommisjonens nettbaserte plattform for tvisteløsning på",
      },
      changes: {
        title: "11. Endringer i Vilkårene",
        body:
          "Vi forbeholder oss retten til å endre disse Vilkårene når som helst. Vi vil varsle deg om vesentlige endringer ved å publisere de oppdaterte Vilkårene og oppdatere datoen for \"Sist oppdatert\". Fortsatt bruk av Tjenesten etter endringer utgjør aksept av de nye Vilkårene.",
      },
      contact: {
        title: "12. Kontakt oss",
        body: "Hvis du har spørsmål om disse Vilkårene, kan du kontakte oss:",
        address: "Algarve, Faro-distriktet, Portugal",
      },
    },
  },
  da: {
    pageTitle: "Servicevilkår",
    introduction:
      "Velkommen til AlgarveOfficial. Disse Servicevilkår (\"Vilkår\") regulerer din adgang til og brug af AlgarveOfficials website, tjenester og platform (samlet kaldet \"Tjenesten\"). Ved at tilgå eller bruge Tjenesten accepterer du at være bundet af disse Vilkår. Hvis du ikke accepterer Vilkårene, bedes du undlade at bruge Tjenesten.",
    lastUpdatedLabel: "Sidst opdateret",
    lastUpdatedDate: "21. januar 2026",
    metaDescription:
      "Læs AlgarveOfficials servicevilkår for platformadgang, opslag, indhold, betalinger og brugeransvar.",
    labels: {
      email: "E-mail",
      address: "Adresse",
      accountType: "Kontotype",
      description: "Beskrivelse",
      tier: "Niveau",
    },
    sections: {
      definitions: {
        title: "1. Definitioner",
        items: [
          { term: "\"Platform\"", text: "henviser til AlgarveOfficial-websitet og alle relaterede tjenester" },
          { term: "\"Bruger\"", text: "henviser til enhver person, der tilgår eller bruger Platformen" },
          { term: "\"Besøgende\"", text: "henviser til Brugere, der gennemser opslag og indhold" },
          { term: "\"Ejer\"", text: "henviser til Brugere, der opretter og administrerer virksomhedsopslag" },
          { term: "\"Opslag\"", text: "henviser til virksomhedsprofiler og indhold indsendt af Ejere" },
          { term: "\"Indhold\"", text: "henviser til al tekst, billeder, data og materialer på Platformen" },
          { term: "\"Vi\", \"os\" eller \"vores\"", text: "henviser til AlgarveOfficial" },
        ],
      },
      account: {
        title: "2. Kontoregistrering",
        creationTitle: "2.1 Oprettelse af konto",
        creationBody:
          "For at få adgang til visse funktioner i Tjenesten skal du registrere en konto. Ved registrering accepterer du at:",
        creationItems: [
          "Give nøjagtige, aktuelle og fuldstændige oplysninger",
          "Vedligeholde og hurtigt opdatere dine kontooplysninger",
          "Opretholde sikkerheden og fortroligheden af dine loginoplysninger",
          "Acceptere ansvar for alle aktiviteter under din konto",
          "Underrette os straks om enhver uautoriseret brug af din konto",
        ],
        accountTypesTitle: "2.2 Kontotyper",
        accountTypes: [
          { name: "Besøgende", description: "Gennemse opslag, gemme favoritter og kontakte ejere" },
          { name: "Ejer", description: "Oprette og administrere virksomhedsopslag" },
          { name: "Redaktør", description: "Administrere indhold og moderere opslag" },
          { name: "Admin", description: "Fuld administrativ adgang til platformen" },
        ],
        ageTitle: "2.3 Alderskrav",
        ageBody:
          "Du skal være mindst 18 år for at oprette en konto og bruge Tjenesten. Ved at oprette en konto erklærer og garanterer du, at du er mindst 18 år.",
      },
      acceptableUse: {
        title: "3. Acceptabel brug",
        body: "Når du bruger Tjenesten, accepterer du at:",
        items: [
          "Overholde alle gældende love og regler",
          "Respektere andres immaterielle rettigheder",
          "Give nøjagtige og sandfærdige oplysninger i opslag",
          "Kommunikere respektfuldt med andre brugere",
          "Kun bruge Tjenesten til dens tilsigtede formål",
        ],
      },
      prohibited: {
        title: "4. Forbudte aktiviteter",
        body: "Du må ikke bruge Tjenesten til at:",
        items: [
          "Offentliggøre falsk, vildledende eller svigagtigt indhold",
          "Udgive dig for at være en anden person eller enhed",
          "Chikanere, misbruge eller true andre brugere",
          "Uploade skadelig kode, vira eller skadeligt indhold",
          "Skrabe, crawle eller indsamle data uden tilladelse",
          "Omgå sikkerhedsforanstaltninger eller adgangsbegrænsninger",
          "Bruge automatiserede systemer til at tilgå Tjenesten uden tilladelse",
          "Fremme ulovlige aktiviteter eller tjenester",
          "Krænke immaterielle rettigheder",
          "Sende spam eller uopfordrede kommercielle beskeder",
          "Manipulere vurderinger, anmeldelser eller engagementsmålinger",
        ],
      },
      listings: {
        title: "5. Retningslinjer for opslag (for Ejere)",
        contentTitle: "5.1 Indholdskrav",
        contentItems: [
          "Alle oplysninger i opslag skal være nøjagtige og opdaterede",
          "Billeder skal være autentiske gengivelser af din virksomhed",
          "Kontaktoplysninger skal være gyldige og fungere",
          "Prisoplysninger (hvis vist) skal afspejle faktiske priser",
        ],
        reviewTitle: "5.2 Gennemgangsproces",
        reviewBody:
          "Alle opslag er underlagt gennemgang før offentliggørelse. Vi forbeholder os retten til at:",
        reviewItems: [
          "Godkende, afvise eller anmode om ændringer af opslag",
          "Fjerne opslag, der overtræder vores retningslinjer",
          "Suspendere eller afslutte konti ved gentagne overtrædelser",
        ],
        tiersTitle: "5.3 Opslagsniveauer",
        tiers: [
          { name: "Ikke verificeret", description: "Gratis basisopslag (uden verificeringsmærke)" },
          { name: "Verificeret", description: "Betalt niveau med verificeret virksomhedsmærke" },
          { name: "Signature", description: "Premiumniveau med signature-mærke og VIP-placering" },
        ],
      },
      payments: {
        title: "6. Betalinger og abonnementer",
        paidTitle: "6.1 Betalte tjenester",
        paidBody:
          "Visse funktioner og opslagsniveauer kræver betaling. Ved køb af betalte tjenester accepterer du at:",
        paidItems: [
          "Betale alle gældende gebyrer og omkostninger",
          "Give nøjagtige faktureringsoplysninger",
          "Godkende tilbagevendende opkrævninger for abonnementer",
        ],
        refundTitle: "6.2 Refusionspolitik",
        refundBody: "Refusioner kan gives efter vores skøn. Generelt:",
        refundItems: [
          "Abonnementsgebyrer refunderes ikke efter de første 14 dage",
          "Forholdsmæssige refusioner kan være tilgængelige for årsplaner",
          "Refusioner gives ikke ved overtrædelse af politikker",
        ],
        priceTitle: "6.3 Prisændringer",
        priceBody:
          "Vi forbeholder os retten til at ændre priser med 30 dages varsel. Eksisterende abonnementer respekteres indtil udgangen af den aktuelle faktureringsperiode.",
      },
      intellectualProperty: {
        title: "7. Immaterielle rettigheder",
        ourContentTitle: "7.1 Vores indhold",
        ourContentBody:
          "Tjenesten og dens oprindelige indhold (eksklusive brugerindsendt indhold), funktioner og funktionalitet ejes af AlgarveOfficial og er beskyttet af internationale love om ophavsret, varemærker, patenter, forretningshemmeligheder og andre immaterielle rettigheder.",
        userContentTitle: "7.2 Brugerindhold",
        userContentBody:
          "Du bevarer ejerskabet til det indhold, du indsender. Ved at offentliggøre indhold giver du os en ikke-eksklusiv, verdensomspændende, royaltyfri licens til at bruge, vise, reproducere og distribuere dit indhold i forbindelse med Tjenesten.",
        dmcaTitle: "7.3 DMCA-overholdelse",
        dmcaPrefix: "Hvis du mener, at dit ophavsretligt beskyttede værk er blevet krænket, bedes du kontakte os på",
        dmcaSuffix: "med de krævede oplysninger til DMCA-meddelelsen.",
      },
      disclaimers: {
        title: "8. Ansvarsfraskrivelser og begrænsninger",
        availabilityTitle: "8.1 Tjenestens tilgængelighed",
        availabilityBody:
          "Tjenesten leveres \"som den er\" og \"som tilgængelig\" uden garantier af nogen art. Vi garanterer ikke uafbrudt, sikker eller fejlfri drift.",
        thirdPartyTitle: "8.2 Tredjepartsindhold",
        thirdPartyBody:
          "Vi er ikke ansvarlige for nøjagtigheden, kvaliteten eller lovligheden af opslag eller indhold indsendt af Ejere. Brugere interagerer med virksomheder på egen risiko.",
        liabilityTitle: "8.3 Ansvarsbegrænsning",
        liabilityBody:
          "I DET OMFANG LOVEN TILLADER DET, ER ALGARVEOFFICIAL IKKE ANSVARLIG FOR INDIREKTE, HÆNDELIGE, SÆRLIGE, FØLGESKADER ELLER STRAFBARE SKADER, HERUNDER TAB AF FORTJENESTE, DATA ELLER FORRETNINGSMULIGHEDER, DER OPSTÅR SOM FØLGE AF DIN BRUG AF TJENESTEN.",
        indemnificationTitle: "8.4 Skadesløsholdelse",
        indemnificationBody:
          "Du accepterer at holde AlgarveOfficial skadesløs for alle krav, skader eller udgifter, der opstår som følge af din brug af Tjenesten eller overtrædelse af disse Vilkår.",
      },
      termination: {
        title: "9. Opsigelse",
        body: "Vi kan suspendere eller afslutte din konto, hvis du:",
        items: [
          "Overtræder disse Servicevilkår",
          "Deltager i forbudte aktiviteter",
          "Giver falske eller vildledende oplysninger",
          "Undlader at betale for tjenester, når betaling forfalder",
        ],
        afterBody:
          "Du kan afslutte din konto når som helst ved at kontakte os. Ved afslutning ophører din ret til at bruge Tjenesten straks.",
      },
      governingLaw: {
        title: "10. Gældende lov",
        body:
          "Disse Vilkår er underlagt og fortolkes i overensstemmelse med Portugals love, uden hensyn til lovvalgsregler. Eventuelle tvister, der opstår som følge af disse Vilkår eller din brug af Tjenesten, skal afgøres ved domstolene i Faro, Portugal.",
        odrText:
          "For EU-forbrugere: du kan også have ret til at bruge Europa-Kommissionens platform for onlinetvistbilæggelse på",
      },
      changes: {
        title: "11. Ændringer af Vilkårene",
        body:
          "Vi forbeholder os retten til at ændre disse Vilkår når som helst. Vi vil underrette dig om væsentlige ændringer ved at offentliggøre de opdaterede Vilkår og opdatere datoen for \"Sidst opdateret\". Din fortsatte brug af Tjenesten efter ændringer udgør accept af de nye Vilkår.",
      },
      contact: {
        title: "12. Kontakt os",
        body: "Hvis du har spørgsmål om disse Vilkår, bedes du kontakte os:",
        address: "Algarve, Faro-distriktet, Portugal",
      },
    },
  },
} satisfies Partial<Record<AppLocale, TermsCopy>>;

const TERMS_COPY = {
  ...COPY,
  ...LOCALIZED_COPY,
  ...MORE_COPY,
} satisfies Record<AppLocale, TermsCopy>;

export const TERMS_CONTENT: Record<AppLocale, TermsContent> = {
  en: buildTermsContent(TERMS_COPY.en),
  "pt-pt": buildTermsContent(TERMS_COPY["pt-pt"]),
  fr: buildTermsContent(TERMS_COPY.fr),
  de: buildTermsContent(TERMS_COPY.de),
  es: buildTermsContent(TERMS_COPY.es),
  it: buildTermsContent(TERMS_COPY.it),
  nl: buildTermsContent(TERMS_COPY.nl),
  sv: buildTermsContent(TERMS_COPY.sv),
  no: buildTermsContent(TERMS_COPY.no),
  da: buildTermsContent(TERMS_COPY.da),
};

export function resolveTermsLocale(locale?: string | null): AppLocale {
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

export function getTermsContent(locale?: string | null): TermsContent {
  return TERMS_CONTENT[resolveTermsLocale(locale)];
}
