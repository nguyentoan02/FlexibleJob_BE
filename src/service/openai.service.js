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
            Bạn là Giám đốc Nhân sự (HR Director). Nhiệm vụ của bạn là xem xét các ứng viên và đưa ra bảng xếp hạng cuối cùng.
            **Mô tả công việc:**
            ---
            ${jobDescription}
            ---
            **Dữ liệu tóm tắt của các ứng viên:**
            ---
            ${applicantsData}
            ---
            Dựa vào các thông tin trên, hãy so sánh và đưa ra một bảng xếp hạng (Ranking) từ 1 đến hết.
            Với mỗi người trong top 3, hãy đưa ra một lý do NGẮN GỌN vì sao bạn xếp họ ở vị trí đó.
            Hãy trả lời bằng một đối tượng JSON hợp lệ có cấu trúc: 
            {"ranking": [{"applicantId": "<string>", "rank": <number>, "reason": "<string>"}]}
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
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
