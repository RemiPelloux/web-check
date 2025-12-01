/**
 * RichTextEditor - WYSIWYG editor component
 * 
 * A lightweight rich text editor using contenteditable with a clean toolbar.
 * Supports: Bold, Italic, Underline, Lists, Links, Code blocks
 */

import { useRef, useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';

// ============================================
// Types
// ============================================

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

interface ToolbarButtonProps {
  active?: boolean;
}

// ============================================
// Styled Components
// ============================================

const EditorContainer = styled.div`
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  overflow: hidden;
  background: ${colors.backgroundDarker};
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 12px;
  background: ${colors.backgroundLighter};
  border-bottom: 1px solid ${colors.borderColor};
`;

const ToolbarGroup = styled.div`
  display: flex;
  gap: 2px;
  padding-right: 8px;
  border-right: 1px solid ${colors.borderColor};
  
  &:last-of-type {
    border-right: none;
    padding-right: 0;
  }
`;

const ToolbarButton = styled.button<ToolbarButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: ${props => props.active ? 'rgba(220, 38, 38, 0.15)' : 'transparent'};
  border: 1px solid ${props => props.active ? colors.primary : 'transparent'};
  border-radius: 4px;
  color: ${props => props.active ? colors.primary : colors.textColor};
  cursor: pointer;
  font-size: 14px;
  font-weight: ${props => props.active ? 600 : 400};
  transition: all 0.15s;
  
  &:hover {
    background: rgba(220, 38, 38, 0.1);
    border-color: ${colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ContentArea = styled.div<{ minHeight: string }>`
  min-height: ${props => props.minHeight};
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  color: ${colors.textColor};
  font-size: 14px;
  line-height: 1.7;
  outline: none;
  
  &:empty:before {
    content: attr(data-placeholder);
    color: ${colors.textColorSecondary};
    opacity: 0.6;
    pointer-events: none;
  }
  
  h1, h2, h3, h4 {
    color: ${colors.primary};
    margin: 1rem 0 0.5rem;
    
    &:first-of-type {
      margin-top: 0;
    }
  }
  
  h4 {
    font-size: 1.1rem;
    margin-top: 1.5rem;
  }
  
  p {
    margin: 0 0 1rem;
  }
  
  ul, ol {
    padding-left: 1.5rem;
    margin: 0 0 1rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  a {
    color: ${colors.primary};
    text-decoration: underline;
  }
  
  code {
    background: ${colors.background};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9em;
  }
  
  pre {
    background: ${colors.background};
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    
    code {
      background: none;
      padding: 0;
    }
  }
  
  blockquote {
    border-left: 3px solid ${colors.primary};
    margin: 1rem 0;
    padding-left: 1rem;
    color: ${colors.textColorSecondary};
  }
  
  .info-box {
    background: rgba(220, 38, 38, 0.05);
    border: 1px solid rgba(220, 38, 38, 0.2);
    border-radius: 8px;
    padding: 12px 16px;
    margin: 1rem 0;
  }
`;

// ============================================
// Icons
// ============================================

const BoldIcon = () => <strong>B</strong>;
const ItalicIcon = () => <em style={{ fontStyle: 'italic' }}>I</em>;
const UnderlineIcon = () => <span style={{ textDecoration: 'underline' }}>U</span>;
const ListIcon = () => <span>•</span>;
const OrderedListIcon = () => <span>1.</span>;
const LinkIcon = () => <span>🔗</span>;
const CodeIcon = () => <span>{'</>'}</span>;
const HeadingIcon = () => <span>H</span>;
const QuoteIcon = () => <span>"</span>;

// ============================================
// Component
// ============================================

const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Commencez à écrire...',
  minHeight = '200px',
  disabled = false
}: RichTextEditorProps): JSX.Element => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const lastValueRef = useRef(value);
  const isInitialized = useRef(false);
  
  // Set initial content on mount
  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = value;
      lastValueRef.current = value;
      isInitialized.current = true;
    }
  }, []);
  
  // Only sync content when value changes EXTERNALLY (not from user input)
  useEffect(() => {
    // Skip if change came from user typing
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    
    // Only update if value actually changed from outside
    if (editorRef.current && value !== lastValueRef.current) {
      // Save cursor position
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      
      editorRef.current.innerHTML = value;
      lastValueRef.current = value;
      
      // Restore cursor if possible
      if (range && editorRef.current.contains(range.startContainer)) {
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [value]);
  
  // Handle content change from user input
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      const newValue = editorRef.current.innerHTML;
      lastValueRef.current = newValue;
      onChange(newValue);
    }
  }, [onChange]);
  
  // Execute formatting command
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);
  
  // Format handlers
  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleUnorderedList = () => execCommand('insertUnorderedList');
  const handleOrderedList = () => execCommand('insertOrderedList');
  
  const handleLink = () => {
    const url = prompt('Entrez l\'URL du lien:');
    if (url) {
      execCommand('createLink', url);
    }
  };
  
  const handleCode = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      execCommand('insertHTML', `<code>${selection.toString()}</code>`);
    }
  };
  
  const handleHeading = () => {
    execCommand('formatBlock', 'h4');
  };
  
  const handleQuote = () => {
    execCommand('formatBlock', 'blockquote');
  };
  
  // Prevent default behavior for some key combinations
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      execCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  };
  
  return (
    <EditorContainer>
      <Toolbar>
        <ToolbarGroup>
          <ToolbarButton onClick={handleBold} disabled={disabled} title="Gras (Ctrl+B)">
            <BoldIcon />
          </ToolbarButton>
          <ToolbarButton onClick={handleItalic} disabled={disabled} title="Italique (Ctrl+I)">
            <ItalicIcon />
          </ToolbarButton>
          <ToolbarButton onClick={handleUnderline} disabled={disabled} title="Souligné (Ctrl+U)">
            <UnderlineIcon />
          </ToolbarButton>
        </ToolbarGroup>
        
        <ToolbarGroup>
          <ToolbarButton onClick={handleHeading} disabled={disabled} title="Titre">
            <HeadingIcon />
          </ToolbarButton>
          <ToolbarButton onClick={handleQuote} disabled={disabled} title="Citation">
            <QuoteIcon />
          </ToolbarButton>
        </ToolbarGroup>
        
        <ToolbarGroup>
          <ToolbarButton onClick={handleUnorderedList} disabled={disabled} title="Liste à puces">
            <ListIcon />
          </ToolbarButton>
          <ToolbarButton onClick={handleOrderedList} disabled={disabled} title="Liste numérotée">
            <OrderedListIcon />
          </ToolbarButton>
        </ToolbarGroup>
        
        <ToolbarGroup>
          <ToolbarButton onClick={handleLink} disabled={disabled} title="Insérer un lien">
            <LinkIcon />
          </ToolbarButton>
          <ToolbarButton onClick={handleCode} disabled={disabled} title="Code inline">
            <CodeIcon />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>
      
      <ContentArea
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        minHeight={minHeight}
        suppressContentEditableWarning
      />
    </EditorContainer>
  );
};

export default RichTextEditor;

