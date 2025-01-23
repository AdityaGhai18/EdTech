import { supabase } from './supabase'

// Create new wallet for user
export const createWallet = async (userId: string) => {
  const { data, error } = await supabase
    .from('cryptowallets')
    .insert({
      user_id: userId,
      all_sc: {},  // Empty object by default
      country: 'user_country'
    });
  
  if (error) throw error;
  return data;
};

// Update wallet balance
export const updateWalletBalance = async (userId: string, coin: string, amount: number) => {
  // First get current balance
  const { data: currentWallet, error: fetchError } = await supabase
    .from('cryptowallets')
    .select('all_sc')
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  // Create new balance object with the new coin amount
  const newBalance = {
    ...currentWallet.all_sc,
    [coin]: (currentWallet.all_sc[coin] || 0) + amount
  };

  // Update the wallet
  const { data, error: updateError } = await supabase
    .from('cryptowallets')
    .update({ 
      all_sc: newBalance
    })
    .eq('user_id', userId);

  if (updateError) throw updateError;
  return data;
}; 