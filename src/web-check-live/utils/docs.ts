export interface Doc {
  id: string;
  title: string;
  description: string;
  use: string;
  resources: string[] | { title: string, link: string}[];
  screenshot?: string;
}

const docs: Doc[] = [
  {
    id: "get-ip",
    title: "Informations IP",
    description:
      "Une adresse IP (Internet Protocol) est un identifiant numérique assigné à chaque appareil connecté à un réseau ou à Internet. L'adresse IP associée à un domaine peut être trouvée en interrogeant le système de noms de domaine (DNS) pour l'enregistrement A (adresse) du domaine.",
    use: "Trouver l'adresse IP d'un serveur est la première étape pour mener des investigations approfondies, car cela permet d'interroger le serveur pour obtenir des informations supplémentaires. Cela inclut la création d'une carte détaillée de l'infrastructure réseau, la localisation physique du serveur, l'identification du service d'hébergement, et même la découverte d'autres domaines hébergés sur la même adresse IP.",
    resources: [
      { title: 'Comprendre les adresses IP', link: 'https://www.digitalocean.com/community/tutorials/understanding-ip-addresses-subnets-and-cidr-notation-for-networking'},
      { title: 'Adresses IP - Wiki', link: 'https://fr.wikipedia.org/wiki/Adresse_IP'},
      { title: 'RFC-791 Internet Protocol', link: 'https://tools.ietf.org/html/rfc791'},
      { title: 'whatismyipaddress.com', link: 'https://whatismyipaddress.com/'},
    ],
  },
  {
    id: "ssl",
    title: "Chaîne SSL",
    description:
    "Les certificats SSL sont des certificats numériques qui authentifient l'identité d'un site web ou d'un serveur, permettent une communication chiffrée sécurisée (HTTPS) et établissent la confiance entre clients et serveurs. Un certificat SSL valide est requis pour qu'un site web puisse utiliser le protocole HTTPS et chiffrer les données utilisateur et du site en transit. Les certificats SSL sont émis par des Autorités de Certification (CA), des tiers de confiance qui vérifient l'identité et la légitimité du détenteur du certificat.",  
    use: "Les certificats SSL fournissent non seulement l'assurance que la transmission de données vers et depuis le site web est sécurisée, mais ils offrent également des données précieuses. Les informations d'un certificat SSL peuvent inclure l'autorité émettrice, le nom de domaine, sa période de validité, et parfois même des détails organisationnels. Ceci est utile pour vérifier l'authenticité d'un site web, comprendre sa configuration de sécurité, ou même découvrir des sous-domaines ou autres services associés.",
    resources: [
      { title: 'TLS - Wiki', link: 'https://fr.wikipedia.org/wiki/Transport_Layer_Security'},
      { title: 'Qu\'est-ce que SSL (Cloudflare)', link: 'https://www.cloudflare.com/fr-fr/learning/ssl/what-is-ssl/'},
      { title: 'RFC-8446 - TLS', link: 'https://tools.ietf.org/html/rfc8446'},
      { title: 'SSL Checker', link: 'https://www.sslshopper.com/ssl-checker.html'},
    ],
    screenshot: 'https://i.ibb.co/kB7LsV1/wc-ssl.png',
  },
  {
    id: "dns",
    title: "Enregistrements DNS",
    description:
      "Cette tâche consiste à consulter les enregistrements DNS associés à un domaine spécifique. Le DNS est un système qui traduit les noms de domaine lisibles par l'homme en adresses IP que les ordinateurs utilisent pour communiquer. Différents types d'enregistrements DNS existent, notamment A (adresse), MX (échange de courrier), NS (serveur de noms), CNAME (nom canonique) et TXT (texte), entre autres.",
    use: "L'extraction des enregistrements DNS peut fournir une mine d'informations dans une investigation. Par exemple, les enregistrements A et AAAA peuvent révéler les adresses IP associées à un domaine, dévoilant potentiellement l'emplacement des serveurs. Les enregistrements MX peuvent donner des indices sur le fournisseur de messagerie d'un domaine. Les enregistrements TXT sont souvent utilisés à des fins administratives et peuvent parfois divulguer par inadvertance des informations internes. Comprendre la configuration DNS d'un domaine aide à comprendre comment son infrastructure en ligne est construite et gérée.",
    resources: [
      { title: 'Qu\'est-ce que les enregistrements DNS? (Cloudflare)', link: 'https://www.cloudflare.com/fr-fr/learning/dns/dns-records/'},
      { title: 'Types d\'enregistrements DNS', link: 'https://fr.wikipedia.org/wiki/Enregistrement_DNS'},
      { title: 'RFC-1035 - DNS', link: 'https://tools.ietf.org/html/rfc1035'},
      { title: 'DNS Lookup (MxToolbox)', link: 'https://mxtoolbox.com/DNSLookup.aspx'},
    ],
    screenshot: 'https://i.ibb.co/7Q1kMwM/wc-dns.png',
  },
  {
    id: "cookies",
    title: "Évaluation de Conformité des Cookies",
    description:
      "L'évaluation de conformité des cookies effectue une analyse complète des cookies HTTP définis par le site web cible, évaluant les attributs de sécurité, catégorisant les types de cookies et évaluant la conformité avec les réglementations sur la confidentialité. Cette évaluation examine à la fois les cookies définis par le serveur (en-têtes HTTP) et les cookies côté client (JavaScript), fournissant un scoring de sécurité détaillé et des insights de conformité réglementaire.",
    use: "Cette évaluation est cruciale pour les responsables de la conformité et les auditeurs de sécurité afin d'évaluer l'implémentation des cookies par rapport aux meilleures pratiques de sécurité et aux réglementations de confidentialité comme le RGPD, CCPA et la directive ePrivacy. Elle identifie les vulnérabilités de sécurité (risques XSS, CSRF), catégorise les cookies par objectif (session, tracking, publicité, fonctionnel) et fournit des recommandations actionnables pour améliorer la sécurité des cookies et la conformité réglementaire. L'évaluation aide les organisations à comprendre leur paysage de cookies et à implémenter des mécanismes de consentement appropriés.",
    resources: [
      { title: 'Guide Sécurité Cookies OWASP', link: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/06-Session_Management_Testing/02-Testing_for_Cookies_Attributes' },
      { title: 'Conformité Cookies RGPD', link: 'https://www.cnil.fr/fr/cookies-et-autres-traceurs' },
      { title: 'Sécurité Cookies HTTP (Mozilla)', link: 'https://developer.mozilla.org/fr/docs/Web/HTTP/Cookies' },
      { title: 'Attribut SameSite des Cookies', link: 'https://web.dev/samesite-cookies-explained/' },
      { title: 'Exigences RGPD Cookies', link: 'https://gdpr.eu/cookies/' },
      { title: 'RFC-6265 - HTTP Cookies', link: 'https://tools.ietf.org/html/rfc6265' },
    ],
    screenshot: 'https://i.ibb.co/TTQ6DtP/wc-cookies.png',
  },
  {
    id: "robots-txt",
    title: "Règles de Crawl",
    description:
      "Le fichier robots.txt se trouve (généralement) à la racine d'un domaine et est utilisé pour implémenter le protocole d'exclusion des robots (REP) afin d'indiquer quelles pages doivent être ignorées par quels crawlers et bots. C'est une bonne pratique pour éviter que les crawlers des moteurs de recherche ne surchargent votre site, mais ne doit pas être utilisé pour exclure des pages des résultats de recherche (utilisez plutôt la balise ou l'en-tête meta noindex).",
    use: "Il est souvent utile de vérifier le fichier robots.txt lors d'une investigation, car il peut parfois révéler les répertoires et pages que le propriétaire du site ne souhaite pas voir indexer, potentiellement parce qu'ils contiennent des informations sensibles, ou révéler l'existence de répertoires autrement cachés ou non liés. De plus, comprendre les règles de crawl peut offrir des insights sur les stratégies SEO d'un site web.",
    resources: [
      { title: 'Google Search Docs - Robots.txt', link: 'https://developers.google.com/search/docs/advanced/robots/intro?hl=fr' },
      { title: 'En savoir plus sur robots.txt (Moz.com)', link: 'https://moz.com/learn/seo/robotstxt' },
      { title: 'RFC-9309 - Protocole d\'exclusion des robots', link: 'https://datatracker.ietf.org/doc/rfc9309/' },
      { title: 'Robots.txt - wiki', link: 'https://fr.wikipedia.org/wiki/Protocole_d%27exclusion_des_robots' },
    ],
    screenshot: 'https://i.ibb.co/KwQCjPf/wc-robots.png',
  },
  {
    id: "headers",
    title: "En-têtes HTTP",
    description:
      "La tâche En-têtes HTTP consiste à extraire et interpréter les en-têtes HTTP envoyés par le site web cible lors du cycle requête-réponse. Les en-têtes HTTP sont des paires clé-valeur envoyées au début d'une réponse HTTP, ou avant les données réelles. Les en-têtes contiennent des directives importantes sur la façon de gérer les données transférées, notamment les politiques de cache, les types de contenu, l'encodage, les informations sur le serveur, les politiques de sécurité, et plus encore.",
    use: "L'analyse des en-têtes HTTP peut fournir des insights significatifs dans une investigation. Les en-têtes peuvent révéler des configurations serveur spécifiques, les technologies choisies, les directives de mise en cache et divers paramètres de sécurité. Ces informations peuvent aider à déterminer la pile technologique sous-jacente d'un site web, les mesures de sécurité côté serveur, les vulnérabilités potentielles et les pratiques opérationnelles générales.",
    resources: [
      { title: 'En-têtes HTTP - Docs', link: 'https://developer.mozilla.org/fr/docs/Web/HTTP/Headers' },
      { title: 'RFC-7231 Section 7 - En-têtes', link: 'https://datatracker.ietf.org/doc/html/rfc7231#section-7' },
      { title: 'Liste des champs d\'en-tête de réponse', link: 'https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP' },
      { title: 'Projet OWASP Secure Headers', link: 'https://owasp.org/www-project-secure-headers/' },
    ],
    screenshot: 'https://i.ibb.co/t3xcwP1/wc-headers.png',
  },
  {
    id: "quality",
    title: "Métriques de Qualité",
    description:
      "En utilisant Lighthouse, la tâche Métriques de Qualité mesure la performance, l'accessibilité, les meilleures pratiques et le SEO du site web cible. Cela retourne une simple checklist de 100 métriques essentielles, avec un score pour chaque catégorie, afin d'évaluer la qualité globale d'un site donné.",
    use: "Utile pour évaluer la santé technique d'un site, identifier les problèmes SEO, les vulnérabilités, et assurer la conformité aux standards.",
    resources: [
      { title: 'Documentation Lighthouse', link: 'https://developer.chrome.com/docs/lighthouse/?hl=fr' },
      { title: 'Google Page Speed Tools', link: 'https://developers.google.com/speed' },
      { title: 'W3 Accessibility Tools', link: 'https://www.w3.org/WAI/test-evaluate/' },
      { title: 'Google Search Console', link: 'https://search.google.com/search-console' },
      { title: 'SEO Checker', link: 'https://www.seobility.net/en/seocheck/' },
      { title: 'PWA Builder', link: 'https://www.pwabuilder.com/' },
    ],
    screenshot: 'https://i.ibb.co/Kqg8rx7/wc-quality.png',
  },
  {
    id: "location",
    title: "Localisation du Serveur",
    description:
      "La tâche Localisation du Serveur détermine l'emplacement physique du serveur hébergeant un site web donné en se basant sur son adresse IP. Cela se fait en consultant l'IP dans une base de données de localisation, qui mappe l'IP à une latitude et longitude de centres de données et FAI connus. À partir de la latitude et longitude, il est alors possible d'afficher des informations contextuelles supplémentaires, comme un repère sur la carte, avec adresse, drapeau, fuseau horaire, devise, etc.",
    use: "Connaître la localisation du serveur est une bonne première étape pour mieux comprendre un site web. Pour les propriétaires de sites, cela aide à optimiser la livraison de contenu, assurer la conformité avec les exigences de résidence des données, et identifier les problèmes de latence potentiels pouvant impacter l'expérience utilisateur dans des régions géographiques spécifiques. Pour les chercheurs en sécurité, cela permet d'évaluer le risque posé par des régions ou juridictions spécifiques concernant les cybermenaces et réglementations.",
    resources: [
      { title: 'Localisateur IP', link: 'https://geobytes.com/iplocator/' },
      { title: 'Géolocalisation Internet - Wiki', link: 'https://fr.wikipedia.org/wiki/G%C3%A9olocalisation_Internet' },
    ],
    screenshot: 'https://i.ibb.co/cXH2hfR/wc-location.png',
  },
  {
    id: "hosts",
    title: "Hôtes Associés",
    description:
      "Cette tâche consiste à identifier et lister tous les domaines et sous-domaines (noms d'hôte) associés au domaine principal du site web. Ce processus implique souvent l'énumération DNS pour découvrir tous les domaines et noms d'hôtes liés, ainsi que l'examen des enregistrements DNS connus.",
    use: "Lors d'une investigation, comprendre l'étendue complète de la présence web d'une cible est critique. Les domaines associés peuvent conduire à découvrir des projets liés, des sites de sauvegarde, des sites de développement/test, ou des services liés au site principal. Ceux-ci peuvent parfois fournir des informations supplémentaires ou des vulnérabilités de sécurité potentielles. Une liste complète des domaines et noms d'hôtes associés peut également donner un aperçu de la structure de l'organisation et de son empreinte en ligne.",
    resources: [
      { title: 'Énumération DNS - Wiki', link: 'https://fr.wikipedia.org/wiki/%C3%89num%C3%A9ration_DNS' },
      { title: 'OWASP - Énumérer les applications sur serveur web', link: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/04-Enumerate_Applications_on_Webserver' },
      { title: 'Énumération DNS - DNS Dumpster', link: 'https://dnsdumpster.com/' },
      { title: 'Subdomain Finder', link: 'https://subdomainfinder.c99.nl/' },
    ],
    screenshot: 'https://i.ibb.co/25j1sT7/wc-hosts.png',
  },
  {
    id: "redirects",
    title: "Chaîne de Redirection",
    description:
      "Cette tâche trace la séquence des redirections HTTP qui se produisent de l'URL d'origine jusqu'à l'URL de destination finale. Une redirection HTTP est une réponse avec un code de statut qui conseille au client d'aller à une autre URL. Les redirections peuvent se produire pour plusieurs raisons, telles que la normalisation d'URL (redirection vers la version www du site), l'application de HTTPS, les raccourcisseurs d'URL, ou la redirection des utilisateurs vers un nouvel emplacement de site.",
    use: "Comprendre la chaîne de redirection peut être utile pour plusieurs raisons. Du point de vue de la sécurité, des chaînes de redirection longues ou compliquées peuvent être un signe de risques de sécurité potentiels, comme des redirections non chiffrées dans la chaîne. De plus, les redirections peuvent impacter les performances du site web et le SEO, car chaque redirection introduit un temps d'aller-retour (RTT) supplémentaire. Pour l'OSINT, comprendre la chaîne de redirection peut aider à identifier les relations entre différents domaines ou révéler l'utilisation de certaines technologies ou fournisseurs d'hébergement.",
    resources: [
      { title: 'Redirections HTTP - MDN', link: 'https://developer.mozilla.org/fr/docs/Web/HTTP/Redirections' },
      { title: 'Redirection d\'URL - Wiki', link: 'https://fr.wikipedia.org/wiki/Redirection_d%27URL' },
      { title: 'Redirections 301 expliquées', link: 'https://ahrefs.com/blog/301-redirects/' },
    ],
    screenshot: 'https://i.ibb.co/hVVrmwh/wc-redirects.png',
  },
  {
    id: "txt-records",
    title: "Enregistrements TXT",
    description:
      "Les enregistrements TXT sont un type d'enregistrement DNS qui fournit des informations textuelles aux sources externes à votre domaine. Ils peuvent être utilisés à diverses fins, telles que la vérification de la propriété du domaine, la sécurisation des emails, et même la prévention de modifications non autorisées de votre site web.",
    use: "Les enregistrements TXT révèlent souvent quels services et technologies externes sont utilisés avec un domaine donné. Ils peuvent révéler des détails sur la configuration email du domaine, l'utilisation de services spécifiques comme Google Workspace ou Microsoft 365, ou des mesures de sécurité en place telles que SPF et DKIM. Comprendre ces détails peut donner un aperçu des technologies utilisées par l'organisation, de leurs pratiques de sécurité email, et des vulnérabilités potentielles.",
    resources: [
      { title: 'Enregistrements TXT (Cloudflare)', link: 'https://www.cloudflare.com/fr-fr/learning/dns/dns-records/dns-txt-record/' },
      { title: 'Enregistrements TXT - Wiki', link: 'https://fr.wikipedia.org/wiki/Enregistrement_DNS' },
      { title: 'RFC-1464 - Enregistrements TXT', link: 'https://datatracker.ietf.org/doc/html/rfc1464' },
      { title: 'TXT Record Lookup (MxToolbox)', link: 'https://mxtoolbox.com/TXTLookup.aspx' },
    ],
    screenshot: 'https://i.ibb.co/wyt21QN/wc-txt-records.png',
  },
  {
    id: "status",
    title: "Statut du Serveur",
    description: "Vérifie si un serveur est en ligne et répond aux requêtes.",
    use: "Permet de vérifier rapidement la disponibilité d'un serveur et d'identifier les temps d'arrêt potentiels.",
    resources: [
    ],
    screenshot: 'https://i.ibb.co/V9CNLBK/wc-status.png',
  },
  {
    id: "ports",
    title: "Ports Ouverts",
    description:
      "Les ports ouverts sur un serveur sont des points de terminaison de communication disponibles pour établir des connexions avec des clients. Chaque port correspond à un service ou protocole spécifique, tel que HTTP (port 80), HTTPS (port 443), FTP (port 21), etc. Les ports ouverts sur un serveur peuvent être déterminés en utilisant des techniques telles que le scan de ports.",
    use: "Savoir quels ports sont ouverts sur un serveur peut fournir des informations sur les services fonctionnant sur ce serveur, utile pour comprendre les vulnérabilités potentielles du système, ou pour comprendre la nature des services que le serveur fournit.",
    resources: [
      { title: 'Liste des numéros de ports TCP & UDP', link: 'https://fr.wikipedia.org/wiki/Liste_de_ports_logiciels' },
      { title: 'NMAP - Bases du scan de ports', link: 'https://nmap.org/book/man-port-scanning-basics.html' },
    ],
    screenshot: 'https://i.ibb.co/F8D1hmf/wc-ports.png',
  },
  {
    id: "trace-route",
    title: "Traceroute",
    description:
      "Traceroute est un outil de diagnostic réseau utilisé pour suivre en temps réel le chemin emprunté par un paquet d'informations d'un système à un autre. Il enregistre chaque saut le long de la route, fournissant des détails sur les adresses IP des routeurs et le délai à chaque point.",
    use: "Dans les investigations OSINT, traceroute peut fournir des insights sur les chemins de routage et la géographie de l'infrastructure réseau supportant un site web ou service. Cela peut aider à identifier les goulets d'étranglement réseau, la censure potentielle ou la manipulation du trafic réseau, et donner un aperçu global de la structure et l'efficacité du réseau. De plus, les adresses IP collectées lors du traceroute peuvent fournir des points d'enquête supplémentaires.",
    resources: [
      "https://www.cloudflare.com/fr-fr/learning/network-layer/what-is-traceroute/",
      "https://tools.ietf.org/html/rfc1393",
      "https://fr.wikipedia.org/wiki/Traceroute",
      "https://www.ripe.net/publications/docs/ripe-611",
    ],
    screenshot: 'https://i.ibb.co/M59qgxP/wc-trace-route.png',
  },
  {
    id: "carbon",
    title: "Empreinte Carbone",
    description:
      "Cette tâche calcule l'empreinte carbone estimée d'un site web. Elle est basée sur la quantité de données transférées et traitées, et l'utilisation d'énergie des serveurs qui hébergent et livrent le site web. Plus le site web est volumineux et ses fonctionnalités complexes, plus son empreinte carbone sera probablement élevée.",
    use: "D'un point de vue OSINT, comprendre l'empreinte carbone d'un site web ne fournit pas directement d'insights sur son fonctionnement interne ou l'organisation derrière. Cependant, cela peut être une donnée précieuse dans des analyses plus larges, en particulier dans des contextes où l'impact environnemental est une considération. Par exemple, cela peut être utile pour les activistes, chercheurs, ou hackers éthiques intéressés par la durabilité de l'infrastructure numérique, et qui veulent tenir les organisations responsables de leur impact environnemental.",
    resources: [
      { title: 'WebsiteCarbon - Calculateur Carbone', link: 'https://www.websitecarbon.com/' },
      { title: 'The Green Web Foundation', link: 'https://www.thegreenwebfoundation.org/' },
      { title: 'The Eco Friendly Web Alliance', link: 'https://ecofriendlyweb.org/' },
      { title: 'Reset.org', link: 'https://en.reset.org/' },
      { title: 'Votre site web tue la planète - Wired', link: 'https://www.wired.co.uk/article/internet-carbon-footprint' },
    ],
    screenshot: 'https://i.ibb.co/5v6fSyw/Screenshot-from-2023-07-29-19-07-50.png',
  },
  {
    id: "server-info",
    title: "Informations Serveur",
    description:
      "Cette tâche récupère diverses informations sur le serveur hébergeant le site web cible. Cela peut inclure le type de serveur (ex: Apache, Nginx), le fournisseur d'hébergement, le numéro de système autonome (ASN), et plus encore. Les informations sont généralement obtenues via une combinaison de recherches d'adresses IP et d'analyse des en-têtes de réponse HTTP.",
    use: "Dans un contexte OSINT, les informations sur le serveur peuvent fournir des indices précieux sur l'organisation derrière un site web. Par exemple, le choix du fournisseur d'hébergement pourrait suggérer la région géographique dans laquelle l'organisation opère, tandis que le type de serveur pourrait indiquer les technologies utilisées par l'organisation. L'ASN pourrait également être utilisé pour trouver d'autres domaines hébergés par la même organisation.",
    resources: [
      "https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP",
      "https://fr.wikipedia.org/wiki/Autonomous_System",
      "https://tools.ietf.org/html/rfc7231#section-7.4.2",
      "https://builtwith.com/",
    ],
    screenshot: 'https://i.ibb.co/Mk1jx32/wc-server.png',
  },
  {
    id: "domain",
    title: "Recherche Whois",
    description:
      "Cette tâche récupère les enregistrements Whois pour le domaine cible. Les enregistrements Whois sont une source riche d'informations, incluant le nom et les informations de contact du titulaire du domaine, les dates de création et d'expiration du domaine, les serveurs de noms du domaine, et plus encore. Les informations sont généralement obtenues via une requête à un serveur de base de données Whois.",
    use: "Dans un contexte OSINT, les enregistrements Whois peuvent fournir des indices précieux sur l'entité derrière un site web. Ils peuvent montrer quand le domaine a été enregistré pour la première fois et quand il doit expirer, ce qui pourrait fournir des insights sur la chronologie opérationnelle de l'entité. Les informations de contact, bien que souvent expurgées ou anonymisées, peuvent parfois conduire à des pistes d'investigation supplémentaires. Les serveurs de noms pourraient également être utilisés pour lier ensemble plusieurs domaines détenus par la même entité.",
    resources: [
      "https://en.wikipedia.org/wiki/WHOIS",
      "https://www.icann.org/resources/pages/whois-2018-01-17-en",
      "https://whois.domaintools.com/",
    ],
    screenshot: 'https://i.ibb.co/89WLp14/wc-domain.png',
  },
  {
    id: "whois",
    title: "Domain Info",
    description:
      "This task retrieves Whois records for the target domain. Whois records are a rich source of information, including the name and contact information of the domain registrant, the domain's creation and expiration dates, the domain's nameservers, and more. The information is usually obtained through a query to a Whois database server.",
    use: "In an OSINT context, Whois records can provide valuable clues about the entity behind a website. They can show when the domain was first registered and when it's set to expire, which could provide insights into the operational timeline of the entity. The contact information, though often redacted or anonymized, can sometimes lead to additional avenues of investigation. The nameservers could also be used to link together multiple domains owned by the same entity.",
    resources: [
      "https://en.wikipedia.org/wiki/WHOIS",
      "https://www.icann.org/resources/pages/whois-2018-01-17-en",
      "https://whois.domaintools.com/",
    ],
    screenshot: 'https://i.ibb.co/89WLp14/wc-domain.png',
  },
  {
    id: "dnssec",
    title: "Extensions de Sécurité DNS",
    description:
      "Sans DNSSEC, il est possible pour les attaquants MITM d'usurper des enregistrements et de rediriger les utilisateurs vers des sites de phishing. C'est parce que le système DNS n'inclut aucune méthode intégrée pour vérifier que la réponse à la requête n'a pas été falsifiée, ou qu'aucune autre partie du processus n'a été interrompue par un attaquant. Les extensions de sécurité DNS (DNSSEC) sécurisent les recherches DNS en signant vos enregistrements DNS avec des clés publiques, afin que les navigateurs puissent détecter si la réponse a été altérée. D'autres solutions à ce problème sont DoH (DNS over HTTPS) et DoT (DNS over TLS).",
    use: "Les informations DNSSEC fournissent un aperçu du niveau de maturité en cybersécurité d'une organisation et des vulnérabilités potentielles, particulièrement concernant l'usurpation DNS et l'empoisonnement de cache. Si aucune sécurité DNS (DNSSEC, DoH, DoT, etc.) n'est implémentée, cela peut fournir un point d'entrée pour un attaquant.",
    resources: [
      "https://dnssec-analyzer.verisignlabs.com/",
      "https://www.cloudflare.com/fr-fr/dns/dnssec/how-dnssec-works/",
      "https://fr.wikipedia.org/wiki/Domain_Name_System_Security_Extensions",
      "https://www.icann.org/resources/pages/dnssec-what-is-it-why-important-2019-03-05-en",
      "https://support.google.com/domains/answer/6147083?hl=fr",
      "https://www.internetsociety.org/resources/deploy360/2013/dnssec-test-sites/",
    ],
    screenshot: 'https://i.ibb.co/J54zVmQ/wc-dnssec.png',
  },
  {
    id: "features",
    title: "Fonctionnalités du Site",
    description: 'Vérifie quelles fonctionnalités principales sont présentes sur un site. Si une fonctionnalité est marquée comme morte, cela signifie qu\'elle n\'est pas activement utilisée au moment du chargement',
    use: "Ceci est utile pour comprendre les capacités d'un site et quelles technologies rechercher",
    resources: [],
    screenshot: 'https://i.ibb.co/gP4P6kp/wc-features.png',
  },
  {
    id: "hsts",
    title: "HTTP Strict Transport Security",
    description: 'HTTP Strict Transport Security (HSTS) est un mécanisme de politique de sécurité web '
    +'qui aide à protéger les sites web contre les attaques de rétrogradation de protocole et '
    + 'le détournement de cookies. Un site web peut être inclus dans la liste de préchargement HSTS en '
    + 'se conformant à un ensemble d\'exigences puis en se soumettant à la liste.',
    use: `Il existe plusieurs raisons pour lesquelles il est important qu'un site soit activé HSTS:
  1. L'utilisateur met en signet ou tape manuellement http://exemple.com et est sujet à une attaque MITM
    HSTS redirige automatiquement les requêtes HTTP vers HTTPS pour le domaine cible
  2. Une application web destinée à être purement HTTPS contient par inadvertance des liens HTTP ou sert du contenu via HTTP
    HSTS redirige automatiquement les requêtes HTTP vers HTTPS pour le domaine cible
  3. Un attaquant MITM tente d'intercepter le trafic d'un utilisateur victime en utilisant un certificat invalide et espère que l'utilisateur acceptera le mauvais certificat
    HSTS ne permet pas à un utilisateur de contourner le message de certificat invalide
    `,
    resources: [
      'https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/Strict-Transport-Security',
      'https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html',
      'https://hstspreload.org/'
    ],
    screenshot: 'https://i.ibb.co/k253fq4/Screenshot-from-2023-07-17-20-10-52.png',
  },
  {
    id: 'dns-server',
    title: 'Serveur DNS',
    description: 'Cette vérification détermine le(s) serveur(s) DNS auquel l\'URL / IP demandée se résout. Lance également une vérification rudimentaire pour voir si le serveur DNS supporte DoH, et s\'il est vulnérable à l\'empoisonnement du cache DNS.',
    use: 'Permet d\'identifier les serveurs DNS utilisés et d\'évaluer leur sécurité.',
    resources: [],
    screenshot: 'https://i.ibb.co/tKpL8F9/Screenshot-from-2023-08-12-15-43-12.png',
  },
  {
    id: 'tech-stack',
    title: 'Stack Technique',
    description: 'Vérifie avec quelles technologies un site est construit. '
    + 'Ceci est fait en récupérant et en analysant le site, puis en le comparant à une liste de RegEx maintenue par Wappalyzer pour identifier les empreintes uniques que différentes technologies laissent.',
    use: 'Identifier la stack technique d\'un site aide à évaluer sa sécurité en exposant les vulnérabilités potentielles, '
    + 'informe les analyses concurrentielles et les décisions de développement, et peut guider des stratégies marketing ciblées. '
    + 'L\'application éthique de cette connaissance est cruciale pour éviter les activités nuisibles comme le vol de données ou l\'intrusion non autorisée.',
    resources: [
      { title: 'Empreintes Wappalyzer', link: 'https://github.com/wappalyzer/wappalyzer/tree/master/src/technologies'},
      { title: 'BuiltWith - Vérifier les technologies d\'un site', link: 'https://builtwith.com/'},
    ],
    screenshot: 'https://i.ibb.co/bBQSQNz/Screenshot-from-2023-08-12-15-43-46.png',
  },
  {
    id: 'sitemap',
    title: 'Pages Listées',
    description: 'Ce job trouve et analyse le sitemap listé d\'un site. Ce fichier liste les sous-pages publiques du site, que l\'auteur souhaite voir crawler par les moteurs de recherche. Les sitemaps aident au SEO, mais sont également utiles pour voir tout le contenu public d\'un site d\'un coup d\'œil.',
    use: 'Comprendre la structure du contenu public d\'un site, et pour les propriétaires de sites, vérifier que le sitemap est accessible, analysable et contient tout ce que vous souhaitez.',
    resources: [
      { title: 'En savoir plus sur les Sitemaps', link: 'https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview?hl=fr'},
      { title: 'Spécification XML Sitemap', link: 'https://www.sitemaps.org/protocol.html'},
      { title: 'Tutoriel Sitemap', link: 'https://www.conductor.com/academy/xml-sitemap/'},
    ],
    screenshot: 'https://i.ibb.co/GtrCQYq/Screenshot-from-2023-07-21-12-28-38.png',
  },
  {
    id: 'security-txt',
    title: 'Security.txt',
    description: "Le fichier security.txt indique aux chercheurs comment ils peuvent divulguer de manière responsable tout problème de sécurité trouvé sur votre site. "
    + "La norme a été proposée dans la RFC 9116, et spécifie que ce fichier doit inclure un point de contact (adresse email), "
    + "ainsi qu'optionnellement d'autres infos, comme un lien vers la politique de divulgation de sécurité, clé PGP, langue préférée, expiration de la politique et plus. "
    + "Le fichier doit être situé à la racine de votre domaine, soit à /security.txt ou /.well-known/security.txt.",
    use: "Ceci est important, car sans point de contact défini un chercheur en sécurité peut être incapable de signaler un problème de sécurité critique, "
    + "ou peut utiliser des canaux non sécurisés ou possiblement publics pour le faire. D'un point de vue OSINT, vous pouvez également glaner des infos sur un site incluant "
    + "leur posture sur la sécurité, leur fournisseur CSAF, et les métadonnées de la clé publique PGP.",
    resources: [
      { title: 'securitytxt.org', link: 'https://securitytxt.org/'},
      { title: 'Proposition RFC-9116', link: 'https://datatracker.ietf.org/doc/html/rfc9116'},
      { title: 'Historique RFC-9116', link: 'https://datatracker.ietf.org/doc/rfc9116/'},
      { title: 'Security.txt (Wikipedia)', link: 'https://fr.wikipedia.org/wiki/Security.txt'},
      { title: 'Exemple security.txt (Cloudflare)', link: 'https://www.cloudflare.com/.well-known/security.txt'},
      { title: 'Tutoriel création security.txt', link: 'https://pieterbakker.com/implementing-security-txt/'},
    ],
    screenshot: 'https://i.ibb.co/tq1FT5r/Screenshot-from-2023-07-24-20-31-21.png',
  },
  {
    id: 'linked-pages',
    title: 'Pages Liées',
    description: 'Affiche tous les liens internes et externes trouvés sur un site, identifiés par les attributs href attachés aux éléments d\'ancre.',
    use: "Pour les propriétaires de sites, ceci est utile pour diagnostiquer les problèmes SEO, améliorer la structure du site, comprendre comment le contenu est interconnecté. Les liens externes peuvent montrer des partenariats, dépendances, et risques de réputation potentiels. " +
    "Du point de vue de la sécurité, les liens sortants peuvent aider à identifier tout site malveillant ou compromis auquel le site web lie sans le savoir. L'analyse des liens internes peut aider à comprendre la structure du site et potentiellement découvrir des pages cachées ou vulnérables qui ne sont pas destinées à être publiques. " +
    "Et pour un investigateur OSINT, cela peut aider à construire une compréhension complète de la cible, découvrir des entités liées, des ressources, ou même des parties cachées potentielles du site.",
    resources: [
      { title: 'Vérificateur de liens W3C', link: 'https://validator.w3.org/checklink'},
    ],
    screenshot: 'https://i.ibb.co/LtK14XR/Screenshot-from-2023-07-29-11-16-44.png',
  },
  {
    id: 'social-tags',
    title: 'Balises Sociales',
    description: 'Les sites web peuvent inclure certaines balises meta, qui indiquent aux moteurs de recherche et plateformes de médias sociaux quelles infos afficher. Cela inclut généralement un titre, description, vignette, mots-clés, auteur, comptes sociaux, etc.',
    use: 'Ajouter ces données à votre site boostera le SEO, et en tant que chercheur OSINT il peut être utile de comprendre comment une application web donnée se décrit',
    resources: [
      { title: 'SocialSharePreview.com', link: 'https://socialsharepreview.com/'},
      { title: 'Le guide des balises meta sociales', link: 'https://css-tricks.com/essential-meta-tags-social-media/'},
      { title: 'Balises metadata Web.dev', link: 'https://web.dev/learn/html/metadata/'},
      { title: 'Protocole Open Graph', link: 'https://ogp.me/'},
      { title: 'Twitter Cards', link: 'https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards'},
      { title: 'Facebook Open Graph', link: 'https://developers.facebook.com/docs/sharing/webmasters'},
    ],
    screenshot: 'https://i.ibb.co/4srTT1w/Screenshot-from-2023-07-29-11-15-27.png',
  },
  {
    id: 'mail-config',
    title: 'Configuration Email',
    description: "DMARC (Domain-based Message Authentication, Reporting & Conformance): DMARC est un protocole d'authentification email qui fonctionne avec SPF et DKIM pour prévenir l'usurpation d'email et le phishing. Il permet aux propriétaires de domaines de spécifier comment gérer le courrier non authentifié via une politique publiée dans DNS, et fournit un moyen pour les serveurs de réception de courrier d'envoyer des retours sur la conformité des emails à l'expéditeur. " +
    "BIMI (Brand Indicators for Message Identification): BIMI est un standard email émergent qui permet aux organisations d'afficher automatiquement un logo dans les clients email de leurs clients. BIMI lie le logo à l'enregistrement DMARC du domaine, fournissant un autre niveau d'assurance visuelle aux destinataires que l'email est légitime. " +
    "DKIM (DomainKeys Identified Mail): DKIM est un standard de sécurité email conçu pour s'assurer que les messages n'ont pas été altérés en transit entre les serveurs d'envoi et de réception. Il utilise des signatures numériques liées au domaine de l'expéditeur pour vérifier l'expéditeur et assurer l'intégrité du message. " +
    "SPF (Sender Policy Framework): SPF est une méthode d'authentification email conçue pour prévenir l'usurpation d'email. Elle spécifie quels serveurs de messagerie sont autorisés à envoyer des emails au nom d'un domaine en créant un enregistrement DNS. Cela aide à protéger contre le spam en fournissant un moyen pour les serveurs de messagerie de réception de vérifier que le courrier entrant provient d'un hôte autorisé par les administrateurs du domaine.",
    use: "Ces informations sont utiles pour les chercheurs car elles aident à évaluer la posture de sécurité email d'un domaine, découvrir des vulnérabilités potentielles, et vérifier la légitimité des emails pour la détection de phishing. Ces détails peuvent également fournir un aperçu de l'environnement d'hébergement, des fournisseurs de services potentiels, et des modèles de configuration d'une organisation cible, assistant dans les efforts d'investigation.",
    resources: [
      { title: 'Intro à DMARC, DKIM et SPF (Cloudflare)', link: 'https://www.cloudflare.com/fr-fr/learning/email-security/dmarc-dkim-spf/' },
      { title: 'EasyDMARC Domain Scanner', link: 'https://easydmarc.com/tools/domain-scanner' },
      { title: 'MX Toolbox', link: 'https://mxtoolbox.com/' },
      { title: 'RFC-7208 - SPF', link: 'https://datatracker.ietf.org/doc/html/rfc7208' },
      { title: 'RFC-6376 - DKIM', link: 'https://datatracker.ietf.org/doc/html/rfc6376' },
      { title: 'RFC-7489 - DMARC', link: 'https://datatracker.ietf.org/doc/html/rfc7489' },
      { title: 'BIMI Group', link: 'https://bimigroup.org/' },
    ],
    screenshot: 'https://i.ibb.co/yqhwx5G/Screenshot-from-2023-07-29-18-22-20.png',
  },
  {
    id: 'firewall',
    title: 'Détection Firewall',
    description: 'Un WAF ou pare-feu d\'application web aide à protéger les applications web en filtrant et surveillant le trafic HTTP entre une application web et Internet. Il protège généralement les applications web contre les attaques telles que la falsification intersite, le cross-site-scripting (XSS), l\'inclusion de fichiers, et l\'injection SQL, entre autres.',
    use: 'Il est utile de comprendre si un site utilise un WAF, et quel logiciel/service de pare-feu il utilise, car cela fournit un aperçu de la protection du site contre plusieurs vecteurs d\'attaque, mais peut également révéler des vulnérabilités dans le pare-feu lui-même.',
    resources: [
      { title: 'Qu\'est-ce qu\'un WAF (Cloudflare)', link: 'https://www.cloudflare.com/fr-fr/learning/ddos/glossary/web-application-firewall-waf/' },
      { title: 'OWASP - Web Application Firewalls', link: 'https://owasp.org/www-community/Web_Application_Firewall' },
      { title: 'Meilleures pratiques WAF', link: 'https://owasp.org/www-pdf-archive/Best_Practices_Guide_WAF_v104.en.pdf' },
      { title: 'WAF - Wiki', link: 'https://fr.wikipedia.org/wiki/Pare-feu_applicatif_web' },
    ],
    screenshot: 'https://i.ibb.co/MfcxQt2/Screenshot-from-2023-08-12-15-40-52.png',
  },
  {
    id: 'http-security',
    title: 'Fonctionnalités de Sécurité HTTP',
    description: 'Des en-têtes de sécurité HTTP correctement configurés ajoutent une couche de protection contre les attaques courantes sur votre site. Les principaux en-têtes à connaître sont: '
    + 'HTTP Strict Transport Security (HSTS): Force l\'utilisation de HTTPS, atténuant les attaques MITM et les tentatives de rétrogradation de protocole. '
    + 'Content Security Policy (CSP): Contraint les ressources de page web pour prévenir le cross-site scripting et les attaques par injection de données. '
    + 'X-Content-Type-Options: Empêche les navigateurs de faire du MIME-sniffing d\'une réponse loin du type de contenu déclaré, contrant les attaques de confusion de type MIME. '
    + 'X-Frame-Options: Protège les utilisateurs des attaques de clickjacking en contrôlant si un navigateur doit rendre la page dans un <frame>, <iframe>, <embed>, ou <object>. ',
    use: 'Examiner les en-têtes de sécurité est important, car cela offre des insights sur la posture défensive d\'un site et les vulnérabilités potentielles, permettant une atténuation proactive et assurant la conformité avec les meilleures pratiques de sécurité.',
    resources: [
      { title: 'Projet OWASP Secure Headers', link: 'https://owasp.org/www-project-secure-headers/'},
      { title: 'Aide-mémoire en-têtes HTTP', link: 'https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html' },
      { title: 'content-security-policy.com', link: 'https://content-security-policy.com/' },
      { title: 'resourcepolicy.fyi', link: 'https://resourcepolicy.fyi/' },
      { title: 'HTTP Security Headers', link: 'https://securityheaders.com/' },
      { title: 'Mozilla Observatory', link: 'https://observatory.mozilla.org/' },
      { title: 'Docs CSP', link: 'https://developer.mozilla.org/fr/docs/Web/HTTP/CSP' },
      { title: 'Docs HSTS', link: 'https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/Strict-Transport-Security' },
      { title: 'Docs X-Content-Type-Options', link: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options' },
      { title: 'Docs X-Frame-Options', link: 'https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/X-Frame-Options' },
      { title: 'Docs X-XSS-Protection', link: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection' },
    ],
    screenshot: 'https://i.ibb.co/LP05HMV/Screenshot-from-2023-08-12-15-40-28.png',
  },
  {
    id: 'archives',
    title: 'Historique Archives',
    description: 'Récupère l\'historique complet des archives depuis la Wayback machine',
    use: 'Ceci est utile pour comprendre l\'historique d\'un site, et comment il a changé au fil du temps. Cela peut également être utile pour trouver d\'anciennes versions d\'un site, ou pour trouver du contenu qui a été supprimé.',
    resources: [
      { title: 'Wayback Machine', link: 'https://archive.org/web/'},
    ],
    screenshot: 'https://i.ibb.co/nB9szT1/Screenshot-from-2023-08-14-22-31-16.png',
  },
  {
    id: 'rank',
    title: 'Classement Mondial',
    description: 'Cette vérification affiche le rang mondial du site demandé. Ceci n\'est précis que pour les sites web qui sont dans la liste des 100 millions premiers. Nous utilisons les données du projet Tranco (voir ci-dessous), qui rassemble les meilleurs sites du web depuis Umbrella, Majestic, Quantcast, le Chrome User Experience Report et Cloudflare Radar.',
    use: 'Connaître le rang mondial global d\'un site web peut être utile pour comprendre l\'échelle du site, et pour le comparer à d\'autres sites. Cela peut également être utile pour comprendre la popularité relative d\'un site, et pour identifier des tendances potentielles.',
    resources: [
      { title: 'Liste Tranco', link: 'https://tranco-list.eu/' },
      { title: 'Article de recherche Tranco', link: 'https://tranco-list.eu/assets/tranco-ndss19.pdf'},
    ],
    screenshot: 'https://i.ibb.co/nkbczgb/Screenshot-from-2023-08-14-22-02-40.png',
  },
  {
    id: 'block-lists',
    title: 'Détection de Blocage',
    description: 'Vérifie l\'accès à l\'URL en utilisant plus de 10 serveurs DNS de blocage les plus populaires pour la confidentialité, les malwares et le contrôle parental.',
    use: 'Permet d\'identifier si un site est bloqué par des services de sécurité ou de contrôle parental.',
    resources: [
      { title: 'Listes ThreatJammer', link: 'https://threatjammer.com/osint-lists'},
    ],
    screenshot: 'https://i.ibb.co/M5JSXbW/Screenshot-from-2023-08-26-12-12-43.png',
  },
  {
    id: 'threats',
    title: 'Détection Malware & Phishing',
    description: 'Vérifie si un site apparaît dans plusieurs listes courantes de malware et phishing, pour déterminer son niveau de menace.',
    use: 'Savoir si un site est listé comme une menace par l\'un de ces services peut être utile pour comprendre la réputation d\'un site, et pour identifier des tendances potentielles.',
    resources: [
      { title: 'URLHaus', link: 'https://urlhaus-api.abuse.ch/'},
      { title: 'PhishTank', link: 'https://www.phishtank.com/'},
    ],
    screenshot: 'https://i.ibb.co/hYgy621/Screenshot-from-2023-08-26-12-07-47.png',
  },
  {
    id: 'tls-cipher-suites',
    title: 'Suites de Chiffrement TLS',
    description: 'Ce sont des combinaisons d\'algorithmes cryptographiques utilisés par le serveur pour établir une connexion sécurisée. Cela inclut l\'algorithme d\'échange de clés, l\'algorithme de chiffrement en bloc, l\'algorithme MAC, et la PRF (fonction pseudoaléatoire).',
    use: 'C\'est une info importante à tester d\'un point de vue sécurité. Parce qu\'une suite de chiffrement n\'est aussi sécurisée que les algorithmes qu\'elle contient. Si la version de l\'algorithme de chiffrement ou d\'authentification dans une suite de chiffrement a des vulnérabilités connues, la suite de chiffrement et la connexion TLS peuvent alors être vulnérables à une attaque de rétrogradation ou autre',
    resources: [
      { title: 'sslscan2 CLI', link: 'https://github.com/rbsec/sslscan' },
      { title: 'ssl-enum-ciphers (script NMAP)', link: 'https://nmap.org/nsedoc/scripts/ssl-enum-ciphers.html' }
    ],
    screenshot: 'https://i.ibb.co/6ydtH5R/Screenshot-from-2023-08-26-12-09-58.png',
  },
  {
    id: 'tls-security-config',
    title: 'Configuration de Sécurité TLS',
    description: 'Ceci utilise les directives de TLS Observatory de Mozilla pour vérifier la sécurité de la configuration TLS. Il vérifie les mauvaises configurations, qui peuvent laisser le site vulnérable aux attaques, ainsi que donner des conseils sur comment corriger. Il donnera également des suggestions autour des configurations TLS obsolètes et modernes',
    use: 'Comprendre les problèmes avec la configuration TLS d\'un site vous aidera à adresser les vulnérabilités potentielles, et assurer que le site utilise la configuration TLS la plus récente et la plus sécurisée.',
    resources: [],
    screenshot: 'https://i.ibb.co/FmksZJt/Screenshot-from-2023-08-26-12-12-09.png',
  },
  {
    id: 'tls-client-support',
    title: 'Simulation Poignée de Main TLS',
    description: 'Ceci simule comment différents clients (navigateurs, systèmes d\'exploitation) effectueraient une poignée de main TLS avec le serveur. Cela aide à identifier les problèmes de compatibilité et les configurations non sécurisées.',
    use: 'Permet d\'identifier les problèmes de compatibilité TLS avec différents navigateurs et systèmes.',
    resources: [
      { title: 'Poignées de main TLS (Cloudflare)', link: 'https://www.cloudflare.com/fr-fr/learning/ssl/what-happens-in-a-tls-handshake/' },
      { title: 'Test SSL (SSL Labs)', link: 'https://www.ssllabs.com/ssltest/' },
    ],
    screenshot: 'https://i.ibb.co/F7qRZkh/Screenshot-from-2023-08-26-12-11-28.png',
  },
  {
    id: 'screenshot',
    title: 'Capture d\'Écran',
    description: 'Cette vérification prend une capture d\'écran de la page web vers laquelle l\'URL / IP demandée se résout, et l\'affiche.',
    use: 'Cela peut être utile pour voir à quoi ressemble un site web donné, libre des contraintes de votre navigateur, IP, ou emplacement.',
    resources: [],
    screenshot: 'https://i.ibb.co/2F0x8kP/Screenshot-from-2023-07-29-18-34-48.png',
  },
  {
    id: 'apdp-cookie-banner',
    title: 'Bannière de Consentement Cookies APDP',
    description: 'Cette vérification détecte la présence d\'une bannière de consentement aux cookies conforme RGPD/APDP. Elle analyse si le site propose des boutons "Accepter", "Refuser" et "Personnaliser", ainsi qu\'un lien vers la politique cookies. Les solutions détectées incluent tarteaucitron, cookiebot, onetrust, didomi, axeptio et autres bibliothèques de gestion du consentement.',
    use: 'Essentiel pour la conformité RGPD/APDP Monaco. Une bannière conforme doit permettre aux utilisateurs de refuser les cookies non essentiels de manière aussi simple que de les accepter. L\'absence de bouton "Refuser" ou de personnalisation constitue une non-conformité majeure pouvant entraîner des sanctions.',
    resources: [
      { title: 'APDP Monaco - Protection des données', link: 'https://apdp.mc/' },
      { title: 'CNIL - Cookies et traceurs', link: 'https://www.cnil.fr/fr/cookies-et-autres-traceurs' },
      { title: 'RGPD - Règlement Général sur la Protection des Données', link: 'https://www.cnil.fr/fr/reglement-europeen-protection-donnees' },
      { title: 'Tarteaucitron.js - Outil français de gestion cookies', link: 'https://tarteaucitron.io/fr/' },
    ],
  },
  {
    id: 'apdp-privacy-policy',
    title: 'Politique de Confidentialité APDP',
    description: 'Cette vérification recherche et analyse la politique de confidentialité du site. Elle vérifie la présence des sections obligatoires RGPD: collecte de données, finalités du traitement, droits des utilisateurs, durée de conservation, sécurité des données, et contact du DPO/responsable. La détection se fait via les liens dans le footer, le contenu de la page, robots.txt et sitemap.xml.',
    use: 'La politique de confidentialité est une obligation légale RGPD/APDP pour tout site collectant des données personnelles. Elle doit expliquer clairement quelles données sont collectées, pourquoi, combien de temps elles sont conservées, et comment les utilisateurs peuvent exercer leurs droits. L\'absence ou l\'incomplétude de cette politique est une violation grave.',
    resources: [
      { title: 'APDP Monaco - Politique de confidentialité', link: 'https://apdp.mc/protection-des-donnees/politique-de-confidentialite' },
      { title: 'CNIL - Modèle de politique de confidentialité', link: 'https://www.cnil.fr/fr/modele/rgpd/politique-de-confidentialite' },
      { title: 'RGPD - Article 13', link: 'https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3#Article13' },
    ],
  },
  {
    id: 'apdp-legal-notices',
    title: 'Mentions Légales APDP',
    description: 'Cette vérification recherche et analyse les mentions légales du site. Elle vérifie la présence des informations obligatoires: raison sociale, adresse du siège, numéro SIRET/RCS, responsable de publication, hébergeur et contact. La détection couvre les liens "mentions légales", "c.g.u", "c.g.v", "conditions générales" dans le footer, sitemap et robots.txt.',
    use: 'Les mentions légales sont obligatoires pour tout site web professionnel en France et Monaco. Elles permettent d\'identifier le responsable du site et de le contacter. L\'absence de mentions légales est une infraction punie par la loi (article 6-III de la LCEN). Pour Monaco, l\'APDP exige également ces informations pour la transparence.',
    resources: [
      { title: 'Légifrance - LCEN Article 6', link: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000042038977' },
      { title: 'APDP Monaco - Mentions légales obligatoires', link: 'https://apdp.mc/' },
      { title: 'Service Public - Mentions légales site web', link: 'https://www.service-public.fr/professionnels-entreprises/vosdroits/F31228' },
    ],
  },
  {
    id: 'apdp-user-rights',
    title: 'Droits des Utilisateurs RGPD/APDP',
    description: 'Cette vérification analyse si le site informe clairement les utilisateurs de leurs 6 droits fondamentaux RGPD: droit d\'accès, de rectification, d\'effacement (droit à l\'oubli), de limitation du traitement, de portabilité des données, et d\'opposition. Elle vérifie également la présence de moyens d\'exercer ces droits (formulaire, email, adresse postale).',
    use: 'Les droits RGPD sont au cœur de la protection des données personnelles. Tout site collectant des données doit informer les utilisateurs de ces droits ET leur fournir des moyens simples de les exercer. Le non-respect de ces obligations expose à des sanctions importantes de l\'APDP Monaco ou de la CNIL.',
    resources: [
      { title: 'CNIL - Les droits pour maîtriser vos données', link: 'https://www.cnil.fr/fr/les-droits-pour-maitriser-vos-donnees-personnelles' },
      { title: 'RGPD - Chapitre 3: Droits de la personne concernée', link: 'https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3' },
      { title: 'APDP Monaco - Vos droits', link: 'https://apdp.mc/vos-droits' },
      { title: 'RGPD - Article 15 à 22 (Droits)', link: 'https://gdpr-info.eu/chapter-3/' },
    ],
  },
  {
    id: 'rgpd-compliance',
    title: 'Conformité RGPD Globale',
    description: 'Cette analyse complète évalue la conformité RGPD du site sur tous les aspects: sécurité SSL/TLS, cookies, en-têtes de sécurité (CSP, HSTS), pages légales, droits des utilisateurs, et ressources tierces. Elle génère un score de conformité et identifie les problèmes critiques, avertissements et améliorations recommandées.',
    use: 'Cette vérification globale permet d\'obtenir une vue d\'ensemble de la conformité RGPD/APDP du site. Elle aide à prioriser les actions correctives et à suivre les progrès vers la conformité complète. Particulièrement utile pour les audits réguliers et la préparation aux contrôles APDP.',
    resources: [
      { title: 'RGPD - Texte officiel complet', link: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679' },
      { title: 'CNIL - Guide de la sécurité des données personnelles', link: 'https://www.cnil.fr/fr/principes-cles/guide-de-la-securite-des-donnees-personnelles' },
      { title: 'APDP Monaco - Obligations', link: 'https://apdp.mc/' },
    ],
  },
];


export const featureIntro = [
  'When conducting an OSINT investigation on a given website or host, there are several key areas to look at. Each of these are documented below, along with links to the tools and techniques you can use to gather the relevant information.',
  'Web-Check can automate the process of gathering this data, but it will be up to you to interpret the results and draw conclusions.',
];

export const about = [
`Test Conformité is a professional-grade compliance assessment platform designed for comprehensive regulatory gap analysis and security auditing.
Our platform empowers compliance officers, risk managers, and security auditors with deep insights into website security posture and regulatory compliance status.`,

`The assessment engine provides detailed analysis of compliance gaps, security configurations,
and regulatory alignment across multiple industry standards and frameworks.
The results enable informed decision-making for risk mitigation, compliance remediation,
and regulatory reporting across your digital assets.`,

`Whether you're conducting compliance audits, performing regulatory assessments, or managing enterprise risk,
Test Conformité delivers professional-grade compliance capabilities through an intuitive, auditor-focused interface.`,
];

export const license = `The MIT License (MIT)
Copyright (c) OpenPro

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and associated documentation files (the "Software"), to deal 
in the Software without restriction, including without limitation the rights 
to use, copy, modify, merge, publish, distribute, sub-license, and/or sell 
copies of the Software, and to permit persons to whom the Software is furnished 
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included install 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANT ABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`;

export const supportUs = [
  "Test Conformité is a professional compliance assessment platform available for enterprise use.",
  "The platform is open source under the MIT license, allowing you to deploy your own instances and customize the platform for your organization's specific compliance requirements.",
  "Our mission is to provide enterprise-grade compliance assessment tools that are accessible to compliance officers, risk managers, and organizations of all sizes.",
  "We're committed to maintaining high-quality, reliable service while continuously expanding our assessment capabilities and regulatory framework coverage.",
  "Test Conformité will always remain open and accessible, supporting the compliance community with professional-grade auditing tools.",
];

export const fairUse = [
  'Please use this tool responsibly. Do not use it for hosts you do not have permission to scan. Do not use it as part of a scheme to attack or disrupt services.',
  'Requests may be rate-limited to prevent abuse. If you need to make more bandwidth, please deploy your own instance.',
  'There is no guarantee of uptime or availability. If you need to make sure the service is available, please deploy your own instance.',
  'Please use fairly, as excessive use will quickly deplete the lambda function credits, making the service unavailable for others (and/or empty my bank account!).',
];

export default docs;
