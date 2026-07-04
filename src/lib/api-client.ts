export async function fetchClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
  
  // We can retrieve the access token from localStorage or any state manager
  // Since this is a simple client, we will assume localStorage for access token
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken");
  }

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.message || "An error occurred while fetching the data.";
    throw new Error(errorMsg);
  }

  return data.data; // Assumes backend returns { data: ..., meta: ... } in successResponse
}
