import { useState } from "react";
import { mnemonicToSeedAsync } from "bip39-web";
import { HDNodeWallet, Wallet, formatEther, parseEther } from "ethers";
import { BrowserProvider } from "ethers";

export default function EthWallet({ mnemonic }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wallets, setWallets] = useState([]);
  const [balances, setBalances] = useState({});
  const [showTransaction, setShowTransaction] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    to: "",
    amount: ""
  });
  const [transactionStatus, setTransactionStatus] = useState("");

  async function addEthWallet() {
    try {
      const seed = await mnemonicToSeedAsync(mnemonic);
      const path = `m/44'/60'/${currentIndex}'/0'`;

      const hdNode = HDNodeWallet.fromSeed(seed);
      const child = hdNode.derivePath(path);
      const wallet = new Wallet(child.privateKey);

      const newWallet = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        index: currentIndex
      };

      setWallets((prev) => [...prev, newWallet]);
      setCurrentIndex((prev) => prev + 1);

      // Try to get balance (using Sepolia testnet)
      try {
        const provider = new BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(wallet.address);
        setBalances(prev => ({
          ...prev,
          [wallet.address]: formatEther(balance)
        }));
      } catch (balanceError) {
        console.log("Balance fetch failed, using mock balance:", balanceError.message);
        setBalances(prev => ({
          ...prev,
          [wallet.address]: "0.0000"
        }));
      }
    } catch (error) {
      console.error("Error creating ETH wallet:", error);
    }
  }

  async function sendTransaction() {
    if (!selectedWallet || !transactionForm.to || !transactionForm.amount) {
      setTransactionStatus("Please fill all fields");
      return;
    }

    try {
      setTransactionStatus("Sending transaction...");
      const provider = new BrowserProvider(window.ethereum);
      const wallet = new Wallet(selectedWallet.privateKey, provider);
      
      const tx = await wallet.sendTransaction({
        to: transactionForm.to,
        value: parseEther(transactionForm.amount)
      });
      
      setTransactionStatus(`Transaction sent! Hash: ${tx.hash.slice(0, 10)}...`);
      
      // Reset form
      setTransactionForm({ to: "", amount: "" });
      setShowTransaction(false);
      
      // Update balance
      setTimeout(() => {
        provider.getBalance(selectedWallet.address).then(balance => {
          setBalances(prev => ({
            ...prev,
            [selectedWallet.address]: formatEther(balance)
          }));
        });
      }, 2000);
      
    } catch (error) {
      setTransactionStatus(`Error: ${error.message}`);
    }
  }

  function copyToClipboard(text, type) {
    navigator.clipboard.writeText(text);
    alert(`${type} copied to clipboard!`);
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-4">Ethereum Wallets</h2>
      <button 
        onClick={addEthWallet}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 mb-4"
      >
        Add ETH Wallet
      </button>
      
      <div className="space-y-4">
        {wallets.map((wallet, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-start mb-2">
              <span className="text-white font-semibold">Wallet #{wallet.index + 1}</span>
              <span className="text-green-400 text-sm">{balances[wallet.address] || "0.0000"} ETH</span>
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm truncate flex-1 mr-2">{wallet.address}</span>
                <button 
                  onClick={() => copyToClipboard(wallet.address, "Address")}
                  className="text-blue-400 hover:text-blue-300 text-xs"
                >
                  Copy
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs truncate flex-1 mr-2">Private Key: {wallet.privateKey.slice(0, 10)}...</span>
                <button 
                  onClick={() => copyToClipboard(wallet.privateKey, "Private Key")}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Show
                </button>
              </div>
            </div>
            
            <button
              onClick={() => {
                setSelectedWallet(wallet);
                setShowTransaction(true);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-2 rounded transition-colors duration-200"
            >
              Send Transaction
            </button>
          </div>
        ))}
      </div>

      {showTransaction && selectedWallet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Send ETH</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm">From:</label>
                <div className="text-gray-300 text-sm">{selectedWallet.address}</div>
              </div>
              
              <div>
                <label className="text-white text-sm">To Address:</label>
                <input
                  type="text"
                  value={transactionForm.to}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  placeholder="0x..."
                />
              </div>
              
              <div>
                <label className="text-white text-sm">Amount (ETH):</label>
                <input
                  type="number"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  placeholder="0.01"
                  step="0.001"
                />
              </div>
              
              {transactionStatus && (
                <div className="text-yellow-400 text-sm">{transactionStatus}</div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={sendTransaction}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Send
                </button>
                <button
                  onClick={() => {
                    setShowTransaction(false);
                    setSelectedWallet(null);
                    setTransactionForm({ to: "", amount: "" });
                    setTransactionStatus("");
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}