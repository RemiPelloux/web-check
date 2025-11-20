
import { Card } from 'web-check-live/components/Form/Card';
import { ExpandableRow } from 'web-check-live/components/Form/Row';
import Row from 'web-check-live/components/Form/Row';

const LighthouseCard = (props: { data: any, title: string, actionButtons: any }): JSX.Element => {
  const data = props.data;

  // Handle both old (raw) and new (simplified) data formats
  const scores = data?.scores || {};
  const metrics = data?.metrics || {};
  const audits = data?.audits || [];

  // If we have the new format
  if (data?.scores) {
    return (
      <Card heading={props.title} actionButtons={props.actionButtons}>
        {/* Overall Scores */}
        {Object.entries(scores).map(([category, score]) => (
          <Row
            key={category}
            lbl={category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            val={`${score}/100`}
          />
        ))}

        {/* Core Web Vitals */}
        {Object.keys(metrics).length > 0 && (
          <>
            <hr style={{ margin: '1rem 0', opacity: 0.2 }} />
            <h4 style={{ margin: '0.5rem 0', opacity: 0.8 }}>Core Web Vitals</h4>
            {Object.entries(metrics).map(([metric, value]) => (
              <Row
                key={metric}
                lbl={metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                val={String(value)}
              />
            ))}
          </>
        )}

        {/* Failed Audits */}
        {audits.length > 0 && (
          <ExpandableRow
            lbl="Problèmes Détectés"
            val={`${audits.length} issues`}
            rowList={audits.map((audit: any) => ({
              lbl: audit.title,
              val: audit.displayValue || 'Fail',
              title: audit.description,
              key: audit.id
            }))}
          />
        )}
      </Card>
    );
  }

  // Fallback for old format (if any)
  const categories = data?.categories || {};
  const rawAudits = data?.audits || [];

  return (
    <Card heading={props.title} actionButtons={props.actionButtons}>
      {Object.keys(categories).map((title: string, index: number) => {
        const scoreIds = categories[title].auditRefs.map((ref: { id: string }) => ref.id);
        const scoreList = scoreIds.map((id: string) => {
          const audit = rawAudits[id];
          if (!audit) return null;
          return { lbl: audit.title, val: audit.displayValue || (audit.score === 1 ? '✅ Pass' : '❌ Fail'), title: audit.description, key: id }
        }).filter(Boolean);

        return (
          <ExpandableRow
            key={`lighthouse-${index}`}
            lbl={title}
            val={`${Math.round(categories[title].score * 100)}%`}
            rowList={scoreList}
          />
        );
      })}
    </Card>
  );
}

export default LighthouseCard;
