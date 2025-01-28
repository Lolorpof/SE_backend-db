// getFindEmpSchema
// Example 1: All fields provided
const searchExample1 = {
  title: "ช่างซ่อมรถ",
  province: "กรุงเทพมหานคร",
  jobLocation: "ลาดพร้าว",
  salaryRange: {
    min: 15000,
    max: 30000,
  },
  workHoursRange: "9:00-17:00",
};

// Example 2: Minimal search (only title)
const searchExample2 = {
  title: "พนักงานเสิร์ฟ",
};

// Example 3: Location-based search
const searchExample3 = {
  province: "เชียงใหม่",
  jobLocation: "นิมมานเหมินทร์",
};

// Example 4: Salary-based search
const searchExample4 = {
  salaryRange: {
    min: 20000,
  },
};
//createJobHiringPostSchema
// Example 1: Full job posting
const jobPostExample1 = {
  title: "พนักงานขาย Full-time",
  description: "ต้องการพนักงานขายประจำร้าน มีประสบการณ์ 1-2 ปี",
  jobLocation: "สยามพารากอน กรุงเทพฯ",
  salary: 25000,
  workDates: "จันทร์-ศุกร์",
  workHoursRange: "10:00-19:00",
  hiredAmount: 2,
  skills: [
    "123e4567-e89b-12d3-a456-426614174000", // ทักษะการขาย
    "987fcdeb-51a2-12d3-a456-426614174000", // ทักษะการสื่อสาร
  ],
  jobCategories: [
    "550e8400-e29b-41d4-a716-446655440000", // งานขาย
  ],
};

// Example 2: Part-time job posting
const jobPostExample2 = {
  title: "พนักงานทำความสะอาด Part-time",
  description: "รับพนักงานทำความสะอาดประจำออฟฟิศ",
  jobLocation: "อาคารเมืองไทย-ภัทร กรุงเทพฯ",
  salary: 325, // รายวัน
  workDates: "เสาร์-อาทิตย์",
  workHoursRange: "8:00-17:00",
  hiredAmount: 1,
  skills: [
    "123e4567-e89b-12d3-a456-426614174001", // ทักษะงานแม่บ้าน
  ],
  jobCategories: [
    "550e8400-e29b-41d4-a716-446655440001", // งานทำความสะอาด
  ],
};

// getJobSeekerSchema
// Example 1: Full search criteria
const jobSeekerSearchExample1 = {
  officialName: "บริษัท เอบีซี จำกัด",
  jobCategories: [
    "550e8400-e29b-41d4-a716-446655440000", // งานขาย
    "550e8400-e29b-41d4-a716-446655440002", // งานบริการ
  ],
  skills: [
    "123e4567-e89b-12d3-a456-426614174000", // ทักษะการขาย
    "123e4567-e89b-12d3-a456-426614174002", // ทักษะภาษาอังกฤษ
  ],
  province: "กรุงเทพมหานคร",
  jobLocation: "สุขุมวิท",
  salaryRange: {
    min: 20000,
    max: 35000,
  },
  workHoursRange: "9:00-18:00",
};

// Example 2: Basic location and salary search
const jobSeekerSearchExample2 = {
  province: "ภูเก็ต",
  salaryRange: {
    min: 25000,
  },
};

// Example 3: Skills-based search
const jobSeekerSearchExample3 = {
  skills: [
    "123e4567-e89b-12d3-a456-426614174003", // ทักษะการทำอาหาร
    "123e4567-e89b-12d3-a456-426614174004", // ทักษะการจัดการร้านอาหาร
  ],
  jobCategories: [
    "550e8400-e29b-41d4-a716-446655440003", // งานร้านอาหาร
  ],
};
