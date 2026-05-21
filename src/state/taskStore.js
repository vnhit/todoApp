/**
 * Mảng dữ liệu mẫu chứa danh sách các công việc trong hệ thống
 */
export const mockTasks = [
    {
        id: 1,
        title: "Nộp tài liệu báo cáo",
        description: "Kiểm tra kỹ lại toàn bộ hồ sơ, biểu mẫu và chuẩn bị đầy đủ các tài liệu cần thiết để nộp cho thầy chấm hội đồng đánh giá.",
        objective: "Hoàn thành thủ tục nộp tài liệu đúng hạn quy định.",
        priority: "Extreme", 
        status: "In Progress",
        date: "20/06/2026",
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800"
    },
    {
        id: 2,
        title: "Hoàn thiện giao diện UI",
        description: "Chỉnh sửa lại các lỗi responsive cho trang danh sách sản phẩm và hộp thoại tư vấn AI để giao diện chuẩn chỉnh như Figma.",
        objective: "Tối ưu hóa trải nghiệm người dùng trên các thiết bị di động.",
        priority: "Moderate", 
        status: "Not Started",
        date: "22/06/2026",
        image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800"
    },
    {
        id: 3,
        title: "Sửa lỗi Linker Driver bàn phím",
        description: "Fix triệt để lỗi LNK2019 liên kết ngoài (unresolved external symbol) xuất hiện trong hàm xử lý MapScanCodeToChar khi build trên môi trường 32-bit.",
        objective: "Đảm bảo mã nguồn driver biên dịch thành công và không dính lỗi kết nối link.",
        priority: "Extreme", 
        status: "Completed",
        date: "19/06/2026",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800"
    }
];