import styled from '@emotion/styled';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import colors from 'web-check-live/styles/colors';
import Heading from 'web-check-live/components/Form/Heading';
import Footer from 'web-check-live/components/misc/Footer';
import Nav from 'web-check-live/components/Form/Nav';
import Button from 'web-check-live/components/Form/Button';

import { StyledCard } from 'web-check-live/components/Form/Card';
import docs, { about, featureIntro, license, fairUse, supportUs } from 'web-check-live/utils/docs';

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
  hr {
    border: none;
    border-top: 1px dashed ${colors.primary};
    margin: 1.5rem auto;
  }
  ul {
    padding: 0 0 0 1rem;
    list-style: circle;
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
  small { opacity: 0.7; }
  .contents {
    ul {
      list-style: none;
      li {
        a {
          // color: ${colors.textColor};
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
    img {
      float: right;
      break-inside: avoid;
      max-width: 300px;
      // max-height: 30rem;
      border-radius: 6px;
      clear: both;
    }
    figcaption {
      font-size: 0.8rem;
      text-align: center;
      opacity: 0.7;
    }
  }
`;

const SponsorshipContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  line-height: 1.5rem;
  img {
    border-radius: 4px;
  }
`;

const makeAnchor = (title: string): string => {
  return title.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, "-");
};

const About = (): JSX.Element => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to hash fragment if present
    if (location.hash) {
      // Add a small delay to ensure the page has fully rendered
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
          <a href="/check"><Button>Start Assessment</Button></a>
        </HeaderLinkContainer>
      </Nav>

      <Heading as="h2" size="medium" color={colors.primary}>Intro</Heading>
      <Section>
        {about.map((para, index: number) => (
          <p key={index}>{para}</p>
        ))}
        <hr />
        <p>
          BeCompliant is developed and maintained by <strong>OpenPro</strong>.
          It's licensed under the <a href="/license">MIT license</a>,
          and is completely free to use, modify and distribute in both personal and commercial settings.<br />
          This professional-grade compliance assessment platform provides comprehensive regulatory gap analysis 
          and security auditing capabilities for compliance officers and risk managers.
        </p>
      </Section>
      
      <Heading as="h2" size="medium" color={colors.primary}>Features</Heading>
      <Section>
        {featureIntro.map((fi: string, i: number) => (<p key={i}>{fi}</p>))}
        <div className="contents">
        <Heading as="h3" size="small" id="#feature-contents" color={colors.primary}>Contents</Heading>
          <ul>
            {docs.map((section, index: number) => (
              <li key={index}>
                <b>{index + 1}</b>
                <a href={`#${makeAnchor(section.title)}`}>{section.title}</a></li>
            ))}
          </ul>
          <hr />
        </div>
        {docs.map((section, sectionIndex: number) => (
          <section key={section.title}>
            { sectionIndex > 0 && <hr /> }
            <Heading as="h3" size="small" id={makeAnchor(section.title)} color={colors.primary}>{section.title}</Heading>
            {section.screenshot &&
              <figure className="example-screenshot">
                <img className="screenshot" src={section.screenshot} alt={`Example Screenshot ${section.title}`} />
                <figcaption>Fig.{sectionIndex + 1} - Example of {section.title}</figcaption>
              </figure> 
            }
            {section.description && <>
              <Heading as="h4" size="small">Description</Heading>
              <p>{section.description}</p>
            </>}
            { section.use && <>
              <Heading as="h4" size="small">Use Cases</Heading>
              <p>{section.use}</p>
            </>}
            {section.resources && section.resources.length > 0 && <>
              <Heading as="h4" size="small">Useful Links</Heading>
              <ul>
                {section.resources.map((link: string | { title: string, link: string }, linkIndx: number) => (
                  typeof link === 'string' ? (
                    <li key={`link-${linkIndx}`} id={`link-${linkIndx}`}><a target="_blank" rel="noreferrer" href={link}>{link}</a></li>
                  ) : (
                    <li key={`link-${linkIndx}`} id={`link-${linkIndx}`}><a target="_blank" rel="noreferrer" href={link.link}>{link.title}</a></li>
                  )
                ))}
              </ul>
            </>}
          </section>
        ))}
      </Section>

      <Heading as="h2" size="medium" color={colors.primary}>Deploy your own Instance</Heading>
      <Section>
        <p>BeCompliant is designed to be easily self-hosted for enterprise compliance needs.</p>
        <Heading as="h3" size="small" color={colors.primary}>Option #1 - Docker</Heading>
        <p>
        Run this command to start your own instance, then open <code>localhost:3000</code>
        <pre>docker run -p 3000:3000 webcheck/web-check</pre>
        </p>

        <Heading as="h3" size="small" color={colors.primary}>Option #2 - Manual Installation</Heading>
        <pre>
        # Clone the repository<br />
        git clone [repository-url]<br />
        cd web-check<br />
        yarn install<br />
        yarn build<br />
        yarn start<br />
        </pre>

        <Heading as="h3" size="small" color={colors.primary}>Option #3 - Cloud Deployment</Heading>
        <p>
          Deploy to your preferred cloud platform using Docker containers or 
          by building from source. Supports all major cloud providers.
        </p>

        <Heading as="h3" size="small" color={colors.primary}>Further Documentation</Heading>
        <p>
          More detailed installation and setup instructions are available
          in the self-hosting guide section above.
        </p>

        <Heading as="h3" size="small" color={colors.primary}>Configuring</Heading>
        <p>
          There are some optional environmental variables you can specify to give you access to some additional Web-Checks.
          See the README for full list of options.
        </p>

        <ul>
          <li>
            <code>GOOGLE_CLOUD_API_KEY</code>
            : <a target="_blank" rel="noreferrer" href="https://cloud.google.com/api-gateway/docs/authenticate-api-keys">A Google API key</a>
            <i> Used to return quality metrics for a site</i>
          </li>
          <li>
            <code>REACT_APP_SHODAN_API_KEY</code>
            : <a target="_blank" rel="noreferrer" href="https://account.shodan.io/">A Shodan API key</a>
            <i> To show associated hosts for a domain</i>
          </li>
          <li>
            <code>REACT_APP_WHO_API_KEY</code>
            : <a target="_blank" rel="noreferrer" href="https://whoapi.com/">A WhoAPI key</a>
            <i> Allows for more comprehensive WhoIs records</i>
          </li>
        </ul>

      </Section>

      <Heading as="h2" size="medium" color={colors.primary}>API Documentation</Heading>
      <Section>
        {/* eslint-disable-next-line*/}
        <p>// Coming soon...</p>
      </Section>



      <Heading as="h2" size="medium" color={colors.primary}>Support Us</Heading>
      <Section>
        {supportUs.map((para, index: number) => (<p dangerouslySetInnerHTML={{__html: para}} />))}
      </Section>

      <Heading as="h2" size="medium" color={colors.primary}>Terms & Info</Heading>
      <Section>
              <Heading as="h3" size="small" color={colors.primary}>License</Heading>
        <b>
          BeCompliant is distributed under the MIT license,
          © <strong>OpenPro</strong> { new Date().getFullYear()}
        </b>
        <br />
        <small>For more info, see <a target="_blank" rel="noreferrer" href="https://tldrlegal.com/license/mit-license">TLDR Legal → MIT</a></small>
        <pre>{license}</pre>
        <hr />
        <Heading as="h3" size="small" color={colors.primary}>Fair Use</Heading>
        <ul>
          {fairUse.map((para, index: number) => (<li>{para}</li>))}
        </ul>
        <hr />
        <Heading as="h3" size="small" color={colors.primary}>Privacy</Heading>
        <p>
        Analytics are used on the demo instance (via a self-hosted Plausible instance), this only records the URL you visited but no personal data.
        There's also some basic error logging (via a self-hosted GlitchTip instance), this is only used to help me fix bugs.
        <br />
        <br />
        Neither your IP address, browser/OS/hardware info, nor any other data will ever be collected or logged.
        (You may verify this yourself, either by inspecting the source code or the using developer tools)
        </p>
      </Section>
    </AboutContainer>
    <Footer />
    </div>
  );
}

export default About;
