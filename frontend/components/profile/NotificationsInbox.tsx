// frontend/components/profile/NotificationsInbox.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { useTranslation } from "next-i18next";
import ExpandablePanel from "../shared/ExpandablePanel";
import { BellIcon } from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  title: string;
  body?: string;
  created_at: string;
  read: boolean;
}

export default function NotificationsInbox({ id }: { id?: string }) {
  const [messages, setMessages] = useState<Notification[]>([]);
  const { t } = useTranslation("common");

  const fetchMessages = async () => {
    const res = await apiFetch<Notification[]>("/rest/user/notifications");
    setMessages(res);
  };

  const markAsRead = async (id: string) => {
    await apiFetch(`/rest/user/notifications/${id}/read`, { method: "POST" });
    fetchMessages();
  };

  const deleteMessage = async (id: string) => {
    await apiFetch(`/rest/user/notifications/${id}`, { method: "DELETE" });
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const unreadCount = messages.filter(msg => !msg.read).length;

  return (
    <ExpandablePanel
      id={id}
      title={t("notifications")}
      icon={<BellIcon className="h-6 w-6" />}
      statusLabel={unreadCount > 0 ? `${unreadCount} ${t("unread")}` : t("all_read")}
      statusColor={unreadCount > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
      defaultExpanded={unreadCount > 0}
    >
      {messages.length === 0 ? (
        <p className="text-gray-500">{t('inbox_empty')}</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {messages.map((msg) => (
            <li key={msg.id} className="py-4 flex justify-between items-start">
              <div className="flex flex-col flex-1">
                <h4 className={`font-semibold ${msg.read ? "text-gray-700" : "text-indigo-600"}`}>
                  {msg.title}
                </h4>
                <p className="text-sm text-gray-600">{msg.body}</p>
                <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</span>
              </div>
              <div className="flex gap-2 ml-4">
                {!msg.read && (
                  <button
                    onClick={() => markAsRead(msg.id)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {t("mark_as_read")}
                  </button>
                )}
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  {t("delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ExpandablePanel>
  );
}