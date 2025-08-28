import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, Button, Input, Dropdown, SelectRecordsForm } from '../src';
import "../src/styles/theme.css";

function TestApp() {
  return (
    <div>Hello there

      <SelectRecordsForm records={{
        addresses: [],
        texts: []
      }}
        onRecordsUpdated={() => {}}
      />
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
} 