import styled from 'styled-components';

const StyledButton = styled.button`
  background-color: #e74c3c;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #c0392b;
  }
`;

export default function StyledComponentsTest() {
    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
            <h3>Styled Components Test</h3>
            <StyledButton>Styled Button (Red)</StyledButton>
        </div>
    );
}
