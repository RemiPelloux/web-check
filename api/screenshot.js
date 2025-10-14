import middleware from './_common/middleware.js';

const screenshotHandler = async (url) => {
  try {
    if (!url) {
      throw new Error('URL parameter is required');
    }

    // Since screenshot functionality has been removed due to technical issues,
    // we'll return a placeholder response
    return {
      url,
      timestamp: new Date().toISOString(),
      status: 'unavailable',
      message: 'Screenshot functionality temporarily disabled',
      reason: 'Technical limitations with browser automation',
      alternative: 'You can manually visit the URL to view the page',
      suggestion: 'Consider using browser developer tools for visual analysis'
    };

  } catch (error) {
    console.error('Screenshot handler error:', error);
    return {
      error: `Screenshot unavailable: ${error.message}`,
      url,
      status: 'error'
    };
  }
};

export const handler = middleware(screenshotHandler);
export default handler;
