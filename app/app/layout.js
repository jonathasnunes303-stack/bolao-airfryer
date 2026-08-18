import "./globals.css";

export const metadata = {
  title: "Bolão - Quanto tempo a Airfryer vai ficar suja?",
  description: "Bolão de palpites",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
