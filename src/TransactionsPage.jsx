import { useState } from 'react';
import {Decimal} from 'decimal.js';
import MyDropzone from './components/dropzone';
import TransactionsTable from './components/transactions-table'

function TransactionsPage() {
  const [data, setData] = useState({
    'account': {},
    'balance': {},
    'transactions': []
  });



  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
      let chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return hash;
  }

  const parseToDate = (input) => {
    const [day, month, year] = input.split('.');
    const fullYear = year.length === 2 ? `20${year}` : year;
    return new Date(`${fullYear}-${month}-${day}`);
  }

  const fixNumber = (amount) => {
    var e = amount.replace('.', '').replace('€', '').replace(/\s/g, '').replace(',', '.');
    return new Decimal(e);
  }

  let rollingBalance = undefined;
  const calculateBalance = (amount) => {
    if(amount < 0) {
      return rollingBalance.minus(amount);
    } else {
      return rollingBalance.minus(amount);
    }
  }

  const replaceNames = (input) => {
    if(window.subs && window.subs[input]) {
      return window.subs[input];
    }
    return input;
  }

  const handleFileRead = (fileContent) => {
    const transactionData = {
      'account': {},
      'balance': {},
      'transactions': []
    };
    const separateLines = fileContent.split(/\r?\n|\r|\n/g);

    separateLines.forEach((line, idx) => {
      line = line.replace(/\s\s+/g, ' ').replaceAll('"', "");
      const parts = line.split(';');

      if(line.includes('Girokonto')) {
        transactionData['account']['type'] = parts[0].replace(/\s/g, "");
        return
      }

      if(line.includes('Kontostand')) {
        rollingBalance = fixNumber(parts[1]);
        var dateString = parts[0].replace('Kontostand vom', '').replace(':', '');
        var date = parseToDate(dateString);
        date.setHours(23, 59, 59);
        transactionData['balance']['date'] = date;
        transactionData['balance']['amount'] = rollingBalance;

        transactionData['transactions'].push({
          'index': idx,
          'hash': "muppet",
          'book_date': date,
          'payment_date': date,
          'from': '',
          'to': '',
          'note': '',
          'amount': '',
          'balance': rollingBalance,
          'checked': false,
        });

        return;
      }

      if(line.includes('Buchungsdatum')) {
        return;
      }

      // 0  Buchungsdatum
      // 1  Wertstellung
      // 2  Status
      // 3  Zahlungspflichtige*r
      // 4  Zahlungsempfänger*in
      // 5  Verwendungszweck
      // 6  Umsatztyp
      // 7  IBAN
      // 8  Betrag (€)
      // 9  Gläubiger-ID
      // 10 Mandatsreferenz
      // 11 Kundenreferenz

      if(parts.length === 12) {
        const amount = fixNumber(parts[8]);
        rollingBalance = calculateBalance(amount);
        transactionData['transactions'].push({
          'index': idx,
          'checked': false,
          'hash': hashCode(line),
          'book_date': parseToDate(parts[0]),
          'payment_date': parseToDate(parts[1]),
          'from': replaceNames(parts[3]),
          'to': replaceNames(parts[4]),
          'note': replaceNames(parts[5]),
          'amount': amount,
          'balance': rollingBalance,
        });
      }
    });

    setData(transactionData);
  };

  return (
    <div>
      {data.transactions.length === 0 && (
        <MyDropzone onFileRead={handleFileRead} />
      )}

      {data && (
        <TransactionsTable data={data} />
      )}
    </div>
  );
}

export default TransactionsPage;
