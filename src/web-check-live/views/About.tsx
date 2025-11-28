import styled from '@emotion/styled';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import colors from 'web-check-live/styles/colors';
import Heading from 'web-check-live/components/Form/Heading';
import Footer from 'web-check-live/components/misc/Footer';
import Nav from 'web-check-live/components/Form/Nav';
import Button from 'web-check-live/components/Form/Button';
import CopyableLink from 'web-check-live/components/misc/CopyableLink';

import { StyledCard } from 'web-check-live/components/Form/Card';
import docs from 'web-check-live/utils/docs';

const AboutContainer = styled.div`
width: 95vw;
max-width: 1000px;
margin: 2rem auto;
padding-bottom: 1rem;
header {
  margin 1rem 0;
  width: auto;
}
section {
  width: auto;
  .inner-heading { display: none; }
}
`;

const HeaderLinkContainer = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  a {
    text-decoration: none;
  }
`;

const Section = styled(StyledCard)`
  margin-bottom: 2rem;
  overflow: clip;
  max-height: 100%;
  section {
    clear: both;
  }
  h3 {
    font-size: 1.5rem;
  }
  h4 {
    font-size: 1.2rem;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    color: ${colors.primary};
  }
  hr {
    border: none;
    border-top: 1px dashed ${colors.primary};
    margin: 1.5rem auto;
  }
  ul {
    padding: 0 0 0 1rem;
    list-style: circle;
    li {
      margin-bottom: 0.5rem;
    }
  }
  ol {
    padding: 0 0 0 1.5rem;
    li {
      margin-bottom: 0.75rem;
      line-height: 1.6;
    }
  }
  a {
    color: ${colors.primary};
    &:visited { opacity: 0.8; }
  }
  pre {
    background: ${colors.background};
    border-radius: 4px;
    padding: 0.5rem;
    width: fit-content;
  }
  code {
    background: ${colors.background};
    border-radius: 3px;
    padding: 0.2rem 0.4rem;
    font-family: 'PTMono', monospace;
    font-size: 0.9em;
  }
  small { opacity: 0.7; }
  .contents {
    ul {
      list-style: none;
      li {
        a {
          &:visited { opacity: 0.8; }
        }
        b {
          opacity: 0.75;
          display: inline-block;
          width: 1.5rem;
        }
      }
    }
  }
  .example-screenshot {
    float: right; 
    display: inline-flex;
    flex-direction: column;
    clear: both;
    max-width: 300px;
    margin-left: 1.5rem;
    margin-bottom: 1rem;
    img {
      float: right;
      break-inside: avoid;
      max-width: 300px;
      border-radius: 6px;
      clear: both;
    }
    figcaption {
      font-size: 0.8rem;
      text-align: center;
      opacity: 0.7;
    }
  }
  .info-box {
    background: ${colors.backgroundDarker};
    border-left: 3px solid ${colors.primary};
    padding: 1rem;
    margin: 1.5rem 0;
    border-radius: 4px;
  }
  p {
    line-height: 1.6;
    margin-bottom: 1rem;
  }
`;

const makeAnchor = (title: string): string => {
  return title.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, "-");
};

const about = [
  "Outil d'analyse de la sécurité est une plateforme professionnelle d'analyse de sécurité développée par OpenPro. Elle offre une analyse complète et automatisée de la sécurité et des meilleures pratiques pour les sites web et applications.",
  "Notre outil effectue plus de 30 vérifications différentes couvrant la conformité APDP, la sécurité des données, l'analyse SEO, les performances, l'accessibilité et bien plus encore. Chaque analyse fournit des résultats détaillés avec des recommandations actionnables.",
  "Notre outil d'analyse de la sécurité des sites Internet, « Je teste mon site », permet de détecter, en quelques minutes à peine et de manière anonyme, certaines vulnérabilités des sites Internet et applications.",
  "Les tests réalisés ne sont pas exhaustifs et ne prétendent pas à une garantie absolue de conformité et/ou d'absence de failles. Néanmoins, ils offrent une couverture représentative de certaines menaces, permettant ainsi aux utilisateurs de renforcer la protection de leur(s) environnement(s) web grâce à des recommandations adaptées aux risques rencontrés.",
  "Outil d'analyse de la sécurité est développé et maintenu par OpenPro. Cette plateforme d'analyse de sécurité professionnelle fournit une analyse complète de la sécurité pour les responsables et les gestionnaires de risques.",
  "Cet outil d'analyse de la sécurité est développé et maintenu par notre prestataire, la société OpenPro (France).",
];

const howToUse = [
  "Entrez l'URL complète du site web que vous souhaitez analyser (exemple: https://monsite.com)",
  "Cliquez sur le bouton 'Analyser' pour lancer l'audit de conformité",
  "Patientez pendant que notre système effectue l'ensemble des vérifications (généralement 15-30 secondes)",
  "Consultez les résultats organisés par catégories : Conformité Loi 1.565, Sécurité, Performance, SEO, etc.",
  "Cliquez sur chaque section pour voir les détails complets de l'analyse",
  "Utilisez les recommandations pour améliorer la conformité de votre site",
  "Exportez ou partagez les résultats avec votre équipe",
];

const understandingResults = {
  intro: "Chaque analyse retourne des informations structurées et un score de conformité. Voici comment interpréter les résultats :",
  sections: [
    {
      title: "Codes Couleur",
      items: [
        "🟢 Vert : Conforme - Aucune action requise",
        "🟡 Orange : Attention - Amélioration recommandée",
        "🔴 Rouge : Non-conforme - Action requise",
        "⚪ Gris : Information - Pas de scoring",
      ]
    },
    {
      title: "Types d'Analyses",
      items: [
        "Conformité Loi 1.565 : Cookies, bannières, politiques de confidentialité, droits des utilisateurs",
        "Sécurité : SSL/TLS, en-têtes HTTP, certificats, pare-feu, ports ouverts",
        "Performance : Vitesse de chargement, métriques Core Web Vitals, optimisation",
        "SEO : Balises meta, sitemap, robots.txt, structure du contenu",
        "Accessibilité : Normes WCAG, navigation au clavier, lecteurs d'écran",
      ]
    }
  ]
};

const bestPractices = [
  {
    title: "Effectuer des Audits Réguliers",
    description: "Analysez votre site au moins une fois par mois pour détecter les nouvelles vulnérabilités ou non-conformités."
  },
  {
    title: "Prioriser les Actions",
    description: "Commencez par corriger les problèmes critiques (rouge) avant de vous attaquer aux améliorations recommandées (orange)."
  },
  {
    title: "Documenter les Changements",
    description: "Gardez une trace des modifications effectuées suite aux recommandations pour suivre l'évolution de la conformité."
  },
  {
    title: "Former Votre Équipe",
    description: "Partagez les résultats avec vos développeurs et équipes de conformité pour une meilleure compréhension."
  },
  {
    title: "Surveiller les Réglementations",
    description: "Les lois sur la protection des données évoluent. Restez informé des changements réglementaires dans votre juridiction."
  }
];

const faq = [
  {
    question: "Combien de temps prend une analyse ?",
    answer: "Une analyse complète prend généralement entre 15 et 30 secondes selon la complexité du site et le nombre de vérifications à effectuer."
  },
  {
    question: "Les données analysées sont-elles stockées ?",
    answer: "Non, nous ne stockons aucune donnée personnelle ou sensible des sites analysés. Les analyses sont effectuées en temps réel et les résultats sont temporaires."
  },
  {
    question: "Puis-je analyser n'importe quel site web ?",
    answer: "Oui, vous pouvez analyser n'importe quel site web public. Cependant, n'utilisez cet outil que sur des sites dont vous êtes propriétaire ou pour lesquels vous avez l'autorisation d'effectuer un audit."
  },
  {
    question: "Les résultats sont-ils conformes aux normes officielles ?",
    answer: "Oui, nos analyses suivent les standards officiels : APDP, OWASP, W3C, WCAG, RFC, et les recommandations de sécurité internationales."
  },
  {
    question: "Comment exporter les résultats ?",
    answer: "Vous pouvez exporter les résultats en PDF ou JSON directement depuis la page de résultats en utilisant le bouton d'export."
  },
  {
    question: "L'outil détecte-t-il tous les problèmes de conformité ?",
    answer: "Notre outil détecte la majorité des problèmes techniques de conformité automatiquement. Cependant, certains aspects (comme le contenu des politiques de confidentialité) nécessitent une revue manuelle par un expert juridique."
  }
];

const fairUse = [
  "N'utilisez cet outil que sur des sites web dont vous êtes propriétaire ou pour lesquels vous avez obtenu l'autorisation explicite.",
  "Ne l'utilisez pas pour des activités malveillantes, du hacking non éthique, ou pour surcharger des serveurs tiers.",
  "Respectez les limites de taux et n'abusez pas du service avec des analyses automatisées excessives.",
  "Les résultats sont fournis à titre informatif. Consultez des experts juridiques et de sécurité pour des audits officiels.",
  "N'utilisez pas les informations découvertes pour exploiter des vulnérabilités sans l'autorisation du propriétaire du site."
];

const license = `MIT License

Copyright (c) ${new Date().getFullYear()} OpenPro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

const About = (): JSX.Element => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const element = document.getElementById(location.hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div>
    <AboutContainer>
      <Nav>
        <HeaderLinkContainer>
          <a href="/check"><Button>Démarrer l'Analyse</Button></a>
        </HeaderLinkContainer>
      </Nav>

      <Heading as="h2" size="medium" color={colors.primary}>Introduction</Heading>
      <Section>
        {about.map((para, index: number) => (
          <p key={index}>{para}</p>
        ))}
      </Section>

      <Heading as="h2" size="medium" color={colors.primary}>Comment Utiliser l'Outil d'analyse de la sécurité</Heading>
      <Section>
        <p>
          L'Outil d'analyse de la sécurité est conçu pour être simple d'utilisation tout en fournissant des résultats 
          professionnels et détaillés. Suivez ces étapes pour effectuer votre première analyse :
        </p>
        <ol>
          {howToUse.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
        <div className="info-box">
          <strong>💡 Conseil :</strong> Pour de meilleurs résultats, analysez votre site en production 
          plutôt qu'en développement, car certaines vérifications nécessitent un environnement réel 
          (certificats SSL, DNS, etc.).
        </div>
      </Section>

      <Heading as="h2" size="medium" color={colors.primary}>Comprendre les Résultats</Heading>
      <Section>
        <p>{understandingResults.intro}</p>
        
        {understandingResults.sections.map((section, idx) => (
          <div key={idx}>
            <Heading as="h4" size="small">{section.title}</Heading>
            <ul>
              {section.items.map((item, itemIdx) => (
                <li key={itemIdx}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        <div className="info-box">
          <strong>📊 Note importante :</strong> Les scores sont calculés automatiquement en fonction 
          des meilleures pratiques et standards internationaux. Un score élevé indique une bonne 
          conformité, mais ne remplace pas un audit juridique ou de sécurité professionnel pour 
          des cas critiques.
        </div>
      </Section>
      
      <Heading as="h2" size="medium" color={colors.primary}>Analyses Disponibles</Heading>
      <Section>
        <div className="contents">
          <ul>
            {docs.map((section, index: number) => (
              <li key={`content-${index}-${section.title}`}>
                <b>{index + 1}</b>
                <a href={`#${makeAnchor(section.title)}`}>{section.title}</a>
              </li>
            ))}
          </ul>
          <hr />
        </div>
        {docs.map((section, sectionIndex: number) => (
          <section key={section.title}>
            { sectionIndex > 0 && <hr /> }
            <Heading as="h3" size="small" id={makeAnchor(section.title)} color={colors.primary}>
              {section.title}
            </Heading>
            {section.screenshot &&
              <figure className="example-screenshot">
                <img className="screenshot" src={section.screenshot} alt={`Exemple ${section.title}`} />
                <figcaption>Fig.{sectionIndex + 1} - Exemple de {section.title}</figcaption>
              </figure> 
            }
            {section.description && <>
              <Heading as="h4" size="small">Description</Heading>
              <p>{section.description}</p>
            </>}
            { section.use && <>
              <Heading as="h4" size="small">Cas d'Usage</Heading>
              <p>{section.use}</p>
            </>}
            {section.resources && section.resources.length > 0 && <>
              <Heading as="h4" size="small">Ressources Utiles</Heading>
              <ul>
                {section.resources.map((link: string | { title: string, link: string}, linkIndx: number) => (
                  typeof link === 'string' ? (
                    <li key={`link-${linkIndx}`}>
                      <CopyableLink url={link} />
                    </li>
                  ) : (
                    <li key={`link-${linkIndx}`}>
                      <CopyableLink url={link.link} label={link.title} />
                    </li>
                  )
                ))}
              </ul>
            </>}
          </section>
        ))}
      </Section>

      <Heading as="h2" size="medium" color={colors.primary}>Meilleures Pratiques</Heading>
      <Section>
        <p>
          Pour tirer le meilleur parti de l'Outil d'analyse de la sécurité et maintenir une sécurité optimale, 
          suivez ces recommandations :
        </p>
        {bestPractices.map((practice, index) => (
          <div key={index}>
            <Heading as="h4" size="small">{practice.title}</Heading>
            <p>{practice.description}</p>
          </div>
        ))}
      </Section>

      <Heading as="h2" size="medium" color={colors.primary}>Questions Fréquentes</Heading>
      <Section>
        {faq.map((item, index) => (
          <div key={index}>
            <Heading as="h4" size="small">{item.question}</Heading>
            <p>{item.answer}</p>
          </div>
        ))}
      </Section>

      <Heading as="h2" size="medium" color={colors.primary}>Conditions d'Utilisation</Heading>
      <Section>
        <Heading as="h3" size="small" color={colors.primary}>Licence</Heading>
        <b>
          Outil d'analyse de la sécurité est distribué sous licence MIT,
          © <strong>OpenPro</strong> { new Date().getFullYear()}
        </b>
        <br />
        <small>
          Pour plus d'informations, consultez{' '}
          <CopyableLink 
            url="https://tldrlegal.com/license/mit-license" 
            label="TLDR Legal → MIT"
          />
        </small>
        <pre>{license}</pre>
        <hr />
        
        <Heading as="h3" size="small" color={colors.primary}>Usage Équitable</Heading>
        <ul>
          {fairUse.map((para, index: number) => (<li key={`fairuse-${index}`}>{para}</li>))}
        </ul>
        <hr />
        
        <Heading as="h3" size="small" color={colors.primary}>Confidentialité</Heading>
        <p>
          La mise en place de cet outil par l'APDP est justifiée par l'existence d'un motif d'intérêt 
          public puisqu'il permet à l'APDP d'accompagner les responsables du traitement dans leurs 
          démarches de mise en conformité avec la Loi et en particulier de promouvoir, dans le cadre 
          de ses missions, l'utilisation de technologies protectrices de la vie privée.
        </p>
        <p>
          Les seules données collectées sont le nom de l'entité concernée, l'URL ou les URL(s) du ou 
          des sites Internet à tester et l'Adresse IP publique utilisée par le DPD.
        </p>
        <p>
          Ces données sont conservées 1 an renouvelable, avec le consentement de l'utilisateur, à la 
          fin de chaque année suivant son inscription.
        </p>
        <p>
          L'exercice des droits d'accès, de rectification, d'effacement, de limitation du traitement 
          et d'opposition s'exerce par e-mail à l'adresse <a href="mailto:dpd@apdp.mc">dpd@apdp.mc</a> ou 
          par courrier postal à APDP – 11 rue du Gabian – 98000 MONACO.
        </p>
        <p>
          De plus amples informations sont disponibles sur le site Internet de l'APDP dans la rubrique{' '}
          <a href="https://apdp.mc" target="_blank" rel="noopener noreferrer">
            Politique de protection des données personnelles
          </a>.
        </p>
        <hr />
        
        <Heading as="h3" size="small" color={colors.primary}>Support</Heading>
        <p>
          <strong><a href="https://apdp.mc/" target="_blank" rel="noopener noreferrer" style={{ color: colors.primary }}>L'APDP</a></strong> s'engage à maintenir et améliorer continuellement l'Outil d'analyse de la sécurité 
          pour offrir la meilleure expérience d'audit de conformité possible.
        </p>
      </Section>
    </AboutContainer>
    <Footer />
    </div>
  );
};

export default About;
