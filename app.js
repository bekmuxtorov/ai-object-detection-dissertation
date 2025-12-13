// Classifier Variable
let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/W8VUaGfbD/';

// Video
let video;
let label = "";
let confidence = 0.0;
let isModelReady = false;

// Ramka rangi (statusga qarab o'zgaradi)
let boxColor = [255, 255, 255]; // Oq (boshlanishida)

function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json', () => {
        console.log("Model yuklandi!");
        isModelReady = true;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('result-box').style.display = 'block';
    });
}

function setup() {
    // Ekranga moslashuvchan canvas
    let w = window.innerWidth > 600 ? 640 : window.innerWidth;
    let h = w * 1.33; // 4:3 nisbat

    let canvas = createCanvas(w, h);
    canvas.parent('canvas-container');

    let constraints = {
        audio: false,
        video: {
            facingMode: "environment"
        }
    };

    video = createCapture(constraints, function (stream) {
        console.log("Kamera ishga tushdi");
    });

    // Fallback
    if (!video) {
        video = createCapture(VIDEO);
    }

    video.size(w, h);
    video.hide();

    classifyVideo();
}

function draw() {
    background(0);

    // 1. Videoni chizish
    if (video) {
        image(video, 0, 0, width, height);
    }

    // 2. Qoraytirilgan fon (Overlay)
    // Markazni yorug' qoldirib, chetlarni qoraytiramiz (Fokus effekti)
    fill(0, 0, 0, 100); // Yarim shaffof qora
    rect(0, 0, width, height);

    // 3. "Nishon Ramkasi"ni (Target Box) kesib olish
    // Bu 'erase' effekti yordamida markazni shaffof qilamiz
    // (P5.js da oddiy yo'li: shunchaki ramka chizamiz, atrofi qoraygan bo'lsa kifoya)

    // Ramka o'lchami
    let boxW = width * 0.7;
    let boxH = boxW; // Kvadrat ramka
    let boxX = (width - boxW) / 2;
    let boxY = (height - boxH) / 2;

    // Markaziy qismni 'toza' (yorug') qilib ko'rsatish uchun videoni qayta kesib chizamiz
    // Bu professional 'scan' effektini beradi
    if (video) {
        let videoRegion = video.get(boxX, boxY, boxW, boxH);
        image(videoRegion, boxX, boxY, boxW, boxH);
    }

    // 4. Ramka chiziqlarini chizish
    noFill();
    stroke(boxColor[0], boxColor[1], boxColor[2]); // Rang o'zgaruvchan
    strokeWeight(4);

    // Burchakli ramka dizayni (Professional ko'rinish)
    let lineLen = 30; // Burchak chizig'i uzunligi

    // Tep-chap
    line(boxX, boxY, boxX + lineLen, boxY);
    line(boxX, boxY, boxX, boxY + lineLen);

    // Tep-o'ng
    line(boxX + boxW, boxY, boxX + boxW - lineLen, boxY);
    line(boxX + boxW, boxY, boxX + boxW, boxY + lineLen);

    // Past-chap
    line(boxX, boxY + boxH, boxX + lineLen, boxY + boxH);
    line(boxX, boxY + boxH, boxX, boxY + boxH - lineLen);

    // Past-o'ng
    line(boxX + boxW, boxY + boxH, boxX + boxW - lineLen, boxY + boxH);
    line(boxX + boxW, boxY + boxH, boxX + boxW, boxY + boxH - lineLen);

    // 5. Agar aniqlansa, obyekt nomini ramka ustiga ham yozish (optional)
    if (confidence > 0.85) {
        noStroke();
        fill(boxColor);
        textAlign(CENTER);
        textSize(16);
        text(label, width / 2, boxY - 15);
    }
}

function classifyVideo() {
    classifier.classify(video, gotResult);
}

function gotResult(error, results) {
    if (error) {
        console.error(error);
        return;
    }

    // Natijani olish
    let topResult = results[0];
    let currentConf = topResult.confidence;

    // HTML elementlar
    let labelDiv = document.getElementById('label');
    let confDiv = document.getElementById('confidence');
    let resultBox = document.getElementById('result-box');

    // Mantiq: Faqat ishonch yuqori bo'lsa ko'rsatish
    if (currentConf > 0.85) {
        label = topResult.label;
        confidence = currentConf;

        // Ekranga chiqarish
        labelDiv.innerText = label;
        confDiv.innerText = (confidence * 100).toFixed(1) + "% Ishonch";

        // Ramka va matn rangi: YASHIL
        boxColor = [0, 255, 157]; // Neon yashil
        labelDiv.style.color = "#00ff9d";
        resultBox.style.borderColor = "#00ff9d";

    } else {
        // Agar aniq topa olmasa
        label = "OBYEKTNI JOYLASHTIRING";
        confidence = 0;

        labelDiv.innerText = "...";
        confDiv.innerText = "Qidirilmoqda...";

        // Ramka rangi: OQ yoki SARIQ
        boxColor = [255, 255, 255];
        labelDiv.style.color = "#ffffff";
        resultBox.style.borderColor = "rgba(255,255,255,0.2)";
    }

    classifyVideo();
}

// Oyna o'lchami o'zgarsa
function windowResized() {
    let w = window.innerWidth > 600 ? 640 : window.innerWidth;
    let h = w * 1.33;
    resizeCanvas(w, h);
    if (video) video.size(w, h);
}