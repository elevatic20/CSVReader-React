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
      // Provjera ekstenzije .csv
      if (file.name.endsWith(".csv")) {
        try {
          const result = await readCsvFile(file);

          if (typeof result === "object" && result !== null) {
            if (
              "errors" in result &&
              result.errors &&
              result.errors.length > 0
            ) {
              console.error(`Error parsing CSV file: ${file.name}`);
              console.error(result.errors);
            } else if ("data" in result && result.data) {
              tempCurrencySums = calculateCurrencySums(
                tempCurrencySums,
                result.data
              );
            } else {
              console.error(`No data found in CSV file: ${file.name}`);
            }
          } else {
            console.error(`Unexpected result type for CSV file: ${file.name}`);
          }
        } catch (error) {
          console.error(`Error reading CSV file: ${file.name}`);
          console.error(error);
        }
      } else {
        console.error(`Unsupported file format: ${file.name}`);
      }
    }

    setCurrencySums(tempCurrencySums);
  };

  const readCsvFile = async (file: File) => {
    return new Promise<any>((resolve) => {
      Papa.parse(file, {
        complete: (result) => {
          resolve(result);
        },
        error: (error) => {
          resolve({ errors: [error] });
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

  //Pocetak "HTML-a"

  return (
    <div>
      <h1
        style={{
          marginBottom: "20px",
          fontSize: "40px",
          background: "#f10000",
          margin: "0 auto",
          paddingTop: "10px",
          paddingBottom: "20px",
          width: "100%",
        }}
      >
        CSV currency reader
      </h1>
      <p style={{ fontSize: "20px" }}>
        Ovo je privatni projekt razvijen od strane <b>Emanuela Levatića</b>.
        <br />
        Koji omogućava da se odabere <b>određen</b> broj <b>".csv"</b> datoteka
        te da se izračuna suma po valutama. <br /> Korišteni su:
        <b> React i TypeScript</b>.
      </p>
      <div
        className="draganddrop"
        {...getRootProps()}
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "4px",
          width: "25%",
          margin: "0 auto",
          fontSize: "17px",
        }}
      >
        <input {...getInputProps()} />
        <p>Drag 'n' drop files here, or click to select files</p>
      </div>
      {currencySums.length > 0 && (
        <div>
          <h2>Total Sums by Currency:</h2>
          <ul style={{ listStyle: "none" }}>
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
