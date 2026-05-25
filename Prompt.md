Bạn là một senior backend developer chuyên về Node.js, Express và thiết kế RESTful API, đồng thời có kinh nghiệm tích hợp AI/ML model (Python).

Hãy xây dựng cho tôi một backend hoàn chỉnh với các yêu cầu sau:

========================
1. Công nghệ sử dụng
========================
- Node.js + Express
- Cấu trúc MVC (Model - Controller - Route)
- MongoDB + Mongoose
- Có thể tích hợp Python (child_process / REST API) để gọi model AI
- Code clean, scalable, có comment rõ ràng

========================
2. Chức năng chính
========================
Hệ thống thẩm định giao dịch + tích hợp AI dự đoán gian lận

========================
3. Định nghĩa dữ liệu từ frontend
========================
Request body:
{
  "amount": 5000000,
  "timestamp": "2026-04-15T18:30:00Z",
  "content": "chuyen tien mua laptop"
}

- content có thể null hoặc rỗng

========================
4. API cần xây dựng
========================

(1) POST /api/transactions
- Validate input:
    + amount > 0
    + timestamp hợp lệ
- Xử lý:
    + Tiền xử lý dữ liệu (preprocessing)
    + Gọi:
        (a) rule-based fraud detection
        (b) AI model prediction (predictModel)
    + Kết hợp kết quả:
        - Nếu 1 trong 2 phát hiện fraud → fraud
- Output:
{
  success: true,
  data: {
    transaction: {...},
    rule_based_result: "fraud" | "normal",
    ai_result: "fraud" | "normal",
    final_result: "fraud" | "normal"
  }
}

(2) GET /api/transactions
- Hỗ trợ pagination:
    + page
    + limit
- Trả danh sách giao dịch

(3) GET /api/transactions/stats
- Trả:
    + total
    + fraud_count
    + normal_count

========================
5. Fraud Detection Logic
========================
Rule-based:
- amount > 10,000,000 → fraud
- content chứa: "hack", "scam", "fake" → fraud

========================
6. AI Integration (QUAN TRỌNG)
========================

Tạo service: predictModel

- Chức năng:
    + Nhận input từ Node.js
    + Gọi Python script hoặc mock AI
    + Trả về kết quả "fraud" hoặc "normal"

- Yêu cầu:
    + Viết 1 file Python mẫu:
        predict.py
    + Input: JSON
    + Output: JSON

Ví dụ:
Node.js → Python:
{
  "amount": 5000000,
  "content": "..."
}

Python → Node.js:
{
  "prediction": "fraud"
}

- Nếu không có model thật:
    → mock random hoặc rule đơn giản

========================
7. Preprocessing Service
========================
Tạo service:
- preprocessTransaction()

Bao gồm:
- Chuẩn hóa amount (scale nếu cần)
- Convert timestamp → features:
    + hour
    + day_of_week
- Xử lý text content:
    + lowercase
    + remove special characters

========================
8. Cấu trúc project
========================
/models
    transaction.model.js

/controllers
    transaction.controller.js

/routes
    transaction.routes.js

/services
    fraud.service.js
    predictModel.service.js
    preprocess.service.js

/middlewares
    error.middleware.js

/utils
    logger.js

========================
9. Yêu cầu thêm
========================
- Logging (console hoặc winston)
- Error handling middleware
- Response format chuẩn:
{
  success: true/false,
  data: ...,
  message: ...
}

========================
10. Output mong muốn
========================
- Viết FULL code backend (có thể chạy ngay)
- Bao gồm:
    + server.js
    + tất cả file trong từng folder
- Viết cả file Python predict.py
- Hướng dẫn chạy:
    + npm install
    + chạy MongoDB
    + chạy server
    + test API bằng Postman

========================
11. Bonus (nếu có thể)
========================
- Thêm rate limit
- Thêm validation middleware (Joi hoặc express-validator)
- Thêm Dockerfile (optional)

========================
12. Coding style
========================
- Clean code
- Tách logic rõ ràng
- Dễ nâng cấp thành hệ thống ML thật sau này