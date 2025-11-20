import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import middleware from './_common/middleware.js';

/**
 * Lighthouse / Core Web Vitals Scanner
 * Runs a full Google Lighthouse audit to measure Performance, Accessibility, Best Practices, SEO, and PWA.
 */

const handler = async (url) => {
    try {
        if (!url) {
            return { error: 'URL parameter is required', statusCode: 400 };
        }

        // Ensure URL has protocol
        if (!url.startsWith('http')) {
            url = `https://${url}`;
        }

        const results = await runLighthouse(url);
        return results;
    } catch (error) {
        console.error('Lighthouse error:', error);
        return {
            error: `Failed to run Lighthouse: ${error.message}`,
            statusCode: 500
        };
    }
};

async function runLighthouse(url) {
    let chrome;
    try {
        // Launch Chrome
        chrome = await chromeLauncher.launch({
            chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
        });

        const options = {
            logLevel: 'error',
            output: 'json',
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
            port: chrome.port
        };

        // Run Lighthouse
        const runnerResult = await lighthouse(url, options);
        const report = runnerResult.lhr;

        // Extract key metrics
        const results = {
            url: report.finalUrl,
            timestamp: report.fetchTime,
            scores: {
                performance: Math.round(report.categories.performance.score * 100),
                accessibility: Math.round(report.categories.accessibility.score * 100),
                bestPractices: Math.round(report.categories['best-practices'].score * 100),
                seo: Math.round(report.categories.seo.score * 100)
            },
            metrics: {
                firstContentfulPaint: report.audits['first-contentful-paint'].displayValue,
                largestContentfulPaint: report.audits['largest-contentful-paint'].displayValue,
                totalBlockingTime: report.audits['total-blocking-time'].displayValue,
                cumulativeLayoutShift: report.audits['cumulative-layout-shift'].displayValue,
                speedIndex: report.audits['speed-index'].displayValue,
            },
            audits: []
        };

        // Extract failed audits (score < 1)
        const categories = ['performance', 'accessibility', 'best-practices', 'seo'];

        categories.forEach(catId => {
            const category = report.categories[catId];
            if (!category) return;

            category.auditRefs.forEach(ref => {
                const audit = report.audits[ref.id];
                // If score is not null (informative) and less than 1 (perfect)
                if (audit.score !== null && audit.score < 0.9) {
                    results.audits.push({
                        category: catId,
                        id: audit.id,
                        title: audit.title,
                        description: audit.description,
                        score: audit.score,
                        displayValue: audit.displayValue
                    });
                }
            });
        });

        return results;

    } catch (error) {
        throw error;
    } finally {
        if (chrome) {
            await chrome.kill();
        }
    }
}

export default middleware(handler);
export { handler };
