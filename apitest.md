# API Testing Guide

## 1. Job Seeker Search (GET /jobseeker)

### Basic Search

```
GET /jobseeker?province=Bangkok&jobLocation=Sukhumvit
```

### Complete Search

```
GET /jobseeker?officialName=TechCorp&jobCategories=uuid1,uuid2&skills=uuid3,uuid4&province=Bangkok&jobLocation=Sukhumvit&salaryRange={"min":30000,"max":50000}&workHoursRange=9:00-17:00
```

## 2. Employer Search (GET /findemp)

### Basic Search

```
GET /findemp?title=Software Engineer&province=Bangkok
```

### Complete Search

```
GET /findemp?title=Developer&province=Bangkok&jobLocation=Silom&salaryRange={"min":30000,"max":50000}&workHoursRange=9:00-17:00
```

## 3. Create Job Post (POST /postemp)

### Complete Job Post

```
POST /postemp
Content-Type: application/json

{
  "title": "Senior Software Engineer",
  "description": "Looking for an experienced developer",
  "jobLocation": "Bangkok",
  "salary": 50000,
  "workDates": "Monday-Friday",
  "workHoursRange": "9:00-18:00",
  "hiredAmount": 2,
  "skills": ["skill-uuid-1", "skill-uuid-2"],
  "jobCategories": ["category-uuid-1"]
}
```

### Minimal Job Post

```
POST /postemp
Content-Type: application/json

{
  "title": "Junior Developer",
  "jobLocation": "Bangkok",
  "salary": 25000,
  "workDates": "Monday-Friday",
  "workHoursRange": "9:00-17:00",
  "hiredAmount": 1,
  "skills": ["skill-uuid-1"],
  "jobCategories": ["category-uuid-1"]
}
```

## Notes

- Base URL: `http://localhost:3000`
- Replace UUIDs (skill-uuid-1, category-uuid-1) with actual UUIDs from your database
- URL encode special characters in query parameters
- The `salaryRange` parameter must be a valid JSON string
