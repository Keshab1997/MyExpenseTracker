export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

export function filterData(allData, startDate, endDate, category) {
    return allData.filter(item => {
        const d = new Date(item.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        const dateMatch = (!start || d >= start) && (!end || d <= end);
        const catMatch = (category === 'all' || !category) ? true : item.category === category;
        
        return dateMatch && catMatch;
    });
}

// 🆕 নতুন লজিক: ইনকাম, এক্সপেন্স এবং ধারের হিসাব
export function calculateSummary(data) {
    let totalIncome = 0;
    let totalExpense = 0;
    let currentDebt = 0; // আমি মানুষের কাছে ঋণী

    data.forEach(item => {
        if (item.type === 'income') {
            totalIncome += item.amount;
        } else if (item.type === 'expense') {
            totalExpense += item.amount;
        } else if (item.type === 'debt') {
            // ধার নিলে হাতে টাকা আসে (Balance বাড়ে), কিন্তু ঋণ বাড়ে
            totalIncome += item.amount; 
            currentDebt += item.amount;
        }
    });

    const currentBalance = totalIncome - totalExpense; // হাতে কত আছে

    return {
        income: totalIncome,
        expense: totalExpense,
        debt: currentDebt,
        balance: currentBalance
    };
}

export function getCategoryBreakdown(data) {
    const breakdown = {};
    // শুধু খরচগুলো চার্টে দেখাব
    data.filter(i => i.type === 'expense').forEach(item => {
        breakdown[item.category] = (breakdown[item.category] || 0) + item.amount;
    });
    return breakdown;
}