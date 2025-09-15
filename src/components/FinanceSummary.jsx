import React from "react";

// Helper: convert summary object to CSV
const exportToCSV = (data, filename) => {
  let csv = "Category,Total\n";
  for (const key in data) {
    csv += `${key},${data[key]}\n`;
  }
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// Helper: print summary
const printSummary = (data, title) => {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(
    "<html><head><title>Finance Summary</title></head><body>"
  );
  printWindow.document.write(`<h2>${title}</h2>`);
  printWindow.document.write(
    "<table border='1' style='border-collapse: collapse; width: 100%;'>"
  );
  printWindow.document.write("<tr><th>Category</th><th>Total</th></tr>");
  for (const key in data) {
    printWindow.document.write(`<tr><td>${key}</td><td>${data[key]}</td></tr>`);
  }
  printWindow.document.write("</table></body></html>");
  printWindow.document.close();
  printWindow.print();
};

export default function FinanceSummary({ finance }) {
  // Group by month
  const monthlyTotals = finance.reduce((acc, f) => {
    const month = new Date(f.date).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    acc[month] = (acc[month] || 0) + parseFloat(f.amount || 0);
    return acc;
  }, {});

  // Group by year
  const yearlyTotals = finance.reduce((acc, f) => {
    const year = new Date(f.date).getFullYear();
    acc[year] = (acc[year] || 0) + parseFloat(f.amount || 0);
    return acc;
  }, {});

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">Finance Summary</h3>

      {/* Monthly Totals */}
      <div className="mb-4">
        <h4 className="font-medium">Monthly Totals</h4>
        <table className="w-full border-collapse border border-gray-300 mt-2">
          <thead>
            <tr className="bg-pink-600 text-white">
              <th className="border px-3 py-1">Month</th>
              <th className="border px-3 py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(monthlyTotals).map((month) => (
              <tr key={month}>
                <td className="border px-3 py-1">{month}</td>
                <td className="border px-3 py-1">{monthlyTotals[month]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2">
          <button
            onClick={() => exportToCSV(monthlyTotals, "monthly_summary.csv")}
            className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
          >
            Download Summary
          </button>
          <button
            onClick={() =>
              printSummary(monthlyTotals, "Monthly Finance Summary")
            }
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            Print Summary
          </button>
        </div>
      </div>

      {/* Yearly Totals */}
      <div>
        <h4 className="font-medium">Yearly Totals</h4>
        <table className="w-full border-collapse border border-gray-300 mt-2">
          <thead>
            <tr className="bg-pink-600 text-white">
              <th className="border px-3 py-1">Year</th>
              <th className="border px-3 py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(yearlyTotals).map((year) => (
              <tr key={year}>
                <td className="border px-3 py-1">{year}</td>
                <td className="border px-3 py-1">{yearlyTotals[year]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2">
          <button
            onClick={() => exportToCSV(yearlyTotals, "yearly_summary.csv")}
            className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
          >
            Download Summary
          </button>
          <button
            onClick={() => printSummary(yearlyTotals, "Yearly Finance Summary")}
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            Print Summary
          </button>
        </div>
      </div>
    </div>
  );
}
