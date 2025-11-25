import { db, auth } from "./firebase-config.js"; // auth ইম্পোর্ট করলাম
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    query, 
    where,    // ফিল্টার করার জন্য লাগবে
    orderBy,
    Timestamp 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const COLLECTION_NAME = "expenses";

/**
 * 🟢 ফাংশন ১: নতুন খরচ যোগ করা (Add Expense)
 * এখন ইউজারের ID সহ সেভ হবে
 */
export async function addExpense(expenseData) {
    try {
        // বর্তমানে লগইন থাকা ইউজারকে চেক করা
        const user = auth.currentUser;
        
        if (!user) {
            throw new Error("User not logged in! Cannot save data.");
        }

        const dataToSave = {
            uid: user.uid, // 🔑 এই ডাটা কার, তার আইডি
            date: expenseData.date,
            category: expenseData.category,
            description: expenseData.description,
            amount: parseFloat(expenseData.amount),
            createdAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
        console.log("Expense saved for User:", user.uid);
        return docRef.id;
    } catch (error) {
        console.error("Error adding expense: ", error);
        alert("Error saving data: " + error.message);
        throw error;
    }
}

/**
 * 🔵 ফাংশন ২: শুধু লগইন করা ইউজারের খরচ আনা (Get User Expenses)
 */
export async function getAllExpenses() {
    const expenses = [];
    try {
        const user = auth.currentUser;
        
        if (!user) {
            // ইউজার লগইন না থাকলে খালি লিস্ট পাঠাও
            console.warn("User not logged in. Returning empty list.");
            return [];
        }

        // কুয়েরি: যেখানে uid == currentUserId
        // এবং তারিখ অনুযায়ী সাজানো
        // Note: Firestore এ একাধিক ফিল্টার (where + orderBy) চালালে ইনডেক্স লাগে।
        // যদি এরর দেয়, কনসোলে একটা লিঙ্ক আসবে, ওটায় ক্লিক করে ইনডেক্স বানিয়ে নিও।
        
        // আপাতত সহজ কুয়েরি (পরে অ্যাপে সর্ট করে নেব)
        const q = query(
            collection(db, COLLECTION_NAME), 
            where("uid", "==", user.uid) 
        );
        
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
            expenses.push({ id: doc.id, ...doc.data() });
        });

        // জাভাস্ক্রিপ্ট দিয়ে সর্ট করছি (Firestore Index সমস্যা এড়াতে)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        return expenses;
    } catch (error) {
        console.error("Error fetching expenses: ", error);
        return [];
    }
}

/**
 * 🔴 ফাংশন ৩: খরচ ডিলিট করা
 */
export async function deleteExpense(id) {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        console.log("Document deleted successfully");
    } catch (error) {
        console.error("Error deleting expense: ", error);
        throw error;
    }
}