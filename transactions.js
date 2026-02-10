import { supabase } from './supabaseClient.js';

export async function sendMoney(senderAcc, receiverAcc, amount) {
  const { data, error } = await supabase.rpc('transfer_amount', {
    sender_acc: senderAcc,
    receiver_acc: receiverAcc,
    transfer_amount: amount,
  });
  return { data, error };
}