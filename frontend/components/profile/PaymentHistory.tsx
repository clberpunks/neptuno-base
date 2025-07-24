// frontend/components/profile/PaymentHistory.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { FiCreditCard, FiShield, FiCalendar } from "react-icons/fi";
import ExpandablePanel from "../shared/ExpandablePanel";
import { useTranslation } from "next-i18next";

interface PaymentRecord {
  id: string;
  provider: "stripe" | "paypal";
  provider_charge_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  subscription_plan: string;
}

export default function PaymentHistory() {
  const { t } = useTranslation("common");
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<PaymentRecord[]>("/rest/payments/records")
      .then(setRecords)
      .catch(() => setError(t("error_loading_payment_history")))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <ExpandablePanel
      title={t("payment_history")}
      description={t("all_your_registered_payments")}
      icon={<FiCreditCard />}
      defaultExpanded={false}
      loading={loading}
      error={error || undefined}
    >
      {!records.length && !loading ? (
        <p>{t("no_payments_registered")}</p>
      ) : (
        <ul className="space-y-4">
          {records.map((r) => (
            <li
              key={r.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  {r.provider === "stripe" ? (
                    <FiCreditCard className="text-indigo-600" />
                  ) : (
                    <FiShield className="text-yellow-600" />
                  )}
                  <span className="font-medium capitalize">{r.provider}</span>
                </div>
                <p className="text-sm">{t("id")}: {r.provider_charge_id}</p>
                <p className="text-sm">{t("plan")}: {r.subscription_plan}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {(r.amount / 100).toFixed(2)} {r.currency.toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">{r.status}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <FiCalendar className="mr-1" />
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ExpandablePanel>
  );
}