'use client';
import { Button } from '@/components/ui/button';
import { ArrowDownIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useCallback, useRef, useEffect, useState, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

// Context for sharing scroll state between components
const ConversationContext = createContext<{
  isAtBottom: boolean;
  scrollToBottom: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;
} | null>(null);

// Simple fallback implementation for stick-to-bottom functionality
const useStickToBottom = () => {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAtBottom(atBottom);
    }
  }, []);

  return { isAtBottom, scrollToBottom, scrollRef, handleScroll };
};

export type AIConversationProps = ComponentProps<'div'>;

export const AIConversation = ({
  className,
  children,
  ...props
}: AIConversationProps) => {
  const stickToBottom = useStickToBottom();
  const { scrollRef, handleScroll } = stickToBottom;

  return (
    <ConversationContext.Provider value={stickToBottom}>
      <div
        ref={scrollRef}
        className={cn('relative flex-1 overflow-y-auto', className)}
        onScroll={handleScroll}
        role="log"
        {...props}
      >
        {children}
      </div>
    </ConversationContext.Provider>
  );
};

export type AIConversationContentProps = ComponentProps<'div'>;

export const AIConversationContent = ({
  className,
  ...props
}: AIConversationContentProps) => (
  <div className={cn('p-4', className)} {...props} />
);

export const AIConversationScrollButton = () => {
  const context = useContext(ConversationContext);
  
  const handleScrollToBottom = useCallback(() => {
    if (context) {
      context.scrollToBottom();
    }
  }, [context]);
  
  if (!context) {
    return null;
  }
  
  const { isAtBottom } = context;
  
  return (
    !isAtBottom && (
      <Button
        className="absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full"
        onClick={handleScrollToBottom}
        size="icon"
        type="button"
        variant="outline"
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  );
}; 