import { Menu } from '@headlessui/react';

export default function HeadlessUITest() {
    return (
        <Menu>
            <Menu.Button style={{ padding: '8px 16px', cursor: 'pointer' }}>
                Headless UI Menu (Click me)
            </Menu.Button>
            <Menu.Items style={{
                position: 'absolute',
                background: 'white',
                border: '1px solid #ddd',
                padding: '0.5rem',
                marginTop: '0.5rem',
                listStyle: 'none'
            }}>
                <Menu.Item>
                    {({ active }) => (
                        <div style={{ background: active ? 'blue' : 'white', color: active ? 'white' : 'black' }}>
                            Item 1
                        </div>
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({ active }) => (
                        <div style={{ background: active ? 'blue' : 'white', color: active ? 'white' : 'black' }}>
                            Item 2
                        </div>
                    )}
                </Menu.Item>
            </Menu.Items>
        </Menu>
    );
}
