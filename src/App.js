import { useState } from 'react';
import { ethers } from 'ethers';
import Notification from './Notification';
import { MdOutlineGeneratingTokens } from 'react-icons/md';


function App() {

  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(null);
  const [notification, setNotification] = useState({ message: '', show: false });

  const connect = async () => {
    setLoading(true);
    try {
      let provider;
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      const desiredChainId = '0x14A33'; // 0x89 polygon
      if (network.chainId !== parseInt(desiredChainId)) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: desiredChainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: desiredChainId,
                  chainName: 'Base Goerli',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://goerli.base.org'],
                  blockExplorerUrls: ['https://goerli.basescan.org'],
                }],
              });
            } catch (addError) {
              throw addError;
            }
          } else {
            throw switchError;
          }
        }
      }
      provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      await signer.signMessage("Welcome to my token vending machine. Please sign this message to ensure that your are human.");
      setConnected(true);
      const { ethereum } = window;
      if (ethereum) {
        const ensProvider = new ethers.providers.InfuraProvider('mainnet');
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const displayAddress = address?.substr(0, 6) + "...";
        const ens = await ensProvider.lookupAddress(address);
        if (ens !== null) {
          setName(ens)
          showNotification("Welcome " + ens);
        } else {
          setName(displayAddress)
          showNotification(displayAddress);
        }
      } else {
        alert('no wallet detected!')
      }
    } catch (error) {
      setConnected(false);
      setLoading(false);
      showNotification('Error connecting wallet...');
    }
    setLoading(false);
  };

  const showNotification = (message) => {
    setNotification({ message, show: true });
  };

  const installMetamask = () => {
    window.open('https://metamask.io/download.html', '_blank');
  };

  const disconnect = () => {
    setName(null)
    setConnected(false)
  }

  return (
    <div className="App">

      <header>
        <p className='logo'><MdOutlineGeneratingTokens/></p>
        {typeof window.ethereum !== 'undefined' ? (
          <div>
          {!connected && (
            <button className='connect' onClick={connect}>connect</button>
          )}
          {connected && (
            <button className='disconnect' onClick={disconnect}>{name}</button>
          )}
          </div>
        ) : (
          <div>
          <button onClick={installMetamask}>
            Install Metamask
          </button>
          </div>
        )}
      </header>

      <div className='card'>
        <div className='info'>
          <p>Price:</p>
          <p>0.001 ETH</p>
          <p>Balance:</p>
          <p>0 tokens</p>
          <p>Supply:</p>
          <p>0 tokens</p>
        </div>
        <input type='text' placeholder='enter amount' />
        <button>MINT</button>
      </div>
      <Notification
          message={notification.message}
          show={notification.show}
          setShow={(show) => setNotification({ ...notification, show })}
      />
    </div>
  );
}

export default App;
