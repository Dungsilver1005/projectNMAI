# Lab 02 – Discussion Answers

## 1. Vì sao phải đồng bộ main trước khi tạo Pull Request?

Việc đồng bộ nhánh feature với `main` giúp cập nhật các thay đổi mới nhất từ nhánh chính, phát hiện và xử lý xung đột sớm, đồng thời kiểm tra khả năng tích hợp trước khi merge.

Điều này hạn chế lỗi phát sinh khi nhiều lập trình viên phát triển các tính năng song song.

## 2. Khi nào không được rebase?

Không nên rebase các commit đã được chia sẻ và đang được người khác sử dụng, đặc biệt là trên các nhánh chung như `main` và `release/*`.

Nguyên nhân là rebase tạo ra commit với SHA mới, làm thay đổi lịch sử Git và có thể gây xung đột khi đồng bộ với các thành viên khác.

Rebase phù hợp hơn với nhánh cá nhân chưa chia sẻ hoặc khi nhóm đã thống nhất quy trình viết lại lịch sử.

## 3. Nhánh feature/* khác nhánh topic/* như thế nào?

Nhánh `feature/*` được sử dụng để phát triển chức năng mới của hệ thống, chẳng hạn chức năng tìm kiếm giao dịch.

Nhánh `topic/*` được sử dụng cho các công việc độc lập không nhất thiết là tính năng nghiệp vụ, chẳng hạn bổ sung tài liệu, cấu hình hoặc Pull Request Template.

Cả hai loại nhánh đều được tạo từ nhánh chính, thực hiện thay đổi riêng biệt và tích hợp trở lại thông qua Pull Request.