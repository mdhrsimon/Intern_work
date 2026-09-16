import { useState } from "react";
import {
  useGetAssignmentsByClassQuery,
  useSubmitAssignmentMutation,
  useDeleteSubmissionFileMutation,
} from "../../api/assignmentApi";
import { FileUpload } from "../FileUpload";
import type { Assignment } from "../../types/assignment";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Send,
  CheckCircle,
  Award,
  MessageSquare,
  X,
  Paperclip,
  Download,
  Trash2,
} from "lucide-react";

interface StudentAssignmentsViewProps {
  classId: number;
}

export const StudentAssignmentsView = ({ classId }: StudentAssignmentsViewProps) => {
  const { data: assignments, isLoading, refetch } = useGetAssignmentsByClassQuery(classId);
  const [submitMutation] = useSubmitAssignmentMutation();
  const [deleteFileMutation] = useDeleteSubmissionFileMutation();

  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const openSubmitModal = (assignment: Assignment) => {
    setActiveAssignment(assignment);
    setErrorMsg("");
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment) return;

    setIsSubmitting(true);
    try {
      await submitMutation({
        assignmentId: activeAssignment.id,
        submittedText: "", // Text submission removed, only sending empty string to satisfy type
      }).unwrap();
      setActiveAssignment(null);
      refetch();
    } catch (err: unknown) {
      const errorResponse = err as { data?: { message?: string } };
      setErrorMsg(errorResponse?.data?.message || "Failed to submit work.");
    } finally {
      setIsSubmitting(false);
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

  const handleDeleteFile = async (assignmentId: number, fileId: number) => {
    await deleteFileMutation({ assignmentId, fileId });
    refetch();
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
        <BookOpen className="h-4 w-4 text-emerald-600" />
        Course Assignments ({assignments?.length || 0})
      </h4>

      {isLoading ? (
        <div className="p-6 text-center text-xs text-slate-400">Loading assignments...</div>
      ) : !assignments || assignments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
          No assignments posted for this class yet.
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => {
            const mySub = assignment.mySubmission;
            const status = mySub?.status || "Assigned";
            const isTurnedIn = status === "Turned In";
            const isReturned = status === "Returned";

            return (
              <div key={assignment.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
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
                      <span>Assigned by: {assignment.createdByName}</span>
                    </div>

                    {/* Teacher Attachments */}
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
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isReturned
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : isTurnedIn
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {/* Returned Feedback Box */}
                {isReturned && (
                  <div className="rounded-lg bg-emerald-50/80 border border-emerald-200 p-3 space-y-1.5 text-xs text-emerald-900">
                    <div className="flex items-center gap-2 font-bold text-emerald-950">
                      <Award className="h-4 w-4 text-emerald-600" />
                      Grade: {mySub?.grade || "N/A"}
                    </div>
                    {mySub?.feedback && (
                      <div className="flex items-start gap-1.5 text-emerald-800 italic">
                        <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
                        <span>Teacher Feedback: &quot;{mySub.feedback}&quot;</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Submitted Work Display */}
                {(mySub?.files && mySub.files.length > 0) && (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-800 space-y-3">
                    <div>
                      <span className="font-semibold text-slate-500 text-[10px] block mb-1">Your Attached Files:</span>
                      <div className="flex flex-wrap gap-2">
                        {mySub.files.map((file) => (
                            <div key={file.id} className="flex items-center gap-1 bg-white border border-slate-200 rounded p-1 pl-2 text-xs shadow-sm">
                              <Paperclip size={12} className="text-slate-400" />
                              <span className="truncate max-w-[150px]" title={file.fileName}>{file.fileName}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50"
                                onClick={() => handleDownload(`http://localhost:5070/api/assignments/${assignment.id}/submissions/${mySub.id}/files/${file.id}/download`, file.fileName)}
                              >
                                <Download size={14} />
                              </Button>
                              {!isReturned && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeleteFile(assignment.id, file.id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Turn In Button */}
                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    onClick={() => openSubmitModal(assignment)}
                    disabled={isReturned}
                    className={`text-xs ${
                      isReturned
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : isTurnedIn
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    {isReturned ? "Returned & Graded" : isTurnedIn ? "Update Submitted Work" : "Turn In Assignment"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {activeAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{activeAssignment.title}</h3>
                <p className="text-xs text-slate-500">Submit your work below</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveAssignment(null)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 font-medium">{errorMsg}</div>
            )}

            <div className="pt-2 space-y-2">
              <span className="text-xs font-semibold text-slate-700">Additional Files</span>
              <FileUpload 
                uploadUrl={`http://localhost:5070/api/assignments/${activeAssignment.id}/submissions/files`}
                onUploadSuccess={refetch}
                onDeleteFile={async (fileId) => await handleDeleteFile(activeAssignment.id, fileId)}
                disabled={activeAssignment.mySubmission?.status === "Returned"}
              />
            </div>

            <form onSubmit={handleSubmitWork} className="pt-4 border-t">
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveAssignment(null)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || activeAssignment.mySubmission?.status === "Returned"} size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Turn In
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
