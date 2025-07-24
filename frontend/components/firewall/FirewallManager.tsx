import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "next-i18next";
import RobotsGenerator from "./RobotsGenerator";
import MetaSEO from "./MetaSEO";
import CompliancePanel from "../compliance/CompliancePanel";
import TermsPanel from "../compliance/TermsPanel";
import ExpandablePanel from "../shared/ExpandablePanel";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import FirewallDashboard from "./FirewallDashboard";

export interface Rule {
  id?: string;
  llm_name: string;
  pattern: string;
  policy: "allow" | "block" | "restricted" | "tariff";
  limit?: number | null;
  fee?: number | null;
}

export default function FirewallManager() {
  const { t } = useTranslation("common");
  const { user, loading } = useAuth();
  const [rules, setRules] = useState<Rule[]>([]);
  const [saving, setSaving] = useState(false);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [robotsExpanded, setRobotsExpanded] = useState(true);
  const [metaExpanded, setMetaExpanded] = useState(true);

  useEffect(() => {
    if (!loading && user && rules.length === 0) {
      apiFetch<Rule[]>("/api/firewall").then(setRules).catch(console.error);
    }
  }, [user, loading, rules.length]);

  const updateRule = (idx: number, updated: Partial<Rule>) => {
    setRules(rules.map((r, i) => (i === idx ? { ...r, ...updated } : r)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanRules = rules.map(
        ({ llm_name, pattern, policy, limit, fee }) => ({
          llm_name,
          pattern,
          policy,
          limit: limit === undefined ? null : limit,
          fee: fee === undefined ? null : fee,
        })
      );

      const response = await fetch("/api/firewall", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanRules),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        await response.json();
      }

      alert(t("rules_updated"));
    } catch (e) {
      console.error("Error saving rules:", e);
      alert(
        `${t("error_saving_rules")}: ${
          e instanceof Error ? e.message : t("unknown_error")
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleExpandRule = (ruleId: string) => {
    setExpandedRule(expandedRule === ruleId ? null : ruleId);
  };

  const blockedCount = rules.filter((r) => r.policy === "block").length;
  const allowedCount = rules.filter((r) => r.policy === "allow").length;
  const restrictedCount = rules.filter((r) => r.policy === "restricted").length;
  const tariffCount = rules.filter((r) => r.policy === "tariff").length;
  const totalTokens = rules
    .filter((r) => r.policy === "restricted" && r.limit)
    .reduce((acc, r) => acc + (r.limit || 0), 0);
  const totalFees = rules
    .filter((r) => r.policy === "tariff" && r.fee)
    .reduce((acc, r) => acc + (r.fee || 0), 0);

  const hasTrackingData = totalTokens > 0;

  return (
    <div className="space-y-6">
      <FirewallDashboard
        rules={rules}
        termsStatus="Active"
        privacyStatus="Active"
        isFirewallActive={!!user?.subscription}
        hasTrackingData={hasTrackingData}
      />
      <ExpandablePanel
        id="firewall-management"
        title={t("firewall_management")}
        description={t("manage_access_rules")}
        icon={<ShieldCheckIcon className="h-6 w-6" />}
        statusLabel={
          rules.length > 0 ? `${rules.length} ${t("rules")}` : t("no_rules")
        }
        statusColor={
          rules.length > 0
            ? "bg-red-100 text-red-800"
            : "bg-gray-100 text-gray-800"
        }
        defaultExpanded={false}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-green-100 to-green-50 border border-green-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center">
                <div className="bg-green-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-green-800">
                    {allowedCount}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {t("allowed")}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center">
                <div className="bg-red-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-red-800">
                    {blockedCount}
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    {t("blocked")}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center">
                <div className="bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-orange-800">
                    {restrictedCount}
                  </div>
                  <div className="text-sm font-medium text-orange-600">
                    {t("restricted")}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center">
                <div className="bg-blue-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-blue-800">
                    {tariffCount}
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {t("tariff")}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center">
                <div className="bg-purple-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-purple-800">
                    {totalTokens.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-purple-600">
                    {t("allowed_tokens")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("bot")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("policy")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("configuration")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("details")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rules.map((r, idx) => {
                  const ruleId = r.id ?? r.llm_name + "-" + idx;
                  return (
                    <>
                      <tr
                        key={ruleId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {r.llm_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-2">
                            {(
                              [
                                "allow",
                                "block",
                                "restricted",
                                "tariff",
                              ] as const
                            ).map((policy) => (
                              <button
                                key={policy}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  r.policy === policy
                                    ? `${
                                        policy === "allow"
                                          ? "bg-green-500"
                                          : policy === "block"
                                          ? "bg-red-500"
                                          : policy === "restricted"
                                          ? "bg-orange-500"
                                          : "bg-blue-500"
                                      } text-white shadow-inner`
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                onClick={() => updateRule(idx, { policy })}
                              >
                                {policy === "allow" && t("allow")}
                                {policy === "block" && t("block")}
                                {policy === "restricted" && t("restricted")}
                                {policy === "tariff" && t("tariff")}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {r.policy === "restricted" && (
                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                min="0"
                                max="10000"
                                step="100"
                                value={r.limit ?? 0}
                                onChange={(e) =>
                                  updateRule(idx, {
                                    limit: parseInt(e.target.value),
                                  })
                                }
                                className="w-48 accent-orange-500"
                              />
                              <input
                                type="number"
                                min="0"
                                max="10000"
                                step="100"
                                value={r.limit ?? 0}
                                onChange={(e) =>
                                  updateRule(idx, {
                                    limit: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-center focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                          )}
                          {r.policy === "tariff" && (
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                  $
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={r.fee ?? 0}
                                  onChange={(e) =>
                                    updateRule(idx, {
                                      fee: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="pl-8 w-32 border border-gray-300 rounded-lg px-3 py-1 text-center focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="0.00"
                                />
                              </div>
                              <span className="text-sm text-gray-600">
                                {t("per_request")}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleExpandRule(ruleId)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label={
                              expandedRule === ruleId
                                ? t("hide_details")
                                : t("show_details")
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-5 w-5 transform transition-transform ${
                                expandedRule === ruleId ? "rotate-180" : ""
                              }`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                      {expandedRule === ruleId && (
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                  {t("rule_details")}
                                </h4>
                                <div className="space-y-1">
                                  <p>
                                    <span className="font-medium">
                                      {t("pattern")}:
                                    </span>{" "}
                                    {r.pattern}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      {t("policy")}:
                                    </span>{" "}
                                    {t(r.policy)}
                                  </p>
                                  {r.policy === "restricted" && (
                                    <p>
                                      <span className="font-medium">
                                        {t("token_limit")}:
                                      </span>{" "}
                                      {r.limit ?? 0}
                                    </p>
                                  )}
                                  {r.policy === "tariff" && (
                                    <p>
                                      <span className="font-medium">
                                        {t("fee")}:
                                      </span>{" "}
                                      ${r.fee?.toFixed(2) ?? "0.00"}{" "}
                                      {t("per_request")}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                  {t("additional_info")}
                                </h4>
                                <p className="text-gray-600">
                                  {t("rule_created")}:{" "}
                                  {new Date().toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {rules.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {t("no_rules_configured")}
              </h3>
              <p className="mt-1 text-gray-500">{t("add_new_rules")}</p>
            </div>
          )}

          <div className="text-right pt-4">
            <button
              className={`bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all duration-300 ${
                saving ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("saving")}
                </span>
              ) : (
                t("save_changes")
              )}
            </button>
          </div>
        </div>
      </ExpandablePanel>

      <h2>{t("legal_notices")}</h2>

      <div id="terms">
        <TermsPanel />
      </div>

      <h3>{t("seo")}</h3>

      <div id="robots-generator">
        <RobotsGenerator rules={rules} />
      </div>

      <div id="meta-seo">
        <MetaSEO rules={rules} />
      </div>

      <h3>{t("server")}</h3>

      <div id="privacy">
        <CompliancePanel />
      </div>
    </div>
  );
}