import { useState } from "react";
import "./index.css"; 
import "./App.css";
import SolanaWallet from "./SolanaWallet";
import EthWallet from "./EthWallet";
import { generateMnemonicAsync, validateMnemonicAsync, wordlists } from "bip39-web";

function App() {
  const [mnemonic, setMnemonic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateMnemonic() {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      setError("");
      
      // Validate entropy strength
      const strength = 128; // 12 words
      const mn = await generateMnemonicAsync(strength);
      
      // Validate the generated mnemonic
      const isValid = await validateMnemonicAsync(mn);
      if (!isValid) {
        throw new Error("Generated mnemonic is invalid");
      }
      
      console.log("Generated mnemonic:", mn);
      setMnemonic(mn);
    } catch (e) {
      console.error("Error generating mnemonic:", e);
      setError(`Failed to generate seed phrase: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  }

  function copyMnemonic() {
    navigator.clipboard.writeText(mnemonic);
    alert("Seed phrase copied to clipboard! Please store it securely.");
  }

  function validateMnemonicWord(word) {
    return wordlists.english.includes(word);
  }

  return (
    <div className="relative min-h-screen">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="nebula"></div>
      <div className="bg-orb orb-purple"></div>
      <div className="bg-orb orb-blue"></div>
      <div className="relative z-10 flex justify-center min-h-screen py-8 px-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 w-full max-w-xl shadow-xl mb-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-white">
            Web-Based Wallet
          </h1>
          
          <div className="mb-4 text-center">
            <p className="text-gray-300 text-sm">
              Generate a secure seed phrase to create your cryptocurrency wallets
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleCreateMnemonic}
            disabled={isGenerating}
            className={`w-full font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 ${
              isGenerating 
                ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white'
            }`}
          >
            {isGenerating ? "Generating..." : "Create Seed Phrase"}
          </button>

          {mnemonic && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl text-white font-semibold">
                  Your Seed Phrase
                </h2>
                <button
                  onClick={copyMnemonic}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Copy All
                </button>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <p className="text-yellow-300 text-xs text-center">
                  ⚠️ Write down this seed phrase and store it securely. Never share it with anyone!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {mnemonic.split(" ").map((word, idx) => {
                  const isValid = validateMnemonicWord(word);
                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg text-center transition-colors duration-200 ${
                        isValid 
                          ? "bg-white/20 text-white" 
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      <span className="text-xs text-gray-400">{idx + 1}.</span> {word}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 space-y-4 text-white">
                <div className="border-t border-white/20 pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-center">Your Wallets</h3>
                  <SolanaWallet mnemonic={mnemonic} />
                  <EthWallet mnemonic={mnemonic} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;