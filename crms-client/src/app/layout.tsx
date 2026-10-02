import './styles.css';
import Providers from '../redux/providers';
export const metadata = { title: 'CRMS', description: 'Conference Room Reservation System' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
