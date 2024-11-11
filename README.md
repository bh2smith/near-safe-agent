# Near Safe Agent

A Next.js project that provides an AI assistant for managing [Safe](https://safe.global) accounts through a plugin interface.

## Getting Started

Run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to access the API.

## Features

This agent provides an OpenAPI interface for managing Safe accounts with the following endpoints:

### Safe Deployment
`GET /api/tools/safe/deploy`

Encodes a null transaction that triggers Safe deployment on a specified chain when executed. Requires:
- `chainId`: The network where the Safe will be deployed

### Recovery Address Management
`GET /api/tools/safe/add_recovery`

Adds a recovery address to an existing Safe using the `addOwnerWithThreshold` function. Requires:
- `chainId`: Network where the Safe exists
- `from`: The Safe address
- `recoveryAddress`: Address to add as recovery

### Response Format

All successful transactions return a standard format:
```typescript
{
  transaction: {
    method: "eth_sendTransaction",
    chainId: number,
    params: [{
      to: string,
      data: string,
      value: string
    }]
  },
  meta: {
    safeUrl: string // URL to view the transaction in Safe UI
  }
}
```

## AI Assistant Integration

The agent includes an AI assistant configured to:
- Help users deploy new Safe accounts
- Guide users through adding recovery addresses
- Generate EVM transactions for Safe operations
- Provide Safe interface URLs for transaction verification

The assistant will proactively ask users if they want to add a recovery address during deployment flows.

## Learn More

- [Safe Documentation](https://docs.safe.global)
- [Safe App Interface](https://app.safe.global)
