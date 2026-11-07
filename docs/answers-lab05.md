# Lab 05 – Discussion Answers

## 1. Ưu, nhược điểm của Upstream First so với Release First?

### Upstream First

Upstream First là chiến lược sửa lỗi trên nhánh phát triển chính (`main`) trước, sau đó đưa bản sửa sang các nhánh phát hành cần bảo trì bằng cherry-pick hoặc backport.

**Ưu điểm:**
- Đảm bảo mã nguồn phát triển chính nhận được bản sửa lỗi sớm.
- Hạn chế nguy cơ lỗi tiếp tục tồn tại trong các phiên bản tương lai.
- Thuận lợi cho việc kiểm thử và duy trì chất lượng mã nguồn trên nhánh chính.

**Nhược điểm:**
- Mã nguồn trên `main` có thể khác đáng kể so với phiên bản đã phát hành.
- Việc đưa bản sửa sang các nhánh release cũ có thể phát sinh conflict.
- Với lỗi nghiêm trọng chỉ xuất hiện trên phiên bản cũ, sửa trên `main` trước có thể làm chậm quá trình phát hành bản vá.

### Release First

Release First là chiến lược sửa lỗi trực tiếp trên nhánh release đang bị ảnh hưởng, sau đó lan truyền bản sửa sang `main` và các nhánh release khác.

**Ưu điểm:**
- Có thể tái hiện và sửa lỗi trực tiếp trên phiên bản thực tế bị ảnh hưởng.
- Phù hợp với các Hotfix khẩn cấp.
- Cho phép phát hành bản vá mà không đưa các tính năng mới chưa ổn định vào phiên bản cũ.

**Nhược điểm:**
- Cần lan truyền bản sửa sang nhiều nhánh.
- Dễ bỏ sót một nhánh nếu không kiểm toán đầy đủ.
- Có thể phát sinh conflict hoặc sai khác hành vi giữa các phiên bản.

**Kết luận:** Upstream First phù hợp khi ưu tiên tính nhất quán của nhánh phát triển chính. Release First phù hợp khi cần nhanh chóng khắc phục lỗi trên một phiên bản đã phát hành. Trong bài thực hành, Release Flow sử dụng Release First để minh họa việc bảo trì nhiều phiên bản song song.

## 2. Nếu quên lan truyền bản sửa sang release/lab05, lệnh nào ở Phần F sẽ phát hiện?

Có thể sử dụng các lệnh kiểm toán Git và kiểm thử hành vi trong Phần F để phát hiện bản sửa chưa được lan truyền.

**Cách 1 – Kiểm tra lịch sử cherry-pick:**

```bash
git log origin/release/lab05 --oneline --grep="cherry picked from commit 6d45b724"
```

Nếu nhánh `release/lab05` chưa chứa commit cherry-pick tương ứng, lệnh này sẽ không tìm thấy commit có thông tin truy vết đó.

**Cách 2 – Kiểm tra hành vi thực tế:**

Checkout phiên bản cần kiểm toán và chạy regression test liên quan đến lỗi đã sửa.

Nếu bản sửa chưa được tích hợp, kiểm thử có thể thất bại hoặc chương trình vẫn biểu hiện lỗi cũ.

Ví dụ, với lỗi số tiền giao dịch chứa toàn khoảng trắng, kết quả đúng phải là `-- VND` thay vì `0 VND`.

**Kết luận:** Kiểm tra lịch sử cherry-pick giúp xác nhận quá trình lan truyền commit, còn regression test giúp xác nhận bản sửa thực sự hoạt động. Nên kết hợp cả hai để bảo đảm tính nhất quán giữa các nhánh phát hành.