import { useState, useEffect, useCallback, useRef, lazy, Suspense, type ReactNode } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { ToastContainer } from 'react-toastify';
import Masonry from 'react-masonry-css'

import colors from 'web-check-live/styles/colors';
import Heading from 'web-check-live/components/Form/Heading';
import Modal from 'web-check-live/components/Form/Modal';
import Header from 'web-check-live/components/misc/Header';
import Footer from 'web-check-live/components/misc/Footer';
import Nav from 'web-check-live/components/Form/Nav';
import type { RowProps } from 'web-check-live/components/Form/Row';

import Loader from 'web-check-live/components/misc/Loader';
import ErrorBoundary from 'web-check-live/components/misc/ErrorBoundary';
import SelfScanMsg from 'web-check-live/components/misc/SelfScanMsg';
import PluginDocModal from 'web-check-live/components/misc/PluginDocModal';
import ProgressBar, { type LoadingJob, type LoadingState, initialJobs, createFilteredInitialJobs } from 'web-check-live/components/misc/ProgressBar';
import ActionButtons from 'web-check-live/components/misc/ActionButtons';
import { fetchDisabledPlugins } from 'web-check-live/utils/plugin-filter';
import { getPluginRefCode } from 'web-check-live/utils/pluginReferences';

import ViewRaw from 'web-check-live/components/misc/ViewRaw';

// Lazy-loaded Result Card Components (40+ components - reduces initial bundle by 40-60%)
const ProfessionalComplianceDashboard = lazy(() => import('web-check-live/components/Results/ProfessionalComplianceDashboard'));
const VulnerabilitiesCard = lazy(() => import('web-check-live/components/Results/Vulnerabilities'));
const CDNResourcesCard = lazy(() => import('web-check-live/components/Results/CDNResources'));
const ServerLocationCard = lazy(() => import('web-check-live/components/Results/ServerLocation'));
const ServerInfoCard = lazy(() => import('web-check-live/components/Results/ServerInfo'));
const HostNamesCard = lazy(() => import('web-check-live/components/Results/HostNames'));
const WhoIsCard = lazy(() => import('web-check-live/components/Results/WhoIs'));
const LighthouseCard = lazy(() => import('web-check-live/components/Results/Lighthouse'));
const SslCertCard = lazy(() => import('web-check-live/components/Results/SslCert'));
const HeadersCard = lazy(() => import('web-check-live/components/Results/Headers'));
const CookiesCard = lazy(() => import('web-check-live/components/Results/Cookies'));
const RobotsTxtCard = lazy(() => import('web-check-live/components/Results/RobotsTxt'));
const DnsRecordsCard = lazy(() => import('web-check-live/components/Results/DnsRecords'));
const SubdomainEnumerationCard = lazy(() => import('web-check-live/components/Results/SubdomainEnumeration'));
const RedirectsCard = lazy(() => import('web-check-live/components/Results/Redirects'));
const TxtRecordCard = lazy(() => import('web-check-live/components/Results/TxtRecords'));
const ServerStatusCard = lazy(() => import('web-check-live/components/Results/ServerStatus'));
const OpenPortsCard = lazy(() => import('web-check-live/components/Results/OpenPorts'));
const TraceRouteCard = lazy(() => import('web-check-live/components/Results/TraceRoute'));
const CarbonFootprintCard = lazy(() => import('web-check-live/components/Results/CarbonFootprint'));
const SiteFeaturesCard = lazy(() => import('web-check-live/components/Results/SiteFeatures'));
const DnsSecCard = lazy(() => import('web-check-live/components/Results/DnsSec'));
const HstsCard = lazy(() => import('web-check-live/components/Results/Hsts'));
const SitemapCard = lazy(() => import('web-check-live/components/Results/Sitemap'));
const DomainLookup = lazy(() => import('web-check-live/components/Results/DomainLookup'));
const DnsServerCard = lazy(() => import('web-check-live/components/Results/DnsServer'));
const TechStackCard = lazy(() => import('web-check-live/components/Results/TechStack'));
const SecurityTxtCard = lazy(() => import('web-check-live/components/Results/SecurityTxt'));
const ContentLinksCard = lazy(() => import('web-check-live/components/Results/ContentLinks'));
const SocialTagsCard = lazy(() => import('web-check-live/components/Results/SocialTags'));
const MailConfigCard = lazy(() => import('web-check-live/components/Results/MailConfig'));
const HttpSecurityCard = lazy(() => import('web-check-live/components/Results/HttpSecurity'));
const FirewallCard = lazy(() => import('web-check-live/components/Results/Firewall'));
const ArchivesCard = lazy(() => import('web-check-live/components/Results/Archives'));
const RankCard = lazy(() => import('web-check-live/components/Results/Rank'));
const BlockListsCard = lazy(() => import('web-check-live/components/Results/BlockLists'));
const ThreatsCard = lazy(() => import('web-check-live/components/Results/Threats'));
const TlsCipherSuitesCard = lazy(() => import('web-check-live/components/Results/TlsCipherSuites'));
const TlsIssueAnalysisCard = lazy(() => import('web-check-live/components/Results/TlsIssueAnalysis'));
const TlsClientSupportCard = lazy(() => import('web-check-live/components/Results/TlsClientSupport'));
const ApdpCookieBannerCard = lazy(() => import('web-check-live/components/Results/ApdpCookieBanner'));
const ApdpPrivacyPolicyCard = lazy(() => import('web-check-live/components/Results/ApdpPrivacyPolicy'));
const ApdpLegalNoticesCard = lazy(() => import('web-check-live/components/Results/ApdpLegalNotices'));
const SecretsCard = lazy(() => import('web-check-live/components/Results/Secrets'));
const LinkAuditCard = lazy(() => import('web-check-live/components/Results/LinkAudit'));
const ExposedFilesCard = lazy(() => import('web-check-live/components/Results/ExposedFiles'));
const SubdomainTakeoverCard = lazy(() => import('web-check-live/components/Results/SubdomainTakeover'));
const ApiSecurityCard = lazy(() => import('web-check-live/components/Results/ApiSecurity'));

// Loading fallback for lazy-loaded components
const CardLoadingFallback = styled.div`
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.backgroundLighter};
  border-radius: 8px;
  color: ${colors.textColorSecondary};
  font-size: 14px;
`;

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
  overflow-x: hidden;
  
  .masonry-grid {
    display: flex;
    width: auto;
    margin-left: -8px;
    
    @media (max-width: 599px) {
      margin-left: 0;
    }
  }
  
  .masonry-grid-col {
    padding-left: 8px;
    background-clip: padding-box;
    
    @media (max-width: 599px) {
      padding-left: 0;
    }
  }
  
  .masonry-grid-col section { 
    margin: 0.5rem;
    
    @media (max-width: 599px) {
      margin: 0.5rem 0;
    }
  }
`;

const ResultsContent = styled.section`
  width: 100%;
  max-width: 80%;
  margin: 0 auto;
  padding: 24px 16px;
  display: grid;
  grid-auto-flow: dense;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  
  @media (max-width: 1024px) {
    max-width: 90%;
    padding: 20px 12px;
    gap: 12px;
  }
  
  @media (max-width: 768px) {
    max-width: 95%;
    padding: 16px 8px;
  }
  
  @media (max-width: 599px) {
    max-width: 100%;
    padding: 12px;
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const FilterButtons = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  
  @media (max-width: 768px) {
    padding: 0 12px;
    gap: 0.75rem;
    justify-content: center;
  }
  
  @media (max-width: 599px) {
    flex-direction: column;
    align-items: stretch;
  }
  
  .one-half {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    
    @media (max-width: 599px) {
      gap: 0.5rem;
      justify-content: center;
    }
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
    
    @media (max-width: 599px) {
      font-size: 13px;
      padding: 10px 14px;
    }
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
    
    @media (max-width: 768px) {
      gap: 0.5rem;
      justify-content: center;
      width: 100%;
    }
    
    a {
      text-decoration: none;
    }
  }
`;

const LoadingContainer = styled.div`
  max-width: 800px;
  margin: 100px auto;
  padding: 40px;
  text-align: center;
  
  @media (max-width: 768px) {
    margin: 60px auto;
    padding: 24px;
  }
  
  @media (max-width: 599px) {
    margin: 40px 16px;
    padding: 20px;
  }
`;

const BlockedContainer = styled.div`
  max-width: 800px;
  margin: 100px auto;
  padding: 40px;
  background-color: ${colors.backgroundLighter};
  border: 2px solid ${colors.danger};
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    margin: 60px 20px;
    padding: 32px 24px;
  }
  
  @media (max-width: 599px) {
    margin: 40px 16px;
    padding: 24px 16px;
    border-radius: 8px;
  }
  
  .blocked-icon {
    font-size: 64px;
    margin-bottom: 20px;
    
    @media (max-width: 599px) {
      font-size: 48px;
      margin-bottom: 16px;
    }
  }
  
  h2 {
    color: ${colors.danger};
    margin-bottom: 16px;
    font-size: 24px;
    
    @media (max-width: 599px) {
      font-size: 20px;
      margin-bottom: 12px;
    }
  }
  
  p {
    font-size: 16px;
    color: ${colors.textColor};
    margin-bottom: 24px;
    line-height: 1.6;
    
    @media (max-width: 599px) {
      font-size: 14px;
      margin-bottom: 20px;
    }
  }
  
  .back-button {
    display: inline-block;
    padding: 12px 24px;
    background-color: ${colors.primary};
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    
    @media (max-width: 599px) {
      padding: 10px 20px;
      font-size: 14px;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      text-decoration: none;
    }
  }
`;

const Results = (props: { address?: string }): JSX.Element => {
  const startTime = new Date().getTime();

  const address = props.address || useParams().urlToScan || '';
  const navigate = useNavigate();

  const [addressType, setAddressType] = useState<AddressType>('empt');

  const [loadingJobs, setLoadingJobs] = useState<LoadingJob[]>(initialJobs);
  const [disabledPlugins, setDisabledPlugins] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(<></>);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [urlBlocked, setUrlBlocked] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [allowedUrls, setAllowedUrls] = useState<string[]>([]);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Check URL restrictions for DPD users - ONLY from API (never trust localStorage)
  useEffect(() => {
    const checkUrlAccess = async () => {
      const token = localStorage.getItem('checkitAuthToken');
      
      if (!token) {
        setIsCheckingAccess(false);
        return;
      }
      
      try {
        // Fetch fresh profile from API - never trust localStorage for security
        const profileResponse = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.user) {
            const profile = profileData.user;
          setUserProfile(profile);
          
            // Set allowed URLs ONLY from API (database source of truth)
          if (profile.role === 'DPD' && profile.allowedUrls) {
            const urls = profile.allowedUrls.split(',').map((url: string) => url.trim()).filter((url: string) => url);
            setAllowedUrls(urls);
            } else {
              setAllowedUrls([]);
          }
          
            // Check if current URL is allowed for DPD users
            if (profile.role === 'DPD' && address) {
            const checkResponse = await fetch('/api/check-url', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ url: decodeURIComponent(address) })
            });

            if (checkResponse.ok) {
              const checkData = await checkResponse.json();
              if (!checkData.allowed) {
                setUrlBlocked(true);
              }
            }
            }
          }
        } else if (profileResponse.status === 401) {
          // Token invalid
          localStorage.removeItem('checkitAuthToken');
          localStorage.removeItem('checkitUser');
          }
        } catch (error) {
          console.error('Error checking URL restrictions:', error);
      }
      
      setIsCheckingAccess(false);
    };
    
    checkUrlAccess();
  }, [address]);

  // Initialize filtered jobs based on user role and disabled plugins
  useEffect(() => {
    const initializeJobs = async () => {
      const plugins = await fetchDisabledPlugins();
      setDisabledPlugins(plugins);

      const filteredJobs = await createFilteredInitialJobs();
      setLoadingJobs(filteredJobs);
    };
    initializeJobs();
  }, []);

  // Track if scan has been recorded to prevent duplicates
  const scanRecordedRef = useRef(false);

  // Record scan to statistics when all jobs are done
  useEffect(() => {
    const loadingCount = loadingJobs.filter(job => job.state === 'loading').length;
    const isDone = loadingCount === 0 && loadingJobs.length > 0;
    
    if (isDone && !scanRecordedRef.current && address) {
      scanRecordedRef.current = true;
      
      // Count issues from completed jobs
      const successJobs = loadingJobs.filter(job => job.state === 'success').length;
      const errorJobs = loadingJobs.filter(job => job.state === 'error').length;
      
      // Calculate a basic score
      const totalJobs = loadingJobs.length;
      const numericScore = Math.round((successJobs / totalJobs) * 100);
      
      // Record the scan
      const recordScan = async () => {
        try {
          const token = localStorage.getItem('checkitAuthToken');
          if (!token) return;
          
          await fetch('/api/audit/scan', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              url: decodeURIComponent(address),
              results: {
                numericScore,
                criticalCount: errorJobs,
                warningCount: 0,
                improvementCount: successJobs
              }
            })
          });
          console.log('Scan recorded to statistics');
        } catch (error) {
          console.error('Failed to record scan:', error);
        }
      };
      
      recordScan();
    }
  }, [loadingJobs, address]);

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
          + `${now.getMinutes().toString().padStart(2, '0')}:`
          + `${now.getSeconds().toString().padStart(2, '0')}]`;


        if (newState === 'success') {
          console.log(
            `%cSuccès - ${job}%c\n\n${timeString}%c Le job ${job} a réussi en ${timeTaken}ms`
            + `\n%cRun %cwindow.webCheck['${job}']%c to inspect the raw the results`,
            `background:${colors.success};color:${colors.background};padding: 4px 8px;font-size:16px;`,
            `font-weight: bold; color: ${colors.success};`,
            `color: ${colors.success};`,
            `color: #1d8242;`, `color: #1d8242;text-decoration:underline;`, `color: #1d8242;`,
          );
          if (!(window as any).webCheck) (window as any).webCheck = {};
          if (data) (window as any).webCheck[job] = data;
        }

        if (newState === 'error') {
          console.log(
            `%cErreur - ${job}%c\n\n${timeString}%c Le job ${job} a échoué `
            + `after ${timeTaken}ms, with the following error:%c\n${error}`,
            `background: ${colors.danger}; color:${colors.background}; padding: 4px 8px; font-size: 16px;`,
            `font-weight: bold; color: ${colors.danger};`,
            `color: ${colors.danger};`,
            `color: ${colors.warning};`,
          );
        }

        if (newState === 'timed-out') {
          console.log(
            `%cDélai Expiré - ${job}%c\n\n${timeString}%c Le job ${job} a expiré `
            + `after ${timeTaken}ms, with the following error:%c\n${error}`,
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
          {
            error: `Échec de la récupération d'une réponse valide 😢\n`
              + 'Cela est probablement dû au fait que la cible n\'expose pas les données requises, '
              + 'ou aux limitations imposées par l\'infrastructure sur laquelle '
              + 'cette instance de Web Check s\'exécute.\n\n'
              + `Informations sur l\'erreur:\n${error}`
          }
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
  const [cookieResults, updateCookieResults] = useMotherHook<{ cookies: Cookie[] }>({
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

  // Get subdomain enumeration results
  const [subdomainEnumerationResults, updateSubdomainEnumerationResults] = useMotherHook({
    jobId: 'subdomain-enumeration',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/subdomain-enumeration?url=${address}`).then(res => parseJson(res)),
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
  const [robotsTxtResults, updateRobotsTxtResults] = useMotherHook<{ robots: RowProps[] }>({
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

  // APDP Compliance checks
  const [apdpCookieBannerResults, updateApdpCookieBannerResults] = useMotherHook({
    jobId: 'apdp-cookie-banner',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/apdp-cookie-banner?url=${address}`).then(res => parseJson(res)),
  });

  const [apdpPrivacyPolicyResults, updateApdpPrivacyPolicyResults] = useMotherHook({
    jobId: 'apdp-privacy-policy',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/apdp-privacy-policy?url=${address}`).then(res => parseJson(res)),
  });

  const [apdpLegalNoticesResults, updateApdpLegalNoticesResults] = useMotherHook({
    jobId: 'apdp-legal-notices',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/apdp-legal-notices?url=${address}`).then(res => parseJson(res)),
  });

  // PII & Secrets Scanner
  const [secretsResults, updateSecretsResults] = useMotherHook({
    jobId: 'secrets',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/secrets?url=${address}`).then(res => parseJson(res)),
  });

  // Link & Content Auditor
  const [linkAuditResults, updateLinkAuditResults] = useMotherHook({
    jobId: 'link-audit',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/link-audit?url=${address}`).then(res => parseJson(res)),
  });

  // Exposed Files Scanner
  const [exposedFilesResults, updateExposedFilesResults] = useMotherHook({
    jobId: 'exposed-files',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/exposed-files?url=${address}`).then(res => parseJson(res)),
  });

  // Subdomain Takeover Scanner
  const [subdomainTakeoverResults, updateSubdomainTakeoverResults] = useMotherHook({
    jobId: 'subdomain-takeover',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/subdomain-takeover?url=${address}`).then(res => parseJson(res)),
  });

  // API Security Scanner
  const [apiSecurityResults, updateApiSecurityResults] = useMotherHook({
    jobId: 'api-security',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/api-security?url=${address}`).then(res => parseJson(res)),
  });

  // Lighthouse (Updated)
  const [lighthouseNewResults, updateLighthouseNewResults] = useMotherHook({
    jobId: 'lighthouse',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/lighthouse?url=${address}`).then(res => parseJson(res)),
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

  // Get vulnerabilities analysis
  const [vulnerabilitiesResults, updateVulnerabilitiesResults] = useMotherHook({
    jobId: 'vulnerabilities',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/vulnerabilities?url=${address}`).then(res => parseJson(res)),
  });

  // Get CDN resources analysis
  const [cdnResourcesResults, updateCdnResourcesResults] = useMotherHook({
    jobId: 'cdn-resources',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`${api}/cdn-resources?url=${address}`).then(res => parseJson(res)),
  });

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

  /* Cancel remaining jobs after 20 second timeout */
  useEffect(() => {
    const checkJobs = () => {
      loadingJobs.forEach(job => {
        if (job.state === 'loading') {
          updateLoadingJobs(job.name, 'timed-out');
        }
      });
    };
    const timeoutId = setTimeout(checkJobs, 20000); // 20s timeout - optimized plugins
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

  // Function to get all current results for comprehensive analysis
  const getAllResults = () => ({
    url: address,
    cookies: cookieResults,
    headers: headersResults,
    ssl: sslResults,
    'tech-stack': techStackResults,
    'cdn-resources': cdnResourcesResults,
    location: locationResults,
    dns: dnsResults,
    hsts: hstsResults,
    vulnerabilities: vulnerabilitiesResults,
    quality: lighthouseResults,
    'secrets': secretsResults,
    'link-audit': linkAuditResults,
    'server-info': shoadnResults,
    status: serverStatusResults,
    robots: robotsTxtResults,
    'dns-sec': dnsSecResults,
    whois: domainLookupResults,
    ports: portsResults,
    traceroute: traceRouteResults,
    'carbon-footprint': carbonResults,
    archives: archivesResults,
    rank: rankResults,
    'block-lists': blockListsResults,
    threats: threatResults,
    tls: tlsResults,
    'tls-handshake': tlsResults, // TLS results contain handshake data
    'tls-cipher-suites': tlsResults, // TLS results contain cipher suite data
    'http-security': httpSecurityResults,
    sitemap: sitemapResults,
    'social-tags': socialTagResults,
    'linked-pages': linkedPagesResults,
    'mail-config': mailConfigResults,
    firewall: firewallResults,
    'dns-server': dnsServerResults,
    features: siteFeaturesResults,
    'host-names': shoadnResults, // Shodan results contain hostnames
    'security-txt': securityTxtResults,
    'exposed-files': exposedFilesResults,
    'subdomain-takeover': subdomainTakeoverResults,
    'lighthouse': lighthouseNewResults,
  });

  // A list of state data, corresponding component and title for each card
  const resultCardData = [
    {
      id: 'enhanced-compliance-summary',
      title: 'Résumé de Conformité Loi 1.565',
      result: rgpdComplianceResults || calculateBasicCompliance(),
      Component: ProfessionalComplianceDashboard,
      refresh: updateRgpdComplianceResults,
      tags: ['summary', 'compliance'],
      allResults: getAllResults(),
      siteName: address || 'Site Web',
      priority: 1, // Highest priority to appear first
    },
    {
      id: 'exposed-files',
      title: 'Fichiers Exposés',
      result: exposedFilesResults,
      Component: ExposedFilesCard,
      refresh: updateExposedFilesResults,
      tags: ['security'],
      priority: 2,
    },
    {
      id: 'subdomain-takeover',
      title: 'Subdomain Takeover',
      result: subdomainTakeoverResults,
      Component: SubdomainTakeoverCard,
      refresh: updateSubdomainTakeoverResults,
      tags: ['security'],
      priority: 2,
    },
    {
      id: 'api-security',
      title: 'Sécurité API',
      result: apiSecurityResults,
      Component: ApiSecurityCard,
      refresh: updateApiSecurityResults,
      tags: ['security', 'api'],
      priority: 1.5,
    },
    {
      id: 'lighthouse',
      title: 'Performance & SEO (Lighthouse)',
      result: lighthouseNewResults,
      Component: LighthouseCard,
      refresh: updateLighthouseNewResults,
      tags: ['quality', 'seo'],
      priority: 3,
    },
    {
      id: 'vulnerabilities',
      title: 'Analyse de Vulnérabilités',
      result: vulnerabilitiesResults,
      Component: VulnerabilitiesCard,
      refresh: updateVulnerabilitiesResults,
      tags: ['security'],
      priority: 2,
    }, {
      id: 'secrets',
      title: 'Scanner Secrets & PII',
      result: secretsResults,
      Component: SecretsCard,
      refresh: updateSecretsResults,
      tags: ['security'],
      priority: 2.1,
    }, {
      id: 'cdn-resources',
      title: 'CDN et Ressources Externes',
      result: cdnResourcesResults,
      Component: CDNResourcesCard,
      refresh: updateCdnResourcesResults,
      tags: ['performance', 'security'],
      priority: 3,
    },
    {
      id: 'location',
      title: 'Localisation Serveur',
      result: locationResults,
      Component: ServerLocationCard,
      refresh: updateLocationResults,
      tags: ['server'],
    }, {
      id: 'ssl',
      title: 'Certificat SSL',
      result: sslResults,
      Component: SslCertCard,
      refresh: updateSslResults,
      tags: ['server', 'security'],
    }, {
      id: 'domain',
      title: 'Informations Domaine',
      result: domainLookupResults,
      Component: DomainLookup,
      refresh: updateDomainLookupResults,
      tags: ['server'],
    }, {
      id: 'quality',
      title: 'Résumé Qualité',
      result: lighthouseResults,
      Component: LighthouseCard,
      refresh: updateLighthouseResults,
      tags: ['client'],
    }, {
      id: 'link-audit',
      title: 'Link & Content Auditor',
      result: linkAuditResults,
      Component: LinkAuditCard,
      refresh: updateLinkAuditResults,
      tags: ['client', 'quality'],
    }, {
      id: 'tech-stack',
      title: 'Technologies Utilisées',
      result: techStackResults,
      Component: TechStackCard,
      refresh: updateTechStackResults,
      tags: ['client', 'meta'],
      priority: 0.5,
    }, {
      id: 'server-info',
      title: 'Informations Serveur',
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
      title: 'En-têtes HTTP',
      result: headersResults,
      Component: HeadersCard,
      refresh: updateHeadersResults,
      tags: ['client', 'security'],
    }, {
      id: 'dns',
      title: 'Enregistrements DNS',
      result: dnsResults,
      Component: DnsRecordsCard,
      refresh: updateDnsResults,
      tags: ['server'],
    }, {
      id: 'subdomain-enumeration',
      title: 'Énumération des Sous-domaines',
      result: subdomainEnumerationResults,
      Component: SubdomainEnumerationCard,
      refresh: updateSubdomainEnumerationResults,
      tags: ['server', 'security'],
    }, {
      id: 'hosts',
      title: 'Noms d\'Hôtes',
      result: shoadnResults?.hostnames,
      Component: HostNamesCard,
      refresh: updateShodanResults,
      tags: ['server'],
    }, {
      id: 'http-security',
      title: 'Sécurité HTTP',
      result: httpSecurityResults,
      Component: HttpSecurityCard,
      refresh: updateHttpSecurityResults,
      tags: ['security'],
    }, {
      id: 'social-tags',
      title: 'Métadonnées Sociales',
      result: socialTagResults,
      Component: SocialTagsCard,
      refresh: updateSocialTagResults,
      tags: ['client', 'meta'],
    }, {
      id: 'trace-route',
      title: 'Traçage Route',
      result: traceRouteResults,
      Component: TraceRouteCard,
      refresh: updateTraceRouteResults,
      tags: ['server'],
    }, {
      id: 'security-txt',
      title: 'Fichier Security.txt',
      result: securityTxtResults,
      Component: SecurityTxtCard,
      refresh: updateSecurityTxtResults,
      tags: ['security'],
    }, {
      id: 'dns-server',
      title: 'Serveur DNS',
      result: dnsServerResults,
      Component: DnsServerCard,
      refresh: updateDnsServerResults,
      tags: ['server'],
    }, {
      id: 'firewall',
      title: 'Pare-feu',
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
      title: 'Vérification HSTS',
      result: hstsResults,
      Component: HstsCard,
      refresh: updateHstsResults,
      tags: ['security'],
    }, {
      id: 'threats',
      title: 'Menaces',
      result: threatResults,
      Component: ThreatsCard,
      refresh: updateThreatResults,
      tags: ['security'],
    }, {
      id: 'mail-config',
      title: 'Configuration E-mail',
      result: mailConfigResults,
      Component: MailConfigCard,
      refresh: updateMailConfigResults,
      tags: ['server'],
    }, {
      id: 'archives',
      title: 'Historique Archives',
      result: archivesResults,
      Component: ArchivesCard,
      refresh: updateArchivesResults,
      tags: ['meta'],
    }, {
      id: 'rank',
      title: 'Classement Global',
      result: rankResults,
      Component: RankCard,
      refresh: updateRankResults,
      tags: ['meta'],
    },
    {
      id: 'tls-cipher-suites',
      title: 'Suites de Chiffrement TLS',
      result: tlsResults,
      Component: TlsCipherSuitesCard,
      refresh: updateTlsResults,
      tags: ['server', 'security'],
    }, {
      id: 'tls-security-config',
      title: 'Analyses Sécurité TLS',
      result: tlsResults,
      Component: TlsIssueAnalysisCard,
      refresh: updateTlsResults,
      tags: ['security'],
    }, {
      id: 'tls-client-support',
      title: 'Simulation Handshake TLS',
      result: tlsResults,
      Component: TlsClientSupportCard,
      refresh: updateTlsResults,
      tags: ['security'],
    }, {
      id: 'redirects',
      title: 'Redirections',
      result: redirectResults,
      Component: RedirectsCard,
      refresh: updateRedirectResults,
      tags: ['meta'],
    }, {
      id: 'linked-pages',
      title: 'Pages Liées',
      result: linkedPagesResults,
      Component: ContentLinksCard,
      refresh: updateLinkedPagesResults,
      tags: ['client', 'meta'],
    }, {
      id: 'robots-txt',
      title: 'Règles d\'Exploration',
      result: robotsTxtResults,
      Component: RobotsTxtCard,
      refresh: updateRobotsTxtResults,
      tags: ['meta'],
    }, {
      id: 'status',
      title: 'Statut Serveur',
      result: serverStatusResults,
      Component: ServerStatusCard,
      refresh: updateServerStatusResults,
      tags: ['server'],
    }, {
      id: 'ports',
      title: 'Ports Ouverts',
      result: portsResults,
      Component: OpenPortsCard,
      refresh: updatePortsResults,
      tags: ['server'],
    }, {
      id: 'whois',
      title: 'Informations Domaine',
      result: whoIsResults,
      Component: WhoIsCard,
      refresh: updateWhoIsResults,
      tags: ['server'],
    }, {
      id: 'txt-records',
      title: 'Enregistrements TXT',
      result: txtRecordResults,
      Component: TxtRecordCard,
      refresh: updateTxtRecordResults,
      tags: ['server'],
    }, {
      id: 'block-lists',
      title: 'Listes de Blocage',
      result: blockListsResults,
      Component: BlockListsCard,
      refresh: updateBlockListsResults,
      tags: ['security', 'meta'],
    }, {
      id: 'features',
      title: 'Fonctionnalités Site',
      result: siteFeaturesResults,
      Component: SiteFeaturesCard,
      refresh: updateSiteFeaturesResults,
      tags: ['meta'],
    }, {
      id: 'sitemap',
      title: 'Plan du Site',
      result: sitemapResults,
      Component: SitemapCard,
      refresh: updateSitemapResults,
      tags: ['meta'],
    }, {
      id: 'carbon',
      title: 'Empreinte Carbone',
      result: carbonResults,
      Component: CarbonFootprintCard,
      refresh: updateCarbonResults,
      tags: ['meta'],
    }, {
      id: 'apdp-cookie-banner',
      title: 'Bannière Cookies APDP',
      result: apdpCookieBannerResults,
      Component: ApdpCookieBannerCard,
      refresh: updateApdpCookieBannerResults,
      tags: ['compliance', 'apdp'],
      priority: 1,
    }, {
      id: 'apdp-privacy-policy',
      title: 'Politique Confidentialité',
      result: apdpPrivacyPolicyResults,
      Component: ApdpPrivacyPolicyCard,
      refresh: updateApdpPrivacyPolicyResults,
      tags: ['compliance', 'apdp'],
      priority: 1,
    }, {
      id: 'apdp-legal-notices',
      title: 'Mentions Légales',
      result: apdpLegalNoticesResults,
      Component: ApdpLegalNoticesCard,
      refresh: updateApdpLegalNoticesResults,
      tags: ['compliance', 'apdp'],
      priority: 1,
    },
  ];

  const makeActionButtons = (title: string, refresh: () => void, showInfo: (id: string) => void): ReactNode => {
    const actions = [
      { label: `À propos de ${title}`, onClick: showInfo, icon: 'ⓘ' },
      { label: `Actualiser ${title}`, onClick: refresh, icon: '↻' },
    ];
    return (
      <ActionButtons actions={actions} />
    );
  };

  const showInfo = (id: string) => {
    setModalContent(<PluginDocModal pluginId={id} />);
    setModalOpen(true);
  };

  const showErrorModal = (content: ReactNode) => {
    setModalContent(content);
    setModalOpen(true);
  };

  return (
    <ResultsOuter>
      <Header />
      
      {isCheckingAccess ? (
        <LoadingContainer>
          <Loader show={true} />
        </LoadingContainer>
      ) : urlBlocked ? (
        <BlockedContainer>
          <div className="blocked-icon">🚫</div>
          <h2>Accès Non Autorisé</h2>
          <p>
            Vous n'êtes pas autorisé à analyser cette URL.<br/>
            Veuillez contacter votre administrateur APDP pour obtenir l'accès.
          </p>
          <a href="/check" className="back-button">
            ← Retour à l'accueil
          </a>
        </BlockedContainer>
      ) : (
        <>
          <Nav>
            {address &&
              <Heading color={colors.textColor} size="medium">
                {addressType === 'url' && (
                  <a target="_blank" rel="noreferrer" href={address}>
                    <img 
                      width="32px" 
                      src={`https://${makeSiteName(address)}/favicon.ico`}
                      alt=""
                      style={{ display: 'none' }}
                      onLoad={(e) => { (e.target as HTMLImageElement).style.display = 'inline'; }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </a>
                )}
                {makeSiteName(address)}
              </Heading>
            }
          </Nav>
      <ProgressBar loadStatus={loadingJobs} showModal={showErrorModal} showJobDocs={showInfo} />
      {/* { address?.includes(window?.location?.hostname || 'web-check.xyz') && <SelfScanMsg />} */}
      <Loader show={loadingJobs.filter((job: LoadingJob) => job.state !== 'loading').length < 5} />
      
      {/* Show allowed URLs for DPD users */}
      {userProfile?.role === 'DPD' && allowedUrls.length > 0 && (
        <FilterButtons>
          <div className="control-options" style={{ 
            display: 'flex', 
            gap: '10px', 
            flexWrap: 'wrap',
            alignItems: 'center',
            padding: '12px 0',
            justifyContent: 'center'
          }}>
            <span style={{ 
              fontWeight: '600', 
              color: colors.textColor,
              fontSize: '14px',
              marginRight: '8px'
            }}>
              Sites autorisés:
            </span>
            {allowedUrls.map((url, index) => {
              const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
              const decodedAddress = decodeURIComponent(address).replace(/^https?:\/\//, '').replace(/\/$/, '');
              const isCurrentUrl = decodedAddress === cleanUrl || decodedAddress.includes(cleanUrl) || cleanUrl.includes(decodedAddress);
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                    navigate(`/check/${encodeURIComponent(fullUrl)}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    backgroundColor: isCurrentUrl ? colors.primary : 'transparent',
                    color: isCurrentUrl ? 'white' : colors.textColor,
                    border: `2px solid ${isCurrentUrl ? colors.primary : colors.textColorFaded}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isCurrentUrl ? '600' : '500',
                    transition: 'all 0.2s ease',
                    boxShadow: isCurrentUrl ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                    transform: isCurrentUrl ? 'scale(1.02)' : 'scale(1)'
                  }}
                  onMouseOver={(e) => {
                    if (!isCurrentUrl) {
                      e.currentTarget.style.backgroundColor = colors.primary;
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.borderColor = colors.primary;
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isCurrentUrl) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = colors.textColor;
                      e.currentTarget.style.borderColor = colors.textColorFaded;
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${url}&sz=64`} 
                    alt=""
                    style={{ 
                      width: '18px', 
                      height: '18px', 
                      objectFit: 'contain',
                      flexShrink: 0,
                      display: 'none'
                    }}
                    onLoad={(e) => { 
                      (e.target as HTMLImageElement).style.display = 'block';
                    }}
                    onError={(e) => { 
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span>{cleanUrl}</span>
                </button>
              );
            })}
            
          </div>
        </FilterButtons>
      )}

      {/* Full-width Enhanced Compliance Dashboard */}
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <ErrorBoundary title="Tableau de Bord de Conformité Loi 1.565">
          <Suspense fallback={<CardLoadingFallback>Chargement du tableau de bord...</CardLoadingFallback>}>
            <ProfessionalComplianceDashboard
              allResults={getAllResults()}
              siteName={address || 'Site Web'}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      <ResultsContent>
        <Masonry
          breakpointCols={{ 10000: 12, 4000: 9, 3600: 8, 3200: 7, 2800: 6, 2400: 5, 2000: 4, 1600: 3, 1200: 2, 900: 2, 600: 1, 0: 1 }}
          className="masonry-grid"
          columnClassName="masonry-grid-col">
          {
            resultCardData
              .filter(card => card.id !== 'enhanced-compliance-summary') // Exclude the compliance summary from the grid
              .filter(({ id }) => !disabledPlugins.includes(id)) // Filter out disabled plugins for DPD users
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
                // First sort by explicit priority (enhanced compliance summary first)
                if (a.priority && b.priority) {
                  return a.priority - b.priority;
                }
                if (a.priority && !b.priority) return -1;
                if (!a.priority && b.priority) return 1;

                // Then sort by tag-based priority: compliance first, then security, then others
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
              .map(({ id, title, result, tags, refresh, Component, allResults, siteName }, index: number) => {
                const refCode = getPluginRefCode(id);
                return (
                <ErrorBoundary title={title} key={`eb-${index}`}>
                  <Suspense fallback={<CardLoadingFallback>Chargement...</CardLoadingFallback>}>
                    <Component
                      key={`${title}-${index}`}
                      data={{ ...result }}
                      title={title}
                      refCode={refCode}
                      actionButtons={refresh ? makeActionButtons(title, refresh, () => showInfo(id)) : undefined}
                      {...(allResults && { allResults })}
                      {...(siteName && { siteName })}
                    />
                  </Suspense>
                </ErrorBoundary>
                );
              })
          }
        </Masonry>
      </ResultsContent>
      <ViewRaw everything={resultCardData} />
      <Footer />
      <Modal isOpen={modalOpen} closeModal={() => setModalOpen(false)}>{modalContent}</Modal>
      <ToastContainer limit={3} draggablePercent={60} autoClose={2500} theme="dark" position="bottom-right" />
      </>
      )}
    </ResultsOuter>
  );
}

export default Results;
