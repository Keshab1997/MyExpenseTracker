// Global variable to store the chart instance
// (এটা দরকার, নাহলে পুরনো চার্টের ওপর নতুন চার্ট আঁকিবুঁকি করবে)
let expenseChartInstance = null;

/**
 * 📊 Render or Update the Chart
 * @param {Object} categoryData - Example: { "Food": 500, "Travel": 1200 }
 */
export function renderExpenseChart(categoryData) {
    const ctx = document.getElementById('expenseChart').getContext('2d');

    // 1. ডাটা আলাদা করা (Labels & Values)
    const labels = Object.keys(categoryData); // ["Food", "Travel", "Bills"]
    const data = Object.values(categoryData); // [500, 1200, 3000]

    // 2. কালার প্যালেট (Colors) - অ্যাপের থিমের সাথে মিল রেখে
    const backgroundColors = [
        '#4e73df', // Blue
        '#1cc88a', // Green
        '#36b9cc', // Turquoise
        '#f6c23e', // Yellow
        '#e74a3b', // Red
        '#858796', // Grey
        '#6610f2', // Purple
        '#e83e8c'  // Pink
    ];

    // 3. যদি আগে কোনো চার্ট থাকে, সেটা ডিলিট করো (Destroy)
    // এটা না করলে চার্ট একটার ওপর আরেকটা ওভারল্যাপ হবে
    if (expenseChartInstance) {
        expenseChartInstance.destroy();
    }

    // 4. নতুন চার্ট তৈরি করো
    expenseChartInstance = new Chart(ctx, {
        type: 'doughnut', // 'pie' বা 'bar' ও দেওয়া যায়
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                hoverOffset: 4,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // CSS এর হাইট অনুযায়ী ফিট হবে
            cutout: '70%', // মাঝখানের গর্ত কতটা বড় হবে
            plugins: {
                legend: {
                    position: 'bottom', // লেবেল নিচে দেখাবে
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            // টুলটিপে কারেন্সি সিম্বল (₹) যোগ করা
                            label += '₹ ' + context.raw;
                            return label;
                        }
                    }
                }
            }
        }
    });
}