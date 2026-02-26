import Quiz from "../models/Quiz.js";
import QuizSubmission from "../models/QuizSubmission.js";
import Course from "../models/Course.js";

// ✅ Teacher creates quiz
export const createQuiz = async (req, res) => {
  try {
    const { title, description, courseId, questions, duration } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const quiz = await Quiz.create({
      title,
      description,
      course: course._id,
      teacher: req.user._id,
      questions,
      duration,
      status: "published",
    });

    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Student fetches quizzes of a course
export const getCourseQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId, status: "published" });
    res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Student submits quiz
export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Check if already submitted
    const already = await QuizSubmission.findOne({ quiz: quizId, student: req.user._id });
    if (already) return res.status(400).json({ message: "Quiz already submitted" });

    // Calculate score
    let score = 0;
    quiz.questions.forEach((q) => {
      const studentAnswer = answers.find((a) => a.questionId === q._id.toString());
      if (studentAnswer && studentAnswer.answer === q.correctAnswer) score++;
    });

    const submission = await QuizSubmission.create({
      quiz: quiz._id,
      student: req.user._id,
      answers,
      score,
    });

    res.json({ message: "Quiz submitted", score, submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get student submissions for teacher
export const getQuizSubmissions = async (req, res) => {
  try {
    const submissions = await QuizSubmission.find({ quiz: req.params.quizId })
      .populate("student", "name email")
      .populate("quiz", "title");

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
