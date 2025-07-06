import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";

interface Notification {
  id: string;
  title: string;
  body?: string;
  created_at: string;
  read: boolean;
}

export default function NotificationsInbox() {
  const [messages, setMessages] = useState<Notification[]>([]);

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

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mt-8">
      <h2 className="text-xl font-semibold mb-4">Notificaciones del sistema</h2>
      {messages.length === 0 ? (
        <p className="text-gray-500">No tienes mensajes</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {messages.map((msg) => (
            <li key={msg.id} className="py-4 flex justify-between items-start">
              <div>
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
                    Marcar leída
                  </button>
                )}
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
