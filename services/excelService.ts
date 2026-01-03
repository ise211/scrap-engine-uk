import * as XLSX from 'xlsx';
import { ScrapPrice, CalculatorItem } from '../types';

export const exportToExcel = (
  prices: ScrapPrice[],
  receiptItems: CalculatorItem[],
  totalValue: number
) => {
  // Sheet 1: Live Prices
  const priceData = prices.map(p => ({
    Material: p.material,
    Location: p.location,
    'Price (£/kg)': p.pricePerKg,
    Date: p.date,
    Trend: p.trend.toUpperCase(),
    'Change %': `${p.changePercentage}%`
  }));

  const wsPrices = XLSX.utils.json_to_sheet(priceData);
  
  // Sheet 2: Receipt (if exists)
  let wsReceipt = null;
  if (receiptItems.length > 0) {
    const receiptData = receiptItems.map(item => {
      const materialName = prices.find(p => p.id === item.materialId)?.material || 'Unknown';
      const price = prices.find(p => p.id === item.materialId)?.pricePerKg || 0;
      return {
        Material: materialName,
        'Weight (kg)': item.weightKg,
        'Unit Price (£)': price,
        'Total (£)': (item.weightKg * price).toFixed(2)
      };
    });
    
    // Add Total Row
    receiptData.push({
      Material: 'TOTAL',
      'Weight (kg)': receiptItems.reduce((acc, curr) => acc + curr.weightKg, 0),
      'Unit Price (£)': 0, // Placeholder
      'Total (£)': totalValue.toFixed(2)
    });

    wsReceipt = XLSX.utils.json_to_sheet(receiptData);
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsPrices, "Live Market Prices");
  
  if (wsReceipt) {
    XLSX.utils.book_append_sheet(wb, wsReceipt, "Load Receipt");
  }

  const fileName = `UK_Scrap_Prices_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};