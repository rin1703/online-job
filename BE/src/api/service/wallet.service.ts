import { WalletModel } from "../models/wallet.model";
import { WalletTransactionModel } from "../models/walletTransaction.model";
// Using 'any' for DTOs here to simplify type resolution at runtime

export const getMyWalletBalanceService = async (recruiterId: string) => {
  const wallet = await WalletModel.findOne({ recruiterId });

  if (!wallet) {
    return {
      exists: false,
      balance: 0,
    };
  }

  return {
    exists: true,
    balance: wallet.balance,
  };
};

export const addCreditService = async (recruiterId: string, dto: any) => {
  let wallet = await WalletModel.findOne({ recruiterId });

  if (!wallet) {
    wallet = await WalletModel.create({ recruiterId, balance: 0 });
  }

  wallet.balance += dto.amount;
  await wallet.save();

  await WalletTransactionModel.create({
    walletId: wallet._id,
    type: "credit",
    amount: dto.amount,
    reference: dto.reference,
    description: dto.description || "Refund credited to wallet",
  });

  return { balance: wallet.balance };
};

export const deductCreditService = async (recruiterId: string, dto: any) => {
  const wallet = await WalletModel.findOne({ recruiterId });
  if (!wallet) throw new Error("Wallet not found");

  const { amount, reference, description, subscriptionId } = dto;

  if (wallet.balance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  wallet.balance -= amount;
  await wallet.save();

  await WalletTransactionModel.create({
    walletId: wallet._id,
    type: "debit",
    amount,
    reference: reference || null,
    subscriptionId: subscriptionId || null,
    description: description || "Payment using wallet credit",
  });

  return {
    balance: wallet.balance,
  };
};
