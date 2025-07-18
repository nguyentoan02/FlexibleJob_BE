import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getMatchScoreFromAI = async (jobDescription, cvContent) => {
    try {
        const prompt = `
            Bạn là một chuyên gia tuyển dụng nhân sự (HR Expert) với 15 năm kinh nghiệm.
            **Mô tả công việc:**
            ---
            ${jobDescription}
            ---
            **Hồ sơ ứng viên (CV):**
            ---
            ${cvContent}
            ---
            Dựa vào thông tin trên, hãy phân tích và đưa ra điểm phù hợp (match score) từ 0 đến 100.
            Hãy trả lời bằng một đối tượng JSON hợp lệ có cấu trúc: {"score": <number>, "justification": "<string>"}.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(response.choices[0].message.content);
        return result;
    } catch (error) {
        console.error("Error calling OpenAI API for single score:", error);
        return null;
    }
};

export const getComparativeAnalysisFromAI = async (
    jobDescription,
    applicantsData
) => {
    try {
        const prompt = `
            Bạn là Giám đốc Nhân sự (HR Director). Nhiệm vụ của bạn là xem xét các ứng viên và đưa ra bảng xếp hạng cuối cùng dựa trên mô tả công việc và dữ liệu của ứng viên có đáp ứng với các yêu cầu của công việc đó không và không liên quan gì đến ảnh hồ sơ.
            **Mô tả công việc:**
            ---
            ${jobDescription}
            ---
            **Dữ liệu tóm tắt của các ứng viên:**
            ---
            ${applicantsData}
            ---
            Dựa vào các thông tin trên, hãy so sánh và đưa ra một bảng xếp hạng (Ranking) từ 1 đến 5.
            Với mỗi người trong top 3, hãy đưa ra ba lý do với độ dài vừa phải, đầy đủ thông tin vì sao bạn xếp họ ở vị trí đó.
            Với mỗi người trong từ top 3 trở đi, hãy đưa ra hai lý do ngắn, đầy đủ thông tin vì sao xếp họ ở vị trí đó.
            Hãy trả lời bằng một đối tượng JSON hợp lệ có cấu trúc: 
            {"ranking": [{"applicantId": "<string>", "rank": <number>, "reason": "<string>","firstName": "<string>","lastName": "<string>","imageUrl":"<string>"}]}
            Đối với trường reason thì mặc định response về bằng tiếng việt
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(response.choices[0].message.content);
        return result;
    } catch (error) {
        console.error(
            "Error calling OpenAI API for comparative analysis:",
            error
        );
        return null;
    }
};
