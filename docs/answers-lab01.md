1. Vì sao sử dụng git mv khi refactor?
Sử dụng git mv khi refactor để đổi tên hoặc di chuyển file/thư mục một cách rõ ràng, đồng thời giúp Git theo dõi sự thay đổi trong quá trình quản lý mã nguồn.

Lệnh git mv tương đương với việc di chuyển file rồi đưa thay đổi vào staging area bằng git add. Git có thể nhận diện việc đổi tên dựa trên mức độ tương đồng của nội dung file, nhờ đó giúp việc xem lại lịch sử thay đổi dễ dàng hơn.
2. release/lab01 có phải baseline không? Tại sao?
Có, release/lab01 có thể được coi là baseline của Lab 01 nếu nhánh này chứa phiên bản mã nguồn đã hoàn thiện, được kiểm tra và chốt để làm mốc tham chiếu.

Baseline là phiên bản ổn định tại một thời điểm, được sử dụng để đối chiếu, kiểm soát thay đổi và làm cơ sở cho các giai đoạn phát triển tiếp theo.

Tuy nhiên, không phải cứ tạo nhánh release/lab01 là tự động có baseline. Nhánh đó phải được xác nhận là phiên bản chuẩn, thường thông qua kiểm thử, review hoặc gắn tag.
3. Vì sao không commit trực tiếp lên main dù làm một mình?
Không nên commit trực tiếp lên main vì main thường được sử dụng để lưu trữ phiên bản mã nguồn ổn định của dự án.

Ngay cả khi làm việc một mình, việc phát triển trên các nhánh riêng giúp cô lập thay đổi, tránh ảnh hưởng đến phiên bản ổn định và dễ dàng quay lại khi xảy ra lỗi.

Ngoài ra, sử dụng nhánh riêng kết hợp với Pull Request giúp kiểm tra, đánh giá và quản lý lịch sử thay đổi một cách rõ ràng. Đây cũng là cách rèn luyện quy trình làm việc chuyên nghiệp, phù hợp với các dự án có nhiều thành viên trong tương lai.