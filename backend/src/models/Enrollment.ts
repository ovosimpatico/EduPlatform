import mongoose, { Document, Schema } from 'mongoose';

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  progress: {
    completedLessons: number[];
    currentLesson: number;
  };
  finalAssessmentScore?: number;
  finalAssessmentAnswers?: number[];
  completed: boolean;
  enrolledAt: Date;
  completedAt?: Date;
}

const enrollmentSchema = new Schema<IEnrollment>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  progress: {
    completedLessons: [{
      type: Number,
    }],
    currentLesson: {
      type: Number,
      default: 0,
    },
  },
  finalAssessmentScore: {
    type: Number,
  },
  finalAssessmentAnswers: [{
    type: Number,
  }],
  completed: {
    type: Boolean,
    default: false,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

// Compound index to ensure a student can only enroll once per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
