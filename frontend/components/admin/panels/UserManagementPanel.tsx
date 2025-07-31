// frontend/components/admin/panels/UserManagementPanel.tsx
// frontend/components/admin/panels/UserManagementPanel.tsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import Spinner from "../../shared/Spinner";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  EyeIcon,
  ArrowUpOnSquareIcon,
} from "@heroicons/react/24/outline";
import { apiFetch } from "../../../utils/api";
import Modal from "../../Modal";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  created_at: string;
  last_login: string | null;
  status: string;
}

interface UserManagementPanelProps {
  users: User[];
  onUsersChange: (users: User[]) => void;
}

export default function UserManagementPanel({
  users,
  onUsersChange,
}: UserManagementPanelProps) {
  const { t } = useTranslation("common");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [planFilter, setPlanFilter] = useState<
    "all" | "free" | "pro" | "business" | "enterprise"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended"
  >("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    plan: "free",
    status: "active",
  });

  // Filtrar usuarios basado en los criterios
  useEffect(() => {
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }

    const filtered = users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesPlan =
        planFilter === "all" || (user.plan || "free") === planFilter;
      const matchesStatus =
        statusFilter === "all" || (user.status || "active") === statusFilter;
      return matchesSearch && matchesRole && matchesPlan && matchesStatus;
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, planFilter, statusFilter]);

  // Abrir modal de edición
  const handleOpenEditModal = (user: User) => {
    setCurrentUser(user);
    setIsEditModalOpen(true);
  };

  // Cerrar modal de edición
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentUser(null);
  };

  // Guardar cambios del usuario
  const handleSaveUser = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);

      // Preparar datos para enviar
      const updateData: Partial<User> = {};
      
      // Solo enviar campos modificados (comparar con el usuario original)
      const originalUser = users.find(u => u.id === currentUser.id);
      if (!originalUser) return;
      
      if (currentUser.name !== originalUser.name) 
        updateData.name = currentUser.name;
      
      if (currentUser.email !== originalUser.email) 
        updateData.email = currentUser.email;
      
      if (currentUser.role !== originalUser.role) 
        updateData.role = currentUser.role;
      
      if (currentUser.status !== originalUser.status) 
        updateData.status = currentUser.status;
      
      if (currentUser.plan !== originalUser.plan) 
        updateData.plan = currentUser.plan;

      // Si no hay cambios, cerrar el modal
      if (Object.keys(updateData).length === 0) {
        setIsEditModalOpen(false);
        return;
      }

      // Enviar actualización
      const response = await apiFetch<User>(
        `/rest/admin/users/${currentUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      // Actualizar lista de usuarios con la respuesta COMPLETA del servidor
      const updatedUsers = users.map((user) =>
        user.id === currentUser.id ? response : user
      );

      onUsersChange(updatedUsers);
      setSuccess(t("user_updated_success"));
    } catch (err) {
      console.error("Error updating user:", err);
      setError(t("error_updating_user"));
    } finally {
      setLoading(false);
      setIsEditModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Acciones rápidas (cambiar plan, estado, etc.)
  const handleQuickAction = async (
    userId: string,
    updates: { status?: string; plan?: string; role?: string }
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Enviar actualización
      const response = await apiFetch<User>(`/rest/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      // Actualizar lista de usuarios
      const updatedUsers = users.map((user) =>
        user.id === userId ? response : user
      );

      onUsersChange(updatedUsers);
      setSuccess(t("update_success"));
    } catch (err) {
      console.error("Error updating user:", err);
      setError(t("error_updating"));
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t("confirm_delete_user"))) return;

    try {
      setLoading(true);
      setError(null);
      await apiFetch(`/rest/admin/users/${userId}`, {
        method: "DELETE",
      });

      // Actualizar lista de usuarios
      const updatedUsers = users.filter((user) => user.id !== userId);
      onUsersChange(updatedUsers);
      setSuccess(t("user_deleted_success"));

      // Cerrar detalles expandidos si se eliminó el usuario expandido
      if (expandedUser === userId) {
        setExpandedUser(null);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(t("error_deleting_user"));
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Resetear contraseña
  const handleResetPassword = async (userId: string) => {
    if (!confirm(t("confirm_reset_password"))) return;

    try {
      setLoading(true);
      setError(null);
      await apiFetch(`/rest/admin/users/${userId}/reset-password`, {
        method: "POST",
      });
      setSuccess(t("password_reset_success"));
    } catch (err) {
      console.error("Error resetting password:", err);
      setError(t("error_resetting_password"));
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Ver actividad (placeholder)
  const handleViewActivity = (userId: string) => {
    console.log("Ver actividad del usuario:", userId);
    // Implementar navegación a la página de actividad
  };

  // Abrir modal para crear nuevo usuario
  const handleAddNewUser = () => {
    setIsCreateModalOpen(true);
  };

  // Crear nuevo usuario
  const handleCreateUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Enviar solicitud para crear nuevo usuario
      const response = await apiFetch<User>("/rest/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      // Actualizar lista de usuarios
      onUsersChange([...users, response]);
      setSuccess(t("user_created_success"));
      setIsCreateModalOpen(false);
      
      // Resetear formulario
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "user",
        plan: "free",
        status: "active",
      });
    } catch (err) {
      console.error("Error creating user:", err);
      setError(t("error_creating_user"));
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder={t("search") + "..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label={t("search")}
        />

        <select
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          aria-label={t("role")}
        >
          <option value="all">{t("all_roles")}</option>
          <option value="admin">{t("admin")}</option>
          <option value="user">{t("user")}</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value as any)}
          aria-label={t("plan")}
        >
          <option value="all">{t("all_plans")}</option>
          <option value="free">{t("free")}</option>
          <option value="pro">{t("pro")}</option>
          <option value="business">{t("business")}</option>
          <option value="enterprise">{t("enterprise")}</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          aria-label={t("status")}
        >
          <option value="all">{t("all_statuses")}</option>
          <option value="active">{t("active")}</option>
          <option value="suspended">{t("suspended")}</option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">{t("no_users_found")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("user")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("role")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("plan")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("status")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.plan === "enterprise"
                            ? "bg-purple-100 text-purple-800"
                            : user.plan === "business"
                            ? "bg-blue-100 text-blue-800"
                            : user.plan === "pro"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.plan || "free"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status || "active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => handleOpenEditModal(user)}
                        aria-label={t("edit")}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteUser(user.id)}
                        aria-label={t("delete")}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="ml-3 text-gray-600 hover:text-gray-900"
                        onClick={() =>
                          setExpandedUser(
                            expandedUser === user.id ? null : user.id
                          )
                        }
                        aria-label={
                          expandedUser === user.id
                            ? t("collapse_details")
                            : t("expand_details")
                        }
                      >
                        {expandedUser === user.id ? (
                          <ChevronUpIcon className="h-5 w-5" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {expandedUser === user.id && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              {t("user_details")}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {t("created")}:{" "}
                              {user.created_at
                                ? new Date(user.created_at).toLocaleDateString()
                                : t("unknown")}
                            </p>
                            <p className="text-sm text-gray-500">
                              {t("last_login")}:{" "}
                              {user.last_login
                                ? new Date(user.last_login).toLocaleString()
                                : t("never")}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              {t("account_info")}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {t("email")}: {user.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              {t("role")}: {user.role}
                            </p>
                            <p className="text-sm text-gray-500">
                              {t("status")}: {t(user.status)}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              {t("actions")}
                            </h4>
                            <div className="space-y-2">
                              <button
                                onClick={() => handleResetPassword(user.id)}
                                className="flex items-center w-full text-left px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                              >
                                <ArrowPathIcon className="h-4 w-4 mr-2" />
                                {t("reset_password")}
                              </button>
                              <button
                                onClick={() => handleViewActivity(user.id)}
                                className="flex items-center w-full text-left px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                              >
                                <EyeIcon className="h-4 w-4 mr-2" />
                                {t("view_activity")}
                              </button>

                              <button
                                onClick={() => {
                                  const newPlan = prompt(
                                    t("enter_new_plan") +
                                      " (free, pro, business, enterprise)"
                                  );
                                  if (
                                    newPlan &&
                                    [
                                      "free",
                                      "pro",
                                      "business",
                                      "enterprise",
                                    ].includes(newPlan)
                                  ) {
                                    handleQuickAction(user.id, {
                                      plan: newPlan,
                                    });
                                  } else {
                                    alert(t("invalid_plan"));
                                  }
                                }}
                                className="flex items-center w-full text-left px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                              >
                                <ArrowUpOnSquareIcon className="h-4 w-4 mr-2" />
                                {t("change_plan")}
                              </button>
                              {user.status === "active" ? (
                                <button
                                  onClick={() =>
                                    handleQuickAction(user.id, {
                                      status: "suspended",
                                    })
                                  }
                                  className="flex items-center w-full text-left px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                                >
                                  {t("suspend_account")}
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleQuickAction(user.id, {
                                      status: "active",
                                    })
                                  }
                                  className="flex items-center w-full text-left px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                                >
                                  {t("activate_account")}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center">
        <button
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          onClick={handleAddNewUser}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t("add_new_user")}
        </button>
      </div>

      {/* Modal de edición */}
      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal}>
        {currentUser && (
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">
              {t("edit_user")}: {currentUser.name}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("name")}
                </label>
                <input
                  type="text"
                  value={currentUser.name}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("email")}
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  onChange={(e) =>
                    setCurrentUser({
                      ...currentUser,
                      email: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("role")}
                </label>
                <select
                  value={currentUser.role}
                  onChange={(e) =>
                    setCurrentUser({
                      ...currentUser,
                      role: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="admin">{t("admin")}</option>
                  <option value="user">{t("user")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("status")}
                </label>
                <select
                  value={currentUser.status}
                  onChange={(e) =>
                    setCurrentUser({
                      ...currentUser,
                      status: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="active">{t("active")}</option>
                  <option value="suspended">{t("suspended")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("plan")}
                </label>
                <select
                  value={currentUser.plan}
                  onChange={(e) =>
                    setCurrentUser({
                      ...currentUser,
                      plan: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="free">{t("free")}</option>
                  <option value="pro">{t("pro")}</option>
                  <option value="business">{t("business")}</option>
                  <option value="enterprise">{t("enterprise")}</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {t("save_changes")}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de creación de usuario */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">
            {t("add_new_user")}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("name")}
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("email")}
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("password")}
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("role")}
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="admin">{t("admin")}</option>
                <option value="user">{t("user")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("status")}
              </label>
              <select
                value={newUser.status}
                onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="active">{t("active")}</option>
                <option value="suspended">{t("suspended")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("plan")}
              </label>
              <select
                value={newUser.plan}
                onChange={(e) => setNewUser({ ...newUser, plan: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="free">{t("free")}</option>
                <option value="pro">{t("pro")}</option>
                <option value="business">{t("business")}</option>
                <option value="enterprise">{t("enterprise")}</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleCreateUser}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {t("create_user")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}