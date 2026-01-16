
            import React, { useState } from 'react';
            export const Comp2 = () => {
                const [v] = useState(2);
                return <div className="c-2">Component 2 - {v}</div>;
            }
        