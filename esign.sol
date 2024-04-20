// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentSigningPlatform {
    struct Document {
        address signer;
        bool signed;
    }

    mapping(string => Document) documents;

    event DocumentSigned(string documentHash, address signer);

    function uploadDocument(
        string memory _documentHash,
        address _signer
    ) external {
        require(_signer != address(0), "Invalid signer address");
        require(!documents[_documentHash].signed, "Document already signed");

        documents[_documentHash] = Document(_signer, false);
    }

    function signDocument(string memory _documentHash) external {
        require(
            documents[_documentHash].signer == msg.sender,
            "You are not authorized to sign this document"
        );
        require(!documents[_documentHash].signed, "Document already signed");

        documents[_documentHash].signed = true;
        emit DocumentSigned(_documentHash, msg.sender);
    }

    function signPersonal(string memory _documentHash) external {
        require(!documents[_documentHash].signed, "Document already signed");
        // require(documents[_documentHash].signer == msg.sender, "You are not authorized to sign this document");

        documents[_documentHash].signed = true;
        emit DocumentSigned(_documentHash, msg.sender);
    }

    function isDocumentSigned(
        string memory _documentHash
    ) external view returns (bool) {
        return documents[_documentHash].signed;
    }
}
