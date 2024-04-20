
let web3;

async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
           
            let acc= await window.ethereum.request({ method: 'eth_requestAccounts' });
            document.getElementById('connected').innerHTML ="Connected Acoount :"+ acc[0];
            console.log('Connected to Ethereum');
        } catch (error) {
            console.error('User denied account access');
        }
    } else {
        console.error('Web3 provider not found. Please install MetaMask.');
    }
}

// Connect to the contract
async function connectToContract() {
    const contractAddress = "0xDfEa244f08Ae4d1744c0154F632DC5a209e6F341";
    const abi = [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "string",
            "name": "documentHash",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "signer",
            "type": "address"
          }
        ],
        "name": "DocumentSigned",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_documentHash",
            "type": "string"
          }
        ],
        "name": "signDocument",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_documentHash",
            "type": "string"
          }
        ],
        "name": "signPersonal",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_documentHash",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "_signer",
            "type": "address"
          }
        ],
        "name": "uploadDocument",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_documentHash",
            "type": "string"
          }
        ],
        "name": "isDocumentSigned",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    return new web3.eth.Contract(abi, contractAddress);
}

// Calculate the hash of the file
async function calculateFileHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}


async function upload() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  const signerAddress = document.getElementById('signer').value;
  const contract = await connectToContract();

  if (!file) {
      document.getElementById('status').innerText = 'Please select a file.';
      return;
  }

  try {
      const accounts = await web3.eth.getAccounts();
      const hash = await calculateFileHash(file);
      await contract.methods.uploadDocument(hash, signerAddress).send({ from: accounts[0] });
      document.getElementById('status').innerText = 'Document uploaded successfully.';
  } catch (error) {
      console.error('Error uploading document:', error);
      document.getElementById('status').innerText = 'Error uploading document.';
  }
}


// Sign a document
async function signDocument() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
    const contract = await connectToContract();

    try {
      const accounts = await web3.eth.getAccounts();
      const hash = await calculateFileHash(file);
        await contract.methods.signDocument(hash).send({ from: accounts[0] });
        document.getElementById('status').innerText = 'Document signed successfully.';
    } catch (error) {
        console.error('Error signing document:', error);
        document.getElementById('status').innerText = 'Error signing document.';
    }
}
async function selfsign() {
  try {
    const contract = await connectToContract();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0]; 
    const accounts = await web3.eth.getAccounts();
    const hash = await calculateFileHash(file);
    await contract.methods.signDocument(hash).send({ from: accounts[0] });
    document.getElementById('status').innerText = 'Document signed successfully.';
  } catch (error) {
    console.error('Error signing document:', error);
    document.getElementById('status').innerText = 'Document not signed (error).';
  }
}


// Check if a document is signed
async function verify() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
    const contract = await connectToContract();

    try {
      const hash = await calculateFileHash(file);
        const isSigned = await contract.methods.isDocumentSigned(hash).call();
        if (isSigned) {
            document.getElementById('status').innerText = 'Document is signed.';
        } else {
            document.getElementById('status').innerText = 'Document is not signed.';
        }
    } catch (error) {
        console.error('Error checking document signed:', error);
        document.getElementById('status').innerText = 'Error checking document signed.';
    }
}


window.onload = async function() {
    await initWeb3();
};
