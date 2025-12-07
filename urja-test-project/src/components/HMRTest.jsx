import React, { useState } from 'react';

function HMRTest() {
    const [count, setCount] = useState(0);
    const [color, setColor] = useState('#667eea');

    return (
        <div className="test-section">
            <h2>🔥 Hot Module Replacement Test</h2>
            <p>Test HMR by editing this component - your state should be preserved!</p>

            <div className="test-grid">
                <div className="test-card">
                    <h4>State Preservation Test</h4>
                    <p>Current count: <strong>{count}</strong></p>
                    <p>Try editing this component's JSX while the counter is running</p>
                    <button className="test-button" onClick={() => setCount(count + 1)}>
                        Increment Counter
                    </button>
                    <button className="test-button" onClick={() => setCount(0)}>
                        Reset
                    </button>
                </div>

                <div className="test-card">
                    <h4>Style Hot Reload Test</h4>
                    <div
                        style={{
                            width: '100px',
                            height: '100px',
                            background: color,
                            borderRadius: '8px',
                            margin: '1rem 0',
                            transition: 'all 0.3s ease'
                        }}
                    />
                    <p>Current color: {color}</p>
                    <button className="test-button" onClick={() => setColor('#764ba2')}>
                        Purple
                    </button>
                    <button className="test-button" onClick={() => setColor('#667eea')}>
                        Blue
                    </button>
                    <button className="test-button" onClick={() => setColor('#48bb78')}>
                        Green
                    </button>
                </div>
            </div>

            <h3>📝 HMR Test Instructions</h3>
            <div className="code-block">
                {`1. Click "Increment Counter" a few times
2. Edit this component (change text, add elements, etc.)
3. Save the file
4. Check if the counter value is preserved
5. If yes, HMR is working correctly! ✅

Try changing:
- The heading text
- Button labels
- Add new elements
- Modify styles

Your state should persist across all changes!`}
            </div>

            <h3>🎯 What to Test</h3>
            <div className="test-grid">
                <div className="test-card">
                    <h4>✅ Component State</h4>
                    <p>State should be preserved when editing JSX</p>
                </div>
                <div className="test-card">
                    <h4>✅ CSS Changes</h4>
                    <p>Edit App.css and see instant updates</p>
                </div>
                <div className="test-card">
                    <h4>✅ Fast Refresh</h4>
                    <p>React Fast Refresh should handle errors gracefully</p>
                </div>
                <div className="test-card">
                    <h4>✅ No Full Reload</h4>
                    <p>Page should NOT fully reload on changes</p>
                </div>
            </div>
        </div>
    );
}

export default HMRTest;
