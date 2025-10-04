import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson {
  title: string;
  content: string;
  order: number;
}

export interface ICourse extends Document {
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  teacher: mongoose.Types.ObjectId;
  lessons: ILesson[];
  finalAssessment: {
    questions: {
      question: string;
      options: string[];
      correctAnswer: number;
    }[];
    passingScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
});

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
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
  lessons: [lessonSchema],
  finalAssessment: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
    }],
    passingScore: {
      type: Number,
      default: 70,
    },
  },
}, {
  timestamps: true,
});

export default mongoose.model<ICourse>('Course', courseSchema);
