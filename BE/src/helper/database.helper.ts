import mongoose from "mongoose";

let isReplicaSetCache: boolean | null = null;

/**
 * Checks if the current MongoDB connection is part of a replica set.
 * Caches the result after the first check to avoid redundant DB commands.
 */
export const checkReplicaSet = async (): Promise<boolean> => {
  if (isReplicaSetCache !== null) {
    return isReplicaSetCache;
  }

  try {
    const db = mongoose.connection.db;
    if (!db) {
      return false;
    }

    const helloResult = await db.command({ hello: 1 });
    isReplicaSetCache = !!helloResult.setName;
    return isReplicaSetCache;
  } catch (error) {
    console.warn("⚠️ Failed to detect replica set status, defaulting to standalone (no transactions):", error);
    isReplicaSetCache = false;
    return false;
  }
};
