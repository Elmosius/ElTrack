type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='h-screen overflow-hidden flex w-full'>
      <div className='w-full h-full flex items-center justify-center'>{children}</div>
    </div>
  );
}
