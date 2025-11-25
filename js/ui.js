// js/ui.js
import { formatCurrency } from './analysis.js';

/**
 * 🟢 1. Update Summary Cards (Top Section)
 */
export function updateSummaryCards(summary) {
    // Total Expense
    document.getElementById('total-expense').innerText = formatCurrency(summary.expense);
    
    // Current Debt
    document.getElementById('total-debt').innerText = formatCurrency(summary.debt);
    
    // Current Balance (Income - Expense)
    const balanceEl = document.getElementById('balance');
    balanceEl.innerText = formatCurrency(summary.balance);
    
    // Color Logic for Balance
    if (summary.balance < 0) {
        balanceEl.style.color = "#e74a3b"; // Red (Negative)
    } else {
        balanceEl.style.color = "#1cc88a"; // Green (Positive)
    }
}

/**
 * 🔵 2. Update Pivot Table (Category Summary)
 * (এই ফাংশনটাই মিসিং ছিল, যার কারণে এরর আসছিল)
 */
export function updatePivotTable(breakdown) {
    const tbody = document.getElementById('pivot-table-body');
    tbody.innerHTML = ''; // আগের ডাটা ক্লিয়ার

    const categories = Object.keys(breakdown);
    
    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; color:#888;">No expenses yet.</td></tr>';
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
 */
export function updateTransactionList(transactions) {
    const tbody = document.getElementById('transaction-body');
    tbody.innerHTML = ''; // ক্লিয়ার

    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">No transactions found. Add one!</td></tr>';
        return;
    }

    transactions.forEach(item => {
        const row = document.createElement('tr');
        
        let icon = 'folder';
        let color = '#4e73df'; // Default Blue
        let descText = item.description;
        let amountPrefix = '';

        // টাইপ অনুযায়ী কালার এবং টেক্সট লজিক
        if (item.type === 'expense') {
            color = '#e74a3b'; // Red
            amountPrefix = '- ';
            // Icons based on category
            if(item.category === 'Food') icon = 'utensils';
            else if(item.category === 'Transport') icon = 'car';
            else if(item.category === 'Shopping') icon = 'shopping-bag';
            else if(item.category === 'Bills') icon = 'file-invoice-dollar';
        } 
        else if (item.type === 'income') {
            color = '#1cc88a'; // Green
            icon = 'arrow-down';
            amountPrefix = '+ ';
        } 
        else if (item.type === 'debt') {
            color = '#f6c23e'; // Yellow
            icon = 'hand-holding-usd';
            amountPrefix = '+ ';
            // ধারের ক্ষেত্রে নাম দেখাও
            descText = `Borrowed from: <strong>${item.person || 'Unknown'}</strong> <br> <small style="color:#888;">${item.description}</small>`;
        }

        row.innerHTML = `
            <td>${item.date}</td>
            <td>
                <i class="fas fa-${icon}" style="margin-right:5px; color:${color};"></i> 
                <span style="text-transform:capitalize;">${item.category || item.type}</span>
            </td>
            <td>${descText || '-'}</td>
            <td style="font-weight:bold; color:${color}; white-space: nowrap;">
                ${amountPrefix}${formatCurrency(item.amount)}
            </td>
            <td>
                <button class="btn-danger delete-btn" data-id="${item.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });

    // ডিলিট বাটনে ইভেন্ট লিসেনার লাগানো
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // বাটন বা আইকনে ক্লিক করলে ID খোঁজা
            const id = e.currentTarget.getAttribute('data-id');
            
            // app.js কে সিগন্যাল পাঠানো
            const event = new CustomEvent('request-delete', { detail: id });
            document.dispatchEvent(event);
        });
    });
}