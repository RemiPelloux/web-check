/**
 * WikiChapter - Single wiki chapter display
 * 
 * Renders a chapter with title, screenshot, description, use case, and resources.
 * Uses PluginDocRenderer for consistent documentation rendering across the app.
 */

import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import PluginDocRenderer from 'web-check-live/components/misc/PluginDocRenderer';

// ============================================
// Types
// ============================================

interface Resource {
  title: string;
  link: string;
}

export interface Doc {
  id: string;
  title: string;
  description: string;
  use: string;
  resources: (string | Resource)[];
  screenshot?: string;
}

interface WikiChapterProps {
  doc: Doc;
  index: number;
  showDivider?: boolean;
}

// ============================================
// Styled Components
// ============================================

const ChapterSection = styled.section`
  margin-bottom: 24px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px dashed ${colors.primary};
  margin: 24px auto;
`;

// ============================================
// Helpers
// ============================================

const normalizeResources = (resources: (string | Resource)[]): Resource[] => {
  return resources.map(r => {
    if (typeof r === 'string') {
      return { title: r, link: r };
  }
    return r;
  });
};

// ============================================
// Component
// ============================================

const WikiChapter = ({ 
  doc, 
  index, 
  showDivider = true 
}: WikiChapterProps): JSX.Element => {
  return (
    <ChapterSection>
      {showDivider && index > 0 && <Divider />}
      
      <PluginDocRenderer
        doc={{
          id: doc.id,
          title: doc.title,
          description: doc.description,
          use_case: doc.use,
          resources: normalizeResources(doc.resources),
          screenshot_url: doc.screenshot
        }}
        showScreenshot={true}
        screenshotIndex={index}
      />
    </ChapterSection>
  );
};

export default WikiChapter;
