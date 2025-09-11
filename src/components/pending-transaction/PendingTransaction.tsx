import { Text, Icon } from "../atoms";
import "./PendingTransaction.css";

export enum TransactionState {
  InProgress = "In Progress",
  Completed = "Completed",
  Failed = "Failed",
}

interface PendingTransactionProps {
  state: TransactionState;
  blockExplorerUrl: string;
  transactionHash?: string;
  className?: string;
}

export const PendingTransaction = ({
  state,
  blockExplorerUrl,
  transactionHash,
  className = "",
}: PendingTransactionProps) => {
  const getStatusIcon = () => {
    switch (state) {
      case TransactionState.InProgress:
        return <div className="ns-pending-tx__spinner" />;
      case TransactionState.Completed:
        return <Icon name="check-circle" size={24} />;
      case TransactionState.Failed:
        return <Icon name="x-circle" size={24} />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (state) {
      case TransactionState.InProgress:
        return "Transaction is being executed...";
      case TransactionState.Completed:
        return "Transaction completed successfully!";
      case TransactionState.Failed:
        return "Transaction failed!";
      default:
        return "";
    }
  };

  const getStatusClass = () => {
    switch (state) {
      case TransactionState.InProgress:
        return "ns-pending-tx--in-progress";
      case TransactionState.Completed:
        return "ns-pending-tx--completed";
      case TransactionState.Failed:
        return "ns-pending-tx--failed";
      default:
        return "";
    }
  };

  const getIconClass = () => {
    switch (state) {
      case TransactionState.InProgress:
        return "ns-pending-tx__icon--in-progress";
      case TransactionState.Completed:
        return "ns-pending-tx__icon--completed";
      case TransactionState.Failed:
        return "ns-pending-tx__icon--failed";
      default:
        return "";
    }
  };

  return (
    <div className={`ns-pending-tx ${getStatusClass()} ${className}`}>
      <div className="ns-pending-tx__content">
        <div className={`ns-pending-tx__icon ${getIconClass()}`}>
          {getStatusIcon()}
        </div>
        
        <div className="ns-pending-tx__status">
          <Text>{getStatusMessage()}</Text>
        </div>
        
        {transactionHash && (
          <p className="ns-pending-tx__message">
            Hash: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
          </p>
        )}
        
        <a 
          href={blockExplorerUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="ns-pending-tx__link"
        >
          <Icon name="globe" size={16} className="ns-pending-tx__link-icon" />
          View on Block Explorer
        </a>
      </div>
    </div>
  );
};
