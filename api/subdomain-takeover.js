import dns from 'dns';
import util from 'util';
import axios from 'axios';
import middleware from './_common/middleware.js';

/**
 * Subdomain Takeover Scanner
 * Checks if the domain's CNAME record points to an unclaimed third-party service.
 */

const handler = async (url) => {
    try {
        if (!url) {
            return { error: 'URL parameter is required', statusCode: 400 };
        }

        const results = await checkSubdomainTakeover(url);
        return results;
    } catch (error) {
        console.error('Subdomain takeover check error:', error);
        return {
            error: `Failed to check for subdomain takeover: ${error.message}`,
            statusCode: 500
        };
    }
};

// Signatures of common services that allow subdomain takeover
const FINGERPRINTS = [
    {
        service: 'AWS S3',
        cname: ['s3.amazonaws.com', 's3-website'],
        error: ['The specified bucket does not exist', 'NoSuchBucket']
    },
    {
        service: 'GitHub Pages',
        cname: ['github.io'],
        error: ['There isn\'t a GitHub Pages site here']
    },
    {
        service: 'Heroku',
        cname: ['herokuapp.com'],
        error: ['No such app', 'Heroku | Welcome to your new app!']
    },
    {
        service: 'Shopify',
        cname: ['myshopify.com'],
        error: ['Sorry, this shop is currently unavailable']
    },
    {
        service: 'Tumblr',
        cname: ['tumblr.com'],
        error: ['There\'s nothing here.']
    },
    {
        service: 'WordPress.com',
        cname: ['wordpress.com'],
        error: ['Do you want to register']
    },
    {
        service: 'Zendesk',
        cname: ['zendesk.com'],
        error: ['Help Center Closed']
    },
    {
        service: 'Bitbucket',
        cname: ['bitbucket.io'],
        error: ['Repository not found']
    },
    {
        service: 'Ghost',
        cname: ['ghost.io'],
        error: ['The thing you were looking for is no longer here']
    },
    {
        service: 'Cargo',
        cname: ['cargocollective.com'],
        error: ['404 Not Found']
    }
];

async function checkSubdomainTakeover(url) {
    let hostname = url;
    if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
        try {
            hostname = new URL(hostname).hostname;
        } catch (e) {
            // Keep original if URL parsing fails
        }
    }

    const results = {
        hostname,
        timestamp: new Date().toISOString(),
        vulnerable: false,
        cname: null,
        service: null,
        status: 'Safe'
    };

    try {
        // 1. Resolve CNAME
        const resolveCname = util.promisify(dns.resolveCname);
        let cnames = [];

        try {
            cnames = await resolveCname(hostname);
        } catch (e) {
            // No CNAME record found (or other DNS error), likely safe from CNAME-based takeover
            results.status = 'No CNAME record found';
            return results;
        }

        if (!cnames || cnames.length === 0) {
            results.status = 'No CNAME record found';
            return results;
        }

        const targetCname = cnames[0];
        results.cname = targetCname;

        // 2. Check if CNAME matches a known service
        const matchedService = FINGERPRINTS.find(fp =>
            fp.cname.some(domain => targetCname.includes(domain))
        );

        if (!matchedService) {
            results.status = 'CNAME found but service not in fingerprint database';
            return results;
        }

        results.service = matchedService.service;

        // 3. Check if the service returns a "Not Found" error
        // This indicates the resource is unclaimed
        try {
            const response = await axios.get(`http://${hostname}`, {
                timeout: 5000,
                validateStatus: () => true, // Accept any status code
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; WebCheck/1.0)'
                }
            });

            const body = response.data.toString();

            const isVulnerable = matchedService.error.some(signature =>
                body.includes(signature)
            );

            if (isVulnerable) {
                results.vulnerable = true;
                results.status = 'VULNERABLE: Dangling CNAME record detected!';
                results.details = `The domain points to ${matchedService.service} (${targetCname}) but the resource appears to be unclaimed.`;
            } else {
                results.status = 'Safe: Service appears to be claimed';
            }

        } catch (error) {
            // If we can't reach the domain, it might still be vulnerable if DNS resolves
            // but we can't confirm the error message.
            results.status = 'Unknown: Could not fetch content to verify';
        }

    } catch (error) {
        results.error = error.message;
    }

    return results;
}

export default middleware(handler);
export { handler };
