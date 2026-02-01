# 🧪 Wallet Testing Guide - CryptoRecover Dashboard

## Overview
This guide explains how to test the wallet functionality using MetaMask and test networks (testnets) without spending real money.

## 🎯 What is This?

The wallet page currently shows **demo/test functionality**. To make it fully functional for testing, you can:

1. **Connect your MetaMask wallet**
2. **Switch to a testnet** (Sepolia, Goerli, Mumbai, etc.)
3. **Get free test tokens** from faucets
4. **Test deposits and withdrawals** without real money

## 📋 Prerequisites

### 1. Install MetaMask
- **Browser Extension**: [metamask.io](https://metamask.io/download/)
- Available for Chrome, Firefox, Brave, Edge
- **Mobile App**: Available on iOS and Android

### 2. Create a Wallet
- Open MetaMask
- Click "Create a Wallet"
- **IMPORTANT**: Save your Secret Recovery Phrase securely
- Set a strong password

## 🌐 Testnet Setup

### Recommended Testnets

#### 1. **Sepolia (Ethereum Testnet)** ⭐ Recommended
- **Network Name**: Sepolia test network
- **RPC URL**: `https://rpc.sepolia.org`
- **Chain ID**: `11155111`
- **Currency**: SepoliaETH
- **Explorer**: https://sepolia.etherscan.io/\


s done with the crypto recovery things

#### 2. **Mumbai (Polygon Testnet)**
- **Network Name**: Mumbai
- **RPC URL**: `https://rpc-mumbai.maticvigil.com`
- **Chain ID**: `80001`
- **Currency**: MATIC
- **Explorer**: https://mumbai.polygonscan.com/

#### 3. **BSC Testnet**
- **Network Name**: BSC Testnet
- **RPC URL**: `https://data-seed-prebsc-1-s1.binance.org:8545`
- **Chain ID**: `97`
- **Currency**: tBNB
- **Explorer**: https://testnet.bscscan.com/

### How to Add Testnet to MetaMask

#### Method 1: Automatic (Using Dashboard)
1. Go to Wallets page
2. Click "Connect MetaMask"
3. Click "Switch to Sepolia" button
4. Approve in MetaMask

#### Method 2: Manual
1. Open MetaMask
2. Click network dropdown (top center)
3. Click "Add Network"
4. Click "Add network manually"
5. Enter network details (see above)
6. Click "Save"

## 💰 Getting Test Tokens (Faucets)

### Sepolia ETH Faucets
1. **Chainlink Faucet** (Recommended)
   - URL: https://faucets.chain.link/sepolia
   - Amount: 0.1 SepoliaETH
   - Frequency: Once per 24 hours

2. **Alchemy Faucet**
   - URL: https://sepoliafaucet.com/
   - Amount: 0.5 SepoliaETH
   - Requires: Sign in with Alchemy account

3. **Infura Faucet**
   - URL: https://www.infura.io/faucet/sepolia
   - Amount: 0.5 SepoliaETH
   - Requires: Infura account

### Mumbai MATIC Faucet
- **URL**: https://faucet.polygon.technology/
- Amount: 0.5 MATIC
- Frequency: Once per 24 hours

### BSC Testnet BNB Faucet
- **URL**: https://testnet.bnbchain.org/faucet-smart
- Amount: 0.1 tBNB
- Frequency: Once per 24 hours

## 🚀 Testing Workflow

### Step 1: Connect Wallet
1. Navigate to **Wallets** page in dashboard
2. Click "**Connect MetaMask**" button
3. Approve connection in MetaMask popup
4. Your wallet address will be displayed

### Step 2: Switch to Testnet
1. If you're on mainnet, click "**Switch to Sepolia**"
2. Confirm network switch in MetaMask
3. Badge will show "Sepolia Testnet"

### Step 3: Get Test Tokens
1. Click "**Get Test ETH**" button (opens faucet)
2. Enter your wallet address
3. Complete any verification (if required)
4. Wait for tokens to arrive (1-5 minutes)
5. Check balance in dashboard or MetaMask

### Step 4: Test Deposit
1. Click "**Deposit**" on any wallet
2. Enter amount (e.g., 0.01 ETH)
3. Add wallet address (your MetaMask address)
4. Add notes (optional)
5. Click "**Submit Request**"
6. Admin will approve (for testing, this is instant)

### Step 5: Test Withdrawal
1. Click "**Withdraw**" on a wallet with balance
2. Enter amount
3. Enter destination address
4. Add notes
5. Click "**Submit Request**"
6. Admin approves and processes

## 🔐 Security Tips

### For Testing
- ✅ Use testnets only - never send real crypto to test addresses
- ✅ Keep test wallet separate from main wallet
- ✅ Never share your test wallet's private key
- ✅ Test tokens have NO real value

### For Production
- ⚠️ **NEVER** share your Secret Recovery Phrase
- ⚠️ **NEVER** send real crypto to untested addresses
- ⚠️ Always verify network before transactions
- ⚠️ Double-check recipient addresses
- ⚠️ Start with small test amounts on mainnet

## 📊 Monitoring Test Transactions

### In Dashboard
- View "Recent Requests" section
- Check status: Pending → Completed/Rejected
- See transaction history

### In Block Explorer
1. Get transaction hash from dashboard
2. Visit explorer (e.g., sepolia.etherscan.io)
3. Paste transaction hash
4. View transaction details, confirmations, gas fees

## 🐛 Troubleshooting

### MetaMask Not Detected
- **Solution**: Install MetaMask extension
- **Link**: https://metamask.io/download/
- Refresh page after installation

### Can't Switch Network
- **Solution 1**: Add network manually (see "Manual" method above)
- **Solution 2**: Reset MetaMask settings
- **Solution 3**: Update MetaMask to latest version

### Faucet Not Working
- **Try different faucet** from list above
- **Check cooldown period** (24 hours)
- **Verify wallet address** is correct
- **Try from different IP/device**

### Transaction Stuck
- **Check gas fees** in MetaMask
- **Try increasing gas limit**
- **Wait for network congestion** to clear
- **Cancel and resend** with higher gas

### Balance Not Updating
- **Wait 1-5 minutes** for blockchain confirmation
- **Click "Refresh"** button
- **Check block explorer** to verify transaction
- **Clear browser cache**

## 🎓 Learning Resources

### MetaMask
- Official Guide: https://metamask.io/faqs/
- Video Tutorials: https://www.youtube.com/c/MetaMask

### Ethereum & Testnets
- Ethereum.org: https://ethereum.org/en/developers/docs/
- Testnet Guide: https://ethereum.org/en/developers/docs/networks/

### Web3 Development
- Web3.js Docs: https://web3js.readthedocs.io/
- Ethers.js Docs: https://docs.ethers.org/

## ⚙️ Advanced: Programmatic Testing

### Using Web3.js
```javascript
const Web3 = require('web3');
const web3 = new Web3('https://rpc.sepolia.org');

// Get balance
const balance = await web3.eth.getBalance('YOUR_ADDRESS');
console.log(web3.utils.fromWei(balance, 'ether'));

// Send transaction
const tx = await web3.eth.sendTransaction({
  from: 'YOUR_ADDRESS',
  to: 'RECIPIENT_ADDRESS',
  value: web3.utils.toWei('0.01', 'ether'),
});
```

### Using Ethers.js
```javascript
const { ethers } = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('https://rpc.sepolia.org');

// Get balance
const balance = await provider.getBalance('YOUR_ADDRESS');
console.log(ethers.utils.formatEther(balance));

// Send transaction (requires signer)
const signer = new ethers.Wallet('PRIVATE_KEY', provider);
const tx = await signer.sendTransaction({
  to: 'RECIPIENT_ADDRESS',
  value: ethers.utils.parseEther('0.01'),
});
```

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review error messages carefully
3. Search MetaMask documentation
4. Check testnet status pages
5. Contact development team

## 🎉 Next Steps

Once comfortable with testing:
1. ✅ Test multiple transactions
2. ✅ Try different testnets
3. ✅ Experiment with different amounts
4. ✅ Monitor gas fees and transaction times
5. ✅ Learn about smart contracts
6. ✅ Consider mainnet with small amounts

---

**Remember**: Test tokens have NO real value. This is a safe environment to learn!

🚀 Happy Testing!
