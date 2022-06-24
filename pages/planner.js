import { useEffect, useState } from 'react';
import { uuid as uuidv4 } from 'uuidv4';
// import * as uuidv4 from 'uuidv4';

const DB_KEY = 'planner-db';

export default function Planner() {
    const [db, setDB] = useState({});
    const [displayDate, setDisplayDate] = useState(new Date());
    const [displayDateExpenses, setDisplayDateExpenses] = useState(0);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        if (window && typeof window !== 'undefined') setDB(get(DB_KEY));
    }, []);

    const addExpense = (e) => {
        e?.preventDefault();
        const id = uuidv4();
        const name = e?.target?.elements?.name?.value;
        const amount = Number(e?.target?.elements?.amount?.value);

        setDB((currDB) => {
            const expenses = currDB?.expenses?.[displayDate?.getDate()] || {};
            expenses[id] = { id, name, amount };
            return { ...currDB, expenses: { ...(currDB?.expenses || {}), [displayDate?.getDate()]: expenses } };
        });
        e?.target?.reset();
    };

    useEffect(() => {
        setDisplayDateExpenses(sumExpenses(db?.expenses, displayDate?.getDate()));
        setBalance(db?.balance);
        set(DB_KEY, db);
    }, [db, displayDate]);

    const removeExpense = (id) => (e) => {
        e?.preventDefault();

        setDB((currDB) => {
            const expenses = currDB?.expenses?.[displayDate?.getDate()] || {};
            delete expenses[id];
            return { ...currDB, expenses: { ...(currDB?.expenses || {}), [displayDate?.getDate()]: expenses } };
        });
    };

    const payExpense = (id) => (e) => {
        e?.preventDefault();

        setDB((currDB) => {
            const expenses = currDB?.expenses?.[displayDate?.getDate()] || {};
            const amount = expenses[id]?.amount || 0;
            delete expenses[id];
            return {
                ...currDB,
                balance: currDB?.balance - amount,
                expenses: { ...(currDB?.expenses || {}), [displayDate?.getDate()]: expenses },
            };
        });
    };

    const handleDateChange = (e) => {
        e.preventDefault();
        const newDate = new Date(e.target.value);
        newDate.setTime(newDate.getTime() + newDate.getTimezoneOffset() * 60 * 1000);
        setDisplayDate(newDate);
    };

    const handleDayChange = (change) => (e) => {
        e?.preventDefault();
        // displayDate?
        const newDate = new Date(displayDate);
        newDate.setDate(newDate.getDate() + change);
        setDisplayDate(newDate);
    };

    const setNewBalance = (e) => {
        e?.preventDefault();
        const newAmount = Number(e?.target?.elements?.balanceAmount?.value);
        setBalance(newAmount);
        setDB((currDB) => {
            return { ...currDB, balance: newAmount };
        });
    };

    return (
        <div>
            <form name="balance" onSubmit={setNewBalance}>
                <div>
                    <label htmlFor="balanceAmount">New Balance Amount</label>
                    <input type="text" name="balanceAmount" id="balanceAmount" />
                </div>
                <button type="submit">Set</button>
            </form>
            <div>Balance {balance}</div>
            <h3>Date ({displayDate?.getDate()})</h3>
            <div>
                <button onClick={handleDayChange(-1)}>prev</button>
                <button onClick={() => setDisplayDate(new Date())}>today</button>
                <button onClick={handleDayChange(1)}>next</button>
            </div>
            <div>
                <h3>Expenses - {displayDateExpenses}</h3>
                <div>
                    <form name="expense" onSubmit={addExpense}>
                        <div>
                            <label htmlFor="date">date</label>
                            <input
                                type="date"
                                name="date"
                                id="date"
                                value={displayDate?.toISOString().slice(0, 10)}
                                onChange={handleDateChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="name">name</label>
                            <input type="text" name="name" id="name" />
                        </div>
                        <div>
                            <label htmlFor="amount">amount</label>
                            <input type="number" name="amount" id="amount" />
                        </div>
                        <div>
                            <button type="submit">Add</button>
                        </div>
                    </form>
                </div>
                <div>
                    {Object?.keys(db?.expenses?.[displayDate?.getDate()] || {})?.map((expenseId, idx) => {
                        const expense = db?.expenses?.[displayDate?.getDate()][expenseId];
                        return (
                            <div key={'expense' + expenseId}>
                                <button onClick={payExpense(expense?.id)}>
                                    pay {expense?.amount} for {expense?.name}
                                </button>
                                <button onClick={removeExpense(expense?.id)}>delete</button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

const get = (key) => {
    const id = uuidv4();
    const skeleton = {
        balance: 0,
        expenses: {
            [new Date()?.getDate()]: { [id]: { id, name: 'init', amount: 0 } },
        },
    };
    return JSON?.parse(window?.localStorage?.getItem(key) || JSON.stringify(skeleton));
};

const set = (key, value) => window?.localStorage?.setItem(key, JSON.stringify(value));

const sumExpenses = (expenses, date) => {
    const expenseIds = Object?.keys(expenses?.[date] || {});
    let sum = 0;
    expenseIds?.map((id) => (sum += expenses?.[date][id]?.amount));
    return sum;
};
