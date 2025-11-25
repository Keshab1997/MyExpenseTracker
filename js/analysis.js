// ---------------------------------------------------------
// ANALYSIS & LOGIC LAYER (The Brain 🧠)
// ---------------------------------------------------------

/**
 * 🟢 1. Currency Formatter
 * সংখ্যাকে রুপিতে কনভার্ট করবে (যেমন: 1200 -> ₹ 1,200.00)
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}

/**
 * 🔵 2. Filter Data
 * ইউজার যখন Date বা Category সিলেক্ট করবে, তখন এই ফাংশন ডাটা ছেঁকে দেবে
 */
export function filterData(allData, startDate, endDate, category) {
    return allData.filter(item => {
        const itemDate = new Date(item.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        // তারিখ চেক
        let isDateMatch = true;
        if (start && end) {
            isDateMatch = itemDate >= start && itemDate <= end;
        } else if (start) {
            isDateMatch = itemDate >= start; // শুধু শুরুর তারিখ দিলে
        }

        // ক্যাটাগরি চেক
        let isCategoryMatch = true;
        if (category && category !== 'all') {
            isCategoryMatch = item.category === category;
        }

        return isDateMatch && isCategoryMatch;
    });
}

/**
 * 🟠 3. Calculate Totals (For Top Cards)
 * মোট খরচ এবং ধারের হিসাব বের করবে
 */
export function calculateSummary(data) {
    let totalExpense = 0;
    let totalDebt = 0;

    data.forEach(item => {
        // যদি ক্যাটাগরি Loan হয়, তবে সেটা Debt এ যোগ হবে
        if (item.category === 'Loan') {
            totalDebt += item.amount;
        } else {
            // বাকি সব খরচ
            totalExpense += item.amount;
        }
    });

    return {
        expense: totalExpense,
        debt: totalDebt,
        // আপাতত ব্যালেন্স মানে নেগেটিভ খরচ দেখাচ্ছি (Income অপশন নেই তাই)
        balance: 0 - (totalExpense + totalDebt) 
    };
}

/**
 * 🟣 4. Group By Category (For Chart & Pivot Table)
 * কোন খাতে কত খরচ হয়েছে সেটা আলাদা করবে
 * Output Example: { "Food": 500, "Travel": 200 }
 */
export function getCategoryBreakdown(data) {
    const breakdown = {};

    data.forEach(item => {
        const cat = item.category;
        if (!breakdown[cat]) {
            breakdown[cat] = 0;
        }
        breakdown[cat] += item.amount;
    });

    return breakdown;
}