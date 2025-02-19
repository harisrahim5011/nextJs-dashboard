import { Inter, Roboto, SUSE, Lusitana  } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'] });
export const suse = SUSE({ subsets: ['latin'] });
export const roboto = Roboto({
    subsets: ['latin'],
    weight: '100'
});
export const lusitana = Lusitana({
    weight: ['400', '700'],
    subsets: ['latin'],
  });