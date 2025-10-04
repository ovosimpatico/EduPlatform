import React from 'react';
import { cn } from '@/lib/utils';

interface LessonContentProps {
  content: string;
  className?: string;
}

export const LessonContent: React.FC<LessonContentProps> = ({ content, className }) => {
  return (
    <div
      className={cn(
        'lesson-content',
        // Base text styling
        'text-foreground leading-relaxed',
        // Heading styles
        '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-foreground [&_h1]:tracking-tight',
        '[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-foreground [&_h2]:tracking-tight',
        '[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-foreground',
        '[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-foreground',
        '[&_h5]:text-base [&_h5]:font-semibold [&_h5]:mt-3 [&_h5]:mb-2 [&_h5]:text-foreground',
        '[&_h6]:text-sm [&_h6]:font-semibold [&_h6]:mt-3 [&_h6]:mb-2 [&_h6]:text-muted-foreground [&_h6]:uppercase [&_h6]:tracking-wider',
        // First heading no top margin
        '[&>h1:first-child]:mt-0 [&>h2:first-child]:mt-0 [&>h3:first-child]:mt-0 [&>h4:first-child]:mt-0 [&>h5:first-child]:mt-0 [&>h6:first-child]:mt-0',
        // Paragraph styles
        '[&_p]:my-4 [&_p]:text-base [&_p]:leading-7 [&_p]:text-foreground',
        '[&>p:first-child]:mt-0',
        // List styles
        '[&_ul]:my-4 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:text-foreground',
        '[&_ol]:my-4 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:text-foreground',
        '[&_li]:text-base [&_li]:leading-7 [&_li]:text-foreground',
        '[&_li>ul]:mt-2 [&_li>ul]:mb-0',
        '[&_li>ol]:mt-2 [&_li>ol]:mb-0',
        // Nested lists
        '[&_ul_ul]:list-[circle] [&_ul_ul_ul]:list-[square]',
        // Link styles
        '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:font-medium [&_a]:transition-colors',
        'hover:[&_a]:text-primary/80',
        // Strong and emphasis
        '[&_strong]:font-semibold [&_strong]:text-foreground',
        '[&_em]:italic [&_em]:text-foreground',
        '[&_b]:font-semibold [&_b]:text-foreground',
        '[&_i]:italic [&_i]:text-foreground',
        // Code styles
        '[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-foreground [&_code]:border [&_code]:border-border',
        '[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:border [&_pre]:border-border',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:border-0 [&_pre_code]:text-sm',
        // Blockquote styles
        '[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:bg-muted/30 [&_blockquote]:rounded-r',
        '[&_blockquote_p]:my-2',
        // Horizontal rule
        '[&_hr]:my-8 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-border',
        // Image styles
        '[&_img]:rounded-lg [&_img]:my-6 [&_img]:max-w-full [&_img]:h-auto [&_img]:border [&_img]:border-border [&_img]:shadow-sm',
        // Table styles
        '[&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:text-sm',
        '[&_table]:border [&_table]:border-border [&_table]:rounded-lg [&_table]:overflow-hidden',
        '[&_th]:bg-muted [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground [&_th]:border-b [&_th]:border-border',
        '[&_td]:px-4 [&_td]:py-3 [&_td]:text-foreground [&_td]:border-b [&_td]:border-border',
        '[&_tr:last-child_td]:border-b-0',
        '[&_tbody_tr]:transition-colors hover:[&_tbody_tr]:bg-muted/50',
        // Kbd (keyboard) styles
        '[&_kbd]:bg-muted [&_kbd]:px-2 [&_kbd]:py-1 [&_kbd]:rounded [&_kbd]:text-sm [&_kbd]:font-mono [&_kbd]:border [&_kbd]:border-border [&_kbd]:shadow-sm',
        // Mark (highlight) styles
        '[&_mark]:bg-yellow-200 [&_mark]:text-foreground [&_mark]:px-1 [&_mark]:rounded dark:[&_mark]:bg-yellow-900/50',
        // Deleted and inserted text
        '[&_del]:line-through [&_del]:text-muted-foreground',
        '[&_ins]:underline [&_ins]:text-foreground [&_ins]:decoration-green-500',
        // Small text
        '[&_small]:text-sm [&_small]:text-muted-foreground',
        // Subscript and superscript
        '[&_sub]:text-xs [&_sub]:align-sub',
        '[&_sup]:text-xs [&_sup]:align-super',
        // Figure and figcaption
        '[&_figure]:my-6',
        '[&_figcaption]:text-sm [&_figcaption]:text-muted-foreground [&_figcaption]:text-center [&_figcaption]:mt-2 [&_figcaption]:italic',
        // Details and summary
        '[&_details]:my-4 [&_details]:border [&_details]:border-border [&_details]:rounded-lg [&_details]:p-4 [&_details]:bg-muted/30',
        '[&_summary]:cursor-pointer [&_summary]:font-semibold [&_summary]:text-foreground [&_summary]:select-none',
        '[&_summary]:hover:text-primary [&_summary]:transition-colors',
        // Abbr
        '[&_abbr]:cursor-help [&_abbr]:border-b [&_abbr]:border-dotted [&_abbr]:border-muted-foreground',
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
