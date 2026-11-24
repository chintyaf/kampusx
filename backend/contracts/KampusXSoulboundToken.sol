// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KampusXSoulboundToken (ERC-5192 Non-Transferable Credential)
 * @author Brigitta Caitlin Surya Adiwangsa (2372016)
 * @notice Tugas Akhir: Pengembangan Gamifikasi Multi-Tier dan Portofolio Digital
 *         Berbasis Blockchain untuk Mendukung Smart Contract pada Platform Student Hub
 * @dev Mengimplementasikan standar Soulbound Token (SBT / ERC-5192) di atas jaringan Polygon.
 *      Mendukung penerbitan kredensial akademik, kelulusan modul Self-Regulated Learning (SRL),
 *      dan sertifikasi keahlian yang terikat permanen ke wallet mahasiswa (non-transferable).
 */

interface IERC5192 {
    /// @notice Dipancarkan saat token dicetak dan dikunci secara permanen.
    event Locked(uint256 tokenId);

    /// @notice Dipancarkan jika status kunci token dibuka (tidak digunakan dalam SBT permanen).
    event Unlocked(uint256 tokenId);

    /// @notice Mengembalikan status kunci token. Untuk SBT, nilai selalu bernilai true.
    function locked(uint256 tokenId) external view returns (bool);
}

contract KampusXSoulboundToken is IERC5192 {
    // Nama dan Simbol Token
    string public name = "KampusX Soulbound Credential";
    string public symbol = "KX-SBT";

    // Alamat pemilik kontrak / administrator
    address public owner;
    
    // Alamat sistem backend yang berhak mencetak (MINTER_ROLE)
    address public minter;

    // Counter untuk Token ID yang bertambah secara berurutan
    uint256 private _tokenIdCounter;

    // Struktur data kredensial on-chain
    struct CredentialData {
        string tokenURI;
        string skillCategory;
        uint256 cognitiveScore;
        uint256 mintedTimestamp;
        address studentWallet;
    }

    // Mapping dari tokenId ke data kredensial
    mapping(uint256 => CredentialData) private _credentials;

    // Mapping kepemilikan token: tokenId => owner address
    mapping(uint256 => address) private _owners;

    // Mapping saldo token: owner address => jumlah token
    mapping(address => uint256) private _balances;

    // Event standar ERC-721
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    // Modifier hak akses admin/owner
    modifier onlyOwner() {
        require(msg.sender == owner, "SBT: Caller is not the contract owner");
        _;
    }

    // Modifier hak akses minter (backend server)
    modifier onlyMinter() {
        require(msg.sender == minter || msg.sender == owner, "SBT: Caller is not authorized minter");
        _;
    }

    constructor(address _minter) {
        owner = msg.sender;
        minter = _minter;
        _tokenIdCounter = 1000; // Mulai dari ID 1001
    }

    /**
     * @notice Menyetel alamat backend minter baru
     * @param _newMinter Alamat wallet backend yang diotorisasi
     */
    function setMinter(address _newMinter) external onlyOwner {
        require(_newMinter != address(0), "SBT: Invalid minter address");
        minter = _newMinter;
    }

    /**
     * @notice Mengecek apakah token terkunci (Standar ERC-5192)
     * @dev Seluruh kredensial SBT KampusX bersifat terkunci permanen (non-transferable).
     */
    function locked(uint256 tokenId) external view override returns (bool) {
        require(_owners[tokenId] != address(0), "SBT: Token does not exist");
        return true;
    }

    /**
     * @notice Mencetak kredensial Soulbound Token baru ke dompet mahasiswa
     * @param to Alamat wallet mahasiswa penerima sertifikat
     * @param uri URI metadata JSON terdesentralisasi (IPFS atau API KampusX)
     * @param skillCategory Kategori keahlian utama (misal: "Python", "Data Science")
     * @param cognitiveScore Nilai kuis refleksi kognitif SRL mahasiswa (skala 0-100)
     */
    function mint(
        address to,
        string memory uri,
        string memory skillCategory,
        uint256 cognitiveScore
    ) external onlyMinter returns (uint256) {
        require(to != address(0), "SBT: Cannot mint to zero address");
        require(cognitiveScore <= 100, "SBT: Score exceeds maximum");

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _owners[newTokenId] = to;
        _balances[to] += 1;

        _credentials[newTokenId] = CredentialData({
            tokenURI: uri,
            skillCategory: skillCategory,
            cognitiveScore: cognitiveScore,
            mintedTimestamp: block.timestamp,
            studentWallet: to
        });

        // Pancarkan event ERC-721 Transfer dari address(0) sebagai tanda pencetakan awal
        emit Transfer(address(0), to, newTokenId);

        // Pancarkan event ERC-5192 Locked bahwa token ini terkunci secara permanen
        emit Locked(newTokenId);

        return newTokenId;
    }

    /**
     * @notice Membaca detail kredensial on-chain untuk keperluan verifikasi Zero-Trust
     */
    function getCredential(uint256 tokenId) external view returns (
        string memory tokenURI,
        string memory skillCategory,
        uint256 cognitiveScore,
        uint256 mintedTimestamp,
        address studentWallet
    ) {
        require(_owners[tokenId] != address(0), "SBT: Token does not exist");
        CredentialData memory cred = _credentials[tokenId];
        return (
            cred.tokenURI,
            cred.skillCategory,
            cred.cognitiveScore,
            cred.mintedTimestamp,
            cred.studentWallet
        );
    }

    /**
     * @notice Mengembalikan URI metadata token
     */
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "SBT: Token does not exist");
        return _credentials[tokenId].tokenURI;
    }

    /**
     * @notice Mengembalikan pemilik token
     */
    function ownerOf(uint256 tokenId) external view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "SBT: Token does not exist");
        return tokenOwner;
    }

    /**
     * @notice Mengembalikan total token yang dimiliki suatu alamat
     */
    function balanceOf(address account) external view returns (uint256) {
        require(account != address(0), "SBT: Address zero is not a valid owner");
        return _balances[account];
    }

    /**
     * @dev Memblokir seluruh upaya transfer token.
     *      Sesuai spesifikasi Soulbound Token ERC-5192, token terikat secara permanen
     *      dan tidak dapat dipindahtangankan, dijual, atau didelegasikan.
     */
    function transferFrom(address, address, uint256) external pure {
        revert("SBT: Token is soulbound and non-transferable");
    }

    function safeTransferFrom(address, address, uint256) external pure {
        revert("SBT: Token is soulbound and non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) external pure {
        revert("SBT: Token is soulbound and non-transferable");
    }

    function approve(address, uint256) external pure {
        revert("SBT: Cannot approve soulbound token");
    }

    function setApprovalForAll(address, bool) external pure {
        revert("SBT: Cannot approve soulbound token");
    }
}
