export default function AdminDashboardRedirect() {
  // Server-side redirect avoids any client race with auth scripts
  // and lands on /admin (which uses the (dashboard) layout + sidebar)
  // Using a simple meta refresh to keep it framework-agnostic
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content="0; url=/admin" />
      </head>
      <body></body>
    </html>
  );
}
