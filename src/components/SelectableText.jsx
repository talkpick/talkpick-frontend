import React, { useRef, useState, useEffect } from 'react';

export default function SelectableText({ text, children, onSend, paragraphIndex }) {
  const containerRef = useRef(null);
  const [selInfo, setSelInfo] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 모바일 환경 체크
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (selInfo && containerRef.current && !containerRef.current.contains(e.target)) {
        setSelInfo(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [selInfo]);

  function handleMouseUp() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setSelInfo(null);
      return;
    }
    if (!containerRef.current.contains(sel.anchorNode) ||
        !containerRef.current.contains(sel.focusNode)) {
      setSelInfo(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const snippet = sel.toString();

    // 오프셋 계산 (단일 text 노드 가정)
    const start = text.indexOf(snippet);
    if (start < 0) {
      setSelInfo(null);
      return;
    }
    const end = start + snippet.length;

    // 선택 영역의 상대 위치 계산 (컨테이너 기준)
    const relativeX = (rect.left - containerRect.left + rect.width) / containerRect.width * 100;
    const relativeY = (rect.top - containerRect.top) / containerRect.height * 100;

    setSelInfo({
      x: relativeX,
      y: relativeY,
      snippet,
      start,
      end,
      paragraphIndex
    });
  }

  const handleTouchEnd = (e) => {
    // 기본 선택 동작 방지
    e.preventDefault();
    
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setSelInfo(null);
      return;
    }

    if (!containerRef.current.contains(sel.anchorNode) ||
        !containerRef.current.contains(sel.focusNode)) {
      setSelInfo(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const snippet = sel.toString();

    const start = text.indexOf(snippet);
    if (start < 0) {
      setSelInfo(null);
      return;
    }
    const end = start + snippet.length;

    const relativeX = (rect.left - containerRect.left + rect.width) / containerRect.width * 100;
    const relativeY = (rect.top - containerRect.top) / containerRect.height * 100;

    setSelInfo({
      x: relativeX,
      y: relativeY,
      snippet,
      start,
      end,
      paragraphIndex
    });
  };

  const handleSendButtonTouch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    onSend({
      snippetText: selInfo.snippet,
      startOffset: selInfo.start,
      endOffset: selInfo.end,
      paragraphIndex: selInfo.paragraphIndex
    });
    setSelInfo(null);
    window.getSelection().removeAllRanges();
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      style={{ 
        position: 'relative', 
        whiteSpace: 'pre-wrap', 
        cursor: 'text',
        WebkitUserSelect: 'text',
        userSelect: 'text'
      }}
    >
      {children}
      {selInfo && (
        <button
          onTouchEnd={handleSendButtonTouch}
          onClick={handleSendButtonTouch}
          style={{
            position: 'absolute',
            top: `${selInfo.y}%`,
            right: `${100 - selInfo.x}%`,
            transform: 'translate(0, -100%)',
            padding: isMobile ? '12px 24px' : '6px 12px',
            fontSize: isMobile ? '16px' : '13px',
            fontWeight: '500',
            background: '#007aff',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            zIndex: 10,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 122, 255, 0.9)',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            minWidth: isMobile ? '140px' : 'auto',
            minHeight: isMobile ? '48px' : 'auto'
          }}
        >
          <svg 
            width={isMobile ? "20" : "16"} 
            height={isMobile ? "20" : "16"} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: isMobile ? '8px' : '2px' }}
          >
            <path 
              d="M12 4V20M4 12H20" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          채팅방 보내기
        </button>
      )}
    </div>
  );
} 