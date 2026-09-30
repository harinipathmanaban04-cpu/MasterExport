import React, { createContext, useContext, useState } from 'react';

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: '₹ INR', name: 'Indian Rupee (Default)', rate: 1 },
  { code: 'USD', symbol: '$', label: '$ USD', name: 'US Dollar', rate: 1 / 83.5 },
  { code: 'EUR', symbol: '€', label: '€ EUR', name: 'Euro', rate: 1 / 91.2 },
  { code: 'GBP', symbol: '£', label: '£ GBP', name: 'British Pound', rate: 1 / 108.0 },
  { code: 'AED', symbol: 'AED ', label: 'د.إ AED', name: 'UAE Dirham', rate: 1 / 22.7 }
];

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('app_currency') || 'INR';
  });

  const setCurrency = (curr) => {
    setCurrencyState(curr);
    localStorage.setItem('app_currency', curr);
  };

  const currentMeta = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const getSymbol = (curr = currency) => {
    const c = CURRENCIES.find((x) => x.code === curr);
    return c ? c.symbol : '₹';
  };

  const formatAmount = (amount, explicitCurrency = null) => {
    const targetCurrency = explicitCurrency || currency;
    const num = Number(amount || 0);
    const sym = getSymbol(targetCurrency);

    if (targetCurrency === 'INR') {
      return `${sym}${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    }
    return `${sym}${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencySymbol: currentMeta.symbol,
        currencies: CURRENCIES,
        getSymbol,
        formatAmount
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: 'INR',
      setCurrency: () => {},
      currencySymbol: '₹',
      currencies: CURRENCIES,
      getSymbol: () => '₹',
      formatAmount: (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`
    };
  }
  return context;
}
