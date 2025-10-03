'use client';

interface TypingUser {
  userId: string;
  username: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const formatTypingUsers = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].username} and ${typingUsers[1].username} are typing`;
    } else if (typingUsers.length === 3) {
      return `${typingUsers[0].username}, ${typingUsers[1].username}, and ${typingUsers[2].username} are typing`;
    } else {
      return `${typingUsers[0].username}, ${typingUsers[1].username}, and ${typingUsers.length - 2} others are typing`;
    }
  };

  return (
    <div className="px-4 py-2 text-sm text-gray-400 italic">
      {formatTypingUsers()}
      <span className="animate-pulse ml-0.5">...</span>
    </div>
  );
}
