"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpinnerButton } from "@/components/SpinnerButton";
import { useToast } from "@/components/toast/ToastProvider";

type Config = {
  gateway: "STRIPE" | "PAYPAL" | "OCEANPAYMENT" | "WINTOPAY";
  enabled: boolean;
  displayName: string;
  currencies: string[];
  hasApiKey: boolean;
  hasSecret: boolean;
  merchantId: string;
  terminal: string;
  hasSecureCode: boolean;
  gatewayUrl: string;
};

const GATEWAY_LABEL: Record<Config["gateway"], string> = {
  STRIPE: "Stripe (Card / Apple Pay / Google Pay)",
  PAYPAL: "PayPal (PayPal account / Card)",
  OCEANPAYMENT: "Oceanpayment (Hosted checkout)",
  WINTOPAY: "Wintopay (Hosted checkout)"
};

export function PaymentConfigForm({ config }: { config: Config }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    enabled: config.enabled,
    displayName: config.displayName,
    currencies: config.currencies.join(","),
    apiKey: "",
    secret: "",
    merchantId: config.merchantId,
    terminal: config.terminal,
    secureCode: "",
    gatewayUrl: config.gatewayUrl
  });
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  async function save() {
    setBusy(true);
    setSuccess(false);
    const payload: Record<string, unknown> = {
      gateway: config.gateway,
      enabled: form.enabled,
      displayName: form.displayName,
      currencies: form.currencies.split(",").map((s) => s.trim()).filter(Boolean),
      merchantId: form.merchantId,
      terminal: form.terminal,
      gatewayUrl: form.gatewayUrl
    };
    // 仅在填写了新密钥时才提交（避免覆盖已存密钥）
    if (form.apiKey) payload.apiKey = form.apiKey;
    if (form.secret) payload.secret = form.secret;
    if (form.secureCode) payload.secureCode = form.secureCode;

    const res = await fetch("/api/payment-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setBusy(false);
    if (res.ok) {
      setSuccess(true);
      toast("Payment settings saved", "success");
    } else {
      toast("Save failed — please try again", "error");
    }
    router.refresh();
  }

  const isStripeOrPaypal = config.gateway === "STRIPE" || config.gateway === "PAYPAL";
  const isHosted = config.gateway === "OCEANPAYMENT" || config.gateway === "WINTOPAY";

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl">{GATEWAY_LABEL[config.gateway]}</h2>
          <div className="text-xs text-ink/65">{config.gateway}</div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          />
          Enabled
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="label">Display name</label>
          <input className="input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        </div>
        <div>
          <label className="label">Supported currencies (comma-separated)</label>
          <input className="input" value={form.currencies} onChange={(e) => setForm({ ...form, currencies: e.target.value })} />
        </div>

        {isStripeOrPaypal && (
          <>
            <div>
              <label className="label">API Key / Client ID {config.hasApiKey && <span className="text-sage">(configured)</span>}</label>
              <input className="input" placeholder="Leave blank to keep unchanged" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} />
            </div>
            <div>
              <label className="label">Secret / Webhook Secret {config.hasSecret && <span className="text-sage">(configured)</span>}</label>
              <input className="input" type="password" placeholder="Leave blank to keep unchanged" value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} />
            </div>
          </>
        )}

        {isHosted && (
          <>
            <div>
              <label className="label">Merchant ID</label>
              <input className="input" value={form.merchantId} onChange={(e) => setForm({ ...form, merchantId: e.target.value })} />
            </div>
            <div>
              <label className="label">Terminal</label>
              <input className="input" value={form.terminal} onChange={(e) => setForm({ ...form, terminal: e.target.value })} />
            </div>
            <div>
              <label className="label">Secure Code {config.hasSecureCode && <span className="text-sage">(configured)</span>}</label>
              <input className="input" type="password" placeholder="Leave blank to keep unchanged" value={form.secureCode} onChange={(e) => setForm({ ...form, secureCode: e.target.value })} />
            </div>
            <div>
              <label className="label">Gateway URL</label>
              <input className="input" value={form.gatewayUrl} onChange={(e) => setForm({ ...form, gatewayUrl: e.target.value })} />
            </div>
          </>
        )}
      </div>

      <div className="mt-5 flex items-center gap-4">
        <SpinnerButton onClick={save} loading={busy} success={success} className="btn-primary">
          {busy ? "Saving…" : "Save"}
        </SpinnerButton>
      </div>
    </div>
  );
}
