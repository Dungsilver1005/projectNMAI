# Lab 01 – Discussion Answers

**Course:** IT3180 – Introduction to Software Engineering  
**Repository:** Dungsilver1005/projectNMAI

## Question 1: Vì sao sử dụng `git mv` khi refactor?

Lệnh `git mv` được sử dụng để di chuyển hoặc đổi tên file đang được Git quản lý. Lệnh này tương đương với việc di chuyển file và đưa thay đổi vào Staging Area, giúp quá trình refactor thuận tiện và hạn chế thao tác thủ công.

Git có khả năng nhận diện file được đổi tên thông qua việc so sánh nội dung, nên `git mv` không phải điều kiện bắt buộc để lưu lịch sử file.

Trong projectNMAI, nhóm thực hành refactor bằng cách tách các hàm tiện ích từ `main.jsx` sang `utils/formatters.js`, giúp tổ chức mã nguồn rõ ràng hơn mà không thay đổi chức năng.

## Question 2: `release/lab01` có phải baseline không? Vì sao?

Có. Sau khi Lab 01 được hoàn thiện, kiểm thử và thống nhất để nộp, nhánh `release/lab01` đóng vai trò là baseline của Lab 01.

Baseline là một trạng thái cấu hình phần mềm đã được xác lập, dùng làm cơ sở tham chiếu, kiểm tra và quản lý các thay đổi tiếp theo.

Nhánh release giúp lưu giữ trạng thái bài nộp, trong khi nhánh `main` có thể tiếp tục phát triển các tính năng mới. Các thay đổi đối với baseline cần được kiểm soát thông qua quy trình phù hợp.

## Question 3: Vì sao không commit trực tiếp lên `main` dù làm một mình?

Không commit trực tiếp lên `main` để bảo vệ tính ổn định của nhánh chính và bảo đảm mọi thay đổi đều được kiểm soát.

Việc sử dụng nhánh riêng và Pull Request mang lại những lợi ích:

- Tách biệt các thay đổi đang phát triển với mã nguồn ổn định.
- Cho phép kiểm tra code và chạy kiểm thử trước khi tích hợp.
- Ghi nhận rõ mục đích, nội dung và lịch sử thay đổi.
- Hỗ trợ review và phát hiện lỗi trước khi merge.
- Giúp dễ dàng truy vết các thay đổi khi xảy ra sự cố.

Ngay cả khi làm việc một mình, tuân thủ quy trình này giúp hình thành thói quen quản lý cấu hình phần mềm chuyên nghiệp.