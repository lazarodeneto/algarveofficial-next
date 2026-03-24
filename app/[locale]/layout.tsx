type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}