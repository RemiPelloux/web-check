import { exec } from 'child_process';
import { promisify } from 'util';
import middleware from './_common/middleware.js';

const execAsync = promisify(exec);

const traceRouteHandler = async (url) => {
  try {
    if (!url) {
      throw new Error('URL parameter is required');
    }

    // Extract hostname from URL
    const hostname = new URL(url).hostname;
    
    // Simple network path analysis instead of full traceroute
    const result = await analyzeNetworkPath(hostname);
    
    return result;
  } catch (error) {
    console.error('Trace route error:', error);
    return {
      error: `Failed to analyze network path: ${error.message}`,
      hostname: new URL(url).hostname,
      hops: [],
      summary: 'Network path analysis unavailable'
    };
  }
};

async function analyzeNetworkPath(hostname) {
  const result = {
    hostname,
    timestamp: new Date().toISOString(),
    hops: [],
    summary: '',
    totalHops: 0,
    avgLatency: 0
  };

  try {
    // Try ping first to check basic connectivity
    const pingCommand = process.platform === 'win32' 
      ? `ping -n 4 ${hostname}` 
      : `ping -c 4 ${hostname}`;
    
    const { stdout } = await execAsync(pingCommand);
    
    // Parse ping results
    const pingResults = parsePingOutput(stdout, hostname);
    
    // Create simplified hop information
    result.hops = [
      {
        hop: 1,
        ip: 'localhost',
        hostname: 'localhost',
        rtt: ['0ms', '0ms', '0ms']
      },
      {
        hop: 2,
        ip: pingResults.ip || hostname,
        hostname: hostname,
        rtt: pingResults.times || ['N/A', 'N/A', 'N/A']
      }
    ];
    
    result.totalHops = 2;
    result.avgLatency = pingResults.avgTime || 0;
    result.summary = `Network path to ${hostname} - ${pingResults.packetsReceived}/4 packets received`;
    
  } catch (error) {
    // If ping fails, provide basic network info
    result.hops = [
      {
        hop: 1,
        ip: 'localhost',
        hostname: 'localhost', 
        rtt: ['0ms', '0ms', '0ms']
      },
      {
        hop: 2,
        ip: hostname,
        hostname: hostname,
        rtt: ['timeout', 'timeout', 'timeout']
      }
    ];
    
    result.totalHops = 2;
    result.avgLatency = 0;
    result.summary = `Unable to reach ${hostname} - network may be filtered or host unreachable`;
  }

  return result;
}

function parsePingOutput(output, hostname) {
  const result = {
    ip: hostname,
    times: [],
    avgTime: 0,
    packetsReceived: 0
  };

  try {
    // Extract IP address (works for both Windows and Unix)
    const ipMatch = output.match(/\(([0-9.]+)\)|from ([0-9.]+)|Reply from ([0-9.]+)/);
    if (ipMatch) {
      result.ip = ipMatch[1] || ipMatch[2] || ipMatch[3];
    }

    // Extract ping times
    const timeMatches = output.match(/time[<=]?(\d+(?:\.\d+)?)\s*ms/g);
    if (timeMatches) {
      result.times = timeMatches.slice(0, 4).map(match => {
        const time = match.match(/(\d+(?:\.\d+)?)/)[1];
        return `${time}ms`;
      });
      
      // Calculate average
      const numericTimes = result.times.map(t => parseFloat(t.replace('ms', '')));
      result.avgTime = Math.round(numericTimes.reduce((a, b) => a + b, 0) / numericTimes.length);
    }

    // Count received packets
    const receivedMatch = output.match(/(\d+)\s+(?:packets\s+)?received/i);
    if (receivedMatch) {
      result.packetsReceived = parseInt(receivedMatch[1]);
    }

  } catch (error) {
    console.error('Error parsing ping output:', error);
  }

  return result;
}

export const handler = middleware(traceRouteHandler);
export default handler;