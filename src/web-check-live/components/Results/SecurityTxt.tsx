
import { Card } from 'web-check-live/components/Form/Card';
import Row, { Details } from 'web-check-live/components/Form/Row';
import colors from 'web-check-live/styles/colors';

const cardStyles = `
small {
  margin-top: 1rem;
  opacity: 0.5;
  display: block;
  a { color: ${colors.primary}; }
}
summary {
  padding: 0.5rem 0 0 0.5rem !important;
  cursor: pointer;
  font-weight: bold;
}
pre {
  background: ${colors.background};
  padding: 0.5rem 0.25rem;
  border-radius: 4px;
  overflow: auto;
}
`;

const getPagePath = (url: string): string => {
  try {
    return new URL(url).pathname;
  } catch (error) {
    return url;
  }
}

const SecurityTxtCard = (props: {data: any, title: string, actionButtons: any, refCode?: string }): JSX.Element => {
  const securityTxt = props.data;
  return (
    <Card heading={props.title} actionButtons={props.actionButtons} styles={cardStyles} refCode={props.refCode}>
      <Row lbl="Présent" val={securityTxt.isPresent ? '✅ Oui' : '❌ Non'} />
      { securityTxt.isPresent && (
        <>
        <Row lbl="Emplacement" val={securityTxt.foundIn} />
        <Row lbl="Signé PGP" val={securityTxt.isPgpSigned ? '✅ Oui' : '❌ Non'} />
        {securityTxt.fields && Object.keys(securityTxt.fields).map((field: string, index: number) => {
          if (securityTxt.fields[field].includes('http')) return (
            <Row lbl="" val="" key={`policy-url-row-${index}`}>
              <span className="lbl">{field}</span>
              <span className="val link-text" style={{userSelect: 'all', cursor: 'text'}}>{getPagePath(securityTxt.fields[field])}</span>
            </Row>
          );
          return (
            <Row lbl={field} val={securityTxt.fields[field]} key={`policy-row-${index}`} />
          );
        })}
        <Details>
          <summary>Voir la politique complète</summary>
          <pre>{securityTxt.content}</pre>
        </Details>
        </>
      )}
      {!securityTxt.isPresent && (<small>
        Un fichier security.txt permet aux chercheurs en sécurité de savoir comment signaler les vulnérabilités de manière sécurisée.
      </small>)}
    </Card>
  );
}

export default SecurityTxtCard;
