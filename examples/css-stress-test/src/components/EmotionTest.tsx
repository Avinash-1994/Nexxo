/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

const style = css`
  color: hotpink;
  font-weight: bold;
  font-size: 18px;
  &:hover {
    color: darkorchid;
  }
`;

export default function EmotionTest() {
    return (
        <div css={style}>
            This is styled with Emotion (css prop).
        </div>
    );
}
