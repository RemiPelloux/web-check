import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import Card from 'web-check-live/components/Form/Card';
import Heading from 'web-check-live/components/Form/Heading';
import { useState, useEffect, type ReactNode } from 'react';
import { fetchDisabledPlugins, filterAvailablePlugins, getUserRole } from 'web-check-live/utils/plugin-filter';


const LoadCard = styled(Card)`
  margin: 0 auto 1rem auto;
  width: 95vw;
  position: relative;
  transition: all 0.2s ease-in-out;
  &.hidden {
    height: 0;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 0.5rem;
  background: ${colors.bgShadowColor};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBarSegment = styled.div<{ color: string, color2: string, width: number }>`
  height: 1rem;
  display: inline-block;
  width: ${props => props.width}%;
  background: ${props => props.color};
  background: ${props => props.color2 ?
    `repeating-linear-gradient( 315deg, ${props.color}, ${props.color} 3px, ${props.color2} 3px, ${props.color2} 6px )`
    : props.color};
  transition: width 0.5s ease-in-out;
`;

const Details = styled.details`
  transition: all 0.2s ease-in-out;
  summary {
    margin: 0.5rem 0;
    font-weight: bold;
    cursor: pointer;
  }
  summary:before {
    content: "►";
    position: absolute;
    margin-left: -1rem;
    color: ${colors.primary};
    cursor: pointer;
  }
  &[open] summary:before {
    content: "▼";
  }
  ul {
    list-style: none;
    padding: 0.25rem;
    border-radius: 4px;
    width: fit-content;
    li b {
      cursor: pointer;
    }
    i {
      color: ${colors.textColorSecondary};
    }
  }
  p.error {
    margin: 0.5rem 0;
    opacity: 0.75;
    color: ${colors.danger};
  }
`;

const StatusInfoWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  .run-status {
    color: ${colors.textColorSecondary};
    margin: 0;
  }
`;

const AboutPageLink = styled.a`
  color: ${colors.primary};
`;

const SummaryContainer = styled.div`
  margin: 0.5rem 0;
  b {
    margin: 0;
    font-weight: bold;
  }
  p {
    margin: 0;
    opacity: 0.75;
  }
  &.error-info {
    color: ${colors.danger};
  }
  &.success-info {
    color: ${colors.success};
  }
  &.loading-info {
    color: ${colors.info};
  }
  .skipped {
    margin-left: 0.75rem;
    color: ${colors.warning};
  }
  .success {
    margin-left: 0.75rem;
    color: ${colors.success};
  }
`;

const ReShowContainer = styled.div`
  position: relative;
  &.hidden {
    height: 0;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }
  button { background: none;}
`;

const DismissButton = styled.button`
  width: fit-content;
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  background: ${colors.background};
  color: ${colors.textColorSecondary};
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: PTMono;
  cursor: pointer;
  &:hover {
    color: ${colors.primary};
  }
`;

const FailedJobActionButton = styled.button`
  margin: 0.1rem 0.1rem 0.1rem 0.5rem;
  background: ${colors.background};
  color: ${colors.textColorSecondary};
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: PTMono;
  cursor: pointer;
  border: 1px solid ${colors.textColorSecondary};
  transition: all 0.2s ease-in-out;
  &:hover {
    color: ${colors.primary};
    border: 1px solid ${colors.primary};
  } 
`;

const ErrorModalContent = styled.div`
p {
  margin: 0;
}
pre {
  color: ${colors.danger};
  &.info {
    color: ${colors.warning};
  }
}
`;

export type LoadingState = 'success' | 'loading' | 'skipped' | 'error' | 'timed-out';

export interface LoadingJob {
  name: string,
  state: LoadingState,
  error?: string,
  timeTaken?: number,
  retry?: () => void,
}

const jobNames = [
  'rgpd-compliance',
  'vulnerabilities',
  'cdn-resources',
  'get-ip',
  'location',
  'ssl',
  'tls',
  'domain',
  'quality',
  'tech-stack',
  'secrets',
  'link-audit',
  'server-info',
  'cookies',
  'headers',
  'dns',
  'subdomain-enumeration',
  'hosts',
  'http-security',
  'social-tags',
  'trace-route',
  'security-txt',
  'dns-server',
  'firewall',
  'dnssec',
  'hsts',
  'threats',
  'mail-config',
  'archives',
  'rank',
  // 'screenshot', // Removed - not needed for APDP compliance
  'tls-cipher-suites',
  'tls-security-config',
  'tls-client-support',
  'redirects',
  'linked-pages',
  'robots-txt',
  'status',
  'ports',
  // 'whois',
  'txt-records',
  'block-lists',
  // 'features', // Removed per APDP requirement - features detection not needed
  'sitemap',
  'carbon',
  'apdp-cookie-banner',
  'apdp-privacy-policy',
  'apdp-legal-notices',
  'apdp-user-rights',
  'exposed-files',
  'subdomain-takeover',
  'lighthouse',
] as const;

interface JobListItemProps {
  job: LoadingJob;
  showJobDocs: (name: string) => void;
  showErrorModal: (name: string, state: LoadingState, timeTaken: number | undefined, error: string, isInfo?: boolean) => void;
  barColors: Record<LoadingState, [string, string]>;
}

const getStatusEmoji = (state: LoadingState): string => {
  switch (state) {
    case 'success':
      return '✅';
    case 'loading':
      return '🔄';
    case 'error':
      return '❌';
    case 'timed-out':
      return '⏸️';
    case 'skipped':
      return '⏭️';
    default:
      return '❓';
  }
};

const JobListItem: React.FC<JobListItemProps> = ({ job, showJobDocs, showErrorModal, barColors }) => {
  const { name, state, timeTaken, retry, error } = job;
  const actionButton = retry && state !== 'success' && state !== 'loading' ?
    <FailedJobActionButton onClick={retry}>↻ Retry</FailedJobActionButton> : null;

  const showModalButton = error && ['error', 'timed-out', 'skipped'].includes(state) &&
    <FailedJobActionButton onClick={() => showErrorModal(name, state, timeTaken, error, state === 'skipped')}>
      {state === 'timed-out' ? '■ Show Timeout Reason' : '■ Show Error'}
    </FailedJobActionButton>;

  return (
    <li key={name}>
      <b onClick={() => showJobDocs(name)}>{getStatusEmoji(state)} {name}</b>
      <span style={{ color: barColors[state][0] }}> ({state})</span>.
      <i>{timeTaken && state !== 'loading' ? ` Took ${timeTaken} ms` : ''}</i>
      {actionButton}
      {showModalButton}
    </li>
  );
};


export const initialJobs = jobNames.map((job: string) => {
  return {
    name: job,
    state: 'loading' as LoadingState,
    retry: () => { }
  }
});

/**
 * Create filtered jobs based on user role and disabled plugins
 * @returns Promise<LoadingJob[]> Filtered initial jobs
 */
export const createFilteredInitialJobs = async (): Promise<LoadingJob[]> => {
  try {
    const disabledPlugins = await fetchDisabledPlugins();
    const availableJobNames = filterAvailablePlugins(jobNames, disabledPlugins);

    return availableJobNames.map((job: string) => ({
      name: job,
      state: 'loading' as LoadingState,
      retry: () => { }
    }));
  } catch (error) {
    console.error('Error creating filtered jobs:', error);
    // Fallback to all jobs if filtering fails
    return initialJobs;
  }
};

export const calculateLoadingStatePercentages = (loadingJobs: LoadingJob[]): Record<LoadingState | string, number> => {
  const totalJobs = loadingJobs.length;

  // Initialize count object
  const stateCount: Record<LoadingState, number> = {
    'success': 0,
    'loading': 0,
    'timed-out': 0,
    'error': 0,
    'skipped': 0,
  };

  // Count the number of each state
  loadingJobs.forEach((job) => {
    stateCount[job.state] += 1;
  });

  // Convert counts to percentages
  const statePercentage: Record<LoadingState, number> = {
    'success': (stateCount['success'] / totalJobs) * 100,
    'loading': (stateCount['loading'] / totalJobs) * 100,
    'timed-out': (stateCount['timed-out'] / totalJobs) * 100,
    'error': (stateCount['error'] / totalJobs) * 100,
    'skipped': (stateCount['skipped'] / totalJobs) * 100,
  };

  return statePercentage;
};

const MillisecondCounter = (props: { isDone: boolean }) => {
  const { isDone } = props;
  const [milliseconds, setMilliseconds] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    // Start the timer as soon as the component mounts
    if (!isDone) {
      timer = setInterval(() => {
        setMilliseconds(milliseconds => milliseconds + 100);
      }, 100);
    }
    // Clean up the interval on unmount
    return () => {
      clearInterval(timer);
    };
  }, [isDone]); // If the isDone prop changes, the effect will re-run

  return <span>{milliseconds} ms</span>;
};

const RunningText = (props: { state: LoadingJob[], count: number }): JSX.Element => {
  const totalJobs = props.state.length; // Use actual number of jobs being run
  const loadingTasksCount = totalJobs - props.state.filter((val: LoadingJob) => val.state === 'loading').length;
  const isDone = loadingTasksCount >= totalJobs;
  return (
    <p className="run-status">
      {isDone ? 'Terminé en ' : `Exécution ${loadingTasksCount} sur ${totalJobs} analyses - `}
      <MillisecondCounter isDone={isDone} />
    </p>
  );
};

const SummaryText = (props: { state: LoadingJob[], count: number }): JSX.Element => {
  const totalJobs = props.state.length; // Use actual number of jobs being run
  let failedTasksCount = props.state.filter((val: LoadingJob) => val.state === 'error').length;
  let loadingTasksCount = props.state.filter((val: LoadingJob) => val.state === 'loading').length;
  let skippedTasksCount = props.state.filter((val: LoadingJob) => val.state === 'skipped').length;
  let successTasksCount = props.state.filter((val: LoadingJob) => val.state === 'success').length;

  const jobz = (jobCount: number) => `${jobCount} ${jobCount === 1 ? 'job' : 'jobs'}`;

  // Hidden: Job status summary (success/failed/skipped counts)
  // const skippedInfo = skippedTasksCount > 0 ? (<span className="skipped">{jobz(skippedTasksCount)} skipped </span>) : null;
  // const successInfo = successTasksCount > 0 ? (<span className="success">{jobz(successTasksCount)} successful </span>) : null;
  // const failedInfo = failedTasksCount > 0 ? (<span className="error">{jobz(failedTasksCount)} failed </span>) : null;

  if (loadingTasksCount > 0) {
    return (
      <SummaryContainer className="loading-info">
        <b>Chargement {totalJobs - loadingTasksCount} / {totalJobs} Analyses</b>
      </SummaryContainer>
    );
  }

  // Hide job completion summary - just return empty
  return <></>;

  // Old code (hidden):
  // if (failedTasksCount === 0) {
  //   return (
  //     <SummaryContainer className="success-info">
  //       <b>{successTasksCount} Jobs Completed Successfully</b>
  //       {skippedInfo}
  //     </SummaryContainer>
  //   );
  // }

  // return (
  //   <SummaryContainer className="error-info">
  //     {successInfo}
  //     {skippedInfo}
  //     {failedInfo}
  //   </SummaryContainer>
  // );
};

const ProgressLoader = (props: { loadStatus: LoadingJob[], showModal: (err: ReactNode) => void, showJobDocs: (job: string) => void }): JSX.Element => {
  const [hideLoader, setHideLoader] = useState<boolean>(false);
  const loadStatus = props.loadStatus;
  const percentages = calculateLoadingStatePercentages(loadStatus);
  const userRole = getUserRole(); // Get current user role
  const isDPD = userRole === 'DPD';

  const totalJobs = loadStatus.length; // Use actual number of jobs being run
  const loadingTasksCount = totalJobs - loadStatus.filter((val: LoadingJob) => val.state === 'loading').length;
  const isDone = loadingTasksCount >= totalJobs;

  const makeBarColor = (colorCode: string): [string, string] => {
    const amount = 10;
    const darkerColorCode = '#' + colorCode.replace(/^#/, '').replace(
      /../g,
      colorCode => ('0' + Math.min(255, Math.max(0, parseInt(colorCode, 16) - amount)).toString(16)).slice(-2),
    );
    return [colorCode, darkerColorCode];
  };

  const barColors: Record<LoadingState | string, [string, string]> = {
    'success': isDone ? makeBarColor(colors.primary) : makeBarColor(colors.success),
    'loading': makeBarColor(colors.info),
    'error': makeBarColor(colors.danger),
    'timed-out': makeBarColor(colors.warning),
    'skipped': makeBarColor(colors.neutral),
  };

  const showErrorModal = (name: string, state: LoadingState, timeTaken: number | undefined, error: string, isInfo?: boolean) => {
    const errorContent = (
      <ErrorModalContent>
        <Heading as="h3">Error Details for {name}</Heading>
        <p>
          The {name} job failed with an {state} state after {timeTaken} ms.
          The server responded with the following error:
        </p>
        { /* If isInfo == true, then add .info className to pre */}
        <pre className={isInfo ? 'info' : 'error'}>{error}</pre>
      </ErrorModalContent>
    );
    props.showModal(errorContent);
  };

  return (
    <>
      <ReShowContainer className={!hideLoader ? 'hidden' : ''}>
        <DismissButton onClick={() => setHideLoader(false)}>Show Load State</DismissButton>
      </ReShowContainer>
      <LoadCard className={hideLoader ? 'hidden' : ''}>
        <ProgressBarContainer>
          {Object.keys(percentages).map((state: string | LoadingState) =>
            <ProgressBarSegment
              color={barColors[state][0]}
              color2={barColors[state][1]}
              title={`${state} (${Math.round(percentages[state])}%)`}
              width={percentages[state]}
              key={`progress-bar-${state}`}
            />
          )}
        </ProgressBarContainer>

        <StatusInfoWrapper>
          <SummaryText state={loadStatus} count={loadStatus.length} />
          <RunningText state={loadStatus} count={loadStatus.length} />
        </StatusInfoWrapper>

        {!isDPD && (
          <Details>
            <summary>Afficher les Détails</summary>
            <ul>
              {loadStatus.map((job: LoadingJob) => (
                <JobListItem key={job.name} job={job} showJobDocs={props.showJobDocs} showErrorModal={showErrorModal} barColors={barColors} />
              ))}
            </ul>
            {loadStatus.filter((val: LoadingJob) => val.state === 'error').length > 0 &&
              <p className="error">
                <b>Vérifiez la console du navigateur pour les logs et plus d'informations</b><br />
                Il est normal que certains jobs échouent, soit parce que l'hôte ne retourne pas les informations requises,
                ou en raison de restrictions dans la fonction lambda, ou en atteignant une limite d'API.
              </p>}
            <AboutPageLink href="/wiki" target="_blank" rel="noopener noreferrer" >En savoir plus sur l'Outil d'Audit de Conformité</AboutPageLink>
          </Details>
        )}
        <DismissButton onClick={() => setHideLoader(true)}>Masquer</DismissButton>
      </LoadCard>
    </>
  );
}



export default ProgressLoader;
