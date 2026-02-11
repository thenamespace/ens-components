# Avatar SDK API Reference

Complete type definitions for `@thenamespace/avatar`.

## Exports

```typescript
import {
  // Main factory
  createAvatarClient,
  AvatarClient,

  // Config types
  AvatarSDKConfig,
  WalletProvider,

  // Upload/Delete types
  UploadOptions,
  UploadResult,
  DeleteOptions,
  DeleteResult,

  // SIWE types
  SIWEMessageOptions,
  SIWEMessageResult,
  UploadWithSignatureOptions,
  DeleteWithSignatureOptions,
  NonceRequest,
  NonceResponse,

  // Error handling
  AvatarSDKError,
  ErrorCodes,
  createError,

  // Validation utilities
  validateFile,
  validateSubname,
  validateAddress,
  AVATAR_MAX_SIZE,
  HEADER_MAX_SIZE,
  ALLOWED_FORMATS,

  // SIWE utilities
  generateSIWEMessage,
  createAvatarNonceRequest,
  createHeaderNonceRequest,
  isNonceExpired,
  getDefaultChainId,

  // Wallet adapter
  adaptWallet,
} from '@thenamespace/avatar';
```

## AvatarSDKConfig

Configuration for `createAvatarClient()`:

```typescript
interface AvatarSDKConfig {
  /** API URL for the avatar service endpoint (defaults to production) */
  apiUrl?: string;

  /** Network to use: 'mainnet' or 'sepolia' (defaults to 'mainnet') */
  network?: 'mainnet' | 'sepolia';

  /** Domain of the website integrating this SDK (required for SIWE authentication) */
  domain: string;

  /** Wallet provider for automatic signing - Viem WalletClient, Ethers Wallet/Signer, or WalletProvider */
  provider?: WalletProvider | any;
}
```

## WalletProvider Interface

Custom wallet provider interface:

```typescript
interface WalletProvider {
  /** Get the connected address */
  getAddress(): Promise<string>;

  /** Sign a message */
  signMessage(message: string): Promise<string>;

  /** Get the current chain ID */
  getChainId(): Promise<number>;
}
```

## AvatarClient Interface

```typescript
interface AvatarClient {
  // Automatic flow (requires provider)
  uploadAvatar(options: UploadOptions): Promise<UploadResult>;
  uploadHeader(options: UploadOptions): Promise<UploadResult>;
  deleteAvatar(options: DeleteOptions): Promise<DeleteResult>;
  deleteHeader(options: DeleteOptions): Promise<DeleteResult>;

  // Manual flow (for custom signing)
  getSIWEMessageForAvatar(options: SIWEMessageOptions): Promise<SIWEMessageResult>;
  getSIWEMessageForHeader(options: SIWEMessageOptions): Promise<SIWEMessageResult>;
  uploadAvatarWithSignature(options: UploadWithSignatureOptions): Promise<UploadResult>;
  uploadHeaderWithSignature(options: UploadWithSignatureOptions): Promise<UploadResult>;
  deleteAvatarWithSignature(options: DeleteWithSignatureOptions): Promise<DeleteResult>;
  deleteHeaderWithSignature(options: DeleteWithSignatureOptions): Promise<DeleteResult>;
}
```

## Upload Types

### UploadOptions

```typescript
interface UploadOptions {
  /** ENS subname to upload for (e.g., 'alice.namespace.eth') */
  subname: string;

  /** File to upload - Browser File or Node.js Buffer */
  file: File | Buffer;

  /** Upload progress callback (0-100) */
  onProgress?: (progress: number) => void;
}
```

### UploadResult

```typescript
interface UploadResult {
  /** URL of the uploaded image */
  url: string;

  /** Upload timestamp (ISO 8601) */
  uploadedAt: string;

  /** File size in bytes */
  fileSize: number;

  /** Whether this was an update to existing image */
  isUpdate: boolean;

  /** Whether the upload is pending (for unregistered names) */
  pending?: boolean;

  /** Optional message from the server */
  message?: string;
}
```

## Delete Types

### DeleteOptions

```typescript
interface DeleteOptions {
  /** ENS subname to delete from (e.g., 'alice.namespace.eth') */
  subname: string;
}
```

### DeleteResult

```typescript
interface DeleteResult {
  /** Success message */
  message: string;

  /** Deletion timestamp (ISO 8601) */
  deletedAt: string;
}
```

## SIWE Types

### SIWEMessageOptions

```typescript
interface SIWEMessageOptions {
  /** User's wallet address */
  address: string;

  /** Domain for SIWE (optional if provided during initialization) */
  domain?: string;

  /** Custom URI for SIWE (optional, defaults to https://domain) */
  uri?: string;

  /** Custom chain ID (optional, defaults to 1) */
  chainId?: number;
}
```

### SIWEMessageResult

```typescript
interface SIWEMessageResult {
  /** The SIWE message to sign */
  message: string;

  /** Nonce used in the message */
  nonce: string;

  /** Expiration timestamp (Unix ms) */
  expiresAt: number;
}
```

### UploadWithSignatureOptions

```typescript
interface UploadWithSignatureOptions extends UploadOptions {
  /** SIWE message that was signed */
  message: string;

  /** Signature of the message */
  signature: string;

  /** Address that signed the message */
  address: string;
}
```

### DeleteWithSignatureOptions

```typescript
interface DeleteWithSignatureOptions extends DeleteOptions {
  /** SIWE message that was signed */
  message: string;

  /** Signature of the message */
  signature: string;

  /** Address that signed the message */
  address: string;
}
```

## Nonce Types

### NonceRequest

```typescript
interface NonceRequest {
  /** User's wallet address */
  address: string;

  /** Scope of operations */
  scope: 'avatar' | 'header' | 'avatar+header';
}
```

### NonceResponse

```typescript
interface NonceResponse {
  /** Nonce for signing */
  nonce: string;

  /** Expiration timestamp (Unix ms) */
  expiresAt: number;
}
```

## Error Codes

```typescript
enum ErrorCodes {
  // Authentication errors
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  NOT_SUBNAME_OWNER = 'NOT_SUBNAME_OWNER',
  EXPIRED_NONCE = 'EXPIRED_NONCE',
  MISSING_PROVIDER = 'MISSING_PROVIDER',

  // Validation errors
  INVALID_SUBNAME = 'INVALID_SUBNAME',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',

  // Operation errors
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',

  // Configuration errors
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
}
```

## Constants

```typescript
// Maximum file sizes
const AVATAR_MAX_SIZE: number;  // bytes
const HEADER_MAX_SIZE: number;  // bytes

// Supported image formats
const ALLOWED_FORMATS: string[]; // ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
```

## API Endpoints

| Network | Base URL |
|---------|----------|
| Mainnet | `https://metadata.namespace.ninja` |
| Sepolia | `https://metadata.namespace.ninja` |

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/nonce` | POST | Get SIWE nonce |
| `/profile/{network}/{subname}/avatar` | POST | Upload avatar |
| `/profile/{network}/{subname}/header` | POST | Upload header |
| `/profile/{network}/{subname}/avatar` | DELETE | Delete avatar |
| `/profile/{network}/{subname}/header` | DELETE | Delete header |
