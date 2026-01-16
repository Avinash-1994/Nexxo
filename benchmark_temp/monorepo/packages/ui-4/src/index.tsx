
import * as React from "react";

export const Button = ({ children }: { children: React.ReactNode }) => {
  return <button style={{ 
    padding: '10px 20px', 
    background: '#333', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '4px' 
  }}>{children}</button>;
};
