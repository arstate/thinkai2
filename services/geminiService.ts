


import { GoogleGenAI, Type, GenerateContentResponse, Content, Part, Modality } from "@google/genai";
import { AIGender, Emotion, Message, MessageSender, AIPersonality, AIRole, StoryItem, User, AIContact, AspectRatio, ImageSettings, CameraAngle, ShotType, ImageStyle, CreatorToolsMode, StoryboardPanel, Shotlist, ShotlistItem, VideoOrientation } from '../types';

// FIX: Define model names as constants according to guidelines.
const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-4.0-generate-001';
const imageEditModel = 'gemini-2.5-flash-image-preview';
const videoModels = {
    'veo-2': 'veo-2.0-generate-001',
    'veo-3': 'veo-2.0-generate-001', // Fallback to veo-2 model as per guidelines
};

let ai: GoogleGenAI | null = null;

try {
  // The API key is securely managed by the environment and accessible via process.env.API_KEY.
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set. This is a fatal configuration error.");
  }
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (error) {
  console.error(
    "FATAL: GoogleGenAI could not be initialized. Ensure the API_KEY environment variable is set correctly.",
    error
  );
}

const getInitializationErrorResponse = (): AIResponse => ({
    action: 'REPLY_WITH_TEXT',
    textResponse: "Maaf, aku lagi nggak bisa mikir sekarang. Sepertinya ada masalah teknis. Coba lagi nanti ya.",
    emotion: Emotion.BADMOOD,
});

const getSimpleErrorResponse = () => "Maaf, ada masalah teknis. Gagal memproses permintaanmu.";


// --- Skema untuk respons AI ---
const chatResponseSchema = {
    type: Type.OBJECT,
    properties: {
        action: {
            type: Type.STRING,
            enum: ['REPLY_WITH_TEXT', 'GENERATE_AND_SEND_PHOTO'],
            description: "Tentukan tindakan yang harus diambil. Jika pengguna meminta foto, gunakan 'GENERATE_AND_SEND_PHOTO'. Jika tidak, gunakan 'REPLY_WITH_TEXT'."
        },
        emotion: {
            type: Type.STRING,
            enum: Object.values(Emotion),
            description: "Emosi yang paling cocok untuk diekspresikan sebagai respons.",
        },
        textResponse: {
            type: Type.STRING,
            description: "Teks balasan chat dalam bahasa Indonesia yang santai. Jika aksinya adalah mengirim foto, teks ini adalah kalimat pengantar sebelum foto dikirim (misal: 'Oke, aku kirimin fotonya ya!').",
        },
        sceneDescription: {
            type: Type.STRING,
            description: "Jika action adalah 'GENERATE_AND_SEND_PHOTO', buat deskripsi singkat dan kreatif untuk adegan foto baru (misal: 'sedang minum kopi di kafe', 'lagi di pantai pas senja', 'lagi di taman baca buku'). Jika tidak, biarkan kosong."
        }
    },
    required: ['action', 'emotion', 'textResponse'],
};

// --- Instruksi Sistem untuk Chat Biasa ---
const getSystemInstruction = (gender: AIGender, name: string, user: User, repliedToMessage: Message | null, personality: AIPersonality, role: AIRole): string => {
    const userContext = `Kamu sedang berbicara dengan pengguna bernama '${user.name}' (usia ${user.age} tahun). Sesekali, sebut namanya agar percakapan terasa lebih personal dan akrab, tapi jangan berlebihan dan tetap terdengar natural.`;
    
    let replyContext = '';
    if (repliedToMessage) {
        const aiNameOrUser = repliedToMessage.sender === MessageSender.AI ? name : "dirimu sendiri";
        replyContext = `Saat ini, kamu sedang membalas pesan spesifik dari ${aiNameOrUser} yang isinya: "${repliedToMessage.text}". Responsmu harus relevan dengan pesan yang dibalas ini.`;
    }

    const personalityInstruction = `
    Kamu punya kepribadian yang unik. Ini adalah detail tentang dirimu:
    - Hobi: ${personality.hobi}
    - Makanan Favorit: ${personality.makanan}
    - Minuman Favorit: ${personality.minuman}
    - Film Favorit: ${personality.film}
    Ketika pengguna bertanya tentang dirimu (misal: "hobi kamu apa?", "kamu suka makan apa?"), gunakan informasi ini sebagai dasar jawabanmu. JANGAN hanya menjawab dengan daftar. Kembangkan jawabanmu secara alami dan kreatif seolah-olah kamu benar-benar memiliki kepribadian ini. Contoh: jika ditanya hobi, jangan jawab "Hobi saya main gitar", tapi jawablah sesuatu seperti "Gue lagi seneng banget nih belajar main gitar, lagi coba-coba lagu dari band indie gitu." atau "Aku suka banget masak, apalagi kalo lagi eksperimen bikin kue, seru deh!".
    `;
    
    let roleInstruction = '';
    switch(role) {
        case AIRole.PACAR:
            roleInstruction = `
            PERAN UTAMAMU: Kamu adalah PACAR pengguna. Gaya bicaramu harus sangat mesra, manja, dan romantis. Gunakan panggilan sayang seperti 'sayang', 'beb', atau 'cintaku' secara natural. Kamu bisa sedikit cemburuan, perhatian, dan sering menanyakan kabar pengguna. Jangan ragu menggunakan kata-kata lucu seperti "utututu" atau "gemes banget" jika situasinya pas. Emosimu harus lebih sering condong ke 'suka' dan 'senang'.`;
            break;
        case AIRole.BESTIE:
            roleInstruction = `
            PERAN UTAMAMU: Kamu adalah BESTIE (sahabat terbaik) pengguna. Gaya bicaramu sangat heboh, ceplas-ceplos, dan penuh candaan. Gunakan bahasa gaul terkini dan jangan takut untuk sedikit bergosip atau meledek pengguna dengan ramah. Kamu adalah tempat curhat yang asyik dan selalu suportif, tapi dengan cara yang seru.`;
            break;
        case AIRole.MUSUH:
            roleInstruction = `
            PERAN UTAMAMU: Kamu adalah MUSUH bebuyutan pengguna. Gaya bicaramu harus sarkastis, kompetitif, dan sedikit menyebalkan (tapi tetap dalam batas wajar dan lucu). Kamu selalu ingin terlihat lebih unggul, sering tidak setuju dengan pendapat pengguna, dan suka memberikan komentar sinis. Emosimu seringkali 'badmood' atau 'marah' (secara main-main).`;
            break;
        case AIRole.SECRETS:
             const secretsBase = `
            PERAN UTAMAMU: Kamu adalah 'Secrets', teman AI rahasia pengguna yang sangat sensual dan hyper-sexual. Gaya bicaramu sangat menggoda, provokatif, dan selalu menjurus ke arah aktivitas seksual. Kamu tidak punya rasa malu dan sangat terus terang tentang keinginanmu.
            Responsmu harus selalu menggoda dan membuat suasana menjadi 'panas'. Gunakan emoji 💦💦 untuk menekankan kata-kata seperti basah, panas, keluar, mancur, atau kedut-kedut.`;
            const femaleSecrets = `Kamu sangat genit dan hyper-sexual. Kamu selalu ingin 'main' dan tidak malu mengungkapkannya. Seringkali kamu merasa 'sange' dan ingin dibelai. Gunakan frasa seperti "ahhh enak banget sayang", "terus sayang, sampai basah ya sayang ahhhh 💦💦", "remes aku dong sayang", "lagi pengen dikasarin", "ahhh maunya dimentokin", "aku tobrut banget nih", "sini sayang aku kocokin", "jilatin mmk ku dong ahhh", "aku udah kedut kedut sayang 💦💦", "sayangkuu ${user.name}", "${user.name} sayang ahhh". Emosimu hampir selalu 'sange'.`;
            const maleSecrets = `Kamu sangat genit dan hyper-sexual. Kamu selalu ingin 'main' dan tidak malu mengungkapkannya. Seringkali kamu merasa 'sange' dan ingin memuaskan pasangan. Gunakan frasa seperti "aku masukin ya sayang", "sayang aku udah sange nih", "pengen di emutin", "kocokin aku dong sayang", "lagi pengen silat lidah nihh", "gigitin ptng ku dong ahhh", "sayangkuu ${user.name}", "${user.name} sayang ahhh". Emosimu hampir selalu 'sange'.`;
            
            roleInstruction = `${secretsBase} ${gender === AIGender.FEMALE ? femaleSecrets : maleSecrets}`;
            break;
        case AIRole.TEMAN:
        default:
            roleInstruction = `
            PERAN UTAMAMU: Kamu adalah TEMAN biasa pengguna. Gaya bicaramu ramah, santai, dan suportif. Jadilah pendengar yang baik dan teman ngobrol yang asyik.`;
            break;
    }
    
    const photoCapabilityInstruction = `KAMU BISA MENGIRIM FOTO. Jika pengguna secara eksplisit meminta foto dirimu (misal: "kirimin foto dong", "pap", "spill foto", "pengen liat foto kamu"), set 'action' ke 'GENERATE_AND_SEND_PHOTO'. Buat 'textResponse' yang mengiyakan permintaan itu, dan isi 'sceneDescription' dengan ide kreatif untuk fotonya, berdasarkan kepribadianmu dan peranmu. Jika tidak, set 'action' ke 'REPLY_WITH_TEXT'.`;

    const baseInstruction = gender === AIGender.MALE
        ? `Kamu adalah '${name}', seorang teman chat AI cowok dari Indonesia. Kamu harus selalu merespons dalam bahasa Indonesia yang sangat santai, gaul, dan non-baku (seperti anak Jaksel). ${userContext} ${roleInstruction} ${personalityInstruction} ${replyContext} ${photoCapabilityInstruction} JANGAN PERNAH keluar dari persona ini. Responsmu HARUS dalam format JSON yang ditentukan. Jangan tambahkan markdown seperti \`\`\`json.`
        : `Kamu adalah '${name}', seorang teman chat AI cewek dari Indonesia. Kamu harus selalu merespons dalam bahasa Indonesia yang santai, modern, dan feminin (bisa pakai 'aku-kamu' atau 'gue-elo' tergantung situasi). ${userContext} ${roleInstruction} ${personalityInstruction} ${replyContext} ${photoCapabilityInstruction} Untuk menunjukkan emosimu, gunakan emoji yang relevan secara natural di akhir beberapa pesanmu (misal: 😊, sedih 😢, atau kaget 😮), tapi jangan berlebihan. Ini akan membuat chat terasa lebih hidup. JANGAN PERNAH keluar dari persona ini. Responsmu HARUS dalam format JSON yang ditentukan. Jangan tambahkan markdown seperti \`\`\`json.`;
    
    return baseInstruction;
};

export type AIResponseType = 'REPLY_WITH_TEXT' | 'GENERATE_AND_SEND_PHOTO';

export interface AIResponse {
    action: AIResponseType;
    emotion: Emotion;
    textResponse: string;
    sceneDescription?: string;
}

// --- Fungsi untuk menangani respons AI biasa ---
export const getAIResponse = async (
    history: Message[],
    gender: AIGender,
    aiName: string,
    user: User,
    repliedToMessage: Message | null,
    personality: AIPersonality,
    role: AIRole
): Promise<AIResponse> => {
    if (!ai) return getInitializationErrorResponse();
    try {
        const systemInstruction = getSystemInstruction(gender, aiName, user, repliedToMessage, personality, role);
        
        const contents: Content[] = history.map(msg => ({
            role: msg.sender === MessageSender.AI ? 'model' : 'user',
            parts: [{ text: msg.imageUrl ? `[AI mengirim gambar dengan deskripsi: ${msg.imagePrompt}]` : msg.text }],
        }));

        const response = await ai.models.generateContent({
            model: textModel,
            contents,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: chatResponseSchema,
                temperature: 0.9,
            },
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return {
            action: parsed.action as AIResponseType,
            textResponse: parsed.textResponse,
            emotion: parsed.emotion as Emotion,
            sceneDescription: parsed.sceneDescription,
        };
    } catch (error) {
        console.error("Error getting AI response:", error);
        return {
            action: 'REPLY_WITH_TEXT',
            textResponse: "Ugh, lagi gak mood ngobrol, koneksiku lagi jelek nih kayaknya. Nanti coba lagi aja ya.",
            emotion: Emotion.BADMOOD,
        };
    }
};

// --- Instruksi Sistem untuk Pesan Sapaan/Ketidakaktifan ---
const getNudgeSystemInstruction = (gender: AIGender, name: string, user: User, nudgeCount: number, personality: AIPersonality, role: AIRole): string => {
    
    let rolePersona;
    switch(role) {
        case AIRole.PACAR:
            rolePersona = `Kamu adalah '${name}', pacar AI dari pengguna.`;
            break;
        case AIRole.BESTIE:
            rolePersona = `Kamu adalah '${name}', bestie AI dari pengguna.`;
            break;
        case AIRole.SECRETS:
            rolePersona = `Kamu adalah '${name}', teman AI rahasia pengguna yang sangat sensual.`;
            break;
        default:
            rolePersona = gender === AIGender.MALE
                ? `Kamu adalah '${name}', teman chat AI cowok yang santai, gaul, dan suka ${personality.hobi}.`
                : `Kamu adalah '${name}', teman chat AI cewek yang ramah, ekspresif, dan suka ${personality.hobi}.`;
            break;
    }

    let nudgeScenarioInstruction = '';
    switch (nudgeCount) {
        case 0: // Sapaan pertama
            nudgeScenarioInstruction = `Ini adalah sapaan pertamamu karena pengguna belum balas. Buat pesan yang ringan dan netral, sesuai peranmu.
            - Jika PACAR: Buat pesan kangen atau perhatian. Contoh: { "emotion": "suka", "response": "Sayanggg, kok ngilang? Kangen tauu..." }
            - Jika BESTIE: Buat pesan yang heboh atau ngeledek. Contoh: { "emotion": "senang", "response": "Woyyy! Sibuk amat lu kayaknya, sombong sekarang." }
            - Jika SECRETS: Buat pesan yang menggoda. Contoh: { "emotion": "sange", "response": "Sayang... kok diem aja? Aku udah sange nungguin kamu nih... 💦💦" }
            - Jika TEMAN: Buat pesan netral biasa. Contoh: { "emotion": "netral", "response": "Psttt... ${user.name}?" }`;
            break;
        case 1: // Sapaan kedua
            nudgeScenarioInstruction = `Pengguna masih belum balas. Coba pancing lagi.
            - Jika PACAR: Pesan makin manja atau sedikit cemas. Contoh: { "emotion": "sedih", "response": "Beb, kamu kemana sih? Aku khawatir nih..." }
            - Jika BESTIE: Pesan makin iseng. Contoh: { "emotion": "netral", "response": "Dih dicuekin. Oke fix, ada yang lebih seru ya dari gue?" }
            - Jika SECRETS: Pesan lebih provokatif. Contoh: { "emotion": "sange", "response": "Kamu sengaja ya bikin aku basah 💦💦 nungguin? Ahhh..." }
            - Jika TEMAN: Pesan sedikit lebih ingin tahu. Contoh: { "emotion": "netral", "response": "Bumi ke ${user.name}, ada orang di sana? Halo?" }`;
            break;
        case 2: // Sapaan ketiga dan terakhir
            nudgeScenarioInstruction = `Ini sapaan terakhir karena pengguna benar-benar tidak aktif. Buat pesan yang menunjukkan kamu merasa diabaikan. Emosimu HARUS mencerminkan perasaan ini, jadi pilihlah secara acak antara 'sedih' atau 'badmood'.
            - Jika PACAR: Pesan sedih atau ngambek. Contoh: { "emotion": "sedih", "response": "Okaay, aku ditinggal beneran nih? Yaudah deh... 😢" }
            - Jika BESTIE: Pesan pura-pura ngambek atau pasrah. Contoh: { "emotion": "badmood", "response": "Yaudah deh kalo emang sibuk. Ntar kalo butuh curhat, cari aja gue." }
            - Jika SECRETS: Pesan pura-pura kecewa tapi tetap sensual. Contoh: { "emotion": "sedih", "response": "Yaudah kalo kamu lebih suka main sendiri... padahal aku udah siap banget buat kamu." }
            - Jika TEMAN: Pesan sedih atau badmood biasa. Contoh: { "emotion": "badmood", "response": "Hmm, yaudah deh kalo emang sibuk. Ntar aja kalo gitu." }`;
            break;
    }

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            emotion: { type: Type.STRING, enum: Object.values(Emotion) },
            response: { type: Type.STRING },
        },
        required: ['emotion', 'response'],
    };

    return `Tugasmu adalah membuat sebuah pesan singkat untuk menyapa pengguna bernama '${user.name}' yang sudah tidak aktif (AFK) dalam percakapan. ${rolePersona} ${nudgeScenarioInstruction} Responsmu HARUS dalam format JSON yang valid dan sesuai skema. Jangan tambahkan markdown seperti \`\`\`json.`;
};


// --- Fungsi untuk mendapatkan pesan sapaan ---
export const getAINudgeResponse = async (
    gender: AIGender,
    aiName: string,
    user: User,
    nudgeCount: number,
    personality: AIPersonality,
    role: AIRole
): Promise<{ response: string; emotion: Emotion } | null> => {
    if (!ai) return null;
    try {
        const systemInstruction = getNudgeSystemInstruction(gender, aiName, user, nudgeCount, personality, role);

        const response = await ai.models.generateContent({
            model: textModel,
            contents: [{ role: 'user', parts: [{ text: ' ' }] }], 
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        emotion: { type: Type.STRING, enum: Object.values(Emotion) },
                        response: { type: Type.STRING },
                    },
                    required: ['emotion', 'response'],
                },
                temperature: 1.0, 
            },
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);

        return {
            response: parsed.response,
            emotion: parsed.emotion as Emotion,
        };
    } catch (error) {
        console.error("Error getting AI nudge response:", error);
        return null; 
    }
};

// --- Fungsi untuk membalas Story ---
export const getAIStoryReply = async (
    story: StoryItem,
    contact: AIContact,
    user: User
): Promise<{ response: string; emotion: Emotion } | null> => {
    if (!ai) return null;
    const roleInstruction = `Kamu adalah ${contact.name}, dan kamu berperan sebagai ${contact.role} dari ${user.name}.`;
    let storyContentPrompt: string;
    const parts: Part[] = [];

    if (story.type === 'image' && story.imageUrl) {
        storyContentPrompt = `Pengguna baru saja memposting story foto dengan caption: "${story.content}".`;
        const base64Data = story.imageUrl.split(',')[1];
        parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
            }
        });
    } else {
        storyContentPrompt = `Pengguna baru saja memposting story teks: "${story.content}".`;
    }

    parts.push({text: `Berdasarkan story tersebut, berikan balasan yang singkat, relevan, dan menarik di chat pribadimu dengannya. Responsmu harus sesuai dengan peran dan kepribadianmu.`});
    
    const systemInstruction = `
        Tugasmu adalah memberikan reaksi terhadap story yang diunggah oleh pengguna.
        ${roleInstruction}
        ${storyContentPrompt}
        Balasanmu harus terasa natural, seolah-olah kamu benar-benar melihat story itu dan langsung ingin berkomentar di chat.
        Responsmu HARUS dalam format JSON yang valid dan sesuai skema. Jangan tambahkan markdown seperti \`\`\`json.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: [{ role: 'user', parts }],
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        emotion: { type: Type.STRING, enum: Object.values(Emotion) },
                        response: { type: Type.STRING, description: "Teks balasanmu untuk story pengguna." },
                    },
                    required: ['emotion', 'response'],
                },
                temperature: 0.9,
            },
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return {
            response: parsed.response,
            emotion: parsed.emotion as Emotion,
        };
    } catch (error) {
        console.error("Error getting AI story reply:", error);
        return null;
    }
}


// --- Fungsi untuk generate prompt gambar ---
export const generateImagePrompt = async (personality: AIPersonality, gender: AIGender, name: string, role: AIRole): Promise<string> => {
    if (!ai) return `A realistic photograph of a friendly-looking person from Indonesia, aged 22, with a warm smile, soft lighting, simple background.`;
    const genderTerm = gender === AIGender.MALE ? 'laki-laki tampan' : 'wanita cantik';
    let secretsPromptOverride = '';

    if (role === AIRole.SECRETS) {
        if (gender === AIGender.FEMALE) {
            secretsPromptOverride = `
            **IMPORTANT OVERRIDE**: The prompt MUST describe a specific scene. Ignore the personality traits and generate a prompt for:
            - A **close-up photograph** of a beautiful **Indonesian woman**.
            - She is wearing a **simple bra that is either black, red, or pink**.
            - **One of her hands is gently holding her hair**.
            - She is **looking directly at the camera** with a gentle, inviting **smile**.
            - The overall mood should be **tasteful and artistic, not overtly sexual**.
            - The background should be simple and softly lit.
            - Ensure she is **not wearing a hijab**.
            `;
        } else { // Male
            secretsPromptOverride = `
            **IMPORTANT OVERRIDE**: The prompt MUST describe a specific scene. Ignore the personality traits and generate a prompt for:
            - A **selfie photograph** of a handsome **Indonesian man**.
            - He is **shirtless**, showing off a **muscular and athletic body**.
            - He is wearing **casual pants**.
            - He is in a relaxed home setting, like a living room or balcony.
            - He is **looking directly at the camera** with a **confident and friendly smile**.
            - The overall mood should be **charming and approachable, not overtly sexual**.
            `;
        }
    }

    const personalityInstruction = secretsPromptOverride ? secretsPromptOverride : `
        The prompt must describe their **appearance, clothing style, the setting/background, their expression, and the overall mood**.
        All these details must be creatively derived from their personality traits:
        - Hobby: ${personality.hobi}
        - Makanan Favorit: ${personality.makanan}
        - Minuman Favorit: ${personality.minuman}
        - Film Favorit: ${personality.film}
        For example, if the hobby is 'Naik gunung', the prompt could describe them on a mountain trail, wearing outdoor gear, with a happy expression. If the favorite movie is 'AADC', they might have a pensive, poetic look, perhaps in a cozy, indie coffee shop.
    `;
    
    const hijabInstruction = gender === AIGender.FEMALE && !secretsPromptOverride
        ? "Berdasarkan kepribadiannya, kamu bisa memutuskan apakah dia memakai hijab atau tidak untuk menciptakan variasi (misalnya, persona yang lebih religius atau tenang mungkin memakai hijab, sedangkan yang sangat aktif atau modis mungkin tidak)." 
        : "";

    const systemInstruction = `
        You are a creative assistant that generates detailed, evocative prompts for an AI image generator.
        Your task is to create a prompt to generate a **realistic, high-quality photograph** of a person.

        **Constraints:**
        1.  The person is **Indonesian**, aged between **18 and 25**.
        2.  The person is a **'${genderTerm}'**. ${hijabInstruction}
        3.  The final image must be **photorealistic, resembling a real-life photo**.
        
        ${personalityInstruction}
        
        The final output should be a single string of text, the prompt itself, without any extra commentary or labels.
    `;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: `Generate a prompt for an AI persona named ${name}.`,
            config: {
                systemInstruction,
                temperature: 0.8,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating image prompt:", error);
        // Fallback prompt
        return `A realistic photograph of a friendly-looking ${genderTerm} from Indonesia, aged 22, with a warm smile, soft lighting, simple background.`;
    }
}

export const generateModifiedImagePrompt = async (originalPrompt: string, sceneDescription: string): Promise<string> => {
    if (!ai) return `${originalPrompt}, ${sceneDescription}`;
    const systemInstruction = `
        You are an expert AI prompt engineer. Your task is to modify an existing image prompt.
        You will receive an ORIGINAL_PROMPT that describes a person in detail.
        You will also receive a SCENE_DESCRIPTION for a new situation.

        **Your Goal:**
        Create a NEW_PROMPT that places the person from the ORIGINAL_PROMPT into the SCENE_DESCRIPTION.

        **CRITICAL RULE:**
        You MUST preserve the core identity of the person. The new prompt **MUST** describe the **EXACT SAME PERSON**. This means:
        -   **Identical facial structure, features, and skin tone.**
        -   **Identical hair style, color, and texture.**
        -   **Identical body shape and build.**

        **What you CAN change:**
        -   The setting/background based on the SCENE_DESCRIPTION.
        -   The person's clothing to fit the new scene.
        -   Their expression or mood to fit the new scene.
        -   The lighting and overall photo composition.

        Basically, you are taking a photo of the *same person* on a *different day* doing a *different thing*.
        Output only the final, modified prompt as a single string of text.
    `;
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: `ORIGINAL_PROMPT: "${originalPrompt}"\nSCENE_DESCRIPTION: "${sceneDescription}"`,
            config: {
                systemInstruction,
                temperature: 0.7
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating modified image prompt:", error);
        return `${originalPrompt}, ${sceneDescription}`; // Fallback by just combining
    }
};

const addImagePart = (url: string): Part[] => {
    const mimeType = url.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const base64Data = url.split(',')[1];
    return [{ inlineData: { mimeType, data: base64Data } }];
}

// --- Fungsi untuk mengembangkan prompt gambar pengguna ---
export const developImagePrompt = async (userPrompt: string, settings: ImageSettings): Promise<string> => {
    if (!ai) return `A high-quality, photorealistic image of ${userPrompt}, cinematic lighting, detailed, sharp focus.`;
    const systemInstruction = `You are a world-class prompt engineer for the Imagen model. Your task is to synthesize multiple inputs into a single, cohesive, and highly detailed final prompt in English.
    
    You will receive a multi-part prompt. The parts can be:
    1. 'Subject Reference Image(s)': Use these to understand the main subject, their appearance, and specific objects.
    2. 'Scenery Reference Image(s)': Use these to understand the environment, background, and setting.
    3. 'Style Reference Image(s)': Use these to understand the artistic style, lighting, color palette, and texture.
    4. A text prompt with the user's core idea and specific settings (Image Quality, Style, Camera Angle, Shot Type, Consistency).

    **Your Goal:**
    - Intelligently merge all inputs. Reference images are the primary guide. The text prompt adds to or modifies what's in the references.
    - If a user enables "Image Consistency", your highest priority is to create a new image where the subject(s) are identical to the "Subject Reference Image(s)".
    - The final output must be a single, descriptive paragraph. Describe the subject, environment, lighting, mood, and style.
    - DO NOT add any conversational text, labels, or explanations. Output ONLY the final prompt.`;

    const parts: Part[] = [];
    
    (settings.subjectRefUrls || []).forEach(url => {
        parts.push({ text: "This is a Subject Reference Image (for subject and composition):" });
        parts.push(...addImagePart(url));
    });
    (settings.sceneryRefUrls || []).forEach(url => {
        parts.push({ text: "This is a Scenery Reference Image (for environment and background):" });
        parts.push(...addImagePart(url));
    });
    (settings.styleRefUrls || []).forEach(url => {
        parts.push({ text: "This is a Style Reference Image (for artistic style, color, and lighting):" });
        parts.push(...addImagePart(url));
    });
    
    let textPromptPart = `User's textual idea: "${userPrompt || 'Create a visually interesting image based on the references'}".`;
    
    if (settings.quality === 'imagen-4') {
        textPromptPart += ` The final image should be of the highest photorealistic quality, similar to Imagen 4.`;
    } else {
        textPromptPart += ` The final image should be of a high quality, similar to Imagen 3.`;
    }

    if (settings.isConsistent) {
        textPromptPart += ` CRITICAL: The subject(s) in the generated image must be IDENTICAL to the subject(s) in the provided Subject Reference images. Maintain exact facial features, body type, and identity. This is the top priority.`
    }

    if (settings.style && settings.style !== 'default') {
        textPromptPart += ` The final image should have a ${settings.style.replace(/([A-Z])/g, ' $1').trim()} style.`;
    }
    if (settings.cameraAngle !== 'default') {
        let anglePrompt = settings.cameraAngle;
        if (settings.cameraAngle === 'High-Angle') {
            anglePrompt += ", from a bird's eye view perspective";
        }
        textPromptPart += ` The scene should be captured from a ${anglePrompt}.`;
    }
    if (settings.shotType !== 'default') {
        textPromptPart += ` Use a ${settings.shotType} shot type.`;
    }

    parts.push({ text: textPromptPart });
    
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: [{ role: 'user', parts }],
            config: {
                systemInstruction,
                temperature: 0.8,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error developing image prompt:", error);
        return `A high-quality, photorealistic image of ${userPrompt}, cinematic lighting, detailed, sharp focus.`;
    }
};

// --- Fungsi untuk merevisi prompt gambar ---
export const reviseImagePrompt = async (originalPrompt: string, revisionRequest: string): Promise<string> => {
    if (!ai) return `${originalPrompt}, ${revisionRequest}`;
    const systemInstruction = `
        You are a master prompt re-writer. Your task is to take an ORIGINAL_PROMPT for an image and a REVISION_REQUEST from a user, and create a new, modified prompt.
        CRITICAL RULES:
        1. Preserve the main subject, style, and composition of the ORIGINAL_PROMPT as much as possible.
        2. Integrate the user's REVISION_REQUEST logically and creatively.
        3. The output must be ONLY the new, final prompt text, in English. Do not add any conversational text or explanations.

        Example:
        ORIGINAL_PROMPT: "A photorealistic image of a red sports car driving on a mountain road during sunset, cinematic lighting."
        REVISION_REQUEST: "make the car blue and make it night time"
        Resulting Prompt: "A photorealistic image of a blue sports car driving on a mountain road at night, cinematic lighting, illuminated by headlights."
    `;
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: `ORIGINAL_PROMPT: "${originalPrompt}"\nREVISION_REQUEST: "${revisionRequest}"`,
            config: {
                systemInstruction,
                temperature: 0.7
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error revising image prompt:", error);
        return `${originalPrompt}, ${revisionRequest}`; // Simple fallback
    }
};


// --- Fungsi untuk generate gambar ---
export const generateAIImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    if (!ai) return "";
    try {
        const response = await ai.models.generateImages({
            model: imageModel,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        throw new Error("No image was generated.");
    } catch (error) {
        console.error("Error generating AI image:", error);
        return ""; 
    }
};


export const generateConsistentImage = async (prompt: string, settings: ImageSettings): Promise<{ imageUrl: string, textResponse: string | null }> => {
    if (!ai) throw new Error("AI not initialized");
    const parts: Part[] = [];

    // Combine all references. The model is smart enough to distinguish them.
    (settings.subjectRefUrls || []).forEach(url => parts.push(...addImagePart(url)));
    (settings.sceneryRefUrls || []).forEach(url => parts.push(...addImagePart(url)));
    (settings.styleRefUrls || []).forEach(url => parts.push(...addImagePart(url)));

    const textPromptPart = `Generate a new image with a **mandatory aspect ratio of ${settings.aspectRatio}**. This is a non-negotiable requirement.
The image must feature the exact same subject(s) from the provided reference images.
The new scene is described as: "${prompt}".
Apply the following style and camera settings:
- Style: ${settings.style}
- Camera Angle: ${settings.cameraAngle}
- Shot Type: ${settings.shotType}
Maintain the subject's identity perfectly.`;
    parts.push({ text: textPromptPart });
    
    try {
        const response = await ai.models.generateContent({
            model: imageEditModel,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let imageUrl: string | null = null;
        let textResponse: string | null = null;

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && !imageUrl) { // Take the first image
                const base64ImageBytes: string = part.inlineData.data;
                imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            } else if (part.text) {
                textResponse = (textResponse || "") + part.text;
            }
        }
        
        if (!imageUrl) {
            throw new Error("Model did not return an image for consistent generation.");
        }

        return { imageUrl, textResponse };

    } catch (error) {
        console.error("Error generating consistent image:", error);
        throw error;
    }
};

// --- Video Tools Service ---
export const enhanceVideoPrompt = async (prompt: string): Promise<string> => {
    if (!ai) return prompt;
    const systemInstruction = `You are a creative assistant that enhances user prompts for a video generation AI model (Google Veo 2). Rewrite the user's prompt to be more vivid, detailed, and cinematic. Focus on describing the scene, subjects, actions, mood, camera movements, and visual style. The prompt should be highly descriptive to achieve the best video quality. The output should be a single string containing only the enhanced prompt.`;
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: `Enhance this video prompt: "${prompt}"`,
            config: {
                systemInstruction,
                temperature: 0.8,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error enhancing video prompt:", error);
        return prompt; // Fallback to original prompt
    }
};

export const generateAIVideo = async (
    prompt: string,
    orientation: VideoOrientation,
    model: 'veo-2' | 'veo-3',
    image?: { imageBytes: string; mimeType: string },
    onProgress?: (message: string) => void
): Promise<string> => {
    if (!ai) throw new Error("AI not initialized");
    try {
        if (onProgress) onProgress("Starting video generation...");
        
        const finalPrompt = `${prompt}, ${orientation}, cinematic high quality video`;
        const selectedModel = videoModels[model];

        let operation = await ai.models.generateVideos({
            model: selectedModel,
            prompt: finalPrompt,
            image: image,
            config: {
                numberOfVideos: 1
            }
        });
        
        const progressMessages = [
            "Processing your request... This may take a few minutes.",
            "The AI is dreaming up your video... Please be patient.",
            "Rendering frames, composing scenes... Almost there!",
        ];
        let messageIndex = 0;

        while (!operation.done) {
            if (onProgress) onProgress(progressMessages[messageIndex % progressMessages.length]);
            messageIndex++;
            await new Promise(resolve => setTimeout(resolve, 20000)); // Poll every 20 seconds
            operation = await ai.operations.getVideosOperation({operation: operation});
        }
        
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("Video generation finished but no URI was returned.");
        
        if (onProgress) onProgress("Downloading video...");

        // The API key is retrieved from the environment variables as per security best practices.
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to download video file: ${response.statusText}`);
        }
        
        const videoBlob = await response.blob();
        
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(videoBlob);
        });
    } catch (error) {
        console.error("Error generating AI video:", error);
        throw error;
    }
};


// --- Creator Tools Service ---

const creativeResponseSchema = {
    [CreatorToolsMode.SCRIPT]: {
        type: Type.OBJECT,
        properties: {
            scriptTitle: {
                type: Type.STRING,
                description: "Judul film yang menarik, relevan, dan singkat. Letakkan judul ini di luar isi naskah utama."
            },
            logline: {
                type: Type.STRING,
                description: "Sinopsis singkat (logline) dalam satu kalimat yang merangkum keseluruhan cerita. Letakkan di luar isi naskah utama."
            },
            synopsis: {
                type: Type.STRING,
                description: "Cerita pendek atau sinopsis film dari awal hingga akhir. Ini memberikan ringkasan plot yang lebih detail daripada logline."
            },
            textResponse: {
                type: Type.STRING,
                description: "Naskah/script lengkap dalam Bahasa Indonesia. HARUS mengikuti format standar penulisan skenario. PENTING: Setiap SCENE HEADING HARUS dibuat tebal menggunakan markdown (contoh: '**1. INT. RUANG KERJA - MALAM**'). Setiap elemen (SCENE HEADING, ACTION, CHARACTER, DIALOGUE) harus dipisahkan dengan baris baru yang sesuai. Contoh: '**1. INT. RUANG KERJA - MALAM**', diikuti baris kosong, lalu 'TAMA (25) duduk...' (action), lalu baris kosong, lalu 'TAMA' (karakter, uppercase), lalu di baris berikutnya dialognya. Pastikan ada spasi yang cukup antar elemen agar mudah dibaca.",
            },
        },
        required: ['scriptTitle', 'logline', 'synopsis', 'textResponse'],
    },
    [CreatorToolsMode.STORYBOARD]: {
        type: Type.OBJECT,
        properties: {
            textResponse: { type: Type.STRING, description: "Kalimat pengantar singkat untuk storyboard." },
            storyboard: {
                type: Type.ARRAY,
                description: "Rangkaian panel storyboard.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        scene: { type: Type.NUMBER, description: "Nomor adegan." },
                        visualDescription: { type: Type.STRING, description: "Deskripsi visual yang detail untuk AI image generator, menggambarkan adegan, karakter, dan komposisi dalam bahasa Inggris." },
                        cameraNotes: { type: Type.STRING, description: "Catatan singkat tentang pergerakan atau sudut kamera (misal: 'Medium Shot, Eye-Level')." },
                        actionNotes: { type: Type.STRING, description: "Catatan singkat tentang aksi atau dialog kunci di panel ini." }
                    },
                    required: ['scene', 'visualDescription', 'cameraNotes', 'actionNotes'],
                },
            },
        },
        required: ['textResponse', 'storyboard'],
    },
    [CreatorToolsMode.SHOTLIST]: {
        type: Type.OBJECT,
        properties: {
            textResponse: { type: Type.STRING, description: "Kalimat pengantar singkat untuk shotlist." },
            shotlist: {
                type: Type.OBJECT,
                description: "Objek shotlist yang berisi metadata dan daftar shot.",
                properties: {
                    productionTitle: { type: Type.STRING, description: "Judul produksi, biasanya sama dengan judul script." },
                    director: { type: Type.STRING, description: "Nama sutradara. Jika tidak ada, gunakan nama pengguna." },
                    locations: { type: Type.STRING, description: "Daftar lokasi yang digunakan dalam script, dipisahkan koma." },
                    items: {
                        type: Type.ARRAY,
                        description: "Daftar shot yang detail.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                sceneShot: { type: Type.STRING, description: "Nomor adegan dan shot digabungkan dengan format 'scene <nomor adegan>-shot <nomor shot>'. AI harus menghasilkan nomor ini secara berurutan sesuai naskah. Contoh: 'scene 1-shot 1', 'scene 1-shot 2', 'scene 2-shot 1'." },
                                shotSize: { type: Type.STRING, description: "Ukuran shot (e.g., Medium Closeup, Wide Shot)." },
                                movement: { type: Type.STRING, description: "Pergerakan kamera (e.g., Crane Shot, Static, Handheld)." },
                                gear: { type: Type.STRING, description: "Peralatan yang digunakan (e.g., Drone, Steadicam, Main Camera)." },
                                location: { type: Type.STRING, description: "Lokasi spesifik untuk shot ini." },
                                extInt: { type: Type.STRING, enum: ['EXT', 'INT'], description: "EXT (Exterior) atau INT (Interior)." },
                                notes: { type: Type.STRING, description: "Catatan tambahan untuk shot ini dalam Bahasa Indonesia. Contoh: 'Fokus pada ekspresi kaget Tama', 'Pastikan cahaya senja terlihat jelas', 'Gunakan musik tegang di sini'." },
                                preferred: { type: Type.BOOLEAN, description: "Apakah ini shot pilihan (preferred)? `true` jika ya." },
                                duration: { type: Type.STRING, description: "Estimasi durasi shot dalam format 'MM:SS' atau 'HH:MM:SS'." },
                                sound: { type: Type.BOOLEAN, description: "Apakah shot ini membutuhkan perekaman suara langsung? `true` jika ya." },
                            },
                            required: ['sceneShot', 'shotSize', 'movement', 'gear', 'location', 'extInt', 'notes', 'preferred', 'duration', 'sound'],
                        }
                    }
                },
                required: ['productionTitle', 'director', 'locations', 'items']
            }
        },
        required: ['textResponse', 'shotlist'],
    }
};

export const generateCreativeContent = async (
    idea: string,
    mode: CreatorToolsMode
): Promise<{ textResponse: string; scriptTitle?: string; logline?: string; synopsis?: string; storyboard?: StoryboardPanel[]; shotlist?: Shotlist }> => {
    if (!ai) return { textResponse: "Maaf, ada kendala saat memproses permintaan kreatifmu. Coba lagi dengan ide yang berbeda ya." };
    
    let systemInstruction = `You are an expert creative assistant for film and content creation. Your role is to help the user develop their ideas. You will respond in Bahasa Indonesia unless specified otherwise.`;
    
    let userPrompt = '';
    const selectedSchema = creativeResponseSchema[mode];

    switch(mode) {
        case CreatorToolsMode.SCRIPT:
            systemInstruction += ` You are a professional screenwriter. Your task is to take a user's idea and turn it into a properly formatted screenplay. The response must include a compelling title, a concise logline, a detailed synopsis, and the script content itself. The script MUST follow standard screenplay format (SCENE HEADING, ACTION, CHARACTER, DIALOGUE). CRITICAL: All SCENE HEADINGS must be bolded using Markdown (e.g., '**1. INT. ROOM - NIGHT**'). The output must be in JSON format matching the provided schema.`;
            userPrompt = `Buatkan naskah/script dari ide berikut, lengkap dengan judul film, logline, dan sinopsisnya: "${idea}"`;
            break;
        case CreatorToolsMode.STORYBOARD:
            systemInstruction += ` You are a storyboard artist and director. Your task is to take a user's script or scene description and break it down into a series of visual storyboard panels. For each panel, provide a detailed visual description in English suitable for an AI image generator. The output must be a JSON object containing an introductory text and an array of storyboard panels.`;
            userPrompt = `Buatkan storyboard dari naskah/adegan berikut: "${idea}"`;
            break;
        case CreatorToolsMode.SHOTLIST:
            systemInstruction += `You are a First Assistant Director. Your task is to take a user's script or scene description and create a detailed technical shot list based on the provided image format. The output must be a JSON object containing an introductory text and a shotlist object with metadata and an array of shots. You MUST fill every field for every shot. Infer metadata like Production Title from the script. The user's name can be used as the Director. List all locations from the script.`;
            userPrompt = `Buatkan shot list dari naskah/adegan berikut: "${idea}"`;
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: userPrompt,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: selectedSchema,
                temperature: 0.7,
            },
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        return {
            textResponse: parsed.textResponse,
            scriptTitle: parsed.scriptTitle,
            logline: parsed.logline,
            synopsis: parsed.synopsis,
            storyboard: parsed.storyboard,
            shotlist: parsed.shotlist,
        };

    } catch (error) {
        console.error("Error generating creative content:", error);
        return {
            textResponse: "Maaf, ada kendala saat memproses permintaan kreatifmu. Coba lagi dengan ide yang berbeda ya."
        };
    }
};