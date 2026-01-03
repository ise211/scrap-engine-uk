# UK Scrap Metal Pricing Engine

A professional-grade dashboard for tracking UK scrap metal prices, calculating van load values, and analyzing market trends using Google Gemini AI.

## 🚀 Features

- **Live Market Feed**: Real-time aggregation of scrap prices across the UK (Simulated data for demonstration).
- **Live Spot Prices**: Integrates with **MetalPriceAPI** for live global spot prices (LME derived).
- **AI Market Analyst**: Uses **Google Gemini 3 Flash** to generate professional market reports, analyzing the spread between spot and scrap prices.
- **Van Load Calculator**: 
    - **Standard Mode**: Calculate the total value of your current load.
    - **Trader Mode**: Calculate specific buying prices based on configurable profit margins (e.g., set a 20% margin to see what you should pay).
- **Regional Database**: Compare price variations across major UK cities (London, Birmingham, Manchester, etc.).
- **Historical Trends**: Visual 7-day price volatility charts with trend indicators.
- **Excel Export**: Download price lists and load manifests directly to `.xlsx`.
- **Python CLI**: Includes a standalone Python script generator for terminal-based price checking.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Utilities**: SheetJS (`xlsx`), React Markdown

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd scrap-engine-uk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   *Note: If you encounter version errors with `@google/genai`, ensure your `package.json` has `"*"` as the version or run `npm update`.*

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   # Required for AI Market Analysis
   API_KEY=your_google_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

- **`/components`**: Reusable UI modules (Calculator, PriceTable, MarketAnalysis, etc.).
- **`/services`**: 
  - `geminiService.ts`: Handles AI report generation.
  - `livePricing.ts`: Fetches spot prices from MetalPriceAPI.
  - `euRecycleData.ts`: Generates algorithmic regional pricing data.
- **`/types`**: TypeScript interfaces for type safety.

## ⚠️ Data Disclaimer

This application is a **Proof of Concept**. 
- **Spot Prices**: Fetched live from MetalPriceAPI (Free Tier) or fallback to mocks if the API limit is reached.
- **Scrap Yard Prices**: Generated algorithmically to simulate realistic UK market conditions. **Do not use for actual financial trading** without connecting to a real proprietary scrap yard API.

## 📄 License

MIT
