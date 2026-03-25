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
  Contract,
  TimeoutInfinite,
  nativeToScVal,
} from "@stellar/stellar-sdk";

// ⚠️ PASTE YOUR DEPLOYED CONTRACT ID HERE
const CONTRACT_ID = "CCABVHDIAQM4V4GYG6IOF36A5FKXUVYP7P7BFQXHCECHN673STEKFCHY";
const RPC_URL = "https://soroban-testnet.stellar.org:443";
const NETWORK_PASSPHRASE = Networks.TESTNET;

export default function AuctionUI() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isBidding, setIsBidding] = useState<boolean>(false);

  const server = new rpc.Server(RPC_URL);

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
             console.log("New Event Detected:", event);
             try {
                // Parse XDR string back into ScVal
                const rawVal = event.value as xdr.ScVal;
                
                // Rust emitted: env.events().publish((symbol_short!("Bid"), bidder), amount);
                // `amount` is returned as the event's `value` containing an `i128` type.
                if (rawVal.switch() === xdr.ScValType.scvI128()) {
                    // Extracting the lo bit natively parses typical XLM numbers successfully in JS safely up to 2^53
                    const parsedAmount = Number(rawVal.i128().lo().toString());
                    setHighestBid(parsedAmount);
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

    // Poll every 5 seconds for new events
    if (CONTRACT_ID) {
      intervalId = setInterval(fetchEvents, 5000);
    }

    return () => clearInterval(intervalId);
  }, []);

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
            <p className="text-3xl font-bold">{highestBid} XLM</p>
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
        </div>
      )}
    </div>
  );
}
