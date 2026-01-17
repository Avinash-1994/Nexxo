
            import React, { useState } from 'react';
            export const Comp1 = () => {
                const [v] = useState(1);
                return <div className="c-1">Component 1 - {v}</div>;
            }
        