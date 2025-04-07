import { useState, useEffect } from "react";
import { useAccount, useContractRead } from "wagmi";
import { LOTTERY_ABI } from "@/utils/contracts";
import { LOTTERY_ADDRESS } from "@/utils/config";
import { formatEth, getTimeRemaining } from "@/utils/helpers";

export const useLotteryState = () => {
  const { address } = useAccount();
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Read contract state
  const { data: isBetsOpen } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: "betsOpen",
  });

  const { data: betsClosingTime } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: "betsClosingTime",
  });

  const { data: prizePool } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: "prizePool",
  });

  const { data: ownerPool } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: "ownerPool",
  });

  const { data: userPrize } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: "prize",
    args: [address],
    enabled: !!address,
  });

  // Update time remaining every second
  useEffect(() => {
    if (!betsClosingTime) return;

    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(Number(betsClosingTime)));
    }, 1000);

    return () => clearInterval(interval);
  }, [betsClosingTime]);

  return {
    isBetsOpen: isBetsOpen || false,
    betsClosingTime: betsClosingTime ? Number(betsClosingTime) : 0,
    timeRemaining,
    prizePool: prizePool ? formatEth(prizePool) : "0",
    ownerPool: ownerPool ? formatEth(ownerPool) : "0",
    userPrize: userPrize ? formatEth(userPrize) : "0",
  };
}; 