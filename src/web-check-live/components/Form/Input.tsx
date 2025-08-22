import { type InputHTMLAttributes } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { type InputSize, applySize } from 'web-check-live/styles/dimensions';

type Orientation = 'horizontal' | 'vertical';

interface Props {
  id: string,
  value: string,
  name?: string,
  label?: string,
  placeholder?: string,
  disabled?: boolean,
  size?: InputSize,
  orientation?: Orientation;
  handleChange: (nweVal: React.ChangeEvent<HTMLInputElement>) => void,
  handleKeyDown?: (keyEvent: React.KeyboardEvent<HTMLInputElement>) => void,
};

type SupportedElements = HTMLInputElement | HTMLLabelElement | HTMLDivElement;
interface StyledInputTypes extends InputHTMLAttributes<SupportedElements> {
  inputSize?: InputSize;
  orientation?: Orientation;
};

const InputContainer = styled.div<StyledInputTypes>`
  display: flex;
  ${props => props.orientation === 'vertical' ? 'flex-direction: column;' : ''};
`;

const StyledInput = styled.input<StyledInputTypes>`
  background: ${colors.backgroundLighter};
  color: ${colors.textColor};
  border: 1px solid ${colors.borderColor};
  border-radius: 6px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${colors.primaryTransparent};
  }
  &:hover {
    border-color: ${colors.textColorThirdly};
  }
  &::placeholder {
    color: ${colors.textColorThirdly};
  }

  ${props => applySize(props.inputSize)};
`;

const StyledLabel = styled.label<StyledInputTypes>`
  color: ${colors.textColor};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 6px;
  ${props => applySize(props.inputSize)};
  padding: 0;
`;

const Input = (inputProps: Props): JSX.Element => {

  const { id, value, label, placeholder, name, disabled, size, orientation, handleChange, handleKeyDown } = inputProps;

  return (
  <InputContainer orientation={orientation}>
    { label && <StyledLabel htmlFor={id} inputSize={size}>{ label }</StyledLabel> }
    <StyledInput
      id={id}
      value={value}
      placeholder={placeholder}
      name={name}
      disabled={disabled}
      onChange={handleChange}
      inputSize={size}
      onKeyDown={handleKeyDown || (() => {})}
    />
  </InputContainer>
  );
};

export default Input;
