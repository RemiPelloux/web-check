import React, { lazy, Suspense } from 'react';
import styled from '@emotion/styled';
// Lazy load JsonView to avoid SSR issues
const LazyJsonView = lazy(() => import('@uiw/react-json-view'));
import colors from 'web-check-live/styles/colors';

const ViewerContainer = styled.div`
  background: ${colors.backgroundDarker};
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  max-height: 70vh;
  overflow: auto;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
  
  /* Custom theme overrides */
  --w-rjv-font-family: 'PT Mono', monospace;
  --w-rjv-background-color: ${colors.backgroundDarker};
  --w-rjv-border-left-color: ${colors.primary};
  --w-rjv-curly-color: ${colors.textColor};
  --w-rjv-bracket-color: ${colors.textColor};
  --w-rjv-arrow-color: ${colors.textColorSecondary};
  --w-rjv-quotes-color: #8be9fd;
  --w-rjv-key-string: #8be9fd;
  --w-rjv-type-string-color: #f1fa8c;
  --w-rjv-type-int-color: #bd93f9;
  --w-rjv-type-float-color: #bd93f9;
  --w-rjv-type-bigint-color: #bd93f9;
  --w-rjv-type-boolean-color: #ff79c6;
  --w-rjv-type-date-color: #50fa7b;
  --w-rjv-type-url-color: #8be9fd;
  --w-rjv-type-null-color: #6272a4;
  --w-rjv-type-nan-color: #ff5555;
  --w-rjv-type-undefined-color: #6272a4;
  
  /* Improve readability */
  .w-rjv-wrap {
    font-size: 0.9rem;
    line-height: 1.6;
  }
  
  /* Better hover states */
  .w-rjv-line:hover {
    background: rgba(255, 255, 255, 0.03);
  }
`;

interface JsonViewerProps {
  data: any;
  initialCollapsed?: number;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data, initialCollapsed = 2 }) => {
  return (
    <ViewerContainer>
      <Suspense fallback={<div>Loading JSON viewer...</div>}>
        <LazyJsonView
          value={data}
          collapsed={initialCollapsed}
          displayDataTypes={false}
          displayObjectSize={true}
          enableClipboard={true}
          style={{
            backgroundColor: 'transparent',
          }}
        />
      </Suspense>
    </ViewerContainer>
  );
};

export default JsonViewer;

