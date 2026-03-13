type ApiResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type UserProfile = {
  role?: string;
};

type Currency = "USD" | "BTC" | "ETH" | "USDT";

type SendMoneyInput = {
  currency: Currency;
  amount: number;
  recipientEmail?: string;
  recipientId?: string;
  notes?: string;
};

type WithdrawInput = {
  currency: Currency;
  amount: number;
  address?: string;
  notes?: string;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}

export function getDashboardData() {
  return request<Record<string, unknown>>("/api/dashboard/stats");
}

export function getUserProfile() {
  return request<UserProfile>("/api/users/profile");
}

export function sendMoney(payload: SendMoneyInput) {
  return request<Record<string, unknown>>("/api/payments/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function withdraw(payload: WithdrawInput) {
  return request<Record<string, unknown>>("/api/withdrawals/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}