import { useState, useEffect, useRef } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/use-debounce";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  task_id: string;
  user: {
    email: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface CommentListProps {
  taskId: string;
}

export const CommentList = ({ taskId }: CommentListProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [mentionSearch, setMentionSearch] = useState("");
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<Profile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);
  const { session } = useSessionContext();
  const { toast } = useToast();
  const debouncedMentionSearch = useDebounce(mentionSearch, 300);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        user:profiles(
          email,
          full_name,
          avatar_url
        )
      `)
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch comments",
        variant: "destructive",
      });
      return;
    }

    setComments(data as Comment[]);
  };

  const fetchMentionSuggestions = async (search: string) => {
    if (!search) {
      setMentionSuggestions([]);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .ilike("full_name", `${search}%`)
      .order("full_name");

    if (error) {
      console.error("Error fetching mention suggestions:", error);
      return;
    }

    setMentionSuggestions(data);
  };

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel("comments_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `task_id=eq.${taskId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  useEffect(() => {
    if (debouncedMentionSearch) {
      fetchMentionSuggestions(debouncedMentionSearch);
    }
  }, [debouncedMentionSearch]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewComment(value);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionSearch(mentionMatch[1]);
      setShowMentionSuggestions(true);
    } else {
      setShowMentionSuggestions(false);
      setMentionSearch("");
    }
  };

  const insertMention = (profile: Profile) => {
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = newComment.slice(0, cursorPos);
    const textAfterCursor = newComment.slice(cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const newText = textBeforeCursor.slice(0, -mentionMatch[0].length) + 
        `@${profile.email} ` + 
        textAfterCursor;
      setNewComment(newText);
    }

    setShowMentionSuggestions(false);
    setMentionSearch("");
    textareaRef.current?.focus();
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !session?.user) return;

    const mentionRegex = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const mentions = [...newComment.matchAll(mentionRegex)].map(match => match[1]);

    const { error } = await supabase.from("comments").insert({
      task_id: taskId,
      user_id: session.user.id,
      content: newComment,
      mentions: mentions,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
      return;
    }

    setNewComment("");
    toast({
      title: "Success",
      description: "Comment posted successfully",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <MessageSquare className="w-5 h-5" />
        <h3 className="font-medium">Comments</h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 relative">
          <Textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleTextareaChange}
            placeholder="Write a comment... Use @ to mention someone"
            className="min-h-[80px]"
          />
          <Button onClick={handleSubmitComment} size="icon">
            <Send className="w-4 h-4" />
          </Button>

          {showMentionSuggestions && mentionSuggestions.length > 0 && (
            <div 
              ref={mentionsRef}
              className="absolute z-50 w-64 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700"
              style={{ 
                top: textareaRef.current ? textareaRef.current.offsetTop + textareaRef.current.offsetHeight + 4 : 0,
                left: textareaRef.current ? textareaRef.current.offsetLeft : 0
              }}
            >
              {mentionSuggestions.map((profile) => (
                <button
                  key={profile.id}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => insertMention(profile)}
                >
                  <Avatar className="w-6 h-6">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </Avatar>
                  <span className="text-sm">{profile.full_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Avatar className="w-8 h-8">
                {comment.user?.avatar_url ? (
                  <img src={comment.user.avatar_url} alt={comment.user.full_name} />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">
                    {comment.user?.full_name || comment.user?.email}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};