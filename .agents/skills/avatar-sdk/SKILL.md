---
name: avatar-sdk
description: Upload, update, and delete ENS avatar and header images with SIWE authentication. Use when working with ENS profile images, avatar uploads, header images, or SIWE-authenticated image management for ENS subnames.
---

# Namespace Avatar SDK

This skill helps you work with the `@thenamespace/avatar` SDK to manage ENS avatar and header images with SIWE (Sign In With Ethereum) authentication.

## Overview

The Avatar SDK enables:
- **Upload avatar images** for ENS subnames
- **Upload header images** for ENS profiles
- **Delete images** with authenticated requests
- **SIWE authentication** with automatic or manual signing flows
- **Progress tracking** for uploads

## Installation

```bash
npm install @thenamespace/avatar viem
```

## Quick Start

```typescript
import { createAvatarClient } from '@thenamespace/avatar';
import { createWalletClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Create wallet client
const account = privateKeyToAccount('0xYOUR_PRIVATE_KEY');
const walletClient = createWalletClient({
  account,
  chain: mainnet,
  transport: http()
});

// Initialize avatar client with automatic signing
const client = createAvatarClient({
  network: 'mainnet', // or 'sepolia'
  domain: 'yourapp.com',
  provider: walletClient
});

// Upload avatar (automatic SIWE flow)
const result = await client.uploadAvatar({
  subname: 'alice.namespace.eth',
  file: avatarFile, // File or Buffer
  onProgress: (progress) => console.log(`Upload: ${progress}%`)
});

console.log(result.url); // URL of uploaded image
```

## Core API

### 1. Upload Avatar

```typescript
const result = await client.uploadAvatar({
  subname: 'alice.namespace.eth',
  file: avatarFile,
  onProgress: (progress) => console.log(`${progress}%`)
});

// Response:
// {
//   url: "https://metadata.namespace.ninja/...",
//   uploadedAt: "2024-01-01T00:00:00Z",
//   fileSize: 102400,
//   isUpdate: false,
//   pending: false,
//   message: "Avatar uploaded successfully"
// }
```

### 2. Upload Header

```typescript
const result = await client.uploadHeader({
  subname: 'alice.namespace.eth',
  file: headerFile,
  onProgress: (progress) => console.log(`${progress}%`)
});
```

### 3. Delete Avatar/Header

```typescript
// Delete avatar
await client.deleteAvatar({ subname: 'alice.namespace.eth' });

// Delete header
await client.deleteHeader({ subname: 'alice.namespace.eth' });

// Response:
// {
//   message: "Avatar deleted successfully",
//   deletedAt: "2024-01-01T00:00:00Z"
// }
```

## Manual Authentication Flow

For custom signing implementations or server-side usage:

```typescript
// 1. Get SIWE message
const siweResult = await client.getSIWEMessageForAvatar({
  address: '0x1234...',
  domain: 'yourapp.com', // Optional if set in config
  chainId: 1 // Optional, defaults to 1
});

console.log(siweResult.message);   // SIWE message to sign
console.log(siweResult.nonce);     // Nonce used
console.log(siweResult.expiresAt); // Expiration timestamp

// 2. Sign message externally
const signature = await yourWallet.signMessage(siweResult.message);

// 3. Upload with pre-signed message
const result = await client.uploadAvatarWithSignature({
  subname: 'alice.namespace.eth',
  file: avatarFile,
  message: siweResult.message,
  signature: signature,
  address: '0x1234...'
});
```

## Wallet Support

The SDK auto-adapts to multiple wallet types:

### Viem WalletClient

```typescript
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: mainnet,
  transport: http()
});

const client = createAvatarClient({
  domain: 'app.com',
  provider: walletClient
});
```

### Ethers.js Wallet

```typescript
import { Wallet } from 'ethers';

const wallet = new Wallet('0xPRIVATE_KEY');

const client = createAvatarClient({
  domain: 'app.com',
  provider: wallet
});
```

### Custom WalletProvider

```typescript
const customProvider = {
  getAddress: async () => '0x...',
  signMessage: async (message: string) => '0xsignature...',
  getChainId: async () => 1
};

const client = createAvatarClient({
  domain: 'app.com',
  provider: customProvider
});
```

## Configuration

```typescript
interface AvatarSDKConfig {
  /** Network: 'mainnet' or 'sepolia' */
  network?: 'mainnet' | 'sepolia';

  /** Your application domain (required for SIWE) */
  domain: string;

  /** Wallet provider for automatic signing */
  provider?: WalletProvider | any;

  /** Custom API URL (optional) */
  apiUrl?: string;
}
```

## File Constraints

| Type | Max Size | Formats |
|------|----------|---------|
| Avatar | `AVATAR_MAX_SIZE` | JPEG, PNG, GIF, WebP |
| Header | `HEADER_MAX_SIZE` | JPEG, PNG, GIF, WebP |

```typescript
import { AVATAR_MAX_SIZE, HEADER_MAX_SIZE, ALLOWED_FORMATS } from '@thenamespace/avatar';
```

## Error Handling

```typescript
import { AvatarSDKError, ErrorCodes } from '@thenamespace/avatar';

try {
  await client.uploadAvatar({ subname, file });
} catch (error) {
  if (error instanceof AvatarSDKError) {
    switch (error.code) {
      case ErrorCodes.INVALID_SIGNATURE:
        console.error('Signature verification failed');
        break;
      case ErrorCodes.NOT_SUBNAME_OWNER:
        console.error('You do not own this subname');
        break;
      case ErrorCodes.EXPIRED_NONCE:
        console.error('SIWE message expired, retry');
        break;
      case ErrorCodes.UPLOAD_FAILED:
        console.error('Upload failed:', error.message);
        break;
      case ErrorCodes.FILE_TOO_LARGE:
        console.error('File exceeds size limit');
        break;
      case ErrorCodes.INVALID_FILE_TYPE:
        console.error('Unsupported file format');
        break;
    }
  }
}
```

## Complete Examples

For full working examples, see [examples.md](examples.md).

## API Reference

For detailed type definitions, see [reference.md](reference.md).
