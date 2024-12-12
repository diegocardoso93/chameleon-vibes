import { AccountId, LedgerId, Transaction } from "@hashgraph/sdk";
import { HashConnect } from "hashconnect";

export let hcInitPromise: Promise<any>;
export let hc: HashConnect;

export function startConnection() {
  const env = "testnet";
  const appMetadata = {
    name: "Chameleon Vibes",
    description: `Unlock an innovative experience of synchronized music and animations of "Vibe Cards" that respond to the rhythm and mood of the music`,
    icons: [window.location.origin + "/favicon.ico"],
    url: window.location.origin,
  };
  const projectId = "bfa190dbe93fcf30377b932b31129d05";

  hc = new HashConnect(
    LedgerId.fromString(env),
    projectId,
    appMetadata,
    true
  );

  hcInitPromise = hc.init()
}

export const getConnectedAccountIds = () => {
  return hc.connectedAccountIds;
};

export const executeTransaction = async (
  accountIdForSigning: AccountId,
  trans: Transaction
) => {
  await hcInitPromise;

  const accountIds = getConnectedAccountIds();
  if (!accountIds) {
    throw new Error("No connected accounts");
  }

  const isAccountIdForSigningPaired = accountIds.some(
    (id) => id.toString() === accountIdForSigning.toString()
  );
  if (!isAccountIdForSigningPaired) {
    throw new Error(`Account ${accountIdForSigning} is not paired`);
  }

  const result = await hc.sendTransaction(accountIdForSigning, trans);
  return result;
};
