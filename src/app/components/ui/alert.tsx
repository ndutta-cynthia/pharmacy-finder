// src/components/ui/alert.tsx
import React from 'react';

export const Alert: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border border-red-500 bg-red-100 text-red-700 p-4 rounded">
    {children}
  </div>
);

export const AlertTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="font-bold">{children}</h4>
);

export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p>{children}</p>
);
