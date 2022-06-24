// import { Chart } from 'chart.js';
import Chart from 'chart.js/auto';
import { useEffect } from 'react';
import { sumExpenses } from '../../helpers/plannerHelpers';

const Graph = ({ expenses, balance }) => {
    useEffect(() => {
        const currDate = new Date();
        const dates = [];
        const dateExpenseSummed = [];
        currDate.setDate(currDate.getDate() - 1);
        let currentBalance = balance;
        for (let index = 0; index < 20; index++) {
            currDate.setDate(currDate.getDate() + 1);
            const sum = sumExpenses(expenses, currDate?.getDate());
            currentBalance = currentBalance - (sum || 0);
            dateExpenseSummed?.push(currentBalance);
            dates.push(currDate?.getDate());
        }
        const labels = dates;
        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'My First Dataset',
                    data: dateExpenseSummed,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                },
            ],
        };
        console.log(data);
        const ctx = document.getElementById('myChart').getContext('2d');
        const options = { type: 'line', data };
        const chart = new Chart(ctx, options);
        return () => {
            chart.destroy();
        };
    }, [expenses, balance]);

    return <canvas id="myChart" width="100" height="100" style={{ maxHeight: 200, width: '100vw' }}></canvas>;
};

export default Graph;
