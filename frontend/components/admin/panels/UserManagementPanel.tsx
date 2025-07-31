// frontend/components/admin/panels/UserManagementPanel.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import Spinner from "../../shared/Spinner";
import { 
  UserIcon, 
  PencilIcon, 
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/react/24/outline";

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
}

export default function UserManagementPanel({ users }: UserManagementPanelProps) {
  const { t } = useTranslation("common");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "pro" | "business" | "enterprise">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  
  // Filtrar usuarios basado en los criterios
  useEffect(() => {
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }

    const filtered = users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesPlan = planFilter === "all" || (user.plan || 'free') === planFilter;
      const matchesStatus = statusFilter === "all" || (user.status || 'active') === statusFilter;
      return matchesSearch && matchesRole && matchesPlan && matchesStatus;
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, planFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-600">{error}</p>
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("user")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("role")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("plan")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("status")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <>
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "admin" 
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.plan === "enterprise" ? "bg-purple-100 text-purple-800" :
                        user.plan === "business" ? "bg-blue-100 text-blue-800" :
                        user.plan === "pro" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {user.plan || 'free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => {
                          // Lógica para editar usuario
                        }}
                        aria-label={t("edit")}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => {
                          // Lógica para eliminar usuario
                        }}
                        aria-label={t("delete")}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="ml-3 text-gray-600 hover:text-gray-900"
                        onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                        aria-label={expandedUser === user.id 
                          ? t("collapse_details") 
                          : t("expand_details")}
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
                              {t("created")}: {user.created_at ? new Date(user.created_at).toLocaleDateString() : t("unknown")}
                            </p>
                            <p className="text-sm text-gray-500">
                              {t("last_login")}: {user.last_login ? new Date(user.last_login).toLocaleString() : t("never")}
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
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              {t("actions")}
                            </h4>
                            <div className="space-y-2">
                              <button className="w-full text-left px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm">
                                {t("reset_password")}
                              </button>
                              <button className="w-full text-left px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm">
                                {t("view_activity")}
                              </button>
                              <button className="w-full text-left px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm">
                                {t("change_plan")}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center">
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
          <PlusIcon className="h-5 w-5 mr-2" />
          {t("add_new_user")}
        </button>
      </div>
    </div>
  );
}