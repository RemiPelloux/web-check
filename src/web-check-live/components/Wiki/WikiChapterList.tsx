/**
 * WikiChapterList - List of wiki chapters
 * 
 * Container component that renders WikiChapter for each doc
 */

import WikiChapter, { Doc } from './WikiChapter';

// ============================================
// Types
// ============================================

interface WikiChapterListProps {
  docs: Doc[];
  className?: string;
}

// ============================================
// Component
// ============================================

const WikiChapterList = ({ 
  docs, 
  className 
}: WikiChapterListProps): JSX.Element => {
  if (docs.length === 0) {
    return <></>;
  }
  
  return (
    <div className={className}>
      {docs.map((doc, index) => (
        <WikiChapter 
          key={doc.id} 
          doc={doc} 
          index={index}
          showDivider={index > 0}
        />
      ))}
    </div>
  );
};

export default WikiChapterList;
export type { Doc };

