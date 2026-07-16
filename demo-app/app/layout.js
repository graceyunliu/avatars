export const metadata = {
  title: "Anmeldung Practice — AI Speaking Coach",
  description: "Practice your Swiss registration appointment in German",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f6f7f9" }}>
        {children}
      </body>
    </html>
  );
}
