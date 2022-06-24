export const sumExpenses = (expenses, date) => {
    const expenseIds = Object?.keys(expenses?.[date] || {});
    let sum = 0;
    expenseIds?.map((id) => (sum += expenses?.[date][id]?.amount));
    return sum;
};
