# Transfi
1. POST
Automatically includes Bonus 1 - 
"Make the Roll Number’s last 4 digits incremental, EG: if the last student with course Information science in year 2022 had TF22IS3450 then the next student will have TF22IS3451."

POST at http://localhost:3000/students
Body - Raw - JSON

Sample - 
{
  "fullName": "John Doe",
  "enrolledCourse": {
    "enrolledOn": "2022-08-15",
    "courseCode": "IS",
    "courseName": "Information Science"
  },
  "email": "john.doe@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "country": "USA",
    "zipCode": 12345
  },
  "dateOfBirth": "1995-05-12"
}

2. GET :
GET at http://localhost:3000/students

3. DELETE :
DELETE at http://localhost:3000/students/:rollNumber

4. UPDATE :
PUT at http://localhost:3000/students/:rollNumber

5. Pagination and Search
   
Pagination:
To retrieve a paginated list of students, you need to include the page and limit query parameters in the URL. The page parameter specifies the page number, and the limit parameter specifies the maximum number of students to return per page.
API Endpoint: GET /students?page=<page_number>&limit=<limit>
Example:

To retrieve the first page with a limit of 10 students: GET /students?page=1&limit=10
To retrieve the second page with a limit of 20 students: GET /students?page=2&limit=20

Search:
To search for students by their full name, you need to include the search query parameter in the URL. The search query is case-insensitive and performs a partial match on the fullName field.
API Endpoint: GET /students?search=<search_query>

Example : To search for students whose names contain "john": GET /students?search=john

You can combine pagination and search by including all three query parameters in the URL:
API Endpoint: GET /students?page=<page_number>&limit=<limit>&search=<search_query>

Example : To retrieve the second page with a limit of 20 students whose names contain "doe": GET /students?page=2&limit=20&search=doe
