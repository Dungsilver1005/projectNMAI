# Lab 03 – Discussion Answers

## 1. Merge base là gì?

Merge base là commit tổ tiên chung gần nhất giữa hai nhánh Git.

Khi thực hiện merge, Git sử dụng merge base làm điểm tham chiếu để xác định những thay đổi riêng của từng nhánh và kết hợp chúng.

Có thể tìm merge base bằng lệnh:

`git merge-base main feature/branch-name`

Nếu hai nhánh sửa cùng một phần nội dung theo những cách không tương thích, Git có thể phát sinh merge conflict và yêu cầu lập trình viên giải quyết thủ công.

## 2. Vì sao main/release/* phải sử dụng revert thay vì reset?

Các nhánh `main` và `release/*` thường chứa lịch sử đã được chia sẻ và sử dụng bởi nhiều thành viên hoặc các phiên bản đã phát hành.

Sử dụng `git reset` để loại bỏ commit rồi force push có thể viết lại lịch sử chung, thay đổi cấu trúc commit và gây khó khăn cho việc đồng bộ.

Ngược lại, `git revert` tạo ra một commit mới để đảo ngược thay đổi của commit trước đó mà không xóa lịch sử.

Vì vậy, revert giúp đảm bảo khả năng truy vết, kiểm toán và tính nhất quán của repository. Đối với các nhánh được bảo vệ, thao tác revert nên thực hiện thông qua nhánh riêng và Pull Request.

## 3. Kết quả thực hành

- Bugfix Flow: Viết regression test thất bại trước khi sửa lỗi và xác nhận test thành công sau khi sửa.
- Feature Bugfix: Tạo nhánh Bugfix từ Feature và merge Pull Request trở lại nhánh Feature.
- Merge Conflict: Tạo xung đột khi hai nhánh sửa cùng một dòng và giải quyết thủ công.
- Reset: Thực hành các chế độ soft, mixed và hard.
- Reflog: Khôi phục commit bị loại khỏi lịch sử nhánh.
- Revert: Hoàn tác merge commit thông qua nhánh Bugfix và Pull Request.