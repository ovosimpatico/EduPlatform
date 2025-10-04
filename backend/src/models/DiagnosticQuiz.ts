import mongoose, { Document, Schema } from 'mongoose';

export interface IDiagnosticQuiz extends Document {
  title: string;
  category: string;
  teacher: mongoose.Types.ObjectId;
  description?: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }[];
  levelThresholds: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const diagnosticQuizSchema = new Schema<IDiagnosticQuiz>({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
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
  levelThresholds: {
    beginner: {
      type: Number,
      default: 40,
      min: 0,
      max: 100,
    },
    intermediate: {
      type: Number,
      default: 65,
      min: 0,
      max: 100,
    },
    advanced: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

diagnosticQuizSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IDiagnosticQuiz>('DiagnosticQuiz', diagnosticQuizSchema);
