import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, Button, Input, Dropdown, SelectRecordsForm } from '../src';

function TestApp() {
  return (
    <div>Hello there

      <SelectRecordsForm/>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
} 