// Firebase Configuration
const firebaseConfig = { databaseURL: "https://yuanexchange-2fe09-default-rtdb.europe-west1.firebasedatabase.app/" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Default values (Если интернет офлайн)
let settings = { 
    ali: {t1:13.1, t2:13.0, t3:12.9}, 
    we: {t1:13.2, t2:13.1, t3:13.0}, 
    promo: "Курс жаңыртылууда...", 
    bank: {number: "0000000000", owner: "Жүктөлүүдө..."} 
};

let currentApp = 'Alipay', currentLang = 'ky', clickCount = 0;

const translations = {
    ky: { hello: "Саламатсызбы!", send: "Сом жибересиз", receive: "Юань аласыз", other: "Башка", copy: "Көчүрүү", main: "АЛМАШТЫРУУ ЖАНА ЧЕК ЖИБЕРҮҮ", s1: "Сумма жаз", s2: "Котор", s3: "Чек жибер" },
    ru: { hello: "Здравствуйте!", send: "Вы отправляете", receive: "Вы получаете", other: "Другая", copy: "Копировать", main: "ОБМЕНЯТЬ И ОТПРАВИТЬ ЧЕК", s1: "Сумма", s2: "Перевод", s3: "Чек" }
};

// Real-time Update
db.ref('exchangeSettings').on('value', (s) => {
    if(s.exists()) { 
        settings = s.val(); 
        updateUI();
    }
}, (error) => console.log("Firebase Error:", error));

function updateUI() {
    document.getElementById('promo-display').innerText = settings.promo; 
    document.getElementById('bank-number').innerText = settings.bank.number;
    document.querySelector('.bank-owner').innerText = settings.bank.owner;
    calculate('som'); 
}

function calculate(type) {
    const sIn = document.getElementById('som-input'), yIn = document.getElementById('yuan-input');
    const r = (currentApp === 'Alipay') ? settings.ali : settings.we;
    
    if(type === 'som') {
        let v = parseFloat(sIn.value); 
        if(!v) { yIn.value = ""; return; }
        let rate = v < 2000 ? r.t1 : (v < 15000 ? r.t2 : r.t3);
        yIn.value = (v / rate).toFixed(2);
        document.getElementById('current-rate').innerText = rate;
    } else {
        let v = parseFloat(yIn.value); 
        if(!v) { sIn.value = ""; return; }
        let rate = v < 150 ? r.t1 : (v < 1100 ? r.t2 : r.t3);
        sIn.value = Math.round(v * rate);
        document.getElementById('current-rate').innerText = rate;
    }
}

function sendOrder() {
    const som = document.getElementById('som-input').value;
    const yuan = document.getElementById('yuan-input').value;
    if(!som || !yuan) { alert(currentLang === 'ky' ? "Сумманы толтуруңуз!" : "Введите сумму!"); return; }
    
    // Save to Firebase
    db.ref('orders').push({
        amountSom: som,
        amountYuan: yuan,
        app: currentApp,
        date: new Date().toLocaleString()
    });

    const text = `Заказ: ${som} сом -> ${yuan} ¥ (${currentApp})`;
    const phone = settings.bank.number.replace(/\s/g, '');
    window.open(`https://wa.me/996${phone.substring(1)}?text=${encodeURIComponent(text)}`, '_blank');
}

// Pages Logic
function showPage(pId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pId).classList.add('active');
    window.scrollTo(0,0);
    if(pId === 'page-reviews') loadReviews();
    toggleMenu(false);
}

function loadReviews() {
    db.ref('reviews').limitToLast(20).on('value', (s) => {
        const cont = document.getElementById('reviews-container');
        cont.innerHTML = "";
        if(!s.exists()) { cont.innerHTML = "<p style='text-align:center;color:gray;'>Азырынча пикир жок</p>"; return; }
        s.forEach(c => {
            const r = c.val();
            cont.innerHTML = `<div class="review-card"><strong>${r.name}:</strong><p>${r.text}</p></div>` + cont.innerHTML;
        });
    });
}

function submitReview() {
    const n = document.getElementById('rev-name').value, t = document.getElementById('rev-text').value;
    if(!n || !t) return alert("Толтуруңуз!");
    db.ref('reviews').push({ name: n, text: t, date: new Date().toISOString() }).then(() => {
        document.getElementById('rev-name').value = ""; 
        document.getElementById('rev-text').value = "";
        alert("Рахмат!");
    });
}

// Helpers
function switchLang(l) {
    currentLang = l; const t = translations[l];
    Object.keys(t).forEach(key => {
        const el = document.getElementById(key.startsWith('s') ? 'step-'+key[1] : 'txt-'+key || 'lbl-'+key || 'btn-'+key);
        // Manual fix for IDs
    });
    // Simplified Lang Update
    document.getElementById('txt-hello').innerText = t.hello;
    document.getElementById('lbl-send').innerText = t.send;
    document.getElementById('lbl-receive').innerText = t.receive;
    document.getElementById('btn-main').innerText = t.main;
    document.getElementById('step-1').innerText = t.s1;
    document.getElementById('step-2').innerText = t.s2;
    document.getElementById('step-3').innerText = t.s3;
    document.getElementById('btn-ky').classList.toggle('active', l==='ky');
    document.getElementById('btn-ru').classList.toggle('active', l==='ru');
}

function setVal(type, val) { document.getElementById(type + '-input').value = val; calculate(type); }
function focusInput(id) { const el = document.getElementById(id); el.value = ""; el.focus(); }
function setApp(app) {
    currentApp = app;
    document.getElementById('ali-btn').classList.toggle('active', app === 'Alipay');
    document.getElementById('we-btn').classList.toggle('active', app === 'WeChat');
    calculate('som');
}
function toggleMenu(o = null) {
    const m = document.getElementById('side-menu');
    if(o === false) m.classList.remove('active'); else m.classList.toggle('active');
}
function copyNum() {
    const num = settings.bank.number.replace(/\s/g, '');
    navigator.clipboard.writeText(num).then(() => {
        const t = document.getElementById('copy-toast');
        t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 2000);
    });
}
function adminTrigger() {
    clickCount++;
    if(clickCount === 5) { // 5 жолу басканда
        let p = prompt("Password:");
        if(p === "777") window.location.href="admin.html";
        clickCount = 0;
    }
}
window.onload = () => { switchLang('ky'); updateUI(); };