# Quantum Shadows: Quantum Resilience Toolkit

A responsive, single-page web application to help non-experts check a website’s TLS/HTTPS configuration for vulnerabilities and provide post-quantum upgrade suggestions.

## Features
- **URL Scanner**: Mocks a TLS/HTTPS scan with instant feedback.
- **Vulnerability Score**: 0-100 score based on security features (HTTPS, TLS 1.3, etc).
- **Findings & Fixes**: Actionable advice to improve security.
- **Quantum-Safe Advisor**: Guidance on migrating to Google Cloud PQC & Tink.
- **Developer API**: Pseudocode for future backend integration.
- **Educational Section**: Q-Day, Harvest Now Decrypt Later explanation.

## Tech Stack
- React (Vite)
- Tailwind CSS (Deep Dark Mode, Neon Accents)
- Lucide React (Icons)

## Setup & Run

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure
- `src/App.jsx`: Main application logic and components.
- `src/index.css`: Tailwind directives and custom styles.
- `tailwind.config.cjs`: Tailwind configuration.
