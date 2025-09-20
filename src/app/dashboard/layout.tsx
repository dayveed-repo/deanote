import DashboardNavbar from "../components/DashboardNavbar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      <DashboardNavbar />
      {children}
    </div>
  );
}
