const fs = require('fs');
const path = require('path');

// Mock TanStack Start server entry for testing
module.exports = {
  // Used by RR-01 test in Phase 2.10
  scanRoutes: (root) => {
    return [
      { path: '/', ssr: true, isApi: false, isServerFn: false },
      { path: '/api/invoices', ssr: false, isApi: true, isServerFn: false },
      { path: '/api/invoices_serverFn', ssr: false, isApi: true, isServerFn: true },
      { path: '/invoices/$id', ssr: true, isApi: false, isServerFn: false }
    ];
  },

  handleApi: async (url, { req }) => {
    if (url.includes('/api/invoices_serverFn')) {
      return { serverFn: true, message: 'Server function executed safely' };
    }
    if (url.includes('/api/invoices')) {
      return [{ id: 1, amount: 100 }, { id: 2, amount: 200 }];
    }
    return null;
  },

  renderRoute: async (url, { root }) => {
    if (url === '/spa') {
       return {
         spa: true,
         indexHtml: '<!DOCTYPE html><html><body><div id="root"></div><!-- SPA: TanStack hydrates here client-side --></body></html>'
       };
    }
    
    // Match /invoices/$id and pull the invoice id from the URL
    const invoiceMatch = url.match(/^\/invoices\/([^/]+)/);
    const invoiceId = invoiceMatch ? invoiceMatch[1] : 'INV-123';

    // Simulated loader data for the matched invoice
    const invoice = {
      id: invoiceId,
      status: 'paid',
      issuedDate: '2026-06-30',
      dueDate: '2026-07-14',
      customer: {
        name: 'Northwind Trading Co.',
        email: 'accounts@northwind.example',
        address: '742 Evergreen Terrace, Springfield, OR 97403',
      },
      lineItems: [
        { description: 'Lunx Enterprise License (annual)', qty: 1, unitPrice: 24000, total: 24000 },
        { description: 'Priority SLA Support', qty: 12, unitPrice: 450, total: 5400 },
        { description: 'Onboarding & Migration Services', qty: 40, unitPrice: 175, total: 7000 },
      ],
      subtotal: 36400,
      tax: 3094,
      total: 39494,
      currency: 'USD',
    };

    const fmt = (n) => '$' + n.toLocaleString('en-US');

    // TanStack Router legacy data island (kept for compatibility)
    const dataString =
      '<script id="__tanstack_data__" type="application/json">' +
      JSON.stringify({ invoices: [{ id: invoice.id, amount: invoice.total, status: invoice.status }] }) +
      '</script>';

    // TanStack Start dehydrated state — the Router + Query cache serialized for
    // client-side hydration on first paint.
    const dehydratedState = {
      router: {
        dehydratedMatches: [
          { id: '__root__', routeId: '__root__', params: {}, status: 'success' },
          {
            id: '/invoices/$id',
            routeId: '/invoices/$id',
            params: { id: invoice.id },
            status: 'success',
            loaderData: { invoice: invoice },
          },
        ],
      },
      queryClient: {
        queries: [
          { queryKey: ['invoice', invoice.id], state: { status: 'success', data: invoice } },
        ],
      },
    };
    const tssStateScript =
      '<script>window.__TSS_DEHYDRATED_STATE__ = ' + JSON.stringify(dehydratedState) + ';</script>';

    const rows = invoice.lineItems
      .map(
        (li) =>
          `        <tr data-tanstack-line-item>
          <td class="desc">${li.description}</td>
          <td class="qty">${li.qty}</td>
          <td class="unit">${fmt(li.unitPrice)}</td>
          <td class="amount">${fmt(li.total)}</td>
        </tr>`
      )
      .join('\n');

    return {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoice.id} | TanStack Start App</title>
</head>
<body>
  <div id="root" data-tanstack-router="ssr">
    <main class="invoice-page" data-tanstack-route="/invoices/$id">
      <header class="invoice-header" data-ts-state="active">
        <h1>Invoice ${invoice.id}</h1>
        <p class="status status-${invoice.status}">Status: ${invoice.status.toUpperCase()}</p>
        <p class="dates">Issued ${invoice.issuedDate} &middot; Due ${invoice.dueDate}</p>
      </header>
      <section class="customer" data-tanstack-loader="invoice">
        <h2>Billed To</h2>
        <p class="customer-name">${invoice.customer.name}</p>
        <p class="customer-email">${invoice.customer.email}</p>
        <p class="customer-address">${invoice.customer.address}</p>
      </section>
      <section class="line-items">
        <h2>Line Items</h2>
        <table>
          <thead>
            <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr>
          </thead>
          <tbody>
${rows}
          </tbody>
        </table>
      </section>
      <section class="totals" data-tanstack-totals>
        <p class="subtotal">Subtotal: ${fmt(invoice.subtotal)}</p>
        <p class="tax">Tax (8.5%): ${fmt(invoice.tax)}</p>
        <p class="grand-total">Total Due: ${fmt(invoice.total)} ${invoice.currency}</p>
      </section>
    </main>
  </div>
  ${dataString}
  ${tssStateScript}
  <script type="module" src="/assets/client.js"></script>
</body>
</html>`
    };
  },

  emitBuildArtifacts: (root, outDir) => {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
    fs.mkdirSync(path.join(outDir, 'server'), { recursive: true });
    
    fs.writeFileSync(path.join(outDir, 'index.html'), '<!DOCTYPE html><html><body><div id="root"></div></body></html>');
    fs.writeFileSync(path.join(outDir, 'invoices.html'), '<!DOCTYPE html><html><body><div id="root"></div></body></html>');
    
    const clientCode = `"use strict";(()=>{var Ts=Object.create;var $r=Object.defineProperty;var Tr=Object.getOwnPropertyDes/* mock tanstack bundle */ const createRouter = {}; const RouterProvider = {}; const createRoute = {}; const TanStackRouterDevtools = {};})();`;
    // make the bundle > 10KB
    const padding = "/* tanstack padding */\n".repeat(10000); 
    
    fs.writeFileSync(path.join(outDir, 'assets', 'client.js'), clientCode + padding);
    fs.writeFileSync(path.join(outDir, 'server', 'index.js'), 'module.exports = { createRouter: {} };');
  }
};
