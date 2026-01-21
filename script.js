// Сиздин Firebase конфигурацияңыз
const firebaseConfig = {
    apiKey: "AIzaSyDXyv9sIAo2jHKMEZ0r9cYaUn4Q8af2KVA",
    authDomain: "yuanexchange-2fe09.firebaseapp.com",
    databaseURL: "https://yuanexchange-2fe09-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "yuanexchange-2fe09",
    storageBucket: "yuanexchange-2fe09.appspot.com",
    messagingSenderId: "1088132102402",
    appId: "1:1088132102402:web:2283f5f729627e65afaa1b"
};

// Firebaseти ишке киргизүү
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let settings = { t1: 13.3, t2: 13.17, t3: 13.05, promo: "Жүктөлүүдө..." };

// БАЗАДАН МААЛЫМАТТЫ ЧЫНЫГЫ УБАКИИТТА АЛУУ
database.ref('exchangeSettings').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        settings = data;
        document.getElementById('promo-display').innerText = settings.promo;
        
        // Маалымат жаңыланганда калькуляторду да жаңылап коёт
        if(document.getElementById('som-input').value) calculate('som');
    }
});

function calculate(type) {
    const sIn = document.getElementById('som-input'), yIn = document.getElementById('yuan-input');
    const badge = document.getElementById('rate-badge'), rateText = document.getElementById('current-rate');
    let s = parseFloat(sIn.value), y = parseFloat(yIn.value);

    if (!s && !y) { badge.style.display = "none"; return; }
    badge.style.display = "block";

    let r = (type === 'som') ? getRate(s / settings.t2) : getRate(y);
    if (type === 'som') yIn.value = (s / r).toFixed(2); else sIn.value = (y * r).toFixed(2);
    rateText.innerText = r;
}

function getRate(v) {
    if (v < 100) return settings.t1;
    if (v >= 100 && v < 3000) return settings.t2;
    return settings.t3;
}

function saveSettings() {
    const newData = {
        t1: parseFloat(document.getElementById('rate1').value) || settings.t1,
        t2: parseFloat(document.getElementById('rate2').value) || settings.t2,
        t3: parseFloat(document.getElementById('rate3').value) || settings.t3,
        promo: document.getElementById('admin-promo').value || settings.promo
    };

    database.ref('exchangeSettings').set(newData).then(() => {
        alert("Жөндөөлөр баарына сакталды!");
        closeAdmin();
    }).catch(e => alert("Ката: " + e.message));
}

function setQuick(type, val) { document.getElementById(type + '-input').value = val; calculate(type); }
function resetField(type) { 
    const input = document.getElementById(type + '-input');
    input.value = ""; input.focus();
    calculate(type); 
}
function openAdmin() { 
    if (prompt("Код:") === "777") {
        document.getElementById('admin-modal').style.display = "flex"; 
        document.getElementById('rate1').value = settings.t1;
        document.getElementById('rate2').value = settings.t2;
        document.getElementById('rate3').value = settings.t3;
        document.getElementById('admin-promo').value = settings.promo;
    }
}
function closeAdmin() { document.getElementById('admin-modal').style.display = "none"; }

function sendOrder() {
    const s = document.getElementById('som-input').value;
    const y = document.getElementById('yuan-input').value;
    if(!s) return alert("Сумманы жазыңыз!");
    let msg = `Саламатсызбы! Алмаштыруу боюнча:\n🇰🇬 Сом: ${s}\n🇨🇳 Юань: ${y}\n📊 Курс: ${getRate(y)}`;
    window.open(`https://wa.me/996998792579?text=${encodeURIComponent(msg)}`);
}