import { format } from 'date-fns';
import Decimal from 'decimal.js';
import { useState } from "react";

function TransactionsTable({ data }) {
  const [sortField, setSortField] = useState("index");
  const [order, setOrder] = useState("asc");
  const [selected, setSelected] = useState([]);

  if (!data || data.transactions.length === 0) {
    return <p>No Transactions found.</p>;
  }

  const handleSort = (accessor) => {
    const sortOrder = accessor === sortField && order === "asc" ? "desc" : "asc";
    setSortField(accessor);
    setOrder(sortOrder);
  }

  const handleCheckboxChange = (transaction) => {
    setSelected((prevSelected) => {
      const isSelected = prevSelected.some(item => item.index === transaction.index);
      if (isSelected) {
        return prevSelected.filter(item => item.index !== transaction.index);
      } else {
        return [...prevSelected, transaction];
      }
    });
  };

  const getSelectedTotal = () => {
    var total = new Decimal(0);
    selected.forEach((transaction) => {
      total = transaction.amount.plus(total);
    });
    return total.toFixed(2);
  }

  const tableData = data.transactions.sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA === null) return 1;
    if (valB === null) return -1;
    if (valA === null && valB === null) return 0;

    const isDateA = !isNaN(Date.parse(valA));
    const isDateB = !isNaN(Date.parse(valB));
    if (isDateA && isDateB) {
      return (
        (new Date(valA) - new Date(valB)) * (order === "asc" ? 1 : -1)
      );
    }

    return (
      valA.toString().localeCompare(valB.toString(), "en", {
        numeric: true,
      }) * (order === "asc" ? 1 : -1)
    );
  });

  const columns = [
    { label: "", accessor: "" },
    { label: "Line", accessor: "index" },
    { label: "Date", accessor: "book_date" },
    { label: "From", accessor: "from" },
    { label: "To", accessor: "to" },
    { label: "Note", accessor: "note" },
    { label: "Amount", accessor: "amount" },
    { label: "Balance", accessor: "balance" },
  ];

  return (
    <div className="w-full">
      <table className="w-full table-auto border-t-1">
        <thead>
          <tr className="text-left">
            {columns.map(({ label, width, accessor }) => {
             return <th className="border border-black px-4 py-4 hover:underline cursor-pointer" key={accessor} onClick={() => handleSort(accessor)}>{label}</th>
            })}
          </tr>
        </thead>

        {tableData && tableData.map((transaction, idx) => (
          <tbody key={transaction.hash}>
            <tr>
              <td className="border border-black text-center">
                {transaction.index > 2 && (
                  <input type='checkbox' value="false" onChange={() => handleCheckboxChange(transaction)} />
                )}
              </td>
              <td className="border border-black px-4 py-4 text-right">{transaction.index}</td>
              <td className="border border-black px-4 py-4">
                {transaction.book_date && (
                  format(transaction.book_date, 'dd.MM')
                )}
              </td>
              <td className="border border-black px-4 py-4 whitespace-nowrap overflow-hidden">{transaction.from}</td>
              <td className="border border-black px-4 py-4 whitespace-nowrap">{transaction.to}</td>
              <td className="border border-black px-4 py-4 whitespace-nowrap">{transaction.note.length > 50 ? transaction.note.slice(0, 50) + "..." : transaction.note}</td>
              <td className="border border-black px-4 py-4 whitespace-nowrap text-right">
                {transaction.amount && (
                  transaction.amount.toFixed(2)
                )}
              </td>
              <td className="border border-black px-4 py-4 text-right">
                {transaction.balance && (
                  transaction.balance.toFixed(2)
                )}</td>
            </tr>
          </tbody>
        ))}
      </table>

      <div className='fixed bottom-0 right-0 w-[400px] border border-black bg-white'>
        <table className='w-full table-auto'>
          <thead>
            <tr>
              <th className='border border-black px-4 py-4 text-left'>Note</th>
              <th className='border border-black px-4 py-4 text-right'>Amount</th>
            </tr>
          </thead>
          <tbody>
          {selected && selected.map((transaction, idx) => (
            <tr key={idx}>
              <td className='border border-black px-4 py-4'>{transaction.to.length > 20 ? transaction.to.slice(0, 20) + "..." : transaction.to}</td>
              <td className='border border-black px-4 py-4 text-right'>{transaction.amount.toFixed(2)}</td>
            </tr>
          ))}

          {selected && (
          <tr>
            <td className="border border-black px-4 py-4">Total:</td>
            <td className="border border-black px-4 py-4 text-right">{getSelectedTotal()}</td>
          </tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionsTable;
