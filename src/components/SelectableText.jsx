import React, { useRef, useState, useEffect } from 'react';

export default function SelectableText({ text, children, onSend, paragraphIndex }) {
  const containerRef = useRef(null);
  const [selInfo, setSelInfo] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 환경 체크
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // PC 환경에서의 텍스트 선택 처리
  const handleMouseUp = () => {
    if (isMobile) return;

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

  // 모바일 환경에서의 텍스트 선택 처리
  const handleTouchEnd = (e) => {
    if (!isMobile) return;

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

  // PC 환경에서의 버튼 클릭 처리
  const handleButtonClick = (e) => {
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

  // 모바일 환경에서의 버튼 터치 처리
  const handleButtonTouch = (e) => {
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

  // 외부 클릭/터치 처리
  useEffect(() => {
    function handleClickOutside(e) {
      if (selInfo && containerRef.current && !containerRef.current.contains(e.target)) {
        setSelInfo(null);
      }
    }

    if (isMobile) {
      document.addEventListener('touchstart', handleClickOutside);
      return () => document.removeEventListener('touchstart', handleClickOutside);
    } else {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selInfo, isMobile]);

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
      {selInfo && !isMobile && (
        <button
          onClick={handleButtonClick}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            position: 'absolute',
            top: `${selInfo.y}%`,
            right: `${100 - selInfo.x}%`,
            transform: 'translate(0, -100%)',
            padding: '6px 12px',
            fontSize: '13px',
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
            pointerEvents: 'auto'
          }}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: '2px' }}
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
      {selInfo && isMobile && (
        <button
          onTouchEnd={handleButtonTouch}
          style={{
            position: 'absolute',
            top: `${selInfo.y}%`,
            right: `${100 - selInfo.x}%`,
            transform: 'translate(0, -100%)',
            padding: '12px 24px',
            fontSize: '16px',
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
            minWidth: '140px',
            minHeight: '48px'
          }}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: '8px' }}
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