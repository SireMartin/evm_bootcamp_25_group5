interface MintResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export async function requestMint(address: string, amount: number): Promise<MintResponse> {
  try {
    const response = await fetch("/api/mint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-secret": process.env.NEXT_PUBLIC_API_SECRET || "",
      },
      body: JSON.stringify({
        address,
        amount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to mint tokens");
    }

    return data;
  } catch (error) {
    console.error("Error minting tokens:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mint tokens",
    };
  }
} 