
            import React, { useState } from 'react';
            export const Comp64 = () => {
                const [v] = useState(64);
                return <div className="c-64">Component 64 - {v}</div>;
            }
        