# HostIt

**The Ultimate Event Ticketing & Management Solution on Mantle.**

## 🌟 Introduction
HostIt is a decentralized, comprehensive event management protocol built for the **Mantle Global Hackathon 2025**. It empowers organizers to create, manage, and sell tickets with ease, while providing attendees with a seamless, secure, and transparent purchasing experience using the power of **Mantle Network**.

## 🚀 Key Features & Strengths

### For Organizers
-   **Comprehensive Dashboard**: A powerful Next.js-based dashboard to manage events, track sales, and analytics.
-   **Flexible Ticketing**: Create various ticket tiers (VIP, General, Early Bird).
-   **Modular Smart Contracts**: Built using the **Diamond Pattern (EIP-2535)**, ensuring the protocol is fully upgradable and scalable without breaking legacy integration.

### For Attendees
-   **Seamless Onboarding**: Integrated with **Dynamic** for easy wallet connection and social login.
-   **Low Fees**: Powered by Mantle's low gas fees, making ticket purchases affordable.
-   **Instant Confirmation**: Fast block times ensure tickets land in wallets instantly.

## 🏗 Architecture & Tech Stack

### Smart Contracts (Mantle)
-   **Diamond Pattern (EIP-2535)**: Allows for unlimited contract size and modular upgrades.
-   **Solidty 0.8.30**: Latest secure practices.
-   **Foundry**: For robust testing and deployment.

### Frontend
-   **Next.js 14**: Modern, server-side rendered application.
-   **Mantle SDK & Wagmi**: smooth blockchain interactions.
-   **Dynamic**: Best-in-class authentication.
-   **TailwindCSS & Shadcn/UI**: Beautiful, responsive design.

### Backend
-   **Node.js**: For off-chain indexing and metadata handling.

## 🟢 Integration with Mantle
HostIt leverages the **Mantle Network** to solve the distinct challenges of on-chain ticketing:
1.  **Cost Efficiency**: Minting thousands of NFT tickets is prohibitively expensive on L1. Mantle's low fees make it viable.
2.  **Speed**: fast finality is crucial for QR code check-in at physical gates.
3.  **Future Proofing**: The Diamond proxy allows us to add new features (like Soulbound Tickets or Dynamic Pricing) to the same address on Mantle.

## 🤝 Value to the Mantle Ecosystem
HostIt brings a **production-ready, real-world utility** to Mantle. Unlike speculative DeFi apps, HostIt drives mainstream adoption by onboard non-crypto natives through events. It showcases Mantle's capability to handle high-frequency, low-value transactions (tickets) reliability.

## 🛠 Getting Started

### Prerequisites
-   Node.js & Yarn
-   Foundry

### Installation
```bash
git clone https://github.com/StartUp-HostIT/HostIT-mantle.git
cd HostIT-mantle
```

### Run Frontend
```bash
cd frontend
yarn dev
```

### Run Contracts
```bash
cd ticket
forge build
```
