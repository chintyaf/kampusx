import { FileText, Presentation, Video, FileImage, File } from 'lucide-react';

export function getFileIcon(type) {
  const t = type.toUpperCase();
  if (['PDF'].includes(t)) return { Icon: FileText, bg: '#fee2e2', color: '#ef4444', label: 'PDF' };
  if (['PPT', 'PPTX'].includes(t)) return { Icon: Presentation, bg: '#ffedd5', color: '#f97316', label: t };
  if (['DOC', 'DOCX'].includes(t)) return { Icon: FileText, bg: '#dbeafe', color: '#3b82f6', label: t };
  if (['MP4', 'MOV', 'AVI', 'VIDEO'].includes(t)) return { Icon: Video, bg: '#f3e8ff', color: '#a855f7', label: t };
  if (['JPG', 'JPEG', 'PNG', 'GIF', 'SVG'].includes(t)) return { Icon: FileImage, bg: '#dcfce7', color: '#22c55e', label: t };
  return { Icon: File, bg: '#f3f4f6', color: '#9ca3af', label: t };
}
