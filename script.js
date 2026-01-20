let settings = JSON.parse(localStorage.getItem('yuan_app_data')) || {
    t1: 13.3, t2: 13.15, t3: 13.05,
    promo: "Бүгүн курс абдан жакшы! Тез алмаштырып калыңыз."
};

function refresh() {
    document.getElementById('promo-text').innerText = settings.promo;
    document.getElementById('current-rate').innerText = settings.t2;
}

function calculate(type) {
    const somInput = document.getElementById('som-input');
    const yuanInput = document.getElementById('yuan-input');
    
    if (type === 'som') {
        let som = parseFloat(somInput.value);
        if (!som) { yuanInput.value = ""; return; }
        let rate = getRate(som / settings.t2);
        yuanInput.value = (som / rate).toFixed(2);
        document.getElementById('current-rate').innerText = rate;
    } else {
        let yuan = parseFloat(yuanInput.value);
        if (!yuan) { somInput.value = ""; return; }
        let rate = getRate(yuan);
        somInput.value = (yuan * rate).toFixed(2);
        document.getElementById('current-rate').innerText = rate;
    }
}

function getRate(yuan) {
    if (yuan < 100) return settings.t1;
    if (yuan >= 100 && yuan < 3000) return settings.t2;
    return settings.t3;
}

function openAdmin() {
    if (prompt("Код:") === "777") {
        document.getElementById('admin-modal').style.display = "block";
        document.getElementById('rate1').value = settings.t1;
        document.getElementById('rate2').value = settings.t2;
        document.getElementById('rate3').value = settings.t3;
        document.getElementById('admin-promo').value = settings.promo;
    }
}

function closeAdmin() { document.getElementById('admin-modal').style.display = "none"; }

function saveSettings() {
    settings = {
        t1: parseFloat(document.getElementById('rate1').value),
        t2: parseFloat(document.getElementById('rate2').value),
        t3: parseFloat(document.getElementById('rate3').value),
        promo: document.getElementById('admin-promo').value
    };
    localStorage.setItem('yuan_app_data', JSON.stringify(settings));
    refresh();
    closeAdmin();
}

function sendOrder() {
    const som = document.getElementById('som-input').value;
    const yuan = document.getElementById('yuan-input').value;
    const rate = document.getElementById('current-rate').innerText;
    if (!som) return alert("Сумма жазыңыз!");

    const text = `Салам! Заказ:\n🇰🇬 Сом: ${som}\n🇨🇳 Юань: ${yuan}\n📊 Курс: ${rate}`;
    window.open(`https://wa.me/996998792579?text=${encodeURIComponent(text)}`);
}

refresh();