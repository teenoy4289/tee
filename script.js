// --- Global Data Store (เชื่อมโยงข้อมูลทั้งหมด) ---
let globalData = {};
let generatedContents = {};
let mockImageGallery = [];

// --- 1. Data Linking and Generation Controller ---
function collectInput() {
    globalData.productName = document.getElementById('product-name').value;
    globalData.productDetails = document.getElementById('product-details').value;
    globalData.targetAudience = document.getElementById('target-audience').value;
    globalData.tone = document.getElementById('tone').value;
    globalData.scene1Goal = document.getElementById('scene1-goal').value;
    globalData.scene1Camera = document.getElementById('scene1-camera').value;

    if (!globalData.productName || !globalData.productDetails) {
        alert("กรุณากรอกชื่อสินค้าและรายละเอียดสินค้าให้ครบถ้วน");
        return false;
    }
    return true;
}

async function generateAllContent() {
    if (!collectInput()) return;

    document.getElementById('loading-indicator').style.display = 'block';

    // 1. Generate Character ID (Face Lock Logic)
    generatedContents.characterID = generateCharacterID(globalData);
    document.getElementById('character-id-display').innerHTML = `<strong>Consistent Subject ID:</strong> ${generatedContents.characterID}`;

    // 2. Generate Sora 2 Prompt
    generatedContents.soraPrompts = generateSoraPrompt(globalData, generatedContents.characterID);
    displaySoraOutput(generatedContents.soraPrompts);

    // 3. Generate Content (FB, TikTok, Shopee, Voice)
    generatedContents.facebook = generateContent('FB', globalData);
    displayContent('fb-output', 'Facebook/Instagram', generatedContents.facebook);

    generatedContents.tiktok = generateContent('TikTok', globalData);
    generatedContents.shopee = generateContent('Shopee', globalData);
    displayTiktokShopee(generatedContents.tiktok, generatedContents.shopee);
    
    generatedContents.voice = generateContent('Voice', globalData);
    displayContent('voice-output', 'Voice Review', generatedContents.voice);

    // 4. Generate Image Prompts (Text-to-Image)
    generatedContents.imagePrompts = generateImagePrompt(globalData, generatedContents.characterID);
    displayContent('image-prompt-output', 'Image Generation', generatedContents.imagePrompts);

    // 5. Simulate Image Gallery (for Export Test)
    mockImageGallery = [{name: "Image 1", url: "mock_url_1"}, {name: "Image 2", url: "mock_url_2"}];
    displayGallery();

    document.getElementById('loading-indicator').style.display = 'none';
    alert("สร้างเนื้อหาครบถ้วนแล้ว! กรุณาตรวจสอบในแท็บต่างๆ");
}

// --- 2. Prompt & Content Generation Functions ---

// **Character Consistency (Same Face 100%) Logic**
function generateCharacterID(data) {
    // Logic: AI creates a unique, detailed character description based on Target/Tone
    const details = data.productDetails.substring(0, 50) + '...';
    let style = '';
    if (data.tone.includes('Luxe')) style = 'highly elegant, poised, expensive-looking';
    else if (data.tone.includes('Energetic')) style = 'dynamic, vibrant, charismatic';
    else style = 'natural, friendly, professional';

    // Same face ID generation
    return `A photorealistic, specific face ID for a ${style} woman/man in their 30s, reflecting the aspirations of the target audience (${data.targetAudience}). This exact face must be maintained 100% across all scenes.`;
}

// **Sora 2 Video Prompt (ข้อ 4)**
function generateSoraPrompt(data, charID) {
    const scene2Goal = 'Solution / Product Reveal Scene'; // Hardcode for powerful demo
    const scene2Camera = 'Slow Zoom';
    
    // Convert Thai camera terms to powerful English prompts
    const cameraMap = {
        'Close-Up': 'Ultra-detailed cinematic close-up shot, 8K resolution, focusing intensely on the subject’s expression.',
        'Medium Shot': 'A perfectly framed medium shot, cinematic depth of field, natural lighting.',
        // Add all 8 required camera angles here...
    };

    const masterPrompt = `ULTRA-POWERFUL PROMPT. ${charID}. Style: Cinematic 8K video, film grain, Arri Alexa footage, Photorealistic, Detailed environment, ${data.tone}.`;

    const scene1 = `SCENE 1 (15 seconds): ${masterPrompt} Goal: ${data.scene1Goal}. Camera: ${cameraMap[data.scene1Camera]}. Subject is demonstrating the problem (e.g., tired look) in a high-end office setting. The mood is tense.`;
    
    const scene2 = `SCENE 2 (15 seconds): ${masterPrompt} Goal: ${scene2Goal}. Camera: ${cameraMap[scene2Camera]}. Same Subject is now smiling, showing immediate, radiant results after using the product. The environment is bright and luxurious. The product (${data.productName}) is revealed dramatically.`;
    
    return [
        { title: "Prompt Set 1 (Dramatic Transformation)", prompt1: scene1, prompt2: scene2 },
        // ... Simulate other contexts (e.g., Comedy, Educational) ...
    ];
}

// **Content Generator (ข้อ 1, 2, 3, 6)**
function generateContent(platform, data) {
    let output = [];
    const name = data.productName;
    const detail = data.productDetails.split(',')[0];
    const target = data.targetAudience.split(',')[0];

    if (platform === 'FB') {
        const hashtags = `#${name.replace(/\s/g, '')} #รีวิวหยุดนิ้ว #ของดีบอกต่อ #SEO_Product #แคปชั่นปัง #ซื้อเถอะ #ใช้ดีจริง #${data.tone.split('/')[0].trim()} #สกินแคร์`;
        output.push({
            style: "รีวิวส่วนตัว (เป็นกันเอง)",
            text: `แกกกก! หยุดก่อน! ใครมีปัญหาแบบฉันคือต้องลองสิ่งนี้จริงๆ นะ (${name}) คือมันเริ่ดเกินเบอร์ไปมาก! ตอนแรกไม่เชื่อหรอกว่า ${detail} จะทำได้จริง แต่ดูผิวฉันตอนนี้สิ! มันแบบ... สะกดจิตให้คนอยากซื้อทันที!`,
            hashtags: hashtags
        });
        output.push({
            style: "ตั้งคำถามปัญหา (ดึงดูด)",
            text: `ถามจริง! ชีวิตนี้จะยอมให้ ${target} มาทำร้ายผิวเราอีกนานแค่ไหน? ${name} ตัวนี้คือคำตอบสุดท้าย! ลองใช้มาแล้วบอกเลยว่าโคตรธรรมชาติ ไม่ต้องใช้คำทางการให้เสียเวลา นี่คือรีวิวจากใจผู้ใช้จริง!`,
            hashtags: hashtags
        });
    } else if (platform === 'TikTok') {
        // Mock 5 styles for TikTok
        output.push({ style: "สนุกสนาน", text: `ว้าย! เผยผิวสวยสู้กล้อง! ${name} ไม่ใช่แค่เซรั่ม แต่คือเพื่อนซี้ที่ทำให้ชีวิตสดใส! ลองยัง?`, hashtags: `#TikTokMadeMeBuyIt #HowToBeauty` });
    } else if (platform === 'Shopee') {
        // Mock 5 styles for Shopee
        output.push({ style: "โปรโมชั่น", text: `🔥 โคตรคุ้ม! ${name} ลดกระหน่ำ 50%! กดใส่ตะกร้าด่วน! ของมีจำกัด!`, hashtags: `#โค้ดส่วนลด #ShopeeTH #โปรเด็ด` });
    } else if (platform === 'Voice') {
         output.push({
            style: "รีวิวธรรมชาติ (30-50 วินาที)",
            text: `(35 วินาที) ...โอเคเลยนะ ไม่ต้องเสียเวลาเกริ่นอะไรเยอะแยะเลย คือฉันจะบอกว่า ${name} ตัวนี้มันว้าวมาก ฉันใช้มา ${detail} แล้วรู้สึกว่าผิวเปลี่ยนไปเยอะมาก ปกติมีปัญหา ${target} ใช่มั้ย พอมาลองตัวนี้คือมันเห็นผลแบบจริงใจเลยอะ ฟีลลิ่งเหมือนเราไปปรึกษาเพื่อนแล้วเพื่อนแนะนำของดีจริงๆ ไม่ได้จ้างมาพูด คือดีจนต้องเอามาบอกต่อแค่นั้นแหละ`,
            hashtags: ''
        });
    }
    return output;
}

// **Image Prompt Generator (ข้อ 5, 10)**
function generateImagePrompt(data, charID) {
    const productID = `Product ID: Highly reflective glass bottle, gold accent, clean minimalist design.`; // I2P Simulation
    const master = `A highly detailed, 16K, photorealistic advertisement image. Cinematic lighting.`;

    return [
        { 
            style: "Luxe Studio", 
            prompt: `${master} ${charID} holds the ${data.productName} in a white, marble studio with soft, diffused golden light. ${productID}. Elegant pose.` 
        },
        { 
            style: "Outdoor Energetic", 
            prompt: `${master} ${charID} is running and smiling in a sunny, urban park. She pauses to quickly apply the ${data.productName} on her cheek. ${productID}. Dynamic angle.` 
        },
        // ... Simulate 7 more styles ...
    ];
}


// --- 3. Display Functions ---

function displaySoraOutput(prompts) {
    let html = '<h4>Prompt ที่ทรงพลังที่สุดสำหรับ Sora 2 (Same Face Lock)</h4>';
    prompts.forEach((item, index) => {
        html += `<div class="output-box">
            <strong>บริบททางเลือกที่ ${index + 1}: ${item.title}</strong>
            <p><strong>Master Character ID:</strong> ${generatedContents.characterID}</p>
            <p><strong>Scene 1 Prompt:</strong> ${item.prompt1}</p>
            <p><strong>Scene 2 Prompt:</strong> ${item.prompt2}</p>
            <button onclick="copyToClipboard('${item.prompt1.replace(/'/g, "\\'") + ' ' + item.prompt2.replace(/'/g, "\\'")}')">คัดลอก Prompt ทั้งหมด</button>
        </div>`;
    });
    document.getElementById('sora-output').innerHTML = html;
}

function displayContent(elementId, title, contents) {
    let html = `<h4>${title} (${contents.length} บริบท)</h4>`;
    contents.forEach((item, index) => {
        html += `<div class="output-box">
            <strong>สไตล์: ${item.style}</strong>
            <p>${item.text}</p>
            <p class="hashtags">${item.hashtags}</p>
            <button onclick="copyToClipboard('${item.text.replace(/'/g, "\\'") + ' ' + item.hashtags.replace(/'/g, "\\'")}')">คัดลอก</button>
        </div>`;
    });
    document.getElementById(elementId).innerHTML = html;
}

function displayTiktokShopee(tiktok, shopee) {
    displayContent('tiktok-output', 'TikTok Captions (5 Styles)', tiktok);
    displayContent('shopee-output', 'Shopee Captions (5 Styles)', shopee);
}

// --- 4. I2P & Gallery Functions (ข้อ 8, 10, 11) ---

function analyzeImageMock(files) {
    // Simulates Image Processing Logic for Product ID creation (Backend)
    if (files.length === 0) return;
    
    // Mock analysis result
    const mockAnalysis = `
        **Product Analysis Result (Simulated):**
        - Dominant Color: RGB(255, 204, 0) - (Gold)
        - Texture: Smooth, high-gloss finish
        - Shape: Cylindrical, elegant
        - Resulting Product ID for Prompt: A highly reflective glass bottle with gold accent, clean minimalist cylindrical design, high-gloss finish.
    `;
    document.getElementById('i2p-result').innerHTML = mockAnalysis;
    
    // Generate new prompts based on the analysis
    const newPrompts = generateImagePrompt(globalData, generatedContents.characterID || generateCharacterID(globalData));
    let html = '<h4>🖼️ Generated Prompts Based on Product Image Analysis</h4>';
    newPrompts.slice(0, 3).forEach((item, index) => {
        html += `<div class="output-box">
            <strong>สไตล์ที่ ${index + 1}: ${item.style}</strong>
            <p>${item.prompt}</p>
        </div>`;
    });
    document.getElementById('i2p-prompts-output').innerHTML = html;
    alert("วิเคราะห์รูปภาพและสร้าง Prompt ใหม่เสร็จสิ้น!");
}

function handleBulkExport() {
    if (Object.keys(generatedContents).length === 0) {
        alert("กรุณาสร้างเนื้อหาทั้งหมดก่อนทำการ Export!");
        return;
    }

    const dataToExport = {
        inputData: globalData,
        generatedContent: generatedContents,
        mockImages: mockImageGallery
    };
    
    // Create a JSON file blob for content
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const contentBlob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a mock image blob for the ZIP (Simulating Fetch API + Blob fix)
    const mockImageBlob = new Blob(["Mock AI Image Data"], { type: 'image/jpeg' });
    
    // Simulating ZIP creation and download (Actual ZIP requires a library or server)
    const mockZipContent = `
        --- AD_GENIUS_BULK_EXPORT_START ---
        - config.json (Content)
        - sora_prompt_1.txt
        - fb_caption_1.txt
        - image_ai_1.jpg (Simulated Fetch + Blob Download)
        - image_ai_2.jpg (Simulated Fetch + Blob Download)
        --- AD_GENIUS_BULK_EXPORT_END ---
        `;
    const zipBlob = new Blob([mockZipContent], { type: 'application/zip' });
    
    // Download logic (using a simplified a-tag for this mockup)
    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = 'AD_GENIUS_Bulk_Export_' + Date.now() + '.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    alert("Bulk Export สำเร็จ! (ไฟล์ ZIP จำลองได้ดาวน์โหลดแล้ว)");
}


// --- Utility Functions ---

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        alert('คัดลอกไปยังคลิปบอร์ดแล้ว!');
    }, function(err) {
        console.error('ไม่สามารถคัดลอกได้: ', err);
    });
}

// Initial tab load
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('sora-prompt').style.display = 'block';
});