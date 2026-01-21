// 1. Firebase конфигурациясы - Сиздин базага туташуу үчүн паспорт сыяктуу
const firebaseConfig = {
    apiKey: "AIzaSyDXyv9sIAo2jHKMEZ0r9cYaUn4Q8af2KVA",
    authDomain: "yuanexchange-2fe09.firebaseapp.com",
    // Эң маанилүү сап ушул - бул сиздин базанын дареги:
    databaseURL: "https://yuanexchange-2fe09-default-rtdb.europe-west1.firebasedatabase.app", 
    projectId: "yuanexchange-2fe09",
    storageBucket: "yuanexchange-2fe09.firebasestorage.app",
    messagingSenderId: "1088132102402",
    appId: "1:1088132102402:web:2283f5f729627e65afaa1b",
    measurementId: "G-J3RY70ZBRV"
};

// 2. Firebaseти ишке киргизүү
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Баштапкы маалыматтар (Базадан келгенче убактылуу турат)
let settings = { t1: 13.3, t2: 13.17, t3: 13.05, promo: "Курс жүктөлүүдө..." };

// 3. БАЗАДАН МААЛЫМАТТЫ ЧЫНЫГЫ УБАКИИТТА АЛУУ
// Бул функция базада бир сан өзгөрсө, сайтыңызда дароо өзгөртүп турат
database.ref('exchangeSettings').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        settings = data;
        document.getElementById('promo-display').innerText = settings.promo;
        
        // Эгер сумма жазылып турса, кайра эсептеп коёт
        const sVal = document.getElementById('som-input').value;
        if(sVal) calculate('som');
    }
});

// 4. Эсептөө функциясы
function calculate(type) {
    const sIn = document.getElementById('som-input'), yIn = document.getElementById('yuan-input');
    const badge = document.getElementById('rate-badge'), rateText = document.getElementById('current-rate');
    let s = parseFloat(sIn.value), y = parseFloat(yIn.value);

    if (!s && !y) { badge.style.display = "none"; return; }
    badge.style.display = "block";

    let r = (type === 'som') ? getRate(s / settings.t2) : getRate(y);
    if (type === 'som') yIn.value = (s / r).toFixed(2); 
    else sIn.value = (y * r).toFixed(2);
    
    rateText.innerText = r;
}

function getRate(v) {
    if (v < 100) return settings.t1;
    if (v >= 100 && v < 3000) return settings.t2;
    return settings.t3;
}

// 5. АДМИН ПАНЕЛДЕН БАЗАГА САКТОО
function saveSettings() {
    const newData = {
        t1: parseFloat(document.getElementById('rate1').value) || settings.t1,
        t2: parseFloat(document.getElementById('rate2').value) || settings.t2,
        t3: parseFloat(document.getElementById('rate3').value) || settings.t3,
        promo: document.getElementById('admin-promo').value || settings.promo
    };

    // Бул маалыматты сиздин Бельгиядагы базаңызга жиберет
    database.ref('exchangeSettings').set(newData).then(() => {
        alert("Ийгиликтүү! Эми бардык кардарларда жаңы курс көрүнөт.");
        closeAdmin();
    }).catch(e => alert("Ката чыкты: " + e.message));
}

// 6. Башка көмөкчү функциялар
function setQuick(type, val) { document.getElementById(type + '-input').value = val; calculate(type); }
function resetField(type) { 
    const input = document.getElementById(type + '-input');
    input.value = ""; input.focus();
    calculate(type); 
}
function openAdmin() {
    let pass = prompt("Админ кодду жазыңыз:");
    if (pass === "777") {
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
    let msg = `Саламатсызбы! Алмаштыруу боюнча:\n🇰🇬 Жиберем: ${s} сом\n🇨🇳 Алам: ${y} юань\n📊 Курс: ${getRate(y)}`;
    window.open(`https://wa.me/996998792579?text=${encodeURIComponent(msg)}`);
}
