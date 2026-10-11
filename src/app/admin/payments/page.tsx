import prisma from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-data";
import { PaymentConfigForm } from "./PaymentConfigForm";

export const dynamic = "force-dynamic";

const DEMO_CONFIGS = [
  { id: "1", gateway: "STRIPE" as const, enabled: true, displayName: "Credit Card · Stripe", currencies: ["USD", "EUR", "GBP"], apiKey: null, secret: null, merchantId: null, terminal: null, secureCode: null, gatewayUrl: null },
  { id: "2", gateway: "PAYPAL" as const, enabled: true, displayName: "PayPal", currencies: ["USD", "EUR", "GBP"], apiKey: null, secret: null, merchantId: null, terminal: null, secureCode: null, gatewayUrl: null },
  { id: "3", gateway: "OCEANPAYMENT" as const, enabled: false, displayName: "Oceanpayment", currencies: ["USD", "EUR"], apiKey: null, secret: null, merchantId: "", terminal: "", secureCode: null, gatewayUrl: "https://secure.oceanpayment.com/gateway/service/pay" },
  { id: "4", gateway: "WINTOPAY" as const, enabled: false, displayName: "Wintopay", currencies: ["USD", "EUR"], apiKey: null, secret: null, merchantId: "", terminal: "", secureCode: null, gatewayUrl: "https://pay.wintopay.com/gateway/pay" }
];

export default async function PaymentsPage() {
  const configs = isDemoMode() ? DEMO_CONFIGS : await prisma.paymentConfig.findMany({ orderBy: { gateway: "asc" } });

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl">Payment Settings</h1>
      <p className="mb-8 text-sm text-ink/78">
        Enable and configure each payment gateway. Credentials are stored server-side only; the storefront
        displays only the methods you enable.
      </p>
      <div className="space-y-6">
        {configs.map((c) => (
          <PaymentConfigForm
            key={c.id}
            config={{
              gateway: c.gateway,
              enabled: c.enabled,
              displayName: c.displayName,
              currencies: c.currencies,
              hasApiKey: !!c.apiKey,
              hasSecret: !!c.secret,
              merchantId: c.merchantId ?? "",
              terminal: c.terminal ?? "",
              hasSecureCode: !!c.secureCode,
              gatewayUrl: c.gatewayUrl ?? ""
            }}
          />
        ))}
      </div>
    </div>
  );
}
