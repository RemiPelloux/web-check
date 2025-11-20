
import styled from '@emotion/styled';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';
import colors from 'web-check-live/styles/colors';

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const FileItem = styled.div<{ severity: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: ${colors.backgroundLighter};
  border-radius: 4px;
  border-left: 4px solid ${props =>
        props.severity === 'Critical' ? colors.danger :
            props.severity === 'High' ? colors.warning :
                props.severity === 'Medium' ? colors.warning : colors.info};
  
  a {
    color: ${colors.primary};
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }

  .badge {
    font-size: 0.8rem;
    padding: 2px 6px;
    border-radius: 4px;
    background: ${colors.background};
    color: ${colors.textColorSecondary};
    border: 1px solid ${colors.borderColor};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${colors.textColorSecondary};
  font-style: italic;
`;

const ExposedFilesCard = (props: { data: any }): JSX.Element => {
    const { data } = props;
    const exposedFiles = data?.exposedFiles || [];
    const scannedCount = data?.scannedCount || 0;

    return (
        <Card heading="Fichiers Exposés" actionButtons={undefined}>
            <Row lbl="Fichiers Scannés" val={scannedCount.toString()} />
            <Row lbl="Fichiers Trouvés" val={exposedFiles.length.toString()} />

            {exposedFiles.length > 0 ? (
                <FileList>
                    {exposedFiles.map((file: any, index: number) => (
                        <FileItem key={index} severity={file.severity}>
                            <div>
                                <strong>{file.file}</strong>
                                <br />
                                <a href={file.url} target="_blank" rel="noopener noreferrer">{file.url}</a>
                            </div>
                            <span className="badge">{file.severity}</span>
                        </FileItem>
                    ))}
                </FileList>
            ) : (
                <EmptyState>
                    ✅ Aucun fichier sensible exposé détecté.
                </EmptyState>
            )}
        </Card>
    );
};

export default ExposedFilesCard;
