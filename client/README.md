# GhostVault
### Zero-Knowledge Encrypted File Transfer
**Engineered by Harry Sandhu**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20WebCrypto-blueviolet)](https://github.com/hsandhu01)

> "The server should be a dumb storage bucket. It should never know what it holds."

GhostVault is a security-focused file sharing tool designed to demonstrate **cryptographic principles** in a modern web architecture. Unlike standard file uploaders, GhostVault encrypts files in the browser using the **Web Crypto API (AES-GCM)** before transmission. The server receives only an opaque binary blob and has **zero knowledge** of the decryption key.

---

## How It Works (The "Zero-Knowledge" Protocol)

1.  **Client-Side Encryption:** When a user selects a file, the browser generates a random **256-bit AES-GCM key**.
2.  **Stream Encryption:** The file is encrypted in memory. We use GCM (Galois/Counter Mode) to ensure both confidentiality and integrity.
3.  **Opaque Upload:** The encrypted binary blob (IV + Ciphertext) is uploaded to the Node.js server.
4.  **The "Magic Link":** The application generates a shareable URL containing the decryption key in the **URL Fragment (Hash)**.
    * *Example:* `https://ghostvault.app/files/123#<SECRET_KEY>`
    * **Security Note:** Browsers do *not* send the fragment (everything after `#`) to the server. The key never leaves the user's device via HTTP.
5.  **Client-Side Decryption:** When the recipient opens the link, the browser extracts the key from the URL, fetches the blob, and decrypts it locally.

## 🛠 Tech Stack

* **Frontend:** React, TypeScript, Vite
* **Cryptography:** Native Web Crypto API (SubtleCrypto) - *No external heavy crypto libraries.*
* **Backend:** Node.js, Express
* **Storage:** Multer (Stream-based disk storage)

## Local Setup

```bash
# 1. Clone the repository
git clone [https://github.com/hsandhu01/ghost-vault.git](https://github.com/hsandhu01/ghost-vault.git)

# 2. Install & Start Server (Port 3000)
cd server
npm install
node index.js

# 3. Install & Start Client (Port 5173)
cd ../client
npm install
npm run dev