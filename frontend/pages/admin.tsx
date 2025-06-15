// pages/admin-only.tsx
import { withAuth } from "../utils/withAuth";

function AdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Panel de administración</h1>
      <p>Contenido solo visible para administradores.</p>
    </div>
  );
}

export default withAuth(AdminPage, ["admin"]);
