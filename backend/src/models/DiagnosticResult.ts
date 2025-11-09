import mongoose, { Document, Schema } from 'mongoose';

export interface IDiagnosticResult extends Document {
  student: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  answers: number[];
  scores: {
    beginner: { correct: number; total: number };
    intermediate: { correct: number; total: number };
    advanced: { correct: number; total: number };
  };
  overallPercentage: number;
  determinedLevel: 'beginner' | 'intermediate' | 'advanced';
  completedAt: Date;
}

const diagnosticResultSchema = new Schema<IDiagnosticResult>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quiz: {
    type: Schema.Types.ObjectId,
    ref: 'DiagnosticQuiz',
    required: true,
  },
  answers: [{
    type: Number,
    required: true,
  }],
  scores: {
    beginner: {
      correct: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    intermediate: {
      correct: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    advanced: {
      correct: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  },
  overallPercentage: {
    type: Number,
    required: true,
  },
  determinedLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index to find results by quiz
diagnosticResultSchema.index({ quiz: 1, completedAt: -1 });

// Index to find results by student
diagnosticResultSchema.index({ student: 1, completedAt: -1 });

export default mongoose.model<IDiagnosticResult>('DiagnosticResult', diagnosticResultSchema);
