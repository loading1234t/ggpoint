// firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getDatabase, ref, onValue, set, remove, update, push, query, orderByChild } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js';

// Конфиг Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDcyOWAF7TA8h8P36Sk5EbDPzA9sEFuTXo",
    authDomain: "ggpoint-shop.firebaseapp.com",
    databaseURL: "https://ggpoint-shop-default-rtdb.firebaseio.com",
    projectId: "ggpoint-shop",
    storageBucket: "ggpoint-shop.firebasestorage.app",
    messagingSenderId: "182227173652",
    appId: "1:182227173652:web:0949e2edae9900afd98201",
    measurementId: "G-V76H7K3VR4"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Экспорт для использования в других файлах
export { database, ref, onValue, set, remove, update, push, query, orderByChild };
export default app;
