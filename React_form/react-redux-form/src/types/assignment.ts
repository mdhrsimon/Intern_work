export interface SubmissionFile {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface AssignmentAttachment {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  studentUserId: string;
  studentName: string;
  studentEmail: string;
  submittedText: string | null;
  status: "Assigned" | "Turned In" | "Returned";
  grade: string | null;
  feedback: string | null;
  submittedAt: string | null;
  returnedAt: string | null;
  files: SubmissionFile[];
}

export interface Assignment {
  id: number;
  classChannelId: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  totalSubmissions: number;
  turnedInCount: number;
  returnedCount: number;
  attachments: AssignmentAttachment[];
  mySubmission: AssignmentSubmission | null;
}

export interface CreateAssignmentRequest {
  classChannelId: number;
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateAssignmentRequest {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
}

export interface SubmitAssignmentRequest {
  assignmentId: number;
  submittedText: string;
}

export interface ReturnSubmissionRequest {
  assignmentId: number;
  submissionId: number;
  grade?: string;
  feedback?: string;
}
