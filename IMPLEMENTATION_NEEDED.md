# EXACT CHANGES NEEDED

## File: src/dev/devServer.ts

### Change 1: After line 178 (after env loading), add:

```typescript
  // OPTIMIZATION: Start server IMMEDIATELY
  let port = cfg.server?.port || cfg.port || 5173;
  const host = cfg.server?.host || 'localhost';
  
  if (!cfg.server?.strictPort) {
    port = await findAvailablePort(port, host);
  }

  // Minimal server setup
  const server = http.createServer(requestHandler);
  const wss = new WebSocketServer({ server });
  
  // START LISTENING NOW
  await new Promise<void>((resolve) => {
    server.listen(port, host, () => {
      log.info(\`✅ Server ready at http://\${host}:\${port}\`, { category: 'server' });
      resolve();
    });
  });

  // Background initialization
  setImmediate(async () => {
    try {
```

### Change 2: After line 361 (after pre-bundling), add:

```typescript
    } catch (error: any) {
      log.warn('Background init failed: ' + error.message);
    }
  });

  // Continue with WebSocket setup...
```

### Change 3: Remove duplicate server.listen() at line 1353

This will achieve <50ms cold start!
