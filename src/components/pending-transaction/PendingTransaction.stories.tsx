import type { Meta, StoryObj } from '@storybook/react';
import { PendingTransaction, TransactionState } from './PendingTransaction';

const meta: Meta<typeof PendingTransaction> = {
  title: 'Components/PendingTransaction',
  component: PendingTransaction,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A component that displays the status of a pending blockchain transaction with visual indicators, animations, and a link to the block explorer.',
      },
    },
  },
  argTypes: {
    state: {
      control: { type: 'select' },
      options: Object.values(TransactionState),
      description: 'The current state of the transaction',
    },
    blockExplorerUrl: {
      control: { type: 'text' },
      description: 'URL to view the transaction on a block explorer',
    },
    transactionHash: {
      control: { type: 'text' },
      description: 'Optional transaction hash to display (truncated)',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS class names to apply to the component',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PendingTransaction>;

// Component Documentation
export const ComponentDocs: Story = {
  render: () => (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h2>Component Documentation</h2>
      
      <h3>Key Props</h3>
      <ul>
        <li><code>state</code> - Transaction state: 'InProgress', 'Completed', 'Failed'</li>
        <li><code>blockExplorerUrl</code> - URL to view transaction (string)</li>
        <li><code>transactionHash</code> - Optional transaction hash (string)</li>
        <li><code>className</code> - Additional CSS classes (string)</li>
      </ul>

      <h3>Usage Examples</h3>
      <pre style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px', overflow: 'auto' }}>
{`// In progress transaction
<PendingTransaction
  state={TransactionState.InProgress}
  blockExplorerUrl="https://etherscan.io/tx/0x123..."
  transactionHash="0x1234567890abcdef..."
/>

// Completed transaction
<PendingTransaction
  state={TransactionState.Completed}
  blockExplorerUrl="https://etherscan.io/tx/0x123..."
/>`}
      </pre>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Documentation for the PendingTransaction component.',
      },
    },
  },
};

// Default story
export const Default: Story = {
  args: {
    state: TransactionState.InProgress,
    blockExplorerUrl: 'https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  },
};

// All states showcase
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
      <div>
        <h3 style={{ marginBottom: '12px', textAlign: 'center' }}>In Progress</h3>
        <PendingTransaction
          state={TransactionState.InProgress}
          blockExplorerUrl="https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
          transactionHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        />
      </div>
      <div>
        <h3 style={{ marginBottom: '12px', textAlign: 'center' }}>Completed</h3>
        <PendingTransaction
          state={TransactionState.Completed}
          blockExplorerUrl="https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
          transactionHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        />
      </div>
      <div>
        <h3 style={{ marginBottom: '12px', textAlign: 'center' }}>Failed</h3>
        <PendingTransaction
          state={TransactionState.Failed}
          blockExplorerUrl="https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
          transactionHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All transaction states: in progress, completed, and failed.',
      },
    },
  },
};