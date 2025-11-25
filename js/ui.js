import { formatCurrency } from './analysis.js';
import { deleteExpense } from './db-service.js'; // ডিলিট করার জন্য লাগবে

/**
 * 🟢 1. Update Summary Cards (Top Section)
 * @param {Object} summary - { expense: 5000, debt: 200, balance: -5200 }
 */
export function updateSummaryCards(summary) {
    document.getElementById('total-expense').innerText = formatCurrency(summary.expense);
    document.getElementById('total-debt').innerText = formatCurrency(summary.debt);
    
    // ব্যালেন্স নেগেটিভ হলে লাল, পজিটিভ হলে সবুজ (যদিও এখানে ইনকাম নেই, সব নেগেটিভ হবে)
    const balanceEl = document.getElementById('balance');
    balanceEl.innerText = formatCurrency(summary.balance);
    
    if (summary.balance < 0) {
        balanceEl.classList.add('negative');
    } else {
        balanceEl.classList.remove('negative');
    }
}

/**
 * 🔵 2. Update Pivot Table (Category Summary)
 * @param {Object} breakdown - { "Food": 500, "Travel": 1200 }
 */
export function updatePivotTable(breakdown) {
    const tbody = document.getElementById('pivot-table-body');
    tbody.innerHTML = ''; // আগের ডাটা ক্লিয়ার

    const categories = Object.keys(breakdown);
    
    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center">No Data</td></tr>';
        return;
    }

    categories.forEach(cat => {
        const amount = breakdown[cat];
        const row = `
            <tr>
                <td>${cat}</td>
                <td><strong>${formatCurrency(amount)}</strong></td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

/**
 * 🟠 3. Update Main Transaction List
 * @param {Array} transactions - ডাটাবেস থেকে আসা লিস্ট
 */
export function updateTransactionList(transactions) {
    const tbody = document.getElementById('transaction-body');
    tbody.innerHTML = ''; // ক্লিয়ার

    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No transactions found.</td></tr>';
        return;
    }

    transactions.forEach(item => {
        const row = document.createElement('tr');
        
        // ক্যাটাগরি অনুযায়ী আইকন সেট করা (Optional beautification)
        let icon = 'folder';
        if(item.category === 'Food') icon = 'utensils';
        if(item.category === 'Transport') icon = 'car';
        if(item.category === 'Shopping') icon = 'shopping-bag';
        if(item.category === 'Bills') icon = 'file-invoice-dollar';

        row.innerHTML = `
            <td>${item.date}</td>
            <td><i class="fas fa-${icon}" style="margin-right:5px; color:#858796;"></i> ${item.category}</td>
            <td>${item.description || '-'}</td>
            <td style="font-weight:bold; color:#e74a3b;">${formatCurrency(item.amount)}</td>
            <td>
                <button class="btn-danger delete-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });

    // ডিলিট বাটনে ইভেন্ট লিসেনার লাগানো
    // (যেহেতু বাটনগুলো ডায়নামিকালি তৈরি হয়েছে)
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if(confirm('Are you sure you want to delete this expense?')) {
                try {
                    // UI থেকে ডিলিট করার আগে বাটনটা ডিজেবল করে দিই
                    e.currentTarget.innerText = '...';
                    
                    // ডাটাবেস থেকে ডিলিট করার জন্য কাস্টম ইভেন্ট ডিসপ্যাচ করছি
                    // যাতে app.js এটা হ্যান্ডেল করতে পারে
                    const event = new CustomEvent('request-delete', { detail: id });
                    document.dispatchEvent(event);
                    
                } catch (err) {
                    alert('Failed to delete');
                }
            }
        });
    });
}