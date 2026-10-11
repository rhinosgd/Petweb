export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** 将最小货币单位（分）格式化为价格字符串 */
export function formatPrice(amount: number, currency = "USD"): string {
  const value = amount / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

/** 生成订单号 */
export function generateOrderNo(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `PC${ts}${rand}`;
}
