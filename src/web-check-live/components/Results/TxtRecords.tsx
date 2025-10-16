
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';

const cardStyles = `
grid-column: span 2;
span.val { max-width: 32rem !important; }
span { overflow: hidden; }
`;

const TxtRecordCard = (props: {data: any, title: string, actionButtons: any }): JSX.Element => {
  const records = props.data;
  return (
    <Card heading={props.title} actionButtons={props.actionButtons} styles={cardStyles}>
      { !records && <Row lbl="" val="Aucun enregistrement TXT" />}
      {records && Object.keys(records).map((recordName: any, index: number) => {
        // Handle objects (like {google-site-verification: "..."})
        const value = records[recordName];
        const displayValue = typeof value === 'object' 
          ? JSON.stringify(value) 
          : String(value);
        
        return (
          <Row lbl={recordName} val={displayValue} key={`${recordName}-${index}`} />
        );
      })}
    </Card>
  );
}

export default TxtRecordCard;
