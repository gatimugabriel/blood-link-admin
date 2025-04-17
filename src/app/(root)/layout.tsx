export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav className='bg-gray-50 p-5'>Admin layout</nav>
      {children}
    </div>
  );
}