import mongoose, { Document, Schema } from 'mongoose';

export interface IDiagnosticQuiz extends Document {
  category: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }[];
  createdAt: Date;
}

const diagnosticQuizSchema = new Schema<IDiagnosticQuiz>({
  category: {
    type: String,
    required: true,
    unique: true,
  },
  questions: [{
    question: {
      type: String,
      required: true,
    },
    options: [{
      type: String,
      required: true,
    }],
    correctAnswer: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IDiagnosticQuiz>('DiagnosticQuiz', diagnosticQuizSchema);
