"use client";

import { useState, useEffect } from "react";
import {
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import {
  rpc,
  TransactionBuilder,
  Networks,
  Address,
  xdr,
  Account,
  Contract,
  TimeoutInfinite,
  nativeToScVal,
} from "@stellar/stellar-sdk";

// ⚠️ PASTE YOUR DEPLOYED CONTRACT ID HERE
const CONTRACT_ID = "CCABVHDIAQM4V4GYG6IOF36A5FKXUVYP7P7BFQXHCECHN673STEKFCHY";
const RPC_URL = "https://soroban-testnet.stellar.org:443";
const NETWORK_PASSPHRASE = Networks.TESTNET;

// Final fail-safe helper to extract values from any ScVal format (hydrated or raw)
const extractScValValue = (val: any): any => {
  if (!val) return null;
  let hydrated = val;
  // If it's a string, hydrate it first
  if (typeof val === 'string') {
    try {
      hydrated = xdr.ScVal.fromXDR(val, 'base64');
    } catch (e) {
      console.warn("XDR parse failed:", e);
      return null;
    }
  }

  // Robust extraction: Check common Soroban types
  try {
    // 1. Try hydrated getters (Stellar SDK pattern)
    if (typeof hydrated.u64 === 'function') return hydrated.u64().toString();
    if (typeof hydrated.i128 === 'function') return hydrated.i128().lo().toString();
    if (typeof hydrated.str === 'function') return hydrated.str().toString();
    if (typeof hydrated.sym === 'function') return hydrated.sym().toString();
    if (typeof hydrated.address === 'function') return hydrated.address().toString();

    // 2. Try raw property access (POJO fallback)
    const raw = hydrated._value || hydrated;
    if (raw.u64) return raw.u64.toString();
    if (raw.i128) return raw.i128.lo.toString();
    if (raw.str) return raw.str.toString();
    if (raw.sym) return raw.sym.toString();
  } catch (e) {
    console.warn("Extraction failed:", e);
  }
  return null;
};

export default function AuctionUI() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isBidding, setIsBidding] = useState<boolean>(false);
  const [status, setStatus] = useState("");
  const [timeLeft, setTimeLeft] = useState<string>("");

  const server = new rpc.Server(RPC_URL);

  // Placeholder for auction data, will be fetched from contract
  const [auctionData, setAuctionData] = useState({
    highestBid: 0,
    endTime: 0,
    userRefund: 0,
  });

  // 1️⃣ CONNECT WALLET FUNCTION
  const connectWallet = async () => {
    try {
      if (await isConnected()) {
        const access = await requestAccess();
        // Fallback for different `@stellar/freighter-api` interface versions
        setWalletAddress(typeof access === 'string' ? access : (access as any).address || access);
      } else {
        alert("Please install the Freighter wallet extension!");
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  // 2️⃣ PLACE BID FUNCTION
  const placeBid = async () => {
    if (!walletAddress || !bidAmount) return;
    setIsBidding(true);

    try {
      // Fetch the bidder's account sequence number
      const account = await server.getAccount(walletAddress);
      
      const contract = new Contract(CONTRACT_ID);
      
      // Convert arguments to XDR ScVal types for Rust
      const bidderScVal = new Address(walletAddress).toScVal();
      const amountScVal = nativeToScVal(Number(bidAmount), { type: "i128" });

      // Build the transaction
      let tx = new TransactionBuilder(account, {
        fee: "100", // Base fee, Soroban requires fee simulation later
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call("bid", bidderScVal, amountScVal))
        .setTimeout(TimeoutInfinite)
        .build();

      // Simulate the transaction to get the actual fee and resource footprint
      const simulatedTx = await server.simulateTransaction(tx);
      if (!simulatedTx || rpc.Api.isSimulationError(simulatedTx)) {
        throw new Error("Transaction simulation failed");
      }

      // Assemble the final transaction with the simulated footprint
      tx = rpc.assembleTransaction(tx, simulatedTx as any).build();

      // Request Freighter to sign it
      const signedResponse = await signTransaction(tx.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE
      });

      // Flexible extraction in case of API variations (string vs object)
      const signedXdr = typeof signedResponse === 'string' ? signedResponse : (signedResponse as any).signed_tx || signedResponse;

      // Submit to the network
      const txToSubmit = TransactionBuilder.fromXDR(signedXdr as string, NETWORK_PASSPHRASE);
      const response = await server.sendTransaction(txToSubmit);

      if (response.status === "PENDING") {
        console.log("Transaction submitted, waiting for confirmation...");
        setBidAmount(""); // Clear input on success
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Failed to place bid. Check console for details.");
    } finally {
      setIsBidding(false);
    }
  };
  // 2.7️⃣ WITHDRAW REFUND FUNCTION
  const withdrawRefund = async () => {
    if (!walletAddress) return;
    setIsBidding(true);
    try {
      const account = await server.getAccount(walletAddress);
      const contract = new Contract(CONTRACT_ID);
      
      const userScVal = new Address(walletAddress).toScVal();

      let tx = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call("withdraw", userScVal))
        .setTimeout(TimeoutInfinite)
        .build();

      const simulatedTx = await server.simulateTransaction(tx);
      tx = rpc.assembleTransaction(tx, simulatedTx as any).build();

      const signedResponse = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
      const signedXdr = typeof signedResponse === 'string' ? signedResponse : (signedResponse as any).signed_tx || signedResponse;
      const response = await server.sendTransaction(TransactionBuilder.fromXDR(signedXdr as string, NETWORK_PASSPHRASE));
      
      if (response.status === "PENDING") {
        alert("Refund withdrawn! Check your wallet in a few seconds.");
      }
    } catch (error) {
      console.error("Withdrawal failed:", error);
      alert("Withdrawal failed. You may not have a pending refund.");
    } finally {
      setIsBidding(false);
    }
  };

  // 2.5️⃣ INITIALIZE AUCTION FUNCTION (ADMIN ONLY)
  const initializeAuction = async () => {
    if (!walletAddress) return;
    setIsBidding(true);
    try {
      const account = await server.getAccount(walletAddress);
      const contract = new Contract(CONTRACT_ID);
      
      const adminScVal = new Address(walletAddress).toScVal();
      const itemScVal = nativeToScVal("EthSpresso Auction Item", { type: "string" });
      const tokenScVal = new Address("CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4").toScVal(); 
      const durationScVal = nativeToScVal(3600 * 24, { type: "u64" }); // 24 hours

      let tx = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call("initialize", adminScVal, itemScVal, tokenScVal, durationScVal))
        .setTimeout(TimeoutInfinite)
        .build();

        const simulatedTx = await server.simulateTransaction(tx);
        if (simulatedTx && rpc.Api.isSimulationSuccess(simulatedTx)) {
          // Extract end time directly using our fail-safe
          const endTime = extractScValValue(simulatedTx.result?.retval);
          if (endTime) {
            setAuctionData(prev => ({ ...prev, endTime: Number(endTime) }));
          }

          // Assemble and submit
          tx = rpc.assembleTransaction(tx, simulatedTx as any).build();
          const signedResponse = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
          const signedXdr = typeof signedResponse === 'string' ? signedResponse : (signedResponse as any).signed_tx || signedResponse;
          const response = await server.sendTransaction(TransactionBuilder.fromXDR(signedXdr as string, NETWORK_PASSPHRASE));
          
          if (response.status === "PENDING") {
            alert("Auction Initialized! Refresh in a few seconds.");
          }
        } else {
             throw new Error("Init simulation failed");
        }
    } catch (error) {
      console.error("Initialization failed:", error);
      alert("Initialization failed. See console.");
    } finally {
      setIsBidding(false);
    }
  };

  // 3️⃣ REAL-TIME EVENT LISTENER (POLLING)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchEvents = async () => {
      try {
        // We look for events emitted by our specific contract
        const latestLedger = await server.getLatestLedger();
        
        const response = await server.getEvents({
          startLedger: latestLedger.sequence - 10, // Check the last 10 ledgers
          filters: [
            {
              type: "contract",
              contractIds: [CONTRACT_ID],
              // Explicitly filter by topics: "Bid"
              topics: [
                [xdr.ScVal.scvSymbol("Bid").toXDR("base64") as any]
              ],
            },
          ],
        });
        // Parse events to find the highest bid
        if (response.events && response.events.length > 0) {
          response.events.forEach((event: any) => {
              try {
                // Fail-safe extraction for event value
                const amount = extractScValValue(event.value);
                if (amount) {
                    setHighestBid(Number(amount));
                    setAuctionData(prev => ({ ...prev, highestBid: Number(amount) }));
                }
             } catch (err) {
                console.error("Error parsing XDR event value:", err);
             }
          });
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    // Placeholder for fetching auction details (e.g., end time)
    const fetchAuctionDetails = async () => {
      try {
        const contract = new Contract(CONTRACT_ID);
        // TransactionBuilder needs an Account object, not just an Address
        // Fallback must be a valid 56-character StrKey with correct checksum
        const validFallback = "GCVAOJMF36XH5D5ZONRFIXOQTLAA7HFI3BWUMBMQKGPEKL2FJIRNFWPO";
        const dummyAccount = new Account(walletAddress || validFallback, "0");
        const getEndTimeOperation = contract.call("get_end_time");
        
        const getEndTimeTx = new TransactionBuilder(dummyAccount, {
          fee: "100",
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addOperation(getEndTimeOperation)
          .setTimeout(TimeoutInfinite)
          .build();

          const simulatedTx = await server.simulateTransaction(getEndTimeTx);
          if (simulatedTx && rpc.Api.isSimulationSuccess(simulatedTx)) {
            const endTime = extractScValValue(simulatedTx.result?.retval);
            if (endTime) {
              setAuctionData(prev => ({ ...prev, endTime: Number(endTime) }));
            }
          }

        // Also fetch user refund if wallet is connected
        if (walletAddress) {
          const userScVal = new Address(walletAddress).toScVal();
          const getRefundTx = new TransactionBuilder(dummyAccount, {
            fee: "100",
            networkPassphrase: NETWORK_PASSPHRASE,
          })
            .addOperation(contract.call("get_refund", userScVal))
            .setTimeout(TimeoutInfinite)
            .build();
          
          const refundSim = await server.simulateTransaction(getRefundTx);
          if (refundSim && rpc.Api.isSimulationSuccess(refundSim)) {
            const refund = extractScValValue(refundSim.result?.retval);
            if (refund !== null) {
              setAuctionData(prev => ({ ...prev, userRefund: Number(refund) }));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching auction details:", error);
      }
    };

    if (CONTRACT_ID) {
      intervalId = setInterval(fetchEvents, 5000);
      // Fetch auction details initially and then periodically if needed
      fetchAuctionDetails();
      const detailsInterval = setInterval(fetchAuctionDetails, 30000); // Update every 30 seconds
      return () => {
        clearInterval(intervalId);
        clearInterval(detailsInterval);
      };
    }
    
    // Countdown timer interval
    const timerId = setInterval(() => {
      if (auctionData.endTime === 0) return;
      
      const now = Math.floor(Date.now() / 1000);
      const remaining = auctionData.endTime - now;
      
      if (remaining <= 0) {
        setTimeLeft("Auction Ended");
        setStatus("ended");
        return;
      }
      
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      setStatus("active");
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(timerId);
    };
  }, [walletAddress, auctionData.endTime]); // Re-run if walletAddress or endTime changes

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-center">EthSpresso Auction</h2>
      
      {!walletAddress ? (
        <button 
          onClick={connectWallet}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Connect Freighter Wallet
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-gray-500 text-sm">Current Highest Bid</p>
            <p className="text-3xl font-bold text-gray-900">
              {auctionData.highestBid} <span className="text-sm font-normal text-gray-500 uppercase">XLM</span>
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-sm font-medium text-blue-600 mb-1 uppercase tracking-wider">Time Remaining</p>
            <p className="text-2xl font-mono font-bold text-blue-800">
              {timeLeft || "Calculating..."}
            </p>
          </div>

          <div className="flex space-x-2">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Bid amount in XLM"
              className="border p-2 rounded w-full text-black"
            />
            <button
              onClick={placeBid}
              disabled={isBidding}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isBidding ? "Bidding..." : "Bid"}
            </button>
          </div>

          {auctionData.userRefund > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
              <p className="text-orange-800 text-sm font-medium mb-2">
                You have a {auctionData.userRefund} XLM refund available!
              </p>
              <button
                onClick={withdrawRefund}
                disabled={isBidding}
                className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {isBidding ? "Withdrawing..." : "Withdraw Refund"}
              </button>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-gray-400 mb-2">Admin Section</p>
            <button
              onClick={initializeAuction}
              disabled={isBidding}
              className="w-full text-xs bg-gray-200 text-gray-600 p-2 rounded hover:bg-gray-300"
            >
              (Re)Initialize Auction (24h)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
