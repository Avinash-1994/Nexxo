
            import React, { useState } from 'react';
            export const Comp42 = () => {
                const [v] = useState(42);
                return <div className="c-42">Component 42 - {v}</div>;
            }
        