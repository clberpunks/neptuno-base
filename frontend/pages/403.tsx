export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4">403</h1>
        <p className="text-lg text-gray-700 mb-4">
          No tienes permisos para acceder a esta página.
        </p>
      </div>
    </div>
  );
}
