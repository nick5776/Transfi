const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost/transfi_learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Student schema
const studentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  enrolledCourse: {
    enrolledOn: { type: Date, required: true },
    courseCode: { type: String, required: true },
    courseName: { type: String, required: true },
  },
  email: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: Number, required: true },
  },
  dateOfBirth: { type: Date, required: true },
});

const Student = mongoose.model('Student', studentSchema);

app.use(express.json());

// Function to generate the next roll number
let lastRollNumber = 0;
const generateRollNumber = async (courseCode, year) => {
  try {
    const lastStudent = await Student.findOne(
      { 'enrolledCourse.courseCode': courseCode, 'enrolledCourse.enrolledOn': { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) } },
      null,
      { sort: { 'rollNumber': -1 } }
    );
    if (lastStudent) {
      const lastFourDigits = parseInt(lastStudent.rollNumber.slice(-4), 10) + 1;
      lastRollNumber = `TF${year}${courseCode}${lastFourDigits.toString().padStart(4, '0')}`;
    } else {
      lastRollNumber = `TF${year}${courseCode}0001`;
    }
    return lastRollNumber;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to generate roll number');
  }
};

// create a new student
app.post('/students', async (req, res) => {
    try {
      const { courseCode, enrolledOn } = req.body.enrolledCourse;
      let year;
  
      if (enrolledOn instanceof Date) {
        year = enrolledOn.getFullYear();
      } else {
        const parsedDate = new Date(enrolledOn);
        if (isNaN(parsedDate)) {
          return res.status(400).send({ error: 'Invalid date format for enrolledOn' });
        }
        year = parsedDate.getFullYear();
      }
  
      const rollNumber = await generateRollNumber(courseCode, year);
      const student = new Student({ ...req.body, rollNumber });
      await student.save();
      res.status(201).send(student);
    } catch (err) {
      console.error(err);
      res.status(400).send({ error: err.message });
    }
  });

// list all students with pagination and search
app.get('/students', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;
    const students = await Student.find({
      fullName: { $regex: search, $options: 'i' },
    })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();
    res.send(students);
  } catch (err) {
    res.status(500).send(err);
  }
});

// update a student record by rollNumber
app.put('/students/:rollNumber', async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { rollNumber: req.params.rollNumber },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!student) {
      return res.status(404).send();
    }
    res.send(student);
  } catch (err) {
    res.status(400).send(err);
  }
});

// delete a student record by rollNumber
app.delete('/students/:rollNumber', async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ rollNumber: req.params.rollNumber });
    if (!student) {
      return res.status(404).send();
    }
    res.send(student);
  } catch (err) {
    res.status(500).send(err);
  }
});

// download student data as CSV
app.get('/students/download', async (req, res) => {
  try {
    const students = await Student.find();
    const csvData = students.map((student) => {
      return `${student.rollNumber},${student.fullName},${student.enrolledCourse.enrolledOn},${student.enrolledCourse.courseCode},${student.enrolledCourse.courseName},${student.email},${student.address.street},${student.address.city},${student.address.state},${student.address.country},${student.address.zipCode},${student.dateOfBirth}`;
    }).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(csvData);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
