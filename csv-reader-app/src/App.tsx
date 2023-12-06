import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";

interface CurrencyData {
  currency: string;
  sum: number;
}

const CsvUploader: React.FC = () => {
  const [currencySums, setCurrencySums] = useState<Array<CurrencyData>>([]);

  const onDrop = async (acceptedFiles: File[]) => {
    let tempCurrencySums: Array<CurrencyData> = [];

    for (const file of acceptedFiles) {
      // Provera ekstenzije .csv
      if (file.name.endsWith(".csv")) {
        const result = await readCsvFile(file);
        tempCurrencySums = calculateCurrencySums(tempCurrencySums, result.data);
      } else {
        console.error(`Unsupported file format: ${file.name}`);
      }
    }

    setCurrencySums(tempCurrencySums);
  };

  const readCsvFile = async (file: File) => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        complete: (result) => {
          resolve(result);
        },
      });
    });
  };

  const calculateCurrencySums = (
    currentSums: Array<CurrencyData>,
    data: any
  ) => {
    const newSums = [...currentSums];

    data.forEach((row: any) => {
      const currency = row[1];
      const amount = parseFloat(row[2]);

      if (!isNaN(amount)) {
        const existingCurrency = newSums.find((c) => c.currency === currency);

        if (existingCurrency) {
          existingCurrency.sum += amount;
        } else {
          newSums.push({ currency, sum: amount });
        }
      }
    });

    return newSums;
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "4px",
        }}
      >
        <input {...getInputProps()} />
        <p>Drag 'n' drop files here, or click to select files</p>
      </div>
      {currencySums.length > 0 && (
        <div>
          <h2>Total Sums by Currency:</h2>
          <ul>
            {currencySums.map((currencyData) => (
              <li key={currencyData.currency}>
                {currencyData.currency}: {currencyData.sum}
              </li>
            ))}
          </ul>
          <h2>Total Sum of All Currencies:</h2>
          <p>{currencySums.reduce((acc, currency) => acc + currency.sum, 0)}</p>
        </div>
      )}
    </div>
  );
};

export default CsvUploader;
