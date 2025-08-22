import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { ToastContainer } from 'react-toastify';
import Masonry from 'react-masonry-css'

import colors from 'web-check-live/styles/colors';
import Heading from 'web-check-live/components/Form/Heading';
import Modal from 'web-check-live/components/Form/Modal';
import Header from 'web-check-live/components/misc/Header';
import Footer from 'web-check-live/components/misc/Footer';
import Nav from 'web-check-live/components/Form/Nav';
import type { RowProps }  from 'web-check-live/components/Form/Row';

import Loader from 'web-check-live/components/misc/Loader';
import ErrorBoundary from 'web-check-live/components/misc/ErrorBoundary';
import SelfScanMsg from 'web-check-live/components/misc/SelfScanMsg';
import DocContent from 'web-check-live/components/misc/DocContent';
import ProgressBar, { type LoadingJob, type LoadingState, initialJobs } from 'web-check-live/components/misc/ProgressBar';
import ActionButtons from 'web-check-live/components/misc/ActionButtons';

import ViewRaw from 'web-check-live/components/misc/ViewRaw';

import ComplianceSummaryCard from 'web-check-live/components/Results/ComplianceSummary';
import VulnerabilitiesCard from 'web-check-live/components/Results/Vulnerabilities';
import CDNResourcesCard from 'web-check-live/components/Results/CDNResources';
import LegalPagesCard from 'web-check-live/components/Results/LegalPages';
import ServerLocationCard from 'web-check-live/components/Results/ServerLocation';
import ServerInfoCard from 'web-check-live/components/Results/ServerInfo';
import HostNamesCard from 'web-check-live/components/Results/HostNames';
import WhoIsCard from 'web-check-live/components/Results/WhoIs';
import LighthouseCard from 'web-check-live/components/Results/Lighthouse';
import ScreenshotCard from 'web-check-live/components/Results/Screenshot';
import SslCertCard from 'web-check-live/components/Results/SslCert';
import HeadersCard from 'web-check-live/components/Results/Headers';
import CookiesCard from 'web-check-live/components/Results/Cookies';
import RobotsTxtCard from 'web-check-live/components/Results/RobotsTxt';
import DnsRecordsCard from 'web-check-live/components/Results/DnsRecords';
import RedirectsCard from 'web-check-live/components/Results/Redirects';
import TxtRecordCard from 'web-check-live/components/Results/TxtRecords';
import ServerStatusCard from 'web-check-live/components/Results/ServerStatus';
import OpenPortsCard from 'web-check-live/components/Results/OpenPorts';
import TraceRouteCard from 'web-check-live/components/Results/TraceRoute';
import CarbonFootprintCard from 'web-check-live/components/Results/CarbonFootprint';
import SiteFeaturesCard from 'web-check-live/components/Results/SiteFeatures';
import DnsSecCard from 'web-check-live/components/Results/DnsSec';
import HstsCard from 'web-check-live/components/Results/Hsts';
import SitemapCard from 'web-check-live/components/Results/Sitemap';
import DomainLookup from 'web-check-live/components/Results/DomainLookup';
import DnsServerCard from 'web-check-live/components/Results/DnsServer';
import TechStackCard from 'web-check-live/components/Results/TechStack';
import SecurityTxtCard from 'web-check-live/components/Results/SecurityTxt';
import ContentLinksCard from 'web-check-live/components/Results/ContentLinks';
import SocialTagsCard from 'web-check-live/components/Results/SocialTags';
import MailConfigCard from 'web-check-live/components/Results/MailConfig';
import HttpSecurityCard from 'web-check-live/components/Results/HttpSecurity';
import FirewallCard from 'web-check-live/components/Results/Firewall';
import ArchivesCard from 'web-check-live/components/Results/Archives';
import RankCard from 'web-check-live/components/Results/Rank';
import BlockListsCard from 'web-check-live/components/Results/BlockLists';
import ThreatsCard from 'web-check-live/components/Results/Threats';
import TlsCipherSuitesCard from 'web-check-live/components/Results/TlsCipherSuites';
import TlsIssueAnalysisCard from 'web-check-live/components/Results/TlsIssueAnalysis';
import TlsClientSupportCard from 'web-check-live/components/Results/TlsClientSupport';

import keys from 'web-check-live/utils/get-keys';
import { determineAddressType, type AddressType } from 'web-check-live/utils/address-type-checker';
import useMotherHook from 'web-check-live/hooks/motherOfAllHooks';
import {
  getLocation, type ServerLocation,
  type Cookie,
  applyWhoIsResults, type Whois,
  parseShodanResults, type ShodanResults
} from 'web-check-live/utils/result-processor';

const ResultsOuter = styled.div`
  min-height: 100vh;
  background: ${colors.background};
  display: flex;
  flex-direction: column;
  .masonry-grid {
    display: flex;
    width: auto;
  }
  .masonry-grid-col section { margin: 1rem 0.5rem; }
`;

const ResultsContent = styled.section`
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 16px;
  display: grid;
  grid-auto-flow: dense;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
  width: 100%;
`;

const FilterButtons = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  .one-half {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }
  button, input, .toggle-filters {
    background: ${colors.backgroundLighter};
    color: ${colors.textColor};
    border: 1px solid ${colors.borderColor};
    border-radius: 6px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 14px;
    padding: 8px 12px;
    transition: all 0.2s ease;
  }
  button, .toggle-filters {
    cursor: pointer;
    text-transform: capitalize;
    font-weight: 500;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    &:hover {
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      border-color: ${colors.primary};
      color: ${colors.primary};
    }
    &.selected {
      border-color: ${colors.primary};
      color: ${colors.primary};
      background: rgba(220, 38, 38, 0.05);
    }
  }
  input:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px ${colors.primaryTransparent};
  }
  .clear {
    color: ${colors.textColorSecondary};
    text-decoration: underline;
    cursor: pointer;
    font-size: 14px;
    opacity: 0.8;
    &:hover {
      opacity: 1;
      color: ${colors.primary};
    }
  }
  .toggle-filters  {
    font-size: 14px;
  }
  .control-options {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    a {
      text-decoration: none;
    }
  }
`;

const Results = (props: { address?: string } ): JSX.Element => {
  const startTime = new Date().getTime();

  const address = props.address || useParams().urlToScan || '';

  const [ addressType, setAddressType ] = useState<AddressType>('empt');

  const [loadingJobs, setLoadingJobs] = useState<LoadingJob[]>(initialJobs);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(<></>);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);

  const clearFilters = () => {
    setTags([]);
    setSearchTerm('');
  };
  const updateTags = (tag: string) => {
    // Remove current tag if it exists, otherwise add it
    // setTags(tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]);
    setTags(tags.includes(tag) ? tags.filter(t => t !== tag) : [tag]);
  };

  const updateLoadingJobs = useCallback((jobs: string | string[], newState: LoadingState, error?: string, retry?: () => void, data?: any) => {
    (typeof jobs === 'string' ? [jobs] : jobs).forEach((job: string) => {
    const now = new Date();
    const timeTaken = now.getTime() - startTime;
    setLoadingJobs((prevJobs) => {
      const newJobs = prevJobs.map((loadingJob: LoadingJob) => {
        if (job.includes(loadingJob.name)) {
          return { ...loadingJob, error, state: newState, timeTaken, retry };
        }
        return loadingJob;
      });

      const timeString = `[${now.getHours().toString().padStart(2, '0')}:`
        +`${now.getMinutes().toString().padStart(2, '0')}:`
        + `${now.getSeconds().toString().padStart(2, '0')}]`;


      if (newState === 'success') {
        console.log(
          `%cFetch Success - ${job}%c\n\n${timeString}%c The ${job} job succeeded in ${timeTaken}ms`
          + `\n%cRun %cwindow.webCheck['${job}']%c to inspect the raw the results`,
          `background:${colors.success};color:${colors.background};padding: 4px 8px;font-size:16px;`,
          `font-weight: bold; color: ${colors.success};`,
          `color: ${colors.success};`,
          `color: #1d8242;`,`color: #1d8242;text-decoration:underline;`,`color: #1d8242;`,
        );
        if (!(window as any).webCheck) (window as any).webCheck = {};
        if (data) (window as any).webCheck[job] = data;
      }
  
      if (newState === 'error') {
        console.log(
          `%cFetch Error - ${job}%c\n\n${timeString}%c The ${job} job failed `
          +`after ${timeTaken}ms, with the following error:%c\n${error}`,
          `background: ${colors.danger}; color:${colors.background}; padding: 4px 8px; font-size: 16px;`,
          `font-weight: bold; color: ${colors.danger};`,
          `color: ${colors.danger};`,
          `color: ${colors.warning};`,
        );
      }

      if (newState === 'timed-out') {
        console.log(
          `%cFetch Timeout - ${job}%c\n\n${timeString}%c The ${job} job timed out `
          +`after ${timeTaken}ms, with the following error:%c\n${error}`,
          `background: ${colors.info}; color:${colors.background}; padding: 4px 8px; font-size: 16px;`,
          `font-weight: bold; color: ${colors.info};`,
          `color: ${colors.info};`,
          `color: ${colors.warning};`,
        );
      }

      return newJobs;
    });
  });
  }, [startTime]);

  const parseJson = (response: Response): Promise<any> => {
    return new Promise((resolve) => {
        response.json()
          .then(data => resolve(data))
          .catch(error => resolve(
            { error: `Failed to get a valid response 😢\n`
            + 'This is likely due the target not exposing the required data, '
            + 'or limitations in imposed by the infrastructure this instance '
            + 'of Web Check is running on.\n\n'
            + `Error info:\n${error}`}
          ));
    });
  };

  const urlTypeOnly = ['url'] as AddressType[]; // Many jobs only run with these address types

  const api = import.meta.env.PUBLIC_API_ENDPOINT || '/api'; // Where is the API hosted?
  
  // Fetch and parse IP address for given URL
  const [ipAddress, setIpAddress] = useMotherHook({
    jobId: 'get-ip',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/get-ip?url=${address}`)
    .then(res => parseJson(res))
    .then(res => res.ip),
  });

  useEffect(() => {
    if (!addressType || addressType === 'empt') {
      setAddressType(determineAddressType(address || ''));
    }
    if (addressType === 'ipV4' && address) {
      setIpAddress(address);
    }
  }, [address, addressType, setIpAddress]);  

  // Get IP address location info
  const [locationResults, updateLocationResults] = useMotherHook<ServerLocation>({
    jobId: 'location',
    updateLoadingJobs,
    addressInfo: { address: ipAddress, addressType: 'ipV4', expectedAddressTypes: ['ipV4', 'ipV6'] },
    fetchRequest: () => fetch(`https://ipapi.co/${ipAddress}/json/`)
      .then(res => parseJson(res))
      .then(res => getLocation(res)),
  });

  // Fetch and parse SSL certificate info
  const [sslResults, updateSslResults] = useMotherHook({
    jobId: 'ssl',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/ssl?url=${address}`).then((res) => parseJson(res)),
  });

  // Run a manual whois lookup on the domain
  const [domainLookupResults, updateDomainLookupResults] = useMotherHook({
    jobId: 'domain',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/whois?url=${address}`).then(res => parseJson(res)),
  });

  // Fetch and parse Lighthouse performance data
  const [lighthouseResults, updateLighthouseResults] = useMotherHook({
    jobId: 'quality',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/quality?url=${address}`)
      .then(res => parseJson(res))
      .then(res => res?.lighthouseResult || { error: res.error || 'No Data' }),
  });

  // Get the technologies used to build site, using Wappalyzer
  const [techStackResults, updateTechStackResults] = useMotherHook({
    jobId: 'tech-stack',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/tech-stack?url=${address}`).then(res => parseJson(res)),
  });

  // Get hostnames and associated domains from Shodan
  const [shoadnResults, updateShodanResults] = useMotherHook<ShodanResults>({
    jobId: ['hosts', 'server-info'],
    updateLoadingJobs,
    addressInfo: { address: ipAddress, addressType: 'ipV4', expectedAddressTypes: ['ipV4', 'ipV6'] },
    fetchRequest: () => fetch(`https://api.shodan.io/shodan/host/${ipAddress}?key=${keys.shodan}`)
      .then(res => parseJson(res))
      .then(res => parseShodanResults(res)),
  });

  // Fetch and parse cookies info
  const [cookieResults, updateCookieResults] = useMotherHook<{cookies: Cookie[]}>({
    jobId: 'cookies',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/cookies?url=${address}`)
      .then(res => parseJson(res)),
  });

  // Fetch and parse headers
  const [headersResults, updateHeadersResults] = useMotherHook({
    jobId: 'headers',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/headers?url=${address}`).then(res => parseJson(res)),
  });

  // Fetch and parse DNS records
  const [dnsResults, updateDnsResults] = useMotherHook({
    jobId: 'dns',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/dns?url=${address}`).then(res => parseJson(res)),
  });

  // Get HTTP security
  const [httpSecurityResults, updateHttpSecurityResults] = useMotherHook({
    jobId: 'http-security',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/http-security?url=${address}`).then(res => parseJson(res)),
  });

  // Get social media previews, from a sites social meta tags
  const [socialTagResults, updateSocialTagResults] = useMotherHook({
    jobId: 'social-tags',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/social-tags?url=${address}`).then(res => parseJson(res)),
  });

  // Get trace route for a given hostname
  const [traceRouteResults, updateTraceRouteResults] = useMotherHook({
    jobId: 'trace-route',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/trace-route?url=${address}`).then(res => parseJson(res)),
  });

  // Get a websites listed pages, from sitemap
  const [securityTxtResults, updateSecurityTxtResults] = useMotherHook({
    jobId: 'security-txt',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/security-txt?url=${address}`).then(res => parseJson(res)),
  });

  // Get the DNS server(s) for a domain, and test DoH/DoT support
  const [dnsServerResults, updateDnsServerResults] = useMotherHook({
    jobId: 'dns-server',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/dns-server?url=${address}`).then(res => parseJson(res)),
  });

  // Get the WAF and Firewall info for a site
  const [firewallResults, updateFirewallResults] = useMotherHook({
    jobId: 'firewall',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/firewall?url=${address}`).then(res => parseJson(res)),
  });

  // Get DNSSEC info
  const [dnsSecResults, updateDnsSecResults] = useMotherHook({
    jobId: 'dnssec',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/dnssec?url=${address}`).then(res => parseJson(res)),
  });

  // Check if a site is on the HSTS preload list
  const [hstsResults, updateHstsResults] = useMotherHook({
    jobId: 'hsts',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/hsts?url=${address}`).then(res => parseJson(res)),
  });

  // Check if a host is present on the URLHaus malware list
  const [threatResults, updateThreatResults] = useMotherHook({
    jobId: 'threats',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/threats?url=${address}`).then(res => parseJson(res)),
  });

  // Get mail config for server, based on DNS records
  const [mailConfigResults, updateMailConfigResults] = useMotherHook({
    jobId: 'mail-config',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/mail-config?url=${address}`).then(res => parseJson(res)),
  });

  // Get list of archives from the Wayback Machine
  const [archivesResults, updateArchivesResults] = useMotherHook({
    jobId: 'archives',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/archives?url=${address}`).then(res => parseJson(res)),
  });

  // Get website's global ranking, from Tranco
  const [rankResults, updateRankResults] = useMotherHook({
    jobId: 'rank',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/rank?url=${address}`).then(res => parseJson(res)),
  });

  // Take a screenshot of the website
  const [screenshotResult, updateScreenshotResult] = useMotherHook({
    jobId: 'screenshot',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/screenshot?url=${address}`).then(res => parseJson(res)),
  });

  // Get TLS security info, from Mozilla Observatory
  const [tlsResults, updateTlsResults] = useMotherHook({
    jobId: ['tls-cipher-suites', 'tls-security-config', 'tls-client-support'],
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/tls?url=${address}`).then(res => parseJson(res)),
  });

  // Fetches URL redirects
  const [redirectResults, updateRedirectResults] = useMotherHook({
    jobId: 'redirects',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/redirects?url=${address}`).then(res => parseJson(res)),
  });

  // Get list of links included in the page content
  const [linkedPagesResults, updateLinkedPagesResults] = useMotherHook({
    jobId: 'linked-pages',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/linked-pages?url=${address}`).then(res => parseJson(res)),
  });

  // Fetch and parse crawl rules from robots.txt
  const [robotsTxtResults, updateRobotsTxtResults] = useMotherHook<{robots: RowProps[]}>({
    jobId: 'robots-txt',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/robots-txt?url=${address}`)
      .then(res => parseJson(res)),
  });

  // Get current status and response time of server
  const [serverStatusResults, updateServerStatusResults] = useMotherHook({
    jobId: 'status',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/status?url=${address}`).then(res => parseJson(res)),
  });

  // Check for open ports
  const [portsResults, updatePortsResults] = useMotherHook({
    jobId: 'ports',
    updateLoadingJobs,
    addressInfo: { address: ipAddress, addressType: 'ipV4', expectedAddressTypes: ['ipV4', 'ipV6'] },
    fetchRequest: () => fetch(`${api}/ports?url=${ipAddress}`)
      .then(res => parseJson(res)),
  });

  // Fetch and parse domain whois results
  const [whoIsResults, updateWhoIsResults] = useMotherHook<Whois | { error: string }>({
    jobId: 'whois',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`https://api.whoapi.com/?domain=${address}&r=whois&apikey=${keys.whoApi}`)
      .then(res => parseJson(res))
      .then(res => applyWhoIsResults(res)),
  });

  // Fetches DNS TXT records
  const [txtRecordResults, updateTxtRecordResults] = useMotherHook({
    jobId: 'txt-records',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/txt-records?url=${address}`).then(res => parseJson(res)),
  });

  // Check site against DNS blocklists
  const [blockListsResults, updateBlockListsResults] = useMotherHook({
    jobId: 'block-lists',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/block-lists?url=${address}`).then(res => parseJson(res)),
  });

  // Get a websites listed pages, from sitemap
  const [sitemapResults, updateSitemapResults] = useMotherHook({
    jobId: 'sitemap',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/sitemap?url=${address}`).then(res => parseJson(res)),
  });

  // Fetch carbon footprint data for a given site
  const [carbonResults, updateCarbonResults] = useMotherHook({
    jobId: 'carbon',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/carbon?url=${address}`).then(res => parseJson(res)),
  });

  // Get site features from BuiltWith
  const [siteFeaturesResults, updateSiteFeaturesResults] = useMotherHook({
    jobId: 'features',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/features?url=${address}`)
    .then(res => parseJson(res))
    .then(res => {
      if (res.Errors && res.Errors.length > 0) {
        return { error: `No data returned, because ${res.Errors[0].Message || 'API lookup failed'}` };
      }
      return res;
    }),
  });

  /* Cancel remaining jobs after  10 second timeout */
  useEffect(() => {
    const checkJobs = () => {
      loadingJobs.forEach(job => {
        if (job.state === 'loading') {
          updateLoadingJobs(job.name, 'timed-out');
        }
      });
    };
    const timeoutId = setTimeout(checkJobs, 10000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadingJobs, updateLoadingJobs]);

  const makeSiteName = (address: string): string => {
    try {
      return new URL(address).hostname.replace('www.', '');
    } catch (error) {
      return address;
    }
  }

  // Get comprehensive APDP compliance analysis
  const [rgpdComplianceResults, updateRgpdComplianceResults] = useMotherHook({
    jobId: 'rgpd-compliance',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/rgpd-compliance?url=${address}`)
      .then(res => parseJson(res))
      .then(res => {
        // If the API fails, fall back to basic calculation
        if (res.error) {
          return calculateBasicCompliance();
        }
        return res;
      }),
  });

  // Get vulnerability analysis
  const [vulnerabilitiesResults, updateVulnerabilitiesResults] = useMotherHook({
    jobId: 'vulnerabilities',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/vulnerabilities?url=${address}`).then(res => parseJson(res)),
  });

  // Get CDN and external resources analysis
  const [cdnResourcesResults, updateCdnResourcesResults] = useMotherHook({
    jobId: 'cdn-resources',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/cdn-resources?url=${address}`).then(res => parseJson(res)),
  });

  // Get legal pages analysis
  const [legalPagesResults, updateLegalPagesResults] = useMotherHook({
    jobId: 'legal-pages',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/legal-pages?url=${address}`).then(res => parseJson(res)),
  });

  // Fallback compliance calculation if API fails
  const calculateBasicCompliance = () => {
    let criticalIssues = 0;
    let warnings = 0;
    let improvements = 0;
    let compliantItems = 0;
    
    // Count issues based on different security and compliance checks
    if (sslResults?.error) criticalIssues++;
    if (headersResults?.missingHeaders?.length > 0) warnings += headersResults.missingHeaders.length;
    if (cookieResults?.cookies?.some((cookie: any) => !cookie.secure || !cookie.httpOnly)) criticalIssues++;
    if (robotsTxtResults?.isAccessible === false) improvements++;
    if (dnsSecResults?.isValid === false) warnings++;
    if (hstsResults?.isEnabled === false) warnings++;
    if (serverStatusResults?.isUp === true) compliantItems++;
    if (sslResults?.validCertificate === true) compliantItems++;
    if (headersResults?.securityHeaders?.length > 0) compliantItems += headersResults.securityHeaders.length;
    
    // Add some basic scoring logic with actual data
    if (serverStatusResults?.isUp) compliantItems++;
    if (sslResults && !sslResults.error) compliantItems++;
    if (hstsResults?.isEnabled) compliantItems++;
    if (dnsSecResults?.isValid) compliantItems++;
    
    // Calculate overall score based on issue distribution
    let overallScore: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'A';
    if (criticalIssues > 3) overallScore = 'F';
    else if (criticalIssues > 2) overallScore = 'E';
    else if (criticalIssues > 1) overallScore = 'D';
    else if (warnings > 5) overallScore = 'D';
    else if (warnings > 3) overallScore = 'C';
    else if (warnings > 1) overallScore = 'B';
    
    return {
      overallScore,
      criticalIssues,
      warnings,
      improvements,
      compliantItems,
      url: address,
      timestamp: new Date().toISOString(),
      error: 'Analyse APDP complète indisponible - utilisation des données de base'
    };
  };

  // A list of state sata, corresponding component and title for each card
  const resultCardData = [
    {
      id: 'compliance-summary',
      title: 'Résumé de Conformité APDP',
      result: rgpdComplianceResults || calculateBasicCompliance(),
      Component: ComplianceSummaryCard,
      refresh: updateRgpdComplianceResults,
      tags: ['summary', 'compliance'],
    }, {
      id: 'vulnerabilities',
      title: 'Analyse de Vulnérabilités',
      result: vulnerabilitiesResults,
      Component: VulnerabilitiesCard,
      refresh: updateVulnerabilitiesResults,
      tags: ['security'],
    }, {
      id: 'cdn-resources',
      title: 'CDN et Ressources Externes',
      result: cdnResourcesResults,
      Component: CDNResourcesCard,
      refresh: updateCdnResourcesResults,
      tags: ['performance', 'security'],
    }, {
      id: 'legal-pages',
      title: 'Pages Légales APDP',
      result: legalPagesResults,
      Component: LegalPagesCard,
      refresh: updateLegalPagesResults,
      tags: ['compliance'],
    },
    {
      id: 'location',
      title: 'Server Location',
      result: locationResults,
      Component: ServerLocationCard,
      refresh: updateLocationResults,
      tags: ['server'],
    }, {
      id: 'ssl',
      title: 'SSL Certificate',
      result: sslResults,
      Component: SslCertCard,
      refresh: updateSslResults,
      tags: ['server', 'security'],
    }, {
      id: 'domain',
      title: 'Domain Whois',
      result: domainLookupResults,
      Component: DomainLookup,
      refresh: updateDomainLookupResults,
      tags: ['server'],
    }, {
      id: 'quality',
      title: 'Quality Summary',
      result: lighthouseResults,
      Component: LighthouseCard,
      refresh: updateLighthouseResults,
      tags: ['client'],
    }, {
      id: 'tech-stack',
      title: 'Tech Stack',
      result: techStackResults,
      Component: TechStackCard,
      refresh: updateTechStackResults,
      tags: ['client', 'meta'],
    }, {
      id: 'server-info',
      title: 'Server Info',
      result: shoadnResults?.serverInfo,
      Component: ServerInfoCard,
      refresh: updateShodanResults,
      tags: ['server'],
    }, {
      id: 'cookies',
      title: 'Cookies',
      result: cookieResults,
      Component: CookiesCard,
      refresh: updateCookieResults,
      tags: ['client', 'security'],
    }, {
      id: 'headers',
      title: 'Headers',
      result: headersResults,
      Component: HeadersCard,
      refresh: updateHeadersResults,
      tags: ['client', 'security'],
    }, {
      id: 'dns',
      title: 'DNS Records',
      result: dnsResults,
      Component: DnsRecordsCard,
      refresh: updateDnsResults,
      tags: ['server'],
    }, {
      id: 'hosts',
      title: 'Host Names',
      result: shoadnResults?.hostnames,
      Component: HostNamesCard,
      refresh: updateShodanResults,
      tags: ['server'],
    }, {
      id: 'http-security',
      title: 'HTTP Security',
      result: httpSecurityResults,
      Component: HttpSecurityCard,
      refresh: updateHttpSecurityResults,
      tags: ['security'],
    }, {
      id: 'social-tags',
      title: 'Social Tags',
      result: socialTagResults,
      Component: SocialTagsCard,
      refresh: updateSocialTagResults,
      tags: ['client', 'meta'],
    }, {
      id: 'trace-route',
      title: 'Trace Route',
      result: traceRouteResults,
      Component: TraceRouteCard,
      refresh: updateTraceRouteResults,
      tags: ['server'],
    }, {
      id: 'security-txt',
      title: 'Security.Txt',
      result: securityTxtResults,
      Component: SecurityTxtCard,
      refresh: updateSecurityTxtResults,
      tags: ['security'],
    }, {
      id: 'dns-server',
      title: 'DNS Server',
      result: dnsServerResults,
      Component: DnsServerCard,
      refresh: updateDnsServerResults,
      tags: ['server'],
    }, {
      id: 'firewall',
      title: 'Firewall',
      result: firewallResults,
      Component: FirewallCard,
      refresh: updateFirewallResults,
      tags: ['server', 'security'],
    }, {
      id: 'dnssec',
      title: 'DNSSEC',
      result: dnsSecResults,
      Component: DnsSecCard,
      refresh: updateDnsSecResults,
      tags: ['security'],
    }, {
      id: 'hsts',
      title: 'HSTS Check',
      result: hstsResults,
      Component: HstsCard,
      refresh: updateHstsResults,
      tags: ['security'],
    }, {
      id: 'threats',
      title: 'Threats',
      result: threatResults,
      Component: ThreatsCard,
      refresh: updateThreatResults,
      tags: ['security'],
    }, {
      id: 'mail-config',
      title: 'Email Configuration',
      result: mailConfigResults,
      Component: MailConfigCard,
      refresh: updateMailConfigResults,
      tags: ['server'],
    }, {
      id: 'archives',
      title: 'Archive History',
      result: archivesResults,
      Component: ArchivesCard,
      refresh: updateArchivesResults,
      tags: ['meta'],
    }, {
      id: 'rank',
      title: 'Global Ranking',
      result: rankResults,
      Component: RankCard,
      refresh: updateRankResults,
      tags: ['meta'],
    }, {
      id: 'screenshot',
      title: 'Screenshot',
      result: screenshotResult || lighthouseResults?.fullPageScreenshot?.screenshot,
      Component: ScreenshotCard,
      refresh: updateScreenshotResult,
      tags: ['client', 'meta'],
    }, {
      id: 'tls-cipher-suites',
      title: 'TLS Cipher Suites',
      result: tlsResults,
      Component: TlsCipherSuitesCard,
      refresh: updateTlsResults,
      tags: ['server', 'security'],
    }, {
      id: 'tls-security-config',
      title: 'TLS Security Issues',
      result: tlsResults,
      Component: TlsIssueAnalysisCard,
      refresh: updateTlsResults,
      tags: ['security'],
    }, {
      id: 'tls-client-support',
      title: 'TLS Handshake Simulation',
      result: tlsResults,
      Component: TlsClientSupportCard,
      refresh: updateTlsResults,
      tags: ['security'],
    }, {
      id: 'redirects',
      title: 'Redirects',
      result: redirectResults,
      Component: RedirectsCard,
      refresh: updateRedirectResults,
      tags: ['meta'],
    }, {
      id: 'linked-pages',
      title: 'Linked Pages',
      result: linkedPagesResults,
      Component: ContentLinksCard,
      refresh: updateLinkedPagesResults,
      tags: ['client', 'meta'],
    }, {
      id: 'robots-txt',
      title: 'Crawl Rules',
      result: robotsTxtResults,
      Component: RobotsTxtCard,
      refresh: updateRobotsTxtResults,
      tags: ['meta'],
    }, {
      id: 'status',
      title: 'Server Status',
      result: serverStatusResults,
      Component: ServerStatusCard,
      refresh: updateServerStatusResults,
      tags: ['server'],
    }, {
      id: 'ports',
      title: 'Open Ports',
      result: portsResults,
      Component: OpenPortsCard,
      refresh: updatePortsResults,
      tags: ['server'],
    }, {
      id: 'whois',
      title: 'Domain Info',
      result: whoIsResults,
      Component: WhoIsCard,
      refresh: updateWhoIsResults,
      tags: ['server'],
    }, {
      id: 'txt-records',
      title: 'TXT Records',
      result: txtRecordResults,
      Component: TxtRecordCard,
      refresh: updateTxtRecordResults,
      tags: ['server'],
    }, {
      id: 'block-lists',
      title: 'Block Lists',
      result: blockListsResults,
      Component: BlockListsCard,
      refresh: updateBlockListsResults,
      tags: ['security', 'meta'],
    }, {
      id: 'features',
      title: 'Site Features',
      result: siteFeaturesResults,
      Component: SiteFeaturesCard,
      refresh: updateSiteFeaturesResults,
      tags: ['meta'],
    }, {
      id: 'sitemap',
      title: 'Pages',
      result: sitemapResults,
      Component: SitemapCard,
      refresh: updateSitemapResults,
      tags: ['meta'],
    }, {
      id: 'carbon',
      title: 'Carbon Footprint',
      result: carbonResults,
      Component: CarbonFootprintCard,
      refresh: updateCarbonResults,
      tags: ['meta'],
    },
  ];

  const makeActionButtons = (title: string, refresh: () => void, showInfo: (id: string) => void): ReactNode => {
    const actions = [
      { label: `Info about ${title}`, onClick: showInfo, icon: 'ⓘ'},
      { label: `Re-fetch ${title} data`, onClick: refresh, icon: '↻'},
    ];
    return (
      <ActionButtons actions={actions} />
    );
  };

  const showInfo = (id: string) => {
    setModalContent(DocContent(id));
    setModalOpen(true);
  };

  const showErrorModal = (content: ReactNode) => {
    setModalContent(content);
    setModalOpen(true);
  };
  
  return (
    <ResultsOuter>
      <Header />
      <Nav>
      { address && 
        <Heading color={colors.textColor} size="medium">
          { addressType === 'url' && <a target="_blank" rel="noreferrer" href={address}><img width="32px" src={`https://icon.horse/icon/${makeSiteName(address)}`} alt="" /></a> }
          {makeSiteName(address)}
        </Heading>
        }
      </Nav>
      <ProgressBar loadStatus={loadingJobs} showModal={showErrorModal} showJobDocs={showInfo} />
      {/* { address?.includes(window?.location?.hostname || 'web-check.xyz') && <SelfScanMsg />} */}
      <Loader show={loadingJobs.filter((job: LoadingJob) => job.state !== 'loading').length < 5} />
      <FilterButtons>{ showFilters ? <>
        <div className="one-half">
        <span className="group-label">Filter by</span>
        {['server', 'client', 'meta'].map((tag: string) => (
          <button
            key={tag}
            className={tags.includes(tag) ? 'selected' : ''}
            onClick={() => updateTags(tag)}>
              {tag}
          </button>
        ))}
        {(tags.length > 0 || searchTerm.length > 0) && <span onClick={clearFilters} className="clear">Clear Filters</span> }
        </div>
        <div className="one-half">
        <span className="group-label">Search</span>
        <input 
          type="text" 
          placeholder="Filter Results" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="toggle-filters" onClick={() => setShowFilters(false)}>Hide</span>
        </div>
        </> : (
          <div className="control-options">
            <span className="toggle-filters" onClick={() => setShowFilters(true)}>Show Filters</span>
            <a href="#view-download-raw-data"><span className="toggle-filters">Export Data</span></a>
            <a href="/about"><span className="toggle-filters">Learn about the Results</span></a>
          </div>
      ) }
      </FilterButtons>
      <ResultsContent>
        <Masonry
          breakpointCols={{ 10000: 12, 4000: 9, 3600: 8, 3200: 7, 2800: 6, 2400: 5, 2000: 4, 1600: 3, 1200: 2, 800: 1 }}
          className="masonry-grid"
          columnClassName="masonry-grid-col">
          {
            resultCardData
            .filter(({ id, title, result, tags }) => {
              // Show if no tags selected OR if any of the card's tags match selected tags
              const tagMatch = tags.length === 0 || tags.some(tag => tags.includes(tag));
              // Show if search term matches title
              const searchMatch = title.toLowerCase().includes(searchTerm.toLowerCase());
              // Show if result exists and has no error
              const hasValidResult = result && !result.error;
              
              return tagMatch && searchMatch && hasValidResult;
            })
            .sort((a, b) => {
              // Sort by priority: compliance first, then security, then others
              const getPriority = (tags: string[]) => {
                if (tags.includes('summary') || tags.includes('compliance')) return 1;
                if (tags.includes('security')) return 2;
                if (tags.includes('performance')) return 3;
                return 4;
              };
              
              const priorityA = getPriority(a.tags);
              const priorityB = getPriority(b.tags);
              
              if (priorityA !== priorityB) return priorityA - priorityB;
              return a.title.localeCompare(b.title);
            })
            .map(({ id, title, result, tags, refresh, Component }, index: number) => (
              <ErrorBoundary title={title} key={`eb-${index}`}>
                <Component
                  key={`${title}-${index}`}
                  data={{...result}}
                  title={title}
                  actionButtons={refresh ? makeActionButtons(title, refresh, () => showInfo(id)) : undefined}
                />
              </ErrorBoundary>
            ))
          }
          </Masonry>
      </ResultsContent>
      <ViewRaw everything={resultCardData} />
      <Footer />
      <Modal isOpen={modalOpen} closeModal={()=> setModalOpen(false)}>{modalContent}</Modal>
      <ToastContainer limit={3} draggablePercent={60} autoClose={2500} theme="dark" position="bottom-right" />
    </ResultsOuter>
  );
}

export default Results;
