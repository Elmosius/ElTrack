type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='min-h-dvh flex w-full items-center justify-center px-4 py-8'>
      <div className='flex w-full -translate-y-6 justify-center md:-translate-y-8'>{children}</div>
    </div>
  );
}
