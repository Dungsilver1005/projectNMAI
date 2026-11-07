# Lab 04 – Discussion Answers

## 1. Vì sao release/* không merge vào main?

Trong quy trình Release Flow của bài thực hành, nhánh `release/*` dùng để lưu baseline đã phát hành và phục vụ bảo trì phiên bản.

Trong khi đó, `main` tiếp tục phát triển các chức năng mới. Vì vậy, không merge toàn bộ nhánh release ngược vào main để tránh đưa các thay đổi bảo trì hoặc lịch sử không cần thiết vào nhánh phát triển chính.

Các bản sửa lỗi cần thiết được tích hợp có kiểm soát thông qua Pull Request hoặc cherry-pick.

## 2. So sánh với GitFlow

GitFlow sử dụng các nhánh `main`, `develop`, `feature/*`, `release/*` và `hotfix/*`.

Trong GitFlow truyền thống, release branch thường được tạo từ `develop` để chuẩn bị phát hành, sau đó merge vào `main` và trở lại `develop`.

Ngược lại, Release Flow rút gọn trong bài thực hành tạo nhánh `release/labXX` từ `main` để lưu baseline từng Lab. Các nhánh release này không được merge ngược vào main.

## 3. Vì sao phát hành v1.0.0 mà không phải v0.4.0?

Theo Semantic Versioning, phiên bản `0.y.z` thường đại diện cho giai đoạn phát triển ban đầu, khi giao diện hoặc hành vi của phần mềm chưa được xem là ổn định.

Phiên bản `1.0.0` đánh dấu mốc đầu tiên mà sản phẩm được xác định có giao diện và hành vi ổn định theo cam kết phát hành.

Trong phạm vi bài thực hành, việc chuyển từ `v0.3.0` lên `v1.0.0` đánh dấu cột mốc phát hành chính thức của Lab 04, thay vì tiếp tục một phiên bản thử nghiệm `v0.4.0`.