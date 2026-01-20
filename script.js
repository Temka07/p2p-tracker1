let settings = JSON.parse(localStorage.getItem('yuan_app_data')) || {
    t1: 13.3, t2: 13.17, t3: 13.05,
    promo: "Бул жерге сиздин маанилүү жарнамаңыз чыгат"
};

function refresh() {
    document.getElementById('promo-display').innerText = settings.promo;
}

function calculate(type) {
    const sIn = document.getElementById('som-input');
    const yIn = document.getElementById('yuan-input');
    const badge = document.getElementById('rate-badge');
    const rateText = document.getElementById('current-rate');
    
    let s = parseFloat(sIn.value), y = parseFloat(yIn.value);
    if (!s && !y) { badge.style.display = "none"; return; }
    badge.style.display = "block";

    if (type === 'som') {
        let r = getRate(s / settings.t2);
        yIn.value = (s / r).toFixed(2);
        rateText.innerText = r;
    } else {
        let r = getRate(y);
        sIn.value = (y * r).toFixed(2);
        rateText.innerText = r;
    }
}

function getRate(v) {
    if (v < 100) return settings.t1;
    if (v >= 100 && v < 3000) return settings.t2;
    return settings.t3;
}

function setQuick(type, val) {
    document.getElementById(type + '-input').value = val;
    calculate(type);
}

function resetField(type) {
    const input = document.getElementById(type + '-input');
    input.value = ""; input.focus();
    calculate(type);
}

function openAdmin() { if (prompt("Код:") === "777") document.getElementById('admin-modal').style.display = "flex"; }
function closeAdmin() { document.getElementById('admin-modal').style.display = "none"; }

function saveSettings() {
    settings = {
        t1: parseFloat(document.getElementById('rate1').value) || settings.t1,
        t2: parseFloat(document.getElementById('rate2').value) || settings.t2,
        t3: parseFloat(document.getElementById('rate3').value) || settings.t3,
        promo: document.getElementById('admin-promo').value || settings.promo
    };
    localStorage.setItem('yuan_app_data', JSON.stringify(settings));
    refresh(); closeAdmin();
}

function sendOrder() {
    const s = document.getElementById('som-input').value;
    const y = document.getElementById('yuan-input').value;
    if (!s) return alert("Сумманы жазыңыз!");
    window.open(`https://wa.me/996998792579?text=${encodeURIComponent("Саламатсызбы!\nАлмаштыруу: "+s+" сом -> "+y+" юань")}`);
}

refresh();