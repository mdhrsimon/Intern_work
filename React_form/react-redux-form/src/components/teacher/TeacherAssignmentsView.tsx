import { useState } from "react";
import {
  useGetAssignmentsByClassQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetSubmissionsQuery,
  useReturnSubmissionMutation,
  useDeleteAssignmentAttachmentMutation,
} from "../../api/assignmentApi";
import { FileUpload } from "../FileUpload";
import type { Assignment, AssignmentSubmission } from "../../types/assignment";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Send,
  X,
  UserCheck,
  Paperclip,
  Download,
} from "lucide-react";

interface TeacherAssignmentsViewProps {
  classId: number;
}

export const TeacherAssignmentsView = ({ classId }: TeacherAssignmentsViewProps) => {
  const { data: assignments, isLoading, refetch } = useGetAssignmentsByClassQuery(classId);

  const [createMutation] = useCreateAssignmentMutation();
  const [updateMutation] = useUpdateAssignmentMutation();
  const [deleteMutation] = useDeleteAssignmentMutation();
  const [deleteAttachmentMutation] = useDeleteAssignmentAttachmentMutation();

  // Create/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Submissions drawer state
  const [activeAssignmentId, setActiveAssignmentId] = useState<number | null>(null);

  const openCreateModal = () => {
    setEditingAssignment(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description || "");
    setDueDate(assignment.dueDate ? assignment.dueDate.split("T")[0] : "");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }

    try {
      if (editingAssignment) {
        await updateMutation({
          id: editingAssignment.id,
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        }).unwrap();
      } else {
        await createMutation({
          classChannelId: classId,
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        }).unwrap();
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: unknown) {
      const errorResponse = err as { data?: { message?: string } };
      setErrorMsg(errorResponse?.data?.message || "Failed to save assignment.");
    }
  };

  const handleDelete = async (assignmentId: number) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      await deleteMutation({ id: assignmentId, classChannelId: classId });
      refetch();
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (e) {
      alert("Failed to download file");
    }
  };

  const handleDeleteAttachment = async (assignmentId: number, fileId: number) => {
    if (confirm("Are you sure you want to delete this attachment?")) {
      await deleteAttachmentMutation({ assignmentId, fileId });
      refetch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-blue-600" />
          Class Assignments ({assignments?.length || 0})
        </h4>
        <Button size="sm" onClick={openCreateModal} className="bg-blue-600 text-white hover:bg-blue-700 text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Create Assignment
        </Button>
      </div>

      {isLoading ? (
        <div className="p-6 text-center text-xs text-slate-400">Loading assignments...</div>
      ) : !assignments || assignments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
          No assignments created for this class yet. Click &quot;Create Assignment&quot; to assign coursework.
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-bold text-slate-900">{assignment.title}</h5>
                  {assignment.description && (
                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{assignment.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    {assignment.dueDate && (
                      <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                        <Clock className="h-3 w-3" />
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span>Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Attachments Display */}
                  {assignment.attachments && assignment.attachments.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Paperclip size={12} /> Reference Materials
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {assignment.attachments.map((file) => (
                          <div key={file.id} className="flex items-center gap-1 bg-white border border-slate-200 rounded p-1 pl-2 text-xs shadow-sm">
                            <span className="truncate max-w-[150px]" title={file.fileName}>{file.fileName}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50"
                              onClick={() => handleDownload(`http://localhost:5070/api/assignments/${assignment.id}/attachments/${file.id}/download`, file.fileName)}
                            >
                              <Download size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteAttachment(assignment.id, file.id)}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(assignment)} className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(assignment.id)} className="h-7 w-7 p-0 text-slate-600 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Submissions Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                    Turned In: {assignment.turnedInCount}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                    Returned: {assignment.returnedCount}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveAssignmentId(activeAssignmentId === assignment.id ? null : assignment.id)}
                  className="text-xs border-slate-300 text-blue-900 font-medium hover:bg-blue-50"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                  {activeAssignmentId === assignment.id ? "Hide Submissions" : "Review Submissions"}
                </Button>
              </div>

              {/* Submissions Panel */}
              {activeAssignmentId === assignment.id && (
                <SubmissionsReviewList assignmentId={assignment.id} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit Assignment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingAssignment ? "Edit Assignment" : "Create New Assignment"}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 font-medium">{errorMsg}</div>
            )}

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Assignment 1: Introduction to React"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Instructions</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide instructions or text prompt..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 text-white hover:bg-blue-700 text-xs">
                  {editingAssignment ? "Save Changes" : "Create Assignment"}
                </Button>
              </div>
            </form>

            {editingAssignment && (
              <div className="pt-4 border-t">
                <FileUpload 
                  uploadUrl={`http://localhost:5070/api/assignments/${editingAssignment.id}/attachments`}
                  onUploadSuccess={refetch}
                />
              </div>
            )}
            
            {!editingAssignment && (
              <div className="pt-2 text-center text-[11px] text-slate-500 italic">
                Save the assignment first to attach reference files.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component to review submissions and add Grade + Feedback
const SubmissionsReviewList = ({ assignmentId }: { assignmentId: number }) => {
  const { data: submissions, isLoading, refetch } = useGetSubmissionsQuery(assignmentId);
  const [returnMutation] = useReturnSubmissionMutation();

  const [selectedSub, setSelectedSub] = useState<AssignmentSubmission | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openReturnModal = (sub: AssignmentSubmission) => {
    setSelectedSub(sub);
    setGrade(sub.grade || "");
    setFeedback(sub.feedback || "");
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setSubmitting(true);
    try {
      await returnMutation({
        assignmentId,
        submissionId: selectedSub.id,
        grade: grade.trim() || undefined,
        feedback: feedback.trim() || undefined,
      }).unwrap();
      setSelectedSub(null);
      refetch();
    } catch {
      alert("Failed to return submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-3 text-xs text-slate-400">Loading student submissions...</div>;

  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-3 text-xs text-slate-400 italic bg-white rounded-lg border border-slate-200">
        No enrolled students found for this assignment.
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
      <h6 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
        Student Submissions ({submissions.length})
      </h6>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {submissions.map((sub) => {
          const isTurnedIn = sub.status === "Turned In";
          const isReturned = sub.status === "Returned";

          return (
            <div key={sub.studentUserId} className="rounded-lg bg-white border border-slate-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">{sub.studentName}</span>
                  <span className="text-[11px] text-slate-500 ml-2">({sub.studentEmail})</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isReturned
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : isTurnedIn
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {sub.status}
                </span>
              </div>

              {sub.submittedText ? (
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100 text-xs text-slate-800">
                  <span className="font-semibold text-slate-500 text-[10px] block mb-1">Student Work:</span>
                  <p className="whitespace-pre-wrap">{sub.submittedText}</p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No text submitted.</p>
              )}

              {sub.files && sub.files.length > 0 && (
                <div className="bg-slate-50 p-2 rounded border border-slate-100 mt-2">
                  <span className="font-semibold text-slate-500 text-[10px] block mb-1">Attached Files:</span>
                  <div className="flex flex-wrap gap-2">
                    {sub.files.map((file) => (
                      <div key={file.id} className="flex items-center gap-1 bg-white border border-slate-200 rounded p-1 pl-2 text-xs shadow-sm">
                        <Paperclip size={12} className="text-slate-400" />
                        <span className="truncate max-w-[150px]" title={file.fileName}>{file.fileName}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            fetch(`http://localhost:5070/api/assignments/${assignmentId}/submissions/${sub.id}/files/${file.id}/download`, { credentials: "include" })
                              .then(res => res.blob())
                              .then(blob => {
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = file.fileName;
                                a.click();
                                window.URL.revokeObjectURL(url);
                              });
                          }}
                        >
                          <Download size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isReturned && (
                <div className="flex items-center gap-3 text-xs bg-emerald-50/70 p-2 rounded border border-emerald-100">
                  {sub.grade && <span className="font-bold text-emerald-900">Grade: {sub.grade}</span>}
                  {sub.feedback && <span className="text-emerald-800 italic">Feedback: {sub.feedback}</span>}
                </div>
              )}

              {isTurnedIn && (
                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    onClick={() => openReturnModal(sub)}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs h-7 px-3"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    {isReturned ? "Update Grade/Feedback" : "Grade & Return Work"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Grading & Returning */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Grade &amp; Return Submission</h3>
                <p className="text-xs text-slate-500">{selectedSub.studentName}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedSub(null)} className="h-7 w-7 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleReturn} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Grade</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. A, 95/100, Excellent"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter constructive feedback for the student..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedSub(null)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Mark Returned
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
